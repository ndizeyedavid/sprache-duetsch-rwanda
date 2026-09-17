import { Prisma } from "../../generated/prisma/client.js";
import type { QuestionType } from "../../generated/prisma/client.js";
import {
  assertAccountActive,
  assertLevelAccess,
  assertPaymentAccess,
  loadStudentAccessProfile,
} from "../../lib/access.js";
import { emitActivity } from "../activity/activity.service.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, conflict, forbidden, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateAssessmentInput,
  CreateQuestionInput,
  GradeAttemptInput,
  ListAssessmentQuery,
  ListAttemptQuery,
  ListQuestionQuery,
  MyAssessmentsQuery,
  ReplaceAssessmentQuestionsInput,
  SubmitAttemptInput,
  UpdateAssessmentInput,
  UpdateQuestionInput,
} from "./assessments.schema.js";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const jsonInput = (
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return Prisma.DbNull;
  }
  return value;
};

// Objective types are machine-gradable; everything else needs a human.
const OBJECTIVE_TYPES: QuestionType[] = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_BLANK",
  "MATCHING",
  "ORDERING",
];

export const isObjectiveQuestionType = (type: QuestionType): boolean =>
  OBJECTIVE_TYPES.includes(type);

// Trim + lowercase strings so " Berlin " matches "berlin"; objects/arrays fall back
// to a stable JSON representation.
const canon = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return "";
};

const asList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(canon);
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(
      ([key, val]) => `${key.trim().toLowerCase()}:${canon(val)}`,
    );
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [canon(value)];
};

const sameSet = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
};

const sameSequence = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

/** Compare a student's response against the stored answer key for a question type. */
export const gradeObjectiveAnswer = (
  type: QuestionType,
  response: unknown,
  correctAnswer: unknown,
): boolean => {
  const given = asList(response);
  const expected = asList(correctAnswer);
  if (type === "ORDERING") {
    return sameSequence(given, expected);
  }
  return sameSet(given, expected);
};

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------

export const listQuestions = async (query: ListQuestionQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.QuestionWhereInput = {};
  if (query.levelId) {
    where.levelId = query.levelId;
  }
  if (query.moduleId) {
    where.moduleId = query.moduleId;
  }
  if (query.skill) {
    where.skill = query.skill;
  }
  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.search) {
    where.prompt = { contains: query.search, mode: "insensitive" };
  }

  const [rows, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.question.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getQuestion = async (id: string) => {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    throw notFound("Question not found");
  }
  return question;
};

export const createQuestion = async (input: CreateQuestionInput, actorId?: string) => {
  const question = await prisma.question.create({
    data: {
      levelId: input.levelId,
      moduleId: input.moduleId ?? null,
      type: input.type,
      skill: input.skill,
      difficulty: input.difficulty,
      prompt: input.prompt,
      explanation: input.explanation ?? null,
      imageUrl: input.imageUrl ?? null,
      audioUrl: input.audioUrl ?? null,
      options: jsonInput(input.options),
      correctAnswer: jsonInput(input.correctAnswer),
      points: input.points !== undefined ? new Prisma.Decimal(input.points) : undefined,
      createdById: actorId ?? null,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "QUESTION_CREATED",
    entityType: "Question",
    entityId: question.id,
    after: question,
  });

  return question;
};

export const updateQuestion = async (id: string, input: UpdateQuestionInput, actorId?: string) => {
  const before = await prisma.question.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Question not found");
  }

  const data: Prisma.QuestionUncheckedUpdateInput = {
    levelId: input.levelId,
    moduleId: input.moduleId,
    type: input.type,
    skill: input.skill,
    difficulty: input.difficulty,
    prompt: input.prompt,
    explanation: input.explanation,
    imageUrl: input.imageUrl,
    audioUrl: input.audioUrl,
    options: jsonInput(input.options),
    correctAnswer: jsonInput(input.correctAnswer),
  };
  if (input.points !== undefined) {
    data.points = new Prisma.Decimal(input.points);
  }

  const question = await prisma.question.update({ where: { id }, data });

  await writeAudit({
    actorId: actorId ?? null,
    action: "QUESTION_UPDATED",
    entityType: "Question",
    entityId: question.id,
    before,
    after: question,
  });

  return question;
};

export const deleteQuestion = async (id: string, actorId?: string) => {
  const before = await prisma.question.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Question not found");
  }

  await prisma.question.delete({ where: { id } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "QUESTION_DELETED",
    entityType: "Question",
    entityId: id,
    before,
  });

  return { id };
};

