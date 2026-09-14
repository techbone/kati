/**
 * Turns the schedule and a parent's reminder prefs into a bounded,
 * prioritised set of local notifications. Pure: `now` is the only clock
 * read, and it's a parameter — same discipline as the schedule engine.
 *
 * iOS silently drops pending local notifications past 64 per app (see
 * contracts/reminders.ts), so this always emits at most
 * MAX_SCHEDULED_NOTIFICATIONS, soonest-first, and reports how many it had to
 * drop rather than guessing which ones matter less. Delivery is a Track C
 * service — this only decides what should fire and when.
 */
import {
  MAX_SCHEDULED_NOTIFICATIONS,
  type Child,
  type DoseRecord,
  type ISODate,
  type PlannedReminder,
  type Prefs,
  type ReminderPlan,
  type ScheduleDefinition,
} from '@/contracts';
import { addDaysToISODate, fromISODate, toISODate } from '@/domain/date';
import { computeScheduleItems, groupIntoVisits } from '@/domain/schedule';

/** The local instant `leadDays` before `dueDate`, at the configured clock time. */
function reminderTiming(dueDate: ISODate, leadDays: number, hour: number, minute: number): Date {
  const reminderDate = addDaysToISODate(dueDate, -leadDays);
  const localMidnight = fromISODate(reminderDate);
  return new Date(
    localMidnight.getFullYear(),
    localMidnight.getMonth(),
    localMidnight.getDate(),
    hour,
    minute,
    0,
    0,
  );
}

function describeLead(leadDays: number): string {
  if (leadDays === 0) return 'today';
  if (leadDays === 1) return 'tomorrow';
  return `in ${leadDays} days`;
}

/**
 * Reminders are per clinic visit, not per dose — a parent gets one
 * notification for the trip, not one per jab. Only visits with something
 * still outstanding (not every item given or skipped) produce reminders, and
 * `doseIds` lists only the unresolved doses even when a visit is partly done.
 *
 * A visit whose due date has already passed produces no reminders: every
 * `leadDays` candidate for it lands in the past and is dropped, same as any
 * other stale candidate. Overdue doses stay visible in the schedule UI;
 * nagging about them again here isn't this function's job.
 */
export function planReminders(
  children: readonly Child[],
  recordsByChild: Readonly<Record<string, readonly DoseRecord[]>>,
  schedule: ScheduleDefinition,
  prefs: Prefs,
  now: Date,
): ReminderPlan {
  const plannedAt = now;

  if (!prefs.reminders.enabled) {
    return { reminders: [], truncatedCount: 0, plannedAt };
  }

  const today: ISODate = toISODate(now);
  const candidates: PlannedReminder[] = [];

  for (const child of children) {
    const records = recordsByChild[child.id] ?? [];
    const items = computeScheduleItems(child, records, schedule, today);
    const outstandingVisits = groupIntoVisits(items).filter((visit) => !visit.complete);

    for (const visit of outstandingVisits) {
      const outstanding = visit.items.filter((i) => i.status !== 'given' && i.status !== 'skipped');
      if (outstanding.length === 0) continue; // defensive: `complete` already guarantees this

      for (const leadDays of prefs.reminders.leadDays) {
        const fireAt = reminderTiming(visit.dueDate, leadDays, prefs.reminders.hour, prefs.reminders.minute);
        if (fireAt.getTime() <= now.getTime()) continue; // never schedule into the past

        candidates.push({
          key: `${child.id}:${visit.visitId}:${leadDays}`,
          childId: child.id,
          doseIds: outstanding.map((i) => i.dose.id),
          fireAt,
          title: `${child.name} — ${visit.visitLabel}`,
          body: `Due ${describeLead(leadDays)}: ${outstanding.map((i) => i.dose.shortName).join(', ')}`,
        });
      }
    }
  }

  // Soonest first: if the cap bites, what's cut is the furthest-out reminder,
  // which is also the one most likely to be re-planned into range later.
  candidates.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  const reminders = candidates.slice(0, MAX_SCHEDULED_NOTIFICATIONS);

  return { reminders, truncatedCount: candidates.length - reminders.length, plannedAt };
}
