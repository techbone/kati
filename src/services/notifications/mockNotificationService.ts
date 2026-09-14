import type { NotificationService, PermissionState } from '@/contracts/services';
import type { ReminderPlan } from '@/contracts/reminders';

/**
 * In-memory NotificationService for Jest and Expo Go without native scheduling.
 */
export function createMockNotificationService(options?: {
  initialPermission?: PermissionState;
}): NotificationService {
  let permission: PermissionState = options?.initialPermission ?? 'undetermined';
  let scheduledKeys: string[] = [];

  return {
    async getPermission() {
      return permission;
    },

    async requestPermission() {
      if (permission === 'undetermined') {
        permission = 'granted';
      }
      return permission;
    },

    async cancelAll() {
      scheduledKeys = [];
    },

    async sync(plan: ReminderPlan) {
      scheduledKeys = plan.reminders.map((r) => r.key);
    },

    async getScheduledCount() {
      return scheduledKeys.length;
    },
  };
}
