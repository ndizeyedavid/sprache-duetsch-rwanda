import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
UpdateProfileInput
} from "./auth.schema.js";
export const updateMyProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw notFound("User not found");
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, status: true },
  });
  await writeAudit({ actorId: userId, action: "PROFILE_UPDATED", entityType: "User", entityId: userId, after: updated });
  return updated;
};
