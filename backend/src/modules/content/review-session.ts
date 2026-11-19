import { assertLevelAccess,loadStudentAccessProfile } from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
import { asConfig,asText } from "./activity-keys.js";
import { stableShuffle } from "./activity-shuffle.js";
import { getMyProgress,sessionXp } from "./learning-events.js";

const MAX_ITEMS = 12;
const MAX_MISTAKES = 10;
type Item = Record<string, unknown> & { id: string; kind: string };
type Vocab = { de: string; en: string; audio?: string };

/** Questions answered wrong first time in the student's latest practice sessions of the level, newest first. */
async function missedItems(studentId: string, levelId: string) {
  const submissions = await prisma.activitySubmission.findMany({
    where: { studentId, activity: { type: "PRACTICE", isPublished: true, lesson: { module: { levelId } } } },
    orderBy: { submittedAt: "desc" }, take: 40,
    select: { activityId: true, response: true, activity: { select: { config: true, lessonId: true } } },
  });
  const items: Item[] = [], lessonIds = new Set<string>();
  for (const submission of submissions) {
    const results = asConfig(asConfig(submission.response).results);
    for (const raw of Array.isArray(asConfig(submission.activity.config).items) ? asConfig(submission.activity.config).items as unknown[] : []) {
      const item = asConfig(raw);
      // True/false questions need their reading text or dialogue, so they stay in their own session.
      if (results[asText(item.id)] !== false || item.kind === "truefalse") continue;
      items.push({ ...item, id: `${submission.activityId.slice(0, 8)}:${asText(item.id)}`, kind: asText(item.kind) });
      lessonIds.add(submission.activity.lessonId);
    }
  }
  return { items: items.slice(0, MAX_MISTAKES), lessonIds };
}

/** "der Name, -n" → "der name": compare headwords without plural notation or case. */
const headword = (value: string) => value.replace(/,\s*(?:¨?-[\p{L}]*|¨|-)\s*$/u, "").trim().toLowerCase();

/**
 * Word drills from completed course v2 lessons, mixed like a Duolingo review: one matching set,
 * "what do you hear?" choices and "which word means …?" choices. Words already in the mistakes are skipped.
 */
function wordItems(vocab: Vocab[], count: number, seed: string, skip: Set<string>): Item[] {
  const unique = [...new Map(vocab.filter((word) => !skip.has(headword(word.de))).map((word) => [headword(word.de), word])).values()];
  const words = stableShuffle(unique, seed);
  if (words.length < 4 || count <= 0) return [];
  const others = (word: Vocab, key: keyof Vocab, salt: string) => stableShuffle(unique.filter((other) => other[key] !== word[key]), `${seed}:${salt}`).slice(0, 3).map((other) => other[key] as string);
  const match: Item = { id: `w:${seed}:match`, kind: "match", pairs: words.slice(0, 5).map((word) => [word.de, word.en]), pairAudio: words.slice(0, 5).map((word) => word.audio ?? null) };
  const listen = words.slice(5, 8).map((word, index): Item => ({ id: `w:${seed}:l${index}`, kind: "choose", prompt: word.de, listen: true, optionsLang: "en",
    answer: word.en, audio: word.audio, options: stableShuffle([word.en, ...others(word, "en", `l${index}`)], word.de) }));
  const meaning = words.slice(8, 11).map((word, index): Item => ({ id: `w:${seed}:m${index}`, kind: "choose", promptEn: `Which word means “${word.en}”?`, optionsLang: "de",
    answer: word.de, answerAudio: word.audio, options: stableShuffle([word.de, ...others(word, "de", `m${index}`)], word.en) }));
  return [match, ...listen, ...meaning].slice(0, count);
}

/** Today's review for a level: recent mistakes first, topped up with words from completed lessons. */
export async function getReviewSession(userId: string, levelId: string) {
  await assertLevelAccess(userId, levelId);
  const profile = await loadStudentAccessProfile(userId);
  const missed = await missedItems(profile.studentId, levelId);
  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true, module: { levelId }, OR: [{ id: { in: [...missed.lessonIds] } }, { progress: { some: { studentId: profile.studentId, status: "COMPLETED" } } }] },
    select: { content: true },
  });
  const contents = lessons.map((lesson) => asConfig(lesson.content)).filter((content) => content.v === 2);
  const vocab = contents.flatMap((content) => (Array.isArray(content.vocab) ? content.vocab : []).map((word) => asConfig(word) as unknown as Vocab));
  const glossary = Object.assign({}, ...contents.map((content) => asConfig(content.glossary))) as Record<string, unknown>;
  const seed = `${profile.studentId}:${new Date().toISOString().slice(0, 10)}`;
  const skip = new Set(missed.items.flatMap((item) => [item.prompt, item.text, item.answer].filter((value): value is string => typeof value === "string").map(headword)));
  const items = [...missed.items, ...wordItems(vocab, MAX_ITEMS - missed.items.length, seed, skip)];
  return { v: 2 as const, session: "review" as const, titleEn: "Review", mistakes: missed.items.length, items, glossary };
}

/** A finished review: XP like a practice session, logged as a REVIEW learning event. */
export async function saveReview(userId: string, levelId: string, input: { results: Record<string, boolean>; seconds?: number }) {
  await assertLevelAccess(userId, levelId);
  const profile = await loadStudentAccessProfile(userId);
  const values = Object.values(input.results);
  const score = values.length ? values.filter(Boolean).length / values.length : 1;
  const xp = sessionXp(score);
  await prisma.learningEvent.create({ data: { studentId: profile.studentId, levelId, kind: "REVIEW", xp, total: values.length,
    correct: values.filter(Boolean).length, seconds: Math.max(0, Math.min(Math.round(input.seconds ?? 0), 7200)) } });
  return { xp, progress: await getMyProgress(userId) };
}
