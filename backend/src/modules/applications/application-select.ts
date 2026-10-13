import type { Prisma } from "../../generated/prisma/client.js";

/** Row shape for the staff queue. No money fields: academic admins see admissions only. */
export const applicationListInclude = {
  level: { select: { id: true, code: true, title: true } },
  intake: { select: { id: true, code: true, name: true, startDate: true } },
  campus: { select: { id: true, code: true, name: true } },
  reviewedBy: { select: { id: true, firstName: true, lastName: true } },
  student: { select: { id: true, studentCode: true, status: true } },
} satisfies Prisma.ApplicationInclude;

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{ include: typeof applicationListInclude }>;
