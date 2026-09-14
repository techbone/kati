/**
 * The real `ScheduleSelectors`, satisfying the same contract as
 * `services/mock/mockSelectors.ts` but backed by the actual engine
 * (`src/domain/schedule`) and the real NPHCDA table, not the placeholder.
 */
import type {
  AppState,
  ChildId,
  ScheduleItem,
  ScheduleSelectors,
  ScheduleSummary,
  ScheduleVisit,
} from '@/contracts';
import { toISODate } from '@/domain/date';
import {
  computeScheduleItems,
  computeSummary,
  groupIntoVisits,
  NPHCDA_SCHEDULE,
} from '@/domain/schedule';

function selectItems(state: AppState, childId: ChildId, today: Date): ScheduleItem[] {
  const child = state.children.find((c) => c.id === childId);
  if (!child) return [];
  const records = state.recordsByChild[childId] ?? [];
  return computeScheduleItems(child, records, NPHCDA_SCHEDULE, toISODate(today));
}

function selectVisits(state: AppState, childId: ChildId, today: Date): ScheduleVisit[] {
  return groupIntoVisits(selectItems(state, childId, today));
}

function selectSummary(state: AppState, childId: ChildId, today: Date): ScheduleSummary {
  return computeSummary(selectItems(state, childId, today));
}

export const appSelectors: ScheduleSelectors = { selectItems, selectVisits, selectSummary };

/** Provenance for the record card and the home footer. */
export const scheduleSource = {
  name: NPHCDA_SCHEDULE.source,
  version: NPHCDA_SCHEDULE.version,
  url: NPHCDA_SCHEDULE.sourceUrl,
};
