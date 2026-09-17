/**
 * The real AppStore: SQLite-backed, implementing the same contract
 * `services/mock/mockStore.ts` does. Writes go action → repository →
 * SQLite → set state, never the reverse — nothing here reads back what it
 * just wrote to derive UI state; the in-memory `AppState` is the source of
 * truth for rendering, SQLite is the source of truth for what survives a
 * relaunch, and every action keeps them in lockstep.
 */
import { create } from 'zustand';

import {
  asChildId,
  asISOTimestamp,
  type AppStore,
  type Child,
  type DoseRecord,
  type ISODate,
} from '@/contracts';
import {
  childRepository,
  doseRecordRepository,
  generateId,
  getDatabase,
  MIGRATIONS,
  prefsRepository,
  runMigrations,
} from '@/data';
import { planReminders } from '@/domain/reminders';
import { NPHCDA_SCHEDULE } from '@/domain/schedule';
import { notificationService } from '@/services/notifications';

const now = () => asISOTimestamp(new Date().toISOString());

/**
 * Recomputes the reminder plan from current state and hands it to the
 * scheduler. Best-effort: a notification failure must never surface as a
 * failure on the dose-record write or prefs change that triggered it — the
 * record a parent just saved must land even if the OS notification store is
 * unavailable, same reasoning as the purchase-init guard in `_layout.tsx`.
 */
async function syncReminders(get: () => AppStore): Promise<void> {
  const { children, recordsByChild, prefs } = get();

  if (!prefs.reminders.enabled) {
    await notificationService.cancelAll();
    return;
  }

  const permission = await notificationService.getPermission();
  if (permission !== 'granted') return; // never trigger the system prompt from here — Settings does that on opt-in

  const plan = planReminders(children, recordsByChild, NPHCDA_SCHEDULE, prefs, new Date());
  await notificationService.sync(plan);
}

type Setter = (fn: (s: AppStore) => Partial<AppStore>) => void;

function upsertRecordInState(set: Setter, record: DoseRecord) {
  set((s) => {
    const existing = s.recordsByChild[record.childId] ?? [];
    const next = existing.some((r) => r.doseId === record.doseId)
      ? existing.map((r) => (r.doseId === record.doseId ? record : r))
      : [...existing, record];
    return { recordsByChild: { ...s.recordsByChild, [record.childId]: next } };
  });
}

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  children: [],
  activeChildId: null,
  recordsByChild: {},
  prefs: {
    reminders: { enabled: true, hour: 8, minute: 0, leadDays: [7, 1, 0] },
    onboarded: false,
    scheduleVersion: NPHCDA_SCHEDULE.version,
  },
  isPremium: false,

  async hydrate() {
    const db = await getDatabase();
    await runMigrations(db, MIGRATIONS);

    const children = await childRepository.listChildren(db);
    const recordsByChild = await doseRecordRepository.listAllRecords(
      db,
      children.map((c) => c.id),
    );
    const prefs = await prefsRepository.getPrefs(db);

    const persistedActiveId = await prefsRepository.getActiveChildId(db);
    const activeIdStillValid = children.some((c) => c.id === persistedActiveId);
    const activeChildId = activeIdStillValid ? persistedActiveId : (children[0]?.id ?? null);
    // Heals a dangling reference — e.g. the active child was deleted through
    // a path that predates this check — so it's never re-read stale.
    if (!activeIdStillValid && activeChildId !== persistedActiveId) {
      await prefsRepository.setActiveChildId(db, activeChildId);
    }

    set({ hydrated: true, children, recordsByChild, prefs, activeChildId });
    // Roll the 48-reminder window forward on every launch. Not awaited: boot
    // must never wait on the OS notification store.
    void get().refreshReminders();
  },

  async addChild(input) {
    const db = await getDatabase();
    const id = asChildId(generateId('child'));
    const child: Child = {
      id,
      name: input.name,
      birthDate: input.birthDate,
      sex: input.sex,
      photoUri: input.photoUri ?? null,
      createdAt: now(),
      updatedAt: now(),
    };

    await childRepository.insertChild(db, child);
    const makeActive = get().activeChildId === null;
    if (makeActive) await prefsRepository.setActiveChildId(db, id);

    set((s) => ({
      children: [...s.children, child],
      recordsByChild: { ...s.recordsByChild, [id]: [] },
      activeChildId: s.activeChildId ?? id,
    }));
    await get().refreshReminders();
    return id;
  },

  async updateChild(id, patch) {
    const db = await getDatabase();
    const updatedAt = now();
    await childRepository.updateChild(db, id, patch, updatedAt);
    set((s) => ({
      children: s.children.map((c) => (c.id === id ? { ...c, ...patch, updatedAt } : c)),
    }));
    await get().refreshReminders(); // a birth-date edit moves every due date
  },

  async deleteChild(id) {
    const db = await getDatabase();
    await childRepository.deleteChild(db, id);

    const wasActive = get().activeChildId === id;
    const remaining = get().children.filter((c) => c.id !== id);
    const nextActiveId = wasActive ? (remaining[0]?.id ?? null) : get().activeChildId;
    if (wasActive) await prefsRepository.setActiveChildId(db, nextActiveId);

    set((s) => {
      const { [id]: _removed, ...restRecords } = s.recordsByChild;
      return { children: remaining, recordsByChild: restRecords, activeChildId: nextActiveId };
    });
    await get().refreshReminders(); // otherwise a deleted child's reminders keep firing
  },

  async setActiveChild(id) {
    const db = await getDatabase();
    await prefsRepository.setActiveChildId(db, id);
    set({ activeChildId: id });
  },

  async markGiven(childId, doseId, givenDate: ISODate, note) {
    const db = await getDatabase();
    const record: DoseRecord = {
      childId,
      doseId,
      status: 'given',
      givenDate,
      note: note ?? null,
      updatedAt: now(),
    };
    await doseRecordRepository.upsertRecord(db, record);
    upsertRecordInState(set, record);
    await get().refreshReminders();
  },

  async markSkipped(childId, doseId, note) {
    const db = await getDatabase();
    const record: DoseRecord = {
      childId,
      doseId,
      status: 'skipped',
      givenDate: null,
      note: note ?? null,
      updatedAt: now(),
    };
    await doseRecordRepository.upsertRecord(db, record);
    upsertRecordInState(set, record);
    await get().refreshReminders();
  },

  async clearRecord(childId, doseId) {
    const db = await getDatabase();
    await doseRecordRepository.deleteRecord(db, childId, doseId);
    set((s) => ({
      recordsByChild: {
        ...s.recordsByChild,
        [childId]: (s.recordsByChild[childId] ?? []).filter((r) => r.doseId !== doseId),
      },
    }));
    await get().refreshReminders();
  },

  async setPrefs(patch) {
    const db = await getDatabase();
    const next = { ...get().prefs, ...patch }; // shallow merge — matches the mock exactly
    await prefsRepository.savePrefs(db, next);
    set({ prefs: next });
    await get().refreshReminders();
  },

  setPremium(isPremium) {
    set({ isPremium });
  },

  async refreshReminders() {
    try {
      await syncReminders(get);
    } catch (err) {
      if (__DEV__) console.warn('[reminders] sync failed', err);
    }
  },
}));