// ---------------------------------------------------------------------------
// Assessments (staff)
// ---------------------------------------------------------------------------

export const listAssessments = async (query: ListAssessmentQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.AssessmentWhereInput = {};
  if (query.levelId) {
    where.levelId = query.levelId;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.isPublished !== undefined) {
    where.isPublished = query.isPublished;
  }

  const [rows, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { _count: { select: { attempts: true, questions: true } } },
    }),
    prisma.assessment.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getAssessment = async (id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      _count: { select: { attempts: true } },
    },
  });

  if (!assessment) {
    throw notFound("Assessment not found");
  }

  return assessment;
};

export const createAssessment = async (input: CreateAssessmentInput, actorId?: string) => {
  const assessment = await prisma.$transaction(async (tx) => {
    const created = await tx.assessment.create({
      data: {
        levelId: input.levelId,
        lessonId: input.lessonId ?? null,
        prerequisiteLessonId: input.prerequisiteLessonId ?? null,
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        durationMinutes: input.durationMinutes ?? null,
        maxAttempts: input.maxAttempts ?? 1,
        passMark: input.passMark !== undefined ? new Prisma.Decimal(input.passMark) : undefined,
        availableFrom: input.availableFrom ?? null,
        availableUntil: input.availableUntil ?? null,
        isPublished: input.isPublished ?? false,
      },
    });

    if (input.questions && input.questions.length > 0) {
      await tx.assessmentQuestion.createMany({
        data: input.questions.map((question, index) => ({
          assessmentId: created.id,
          questionId: question.questionId,
          order: question.order ?? index,
          points: question.points != null ? new Prisma.Decimal(question.points) : null,
        })),
      });
    }

    return created;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_CREATED",
    entityType: "Assessment",
    entityId: assessment.id,
    after: assessment,
  });

  return assessment;
};

export const updateAssessment = async (
  id: string,
  input: UpdateAssessmentInput,
  actorId?: string,
) => {
  const before = await prisma.assessment.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Assessment not found");
  }

  const data: Prisma.AssessmentUncheckedUpdateInput = {
    levelId: input.levelId,
    lessonId: input.lessonId,
    prerequisiteLessonId: input.prerequisiteLessonId,
    title: input.title,
    description: input.description,
    type: input.type,
    durationMinutes: input.durationMinutes,
    maxAttempts: input.maxAttempts,
    availableFrom: input.availableFrom,
    availableUntil: input.availableUntil,
    isPublished: input.isPublished,
  };
  if (input.passMark !== undefined) {
    data.passMark = new Prisma.Decimal(input.passMark);
  }

  const assessment = await prisma.assessment.update({ where: { id }, data });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_UPDATED",
    entityType: "Assessment",
    entityId: assessment.id,
    before,
    after: assessment,
  });

  return assessment;
};

export const deleteAssessment = async (id: string, actorId?: string) => {
  const before = await prisma.assessment.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Assessment not found");
  }

  await prisma.assessment.delete({ where: { id } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_DELETED",
    entityType: "Assessment",
    entityId: id,
    before,
  });

  return { id };
};

export const replaceAssessmentQuestions = async (
  id: string,
  input: ReplaceAssessmentQuestionsInput,
  actorId?: string,
) => {
  const before = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!before) {
    throw notFound("Assessment not found");
  }

  const rows = input.questions.map((question, index) => ({
    assessmentId: id,
    questionId: question.questionId,
    order: question.order ?? index,
    points: question.points != null ? new Prisma.Decimal(question.points) : null,
  }));

  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.assessmentQuestion.deleteMany({ where: { assessmentId: id } }),
  ];
  if (rows.length > 0) {
    operations.push(prisma.assessmentQuestion.createMany({ data: rows }));
  }
  await prisma.$transaction(operations);

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_QUESTIONS_REPLACED",
    entityType: "Assessment",
    entityId: id,
    before: before.questions,
    after: rows,
  });

  return getAssessment(id);
};

// ---------------------------------------------------------------------------
// Attempts (staff)
// ---------------------------------------------------------------------------

