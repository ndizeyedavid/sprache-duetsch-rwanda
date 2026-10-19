import { describe,expect,it } from 'vitest';
import type { AtRiskRow } from '../../../lib/analytics-api';
import type { ClassGroupDetail } from '../../../lib/services/class-group-detail';
import { average,buildRoster,filterRoster } from './roster-data';

const enrol = (id: string, code: string, first: string, status = 'ACTIVE') =>
  ({ student: { id, studentCode: code, status, user: { id: `u-${id}`, firstName: first, lastName: 'X', email: `${first}@x.rw`, phone: null } } });
const enrollments = [enrol('s1', 'C-1', 'Nella'), enrol('s2', 'C-2', 'Diane', 'PENDING')] as ClassGroupDetail['enrollments'];

describe('buildRoster', () => {
  const rows = buildRoster(enrollments,
    [{ studentId: 's1', present: 3, absent: 1, late: 0, excused: 0, total: 4, percentage: 75 }],
    [{ status: 'GRADED', score: '90', maxScore: '100', student: { studentCode: 'C-1' } }, { status: 'GRADED', score: 35, maxScore: 50, student: { studentCode: 'C-1' } }, { status: 'SUBMITTED', score: null, maxScore: 10, student: { studentCode: 'C-1' } }],
    [{ student: { id: 's1' }, riskLevel: 'MEDIUM', reasons: [{ label: '2 missing homework' }], lastActivityAt: '2026-10-08T10:00:00Z' } as unknown as AtRiskRow]);
  it('merges attendance, graded average and support flags per learner', () => {
    expect(rows[0]).toMatchObject({ attendance: { percentage: 75, total: 4 }, score: 80, graded: 2, risk: { level: 'MEDIUM', reasons: ['2 missing homework'] } });
    expect(rows[1]).toMatchObject({ attendance: null, score: null, risk: null });
  });
  it('filters by status / support and sorts weakest first', () => {
    expect(filterRoster(rows, { query: '', status: 'PENDING', support: false, sort: 'name' }).map((r) => r.code)).toEqual(['C-2']);
    expect(filterRoster(rows, { query: '', status: 'ALL', support: true, sort: 'name' }).map((r) => r.code)).toEqual(['C-1']);
    expect(filterRoster(rows, { query: 'diane', status: 'ALL', support: false, sort: 'score' }).map((r) => r.code)).toEqual(['C-2']);
  });
  it('averages only known values', () => {
    expect(average([80, null, 60])).toBe(70);
    expect(average([null])).toBeNull();
  });
});
