import { describe,expect,it } from 'vitest';
import { canEmailNotification,mergeNotificationPreferences } from './notification-preferences.js';

describe('notification preferences', () => {
  it('fills defaults for accounts without saved preferences', () => {
    expect(mergeNotificationPreferences(null)).toEqual({ email: true, inApp: true, schedule: true, exam: true, payment: true });
  });

  it('respects topic-specific email switches', () => {
    const preferences = mergeNotificationPreferences({ schedule: false, payment: false });
    expect(canEmailNotification('SCHEDULE', preferences)).toBe(false);
    expect(canEmailNotification('PAYMENT', preferences)).toBe(false);
    expect(canEmailNotification('ASSIGNMENT', preferences)).toBe(true);
  });

  it('respects the global email switch', () => {
    expect(canEmailNotification('SYSTEM', mergeNotificationPreferences({ email: false }))).toBe(false);
  });
});
