import { afterEach, describe, expect, it } from 'vitest';
import { buildAuthHeaders, getAuthToken, setAuthToken } from './authToken';

describe('authToken', () => {
  afterEach(() => {
    setAuthToken(null);
  });

  it('starts with a null token', () => {
    expect(getAuthToken()).toBeNull();
    expect(buildAuthHeaders()).toEqual({});
  });

  it('stores the token and builds the Bearer header', () => {
    setAuthToken('abc');
    expect(getAuthToken()).toBe('abc');
    expect(buildAuthHeaders()).toEqual({ Authorization: 'Bearer abc' });
  });

  it('clears the token and the header', () => {
    setAuthToken('abc');
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
    expect(buildAuthHeaders()).toEqual({});
  });
});