export const listAttempts = async (query: ListAttemptQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.AttemptWhereInput = {};
  if (query.assessmentId) {
    where.assessmentId = query.assessmentId;
  }
  if (query.studentId) {
    where.studentId = query.studentId;
  } else if (query.classGroupId) {
    const studentIds = await prisma.enrollment
      .findMany({
        where: { classGroupId: query.classGroupId },
        select: { studentId: true },
        distinct: ["studentId"],
      })
      .then((rows) => rows.map((row) => row.studentId));
    where.studentId = studentIds.length > 0 ? { in: studentIds } : { in: [] };
  }
  if (query.status) {
    where.status = query.status;
  }

  const [rows, total] = await prisma.$transaction([
    prisma.attempt.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        student: {
          select: { studentCode: true, user: { select: { firstName: true, lastName: true } } },
        },
        assessment: { select: { id: true, title: true } },
      },
    }),
    prisma.attempt.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const exportAttempts = async (query: ListAttemptQuery) => {
  const where: Prisma.AttemptWhereInput = {};
  if (query.assessmentId) {
    where.assessmentId = query.assessmentId;
  }
  if (query.studentId) {
    where.studentId = query.studentId;
  } else if (query.classGroupId) {
    const studentIds = await prisma.enrollment
      .findMany({
        where: { classGroupId: query.classGroupId },
        select: { studentId: true },
        distinct: ["studentId"],
      })
      .then((rows) => rows.map((row) => row.studentId));
    where.studentId = studentIds.length > 0 ? { in: studentIds } : { in: [] };
  }
  if (query.status) {
    where.status = query.status;
  }

  const rows = await prisma.attempt.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: 5000,
    include: {
      student: {
        select: { studentCode: true, user: { select: { firstName: true, lastName: true } } },
      },
      assessment: { select: { id: true, title: true } },
    },
  });

  return rows.map((row) => ({
    startedAt: row.startedAt.toISOString(),
    studentCode: row.student.studentCode,
    studentName: `${row.student.user.firstName} ${row.student.user.lastName}`.trim(),
    assessment: row.assessment.title,
    status: row.status,
    score: row.score?.toString() ?? "",
    maxScore: row.maxScore.toString(),
    passed: row.passed === null ? "" : String(row.passed),
    submittedAt: row.submittedAt?.toISOString() ?? "",
    gradedAt: row.gradedAt?.toISOString() ?? "",
  }));
};

export const getSkillProfile = async (studentId: string) => {
  const answers = await prisma.answer.findMany({
    where: { attempt: { studentId, score: { not: null } } },
    select: {
      pointsAwarded: true,
      question: { select: { skill: true, points: true } },
    },
  });

  const bySkill = new Map<string, { answered: number; earned: number; possible: number }>();
  for (const answer of answers) {
    const entry = bySkill.get(answer.question.skill) ?? { answered: 0, earned: 0, possible: 0 };
    entry.answered += 1;
    entry.earned += Number(answer.pointsAwarded ?? 0);
    entry.possible += Number(answer.question.points);
    bySkill.set(answer.question.skill, entry);
  }

  return [...bySkill.entries()]
    .map(([skill, stats]) => ({
      skill,
      ...stats,
      percentage: stats.possible > 0 ? Math.round((stats.earned / stats.possible) * 100) : 0,
    }))
    .sort((a, b) => a.skill.localeCompare(b.skill));
};

export const getMySkillProfile = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  return getSkillProfile(profile.studentId);
};

/** Academic-staff view of one attempt: answers plus the ids needed for manual grading. */
export const getAttemptDetail = async (attemptId: string) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      student: {
        select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } },
      },
      assessment: { select: { id: true, title: true, type: true, levelId: true, passMark: true } },
      answers: {
        include: {
          question: { select: { id: true, prompt: true, type: true, points: true } },
        },
      },
    },
  });
  if (!attempt) {
    throw notFound("Attempt not found");
  }

  return {
    id: attempt.id,
    status: attempt.status,
    attemptNumber: attempt.attemptNumber,
    score: attempt.score === null ? null : Number(attempt.score),
    maxScore: Number(attempt.maxScore),
    passed: attempt.passed,
    feedback: attempt.feedback,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    gradedAt: attempt.gradedAt,
    student: {
      id: attempt.student.id,
      studentCode: attempt.student.studentCode,
      name: `${attempt.student.user.firstName} ${attempt.student.user.lastName}`.trim(),
    },
    assessment: attempt.assessment,
    answers: attempt.answers.map((answer) => ({
      id: answer.id,
      questionId: answer.questionId,
      prompt: answer.question.prompt,
      type: answer.question.type,
      maxPoints: Number(answer.question.points),
      response: answer.response,
      isCorrect: answer.isCorrect,
      pointsAwarded: Number(answer.pointsAwarded),
      feedback: answer.feedback,
    })),
  };
};

