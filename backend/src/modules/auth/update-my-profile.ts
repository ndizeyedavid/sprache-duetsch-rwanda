import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
UpdateProfileInput
} from "./auth.schema.js";
export const updateMyProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, avatarUrl: true } });
  if (!user) throw notFound("User not found");
  if (input.avatarUrl && input.avatarUrl !== user.avatarUrl) {
    const name = input.avatarUrl.match(/^\/api\/uploads\/avatars\/(avatar-[a-f0-9-]+\.(?:png|jpg|webp))$/)?.[1];
    const file = name ? await prisma.uploadedFile.findUnique({ where: { name } }) : null;
    if (!file || file.uploaderId !== userId || !['image/png', 'image/jpeg', 'image/webp'].includes(file.mimeType)) {
      throw badRequest('Upload your own photo using the profile-photo uploader');
    }
  }
  return prisma.$transaction(async tx => {
  const updated = await tx.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, status: true },
  });
  await writeAuditTx(tx, { actorId: userId, action: "PROFILE_UPDATED", entityType: "User", entityId: userId, after: updated });
  return updated;
  });
};
