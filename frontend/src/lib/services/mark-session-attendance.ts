import { apiPost } from '.././api';
export function markSessionAttendance(
  id: string,
  records: { studentId: string; status: string; note?: string | null; expectedUpdatedAt?: string | null }[],
): Promise<unknown> {
  return apiPost(`/sessions/${id}/attendance`, { records });
}
