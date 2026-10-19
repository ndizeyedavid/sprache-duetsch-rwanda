import { describe,expect,it } from 'vitest';
import { assertActiveSession,enforcesSingleDevice } from './single-device-policy.js';

describe('single-device sessions', () => {
  it('applies to students only', () => {
    expect(enforcesSingleDevice('STUDENT')).toBe(true);
    for (const role of ['TEACHER', 'ACADEMIC_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'] as const) {
      expect(enforcesSingleDevice(role)).toBe(false);
    }
  });

  it('accepts the student token from the active session', () => {
    expect(() => assertActiveSession({ role: 'STUDENT', activeSessionId: 'a' }, 'a')).not.toThrow();
  });

  it('rejects a student token from a replaced device with a dedicated code', () => {
    expect(() => assertActiveSession({ role: 'STUDENT', activeSessionId: 'b' }, 'a')).toThrow(
      expect.objectContaining({ statusCode: 401, code: 'SESSION_REPLACED' }),
    );
  });

  it('rejects student tokens once the account has signed out', () => {
    expect(() => assertActiveSession({ role: 'STUDENT', activeSessionId: null }, 'a')).toThrow(
      expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }),
    );
    expect(() => assertActiveSession({ role: 'STUDENT', activeSessionId: null }, undefined)).toThrow();
  });

  it('never restricts staff, even with stale session ids', () => {
    expect(() => assertActiveSession({ role: 'TEACHER', activeSessionId: 'b' }, 'a')).not.toThrow();
    expect(() => assertActiveSession({ role: 'SUPER_ADMIN', activeSessionId: null }, undefined)).not.toThrow();
  });
});
