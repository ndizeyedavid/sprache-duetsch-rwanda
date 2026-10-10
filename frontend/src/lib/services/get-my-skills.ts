import { apiGet } from '.././api';
import type { SkillStat } from './skill-stat';
export function getMySkills(): Promise<SkillStat[]> {
  return apiGet<SkillStat[]>('/assessments/my/skills');
}
