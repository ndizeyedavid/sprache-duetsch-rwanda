import { apiGet } from '.././api';
import type { SkillStat } from './skill-stat';
export function getStudentSkills(studentId: string): Promise<SkillStat[]> {
  return apiGet<SkillStat[]>(`/assessments/skills?studentId=${studentId}`);
}
