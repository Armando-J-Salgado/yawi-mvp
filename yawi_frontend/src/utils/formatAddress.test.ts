import { describe, it, expect } from 'vitest';
import { formatAddress } from './formatAddress';

describe('formatAddress', () => {
  it('returns only the first segment when address has multiple commas', () => {
    expect(formatAddress('Av. Independencia #456, Centro Histórico, San Salvador')).toBe(
      'Av. Independencia #456',
    );
  });

  it('returns the full address when there are no commas', () => {
    expect(formatAddress('Calle Principal 123')).toBe('Calle Principal 123');
  });

  it('returns an empty string when given an empty string', () => {
    expect(formatAddress('')).toBe('');
  });
});
