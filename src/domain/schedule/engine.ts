/**
 * The schedule engine. Pure: no clock reads, no I/O, no React.
 * `today` is always a parameter — that is what makes "due today",
 * "one day overdue" and "born on 29 February" testable in milliseconds.
 *
 * Correctness lives here. `services/mock/mockSelectors.ts` is a naive
 * stand-in that dies with the mock store in M3.
 */
import type {
  Child,
  DoseRecord,
  ISODate,
  ScheduleDefinition,
  ScheduleItem,
  ScheduleItemStatus,
  ScheduleSummary,
  ScheduleVisit,
} from '@/contracts';
import { addDaysToISODate, daysBetween } from '@/domain/date';

/** Days ahead of the due date a dose is considered "due now" rather than "upcoming". */
export const DUE_WINDOW_DAYS = 14;

/** Worst-first ordering: overdue > due > upcoming > given > skipped. */
const STATUS_RANK: Record<ScheduleItemStatus, number> = {
  overdue: 4,
  due: 3,
  upcoming: 2,
  given: 1,
  skipped: 0,
};

/**
 * Status resolution, in this exact order:
 *   1. a record exists → its status wins. A dose given three weeks late is
 *      still `given`, never `overdue`.
 *   2. due date has passed → `overdue`
 *   3. due within DUE_WINDOW_DAYS (inclusive, today included) → `due`
 *   4. otherwise → `upcoming`
 *
 * A `pending` record is treated as no record: the row exists only because the
 * user opened the dose and backed out, and it must not freeze the status.
 */
function resolveStatus(record: DoseRecord | null, daysUntilDue: number): ScheduleItemStatus {
  if (record?.status === 'given') return 'given';
  if (record?.status === 'skipped') return 'skipped';
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= DUE_WINDOW_DAYS) return 'due';
  return 'upcoming';
}

/**
 * One row per dose in the schedule, in schedule order.
 *
 * A birth date in the future is not an error here — every dose simply lands in
 * the future and resolves to `upcoming`. The UI rejects future birth dates at
 * entry; the engine's job is to not crash if one ever reaches it.
 */
export function computeScheduleItems(
  child: Child,
  records: readonly DoseRecord[],
  schedule: ScheduleDefinition,
  today: ISODate,
): ScheduleItem[] {
  const byDoseId = new Map(records.map((r) => [r.doseId, r]));

  return schedule.doses.map((dose) => {
    const dueDate = addDaysToISODate(child.birthDate, dose.offsetDays);
    const daysUntilDue = daysBetween(today, dueDate);
    const record = byDoseId.get(dose.id) ?? null;

    return { dose, dueDate, status: resolveStatus(record, daysUntilDue), daysUntilDue, record };
  });
}

/**
 * Doses that share a clinic visit, grouped so the UI renders one card per trip
 * to the clinic. Ordered by due date — the order a parent walks through them.
 */
export function groupIntoVisits(items: readonly ScheduleItem[]): ScheduleVisit[] {
  const byVisit = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    const existing = byVisit.get(item.dose.visitId);
    if (existing) existing.push(item);
    else byVisit.set(item.dose.visitId, [item]);
  }

  return [...byVisit.values()]
    .map((visitItems) => {
      const first = visitItems[0]!;
      const status = visitItems.reduce<ScheduleItemStatus>(
        (worst, item) => (STATUS_RANK[item.status] > STATUS_RANK[worst] ? item.status : worst),
        first.status,
      );

      return {
        visitId: first.dose.visitId,
        visitLabel: first.dose.visitLabel,
        dueDate: first.dueDate,
        daysUntilDue: first.daysUntilDue,
        items: visitItems,
        status,
        complete: visitItems.every((i) => i.status === 'given' || i.status === 'skipped'),
      };
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Headline numbers for the home screen. `nextVisit` is the earliest visit that
 * still has something to do — a child who is fully caught up has none.
 */
export function computeSummary(items: readonly ScheduleItem[]): ScheduleSummary {
  let givenCount = 0;
  let overdueCount = 0;
  let dueCount = 0;

  for (const item of items) {
    if (item.status === 'given') givenCount += 1;
    else if (item.status === 'overdue') overdueCount += 1;
    else if (item.status === 'due') dueCount += 1;
  }

  return {
    totalDoses: items.length,
    givenCount,
    overdueCount,
    dueCount,
    completion: items.length === 0 ? 0 : givenCount / items.length,
    nextVisit: groupIntoVisits(items).find((v) => !v.complete) ?? null,
  };
}
