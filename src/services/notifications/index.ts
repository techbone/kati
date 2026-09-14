/**
 * Track C — notifications.
 *
 * Handoff for Tracks A/B:
 * - When reminders are enabled / on app foreground / after dose mutations,
 *   call `notificationService.sync(planReminders(...))`.
 * - Settings: request permission when the user turns reminders on; show
 *   `getScheduledCount()` on a diagnostics row (1–48).
 * - If permission is not granted, skip sync (do not spam the system prompt).
 */
export { createExpoNotificationService, notificationService } from './expoNotificationService';
export { mapPermissionStatus } from './mapPermission';
export { createMockNotificationService } from './mockNotificationService';
