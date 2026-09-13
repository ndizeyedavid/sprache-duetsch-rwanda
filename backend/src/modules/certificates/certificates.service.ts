import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { env } from "../../config/env.js";
import { generateCertificateNumber, generateVerificationCode } from "../../lib/ids.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, conflict, forbidden, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { emitActivity } from "../activity/activity.service.js";
import type { IssueCertificateInput, ListCertificatesQuery } from "./certificates.schema.js";

// Completion rules (documented, configurable later without a schema change):
// 1. every published lesson of the level is COMPLETED by the student
// 2. when the level has a published FINAL_EXAM, at least one attempt is passed
export const checkEligibility = async (studentId: string, levelId: string) => {
  const [student, level] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        user: { select: { firstName: true, lastName: true } },
        enrollments: { where: { levelId }, select: { id: true, status: true } },
      },
    }),
    prisma.level.findUnique({ where: { id: levelId }, select: { id: true, code: true, title: true } }),
  ]);
  if (!student) {
    throw notFound("Student not found");
  }
  if (!level) {
    throw notFound("Level not found");
  }

  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true, module: { levelId, isPublished: true } },
    select: { id: true, title: true },
  });
  const completed = lessons.length === 0
    ? 0
    : await prisma.lessonProgress.count({
      where: { studentId, status: "COMPLETED", lessonId: { in: lessons.map((lesson) => lesson.id) } },
    });

  const finalExams = await prisma.assessment.findMany({
    where: { levelId, type: "FINAL_EXAM", isPublished: true },
    select: { id: true, title: true },
  });
  let finalExamPassed: boolean | null = null;
  if (finalExams.length > 0) {
    const passed = await prisma.attempt.count({
      where: {
        studentId,
        status: "GRADED",
        passed: true,
        assessmentId: { in: finalExams.map((exam) => exam.id) },
      },
    });
    finalExamPassed = passed > 0;
  }

  const existing = await prisma.certificate.findFirst({
    where: { studentId, levelId, status: "ISSUED" },
    select: { id: true, certificateNumber: true },
  });

  const lessonsComplete = lessons.length > 0 && completed >= lessons.length;
  const eligible =
    student.enrollments.length > 0 && lessonsComplete && (finalExamPassed ?? true) && !existing;

  const reasons: string[] = [];
  if (student.enrollments.length === 0) reasons.push("No enrollment in this level");
  if (!lessonsComplete) reasons.push(`${completed}/${lessons.length} lessons completed`);
  if (finalExamPassed === false) reasons.push("Final exam not passed yet");
  if (existing) reasons.push(`Already issued (${existing.certificateNumber})`);

  return {
    eligible,
    reasons,
    studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
    level,
    enrollmentId: student.enrollments[0]?.id ?? null,
    lessonsTotal: lessons.length,
    lessonsCompleted: completed,
    completionPercentage: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
    finalExamPassed,
    existingCertificate: existing,
  };
};

const certificateInclude = {
  student: {
    select: {
      id: true,
      studentCode: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  },
  level: { select: { id: true, code: true, title: true } },
} as const;

export const issueCertificate = async (input: IssueCertificateInput, actorId?: string) => {
  const eligibility = await checkEligibility(input.studentId, input.levelId);
  if (!eligibility.eligible) {
    throw badRequest(`Student is not eligible yet: ${eligibility.reasons.join("; ")}`);
  }

  const certificate = await prisma.$transaction(async (tx) => {
    const certificateNumber = await generateCertificateNumber(tx);
    return tx.certificate.create({
      data: {
        certificateNumber,
        verificationCode: generateVerificationCode(),
        studentId: input.studentId,
        levelId: input.levelId,
        enrollmentId: input.enrollmentId ?? eligibility.enrollmentId,
        issuedById: actorId ?? null,
        metadata: {
          completionPercentage: eligibility.completionPercentage,
          finalExamPassed: eligibility.finalExamPassed,
        },
      },
      include: certificateInclude,
    });
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CERTIFICATE_ISSUED",
    entityType: "Certificate",
    entityId: certificate.id,
    after: certificate,
  });

  await emitActivity({
    actorId,
    type: "SYSTEM",
    title: `Certificate issued: ${eligibility.studentName} — ${eligibility.level.code}`,
    body: `Certificate ${certificate.certificateNumber}.`,
    levelId: input.levelId,
    studentId: input.studentId,
  });

  return certificate;
};

export const revokeCertificate = async (id: string, reason: string, actorId?: string) => {
  const before = await prisma.certificate.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Certificate not found");
  }
  if (before.status === "REVOKED") {
    throw conflict("Certificate is already revoked");
  }

  const certificate = await prisma.certificate.update({
    where: { id },
    data: { status: "REVOKED", revokedAt: new Date(), revokedById: actorId ?? null, revokeReason: reason },
    include: certificateInclude,
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CERTIFICATE_REVOKED",
    entityType: "Certificate",
    entityId: id,
    before,
    after: certificate,
    reason,
  });

  return certificate;
};

