import { describe, expect, it } from 'vitest';
import { haversineMiles, isValidCoordinate } from './geo';

describe('haversineMiles', () => {
  it('is zero for the same point', () => {
    expect(haversineMiles({ lat: 34.05, lon: -118.24 }, { lat: 34.05, lon: -118.24 })).toBe(0);
  });

  it('is symmetric', () => {
    const a = { lat: 34.0522, lon: -118.2437 };
    const b = { lat: 33.6846, lon: -117.8265 };
    expect(haversineMiles(a, b)).toBeCloseTo(haversineMiles(b, a), 9);
  });

  it('matches a known distance: downtown LA to Irvine is about 35 miles', () => {
    const miles = haversineMiles(
      { lat: 34.0522, lon: -118.2437 },
      { lat: 33.6846, lon: -117.8265 },
    );
    expect(miles).toBeGreaterThan(33);
    expect(miles).toBeLessThan(37);
  });
});

describe('isValidCoordinate', () => {
  it('accepts points inside the range, including the edges', () => {
    expect(isValidCoordinate(34.05, -118.24)).toBe(true);
    expect(isValidCoordinate(90, 180)).toBe(true);
    expect(isValidCoordinate(-90, -180)).toBe(true);
  });

  it('rejects out-of-range and non-finite values', () => {
    expect(isValidCoordinate(90.1, 0)).toBe(false);
    expect(isValidCoordinate(0, -180.1)).toBe(false);
    expect(isValidCoordinate(Number.NaN, 0)).toBe(false);
    expect(isValidCoordinate(0, Number.POSITIVE_INFINITY)).toBe(false);
  });
});
