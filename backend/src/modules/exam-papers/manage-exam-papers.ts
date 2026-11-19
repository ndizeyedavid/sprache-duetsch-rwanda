// Staff management of past papers (Resources → Past papers). The PDF and the listening recordings are
// uploaded first through /api/uploads; a paper only points at them. Every change is audited.
import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { transact } from "../../lib/transactions.js";
import { formatAnswerKey,parseAnswerKey,readAnswerKey } from "./answer-key.js";
import type { PaperBody } from "./exam-papers.schema.js";

const include = {
  level: { select: { code: true, title: true } },
  audio: { orderBy: { order: "asc" }, select: { id: true, title: true, url: true } },
  _count: { select: { attempts: true } },
} satisfies Prisma.ExamPaperInclude;

const withKeyText = <T extends { answerKey: Prisma.JsonValue }>(paper: T) => ({ ...paper, answerKey: formatAnswerKey(readAnswerKey(paper.answerKey)) });

export const listExamPapers = async () => {
  const papers = await prisma.examPaper.findMany({ orderBy: [{ level: { order: "asc" } }, { order: "asc" }, { createdAt: "asc" }], include });
  return papers.map(withKeyText);
};

const uploadType = async (url: string) =>
  (await prisma.uploadedFile.findUnique({ where: { name: url.replace("/api/uploads/", "") }, select: { mimeType: true } }))?.mimeType;

async function paperData({ audio, ...body }: PaperBody) {
  const level = await prisma.level.findUnique({ where: { id: body.levelId }, select: { id: true } });
  if (!level) throw badRequest("Choose a course level");
  if (body.fileUrl && await uploadType(body.fileUrl) !== "application/pdf") throw badRequest("The paper file must be an uploaded PDF");
  for (const track of audio) {
    if (!(await uploadType(track.url))?.startsWith("audio/")) throw badRequest(`"${track.title}" must be an uploaded audio file`);
  }
  const answerKey = parseAnswerKey(body.answerKey);
  return { data: { ...body, answerKey: answerKey ?? Prisma.DbNull }, audio: audio.map((track, order) => ({ ...track, order })) };
}

export const createExamPaper = async (body: PaperBody, actorId: string | undefined) => {
  const { data, audio } = await paperData(body);
  const paper = await prisma.examPaper.create({ data: { ...data, createdById: actorId ?? null, audio: { create: audio } }, include });
  await writeAudit({ actorId: actorId ?? null, action: "EXAM_PAPER_CREATED", entityType: "ExamPaper", entityId: paper.id, after: paper });
  return withKeyText(paper);
};

export const updateExamPaper = async (id: string, body: PaperBody, actorId: string | undefined) => {
  const before = await prisma.examPaper.findUnique({ where: { id }, include });
  if (!before) throw notFound("Exam paper not found");
  const { data, audio } = await paperData(body);
  const paper = await transact(async (tx) => {
    await tx.examPaperAudio.deleteMany({ where: { paperId: id } });
    return tx.examPaper.update({ where: { id }, data: { ...data, audio: { create: audio } }, include });
  });
  await writeAudit({ actorId: actorId ?? null, action: "EXAM_PAPER_UPDATED", entityType: "ExamPaper", entityId: id, before, after: paper });
  return withKeyText(paper);
};

export const deleteExamPaper = async (id: string, actorId: string | undefined) => {
  const before = await prisma.examPaper.findUnique({ where: { id }, include });
  if (!before) throw notFound("Exam paper not found");
  await prisma.examPaper.delete({ where: { id } });
  await writeAudit({ actorId: actorId ?? null, action: "EXAM_PAPER_DELETED", entityType: "ExamPaper", entityId: id, before });
  return { message: "Exam paper deleted" };
};
