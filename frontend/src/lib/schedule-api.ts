import { apiGet } from './api';
import type { SessionItem } from './services';
async function getAllSessions(path: string): Promise<SessionItem[]> {
  const rows: SessionItem[] = [];
  for (let page = 1; ; page++) {
    const batch = await apiGet<SessionItem[]>(`${path}${path.includes('?') ? '&' : '?'}pageSize=100&page=${page}`);
    rows.push(...batch);
    if (batch.length < 100) return rows;
  }
}
export function getStudentSchedule() { return getAllSessions('/sessions/me?scope=all'); }
export function getTeacherSchedule() { return getAllSessions('/sessions'); }
