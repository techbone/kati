/**
 * All date handling funnels through here so the whole app agrees on one rule:
 * a due date is a CALENDAR date in the device's local timezone, never a UTC instant.
 * Getting this wrong shifts a dose by a day near midnight, which is exactly the
 * class of bug this app cannot afford.
 */
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

import { asISODate, type ISODate } from '@/contracts';

/** Formats a Date as a local calendar date. */
export function toISODate(date: Date): ISODate {
  return asISODate(format(date, 'yyyy-MM-dd'));
}

/** Parses `YYYY-MM-DD` as local midnight, not UTC midnight. */
export function fromISODate(value: ISODate): Date {
  return parseISO(value);
}

export function addDaysToISODate(value: ISODate, days: number): ISODate {
  return toISODate(addDays(fromISODate(value), days));
}

/** Whole calendar days from `from` to `to`. Negative when `to` is earlier. */
export function daysBetween(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(fromISODate(to), fromISODate(from));
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parseISO(value);
  return !Number.isNaN(parsed.getTime()) && format(parsed, 'yyyy-MM-dd') === value;
}
