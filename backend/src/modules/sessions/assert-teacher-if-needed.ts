import type { Role } from "../../generated/prisma/client.js";
import { assertTeacherOwnsClass } from "../../lib/access.js";
export const assertTeacherIfNeeded = async (
  actorId: string | undefined,
  actorRole: Role | undefined,
  classGroupId: string,
): Promise<void> => {
  if (actorRole === "TEACHER" && actorId) {
    await assertTeacherOwnsClass(actorId, classGroupId);
  }
};
