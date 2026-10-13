import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { transitionOptions } from "./application-policy.js";
import { applicationListInclude } from "./application-select.js";

/** Full record for the review drawer: allowed next steps, waitlist place and audit trail. */
export const getApplication = async (id: string) => {
  const application = await prisma.application.findUnique({ where: { id }, include: applicationListInclude });
  if (!application) throw notFound("Application not found");

  const [history, waitlistPosition] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entityType: "Application", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, action: true, before: true, after: true, reason: true, createdAt: true,
        actor: { select: { id: true, firstName: true, lastName: true } } },
    }),
    application.status === "WAITLISTED" && application.waitlistedAt
      ? prisma.application
          .count({ where: { status: "WAITLISTED", levelId: application.levelId, intakeId: application.intakeId,
            waitlistedAt: { lt: application.waitlistedAt } } })
          .then((ahead) => ahead + 1)
      : Promise.resolve(null),
  ]);

  return { ...application, transitions: transitionOptions(application.status), waitlistPosition, history };
};
