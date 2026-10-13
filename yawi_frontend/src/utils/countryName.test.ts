import { describe, it, expect } from 'vitest';
import { resolveCountryName } from './countryName';

describe('resolveCountryName', () => {
  it('converts ISO alpha-2 to official country name (es)', () => {
    expect(resolveCountryName('SV')).toBe('El Salvador');
    expect(resolveCountryName('GT')).toBe('Guatemala');
  });

  it('is case-insensitive', () => {
    expect(resolveCountryName('sv')).toBe('El Salvador');
  });

  it('supports en locale', () => {
    expect(resolveCountryName('DE', 'en')).toBe('Germany');
  });

  it('returns the original value when the code is unknown', () => {
    expect(resolveCountryName('ZZ')).toBe('ZZ');
  });

  it('returns empty string unchanged', () => {
    expect(resolveCountryName('')).toBe('');
  });
});
