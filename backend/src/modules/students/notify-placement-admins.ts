import { logger } from "../../lib/logger.js";
import { notifyUsers } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { ADMIN_ROLES } from "../../lib/roles.js";

/** Tell academic admins a placement result is waiting for their decision. Never fails the caller. */
export const notifyPlacementAdmins = async (input: {
  resultId: string;
  studentId: string;
  studentName: string;
  score: number;
  recommendedCode: string;
}) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ADMIN_ROLES }, status: "ACTIVE" },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await notifyUsers(admins.map((admin) => admin.id), {
      type: "EXAM",
      title: "Placement test completed",
      body: `${input.studentName} scored ${input.score}% on the placement test. Recommended level: ${input.recommendedCode}. Confirm or override it in Students.`,
      data: { kind: "PLACEMENT_RESULT", studentId: input.studentId, placementResultId: input.resultId },
      eventKey: `placement-result:${input.resultId}`,
    });
  } catch (error) {
    logger.warn({ err: error, resultId: input.resultId }, "Placement admin notification failed");
  }
};
