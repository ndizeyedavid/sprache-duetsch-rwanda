import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getSessionRoster = async (id: string) => {
  const session = await prisma.classSession.findUnique({
    where: { id },
    select: { id: true, classGroupId: true, endAt: true },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { classGroupId: session.classGroupId, enrolledAt: { lte: session.endAt }, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: { enrolledAt: "asc" },
    select: {
      student: {
        select: {
          id: true,
          studentCode: true,
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          attendance: { where: { sessionId: id }, select: { status: true, note: true, markedAt: true, updatedAt: true, markedBy: { select: { firstName: true, lastName: true } } } },
        },
      },
    },
  });

  return enrollments.map((enrollment) => {
    const student = enrollment.student;
    const record = student.attendance[0];
    return {
      studentId: student.id,
      studentCode: student.studentCode,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.user.phone,
      status: record?.status ?? null,
      note: record?.note ?? null,
      markedAt: record?.markedAt ?? null,
      updatedAt: record?.updatedAt ?? null,
      markedBy: record?.markedBy ?? null,
    };
  });
};
