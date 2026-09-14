/**
 * Nigeria's routine immunization schedule, as data.
 *
 * SOURCE: an NPHCDA-branded "Routine Immunisation Schedule" chart (footer:
 * www.nphcda.gov.ng · @nphcdang · @nphcda · NPHCDA toll-free 7722), supplied
 * by Faruq as a screenshot of an Instagram repost by @phcvoice. This
 * supersedes an earlier, differently-formatted NPHCDA chart also supplied by
 * Faruq — the two disagreed on Vitamin A timing, the 2nd-dose count for HPV,
 * "Measles" vs "Measles-Rubella", and whether a malaria vaccine appears at
 * all. This file follows the phcvoice repost as the more recent of the two.
 *
 * Nothing here is from memory: every vaccine, dose number, age and route is
 * what that chart states, including its own two footnotes:
 *   "* HPV Vaccine for all 9 year old girls"
 *   "** Malaria Vaccine available in Kebbi and Bayelsa state only"
 *
 * ⚠️ THIS TABLE DOES NOT MERGE ON ONE PAIR OF EYES. Musa reads every row
 * against the source chart before approval. A wrong interval here is
 * real-world harm, not a bug.
 *
 * It lives in version control rather than the database on purpose: a change to
 * a dose interval must show up as a reviewable diff, and the golden-file test
 * in `__tests__/nphcda.golden.test.ts` makes sure it does.
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

/**
 * The chart states ages in weeks, months and years. These convert them to days
 * from birth, one convention throughout — a month is 91/3 days (so 9 months
 * lands on exactly 273, per TRACK-A.md's own worked example):
 *
 *   6 weeks = 42 · 10 weeks = 70 · 14 weeks = 98 · 6 months = 182 ·
 *   9 months = 273 · 15 months = 455 · 9 years = 3276
 *
 * 5 and 7 months (the malaria-dose ages below, currently excluded — see
 * MALARIA doses note) aren't multiples of 3 and don't divide evenly under this
 * convention; they round to the nearest day (152 and 212) rather than
 * switching formulas.
 */
const weeks = (n: number): number => n * 7;
const preciseMonths = (n: number): number => (n * 91) / 3;
const months = (n: number): number => Math.round(preciseMonths(n));
const years = (n: number): number => months(n * 12);

