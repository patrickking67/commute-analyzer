import type { Hour } from './types';

export const HOURS: readonly Hour[] = Array.from({ length: 24 }, (_, hour) => hour);

/** 0 -> "12:00 AM", 13 -> "1:00 PM". */
export function formatHour(hour: Hour): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${suffix}`;
}

/** Compact axis label: 0 -> "12a", 15 -> "3p". */
export function shortHour(hour: Hour): string {
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${hour < 12 ? 'a' : 'p'}`;
}
