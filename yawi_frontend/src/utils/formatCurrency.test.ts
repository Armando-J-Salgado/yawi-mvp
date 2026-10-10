import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats integers with two decimals', () => {
    expect(formatCurrency(120)).toBe('$120.00 USD');
  });

  it('formats decimals', () => {
    expect(formatCurrency(95.5)).toBe('$95.50 USD');
  });

  it('rounds to two decimals', () => {
    expect(formatCurrency(10.999)).toBe('$11.00 USD');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00 USD');
  });

  it('falls back to 0 on non-finite input', () => {
    expect(formatCurrency(Number.NaN)).toBe('$0.00 USD');
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe('$0.00 USD');
  });

  it('supports an explicit currency', () => {
    expect(formatCurrency(5, 'EUR')).toBe('$5.00 EUR');
  });
});