/** Keeps each row below to one readable line. */
function dose(row: {
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

/**
 * `note` carries the dosage and injection site from the chart's Dosage and
 * Site columns, which the frozen `VaccineDose` contract has no field for and
 * which are the details a parent is actually asked about at the clinic.
 * Where the chart says "Subcutaneous" the note says so, because `route` only
 * distinguishes oral / injection / intradermal.
 *
 * NOT INCLUDED: the chart's Malaria Vaccine, at 5, 6, 7 and 15 months —
 * footnoted "** Malaria Vaccine available in Kebbi and Bayelsa state only".
 * The app has no way to know which state a child is in (Child carries no
 * location field, and the contract is frozen), so including it would show
 * every child outside two of thirty-six states as permanently overdue for a
 * dose they cannot get. Left out by default rather than guessed at — flagged
 * for the team to decide whether it needs a location field and an opt-in.
 */
const doses: VaccineDose[] = [
  // ── At birth ────────────────────────────────────────────────────────────
  dose({
    id: 'bcg',
    vaccineId: 'bcg',
    vaccineName: 'BCG',
    shortName: 'BCG',
    doseLabel: 'Birth dose',
    offsetDays: 0,
    visitId: 'birth',
    visitLabel: 'At birth',
    route: 'intradermal',
    protectsAgainst: ['Tuberculosis'],
    note: '0.05ml · left upper arm',
  }),
  dose({
    id: 'opv-0',
    vaccineId: 'opv',
    vaccineName: 'Oral Polio Vaccine',
    shortName: 'OPV',
    doseLabel: 'Birth dose (OPV0)',
    offsetDays: 0,
    visitId: 'birth',
    visitLabel: 'At birth',
    route: 'oral',
    protectsAgainst: ['Poliomyelitis'],
    note: '2 drops · mouth',
  }),
  dose({
    id: 'hepb-0',
    vaccineId: 'hepb',
    vaccineName: 'Hepatitis B vaccine',
    shortName: 'Hep B',
    doseLabel: 'Birth dose (Hep B0)',
    offsetDays: 0,
    visitId: 'birth',
    visitLabel: 'At birth',
    route: 'injection',
    protectsAgainst: ['Hepatitis B'],
    note: '0.5ml · intramuscular · anterolateral aspect of right thigh',
  }),

  // ── 6 weeks ─────────────────────────────────────────────────────────────
  dose({
    id: 'penta-1',
    vaccineId: 'penta',
    vaccineName: 'Pentavalent vaccine (DPT, Hep B and Hib)',
    shortName: 'Penta',
    doseLabel: '1st dose',
    offsetDays: weeks(6),
    visitId: 'week-6',
    visitLabel: '6 weeks',
    route: 'injection',
    protectsAgainst: [
      'Diphtheria',
      'Pertussis',
      'Tetanus',
      'Hepatitis B',
      'Haemophilus influenzae type b',
    ],
    note: '0.5ml · intramuscular · anterolateral aspect of left thigh',
  }),
  dose({
    id: 'pcv-1',
    vaccineId: 'pcv',
    vaccineName: 'Pneumococcal Conjugate Vaccine',
    shortName: 'PCV',
    doseLabel: '1st dose',
    offsetDays: weeks(6),
    visitId: 'week-6',
    visitLabel: '6 weeks',
    route: 'injection',
    protectsAgainst: ['Pneumococcal pneumonia', 'Pneumococcal meningitis'],
    note: '0.5ml · intramuscular · anterolateral aspect of right thigh',
  }),
  dose({
    id: 'opv-1',
    vaccineId: 'opv',
    vaccineName: 'Oral Polio Vaccine',
    shortName: 'OPV',
    doseLabel: '1st dose',
    offsetDays: weeks(6),
    visitId: 'week-6',
    visitLabel: '6 weeks',
    route: 'oral',
    protectsAgainst: ['Poliomyelitis'],
    note: '2 drops · mouth',
  }),
  dose({
    id: 'ipv-1',
    vaccineId: 'ipv',
    vaccineName: 'Inactivated Polio Vaccine',
    shortName: 'IPV',
    doseLabel: '1st dose',
    offsetDays: weeks(6),
    visitId: 'week-6',
    visitLabel: '6 weeks',
    route: 'injection',
    protectsAgainst: ['Poliomyelitis'],
    note: '0.5ml · intramuscular · anterolateral aspect of right thigh, 2.5cm apart from PCV',
  }),
  dose({
    id: 'rota-1',
    vaccineId: 'rota',
    vaccineName: 'Rotavirus vaccine',
    shortName: 'Rota',
    doseLabel: '1st dose',
    offsetDays: weeks(6),
    visitId: 'week-6',
    visitLabel: '6 weeks',
    route: 'oral',
    protectsAgainst: ['Rotavirus diarrhoea'],
    note: '5 drops · mouth',
  }),

  // ── 10 weeks ────────────────────────────────────────────────────────────
  dose({
    id: 'penta-2',
    vaccineId: 'penta',
    vaccineName: 'Pentavalent vaccine (DPT, Hep B and Hib)',
    shortName: 'Penta',
    doseLabel: '2nd dose',
    offsetDays: weeks(10),
    visitId: 'week-10',
    visitLabel: '10 weeks',
    route: 'injection',
    protectsAgainst: [
      'Diphtheria',
      'Pertussis',
      'Tetanus',
      'Hepatitis B',
      'Haemophilus influenzae type b',
    ],
    note: '0.5ml · intramuscular · anterolateral aspect of left thigh',
  }),
  dose({
    id: 'pcv-2',
    vaccineId: 'pcv',
    vaccineName: 'Pneumococcal Conjugate Vaccine',
    shortName: 'PCV',
    doseLabel: '2nd dose',
    offsetDays: weeks(10),
    visitId: 'week-10',
    visitLabel: '10 weeks',
    route: 'injection',
    protectsAgainst: ['Pneumococcal pneumonia', 'Pneumococcal meningitis'],
    note: '0.5ml · intramuscular · anterolateral aspect of right thigh',
  }),
  dose({
    id: 'opv-2',
    vaccineId: 'opv',
    vaccineName: 'Oral Polio Vaccine',
    shortName: 'OPV',
    doseLabel: '2nd dose',
    offsetDays: weeks(10),
    visitId: 'week-10',
    visitLabel: '10 weeks',
    route: 'oral',
    protectsAgainst: ['Poliomyelitis'],
    note: '2 drops · mouth',
  }),
  dose({
    id: 'rota-2',
    vaccineId: 'rota',
    vaccineName: 'Rotavirus vaccine',
    shortName: 'Rota',
    doseLabel: '2nd dose',
    offsetDays: weeks(10),
    visitId: 'week-10',
    visitLabel: '10 weeks',
    route: 'oral',
    protectsAgainst: ['Rotavirus diarrhoea'],
    note: '5 drops · mouth',
  }),

  // ── 14 weeks ────────────────────────────────────────────────────────────
  dose({
    id: 'penta-3',
    vaccineId: 'penta',
    vaccineName: 'Pentavalent vaccine (DPT, Hep B and Hib)',
    shortName: 'Penta',
    doseLabel: '3rd dose',
    offsetDays: weeks(14),
    visitId: 'week-14',
    visitLabel: '14 weeks',
    route: 'injection',
    protectsAgainst: [
      'Diphtheria',
      'Pertussis',
      'Tetanus',
      'Hepatitis B',
      'Haemophilus influenzae type b',
    ],
    note: '0.5ml · intramuscular · anterolateral aspect of left thigh',
  }),
  dose({
    id: 'pcv-3',
    vaccineId: 'pcv',
    vaccineName: 'Pneumococcal Conjugate Vaccine',
    shortName: 'PCV',
    doseLabel: '3rd dose',
    offsetDays: weeks(14),
    visitId: 'week-14',
    visitLabel: '14 weeks',
    route: 'injection',
    protectsAgainst: ['Pneumococcal pneumonia', 'Pneumococcal meningitis'],
    note: '0.5ml · intramuscular · anterolateral aspect of right thigh',
  }),
  dose({
    id: 'opv-3',
    vaccineId: 'opv',
    vaccineName: 'Oral Polio Vaccine',
    shortName: 'OPV',
    doseLabel: '3rd dose',
    offsetDays: weeks(14),
    visitId: 'week-14',
    visitLabel: '14 weeks',
    route: 'oral',
    protectsAgainst: ['Poliomyelitis'],
    note: '2 drops · mouth',
  }),
  dose({
    id: 'rota-3',
    vaccineId: 'rota',
    vaccineName: 'Rotavirus vaccine',
    shortName: 'Rota',
    doseLabel: '3rd dose',
    offsetDays: weeks(14),
    visitId: 'week-14',
    visitLabel: '14 weeks',
    route: 'oral',
    protectsAgainst: ['Rotavirus diarrhoea'],
    note: '5 drops · mouth',
  }),
  dose({
    id: 'ipv-2',
    vaccineId: 'ipv',
    vaccineName: 'Inactivated Polio Vaccine',
    shortName: 'IPV',
    doseLabel: '2nd dose',
    offsetDays: weeks(14),
    visitId: 'week-14',
    visitLabel: '14 weeks',
    route: 'injection',
    protectsAgainst: ['Poliomyelitis'],
    note: '0.5ml · intramuscular · anterolateral aspect of right thigh, 2.5cm apart from PCV',
  }),

  // ── 6 months ────────────────────────────────────────────────────────────
  dose({
    id: 'vitamin-a-1',
    vaccineId: 'vitamin-a',
    vaccineName: 'Vitamin A supplement',
    shortName: 'Vit A',
    doseLabel: '1st dose',
    offsetDays: months(6),
    visitId: 'month-6',
    visitLabel: '6 months',
    route: 'oral',
    protectsAgainst: ['Vitamin A deficiency'],
    note: '100,000 IU · mouth',
  }),

  // ── 9 months ────────────────────────────────────────────────────────────
  dose({
    id: 'mr-1',
    vaccineId: 'measles-rubella',
    vaccineName: 'Measles-Rubella vaccine (MR)',
    shortName: 'MR',
    doseLabel: '1st dose (MR1)',
    offsetDays: months(9),
    visitId: 'month-9',
    visitLabel: '9 months',
    route: 'injection',
    protectsAgainst: ['Measles', 'Rubella'],
    note: '0.5ml · subcutaneous · left upper arm',
  }),
  dose({
    id: 'yellow-fever',
    vaccineId: 'yellow-fever',
    vaccineName: 'Yellow Fever vaccine',
    shortName: 'Yellow Fever',
    doseLabel: 'Single dose',
    offsetDays: months(9),
    visitId: 'month-9',
    visitLabel: '9 months',
    route: 'injection',
    protectsAgainst: ['Yellow fever'],
    note: '0.5ml · subcutaneous · right upper arm',
  }),
  dose({
    id: 'men-a',
    vaccineId: 'men-a',
    vaccineName: 'Meningitis vaccine',
    shortName: 'Meningitis',
    doseLabel: 'Single dose',
    offsetDays: months(9),
    visitId: 'month-9',
    visitLabel: '9 months',
    route: 'injection',
    protectsAgainst: ['Meningococcal meningitis'],
    note: '0.5ml · intramuscular · anterolateral aspect of left thigh',
  }),
  dose({
    id: 'vitamin-a-2',
    vaccineId: 'vitamin-a',
    vaccineName: 'Vitamin A supplement',
    shortName: 'Vit A',
    doseLabel: '2nd dose',
    offsetDays: months(9),
    visitId: 'month-9',
    visitLabel: '9 months',
    route: 'oral',
    protectsAgainst: ['Vitamin A deficiency'],
    note: '200,000 IU · mouth',
  }),

  // ── 15 months ───────────────────────────────────────────────────────────
  dose({
    id: 'mr-2',
    vaccineId: 'measles-rubella',
    vaccineName: 'Measles-Rubella vaccine (MR)',
    shortName: 'MR',
    doseLabel: '2nd dose (MR2)',
    offsetDays: months(15),
    visitId: 'month-15',
    visitLabel: '15 months',
    route: 'injection',
    protectsAgainst: ['Measles', 'Rubella'],
    note: '0.5ml · subcutaneous · left upper arm',
  }),

  // ── 9 years ─────────────────────────────────────────────────────────────
  // Chart footnote: "* HPV Vaccine for all 9 year old girls" — a single
  // dose, not the 2-dose series the earlier chart showed. The contract has
  // no field to restrict a dose by sex (VaccineDose is frozen), so this row
  // is included for every child and the restriction is stated only in
  // `note`. That is a real gap, not a stylistic choice: as it stands the
  // engine will show this as overdue for boys too. Flagged for the team —
  // needs either a contracts change (all three owners) or a decision to
  // filter this dose in the engine keyed off `child.sex`.
  dose({
    id: 'hpv',
    vaccineId: 'hpv',
    vaccineName: 'Human Papillomavirus vaccine',
    shortName: 'HPV',
    doseLabel: 'Single dose',
    offsetDays: years(9),
    visitId: 'year-9',
    visitLabel: '9 years',
    route: 'injection',
    protectsAgainst: ['Human papillomavirus'],
    note: '0.5ml · intramuscular · deltoid muscle (left upper arm) · for girls only, per NPHCDA',
  }),
];

export const NPHCDA_SCHEDULE: ScheduleDefinition = {
  version: 'NPHCDA-2024.1',
  source:
    'National Primary Health Care Development Agency (NPHCDA) — national routine immunization schedule',
  // NPHCDA's official site. Not a deep link to this exact chart — as of this
  // writing nphcda.gov.ng/resources/ reports "No downloads found!", so the
  // chart itself has no independent URL to cite yet — but it is NPHCDA's own
  // domain, which is what a parent needs to trust the number on the page.
  sourceUrl: 'https://nphcda.gov.ng',
  doses,
};