export const gradeAttempt = async (id: string, input: GradeAttemptInput, actorId?: string) => {
  const before = await prisma.attempt.findUnique({
    where: { id },
    include: { assessment: { select: { passMark: true } } },
  });
  if (!before) {
    throw notFound("Attempt not found");
  }
  if (before.status === "IN_PROGRESS") {
    throw badRequest("Attempt has not been submitted yet");
  }

  if (input.answers && input.answers.length > 0) {
    const existing = await prisma.answer.findMany({
      where: { attemptId: id, id: { in: input.answers.map((answer) => answer.answerId) } },
      select: { id: true },
    });
    const known = new Set(existing.map((answer) => answer.id));

    const operations = input.answers
      .filter((answer) => known.has(answer.answerId))
      .map((answer) =>
        prisma.answer.update({
          where: { id: answer.answerId },
          data: {
            pointsAwarded: new Prisma.Decimal(answer.pointsAwarded),
            feedback: answer.feedback ?? null,
            isCorrect: answer.pointsAwarded > 0,
          },
        }),
      );

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  const aggregate = await prisma.answer.aggregate({
    where: { attemptId: id },
    _sum: { pointsAwarded: true },
  });
  const score = Number(aggregate._sum.pointsAwarded ?? 0);
  const maxScore = Number(before.maxScore);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed = input.passed ?? percentage >= Number(before.assessment.passMark);

  const attempt = await prisma.attempt.update({
    where: { id },
    data: {
      status: "GRADED",
      score: new Prisma.Decimal(score),
      passed,
      feedback: input.feedback ?? before.feedback,
      gradedById: actorId ?? null,
      gradedAt: new Date(),
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ATTEMPT_GRADED",
    entityType: "Attempt",
    entityId: attempt.id,
    before,
    after: attempt,
  });

  const gradedAssessment = await prisma.assessment.findUnique({
    where: { id: before.assessmentId },
    select: { title: true, levelId: true },
  });
  await emitActivity({
    actorId,
    type: "EXAM",
    title: `Attempt graded: ${gradedAssessment?.title ?? "exam"}`,
    body: `Score ${score}/${maxScore} — ${passed ? "passed" : "not passed"}.`,
    levelId: gradedAssessment?.levelId ?? null,
    studentId: before.studentId,
  });

  return attempt;
};

// ---------------------------------------------------------------------------
// Student-facing flows (level + payment gated)
// ---------------------------------------------------------------------------

export const listMyAssessments = async (userId: string, query: MyAssessmentsQuery) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  assertPaymentAccess(profile, "ASSESSMENT");

  const pagination = parsePagination(query);
  const where: Prisma.AssessmentWhereInput = {
    isPublished: true,
    levelId: { in: profile.levelIds },
  };

  const [rows, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        levelId: true,
        title: true,
        description: true,
        type: true,
        durationMinutes: true,
        maxAttempts: true,
        passMark: true,
        availableFrom: true,
        availableUntil: true,
        attempts: {
          where: { studentId: profile.studentId },
          select: { score: true, status: true, passed: true },
        },
      },
    }),
    prisma.assessment.count({ where }),
  ]);

  const data = rows.map(({ attempts, ...assessment }) => {
    const bestScore = attempts.reduce<number | null>((best, attempt) => {
      if (attempt.score === null) {
        return best;
      }
      const value = Number(attempt.score);
      return best === null || value > best ? value : best;
    }, null);

    return { ...assessment, attemptCount: attempts.length, bestScore };
  });

  return buildPaginated(data, total, pagination);
};

