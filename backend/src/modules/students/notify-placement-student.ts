import { logger } from "../../lib/logger.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";

/** Let the student know which level the academic office confirmed. Never fails the caller. */
export const notifyPlacementStudent = async (input: { resultId: string; studentId: string; levelCode: string; levelTitle: string }) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { userId: true } });
    if (!student) return;
    await notifyUser(student.userId, {
      type: "SYSTEM",
      title: "Your level is confirmed",
      body: `The academic office placed you in ${input.levelCode} — ${input.levelTitle}. They will contact you about enrolment.`,
      data: { kind: "PLACEMENT_DECISION", placementResultId: input.resultId },
      eventKey: `placement-decision:${input.resultId}:${input.levelCode}`,
    });
  } catch (error) {
    logger.warn({ err: error, resultId: input.resultId }, "Placement student notification failed");
  }
};
