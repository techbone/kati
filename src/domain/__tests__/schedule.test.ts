/**
 * Engine tests. Every case here is a real situation a parent can be in, and
 * each one is a single line because `today` is injected rather than read from
 * the clock. The fixture schedule below is deliberately NOT the NPHCDA table:
 * these tests assert engine behaviour, and must not start failing because a
 * dose interval was corrected.
 */
import {
  asChildId,
  asDoseId,
  asISODate,
  asISOTimestamp,
  asVaccineId,
  asVisitId,
  type Child,
  type DoseRecord,
  type ScheduleDefinition,
  type VaccineDose,
} from '@/contracts';
import {
  computeScheduleItems,
  computeSummary,
  DUE_WINDOW_DAYS,
  groupIntoVisits,
} from '@/domain/schedule';

const TS = asISOTimestamp('2026-09-14T00:00:00.000Z');

function fixtureDose(id: string, offsetDays: number, visitId: string): VaccineDose {
  return {
    id: asDoseId(id),
    vaccineId: asVaccineId(id.split('-')[0]!),
    vaccineName: `Vaccine ${id}`,
    shortName: id,
    doseLabel: '1st dose',
    offsetDays,
    visitId: asVisitId(visitId),
    visitLabel: visitId,
    route: 'injection',
    protectsAgainst: ['Something'],
  };
}

/** Two doses at birth, one at 42 days, one at 273 days. */
const SCHEDULE: ScheduleDefinition = {
  version: 'FIXTURE-1',
  source: 'Fixture, not medical data',
  sourceUrl: 'https://example.invalid',
  doses: [
    fixtureDose('bcg', 0, 'birth'),
    fixtureDose('opv-0', 0, 'birth'),
    fixtureDose('penta-1', 42, 'week-6'),
    fixtureDose('measles-1', 273, 'month-9'),
  ],
};

function child(birthDate: string): Child {
  return {
    id: asChildId('child-1'),
    name: 'Test child',
    birthDate: asISODate(birthDate),
    sex: 'unspecified',
    photoUri: null,
    createdAt: TS,
    updatedAt: TS,
  };
}

function record(doseId: string, status: DoseRecord['status'], givenDate?: string): DoseRecord {
  return {
    childId: asChildId('child-1'),
    doseId: asDoseId(doseId),
    status,
    givenDate: givenDate ? asISODate(givenDate) : null,
    note: null,
    updatedAt: TS,
  };
}

const items = (birthDate: string, today: string, records: DoseRecord[] = []) =>
  computeScheduleItems(child(birthDate), records, SCHEDULE, asISODate(today));

const statusOf = (born: string, today: string, doseId: string, records: DoseRecord[] = []) =>
  items(born, today, records).find((i) => i.dose.id === doseId)!.status;

describe('computeScheduleItems — status boundaries', () => {
  // penta-1 is due at birth + 42 days. Born 2026-01-01 → due 2026-02-12.
  it('is `due` on the due date itself', () => {
    expect(statusOf('2026-01-01', '2026-02-12', 'penta-1')).toBe('due');
    expect(items('2026-01-01', '2026-02-12').find((i) => i.dose.id === 'penta-1')!.daysUntilDue)
      .toBe(0);
  });

  it('is `overdue` the day after the due date', () => {
    expect(statusOf('2026-01-01', '2026-02-13', 'penta-1')).toBe('overdue');
  });

  it('is `due` on the last day of the due window', () => {
    // 14 days before 2026-02-12.
    expect(statusOf('2026-01-01', '2026-01-29', 'penta-1')).toBe('due');
  });

  it('is `upcoming` one day outside the due window', () => {
    expect(statusOf('2026-01-01', '2026-01-28', 'penta-1')).toBe('upcoming');
  });

  it('exports the due window it actually uses', () => {
    expect(DUE_WINDOW_DAYS).toBe(14);
  });
});

describe('computeScheduleItems — records win over dates', () => {
  it('keeps a dose given three weeks late as `given`, never `overdue`', () => {
    expect(statusOf('2026-01-01', '2026-06-01', 'penta-1', [record('penta-1', 'given', '2026-03-05')]))
      .toBe('given');
  });

  it('keeps a skipped dose as `skipped` even once the date has passed', () => {
    expect(statusOf('2026-01-01', '2026-06-01', 'penta-1', [record('penta-1', 'skipped')]))
      .toBe('skipped');
  });

  it('treats a `pending` record as no record at all', () => {
    expect(statusOf('2026-01-01', '2026-06-01', 'penta-1', [record('penta-1', 'pending')]))
      .toBe('overdue');
  });

  it('attaches the record to the item so the UI can show the given date', () => {
    const given = record('penta-1', 'given', '2026-03-05');
    const item = items('2026-01-01', '2026-06-01', [given]).find((i) => i.dose.id === 'penta-1')!;
    expect(item.record).toEqual(given);
  });

  it('leaves `record` null when the parent has not acted', () => {
    expect(items('2026-01-01', '2026-06-01')[0]!.record).toBeNull();
  });

  it('ignores records for doses that are not in the schedule', () => {
    const result = items('2026-01-01', '2026-06-01', [record('not-a-dose', 'given', '2026-01-01')]);
    expect(result).toHaveLength(SCHEDULE.doses.length);
  });
});

