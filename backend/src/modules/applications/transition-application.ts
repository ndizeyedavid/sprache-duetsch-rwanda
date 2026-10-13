import type { ApplicationStatus } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { transact } from "../../lib/transactions.js";
import { applicationDecisionMail,queueApplicantMail } from "./application-mail.js";
import { APPLICANT_NOTIFIED_STATUSES,assertTransition } from "./application-policy.js";
import type { ApplicationWithRelations } from "./application-select.js";
import { applicationListInclude } from "./application-select.js";
import type { TransitionApplicationInput } from "./applications.schema.js";

/** Move an application one step along the pipeline; every change is audited with its reason. */
export const transitionApplication = async (id: string, input: TransitionApplicationInput, actorId?: string) => {
  const application = await transact(async (tx) => {
    const before = await tx.application.findUnique({ where: { id } });
    if (!before) throw notFound("Application not found");
    assertTransition(before.status, input.status, {
      studentLinked: Boolean(before.studentId), courseChosen: Boolean(before.levelId && before.intakeId), reason: input.reason,
    });
    const now = new Date();
    const after = await tx.application.update({
      where: { id },
      data: {
        status: input.status,
        decisionReason: input.reason ?? null,
        reviewedById: actorId ?? null,
        reviewedAt: now,
        waitlistedAt: input.status === "WAITLISTED" ? now : before.waitlistedAt,
      },
      include: applicationListInclude,
    });
    await writeAuditTx(tx, {
      actorId, action: "APPLICATION_STATUS_CHANGED", entityType: "Application", entityId: id,
      before: { status: before.status }, after: { status: after.status }, reason: input.reason,
    });
    return after;
  });

  if (APPLICANT_NOTIFIED_STATUSES.includes(input.status)) await notifyApplicant(application, input.status);
  return application;
};

/** Account holders get it in-app (and by email per their settings); everyone else by email. */
async function notifyApplicant(application: ApplicationWithRelations, status: ApplicationStatus) {
  const mail = applicationDecisionMail({
    id: application.id, reference: application.reference, firstName: application.firstName, email: application.email,
    levelTitle: application.level?.title, intakeName: application.intake?.name,
  }, status);
  if (!mail) return;
  try {
    const userId = application.studentId ? await studentUserId(application.studentId) : null;
    if (userId) {
      await notifyUser(userId, { type: "SYSTEM", title: mail.subject, body: mail.text,
        data: { kind: "application", reference: application.reference, status }, eventKey: `application:${application.id}:${status}` });
    } else {
      await queueApplicantMail(application, mail, `status:${status}`);
    }
  } catch (error) {
    logger.error({ error, applicationId: application.id }, "Applicant decision notification failed");
  }
}

async function studentUserId(studentId: string): Promise<string | null> {
  const student = await prisma.student.findUnique({ where: { id: studentId }, select: { userId: true } });
  return student?.userId ?? null;
}
