import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateNameField,
  validateCountry,
  validateAddress,
  validateStep1,
  validateStep2,
  validateLoginForm,
} from './validation';

describe('validateEmail', () => {
  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('validation.email_required');
  });
  it('returns error for invalid format', () => {
    expect(validateEmail('notanemail')).toBe('validation.email_invalid');
  });
  it('returns null for valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });
  it('trims whitespace', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toBe('validation.password_required');
  });
  it('returns error for short password', () => {
    expect(validatePassword('abc1234')).toBe('validation.password_min_length');
  });
  it('returns null for valid password', () => {
    expect(validatePassword('securepass')).toBeNull();
  });
});

describe('validateConfirmPassword', () => {
  it('returns error for empty confirmation', () => {
    expect(validateConfirmPassword('pass1234', '')).toBe('validation.confirm_password_required');
  });
  it('returns error for mismatch', () => {
    expect(validateConfirmPassword('pass1234', 'pass5678')).toBe(
      'validation.confirm_password_mismatch',
    );
  });
  it('returns null when matches', () => {
    expect(validateConfirmPassword('pass1234', 'pass1234')).toBeNull();
  });
});

describe('validateNameField', () => {
  it('returns error for empty name', () => {
    expect(validateNameField('', 'name')).toBe('validation.name_required');
  });
  it('returns error for numbers in name', () => {
    expect(validateNameField('Juan123', 'name')).toBe('validation.name_only_letters');
  });
  it('returns error for special characters', () => {
    expect(validateNameField('J@n', 'name')).toBe('validation.name_only_letters');
  });
  it('returns error for short name (after trim)', () => {
    expect(validateNameField(' A ', 'name')).toBe('validation.name_min_length');
  });
  it('accepts accented characters and ñ', () => {
    expect(validateNameField('María José', 'name')).toBeNull();
  });
  it('works for lastname field', () => {
    expect(validateNameField('', 'lastname')).toBe('validation.lastname_required');
  });
});

describe('validateCountry', () => {
  it('returns error for empty country', () => {
    expect(validateCountry('')).toBe('validation.country_required');
  });
  it('returns null for selected country', () => {
    expect(validateCountry('SV')).toBeNull();
  });
});

describe('validateAddress', () => {
  it('returns error for empty address', () => {
    expect(validateAddress('')).toBe('validation.address_required');
  });
  it('returns error for short address', () => {
    expect(validateAddress('Calle 1')).toBe('validation.address_min_length');
  });
  it('returns null for valid address', () => {
    expect(validateAddress('Avenida Central #123, San Salvador')).toBeNull();
  });
});

describe('validateStep1', () => {
  it('returns all errors for empty data', () => {
    const errors = validateStep1({ email: '', password: '', confirmPassword: '' });
    expect(Object.keys(errors)).toHaveLength(3);
  });
  it('returns empty object for valid data', () => {
    const errors = validateStep1({
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(errors).toEqual({});
  });
});

describe('validateStep2', () => {
  it('returns all errors for empty data', () => {
    const errors = validateStep2({ name: '', lastname: '', country: '', address: '' });
    expect(Object.keys(errors)).toHaveLength(4);
  });
});

describe('validateLoginForm', () => {
  it('returns errors for empty fields', () => {
    const errors = validateLoginForm({ email: '', password: '' });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});
