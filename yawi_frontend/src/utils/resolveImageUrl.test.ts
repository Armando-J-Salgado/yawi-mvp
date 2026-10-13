import { describe, it, expect } from 'vitest';
import { resolveImageUrl } from './resolveImageUrl';

describe('resolveImageUrl', () => {
  it('returns undefined for empty input', () => {
    expect(resolveImageUrl(undefined)).toBeUndefined();
    expect(resolveImageUrl(null)).toBeUndefined();
    expect(resolveImageUrl('')).toBeUndefined();
  });

  it('keeps absolute urls intact', () => {
    expect(resolveImageUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
    expect(resolveImageUrl('http://example.com/a.jpg')).toBe('http://example.com/a.jpg');
    expect(resolveImageUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('prefixes backend /uploads paths with the API base', () => {
    const result = resolveImageUrl('/uploads/businesses/a.jpg');
    expect(result).toMatch(/^https?:\/\/.+\/uploads\/businesses\/a\.jpg$/);
  });

  it('keeps public frontend assets untouched', () => {
    expect(resolveImageUrl('/images/producto1.webp')).toBe('/images/producto1.webp');
  });
});
