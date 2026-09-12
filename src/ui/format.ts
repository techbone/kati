/**
 * Display formatting only. No schedule logic lives here — that's the domain's.
 */
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
  parseISO,
} from 'date-fns';

import { asISODate, type ISODate } from '@/contracts';

/** Local calendar date of a Date, as the app's ISODate. Never uses toISOString (UTC). */
export function dateToISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return asISODate(`${y}-${m}-${day}`);
}

/** Local midnight today. */
export function startOfToday(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 'Tue 23 Sep' */
export function formatDate(iso: ISODate): string {
  return format(parseISO(iso), 'EEE d MMM');
}

/** '23 September 2026' */
export function formatDateLong(iso: ISODate): string {
  return format(parseISO(iso), 'd MMMM yyyy');
}

/** Relative phrasing for a due date, from `daysUntilDue`. */
export function formatDueIn(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `In ${days} days`;
  return `${-days} days ago`;
}

/** How overdue, phrased for a pill: '3 days overdue'. */
export function formatOverdue(days: number): string {
  const n = -days;
  return n === 1 ? '1 day overdue' : `${n} days overdue`;
}

/** A child's age in the unit a parent would say it in. */
export function formatAge(birthISO: ISODate, today: Date): string {
  const birth = parseISO(birthISO);
  const days = differenceInCalendarDays(today, birth);
  if (days < 0) return 'Not born yet';
  if (days === 0) return 'Born today';
  if (days < 14) return days === 1 ? '1 day old' : `${days} days old`;
  if (days < 84) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week old' : `${weeks} weeks old`;
  }
  const months = differenceInCalendarMonths(today, birth);
  if (months < 24) return months === 1 ? '1 month old' : `${months} months old`;
  const years = differenceInCalendarYears(today, birth);
  return years === 1 ? '1 year old' : `${years} years old`;
}

export function pluralDoses(n: number): string {
  return n === 1 ? '1 dose' : `${n} doses`;
}
