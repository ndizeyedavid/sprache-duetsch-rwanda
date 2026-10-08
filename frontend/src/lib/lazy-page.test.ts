import { describe, expect, it } from 'vitest';
import { isStaleBuildError } from './lazy-page';

describe('isStaleBuildError', () => {
  it('recognises missing-chunk errors from every major browser', () => {
    expect(isStaleBuildError(new TypeError('error loading dynamically imported module: https://x/assets/Activity-CqNNummm.js'))).toBe(true);
    expect(isStaleBuildError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/a.js'))).toBe(true);
    expect(isStaleBuildError(new TypeError('Importing a module script failed.'))).toBe(true);
  });
  it('ignores ordinary page errors', () => {
    expect(isStaleBuildError(new TypeError("can't access property \"value\", x.currentTarget is null"))).toBe(false);
    expect(isStaleBuildError(new Error('Request failed with status code 500'))).toBe(false);
  });
});
