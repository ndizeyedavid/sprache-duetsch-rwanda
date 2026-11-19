// Usage (from backend/): npx tsx prisma/exam-papers/import-papers.ts --dir ../.. [--apply]
// Puts the Goethe sample exams (goethe-papers.ts; PDFs in --dir) into the exam centre: copies each PDF
// into uploads/ (named by its content hash, so re-runs reuse it), records the upload and upserts the
// ExamPaper with its answer key. Dry-run by default. Run it where the uploads folder lives (locally,
// or inside the API container); otherwise add the papers in Resources → Exam papers.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile,readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../../src/lib/prisma.js";
import { parseAnswerKey } from "../../src/modules/exam-papers/answer-key.js";
import { UPLOAD_DIR } from "../../src/modules/uploads/uploads.service.js";
import { stableId } from "../course-import/stable-id.js";
import { GOETHE_PAPERS } from "./goethe-papers.js";

const arg = (name: string) => { const at = process.argv.indexOf(name); return at > 0 ? process.argv[at + 1] : undefined; };
const dir = path.resolve(arg("--dir") ?? "../..");
const apply = process.argv.includes("--apply");

try {
  const plan = await Promise.all(GOETHE_PAPERS.map(async (paper) => {
    const source = path.join(dir, paper.file);
    if (!existsSync(source)) throw new Error(`Missing ${source}`);
    const bytes = await readFile(source);
    if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error(`${paper.file} is not a PDF`);
    const name = `exam-${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}.pdf`;
    return { paper, source, name, sizeBytes: bytes.length, answerKey: parseAnswerKey(paper.answerKey) };
  }));
  const summary = plan.map(({ paper, name, sizeBytes, answerKey }) => ({ level: paper.level, title: paper.title, upload: name, sizeBytes, keyParts: answerKey?.parts.length ?? 0 }));
  if (!apply) { console.log(JSON.stringify({ mode: "dry-run", uploads: UPLOAD_DIR, papers: summary }, null, 2)); process.exit(0); }

  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!admin) throw new Error("No SUPER_ADMIN user to record as uploader");
  for (const { paper, source, name, sizeBytes, answerKey } of plan) {
    const level = await prisma.level.findUniqueOrThrow({ where: { code: paper.level }, select: { id: true } });
    const target = path.join(UPLOAD_DIR, name);
    if (!existsSync(target)) await copyFile(source, target);
    await prisma.uploadedFile.upsert({ where: { name }, create: { name, uploaderId: admin.id, mimeType: "application/pdf" }, update: {} });
    const id = stableId("exam-paper", paper.key);
    const data = {
      levelId: level.id, title: paper.title, description: paper.description, provider: "Goethe-Institut", edition: paper.edition,
      fileUrl: `/api/uploads/${name}`, fileName: paper.fileName, sizeBytes, sourceUrl: paper.sourceUrl, answerKey: answerKey ?? undefined, order: paper.order,
    };
    await prisma.examPaper.upsert({ where: { id }, create: { id, ...data, createdById: admin.id }, update: data });
  }
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "EXAM_PAPERS_IMPORTED", entityType: "ExamPaper", entityId: "goethe", after: summary } });
  console.log(JSON.stringify({ mode: "applied", papers: summary }, null, 2));
} finally {
  await prisma.$disconnect();
}
