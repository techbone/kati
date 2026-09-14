import { asChildId, asDoseId } from '@/contracts';
import type { ReminderPlan } from '@/contracts/reminders';

import { mapPermissionStatus } from '../mapPermission';
import { createMockNotificationService } from '../mockNotificationService';

describe('notifications/mapPermission', () => {
  it('maps known Expo statuses onto the contract', () => {
    expect(mapPermissionStatus('granted')).toBe('granted');
    expect(mapPermissionStatus('denied')).toBe('denied');
    expect(mapPermissionStatus('undetermined')).toBe('undetermined');
  });

  it('falls back to undetermined for unknown values', () => {
    expect(mapPermissionStatus('provisional')).toBe('undetermined');
  });
});

describe('notifications/mockNotificationService', () => {
  const plan: ReminderPlan = {
    reminders: [
      {
        key: 'child-a:visit-6w:7',
        childId: asChildId('child-a'),
        doseIds: [asDoseId('penta-1')],
        fireAt: new Date(2026, 8, 20, 9, 0),
        title: 'Clinic visit soon',
        body: 'Penta 1st dose is due in 7 days',
      },
      {
        key: 'child-a:visit-6w:1',
        childId: asChildId('child-a'),
        doseIds: [asDoseId('penta-1')],
        fireAt: new Date(2026, 8, 26, 9, 0),
        title: 'Clinic visit tomorrow',
        body: 'Penta 1st dose is due tomorrow',
      },
    ],
    truncatedCount: 0,
    plannedAt: new Date(2026, 8, 13, 8, 0),
  };

  it('starts undetermined and grants on request', async () => {
    const service = createMockNotificationService();
    expect(await service.getPermission()).toBe('undetermined');
    expect(await service.requestPermission()).toBe('granted');
    expect(await service.getPermission()).toBe('granted');
  });

  it('replaces the scheduled set on sync (idempotent cancel-then-schedule)', async () => {
    const service = createMockNotificationService({ initialPermission: 'granted' });
    await service.sync(plan);
    expect(await service.getScheduledCount()).toBe(2);

    await service.sync({ ...plan, reminders: plan.reminders.slice(0, 1) });
    expect(await service.getScheduledCount()).toBe(1);

    await service.cancelAll();
    expect(await service.getScheduledCount()).toBe(0);
  });
});
