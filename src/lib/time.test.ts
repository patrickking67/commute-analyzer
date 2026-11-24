import { describe, expect, it } from 'vitest';
import { formatHour, HOURS, shortHour } from './time';

describe('HOURS', () => {
  it('lists 0 through 23', () => {
    expect(HOURS).toHaveLength(24);
    expect(HOURS[0]).toBe(0);
    expect(HOURS[23]).toBe(23);
  });
});

describe('formatHour', () => {
  it('uses 12 for midnight and noon', () => {
    expect(formatHour(0)).toBe('12:00 AM');
    expect(formatHour(12)).toBe('12:00 PM');
  });

  it('converts afternoon hours', () => {
    expect(formatHour(9)).toBe('9:00 AM');
    expect(formatHour(17)).toBe('5:00 PM');
    expect(formatHour(23)).toBe('11:00 PM');
  });
});

describe('shortHour', () => {
  it('builds compact axis labels', () => {
    expect(shortHour(0)).toBe('12a');
    expect(shortHour(12)).toBe('12p');
    expect(shortHour(15)).toBe('3p');
  });
});
