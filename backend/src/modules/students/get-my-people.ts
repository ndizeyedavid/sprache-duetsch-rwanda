import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getMyPeople = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true, enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] } }, select: { classGroupId: true } } },
  });
  if (!student) throw notFound("Student profile not found");
  const groupIds = [...new Set((student.enrollments ?? []).map((e) => e.classGroupId).filter((id): id is string => Boolean(id)))];
  if (groupIds.length === 0) return { groups: [], classmates: [], teachers: [] };

  const [groups, classmateRows] = await Promise.all([
    prisma.classGroup.findMany({
      where: { id: { in: groupIds } },
      select: {
        id: true, code: true, name: true, shift: true, capacity: true, room: true, isActive: true,
        level: { select: { id: true, code: true, title: true, levelLabel: true } },
        intake: { select: { id: true, code: true, name: true } },
        campus: { select: { id: true, code: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.enrollment.findMany({
      where: { classGroupId: { in: groupIds }, status: "ACTIVE", student: { userId: { not: userId } } },
      select: {
        classGroup: { select: { id: true, name: true } },
        student: {
          select: {
            id: true, studentCode: true, status: true, shift: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
            currentLevel: { select: { code: true, title: true } },
          },
        },
      },
      take: 500,
    }),
  ]);

  const byUserId = new Map<string, { userId: string; studentId: string; studentCode: string; firstName: string; lastName: string; email: string; avatarUrl: string | null; status: string; shift: string; currentLevel: { code: string; title: string } | null; groups: { id: string; name: string }[] }>();
  for (const row of classmateRows) {
    const u = row.student.user;
    const existing = byUserId.get(u.id);
    const grp = row.classGroup ? { id: row.classGroup.id, name: row.classGroup.name } : null;
    if (existing) { if (grp && !existing.groups.some((g) => g.id === grp.id)) existing.groups.push(grp); }
    else {
      byUserId.set(u.id, {
        userId: u.id, studentId: row.student.id, studentCode: row.student.studentCode,
        firstName: u.firstName, lastName: u.lastName, email: u.email, avatarUrl: u.avatarUrl ?? null,
        status: row.student.status, shift: row.student.shift, currentLevel: row.student.currentLevel ?? null,
        groups: grp ? [grp] : [],
      });
    }
  }
  const classmates = [...byUserId.values()].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  const teacherMap = new Map<string, { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null; groups: { id: string; name: string }[] }>();
  for (const g of groups) {
    if (!g.teacher) continue;
    const t = g.teacher;
    const ex = teacherMap.get(t.id);
    if (ex) ex.groups.push({ id: g.id, name: g.name });
    else teacherMap.set(t.id, { id: t.id, firstName: t.firstName, lastName: t.lastName, email: t.email, avatarUrl: t.avatarUrl ?? null, groups: [{ id: g.id, name: g.name }] });
  }
  const teachers = [...teacherMap.values()].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  return { groups, classmates, teachers };
};
