import assert from "node:assert/strict";
import { recalculateStudentFinance } from "../../src/lib/finance.js";
import { hashPassword } from "../../src/lib/password.js";
import { prisma } from "../../src/lib/prisma.js";
import { DEMO_DOMAIN, DEMO_PASSWORD } from "./accounts.js";
import { QUICK_DEMO_CLASS, QUICK_DEMO_LEVELS, QUICK_DEMO_STUDENT, quickTestAccounts } from "./quick-test-accounts.js";

/** Add only the five quick-test users and their class/enrolments; never reset existing data. */
export async function seedQuickTest() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  return prisma.$transaction(async (tx) => {
    const unexpected = await tx.user.count({ where: {
      email: { endsWith: `@${DEMO_DOMAIN}`, notIn: quickTestAccounts.map(account => account.email) },
    } });
    assert.equal(unexpected, 0, "Other demo accounts exist; inspect them before adding the five-account dataset");
    const levels = await tx.level.findMany({ where: { code: { in: QUICK_DEMO_LEVELS }, isActive: true } });
    assert.equal(levels.length, 4, "All four core levels must be active");
    const a1 = levels.find(level => level.code === "A1")!;
    const intake = await tx.intake.findFirst({ where: { isActive: true, endDate: { gte: new Date() },
      levels: { every: { isActive: true }, some: { id: a1.id } } },
      include: { levels: { select: { id: true } } }, orderBy: { startDate: "desc" },
    });
    assert.ok(intake && levels.every(level => intake.levels.some(offered => offered.id === level.id)),
      "An active intake offering A1, A2, B1 and B2 is required");
    const campus = await tx.campus.findFirst({ where: { isActive: true }, orderBy: { code: "asc" } });
    assert.ok(campus, "An active campus is required");
    const users = new Map<string, string>();
    for (const account of quickTestAccounts) {
      const { key, ...identity } = account;
      const user = await tx.user.upsert({ where: { email: account.email },
        create: { ...identity, lastName: "Demo", passwordHash, status: "ACTIVE" },
        update: { role: account.role, status: "ACTIVE", passwordHash },
      });
      users.set(key, user.id);
    }
    const teacherId = users.get("teacher")!;
    const group = await tx.classGroup.upsert({ where: { code: QUICK_DEMO_CLASS },
      create: { code: QUICK_DEMO_CLASS, name: "DEMO · A1 quick-test class", levelId: a1.id,
        intakeId: intake.id, campusId: campus.id, teacherId, shift: "EVENING", capacity: 10 },
      update: {},
    });
    assert.equal(group.teacherId, teacherId, "The demo class belongs to another teacher");
    for (const level of levels) {
      await tx.teacherLevel.upsert({ where: { teacherId_levelId: { teacherId, levelId: level.id } },
        create: { teacherId, levelId: level.id, assignedById: users.get("admin")! }, update: {},
      });
    }
    const student = await tx.student.upsert({ where: { userId: users.get("student")! },
      create: { userId: users.get("student")!, studentCode: QUICK_DEMO_STUDENT, status: "ACTIVE",
        campusId: campus.id, intakeId: intake.id, intendedLevelId: a1.id, currentLevelId: a1.id, shift: "EVENING" },
      update: {},
    });
    for (const level of levels) {
      await tx.enrollment.upsert({ where: { studentId_levelId_intakeId: {
        studentId: student.id, levelId: level.id, intakeId: intake.id,
      } }, create: { studentId: student.id, levelId: level.id, intakeId: intake.id, campusId: campus.id,
        classGroupId: level.id === a1.id ? group.id : null, status: "ACTIVE", totalFee: "0", currency: level.currency },
      update: {},
      });
    }
    await recalculateStudentFinance(tx, student.id);
    await tx.auditLog.create({ data: { actorId: users.get("admin")!, action: "QUICK_DEMO_ACCOUNTS_PREPARED",
      entityType: "Deployment", entityId: "quick-demo-five-roles",
      reason: "User requested one account per role on /demo for quick production tests",
      after: { accounts: quickTestAccounts.map(account => ({ email: account.email, role: account.role })),
        classCode: group.code, studentCode: student.studentCode, unlockedLevels: QUICK_DEMO_LEVELS },
    } });
    return { accounts: quickTestAccounts.map(account => ({ email: account.email, role: account.role })),
      classCode: group.code, unlockedLevels: QUICK_DEMO_LEVELS };
  }, { timeout: 60_000 });
}
