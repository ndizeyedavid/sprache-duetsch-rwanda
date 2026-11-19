// A level's word list for students: every released lesson's vocabulary in course order, from course v2
// lessons (Lesson.content.vocab) and HTML lessons (Lesson.translation.words). Same access as lessons:
// the course must be paid for.
import { assertLevelAccess,assertPaymentAccess,loadStudentAccessProfile } from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";

type Word = { de: string; en: string; example?: string; exampleEn?: string; audio?: string; exampleAudio?: string };

const wordsOf = (value: unknown, key: "vocab" | "words"): Word[] => {
  const list = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : null;
  return Array.isArray(list) ? list.filter((word): word is Word => Boolean(word && typeof word === "object" && typeof (word as Word).de === "string" && typeof (word as Word).en === "string")) : [];
};

export const getMyWordList = async (userId: string, levelId: string) => {
  await assertLevelAccess(userId, levelId);
  assertPaymentAccess(await loadStudentAccessProfile(userId), "LESSON");
  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true, module: { levelId, isPublished: true }, OR: [{ releaseAt: null }, { releaseAt: { lte: new Date() } }] },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    select: { id: true, title: true, order: true, content: true, translation: true },
  });
  return lessons.flatMap((lesson) => [...wordsOf(lesson.content, "vocab"), ...wordsOf(lesson.translation, "words")].map((word) => ({
    de: word.de, en: word.en, example: word.example ?? null, exampleEn: word.exampleEn ?? null, audio: word.audio ?? null, exampleAudio: word.exampleAudio ?? null,
    lesson: { id: lesson.id, title: lesson.title, order: lesson.order },
  })));
};
