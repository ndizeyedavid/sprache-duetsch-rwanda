import { describe,expect,it } from 'vitest';
import { hoursBetween,median,summariseBacklog } from './backlog-math.js';
import { missingHomeworkCount } from './missing-homework.js';
import { addStatus,emptyCounts,withRates } from './retention-math.js';
import type { RiskSignals } from './risk-policy.js';
import { averagePercent,daysBetween,riskLevel,riskReasons,toPercent } from './risk-policy.js';

const calm: RiskSignals = { attendanceRate: 90, attendanceThreshold: 75, averageScore: 80, missingHomework: 0, daysInactive: 1, neverActive: false, inactivityDays: 14 };

describe('risk scoring', () => {
  it('has no reasons and no level for a student on track', () => {
    expect(riskReasons(calm)).toEqual([]);
    expect(riskLevel([])).toBeNull();
  });
  it('maps each signal to a reason with severity', () => {
    const codes = riskReasons({ ...calm, attendanceRate: 50, averageScore: 40, missingHomework: 3, daysInactive: 30, overdueFees: true });
    expect(codes.map(r => [r.code, r.severity])).toEqual([
      ['LOW_ATTENDANCE', 'HIGH'], ['LOW_SCORE', 'MEDIUM'], ['MISSING_HOMEWORK', 'HIGH'], ['INACTIVE', 'HIGH'], ['OVERDUE_FEES', 'MEDIUM'],
    ]);
  });
  it('uses the resolved attendance threshold, not a fixed one', () => {
    expect(riskReasons({ ...calm, attendanceRate: 85, attendanceThreshold: 90 })[0]).toMatchObject({ code: 'LOW_ATTENDANCE', severity: 'MEDIUM', threshold: 90 });
    expect(riskReasons({ ...calm, attendanceRate: null })).toEqual([]);
  });
  it('rates one medium reason MEDIUM and anything heavier HIGH', () => {
    expect(riskLevel(riskReasons({ ...calm, missingHomework: 1 }))).toBe('MEDIUM');
    expect(riskLevel(riskReasons({ ...calm, missingHomework: 1, averageScore: 45 }))).toBe('HIGH');
    expect(riskLevel(riskReasons({ ...calm, averageScore: 20 }))).toBe('HIGH');
  });
  it('never adds a fee reason unless the caller passes it', () => {
    expect(riskReasons({ ...calm, overdueFees: false })).toEqual([]);
    expect(riskReasons(calm).some(r => r.code === 'OVERDUE_FEES')).toBe(false);
  });
  it('labels students who never started', () => {
    expect(riskReasons({ ...calm, daysInactive: 20, neverActive: true })[0].label).toBe('No activity since enrolment (20 days)');
  });
  it('has safe numeric helpers', () => {
    expect(daysBetween(new Date('2026-10-01T00:00:00Z'), new Date('2026-10-11T12:00:00Z'))).toBe(10);
    expect(daysBetween(new Date('2026-10-12'), new Date('2026-10-11'))).toBe(0);
    expect(averagePercent([])).toBeNull();
    expect(averagePercent([40, 50, 61])).toBe(50.33);
    expect(toPercent(5, 0)).toBeNull();
    expect(toPercent(7, 10)).toBe(70);
  });
});

describe('missing homework', () => {
  const now = new Date('2026-10-11T12:00:00Z');
  const enrolled = new Date('2026-09-01');
  const base = { classGroupId: 'c1', dueAt: new Date('2026-10-05'), recipientIds: [], submittedIds: [], extensions: [] };
  it('counts past-due work that was never submitted', () => {
    expect(missingHomeworkCount([base, { ...base, submittedIds: ['s1'] }], 's1', 'c1', enrolled, now)).toBe(1);
  });
  it('ignores other classes, other recipients, pre-enrolment work and live extensions', () => {
    const rows = [
      { ...base, classGroupId: 'c2' },
      { ...base, recipientIds: ['s2'] },
      { ...base, dueAt: new Date('2026-08-01') },
      { ...base, extensions: [{ studentId: 's1', dueAt: new Date('2026-10-20') }] },
    ];
    expect(missingHomeworkCount(rows, 's1', 'c1', enrolled, now)).toBe(0);
    expect(missingHomeworkCount([{ ...base, extensions: [{ studentId: 's1', dueAt: new Date('2026-10-08') }] }], 's1', 'c1', enrolled, now)).toBe(1);
  });
});

describe('retention math', () => {
  it('computes retention and completion from status counts', () => {
    const counts = emptyCounts();
    addStatus(counts, 'ACTIVE', 6); addStatus(counts, 'COMPLETED', 2); addStatus(counts, 'WITHDRAWN', 1); addStatus(counts, 'DEFERRED', 1);
    expect(withRates(counts)).toEqual({ enrolled: 10, active: 6, completed: 2, withdrawn: 1, deferred: 1, retentionRate: 90, completionRate: 20 });
  });
  it('returns null rates when nobody is enrolled', () => {
    expect(withRates(emptyCounts())).toMatchObject({ retentionRate: null, completionRate: null });
  });
  it('rounds to two decimals', () => {
    const counts = addStatus(addStatus(emptyCounts(), 'ACTIVE', 2), 'WITHDRAWN', 1);
    expect(withRates(counts).retentionRate).toBe(66.67);
  });
});

describe('grading backlog math', () => {
  const now = new Date('2026-10-11T12:00:00Z');
  it('takes the median of even and odd lists', () => {
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([1, 2, 3, 10])).toBe(2.5);
  });
  it('reports the oldest waiting item and turnaround', () => {
    const summary = summariseBacklog([new Date('2026-10-10T12:00:00Z'), null, new Date('2026-10-09T12:00:00Z')], [
      { submittedAt: new Date('2026-10-01T00:00:00Z'), gradedAt: new Date('2026-10-01T06:00:00Z') },
      { submittedAt: new Date('2026-10-02T00:00:00Z'), gradedAt: new Date('2026-10-03T00:00:00Z') },
      { submittedAt: null, gradedAt: new Date('2026-10-03T00:00:00Z') },
    ], now);
    expect(summary).toEqual({ oldestSubmittedAt: new Date('2026-10-09T12:00:00Z'), oldestWaitingHours: 48, medianTurnaroundHours: 15, gradedLast30Days: 2 });
  });
  it('is empty-safe', () => {
    expect(summariseBacklog([], [], now)).toEqual({ oldestSubmittedAt: null, oldestWaitingHours: null, medianTurnaroundHours: null, gradedLast30Days: 0 });
    expect(hoursBetween(now, new Date('2026-10-10'))).toBe(0);
  });
});
