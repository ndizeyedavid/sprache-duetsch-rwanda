import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { assertLevelAccess } from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
import { notFound, unauthorized } from "../../lib/http-error.js";

const books: Record<string, { filename: string; pages: number }> = {
  A1: { filename: "Deutsch_A1_Kursbuch.pdf", pages: 215 },
};

export const getCoursebook = async (userId: string | undefined, levelId: string) => {
  if (!userId) throw unauthorized();
  await assertLevelAccess(userId, levelId);
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { code: true } });
  if (!level) throw notFound("Level not found");
  const book = books[level.code];
  if (!book) return null;
  const path = fileURLToPath(new URL(`../../../assets/coursebooks/${book.filename}`, import.meta.url));
  const file = await stat(path).catch(() => null);
  if (!file?.isFile()) throw notFound("Coursebook file unavailable");
  return { ...book, sizeBytes: file.size, path };
};
