import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { env } from "../../config/env.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export async function prepareCertificatePdf(id: string) {
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
doc.rect(0, 0, W, H).fill(CREAM);
const flagH = 5;
doc.rect(0, 0, W, flagH).fill("#000000");
doc.rect(0, flagH, W, flagH).fill("#dd0000");
doc.rect(0, flagH * 2, W, flagH).fill("#ffce00");
doc.rect(0, H - 8, W, 3).fill("#000000");
doc.rect(0, H - 5, W, 3).fill("#dd0000");
doc.rect(0, H - 2, W, 2).fill("#ffce00");
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
const logoW = 88;
const logoH = 88;
const logoX = W / 2 - logoW / 2;
const logoY = 28;
return { certificate, verifyUrl, qr, studentName, dateStr, logoPaths, logoBuffer, doc, chunks, done, W, H, NAVY, GOLD, GOLD_LIGHT, RED, CREAM, INK, MUTED, flagH, corners, logoW, logoH, logoX, logoY };
}
