/**
 * CONTRACT — FROZEN after M0.
 *
 * The single seam between Track A (data/domain) and Track B (UI).
 * Track B codes against this from day one; `services/mock/mockStore.ts`
 * satisfies it until Track A lands the real implementation.
 *
 * Rule: the UI never imports from `src/data/**` or `src/domain/**` directly.
 */
import type { Child, DoseRecord, Prefs, Sex } from './models';
import type { ChildId, DoseId, ISODate } from './primitives';
import type { ScheduleItem, ScheduleSummary, ScheduleVisit } from './schedule';

export interface NewChildInput {
  name: string;
  birthDate: ISODate;
  sex: Sex;
  photoUri?: string | null;
}

export interface AppState {
  /** False until SQLite has been opened, migrated and read. Gate the splash on this. */
  hydrated: boolean;
  children: Child[];
  activeChildId: ChildId | null;
  /** Keyed by childId; only the active child's records are guaranteed loaded. */
  recordsByChild: Record<string, DoseRecord[]>;
  prefs: Prefs;
  isPremium: boolean;
}

export interface AppActions {
  hydrate(): Promise<void>;
  addChild(input: NewChildInput): Promise<ChildId>;
  updateChild(id: ChildId, patch: Partial<NewChildInput>): Promise<void>;
  deleteChild(id: ChildId): Promise<void>;
  setActiveChild(id: ChildId): Promise<void>;

  markGiven(childId: ChildId, doseId: DoseId, givenDate: ISODate, note?: string): Promise<void>;
  markSkipped(childId: ChildId, doseId: DoseId, note?: string): Promise<void>;
  clearRecord(childId: ChildId, doseId: DoseId): Promise<void>;

  setPrefs(patch: Partial<Prefs>): Promise<void>;
  setPremium(isPremium: boolean): void;

  /** Recomputes and re-syncs local notifications. Safe to call often. */
  refreshReminders(): Promise<void>;
}

export type AppStore = AppState & AppActions;

/**
 * Derived views. Implemented as pure selectors over AppState + the schedule
 * definition, so they are unit-testable and cheap to memoise.
 */
export interface ScheduleSelectors {
  selectItems(state: AppState, childId: ChildId, today: Date): ScheduleItem[];
  selectVisits(state: AppState, childId: ChildId, today: Date): ScheduleVisit[];
  selectSummary(state: AppState, childId: ChildId, today: Date): ScheduleSummary;
}

/** Feature gates. One place, so nobody scatters `isPremium` checks through the UI. */
export const FREE_CHILD_LIMIT = 1;

export type PremiumFeature = 'multiple-children' | 'pdf-export' | 'backup';
