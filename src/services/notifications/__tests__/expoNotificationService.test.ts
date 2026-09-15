import { asChildId, asDoseId } from '@/contracts';
import type { ReminderPlan } from '@/contracts/reminders';

import { createExpoNotificationService } from '../expoNotificationService';

const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockCancelAll = jest.fn();
const mockSchedule = jest.fn();
const mockGetAll = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissions(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissions(...args),
  cancelAllScheduledNotificationsAsync: (...args: unknown[]) => mockCancelAll(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockSchedule(...args),
  getAllScheduledNotificationsAsync: (...args: unknown[]) => mockGetAll(...args),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationHandler: jest.fn(),
}));

describe('notifications/expoNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    mockCancelAll.mockResolvedValue(undefined);
    mockSchedule.mockResolvedValue('id');
    mockGetAll.mockResolvedValue([{ identifier: 'a' }, { identifier: 'b' }]);
  });

  const plan: ReminderPlan = {
    reminders: [
      {
        key: 'c1:v1:0',
        childId: asChildId('c1'),
        doseIds: [asDoseId('bcg')],
        fireAt: new Date(2026, 9, 1, 9, 0),
        title: 'Due today',
        body: 'BCG',
      },
    ],
    truncatedCount: 3,
    plannedAt: new Date(2026, 8, 14),
  };

  it('reads and requests permission through Expo', async () => {
    const service = createExpoNotificationService();
    expect(await service.getPermission()).toBe('granted');
    expect(await service.requestPermission()).toBe('denied');
  });

  it('cancel-all then schedules each reminder with a DATE trigger and stable id', async () => {
    const service = createExpoNotificationService();
    await service.sync(plan);

    expect(mockCancelAll).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith({
      identifier: 'c1:v1:0',
      content: {
        title: 'Due today',
        body: 'BCG',
        sound: true,
        data: { childId: 'c1', doseIds: ['bcg'] },
      },
      trigger: {
        type: 'date',
        date: plan.reminders[0]!.fireAt,
      },
    });
  });

  it('reports scheduled count from Expo', async () => {
    const service = createExpoNotificationService();
    expect(await service.getScheduledCount()).toBe(2);
  });
});
