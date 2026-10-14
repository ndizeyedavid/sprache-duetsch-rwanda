import {
loadStudentAccessProfile
} from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
import { presentSubmission } from "./activity-review.js";
export const getMyActivitySubmission = async (userId: string, activityId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  const submission = await prisma.activitySubmission.findUnique({
    where: { activityId_studentId: { activityId, studentId: profile.studentId } },
    include: { activity: { select: { type: true, config: true } } },
  });
  if (!submission) return null;
  const { activity, ...rest } = submission;
  return presentSubmission(rest, activity);
};