export const reissueCertificate = async (id: string, actorId?: string) => {
  const before = await prisma.certificate.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Certificate not found");
  }
  if (before.status === "ISSUED") {
    throw conflict("Certificate is still valid — revoke it first or issue is blocked by the existing copy");
  }
  return issueCertificate(
    { studentId: before.studentId, levelId: before.levelId, enrollmentId: before.enrollmentId ?? undefined },
    actorId,
  );
};

export const getCertificate = async (id: string, userId: string, role: string) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: certificateInclude,
  });
  if (!certificate) {
    throw notFound("Certificate not found");
  }
  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
    if (!student || student.id !== certificate.studentId) {
      throw forbidden("You can only view your own certificates");
    }
  }
  return certificate;
};

export const listCertificates = async (query: ListCertificatesQuery) => {
  const pagination = parsePagination(query);
  const where = {
    ...(query.studentId ? { studentId: query.studentId } : {}),
    ...(query.levelId ? { levelId: query.levelId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.certificate.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: certificateInclude,
    }),
    prisma.certificate.count({ where }),
  ]);
  return buildPaginated(rows, total, pagination);
};

export const listMyCertificates = async (userId: string) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) {
    throw notFound("Student profile not found");
  }
  return prisma.certificate.findMany({
    where: { studentId: student.id },
    orderBy: { issuedAt: "desc" },
    include: { level: { select: { id: true, code: true, title: true } } },
  });
};

/** Public verification for third parties — exposes no sensitive data. */
export const verifyCertificate = async (code: string) => {
  const normalized = code.trim().toUpperCase();
  const certificate = await prisma.certificate.findFirst({
    where: { OR: [{ verificationCode: normalized }, { certificateNumber: normalized }] },
    include: {
      student: { select: { user: { select: { firstName: true, lastName: true } } } },
      level: { select: { code: true, title: true } },
    },
  });
  if (!certificate) {
    throw notFound("No certificate matches this code");
  }
  return {
    valid: certificate.status === "ISSUED",
    status: certificate.status,
    certificateNumber: certificate.certificateNumber,
    studentName: `${certificate.student.user.firstName} ${certificate.student.user.lastName}`.trim(),
    levelCode: certificate.level.code,
    levelTitle: certificate.level.title,
    issuedAt: certificate.issuedAt,
  };
};

export const renderCertificatePdf = async (id: string): Promise<Buffer> => {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      student: { select: { studentCode: true, user: { select: { firstName: true, lastName: true } } } },
      level: { select: { code: true, title: true } },
    },
  });
  if (!certificate) {
    throw notFound("Certificate not found");
  }

  const verifyUrl = `${env.PUBLIC_APP_URL.replace(/\/$/, "")}/verify/${certificate.verificationCode}`;
  const qr = await QRCode.toBuffer(verifyUrl, { width: 160, margin: 1 });
  const studentName = `${certificate.student.user.firstName} ${certificate.student.user.lastName}`.trim();

  const doc = new PDFDocument({ size: "A4", margin: 64 });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error: Error) => reject(error));
  });

  doc.rect(0, 0, 595, 18).fill("#fb0d00");
  doc.rect(0, 824, 595, 18).fill("#374557");
  doc.moveDown(3);
  doc.fontSize(13).fillColor("#a098ae").text("DEUTSCH SPRACHE RW", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(34).fillColor("#374557").text("Zertifikat", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#a098ae").text("Certificate of Completion", { align: "center" });
  doc.moveDown(2);
  doc.fontSize(12).fillColor("#374557").text("This certifies that", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(26).fillColor("#374557").text(studentName, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#374557").text("has successfully completed", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(18).fillColor("#b30a00").text(`${certificate.level.code} — ${certificate.level.title}`, { align: "center" });
  doc.moveDown(2);
  doc.fontSize(11).fillColor("#374557").text(`Certificate No: ${certificate.certificateNumber}`, { align: "center" });
  doc.text(`Issued: ${certificate.issuedAt.toISOString().slice(0, 10)}`, { align: "center" });
  doc.moveDown(2);
  doc.image(qr, 595 / 2 - 70, doc.y, { width: 140 });
  doc.moveDown(10);
  doc.fontSize(10).fillColor("#a098ae").text(`Verify at ${verifyUrl}`, { align: "center" });
  doc.end();

  return done;
};
