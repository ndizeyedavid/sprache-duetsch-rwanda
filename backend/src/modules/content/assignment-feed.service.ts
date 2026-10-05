import { prisma } from "../../lib/prisma.js";
import { assertAccountActive, loadStudentAccessProfile } from "../../lib/access.js";
import { isPracticeConfig } from "./practice.utils.js";
export const getMyAssignments = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);

  const now = new Date();

  const [activities, assessments, submissions, attempts, courses] = await Promise.all([
    prisma.activity.findMany({
      where: { isPublished: true, lesson: { isPublished: true, OR: [{ releaseAt: null }, { releaseAt: { lte: now } }], module: { isPublished: true, OR: [{ releaseAt: null }, { releaseAt: { lte: now } }], levelId: { in: profile.levelIds } } } },
      orderBy: { createdAt: "asc" },
      select: { id: true, config: true, title: true, type: true, lessonId: true, createdAt: true, lesson: { select: { id: true, title: true, module: { select: { id: true, title: true, level: { select: { id: true, code: true, title: true } } } } } } },
      take: 500,
    }),
    prisma.assessment.findMany({
      where: { isPublished: true, levelId: { in: profile.levelIds } },
      orderBy: { availableUntil: "asc" },
      select: { id: true, title: true, type: true, levelId: true, availableFrom: true, availableUntil: true, passMark: true, durationMinutes: true, level: { select: { id: true, code: true, title: true } }, _count: { select: { questions: true } }, questions: { select: { points: true, question: { select: { points: true } } } } },
      take: 200,
    }),
    prisma.activitySubmission.findMany({ where: { studentId: profile.studentId }, select: { activityId: true, status: true, score: true, submittedAt: true, gradedAt: true, attemptNumber: true, feedback: true } }),
    prisma.attempt.findMany({ where: { studentId: profile.studentId }, select: { assessmentId: true, status: true, score: true, maxScore: true, submittedAt: true, attemptNumber: true } }),
    prisma.level.findMany({ where: { id: { in: profile.levelIds } }, select: { id: true, code: true, title: true } }),
  ]);

  const seenActivity = new Set<string>();
  const dedupedActivities = activities.filter((a) => { if (isPracticeConfig(a.config) || seenActivity.has(a.id)) return false; seenActivity.add(a.id); return true; });
  const seenAssessment = new Set<string>();
  const dedupedAssessments = assessments.filter((a) => { if (seenAssessment.has(a.id)) return false; seenAssessment.add(a.id); return true; });
  const subByActivity = new Map(submissions.map((s) => [s.activityId, s]));
  const attemptsByAssessment = new Map<string, typeof attempts>();
  for (const a of attempts) { const arr = attemptsByAssessment.get(a.assessmentId) ?? []; arr.push(a); attemptsByAssessment.set(a.assessmentId, arr); }

  const levelById = new Map(courses.map((l) => [l.id, l]));

  const activityItems = dedupedActivities.map((a) => {
    const sub = subByActivity.get(a.id) ?? null;
    let status: string = "NOT_STARTED";
    if (sub) status = sub.status;
    const dueAt: string | null = null;
    const points = 1;
    const maxScore = 1;
    return {
      id: `ACT-${a.id}`,
      source: "ACTIVITY" as const,
      activityId: a.id,
      assessmentId: null as string | null,
      lessonId: a.lessonId,
      title: a.title,
      type: a.type,
      levelId: a.lesson.module.level.id,
      levelCode: a.lesson.module.level.code,
      levelTitle: a.lesson.module.level.title,
      moduleTitle: a.lesson.module.title,
      lessonTitle: a.lesson.title,
      dueAt,
      points,
      maxScore,
      score: sub?.score ?? null,
      status,
      submittedAt: sub?.submittedAt ?? null,
      attemptCount: sub ? sub.attemptNumber : 0,
    };
  });

  const assessmentItems = dedupedAssessments.map((a) => {
    const list = (attemptsByAssessment.get(a.id) ?? []).sort((x, y) => y.attemptNumber - x.attemptNumber);
    const latest = list[0];
    const graded = latest?.status === "GRADED" ? latest : undefined;
    const submitted = latest?.status === "SUBMITTED" ? latest : undefined;
    const inProg = latest?.status === "IN_PROGRESS" ? latest : undefined;
    let status: string = "NOT_STARTED";
    let score: number | null = null;
    let submittedAt: Date | null = null;
    const attemptCount = list.length;
    if (graded) { status = "GRADED"; score = graded.score !== null ? Number(graded.score) : null; submittedAt = graded.submittedAt; }
    else if (submitted) { status = "SUBMITTED"; submittedAt = submitted.submittedAt; }
    else if (inProg) { status = "IN_PROGRESS"; }
    else if (a.availableUntil && now > a.availableUntil && list.length === 0) status = "MISSING";
    else if (a.availableUntil && now > a.availableUntil && !graded && !submitted) status = "OVERDUE";
    const maxScore = a.questions.reduce((sum, q) => sum + Number(q.points ?? q.question.points), 0) || a._count.questions || 0;
    const lvl = a.level ?? levelById.get(a.levelId) ?? { code: a.levelId, title: a.levelId };
    return {
      id: `ASM-${a.id}`,
      source: "ASSESSMENT" as const,
      activityId: null as string | null,
      assessmentId: a.id,
      lessonId: null as string | null,
      title: a.title,
      type: a.type,
      levelId: a.levelId,
      levelCode: (lvl as { code: string }).code,
      levelTitle: (lvl as { title: string }).title,
      moduleTitle: null as string | null,
      lessonTitle: null as string | null,
      dueAt: a.availableUntil ? a.availableUntil.toISOString() : null,
      points: maxScore,
      maxScore,
      score,
      status,
      submittedAt,
      attemptCount,
    };
  });

  return [...activityItems, ...assessmentItems].sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return a.title.localeCompare(b.title);
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
};

