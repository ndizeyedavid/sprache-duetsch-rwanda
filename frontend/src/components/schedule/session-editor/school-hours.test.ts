import { describe,expect,it } from 'vitest';
import { startsInPast,withinSchoolHours } from './useSessionDraft';

describe('withinSchoolHours', () => {
  it('accepts classes inside 08:00–22:00 and rejects the rest', () => {
    expect(withinSchoolHours('08:00', '09:30')).toBe(true);
    expect(withinSchoolHours('20:30', '22:00')).toBe(true);
    expect(withinSchoolHours('07:30', '09:00')).toBe(false);
    expect(withinSchoolHours('21:00', '22:30')).toBe(false);
    expect(withinSchoolHours('10:00', '09:00')).toBe(false);
  });
});

describe('startsInPast', () => {
  const now = new Date('2026-10-18T10:00:00');
  it('refuses a start that has already passed today or earlier', () => {
    expect(startsInPast('2026-10-18', '09:30', now)).toBe(true);
    expect(startsInPast('2026-10-17', '15:00', now)).toBe(true);
    expect(startsInPast('2026-10-18', '10:00', now)).toBe(true);
  });
  it('accepts later today and future days, and ignores an empty form', () => {
    expect(startsInPast('2026-10-18', '10:30', now)).toBe(false);
    expect(startsInPast('2026-10-19', '08:00', now)).toBe(false);
    expect(startsInPast('', '', now)).toBe(false);
  });
});
