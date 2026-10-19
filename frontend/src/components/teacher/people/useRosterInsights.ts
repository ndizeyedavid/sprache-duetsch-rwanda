import { useMemo } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiGet } from '../../../lib/api';
import { getAtRiskStudents } from '../../../lib/analytics-api';
import { listAttempts } from '../../../lib/services';
import type { ClassGroupDetail } from '../../../lib/services/class-group-detail';
import { buildRoster,type ClassAttendance } from './roster-data';

/** Attendance, grades and support flags for one class; the roster still renders if any of them fail. */
export function useRosterInsights(classGroupId: string, enrollments: ClassGroupDetail['enrollments']) {
  const enabled = Boolean(classGroupId);
  const attendance = useApi(`class-attendance-${classGroupId}`, () => apiGet<ClassAttendance[]>('/attendance/summary', { params: { classGroupId } }), enabled);
  const attempts = useApi(`class-attempts-${classGroupId}`, () => listAttempts(undefined, classGroupId), enabled);
  const risks = useApi(`class-risk-${classGroupId}`, () => getAtRiskStudents({ classGroupId, pageSize: 100 }), enabled);
  const roster = useMemo(() => buildRoster(enrollments, attendance.data ?? [], attempts.data ?? [], risks.data?.data ?? []),
    [enrollments, attendance.data, attempts.data, risks.data]);
  return { roster, loading: attendance.loading || attempts.loading || risks.loading };
}