export const getMyAssessment = async (userId: string, id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: {
      id: true,
      levelId: true,
      title: true,
      description: true,
      type: true,
      durationMinutes: true,
      maxAttempts: true,
      passMark: true,
      availableFrom: true,
      availableUntil: true,
      isPublished: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          points: true,
          question: {
            select: {
              id: true,
              type: true,
              skill: true,
              difficulty: true,
              prompt: true,
              options: true,
              imageUrl: true,
              audioUrl: true,
              points: true,
            },
          },
        },
      },
    },
  });

  if (!assessment || !assessment.isPublished) {
    throw notFound("Assessment not found");
  }

  await assertLevelAccess(userId, assessment.levelId);
  const profile = await loadStudentAccessProfile(userId);
  assertPaymentAccess(profile, "ASSESSMENT");

  const now = new Date();
  if (assessment.availableFrom && now < assessment.availableFrom) {
    throw badRequest("This assessment is not yet available");
  }
  if (assessment.availableUntil && now > assessment.availableUntil) {
    throw badRequest("This assessment is no longer available");
  }

  const attempts = await prisma.attempt.findMany({
    where: { assessmentId: id, studentId: profile.studentId },
    select: { status: true },
  });
  const hasInProgress = attempts.some((attempt) => attempt.status === "IN_PROGRESS");
  if (!hasInProgress && attempts.length >= assessment.maxAttempts) {
    throw forbidden("You have reached the maximum number of attempts");
  }

  const { isPublished: _isPublished, ...meta } = assessment;
  return { ...meta, attemptCount: attempts.length };
};

export const startAttempt = async (userId: string, assessmentId: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      levelId: true,
      isPublished: true,
      durationMinutes: true,
      maxAttempts: true,
      availableFrom: true,
      availableUntil: true,
      prerequisiteLessonId: true,
      questions: { select: { points: true, question: { select: { points: true } } } },
    },
  });

  if (!assessment || !assessment.isPublished) {
    throw notFound("Assessment not found");
  }

  await assertLevelAccess(userId, assessment.levelId);
  const profile = await loadStudentAccessProfile(userId);
  assertPaymentAccess(profile, "ASSESSMENT");

  if (assessment.prerequisiteLessonId) {
    const prerequisite = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: profile.studentId,
          lessonId: assessment.prerequisiteLessonId,
        },
      },
      select: { status: true },
    });
    if (prerequisite?.status !== "COMPLETED") {
      throw forbidden("Complete the prerequisite lesson before starting this assessment");
    }
  }

  const now = new Date();
  if (assessment.availableFrom && now < assessment.availableFrom) {
    throw badRequest("This assessment is not yet available");
  }
  if (assessment.availableUntil && now > assessment.availableUntil) {
    throw badRequest("This assessment is no longer available");
  }

  const existing = await prisma.attempt.findFirst({
    where: { assessmentId, studentId: profile.studentId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
  });
  if (existing) {
    const stillValid =
      assessment.durationMinutes === null ||
      now.getTime() - existing.startedAt.getTime() < assessment.durationMinutes * 60_000;
    if (stillValid) {
      return existing;
    }
  }

  const attemptCount = await prisma.attempt.count({
    where: { assessmentId, studentId: profile.studentId },
  });
  if (attemptCount >= assessment.maxAttempts) {
    throw forbidden("You have reached the maximum number of attempts");
  }

  const maxScore = assessment.questions.reduce(
    (sum, row) => sum + Number(row.points ?? row.question.points),
    0,
  );

  const attempt = await prisma.attempt.create({
    data: {
      assessmentId,
      studentId: profile.studentId,
      attemptNumber: attemptCount + 1,
      status: "IN_PROGRESS",
      maxScore: new Prisma.Decimal(maxScore),
      startedAt: now,
    },
  });

  await writeAudit({
    actorId: userId,
    action: "ATTEMPT_STARTED",
    entityType: "Attempt",
    entityId: attempt.id,
    after: attempt,
  });

  return attempt;
};

