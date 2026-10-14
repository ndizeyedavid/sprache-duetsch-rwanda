import type { ApplicationSource,ApplicationStatus,Prisma,Shift } from "../../generated/prisma/client.js";
import { logger } from "../../lib/logger.js";
import type { DeliveryMail } from "../../lib/notification-delivery.js";
import { notifyUsers } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import { transact } from "../../lib/transactions.js";
import { assertApplicationChoices } from "./application-choices.js";
import type { ApplicantMailContext } from "./application-mail.js";
import { applicationReceivedMail,queueApplicantMail } from "./application-mail.js";
import { OPEN_APPLICATION_STATUSES } from "./application-policy.js";
import { generateApplicationReference } from "./application-reference.js";

export interface ApplicationDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  levelId?: string | null;
  intakeId?: string | null;
  campusId?: string | null;
  shift?: Shift | null;
  experience?: string | null;
  message?: string | null;
  source: ApplicationSource;
  rawPayload?: Prisma.InputJsonValue;
}

export interface SubmitResult {
  id: string;
  reference: string;
  status: ApplicationStatus;
  created: boolean;
}

const mailContextInclude = { level: { select: { title: true } }, intake: { select: { name: true } } } as const;

/**
 * Save an application once. The same email + level + intake with an open application returns
 * the existing reference instead of a new row, so repeat submissions never re-send email.
 */
export async function submitApplication(
  draft: ApplicationDraft,
  buildMail: (context: ApplicantMailContext) => DeliveryMail = applicationReceivedMail,
): Promise<SubmitResult> {
  const email = draft.email.trim().toLowerCase();
  const levelId = draft.levelId ?? null;
  const intakeId = draft.intakeId ?? null;

  const result = await transact(async (tx) => {
    await assertApplicationChoices(tx, { levelId, intakeId, campusId: draft.campusId });
    const existing = await tx.application.findFirst({
      where: { email, levelId, intakeId, status: { in: OPEN_APPLICATION_STATUSES } },
      orderBy: { createdAt: "desc" },
      include: mailContextInclude,
    });
    if (existing) return { application: existing, created: false };
    const reference = await generateApplicationReference(tx);
    const application = await tx.application.create({
      data: {
        reference, email, levelId, intakeId,
        firstName: draft.firstName.trim(), lastName: draft.lastName.trim(),
        phone: draft.phone?.trim() || null, campusId: draft.campusId ?? null, shift: draft.shift ?? null,
        experience: draft.experience?.trim() || null, message: draft.message?.trim() || null,
        source: draft.source, rawPayload: draft.rawPayload,
      },
      include: mailContextInclude,
    });
    return { application, created: true };
  });

  const { application, created } = result;
  if (created) {
    await queueApplicantMail(application, buildMail({
      id: application.id, reference: application.reference, firstName: application.firstName, email: application.email,
      levelTitle: application.level?.title, intakeName: application.intake?.name,
    }), "received");
    await notifyAdmissionsTeam(application);
  }
  return { id: application.id, reference: application.reference, status: application.status, created };
}

/** In-app alert (plus email per each admin's preferences) for academic and super admins. */
async function notifyAdmissionsTeam(application: {
  id: string; reference: string; firstName: string; lastName: string; source: ApplicationSource; level: { title: string } | null;
}): Promise<void> {
  try {
    const admins = await prisma.user.findMany({ where: { role: { in: ADMIN_ROLES }, status: "ACTIVE" }, select: { id: true } });
    if (admins.length === 0) return;
    await notifyUsers(admins.map((admin) => admin.id), {
      type: "SYSTEM",
      title: `New application ${application.reference}`,
      body: `${application.firstName} ${application.lastName} applied for ${application.level?.title ?? "a course"} (${application.source.toLowerCase()}). Review it in Admissions.`,
      data: { kind: "application", applicationId: application.id, reference: application.reference, link: "/admin/applications" },
      eventKey: `application-new:${application.id}`,
    });
  } catch (error) {
    logger.error({ error, applicationId: application.id }, "Admissions team notification failed");
  }
}
