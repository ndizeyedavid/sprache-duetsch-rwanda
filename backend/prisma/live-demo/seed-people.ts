import { hashPassword } from "../../src/lib/password.js";
import { prisma } from "../../src/lib/prisma.js";
import { DEMO_PASSWORD, demoStaff, demoStudents } from "./accounts.js";
import type { DemoContext } from "./context.js";

/** Staff, class groups (one per teacher) and student profiles. */
export async function seedPeople(ctx: DemoContext) {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const staff of demoStaff) {
    const user = await prisma.user.create({
      data: { email: staff.email, firstName: staff.firstName, lastName: staff.lastName, role: staff.role, status: "ACTIVE", passwordHash },
    });
    ctx.staff.set(staff.key, user.id);
  }

  const groups = [
    { level: "A1" as const, code: "DEMO-A1-EVENING", name: "DEMO · A1 Abendkurs", campus: "NORRSKEN", shift: "EVENING" as const, teacher: "teacherA1", room: "Raum 2" },
    { level: "B1" as const, code: "DEMO-B1-MORNING", name: "DEMO · B1 Morgenkurs", campus: "KACYIRU", shift: "MORNING" as const, teacher: "teacherB1", room: "Raum 1" },
  ];
  for (const group of groups) {
    const record = await prisma.classGroup.create({
      data: {
        code: group.code, name: group.name, levelId: ctx.levels.get(group.level)!, intakeId: ctx.intakeId,
        campusId: ctx.campuses.get(group.campus)!, teacherId: ctx.staff.get(group.teacher)!, shift: group.shift,
        capacity: 20, room: group.room, attendanceAlertThreshold: 60,
      },
    });
    ctx.classes.set(group.level, record.id);
    await prisma.teacherLevel.create({
      data: { teacherId: ctx.staff.get(group.teacher)!, levelId: ctx.levels.get(group.level)!, assignedById: ctx.staff.get("academic") ?? null },
    });
  }

  for (const seed of demoStudents) {
    const levelId = ctx.levels.get(seed.level)!;
    const user = await prisma.user.create({
      data: {
        email: seed.email, firstName: seed.firstName, lastName: seed.lastName, phone: seed.phone,
        role: "STUDENT", status: seed.status, passwordHash,
        student: {
          create: {
            studentCode: seed.code, campusId: ctx.campuses.get(seed.campus)!, intakeId: ctx.intakeId, shift: seed.shift,
            status: seed.status, intendedLevelId: levelId, currentLevelId: seed.status === "PENDING" ? null : levelId,
            placementScore: seed.status === "PENDING" ? null : 62, guardianName: "Demo Guardian", guardianPhone: "+250 780 000 999",
            address: "Kigali, Rwanda",
          },
        },
      },
      include: { student: true },
    });
    ctx.students.set(seed.key, { userId: user.id, studentId: user.student!.id, enrollmentId: null });
  }
}
