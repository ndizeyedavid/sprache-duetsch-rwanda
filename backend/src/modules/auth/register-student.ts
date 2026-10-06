import { writeAudit } from "../../lib/audit.js";
import { badRequest,conflict } from "../../lib/http-error.js";
import { generateStudentCode } from "../../lib/ids.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type {
RegisterInput
} from "./auth.schema.js";
import { getUserProfile } from './get-user-profile.js';
import { issueTokens } from './issue-tokens.js';
import type { RegisterResult } from './register-result.js';
import type { RequestMeta } from './request-meta.js';
export const registerStudent = async (
  input: RegisterInput,
  meta: RequestMeta,
): Promise<RegisterResult> => {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw conflict("An account with this email already exists");
  }

  const campus = await prisma.campus.findUnique({
    where: { id: input.campusId },
    select: { id: true, isActive: true },
  });
  if (!campus || !campus.isActive) {
    throw badRequest("Selected campus is not available");
  }

  const passwordHash = await hashPassword(input.password);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        phone: input.phone ?? null,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash,
        role: "STUDENT",
        status: "PENDING",
      },
    });

    const studentCode = await generateStudentCode(tx);

    const student = await tx.student.create({
      data: {
        userId: user.id,
        studentCode,
        campusId: input.campusId,
        intakeId: input.intakeId ?? null,
        intendedLevelId: input.intendedLevelId ?? null,
        shift: input.shift,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        status: "PENDING",
        // Financial profile is created up-front with zero balances so the student
        // always has an account to show, even before any charge exists.
        finance: { create: {} },
      },
    });

    return { user, student };
  });

  await writeAudit({
    actorId: created.user.id,
    action: "STUDENT_REGISTERED",
    entityType: "Student",
    entityId: created.student.id,
    after: { studentCode: created.student.studentCode, email },
    ...meta,
  });

  const tokens = await issueTokens(created.user.id, created.user.email, created.user.role, meta);
  const user = await getUserProfile(created.user.id);

  return { user, tokens };
};
