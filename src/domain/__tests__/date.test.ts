import { asISODate } from '@/contracts';
import { addDaysToISODate, daysBetween, isValidISODate, toISODate } from '@/domain/date';

describe('domain/date', () => {
  it('formats a Date as a local calendar date', () => {
    expect(toISODate(new Date(2026, 8, 11))).toBe('2026-09-11');
  });

  it('does not shift a day near local midnight', () => {
    expect(toISODate(new Date(2026, 8, 11, 23, 59))).toBe('2026-09-11');
    expect(toISODate(new Date(2026, 8, 11, 0, 1))).toBe('2026-09-11');
  });

  it('adds days across a month boundary', () => {
    expect(addDaysToISODate(asISODate('2026-01-30'), 3)).toBe('2026-02-02');
  });

  it('counts calendar days in both directions', () => {
    expect(daysBetween(asISODate('2026-09-11'), asISODate('2026-09-18'))).toBe(7);
    expect(daysBetween(asISODate('2026-09-18'), asISODate('2026-09-11'))).toBe(-7);
    expect(daysBetween(asISODate('2026-09-11'), asISODate('2026-09-11'))).toBe(0);
  });

  it('rejects malformed and impossible dates', () => {
    expect(isValidISODate('2026-09-11')).toBe(true);
    expect(isValidISODate('2026-9-11')).toBe(false);
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('not a date')).toBe(false);
  });
});
