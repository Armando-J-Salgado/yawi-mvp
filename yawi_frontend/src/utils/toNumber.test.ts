import { describe, it, expect } from 'vitest';
import { toNumber } from './toNumber';

describe('toNumber', () => {
  it('passes finite numbers through', () => {
    expect(toNumber(120)).toBe(120);
    expect(toNumber(12.5)).toBe(12.5);
    expect(toNumber(0)).toBe(0);
  });

  it('parses decimal strings returned by Postgres', () => {
    expect(toNumber('120.00')).toBe(120);
    expect(toNumber('12.50')).toBe(12.5);
  });

  it('falls back to 0 for invalid or missing values', () => {
    expect(toNumber('abc')).toBe(0);
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber(Number.NaN)).toBe(0);
    expect(toNumber(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
