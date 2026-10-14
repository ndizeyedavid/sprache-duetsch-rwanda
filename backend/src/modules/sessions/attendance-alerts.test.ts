import { describe,expect,it } from 'vitest';
import { alertDayKey,digestAlertKey,digestBody,staffAlertRecipients,studentAlertKey,studentsBelowThreshold } from './attendance-alert-policy.js';
import { attendanceRate,resolveAttendanceThreshold } from './attendance-threshold.js';

describe('attendance threshold resolution', () => {
  it('prefers the class, then the level, then the system default', () => {
    expect(resolveAttendanceThreshold(90, 80, 75)).toEqual({ value: 90, source: 'CLASS', inherited: 80, inheritedSource: 'LEVEL' });
    expect(resolveAttendanceThreshold(null, 80, 75)).toEqual({ value: 80, source: 'LEVEL', inherited: 80, inheritedSource: 'LEVEL' });
    expect(resolveAttendanceThreshold(undefined, null, 75)).toEqual({ value: 75, source: 'SYSTEM', inherited: 75, inheritedSource: 'SYSTEM' });
  });
  it('treats 0 as a real override, not as "unset"', () => {
    expect(resolveAttendanceThreshold(0, 80, 75).value).toBe(0);
    expect(resolveAttendanceThreshold(null, 0, 75)).toMatchObject({ value: 0, source: 'LEVEL' });
  });
  it('counts present and late as attended', () => {
    expect(attendanceRate([])).toBeNull();
    expect(attendanceRate(['PRESENT', 'LATE', 'ABSENT'])).toBe(66.67);
    expect(attendanceRate(['EXCUSED', 'ABSENT'])).toBe(0);
  });
});

describe('low-attendance alert policy', () => {
  const roster = [
    { studentId: 's1', userId: 'u1', name: 'Ana', statuses: ['PRESENT', 'ABSENT', 'ABSENT'] },
    { studentId: 's2', userId: 'u2', name: 'Ben', statuses: ['PRESENT', 'PRESENT', 'LATE', 'ABSENT'] },
    { studentId: 's3', userId: 'u3', name: 'Cleo', statuses: [] },
    { studentId: 's4', userId: 'u4', name: 'Dan', statuses: ['ABSENT'] },
  ];
  it('flags only students with records strictly below the threshold, worst first', () => {
    expect(studentsBelowThreshold(roster, 75).map(r => [r.studentId, r.percentage])).toEqual([['s4', 0], ['s1', 33.33]]);
    expect(studentsBelowThreshold(roster, 33.33).map(r => r.studentId)).toEqual(['s4']);
  });
  it('alerts the class teacher and admins once each, skipping a missing teacher', () => {
    expect(staffAlertRecipients('t1', ['a1', 'a2', 'a1'])).toEqual(['t1', 'a1', 'a2']);
    expect(staffAlertRecipients(null, ['a1'])).toEqual(['a1']);
    expect(staffAlertRecipients('t1', [])).toEqual(['t1']);
  });
  it('dedupes per class per UTC day', () => {
    const morning = alertDayKey(new Date('2026-10-11T06:00:00Z'));
    const evening = alertDayKey(new Date('2026-10-11T23:59:00Z'));
    const next = alertDayKey(new Date('2026-10-12T00:01:00Z'));
    expect(morning).toBe(evening);
    expect(morning).not.toBe(next);
    expect(digestAlertKey('c1', morning)).toBe(digestAlertKey('c1', evening));
    expect(digestAlertKey('c1', morning)).not.toBe(digestAlertKey('c2', morning));
    expect(studentAlertKey('c1', morning)).not.toBe(digestAlertKey('c1', morning));
    // Keeps the pre-existing student key format so deploy day does not double-send.
    expect(studentAlertKey('c1', morning)).toBe('attendance:c1:2026-10-11T00:00:00.000Z');
  });
  it('builds one digest listing every flagged student', () => {
    const below = studentsBelowThreshold(roster, 75);
    expect(digestBody('A1 Evening', 75, below)).toBe('2 students are below the 75% attendance threshold in A1 Evening: Dan (0%), Ana (33.33%).');
    expect(digestBody('A1', 75, below, 1)).toContain('Dan (0%) and 1 more.');
  });
});
