import {
loadStudentAccessProfile
} from "../../lib/access.js";
import { getSkillProfile } from './get-skill-profile.js';
export const getMySkillProfile = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  return getSkillProfile(profile.studentId);
};
