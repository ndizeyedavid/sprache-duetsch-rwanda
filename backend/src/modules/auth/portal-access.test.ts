import { describe,expect,it } from 'vitest';
import { portalAcceptsRole } from './portal-access.js';

describe('portal role access', () => {
  it('allows only students in the student portal', () => {
    expect(portalAcceptsRole('student', 'STUDENT')).toBe(true);
    expect(portalAcceptsRole('student', 'TEACHER')).toBe(false);
  });

  it('allows only teachers in the teacher portal', () => {
    expect(portalAcceptsRole('teacher', 'TEACHER')).toBe(true);
    expect(portalAcceptsRole('teacher', 'ACADEMIC_ADMIN')).toBe(false);
  });

  it('allows administrative roles in the staff portal', () => {
    expect(portalAcceptsRole('staff', 'ACADEMIC_ADMIN')).toBe(true);
    expect(portalAcceptsRole('staff', 'FINANCE_ADMIN')).toBe(true);
    expect(portalAcceptsRole('staff', 'SUPER_ADMIN')).toBe(true);
    expect(portalAcceptsRole('staff', 'TEACHER')).toBe(false);
  });
});
