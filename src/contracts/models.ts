/**
 * CONTRACT — FROZEN after M0.
 *
 * Persisted models. Anything in here maps 1:1 to a SQLite row.
 * The vaccine schedule itself is NOT persisted — it is versioned code
 * (see `contracts/schedule.ts` and `domain/schedule/`).
 */
import type { ChildId, DoseId, ISODate, ISOTimestamp } from './primitives';

export type Sex = 'male' | 'female' | 'unspecified';

export interface Child {
  id: ChildId;
  name: string;
  birthDate: ISODate;
  sex: Sex;
  /** Local file URI of a photo copied into app storage. Never a remote URL. */
  photoUri: string | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export type DoseStatus = 'pending' | 'given' | 'skipped';

/**
 * The user's record for one dose of one child.
 * Rows exist only once the user has acted — absence means `pending`.
 */
export interface DoseRecord {
  childId: ChildId;
  doseId: DoseId;
  status: DoseStatus;
  /** Date the dose was actually administered. Set iff status === 'given'. */
  givenDate: ISODate | null;
  /** Free text, e.g. batch number or clinic name. */
  note: string | null;
  updatedAt: ISOTimestamp;
}

export interface ReminderPrefs {
  enabled: boolean;
  /** Local hour (0-23) reminders fire at. */
  hour: number;
  /** Local minute (0-59) reminders fire at. */
  minute: number;
  /** Days before the due date to warn, descending, e.g. [7, 1, 0]. */
  leadDays: number[];
}

export interface Prefs {
  reminders: ReminderPrefs;
  /** Set once the user has completed onboarding. */
  onboarded: boolean;
  /** Schedule revision the user last acknowledged, for future schedule updates. */
  scheduleVersion: string;
}
