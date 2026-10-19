import { describe,expect,it } from 'vitest';
import { RETRY_DELAYS_MS,retryUrl } from './useRetryingImage';

describe('retryUrl', () => {
  it('keeps the original URL first, then busts caches per attempt', () => {
    expect(retryUrl('/assets/auth-image-abc.webp', 0)).toBe('/assets/auth-image-abc.webp');
    expect(retryUrl('/assets/auth-image-abc.webp', 2)).toBe('/assets/auth-image-abc.webp?retry=2');
    expect(retryUrl('/a.webp?v=1', 1)).toBe('/a.webp?v=1&retry=1');
  });
  it('keeps trying for over a minute in total', () => {
    expect(RETRY_DELAYS_MS.reduce((a, b) => a + b, 0)).toBeGreaterThan(60_000);
  });
});
