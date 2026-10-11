import { describe, it, expect } from 'vitest';
import { DEFAULT_SHIPPING_FEE, estimateOrderTotal } from './checkoutTotals';

describe('checkoutTotals', () => {
  it('exposes the fixed MVP shipping fee matching the backend', () => {
    expect(DEFAULT_SHIPPING_FEE).toBe(10);
  });

  it('adds the fixed shipping fee to the subtotal', () => {
    expect(estimateOrderTotal(29)).toBe(39);
    expect(estimateOrderTotal(29, 10)).toBe(39);
  });

  it('rounds to two decimals', () => {
    expect(estimateOrderTotal(12.5)).toBe(22.5);
    expect(estimateOrderTotal(0.1 + 0.2)).toBe(10.3);
  });

  it('falls back to 0 for non-finite input', () => {
    expect(estimateOrderTotal(Number.NaN)).toBe(10);
    expect(estimateOrderTotal(10, Number.POSITIVE_INFINITY)).toBe(10);
  });
});
