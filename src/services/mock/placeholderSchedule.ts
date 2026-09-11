/**
 * ⚠️ PLACEHOLDER — NOT MEDICALLY ACCURATE. NOT FOR SHIPPING.
 *
 * Exists only so Track B can render real-shaped data on day one.
 * Track A replaces this in M1 with `src/domain/schedule/nphcda.ts`, sourced
 * from and cited to NPHCDA, and reviewed by a second person before merge.
 * The M1 exit criteria include deleting this file.
 */
import {
  asDoseId,
  asVaccineId,
  asVisitId,
  type ScheduleDefinition,
  type VaccineDose,
} from '@/contracts';

const dose = (
  id: string,
  vaccineId: string,
  vaccineName: string,
  shortName: string,
  doseLabel: string,
  offsetDays: number,
  visitId: string,
  visitLabel: string,
): VaccineDose => ({
  id: asDoseId(id),
  vaccineId: asVaccineId(vaccineId),
  vaccineName,
  shortName,
  doseLabel,
  offsetDays,
  visitId: asVisitId(visitId),
  visitLabel,
  route: 'injection',
  protectsAgainst: [],
});

export const PLACEHOLDER_SCHEDULE: ScheduleDefinition = {
  version: 'PLACEHOLDER-0',
  source: 'Placeholder data — replace before any build leaves the team',
  sourceUrl: '',
  doses: [
    dose('bcg', 'bcg', 'BCG', 'BCG', 'Birth dose', 0, 'birth', 'At birth'),
    dose('opv-0', 'opv', 'Oral Polio Vaccine', 'OPV', 'Birth dose', 0, 'birth', 'At birth'),
    dose('penta-1', 'penta', 'Pentavalent', 'Penta', '1st dose', 42, 'week-6', '6 weeks'),
    dose('opv-1', 'opv', 'Oral Polio Vaccine', 'OPV', '1st dose', 42, 'week-6', '6 weeks'),
    dose('penta-2', 'penta', 'Pentavalent', 'Penta', '2nd dose', 70, 'week-10', '10 weeks'),
    dose('penta-3', 'penta', 'Pentavalent', 'Penta', '3rd dose', 98, 'week-14', '14 weeks'),
    dose('measles-1', 'measles', 'Measles', 'Measles', '1st dose', 273, 'month-9', '9 months'),
  ],
};
