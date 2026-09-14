import {
  asChildId,
  asDoseId,
  asISODate,
  asISOTimestamp,
  asVaccineId,
  asVisitId,
  MAX_SCHEDULED_NOTIFICATIONS,
  type Child,
  type DoseRecord,
  type Prefs,
  type ScheduleDefinition,
  type VaccineDose,
} from '@/contracts';
import { planReminders } from '@/domain/reminders';

const TS = asISOTimestamp('2026-09-14T00:00:00.000Z');

function fixtureDose(id: string, offsetDays: number, visitId: string): VaccineDose {
  return {
    id: asDoseId(id),
    vaccineId: asVaccineId(id),
    vaccineName: `Vaccine ${id}`,
    shortName: id.toUpperCase(),
    doseLabel: '1st dose',
    offsetDays,
    visitId: asVisitId(visitId),
    visitLabel: visitId,
    route: 'injection',
    protectsAgainst: ['Something'],
  };
}

function scheduleWith(...doses: VaccineDose[]): ScheduleDefinition {
  return { version: 'FIXTURE-1', source: 'Fixture', sourceUrl: 'https://example.invalid', doses };
}

function child(id: string, birthDate: string, name = 'Test child'): Child {
  return {
    id: asChildId(id),
    name,
    birthDate: asISODate(birthDate),
    sex: 'unspecified',
    photoUri: null,
    createdAt: TS,
    updatedAt: TS,
  };
}

const PREFS: Prefs = {
  reminders: { enabled: true, hour: 8, minute: 0, leadDays: [7, 1, 0] },
  onboarded: true,
  scheduleVersion: 'FIXTURE-1',
};

