import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const verifyCertificate = async (code: string) => {
  const normalized = code.trim().toUpperCase();
  const certificate = await prisma.certificate.findFirst({
    where: { OR: [{ verificationCode: normalized }, { certificateNumber: normalized }] },
    include: {
      student: {
        select: {
          id: true,
          studentCode: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      level: { select: { id: true, code: true, title: true } },
    },
  });
  if (!certificate) {
    throw notFound("No certificate matches this code");
  }

  const modules = await prisma.module.findMany({
    where: { levelId: certificate.levelId, isPublished: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      order: true,
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true },
      },
    },
  });

  const attempts = await prisma.attempt.findMany({
    where: {
      studentId: certificate.studentId,
      assessment: { levelId: certificate.levelId },
      status: "GRADED",
    },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      score: true,
      maxScore: true,
      passed: true,
      submittedAt: true,
      assessment: { select: { title: true, type: true } },
    },
  });

  const activitySubs = await prisma.activitySubmission.findMany({
    where: {
      studentId: certificate.studentId,
      activity: { lesson: { module: { levelId: certificate.levelId } } },
      status: "GRADED",
    },
    orderBy: { submittedAt: "desc" },
    select: {
      score: true,
      maxScore: true,
      isCorrect: true,
      submittedAt: true,
      activity: { select: { title: true, type: true } },
    },
  });

  return {
    valid: certificate.status === "ISSUED",
    status: certificate.status,
    certificateNumber: certificate.certificateNumber,
    verificationCode: certificate.verificationCode,
    studentName:
      `${certificate.student.user.firstName} ${certificate.student.user.lastName}`.trim(),
    studentCode: certificate.student.studentCode,
    levelCode: certificate.level.code,
    levelTitle: certificate.level.title,
    issuedAt: certificate.issuedAt,
    issuedBy: null as string | null,
    modules: modules.map((m) => ({
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => ({ title: l.title, order: l.order })),
    })),
    assessments: attempts.map((a) => ({
      title: a.assessment.title,
      type: a.assessment.type,
      score: a.score !== null ? Number(a.score) : null,
      maxScore: Number(a.maxScore),
      percentage:
        a.maxScore && Number(a.maxScore) > 0 && a.score !== null
          ? Math.round((Number(a.score) / Number(a.maxScore)) * 100)
          : null,
      passed: a.passed,
      submittedAt: a.submittedAt,
    })),
    activities: activitySubs.map((s) => ({
      title: s.activity.title,
      type: s.activity.type,
      score: s.score !== null ? Number(s.score) : null,
      maxScore: Number(s.maxScore),
      isCorrect: s.isCorrect,
      submittedAt: s.submittedAt,
    })),
  };
};
