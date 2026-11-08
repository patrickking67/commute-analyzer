import { describe, expect, it } from 'vitest';
import {
  HOURLY_TRAFFIC,
  baseSpeedMph,
  commuteBand,
  commuteCost,
  dayProfile,
  estimateCommute,
  isHour,
  rankNeighborhoods,
  trafficMultiplier,
} from './commute';
import { haversineMiles, isValidCoordinate } from './geo';
import { formatHour, shortHour } from './time';
import type { Neighborhood, Place } from './types';
import { NEIGHBORHOODS } from '../data/neighborhoods';
import { OFFICES } from '../data/offices';

const downtown: Place = { name: 'Downtown', lat: 34.05, lon: -118.25 };
// 0.1 degrees of latitude is about 6.9 miles.
const north: Place = { name: 'North', lat: 34.15, lon: -118.25 };

const area = (name: string, lat: number, lon: number): Neighborhood => ({
  name,
  lat,
  lon,
  rent: '$$',
  safety: 'B',
  walkability: 'B',
  nightlife: 'B',
  amenities: [],
  zillowUrl: 'https://example.com',
});

describe('haversineMiles', () => {
  it('is zero for the same point', () => {
    expect(haversineMiles(downtown, downtown)).toBe(0);
  });

  it('matches a known distance', () => {
    expect(haversineMiles(downtown, north)).toBeCloseTo(6.91, 1);
  });

  it('is symmetric', () => {
    expect(haversineMiles(downtown, north)).toBeCloseTo(haversineMiles(north, downtown), 10);
  });
});

describe('isValidCoordinate', () => {
  it('accepts real coordinates and rejects bad ones', () => {
    expect(isValidCoordinate(34.05, -118.25)).toBe(true);
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(0, -181)).toBe(false);
    expect(isValidCoordinate(Number.NaN, 0)).toBe(false);
  });
});

describe('trafficMultiplier', () => {
  it('has a value for every hour', () => {
    expect(HOURLY_TRAFFIC).toHaveLength(24);
  });

  it('keeps the original peak values', () => {
    expect(trafficMultiplier(8, 'weekday')).toBe(1.8);
    expect(trafficMultiplier(17, 'weekday')).toBe(1.8);
    expect(trafficMultiplier(13, 'weekday')).toBe(1.1);
  });

  it('responds to the chosen hour', () => {
    // Regression: the time picker used "5:00 PM" style values while the
    // multiplier table was keyed "5pm", so most hours fell back to 1.2.
    expect(trafficMultiplier(17, 'weekday')).toBeGreaterThan(trafficMultiplier(13, 'weekday'));
    expect(trafficMultiplier(3, 'weekday')).toBeLessThan(trafficMultiplier(8, 'weekday'));
  });

  it('applies the weekend discount', () => {
    expect(trafficMultiplier(8, 'weekend')).toBeCloseTo(1.8 * 0.7, 10);
  });

  it('rejects hours outside 0 to 23', () => {
    expect(() => trafficMultiplier(24, 'weekday')).toThrow(RangeError);
    expect(() => trafficMultiplier(-1, 'weekday')).toThrow(RangeError);
    expect(() => trafficMultiplier(8.5, 'weekday')).toThrow(RangeError);
  });
});

describe('isHour', () => {
  it('accepts integers 0 to 23 only', () => {
    expect(isHour(0)).toBe(true);
    expect(isHour(23)).toBe(true);
    expect(isHour(24)).toBe(false);
    expect(isHour('8')).toBe(false);
  });
});

describe('baseSpeedMph', () => {
  it('rises with trip length', () => {
    expect(baseSpeedMph(2)).toBe(25);
    expect(baseSpeedMph(5)).toBe(30);
    expect(baseSpeedMph(10)).toBe(35);
    expect(baseSpeedMph(20)).toBe(40);
  });
});

