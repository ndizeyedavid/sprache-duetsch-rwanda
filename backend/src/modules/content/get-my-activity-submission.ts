import {
loadStudentAccessProfile
} from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
export const getMyActivitySubmission = async (userId: string, activityId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  return prisma.activitySubmission.findUnique({ where: { activityId_studentId: { activityId, studentId: profile.studentId } } });
};
