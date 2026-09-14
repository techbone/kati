/**
 * Golden file for the real NPHCDA table.
 *
 * One fixed birth date, one fixed `today`, the whole computed schedule
 * snapshotted. Any future change to a dose interval or to the engine shows up
 * here as a reviewable diff instead of a silent change in what a parent sees.
 *
 * If this snapshot changes, that is not a test to update — it is a change to
 * check against the NPHCDA source before it merges.
 *
 * NOTE: the snapshot is empty until A1 fills `src/domain/schedule/nphcda.ts`.
 * The first real diff here is the whole table arriving, and is exactly what
 * Musa reviews row by row.
 */
import { asChildId, asISODate, asISOTimestamp, type Child } from '@/contracts';
import { computeScheduleItems, computeSummary, groupIntoVisits, NPHCDA_SCHEDULE } from '@/domain/schedule';

/** Born mid-2025, seen in late 2026: old enough that early doses are behind and later ones are not. */
const CHILD: Child = {
  id: asChildId('golden-child'),
  name: 'Golden',
  birthDate: asISODate('2025-06-15'),
  sex: 'female',
  photoUri: null,
  createdAt: asISOTimestamp('2025-06-15T00:00:00.000Z'),
  updatedAt: asISOTimestamp('2025-06-15T00:00:00.000Z'),
};
const TODAY = asISODate('2026-03-01');

describe('NPHCDA schedule — golden file', () => {
  const items = computeScheduleItems(CHILD, [], NPHCDA_SCHEDULE, TODAY);

  it('cites its source, so the app can show a parent where this came from', () => {
    expect(NPHCDA_SCHEDULE.version).toBe('NPHCDA-2024.1');
    expect(NPHCDA_SCHEDULE.source).toContain('NPHCDA');
  });

  it('gives every dose a stable id', () => {
    const ids = NPHCDA_SCHEDULE.doses.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('computes the same schedule it did yesterday', () => {
    expect(
      items.map((i) => ({
        id: i.dose.id,
        visit: i.dose.visitId,
        offsetDays: i.dose.offsetDays,
        dueDate: i.dueDate,
        daysUntilDue: i.daysUntilDue,
        status: i.status,
      })),
    ).toMatchSnapshot();
  });

  it('groups into the same clinic visits it did yesterday', () => {
    expect(
      groupIntoVisits(items).map((v) => ({
        visitId: v.visitId,
        visitLabel: v.visitLabel,
        dueDate: v.dueDate,
        status: v.status,
        doses: v.items.map((i) => i.dose.id),
      })),
    ).toMatchSnapshot();
  });

  it('summarises the same way it did yesterday', () => {
    expect(computeSummary(items)).toMatchSnapshot();
  });
});
