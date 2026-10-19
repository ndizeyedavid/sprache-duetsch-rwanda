import type { Role } from "../../generated/prisma/client.js";
import { assertTeacherOwnsClass } from "../../lib/access.js";
import { writeAudit } from "../../lib/audit.js";
import { conflict, forbidden, notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { deleteProblem, shouldNotifyRemoval } from "./delete-policy.js";
import { notifySessionChange } from "./session-notifications.js";

/**
 * Remove a class from the schedule (e.g. created by mistake). Only classes without attendance
 * history can go; anything that took place must be cancelled instead. Teachers may only delete
 * classes of their own class groups. Students who expected the class are told it was removed.
 */
export async function deleteSession(id: string, actorId: string | undefined, role: Role | undefined, reason?: string) {
  const before = await prisma.classSession.findUnique({ where: { id }, include: { _count: { select: { attendance: true, materials: true } } } });
  if (!before) throw notFound("Class not found");
  if (role === "TEACHER") {
    if (!actorId) throw forbidden();
    await assertTeacherOwnsClass(actorId, before.classGroupId);
  }
  const problem = deleteProblem({ status: before.status, endAt: before.endAt, attendanceCount: before._count.attendance });
  if (problem) throw conflict(problem);
  const { _count, ...session } = before;
  // `updatedAt` guards against deleting a class someone just changed.
  await prisma.classSession.delete({ where: { id, updatedAt: before.updatedAt } });
  await writeAudit({ actorId: actorId ?? null, action: "SESSION_DELETED", entityType: "ClassSession", entityId: id,
    before: { ...session, materials: _count.materials }, reason: reason ?? null });
  if (shouldNotifyRemoval(session)) await notifySessionChange(session, "Class removed from the schedule", reason);
  return { id };
}
