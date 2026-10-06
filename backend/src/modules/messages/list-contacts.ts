import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const listContacts = async (userId: string) => {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!me) {
    throw notFound("User not found");
  }

  if (me.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        enrollments: {
          where: { status: { in: ["ACTIVE", "COMPLETED"] } },
          select: { classGroupId: true },
        },
      },
    });
    const groupIds = (student?.enrollments ?? [])
      .map((enrollment) => enrollment.classGroupId)
      .filter((id): id is string => id !== null);
    if (groupIds.length === 0) return [];

    const [classmates, groups] = await Promise.all([
      prisma.enrollment.findMany({
        where: { classGroupId: { in: groupIds }, status: { in: ["ACTIVE", "COMPLETED"] }, student: { userId: { not: userId } } },
        select: {
          student: {
            select: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
          },
        },
      }),
      prisma.classGroup.findMany({
        where: { id: { in: groupIds } },
        select: { teacher: { select: { id: true, firstName: true, lastName: true, role: true } } },
      }),
    ]);

    const byId = new Map<string, { id: string; firstName: string; lastName: string; role: string }>();
    for (const row of classmates) byId.set(row.student.user.id, row.student.user);
    for (const group of groups) {
      if (group.teacher) byId.set(group.teacher.id, group.teacher);
    }
    return [...byId.values()];
  }

  if (me.role === "TEACHER") {
    const groups = await prisma.classGroup.findMany({
      where: { teacherId: userId },
      select: { id: true },
    });
    const groupIds = groups.map((group) => group.id);
    if (groupIds.length === 0) return [];

    const enrollments = await prisma.enrollment.findMany({
      where: { classGroupId: { in: groupIds }, status: { in: ["ACTIVE", "COMPLETED"] } },
      select: {
        student: {
          select: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
        },
      },
    });
    const byId = new Map<string, { id: string; firstName: string; lastName: string; role: string }>();
    for (const row of enrollments) byId.set(row.student.user.id, row.student.user);
    return [...byId.values()];
  }

  return prisma.user.findMany({
    where: { id: { not: userId }, status: "ACTIVE", role: { not: "STUDENT" } },
    select: { id: true, firstName: true, lastName: true, role: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: 100,
  });
};
