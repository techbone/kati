import { asDoseId, asISODate } from '@/contracts';
import { resetDatabaseCacheForTests } from '@/data/db';
import { createFakeSqliteDatabase } from '@/data/testSupport/fakeSqliteDatabase';
import { useAppStore } from '@/store/appStore';

// Mocked at the native-module boundary (expo-sqlite / expo-notifications),
// same pattern as expoNotificationService.test.ts — not at the internal
// `@/…` alias boundary, so the store exercises its real db.ts caching and
// its real notificationService mapping, just against fake I/O underneath.
const mockOpenDatabaseAsync = jest.fn();
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: (...args: unknown[]) => mockOpenDatabaseAsync(...args) }));

const mockGetPermissions = jest.fn();
const mockCancelAll = jest.fn();
const mockSchedule = jest.fn();
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissions(...args),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: (...args: unknown[]) => mockCancelAll(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockSchedule(...args),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationHandler: jest.fn(),
}));

function freshState() {
  return { hydrated: false, children: [], activeChildId: null, recordsByChild: {}, isPremium: false };
}

beforeEach(() => {
  jest.clearAllMocks();
  useAppStore.setState(freshState());
  resetDatabaseCacheForTests();
  mockOpenDatabaseAsync.mockResolvedValue(createFakeSqliteDatabase());
  mockGetPermissions.mockResolvedValue({ status: 'granted' });
  mockCancelAll.mockResolvedValue(undefined);
  mockSchedule.mockResolvedValue('id');
});

describe('useAppStore — persistence', () => {
  it('hydrates a fresh database to empty, onboarded-false state', async () => {
    await useAppStore.getState().hydrate();
    const state = useAppStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.children).toEqual([]);
    expect(state.activeChildId).toBeNull();
    expect(state.prefs.onboarded).toBe(false);
  });

  it('addChild persists and makes the first child active', async () => {
    await useAppStore.getState().hydrate();
    const id = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });

    expect(useAppStore.getState().activeChildId).toBe(id);
    expect(useAppStore.getState().children).toHaveLength(1);
    expect(useAppStore.getState().recordsByChild[id]).toEqual([]);
  });

  it('a second child does not steal the active slot', async () => {
    await useAppStore.getState().hydrate();
    const first = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });
    await useAppStore.getState().addChild({ name: 'Zainab', birthDate: asISODate('2026-06-01'), sex: 'female' });

    expect(useAppStore.getState().activeChildId).toBe(first);
  });

  it('survives a relaunch: a second hydrate() against the same database sees everything', async () => {
    // One fake "disk" shared by both hydrate() calls below.
    const disk = createFakeSqliteDatabase();
    mockOpenDatabaseAsync.mockResolvedValue(disk);

    await useAppStore.getState().hydrate();
    const id = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });
    await useAppStore.getState().markGiven(id, asDoseId('bcg'), asISODate('2026-01-01'), 'left arm');
    await useAppStore.getState().setPrefs({ onboarded: true });

    // Simulate a force-quit: reset in-memory state AND the cached connection,
    // but keep the same fake "disk" so hydrate() must read it back from I/O.
    useAppStore.setState(freshState());
    resetDatabaseCacheForTests();
    await useAppStore.getState().hydrate();

    const state = useAppStore.getState();
    expect(state.children).toHaveLength(1);
    expect(state.activeChildId).toBe(id);
    expect(state.recordsByChild[id]).toEqual([
      expect.objectContaining({ doseId: 'bcg', status: 'given', note: 'left arm' }),
    ]);
    expect(state.prefs.onboarded).toBe(true);
  });

  it('updateChild patches only the given fields', async () => {
    await useAppStore.getState().hydrate();
    const id = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });
    await useAppStore.getState().updateChild(id, { name: 'Amina B.' });

    const child = useAppStore.getState().children[0]!;
    expect(child.name).toBe('Amina B.');
    expect(child.birthDate).toBe('2026-01-01');
  });

  it('deleteChild removes the child, their records, and re-picks the active child', async () => {
    await useAppStore.getState().hydrate();
    const first = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });
    const second = await useAppStore
      .getState()
      .addChild({ name: 'Zainab', birthDate: asISODate('2026-06-01'), sex: 'female' });
    await useAppStore.getState().markGiven(first, asDoseId('bcg'), asISODate('2026-01-01'));

    await useAppStore.getState().deleteChild(first);

    const state = useAppStore.getState();
    expect(state.children.map((c) => c.id)).toEqual([second]);
    expect(state.activeChildId).toBe(second);
    expect(state.recordsByChild[first]).toBeUndefined();
  });

  it('clearRecord removes a record and markSkipped overwrites rather than duplicates', async () => {
    await useAppStore.getState().hydrate();
    const id = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });
    await useAppStore.getState().markGiven(id, asDoseId('bcg'), asISODate('2026-01-01'));
    await useAppStore.getState().markSkipped(id, asDoseId('bcg'));
    expect(useAppStore.getState().recordsByChild[id]).toHaveLength(1);
    expect(useAppStore.getState().recordsByChild[id]![0]!.status).toBe('skipped');

    await useAppStore.getState().clearRecord(id, asDoseId('bcg'));
    expect(useAppStore.getState().recordsByChild[id]).toEqual([]);
  });
});

describe('useAppStore — refreshReminders', () => {
  // Regression: adding a child used to schedule nothing until some other
  // mutation happened, so a parent who onboarded and closed the app got no
  // reminders at all.
  it('adding a child schedules its reminders without any other action', async () => {
    await useAppStore.getState().hydrate();
    mockSchedule.mockClear();

    await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });

    expect(mockSchedule).toHaveBeenCalled();
  });

  // Regression: deleting a child left their reminders scheduled.
  it('deleting a child re-plans, so their reminders stop', async () => {
    await useAppStore.getState().hydrate();
    const id = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });
    mockCancelAll.mockClear();
    mockSchedule.mockClear();

    await useAppStore.getState().deleteChild(id);

    expect(mockCancelAll).toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('syncs a plan when reminders are enabled and permission is granted', async () => {
    await useAppStore.getState().hydrate();
    await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });

    await useAppStore.getState().refreshReminders();

    expect(mockSchedule).toHaveBeenCalled();
  });

  it('cancels everything, and schedules nothing, when reminders are disabled', async () => {
    await useAppStore.getState().hydrate();
    await useAppStore
      .getState()
      .setPrefs({ reminders: { ...useAppStore.getState().prefs.reminders, enabled: false } });

    expect(mockCancelAll).toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('touches nothing when permission is not granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'denied' });
    await useAppStore.getState().hydrate();

    await useAppStore.getState().refreshReminders();

    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockCancelAll).not.toHaveBeenCalled();
  });

  it('a dose mutation triggers a re-sync automatically', async () => {
    await useAppStore.getState().hydrate();
    const id = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });
    mockSchedule.mockClear();

    await useAppStore.getState().markGiven(id, asDoseId('bcg'), asISODate('2026-01-01'));

    expect(mockSchedule).toHaveBeenCalled();
  });

  it('never lets a notification failure surface: the write it followed still succeeded', async () => {
    mockSchedule.mockRejectedValue(new Error('scheduling unavailable'));
    await useAppStore.getState().hydrate();
    const id = await useAppStore
      .getState()
      .addChild({ name: 'Amina', birthDate: asISODate('2026-01-01'), sex: 'female' });

    await expect(
      useAppStore.getState().markGiven(id, asDoseId('bcg'), asISODate('2026-01-01')),
    ).resolves.toBeUndefined();
    expect(useAppStore.getState().recordsByChild[id]).toHaveLength(1);
  });
});
