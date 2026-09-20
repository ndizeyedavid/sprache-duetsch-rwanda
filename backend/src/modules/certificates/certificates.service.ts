import fs from "node:fs";
import path from "node:path";
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
    prisma.level.findUnique({
      where: { id: levelId },
      select: { id: true, code: true, title: true },
    }),
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
  const completed =
    lessons.length === 0
      ? 0
      : await prisma.lessonProgress.count({
          where: {
            studentId,
            status: "COMPLETED",
            lessonId: { in: lessons.map((lesson) => lesson.id) },
          },
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
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revokedById: actorId ?? null,
      revokeReason: reason,
    },
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
    throw conflict(
      "Certificate is still valid — revoke it first or issue is blocked by the existing copy",
    );
  }
  return issueCertificate(
    {
      studentId: before.studentId,
      levelId: before.levelId,
      enrollmentId: before.enrollmentId ?? undefined,
    },
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

/** Public verification — enriched with lessons covered and graded assignments */
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

export const renderCertificatePdf = async (id: string): Promise<Buffer> => {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      student: {
        select: { studentCode: true, user: { select: { firstName: true, lastName: true } } },
      },
      level: { select: { code: true, title: true } },
    },
  });
  if (!certificate) {
    throw notFound("Certificate not found");
  }

  const verifyUrl = `${env.PUBLIC_APP_URL.replace(/\/$/, "")}/verify/${certificate.verificationCode}`;
  const qr = await QRCode.toBuffer(verifyUrl, { width: 200, margin: 1 });
  const studentName =
    `${certificate.student.user.firstName} ${certificate.student.user.lastName}`.trim();
  const dateStr = certificate.issuedAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Logo — top center as requested
  const logoPaths = [
    path.join(process.cwd(), "public-logo.png"),
    path.join(process.cwd(), "backend", "public-logo.png"),
    path.resolve("frontend/public/logo.png"),
  ];
  let logoBuffer: Buffer | null = null;
  for (const p of logoPaths) {
    try {
      if (fs.existsSync(p)) {
        logoBuffer = fs.readFileSync(p);
        break;
      }
    } catch {
      // ignore
    }
  }

  // Horizontal landscape A4 — premium, high-contrast
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error: Error) => reject(error));
  });

  const W = 842;
  const H = 595;
  const NAVY = "#0f204b";
  const GOLD = "#c5a253";
  const GOLD_LIGHT = "#f4e8c1";
  const RED = "#b22234";
  const CREAM = "#fdfbf7";
  const INK = "#0f204b";
  const MUTED = "#6b7280";

  // Canvas
  doc.rect(0, 0, W, H).fill(CREAM);

  // Germany flag — top edge (black / red / gold) 5px each
  const flagH = 5;
  doc.rect(0, 0, W, flagH).fill("#000000");
  doc.rect(0, flagH, W, flagH).fill("#dd0000");
  doc.rect(0, flagH * 2, W, flagH).fill("#ffce00");
  // Bottom flag echo (thinner)
  doc.rect(0, H - 8, W, 3).fill("#000000");
  doc.rect(0, H - 5, W, 3).fill("#dd0000");
  doc.rect(0, H - 2, W, 2).fill("#ffce00");

  // Double elegant border — gold
  doc.save();
  doc
    .rect(10, 18, W - 20, H - 28)
    .lineWidth(1.4)
    .strokeColor(GOLD)
    .stroke();
  doc
    .rect(14, 22, W - 28, H - 36)
    .lineWidth(0.5)
    .strokeColor("#e7d9b0")
    .stroke();
  // Corner diamonds (gold)
  const corners: [number, number][] = [
    [14, 22],
    [W - 14, 22],
    [14, H - 14],
    [W - 14, H - 14],
  ];
  for (const [x, y] of corners) {
    doc.save();
    doc.translate(x, y);
    doc.rotate(45);
    doc.rect(-4, -4, 8, 8).fill(GOLD);
    doc.restore();
  }
  doc.restore();

  // Soft guilloche / wave texture — very subtle, premium
  doc.save();
  doc.opacity(0.045);
  doc.strokeColor(NAVY);
  doc.lineWidth(0.6);
  for (let i = 0; i < 5; i++) {
    const yb = 90 + i * 70;
    doc.moveTo(20, yb);
    doc.bezierCurveTo(200, yb - 18, 380, yb + 18, 640, yb - 8);
    doc.bezierCurveTo(700, yb - 4, 780, yb + 10, W - 20, yb);
    doc.stroke();
  }
  doc.restore();

  // Logo — top center, no accompanying text (as requested)
  const logoW = 88;
  const logoH = 88;
  const logoX = W / 2 - logoW / 2;
  const logoY = 28;
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, logoX, logoY, { width: logoW, height: logoH });
    } catch {
      // fallback: text mark
      doc
        .fillColor(NAVY)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("DEUTSCH", W / 2 - 45, logoY + 22, { width: 90, align: "center" });
    }
  } else {
    doc
      .fillColor(NAVY)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("DEUTSCH", W / 2 - 50, logoY + 28, { width: 100, align: "center" });
    doc
      .fillColor(MUTED)
      .fontSize(7)
      .font("Helvetica")
      .text("SPRACHE RW  •  ESTD. 2024", W / 2 - 50, logoY + 52, { width: 100, align: "center" });
  }

  // Small date — top right inside border
  doc
    .fillColor(MUTED)
    .fontSize(6.5)
    .font("Helvetica")
    .text(dateStr, W - 120, 30, { width: 100, align: "right" });

  // Certificate No — top left
  doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text(`No. ${certificate.certificateNumber}`, 28, 30);

  // Title stack — centered
  const titleY = 132;
  doc
    .fillColor(GOLD)
    .fontSize(7)
    .font("Helvetica-Bold")
    .text("DEUTSCH SPRACHE RW  •  KIGALI, RWANDA", 0, titleY, { width: W, align: "center" });
  // Decorative divider with flag tricolor center
  const divY = titleY + 18;
  const divW = 260;
  const divX = W / 2 - divW / 2;
  doc.save();
  doc
    .moveTo(divX, divY)
    .lineTo(divX + divW, divY)
    .lineWidth(0.6)
    .strokeColor("#e7d9b0")
    .stroke();
  // Flag tricolor tick in center
  const tickW = 28;
  const tickX = W / 2 - (tickW * 3) / 2;
  doc.rect(tickX, divY - 1.5, tickW, 3).fill("#000000");
  doc.rect(tickX + tickW, divY - 1.5, tickW, 3).fill("#dd0000");
  doc.rect(tickX + tickW * 2, divY - 1.5, tickW, 3).fill("#ffce00");
  doc.restore();

  doc
    .fillColor(NAVY)
    .fontSize(30)
    .font("Helvetica-Bold")
    .text("ZERTIFIKAT", 0, divY + 12, { width: W, align: "center" });
  doc
    .fillColor(MUTED)
    .fontSize(7)
    .font("Helvetica")
    .text("Certificate  of  Achievement  •  Urkunde", 0, divY + 46, {
      width: W,
      align: "center",
      characterSpacing: 1.2,
    });

  // Student — hero
  const nameY = divY + 72;
  doc
    .fillColor(MUTED)
    .fontSize(7)
    .font("Helvetica")
    .text("This is to certify that", 0, nameY, { width: W, align: "center" });
  doc
    .fillColor(INK)
    .fontSize(26)
    .font("Helvetica-Bold")
    .text(studentName, 0, nameY + 16, { width: W, align: "center" });
  // Gold underline for name
  doc.save();
  const nameW = doc.widthOfString(studentName);
  const lineW = Math.min(420, Math.max(220, nameW + 40));
  doc
    .moveTo(W / 2 - lineW / 2, nameY + 46)
    .lineTo(W / 2 + lineW / 2, nameY + 46)
    .lineWidth(0.9)
    .strokeColor(GOLD)
    .stroke();
  // Small flag under name
  const nTickX = W / 2 - 18;
  doc.rect(nTickX, nameY + 50, 12, 2).fill("#000000");
  doc.rect(nTickX + 12, nameY + 50, 12, 2).fill("#dd0000");
  doc.rect(nTickX + 24, nameY + 50, 12, 2).fill("#ffce00");
  doc.restore();

  // Complementary prose — warm, proud
  const proseY = nameY + 62;
  doc
    .fillColor("#1f2937")
    .fontSize(7.2)
    .font("Helvetica")
    .text(
      "has demonstrated exceptional dedication, perseverance and excellence in mastering the German language",
      0,
      proseY,
      { width: W, align: "center" },
    );
  doc
    .fillColor(MUTED)
    .fontSize(6.5)
    .font("Helvetica-Oblique")
    .text(
      "and is hereby recognized for outstanding academic achievement and commitment to linguistic excellence.",
      0,
      proseY + 12,
      { width: W, align: "center" },
    );

  // Course shield
  const courseY = proseY + 36;
  const shieldW = 420;
  const shieldX = W / 2 - shieldW / 2;
  const shieldH = 46;
  doc.save();
  doc.roundedRect(shieldX, courseY, shieldW, shieldH, 6).fill("#ffffff");
  doc
    .roundedRect(shieldX, courseY, shieldW, shieldH, 6)
    .lineWidth(0.8)
    .strokeColor(GOLD_LIGHT)
    .stroke();
  // Left gold bar
  doc.rect(shieldX, courseY, 4, shieldH).fill(GOLD);
  doc.restore();
  doc
    .fillColor(NAVY)
    .fontSize(8)
    .font("Helvetica-Bold")
    .text(`${certificate.level.code}`, shieldX + 16, courseY + 10, { width: 60 });
  doc
    .fillColor(NAVY)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(certificate.level.title, shieldX + 68, courseY + 9, {
      width: shieldW - 80,
      align: "left",
    });
  doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text(
      "Authorized by Deutsch Sprache RW  •  CEFR-aligned  •  Kigali, Rwanda",
      shieldX + 68,
      courseY + 26,
      { width: shieldW - 80 },
    );

  // Signatures — centered, balanced
  const sigY = courseY + shieldH + 28;
  const sigGap = 260;
  const sigLeftX = W / 2 - sigGap / 2 - 90;
  const sigRightX = W / 2 + sigGap / 2 - 90;
  doc.save();
  // Left sig
  doc
    .fillColor(INK)
    .fontSize(11)
    .font("Helvetica-Oblique")
    .text("A. Mukamurenzi", sigLeftX, sigY, { width: 180, align: "center" });
  doc
    .moveTo(sigLeftX + 10, sigY + 18)
    .lineTo(sigLeftX + 170, sigY + 18)
    .lineWidth(0.5)
    .strokeColor(GOLD)
    .stroke();
  doc
    .fillColor(NAVY)
    .fontSize(6.5)
    .font("Helvetica-Bold")
    .text("Aline Mukamurenzi", sigLeftX, sigY + 22, { width: 180, align: "center" });
  doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text("Academic Director  •  Deutsch Sprache RW", sigLeftX, sigY + 30, {
      width: 180,
      align: "center",
    });
  // Right sig
  doc
    .fillColor(INK)
    .fontSize(11)
    .font("Helvetica-Oblique")
    .text("C. Uwase", sigRightX, sigY, { width: 180, align: "center" });
  doc
    .moveTo(sigRightX + 10, sigY + 18)
    .lineTo(sigRightX + 170, sigY + 18)
    .lineWidth(0.5)
    .strokeColor(GOLD)
    .stroke();
  doc
    .fillColor(NAVY)
    .fontSize(6.5)
    .font("Helvetica-Bold")
    .text("Clarisse Uwase", sigRightX, sigY + 22, { width: 180, align: "center" });
  doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text("Head of German Language Program", sigRightX, sigY + 30, { width: 180, align: "center" });
  doc.restore();

  // Official seal — bottom right, overlapping border
  const sealCx = W - 92;
  const sealCy = sigY + 10;
  const sealR = 42;
  doc.save();
  // Outer emboss
  doc.circle(sealCx, sealCy, sealR).lineWidth(1.2).strokeColor(GOLD).stroke();
  doc
    .circle(sealCx, sealCy, sealR - 3)
    .lineWidth(0.4)
    .strokeColor("#e7d9b0")
    .stroke();
  doc
    .circle(sealCx, sealCy, sealR - 7)
    .fillOpacity(0.06)
    .fill(GOLD);
  doc.fillOpacity(1);
  // Flag ring inside seal (subtle)
  doc.save();
  doc
    .circle(sealCx, sealCy, sealR - 10)
    .lineWidth(2)
    .strokeColor("#000000")
    .strokeOpacity(0.08)
    .stroke();
  doc.restore();
  doc
    .fillColor(NAVY)
    .fontSize(5.5)
    .font("Helvetica-Bold")
    .text("DEUTSCH", sealCx - 30, sealCy - 14, { width: 60, align: "center" });
  doc
    .fillColor(RED)
    .fontSize(5)
    .font("Helvetica-Bold")
    .text("SPRACHE RW", sealCx - 30, sealCy - 4, { width: 60, align: "center" });
  doc
    .fillColor(MUTED)
    .fontSize(4.5)
    .font("Helvetica")
    .text("OFFICIAL  •  ESTD 2024", sealCx - 30, sealCy + 6, { width: 60, align: "center" });
  doc
    .fillColor(GOLD)
    .fontSize(6)
    .font("Helvetica")
    .text("ORIGINAL", sealCx - 30, sealCy + 14, { width: 60, align: "center" });
  doc.restore();

  // QR — bottom left
  const qrSize = 54;
  const qrX = 30;
  const qrY = H - 82;
  doc.save();
  doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4).fill("#ffffff");
  doc
    .roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4)
    .lineWidth(0.5)
    .strokeColor("#e5e7eb")
    .stroke();
  doc.restore();
  try {
    doc.image(qr, qrX, qrY, { width: qrSize });
  } catch {
    // ignore
  }
  const qrTextX = qrX + qrSize + 12;
  doc
    .fillColor(NAVY)
    .fontSize(5.5)
    .font("Helvetica-Bold")
    .text("Verify authenticity at:", qrTextX, qrY + 2);
  doc
    .fillColor("#2563eb")
    .fontSize(5.5)
    .font("Helvetica")
    .text(verifyUrl, qrTextX, qrY + 11, { width: 280 });
  doc
    .fillColor(MUTED)
    .fontSize(5)
    .font("Helvetica")
    .text(
      "Deutsch Sprache RW has confirmed the identity and successful completion of this learner.",
      qrTextX,
      qrY + 22,
      { width: 280 },
    );
  doc
    .fillColor(MUTED)
    .fontSize(4.8)
    .font("Helvetica")
    .text(
      `Certificate  ${certificate.certificateNumber}  •  Student  ${certificate.student.studentCode}  •  Verification  ${certificate.verificationCode}`,
      qrTextX,
      qrY + 32,
      { width: 300 },
    );
  doc
    .fillColor(MUTED)
    .fontSize(4.8)
    .font("Helvetica")
    .text(
      `Issued  ${dateStr}  •  ${certificate.level.code}  •  Deutsch Sprache RW, Kigali`,
      qrTextX,
      qrY + 40,
      { width: 300 },
    );

  // Disclaimer — tiny centered
  doc
    .fillColor("#9ca3af")
    .fontSize(4.4)
    .font("Helvetica")
    .text(
      "This certificate recognizes the successful completion of a Deutsch Sprache RW program. It does not constitute formal enrollment at a university nor an official state diploma. Recognition is at the discretion of receiving institutions.",
      W / 2 - 260,
      H - 22,
      { width: 520, align: "center" },
    );

  doc.end();

  return done;
};
