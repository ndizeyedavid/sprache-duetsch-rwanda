import { describe,expect,it } from 'vitest';
import { intakePhase,isRegistrationOpen,matchesRegistration } from './utils';

const now = new Date('2026-10-18T12:00:00Z');
const day = (offset: number) => new Date(now.getTime() + offset * 86_400_000).toISOString();
const intake = (patch = {}) => ({ isActive: true, registrationOpen: true, startDate: day(10), endDate: day(100), ...patch });

describe('intake registration', () => {
  it('is open only while switched on, live and not ended', () => {
    expect(isRegistrationOpen(intake(), now)).toBe(true);
    expect(isRegistrationOpen(intake({ startDate: day(-5) }), now)).toBe(true);
    expect(isRegistrationOpen(intake({ registrationOpen: false }), now)).toBe(false);
    expect(isRegistrationOpen(intake({ isActive: false }), now)).toBe(false);
    expect(isRegistrationOpen(intake({ startDate: day(-50), endDate: day(-1) }), now)).toBe(false);
  });

  it('filters archived intakes apart from open and closed ones', () => {
    expect(matchesRegistration(intake({ isActive: false }), 'Archived')).toBe(true);
    expect(matchesRegistration(intake({ isActive: false }), 'Closed')).toBe(false);
    expect(matchesRegistration(intake({ registrationOpen: false }), 'Closed')).toBe(true);
  });

  it('derives the phase from the dates only', () => {
    expect(intakePhase(intake(), now)).toBe('Upcoming');
    expect(intakePhase(intake({ startDate: day(-1) }), now)).toBe('Running');
    expect(intakePhase(intake({ startDate: day(-9), endDate: day(-1) }), now)).toBe('Ended');
  });
});
