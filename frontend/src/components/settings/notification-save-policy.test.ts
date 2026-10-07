import { expect, it } from 'vitest';
import { needsPreferenceSave } from './notification-save-policy';
it('queues a reversal while an older change is still in flight', () => {
  expect(needsPreferenceSave('on', 'on', 'off')).toBe(true);
});
it('skips an unchanged preference when no different write is pending', () => {
  expect(needsPreferenceSave('on', 'on', 'on')).toBe(false);
});
it('retries a failed write that never reached the saved value', () => {
  expect(needsPreferenceSave('off', 'on', 'off')).toBe(true);
});