describe('planReminders', () => {
  it('returns an empty plan when reminders are disabled', () => {
    const schedule = scheduleWith(fixtureDose('bcg', 0, 'birth'));
    const plan = planReminders(
      [child('c1', '2026-01-01')],
      {},
      schedule,
      { ...PREFS, reminders: { ...PREFS.reminders, enabled: false } },
      new Date('2026-01-01T00:00:00'),
    );
    expect(plan).toEqual({ reminders: [], truncatedCount: 0, plannedAt: new Date('2026-01-01T00:00:00') });
  });

  it('plans one reminder per lead day for an outstanding visit', () => {
    // penta due 2026-02-12. now well before every lead day fires.
    const schedule = scheduleWith(fixtureDose('penta-1', 42, 'week-6'));
    const now = new Date('2026-01-01T00:00:00');
    const plan = planReminders([child('c1', '2026-01-01')], {}, schedule, PREFS, now);
    expect(plan.reminders).toHaveLength(3);
    expect(plan.truncatedCount).toBe(0);
    expect(plan.reminders.map((r) => r.key)).toEqual([
      'c1:week-6:7',
      'c1:week-6:1',
      'c1:week-6:0',
    ]);
    // Sorted soonest first regardless of leadDays iteration order.
    expect(plan.reminders[0]!.fireAt.getTime()).toBeLessThan(plan.reminders[1]!.fireAt.getTime());
    expect(plan.reminders[1]!.fireAt.getTime()).toBeLessThan(plan.reminders[2]!.fireAt.getTime());
  });

  it('fires at the configured local hour and minute, leadDays before the due date', () => {
    const schedule = scheduleWith(fixtureDose('penta-1', 42, 'week-6'));
    const now = new Date('2026-01-01T00:00:00');
    const prefs: Prefs = { ...PREFS, reminders: { enabled: true, hour: 9, minute: 30, leadDays: [1] } };
    const plan = planReminders([child('c1', '2026-01-01')], {}, schedule, prefs, now);
    const fireAt = plan.reminders[0]!.fireAt;
    // Due 2026-02-12 → 1 day before = 2026-02-11, 09:30 local.
    expect(fireAt).toEqual(new Date(2026, 1, 11, 9, 30, 0, 0));
  });

  it('excludes candidates that would fire in the past, including exactly "now"', () => {
    // Due 2026-02-12, 08:00. Candidates: Feb 5 (leadDays=7), Feb 11 (leadDays=1),
    // Feb 12 (leadDays=0). `now` lands exactly on the Feb 11 candidate: Feb 5 is
    // in the past, Feb 11 is neither before nor after `now` and must still be
    // dropped (fireAt must be strictly in the future), leaving only Feb 12.
    const schedule = scheduleWith(fixtureDose('penta-1', 42, 'week-6'));
    const now = new Date(2026, 1, 11, 8, 0, 0, 0);
    const plan = planReminders([child('c1', '2026-01-01')], {}, schedule, PREFS, now);
    expect(plan.reminders).toHaveLength(1);
    expect(plan.reminders[0]!.key).toBe('c1:week-6:0');
  });

  it('produces no reminders for a visit that is fully given', () => {
    const schedule = scheduleWith(fixtureDose('bcg', 0, 'birth'), fixtureDose('opv-0', 0, 'birth'));
    const records: DoseRecord[] = [
      { childId: asChildId('c1'), doseId: asDoseId('bcg'), status: 'given', givenDate: asISODate('2026-01-01'), note: null, updatedAt: TS },
      { childId: asChildId('c1'), doseId: asDoseId('opv-0'), status: 'skipped', givenDate: null, note: null, updatedAt: TS },
    ];
    const plan = planReminders(
      [child('c1', '2026-01-01')],
      { c1: records },
      schedule,
      PREFS,
      new Date('2025-12-01T00:00:00'),
    );
    expect(plan.reminders).toHaveLength(0);
  });

  it('lists only the unresolved doses of a partly-given visit', () => {
    const schedule = scheduleWith(fixtureDose('bcg', 0, 'birth'), fixtureDose('opv-0', 0, 'birth'));
    const records: DoseRecord[] = [
      { childId: asChildId('c1'), doseId: asDoseId('bcg'), status: 'given', givenDate: asISODate('2025-12-01'), note: null, updatedAt: TS },
    ];
    const now = new Date(2025, 11, 1, 0, 0, 0, 0); // same day as birth, before the 08:00 fire time
    const plan = planReminders([child('c1', '2025-12-01')], { c1: records }, schedule, PREFS, now);
    const leadZero = plan.reminders.find((r) => r.key === 'c1:birth:0')!;
    expect(leadZero.doseIds).toEqual([asDoseId('opv-0')]);
  });

  it('caps at MAX_SCHEDULED_NOTIFICATIONS, keeping the soonest and reporting the rest as truncated', () => {
    // 20 children × 3 lead days = 60 candidates, all for the same due date.
    const schedule = scheduleWith(fixtureDose('bcg', 0, 'birth'));
    const children = Array.from({ length: 20 }, (_, i) => child(`c${i}`, '2026-06-01', `Child ${i}`));
    const now = new Date('2026-01-01T00:00:00');
    const plan = planReminders(children, {}, schedule, PREFS, now);

    expect(plan.reminders.length).toBe(MAX_SCHEDULED_NOTIFICATIONS);
    expect(plan.truncatedCount).toBe(60 - MAX_SCHEDULED_NOTIFICATIONS);

    // What's kept really is the 60 soonest, not an arbitrary 48.
    const allFireTimes = children
      .flatMap(() => [7, 1, 0])
      .map((leadDays) => new Date(2026, 5, 1 - leadDays, 8, 0, 0, 0).getTime()) // 2026-06-01 minus leadDays
      .sort((a, b) => a - b);
    const expectedKeptTimes = allFireTimes.slice(0, MAX_SCHEDULED_NOTIFICATIONS);
    const actualTimes = plan.reminders.map((r) => r.fireAt.getTime()).sort((a, b) => a - b);
    expect(actualTimes).toEqual(expectedKeptTimes);

    // And strictly sorted soonest-first in the output itself.
    for (let i = 1; i < plan.reminders.length; i++) {
      expect(plan.reminders[i]!.fireAt.getTime()).toBeGreaterThanOrEqual(plan.reminders[i - 1]!.fireAt.getTime());
    }
  });

  it('returns an empty plan for no children', () => {
    const schedule = scheduleWith(fixtureDose('bcg', 0, 'birth'));
    const plan = planReminders([], {}, schedule, PREFS, new Date('2026-01-01T00:00:00'));
    expect(plan).toEqual({ reminders: [], truncatedCount: 0, plannedAt: new Date('2026-01-01T00:00:00') });
  });
});