describe('computeScheduleItems — awkward birth dates', () => {
  it('handles a child born on 29 February', () => {
    // 2024 is a leap year. Birth + 42 days = 2024-04-11.
    const result = items('2024-02-29', '2024-04-11');
    expect(result.find((i) => i.dose.id === 'penta-1')!.dueDate).toBe('2024-04-11');
    expect(result.find((i) => i.dose.id === 'penta-1')!.status).toBe('due');
  });

  it('puts every offset-0 dose due today for a child born today', () => {
    const result = items('2026-09-14', '2026-09-14');
    const atBirth = result.filter((i) => i.dose.offsetDays === 0);
    expect(atBirth).toHaveLength(2);
    expect(atBirth.every((i) => i.status === 'due' && i.daysUntilDue === 0)).toBe(true);
  });

  it('resolves every dose for a child older than the whole schedule, without crashing', () => {
    const result = items('2020-01-01', '2026-09-14');
    expect(result).toHaveLength(SCHEDULE.doses.length);
    expect(result.every((i) => i.status === 'overdue')).toBe(true);
  });

  it('treats a birth date in the future as entirely upcoming rather than crashing', () => {
    // The UI rejects these at entry; the engine must still behave if one arrives.
    const result = items('2027-01-01', '2026-09-14');
    expect(result).toHaveLength(SCHEDULE.doses.length);
    expect(result.every((i) => i.status === 'upcoming')).toBe(true);
    expect(result.every((i) => i.daysUntilDue > 0)).toBe(true);
  });

  it('returns nothing for an empty schedule', () => {
    const empty = { ...SCHEDULE, doses: [] };
    expect(computeScheduleItems(child('2026-01-01'), [], empty, asISODate('2026-09-14'))).toEqual([]);
  });
});

describe('groupIntoVisits', () => {
  it('groups doses that share a visit into one clinic trip', () => {
    const visits = groupIntoVisits(items('2026-01-01', '2026-02-12'));
    expect(visits.map((v) => v.visitId)).toEqual(['birth', 'week-6', 'month-9']);
    expect(visits[0]!.items).toHaveLength(2);
  });

  it('orders visits by due date, soonest first', () => {
    const visits = groupIntoVisits(items('2026-01-01', '2026-02-12'));
    const days = visits.map((v) => v.daysUntilDue);
    expect([...days].sort((a, b) => a - b)).toEqual(days);
  });

  it('takes the worst status across the visit', () => {
    // At birth: BCG given, OPV-0 not. The trip is still outstanding.
    const visits = groupIntoVisits(items('2026-01-01', '2026-06-01', [record('bcg', 'given', '2026-01-01')]));
    expect(visits.find((v) => v.visitId === 'birth')!.status).toBe('overdue');
  });

  it('is complete only when every dose in the visit is given or skipped', () => {
    const partial = groupIntoVisits(items('2026-01-01', '2026-06-01', [record('bcg', 'given', '2026-01-01')]));
    expect(partial.find((v) => v.visitId === 'birth')!.complete).toBe(false);

    const done = groupIntoVisits(
      items('2026-01-01', '2026-06-01', [
        record('bcg', 'given', '2026-01-01'),
        record('opv-0', 'skipped'),
      ]),
    );
    expect(done.find((v) => v.visitId === 'birth')!.complete).toBe(true);
  });

  it('reports `given` rather than `skipped` for a mixed but finished visit', () => {
    const visits = groupIntoVisits(
      items('2026-01-01', '2026-06-01', [
        record('bcg', 'given', '2026-01-01'),
        record('opv-0', 'skipped'),
      ]),
    );
    expect(visits.find((v) => v.visitId === 'birth')!.status).toBe('given');
  });

  it('reports `skipped` for a visit where everything was skipped', () => {
    const visits = groupIntoVisits(
      items('2026-01-01', '2026-06-01', [record('bcg', 'skipped'), record('opv-0', 'skipped')]),
    );
    expect(visits.find((v) => v.visitId === 'birth')!.status).toBe('skipped');
  });

  it('returns no visits for no items', () => {
    expect(groupIntoVisits([])).toEqual([]);
  });
});

describe('computeSummary', () => {
  it('counts a fresh child as nothing done', () => {
    const summary = computeSummary(items('2026-01-01', '2026-02-12'));
    expect(summary).toMatchObject({ totalDoses: 4, givenCount: 0, completion: 0 });
  });

  it('counts given, overdue and due separately', () => {
    // Born 2026-01-01, today 2026-02-12: birth doses overdue, penta-1 due,
    // measles-1 upcoming. Mark BCG given.
    const summary = computeSummary(
      items('2026-01-01', '2026-02-12', [record('bcg', 'given', '2026-01-01')]),
    );
    expect(summary.givenCount).toBe(1);
    expect(summary.overdueCount).toBe(1);
    expect(summary.dueCount).toBe(1);
    expect(summary.completion).toBeCloseTo(0.25);
  });

  it('points at the earliest visit that still has something outstanding', () => {
    const summary = computeSummary(
      items('2026-01-01', '2026-02-12', [
        record('bcg', 'given', '2026-01-01'),
        record('opv-0', 'given', '2026-01-01'),
      ]),
    );
    expect(summary.nextVisit?.visitId).toBe('week-6');
  });

  it('has no next visit once every dose is resolved', () => {
    const summary = computeSummary(
      items('2026-01-01', '2026-02-12', SCHEDULE.doses.map((d) => record(d.id, 'given', '2026-01-01'))),
    );
    expect(summary.nextVisit).toBeNull();
    expect(summary.completion).toBe(1);
  });

  it('does not divide by zero on an empty schedule', () => {
    expect(computeSummary([])).toMatchObject({ totalDoses: 0, completion: 0, nextVisit: null });
  });
});
