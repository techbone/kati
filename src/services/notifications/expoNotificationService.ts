import * as Notifications from 'expo-notifications';

import type { PermissionState, NotificationService } from '@/contracts/services';
import type { ReminderPlan } from '@/contracts/reminders';

import { mapPermissionStatus } from './mapPermission';

/**
 * Real NotificationService against expo-notifications (SDK 57).
 * Idempotent sync: cancel everything, then schedule the plan (capped by domain ≤48).
 */
export function createExpoNotificationService(): NotificationService {
  return {
    async getPermission(): Promise<PermissionState> {
      const { status } = await Notifications.getPermissionsAsync();
      return mapPermissionStatus(status);
    },

    async requestPermission(): Promise<PermissionState> {
      const { status } = await Notifications.requestPermissionsAsync();
      return mapPermissionStatus(status);
    },

    async cancelAll(): Promise<void> {
      await Notifications.cancelAllScheduledNotificationsAsync();
    },

    async sync(plan: ReminderPlan): Promise<void> {
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const reminder of plan.reminders) {
        await Notifications.scheduleNotificationAsync({
          identifier: reminder.key,
          content: {
            title: reminder.title,
            body: reminder.body,
            sound: true,
            data: {
              childId: reminder.childId,
              doseIds: reminder.doseIds,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminder.fireAt,
          },
        });
      }
    },

    async getScheduledCount(): Promise<number> {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.length;
    },
  };
}

export const notificationService: NotificationService = createExpoNotificationService();
