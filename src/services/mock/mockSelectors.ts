/**
 * ⚠️ PLACEHOLDER — deleted in M3 alongside mockStore.
 *
 * A deliberately naive implementation of `ScheduleSelectors` so Track B can
 * render real-shaped visits and summaries before Track A's engine lands.
 * Do not fix bugs here; the real engine in `src/domain/schedule/` is where
 * correctness lives and is tested.
 */
import type {
  AppState,
  ChildId,
  ScheduleItem,
  ScheduleItemStatus,
  ScheduleSelectors,
  ScheduleSummary,
  ScheduleVisit,
} from '@/contracts';
import { addDaysToISODate, daysBetween, toISODate } from '@/domain/date';
import { PLACEHOLDER_SCHEDULE } from '@/services/mock/placeholderSchedule';

const DUE_WINDOW_DAYS = 14;
const RANK: Record<ScheduleItemStatus, number> = {
  overdue: 4,
  due: 3,
  upcoming: 2,
  given: 1,
  skipped: 0,
};

function selectItems(state: AppState, childId: ChildId, today: Date): ScheduleItem[] {
  const child = state.children.find((c) => c.id === childId);
  if (!child) return [];
  const records = state.recordsByChild[childId] ?? [];
  const todayISO = toISODate(today);

  return PLACEHOLDER_SCHEDULE.doses.map((dose) => {
    const dueDate = addDaysToISODate(child.birthDate, dose.offsetDays);
    const daysUntilDue = daysBetween(todayISO, dueDate);
    const record = records.find((r) => r.doseId === dose.id) ?? null;

    let status: ScheduleItemStatus;
    if (record?.status === 'given') status = 'given';
    else if (record?.status === 'skipped') status = 'skipped';
    else if (daysUntilDue < 0) status = 'overdue';
    else if (daysUntilDue <= DUE_WINDOW_DAYS) status = 'due';
    else status = 'upcoming';

    return { dose, dueDate, status, daysUntilDue, record };
  });
}

function selectVisits(state: AppState, childId: ChildId, today: Date): ScheduleVisit[] {
  const items = selectItems(state, childId, today);
  const byVisit = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    const list = byVisit.get(item.dose.visitId) ?? [];
    list.push(item);
    byVisit.set(item.dose.visitId, list);
  }

  return [...byVisit.values()]
    .map((visitItems) => {
      const first = visitItems[0]!;
      const status = visitItems.reduce<ScheduleItemStatus>(
        (worst, i) => (RANK[i.status] > RANK[worst] ? i.status : worst),
        'skipped',
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

function selectSummary(state: AppState, childId: ChildId, today: Date): ScheduleSummary {
  const items = selectItems(state, childId, today);
  const visits = selectVisits(state, childId, today);
  const givenCount = items.filter((i) => i.status === 'given').length;
  return {
    totalDoses: items.length,
    givenCount,
    overdueCount: items.filter((i) => i.status === 'overdue').length,
    dueCount: items.filter((i) => i.status === 'due').length,
    completion: items.length ? givenCount / items.length : 0,
    nextVisit: visits.find((v) => !v.complete) ?? null,
  };
}

export const mockSelectors: ScheduleSelectors = { selectItems, selectVisits, selectSummary };
