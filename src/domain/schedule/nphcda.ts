/**
 * Nigeria's routine immunization schedule, as data.
 *
 * ⚠️ EVERY ROW IS TYPED BY HAND FROM THE NPHCDA SOURCE AND REVIEWED BY A
 * SECOND PERSON BEFORE MERGE. Never fill a row from memory, from another
 * app, or from a summary article — a wrong interval here is real-world harm,
 * not a bug. Open the source document, read the row, type it in.
 *
 * This lives in version control rather than the database on purpose: a change
 * to a dose interval must show up as a reviewable diff, and the golden-file
 * test in `__tests__/nphcda.golden.test.ts` makes sure it does.
 *
 * `offsetDays` is days from birth, converted consistently from the figures the
 * source states:  6 weeks = 42 · 10 weeks = 70 · 14 weeks = 98 · 9 months = 273.
 * Don't mix "6 weeks" and "1.5 months".
 *
 * Bump `version` whenever the table below changes.
 */
import {
  asDoseId,
  asVaccineId,
  asVisitId,
  type ScheduleDefinition,
  type VaccineDose,
} from '@/contracts';

// TODO(A1): fill `doses` from the NPHCDA source, then have Musa check every row
// against it before merge. Put the source link in the PR description.
// Until this is populated the app computes an empty schedule — see the golden
// snapshot, which is empty on purpose and will diff in full when rows land.
const doses: VaccineDose[] = [];

export const NPHCDA_SCHEDULE: ScheduleDefinition = {
  version: 'NPHCDA-2024.1',
  source: 'National Primary Health Care Development Agency (NPHCDA) — routine immunization schedule',
  // Shown in-app for provenance, so it has to be a link a parent could open.
  sourceUrl: '',
  doses,
};

/** Convenience for the table above: keeps each row to one readable line. */
export function dose(row: {
  id: string;
  vaccineId: string;
  vaccineName: string;
  shortName: string;
  doseLabel: string;
  offsetDays: number;
  visitId: string;
  visitLabel: string;
  route: VaccineDose['route'];
  protectsAgainst: string[];
  note?: string;
}): VaccineDose {
  return {
    ...row,
    id: asDoseId(row.id),
    vaccineId: asVaccineId(row.vaccineId),
    visitId: asVisitId(row.visitId),
  };
}
