// The student exam centre: for every course the student has paid for, its exam papers (official sample
// exams to download, with an online answer sheet when staff added a key) and the course's module tests
// and mock final exam with their state. Courses the student is enrolled in but has not paid for are
// listed as locked, like the course content itself.
import { assertAccountActive,loadStudentAccessProfile } from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
import { readAnswerKey } from "./answer-key.js";

const typeRank = (type: string) => type === "FINAL_EXAM" ? 1 : 0;

/** The student's answer-sheet results for one paper: how often, the best and the latest. */
const resultSummary = (attempts: { score: number; total: number; createdAt: Date }[]) => {
  if (!attempts.length) return null;
  const best = attempts.reduce((top, row) => (row.score / row.total > top.score / top.total ? row : top));
  return { attempts: attempts.length, best: { score: best.score, total: best.total }, last: attempts[0] ?? null };
};

export const getMyExamCentre = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  const levelIds = profile.levelIds;
  const [levels, locked, papers, tests] = await Promise.all([
    prisma.level.findMany({ where: { id: { in: levelIds } }, orderBy: { order: "asc" }, select: { id: true, code: true, title: true, levelLabel: true } }),
    prisma.level.findMany({ where: { id: { in: profile.enrolledLevelIds.filter((id) => !levelIds.includes(id)) } }, orderBy: { order: "asc" }, select: { code: true, title: true } }),
    prisma.examPaper.findMany({
      where: { levelId: { in: levelIds }, isPublished: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true, levelId: true, title: true, description: true, provider: true, edition: true, fileUrl: true, fileName: true, sizeBytes: true, sourceUrl: true, answerKey: true,
        audio: { orderBy: { order: "asc" }, select: { id: true, title: true, url: true } },
        attempts: { where: { studentId: profile.studentId }, orderBy: { createdAt: "desc" }, select: { score: true, total: true, createdAt: true } },
      },
    }),
    prisma.assessment.findMany({
      where: { levelId: { in: levelIds }, isPublished: true, type: { in: ["MODULE_TEST", "FINAL_EXAM"] } },
      select: {
        id: true, levelId: true, title: true, type: true, durationMinutes: true, passMark: true, prerequisiteLessonId: true, _count: { select: { questions: true } },
        attempts: { where: { studentId: profile.studentId }, orderBy: { attemptNumber: "desc" }, take: 1, select: { status: true, score: true, maxScore: true, passed: true } },
      },
    }),
  ]);
  const lessonIds = tests.flatMap((test) => test.prerequisiteLessonId ? [test.prerequisiteLessonId] : []);
  const [lessons, progress] = await Promise.all([
    prisma.lesson.findMany({ where: { id: { in: lessonIds } }, select: { id: true, title: true, order: true } }),
    prisma.lessonProgress.findMany({ where: { studentId: profile.studentId, lessonId: { in: lessonIds }, status: "COMPLETED" }, select: { lessonId: true } }),
  ]);
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const completed = new Set(progress.map((row) => row.lessonId));

  const levelTests = (levelId: string) => tests.filter((test) => test.levelId === levelId).map((test) => {
    const lesson = test.prerequisiteLessonId ? lessonById.get(test.prerequisiteLessonId) : undefined;
    const latest = test.attempts[0];
    return {
      id: test.id, title: test.title, type: test.type, durationMinutes: test.durationMinutes, passMark: Number(test.passMark), questions: test._count.questions,
      opensAfter: lesson ? { lessonId: lesson.id, title: lesson.title, order: lesson.order, completed: completed.has(lesson.id) } : null,
      latest: latest ? { status: latest.status, score: latest.score === null ? null : Number(latest.score), maxScore: Number(latest.maxScore), passed: latest.passed } : null,
    };
  }).sort((a, b) => typeRank(a.type) - typeRank(b.type) || (a.opensAfter?.order ?? 0) - (b.opensAfter?.order ?? 0));

  return {
    /** The course to show first: the student's current level when it is paid for. */
    currentLevelCode: levels.find((level) => level.id === profile.currentLevelId)?.code ?? null,
    levels: levels.map((level) => ({
      ...level,
      papers: papers.filter((paper) => paper.levelId === level.id).map((paper) => ({
        id: paper.id, title: paper.title, description: paper.description, provider: paper.provider, edition: paper.edition,
        fileUrl: paper.fileUrl, fileName: paper.fileName, sizeBytes: paper.sizeBytes, sourceUrl: paper.sourceUrl, hasAnswerKey: !!readAnswerKey(paper.answerKey),
        audio: paper.audio, results: resultSummary(paper.attempts),
      })),
      tests: levelTests(level.id),
    })),
    locked,
  };
};
