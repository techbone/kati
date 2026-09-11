/**
 * CONTRACT — FROZEN after M0.
 *
 * Reminder planning is pure domain logic; delivery is a Track C service.
 * iOS silently drops pending local notifications past 64 per app, so the
 * planner emits a bounded, prioritised window and the service replaces the
 * whole set on every sync.
 */
import type { ChildId, DoseId } from './primitives';

/** Hard ceiling. iOS keeps only the 64 soonest pending notifications. */
export const MAX_SCHEDULED_NOTIFICATIONS = 48;

export interface PlannedReminder {
  /** Deterministic: `${childId}:${visitId}:${leadDays}`. Same inputs → same key. */
  key: string;
  childId: ChildId;
  doseIds: DoseId[];
  /** Absolute local instant to fire. Always in the future relative to planning time. */
  fireAt: Date;
  title: string;
  body: string;
}

export interface ReminderPlan {
  reminders: PlannedReminder[];
  /** Reminders the planner dropped to stay under the cap, for diagnostics. */
  truncatedCount: number;
  plannedAt: Date;
}
