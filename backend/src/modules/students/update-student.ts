import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCampusExists } from './assert-campus-exists.js';
import { assertIntakeExists } from './assert-intake-exists.js';
import { assertLevelExists } from './assert-level-exists.js';
import type { UpdateStudentInput } from "./students.schema.js";
export const updateStudent = async (
  id: string,
  input: UpdateStudentInput,
  actorId?: string,
) => {
  const before = await prisma.student.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Student not found");
  }

  if (input.campusId) await assertCampusExists(input.campusId);
  if (input.intakeId) await assertIntakeExists(input.intakeId);
  if (input.intendedLevelId) await assertLevelExists(input.intendedLevelId);
  if (input.currentLevelId) await assertLevelExists(input.currentLevelId);

  const updated = await prisma.$transaction(async (tx) => {
    const student = await tx.student.update({
      where: { id },
      data: {
        campusId: input.campusId,
        intakeId: input.intakeId,
        intendedLevelId: input.intendedLevelId,
        currentLevelId: input.currentLevelId,
        shift: input.shift,
        status: input.status,
        gender: input.gender,
        nationalId: input.nationalId,
        address: input.address,
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      },
    });

    // Account status lives on both User and Student; keep them in sync.
    if (input.status) {
      await tx.user.update({ where: { id: student.userId }, data: { status: input.status } });
    }

    return student;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "STUDENT_UPDATED",
    entityType: "Student",
    entityId: id,
    before,
    after: updated,
  });

  return updated;
};