describe('estimateCommute', () => {
  it('is zero minutes for the same place', () => {
    expect(estimateCommute(downtown, downtown, 8, 'weekday')).toEqual({ minutes: 0, miles: 0 });
  });

  it('computes time from distance, speed and traffic', () => {
    // 6.91 mi at 30 mph is 13.8 min free flow; 8 AM weekday is x1.8.
    expect(estimateCommute(north, downtown, 8, 'weekday')).toEqual({ minutes: 25, miles: 6.9 });
    // Same trip at 3 AM is x1.0.
    expect(estimateCommute(north, downtown, 3, 'weekday').minutes).toBe(14);
  });

  it('is shorter on the weekend', () => {
    const weekday = estimateCommute(north, downtown, 8, 'weekday').minutes;
    const weekend = estimateCommute(north, downtown, 8, 'weekend').minutes;
    expect(weekend).toBeLessThan(weekday);
  });
});

describe('commuteCost', () => {
  it('prices a round trip on 20 workdays', () => {
    // 10 mi each way: 400 mi a month / 25 mpg * $5.50 = $88.
    expect(commuteCost(10)).toEqual({ monthly: 88, annual: 1056 });
  });

  it('is zero for zero distance', () => {
    expect(commuteCost(0)).toEqual({ monthly: 0, annual: 0 });
  });
});

describe('commuteBand', () => {
  it('maps minutes to bands at the edges', () => {
    expect(commuteBand(0).id).toBe('quick');
    expect(commuteBand(15).id).toBe('quick');
    expect(commuteBand(16).id).toBe('easy');
    expect(commuteBand(45).id).toBe('long');
    expect(commuteBand(60).id).toBe('very-long');
    expect(commuteBand(61).id).toBe('extreme');
  });
});

describe('rankNeighborhoods', () => {
  const areas = [area('Far', 34.35, -118.25), area('Near', 34.06, -118.25), area('Mid', 34.15, -118.25)];

  it('sorts shortest first by default', () => {
    const names = rankNeighborhoods(areas, downtown, 8, 'weekday').map((r) => r.area.name);
    expect(names).toEqual(['Near', 'Mid', 'Far']);
  });

  it('sorts longest first on request', () => {
    const names = rankNeighborhoods(areas, downtown, 8, 'weekday', 'desc').map((r) => r.area.name);
    expect(names).toEqual(['Far', 'Mid', 'Near']);
  });

  it('breaks ties by name', () => {
    const twins = [area('B', 34.06, -118.25), area('A', 34.06, -118.25)];
    expect(rankNeighborhoods(twins, downtown, 8, 'weekday').map((r) => r.area.name)).toEqual(['A', 'B']);
  });

  it('attaches the gas cost for each area', () => {
    const [first] = rankNeighborhoods(areas, downtown, 8, 'weekday');
    expect(first.cost).toEqual(commuteCost(first.miles));
  });

  it('does not reorder the input', () => {
    const input = [...areas];
    rankNeighborhoods(input, downtown, 8, 'weekday');
    expect(input.map((a) => a.name)).toEqual(['Far', 'Near', 'Mid']);
  });
});

describe('dayProfile', () => {
  it('returns 24 hourly estimates that peak at rush hour', () => {
    const profile = dayProfile(north, downtown, 'weekday');
    expect(profile).toHaveLength(24);
    expect(Math.max(...profile)).toBe(profile[8]);
    expect(profile[3]).toBeLessThan(profile[8]);
  });
});

describe('time formatting', () => {
  it('formats hours for display', () => {
    expect(formatHour(0)).toBe('12:00 AM');
    expect(formatHour(12)).toBe('12:00 PM');
    expect(formatHour(17)).toBe('5:00 PM');
    expect(shortHour(0)).toBe('12a');
    expect(shortHour(15)).toBe('3p');
  });
});

describe('data', () => {
  it('has valid coordinates and unique names', () => {
    for (const list of [OFFICES, NEIGHBORHOODS]) {
      const names = list.map((p) => p.name);
      expect(new Set(names).size).toBe(names.length);
      for (const p of list) expect(isValidCoordinate(p.lat, p.lon)).toBe(true);
    }
  });

  it('keeps every neighborhood in the Los Angeles region', () => {
    for (const n of NEIGHBORHOODS) {
      expect(n.lat).toBeGreaterThan(33.5);
      expect(n.lat).toBeLessThan(34.4);
      expect(n.lon).toBeGreaterThan(-118.8);
      expect(n.lon).toBeLessThan(-117.7);
    }
  });
});
