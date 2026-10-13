import { describe, it, expect } from 'vitest';
import { ApiError } from '@/api/auth.api';
import { apiErrorMessage } from './apiErrorMessage';

const FALLBACK = 'No pudimos cargar los datos.';

describe('apiErrorMessage', () => {
  it('returns the message of a plain Error', () => {
    expect(apiErrorMessage(new Error('boom'), FALLBACK)).toBe('boom');
  });

  it('returns the backend message of an ApiError', () => {
    expect(apiErrorMessage(new ApiError('Producto no encontrado', 404), FALLBACK)).toBe(
      'Producto no encontrado',
    );
  });

  it('falls back when the Error message is empty or whitespace', () => {
    expect(apiErrorMessage(new Error(''), FALLBACK)).toBe(FALLBACK);
    expect(apiErrorMessage(new Error('   '), FALLBACK)).toBe(FALLBACK);
  });

  it('falls back for non-Error values', () => {
    expect(apiErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
    expect(apiErrorMessage(null, FALLBACK)).toBe(FALLBACK);
    expect(apiErrorMessage('un string', FALLBACK)).toBe(FALLBACK);
    expect(apiErrorMessage({ message: 'objeto' }, FALLBACK)).toBe(FALLBACK);
  });
});
