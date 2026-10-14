import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { assertApplicationChoices } from "./application-choices.js";
import { OPEN_APPLICATION_STATUSES } from "./application-policy.js";
import { applicationListInclude } from "./application-select.js";
import type { UpdateApplicationInput } from "./applications.schema.js";

/** Staff can correct the course choice (e.g. map website free text to a level) while it is open. */
export const updateApplication = (id: string, input: UpdateApplicationInput, actorId?: string) =>
  transact(async (tx) => {
    const before = await tx.application.findUnique({ where: { id } });
    if (!before) throw notFound("Application not found");
    if (!OPEN_APPLICATION_STATUSES.includes(before.status)) throw badRequest("Closed applications cannot be edited");
    if (before.studentId) throw badRequest("This application is already linked to a student; change the enrolment instead");

    const next = {
      levelId: input.levelId === undefined ? before.levelId : input.levelId,
      intakeId: input.intakeId === undefined ? before.intakeId : input.intakeId,
      campusId: input.campusId === undefined ? before.campusId : input.campusId,
    };
    await assertApplicationChoices(tx, next);

    const after = await tx.application.update({
      where: { id },
      data: {
        ...next,
        shift: input.shift === undefined ? undefined : input.shift,
        phone: input.phone === undefined ? undefined : input.phone || null,
      },
      include: applicationListInclude,
    });
    await writeAuditTx(tx, {
      actorId, action: "APPLICATION_UPDATED", entityType: "Application", entityId: id,
      before: { levelId: before.levelId, intakeId: before.intakeId, campusId: before.campusId, shift: before.shift, phone: before.phone },
      after: { levelId: after.levelId, intakeId: after.intakeId, campusId: after.campusId, shift: after.shift, phone: after.phone },
    });
    return after;
  });
