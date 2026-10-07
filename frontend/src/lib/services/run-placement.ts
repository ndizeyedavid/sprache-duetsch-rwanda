import { apiPost } from '.././api';
export function runPlacement(
  studentId: string,
  body: { score: number; recommendedLevelId?: string; note?: string },
): Promise<{ score: number; recommendedLevel: { id: string; code: string; title: string } }> {
  return apiPost(`/students/${studentId}/placement`, body);
}
