/**
 * CONTRACT — FROZEN after M0.
 *
 * The national immunization schedule as data, plus the computed view of it
 * for one child. `VaccineDose` is authored by hand in `domain/schedule/`
 * and must cite its source.
 */
import type { DoseRecord } from './models';
import type { DoseId, ISODate, VaccineId, VisitId } from './primitives';

export type AdministrationRoute = 'oral' | 'injection' | 'intradermal';

/** One dose in the national schedule. Static reference data, never user-edited. */
export interface VaccineDose {
  id: DoseId;
  vaccineId: VaccineId;
  /** Full name, e.g. 'Pentavalent vaccine'. */
  vaccineName: string;
  /** Abbreviation shown in dense UI, e.g. 'Penta'. */
  shortName: string;
  /** Human dose label, e.g. '1st dose' or 'Birth dose'. */
  doseLabel: string;
  /** Days after birth this dose becomes due. Birth doses are 0. */
  offsetDays: number;
  visitId: VisitId;
  /** Human visit label, e.g. 'At birth', '6 weeks'. */
  visitLabel: string;
  route: AdministrationRoute;
  /** Diseases this dose protects against, for the detail sheet. */
  protectsAgainst: string[];
  note?: string;
}

export interface ScheduleDefinition {
  /** e.g. 'NPHCDA-2024.1' — bumped whenever the dose table changes. */
  version: string;
  /** Human-readable source, surfaced in-app for provenance. */
  source: string;
  sourceUrl: string;
  doses: VaccineDose[];
}

export type ScheduleItemStatus =
  | 'given'
  | 'skipped'
  /** Due date has passed and no record exists. */
  | 'overdue'
  /** Due within the "due now" window (inclusive of today). */
  | 'due'
  | 'upcoming';

export interface ScheduleItem {
  dose: VaccineDose;
  dueDate: ISODate;
  status: ScheduleItemStatus;
  /** Negative = in the past. 0 = today. */
  daysUntilDue: number;
  record: DoseRecord | null;
}

/** Doses that share a clinic visit, grouped so the UI can render one card per trip. */
export interface ScheduleVisit {
  visitId: VisitId;
  visitLabel: string;
  dueDate: ISODate;
  daysUntilDue: number;
  items: ScheduleItem[];
  /** Worst status across items: overdue > due > upcoming > given/skipped. */
  status: ScheduleItemStatus;
  /** True when every item is given or skipped. */
  complete: boolean;
}

export interface ScheduleSummary {
  totalDoses: number;
  givenCount: number;
  overdueCount: number;
  dueCount: number;
  /** 0..1, given / total. */
  completion: number;
  nextVisit: ScheduleVisit | null;
}
