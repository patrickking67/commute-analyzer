import { haversineMiles } from './geo';
import type { DayType, Hour, Neighborhood, Place } from './types';

export const GAS_PRICE_PER_GALLON = 5.5;
export const AVERAGE_MPG = 25;
export const WORKDAYS_PER_MONTH = 20;
export const WEEKEND_FACTOR = 0.7;

/**
 * Traffic multiplier per hour of the day (index 0 is midnight). The 7 AM to
 * 6 PM values are the app's original peak table; the rest are off-peak.
 */
export const HOURLY_TRAFFIC: readonly number[] = [
  1.0, 1.0, 1.0, 1.0, 1.0, 1.1, // 12 AM to 5 AM
  1.2, 1.4, 1.8, 1.6, 1.3, 1.2, // 6 AM to 11 AM
  1.2, 1.1, 1.2, 1.3, 1.6, 1.8, // 12 PM to 5 PM
  1.7, 1.4, 1.2, 1.1, 1.0, 1.0, // 6 PM to 11 PM
];

export function isHour(value: unknown): value is Hour {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 23;
}

export function trafficMultiplier(hour: Hour, day: DayType): number {
  if (!isHour(hour)) throw new RangeError(`hour must be an integer from 0 to 23, got ${hour}`);
  return HOURLY_TRAFFIC[hour] * (day === 'weekend' ? WEEKEND_FACTOR : 1);
}

/** Free-flow average speed: longer trips spend more time on freeways. */
export function baseSpeedMph(miles: number): number {
  if (miles < 5) return 25;
  if (miles < 10) return 30;
  if (miles < 20) return 35;
  return 40;
}

export type CommuteEstimate = {
  /** Estimated one-way drive time in whole minutes. */
  minutes: number;
  /** Straight-line distance in miles, one decimal. */
  miles: number;
};

export function estimateCommute(
  from: Place,
  to: Place,
  hour: Hour,
  day: DayType,
): CommuteEstimate {
  const distance = haversineMiles(from, to);
  const freeFlowMinutes = (distance / baseSpeedMph(distance)) * 60;
  return {
    minutes: Math.round(freeFlowMinutes * trafficMultiplier(hour, day)),
    miles: Math.round(distance * 10) / 10,
  };
}

export type CommuteCost = { monthly: number; annual: number };

/** Gas cost for a round trip on every workday, rounded to cents. */
export function commuteCost(oneWayMiles: number): CommuteCost {
  const monthlyMiles = oneWayMiles * 2 * WORKDAYS_PER_MONTH;
  const monthly = (monthlyMiles / AVERAGE_MPG) * GAS_PRICE_PER_GALLON;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { monthly: round(monthly), annual: round(monthly * 12) };
}

export type BandId = 'quick' | 'easy' | 'moderate' | 'long' | 'very-long' | 'extreme';

export type Band = { id: BandId; label: string; maxMinutes: number };

export const BANDS: readonly Band[] = [
  { id: 'quick', label: 'Quick', maxMinutes: 15 },
  { id: 'easy', label: 'Easy', maxMinutes: 25 },
  { id: 'moderate', label: 'Moderate', maxMinutes: 35 },
  { id: 'long', label: 'Long', maxMinutes: 45 },
  { id: 'very-long', label: 'Very long', maxMinutes: 60 },
  { id: 'extreme', label: 'Over an hour', maxMinutes: Infinity },
];

export function commuteBand(minutes: number): Band {
  return BANDS.find((band) => minutes <= band.maxMinutes) ?? BANDS[BANDS.length - 1];
}

export type RankedArea = CommuteEstimate & { area: Neighborhood; cost: CommuteCost };

export type SortOrder = 'asc' | 'desc';

/** Estimates every neighborhood and sorts by drive time, ties broken by name. */
export function rankNeighborhoods(
  areas: readonly Neighborhood[],
  destination: Place,
  hour: Hour,
  day: DayType,
  order: SortOrder = 'asc',
): RankedArea[] {
  const ranked = areas.map((area) => {
    const estimate = estimateCommute(area, destination, hour, day);
    return { ...estimate, area, cost: commuteCost(estimate.miles) };
  });
  const sign = order === 'asc' ? 1 : -1;
  return ranked.sort(
    (a, b) => sign * (a.minutes - b.minutes) || a.area.name.localeCompare(b.area.name),
  );
}

/** Drive time for every hour of the day, for the day profile chart. */
export function dayProfile(from: Place, to: Place, day: DayType): number[] {
  return HOURLY_TRAFFIC.map((_, hour) => estimateCommute(from, to, hour, day).minutes);
}