export const submitAttempt = async (
  userId: string,
  attemptId: string,
  input: SubmitAttemptInput,
) => {
  const profile = await loadStudentAccessProfile(userId);

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        select: {
          id: true,
          levelId: true,
          passMark: true,
          questions: {
            select: {
              points: true,
              question: { select: { id: true, type: true, points: true, correctAnswer: true } },
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.studentId !== profile.studentId) {
    throw notFound("Attempt not found");
  }

  await assertLevelAccess(userId, attempt.assessment.levelId);
  assertPaymentAccess(profile, "ASSESSMENT");

  if (attempt.status !== "IN_PROGRESS") {
    throw conflict("This attempt has already been submitted");
  }

  const questionMeta = new Map(
    attempt.assessment.questions.map((row) => [
      row.question.id,
      {
        type: row.question.type,
        correctAnswer: row.question.correctAnswer,
        points: Number(row.points ?? row.question.points),
      },
    ]),
  );

  let score = 0;

  const operations = input.answers
    .filter((answer) => questionMeta.has(answer.questionId))
    .map((answer) => {
      const meta = questionMeta.get(answer.questionId);
      if (!meta) {
        return null;
      }

      let isCorrect: boolean | null = null;
      let pointsAwarded = 0;
      if (isObjectiveQuestionType(meta.type)) {
        isCorrect = gradeObjectiveAnswer(meta.type, answer.response, meta.correctAnswer);
        pointsAwarded = isCorrect ? meta.points : 0;
      }
      score += pointsAwarded;

      const response = jsonInput(answer.response);
      return prisma.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: answer.questionId } },
        create: {
          attemptId,
          questionId: answer.questionId,
          response,
          isCorrect,
          pointsAwarded: new Prisma.Decimal(pointsAwarded),
        },
        update: {
          response,
          isCorrect,
          pointsAwarded: new Prisma.Decimal(pointsAwarded),
        },
      });
    })
    .filter((operation): operation is NonNullable<typeof operation> => operation !== null);

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }

  const hasSubjective = attempt.assessment.questions.some(
    (row) => !isObjectiveQuestionType(row.question.type),
  );

  const maxScore = Number(attempt.maxScore);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const now = new Date();

  const submittedAssessment = await prisma.assessment.findUnique({
    where: { id: attempt.assessment.id },
    select: { title: true },
  });
  const submittedTitle = submittedAssessment?.title ?? "exam";

  if (hasSubjective) {
    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        submittedAt: now,
        score: new Prisma.Decimal(score),
      },
    });

    await writeAudit({
      actorId: userId,
      action: "ATTEMPT_SUBMITTED",
      entityType: "Attempt",
      entityId: attemptId,
      after: updated,
    });

    await emitActivity({
      actorId: userId,
      type: "EXAM",
      title: `Exam submitted: ${submittedTitle}`,
      body: "Awaiting manual grading.",
      levelId: attempt.assessment.levelId,
      studentId: attempt.studentId,
    });

    return { status: "SUBMITTED", message: "Awaiting manual grading" };
  }

  const passed = percentage >= Number(attempt.assessment.passMark);
  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: "GRADED",
      submittedAt: now,
      gradedAt: now,
      score: new Prisma.Decimal(score),
      passed,
    },
  });

  await writeAudit({
    actorId: userId,
    action: "ATTEMPT_SUBMITTED",
    entityType: "Attempt",
    entityId: attemptId,
    after: updated,
  });

  await emitActivity({
    actorId: userId,
    type: "EXAM",
    title: `Exam auto-graded: ${submittedTitle}`,
    body: `Score ${score}/${maxScore} — ${passed ? "passed" : "not passed"}.`,
    levelId: attempt.assessment.levelId,
    studentId: attempt.studentId,
  });

  return {
    status: "GRADED",
    score,
    maxScore,
    percentage,
    passed,
    feedback: updated.feedback,
  };
};

export const listMyAttempts = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  assertPaymentAccess(profile, "ASSESSMENT");

  return prisma.attempt.findMany({
    where: { studentId: profile.studentId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      attemptNumber: true,
      status: true,
      score: true,
      maxScore: true,
      passed: true,
      startedAt: true,
      submittedAt: true,
      gradedAt: true,
      assessment: { select: { id: true, title: true } },
    },
  });
};

export const getMyAttempt = async (userId: string, attemptId: string) => {
  const profile = await loadStudentAccessProfile(userId);

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: { select: { id: true, title: true, levelId: true } },
      answers: {
        include: { question: { select: { id: true, prompt: true, type: true } } },
      },
    },
  });

  if (!attempt || attempt.studentId !== profile.studentId) {
    throw notFound("Attempt not found");
  }

  await assertLevelAccess(userId, attempt.assessment.levelId);
  assertPaymentAccess(profile, "ASSESSMENT");

  const isGraded = attempt.status === "GRADED";
  const maxScore = Number(attempt.maxScore);
  const score = attempt.score === null ? null : Number(attempt.score);

  return {
    id: attempt.id,
    assessment: { id: attempt.assessment.id, title: attempt.assessment.title },
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    score,
    maxScore,
    percentage: score === null || maxScore === 0 ? null : (score / maxScore) * 100,
    passed: attempt.passed,
    feedback: attempt.feedback,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    gradedAt: attempt.gradedAt,
    answers: attempt.answers.map((answer) => ({
      questionId: answer.questionId,
      prompt: answer.question.prompt,
      response: answer.response,
      ...(isGraded
        ? { isCorrect: answer.isCorrect, pointsAwarded: Number(answer.pointsAwarded) }
        : {}),
    })),
  };
};
