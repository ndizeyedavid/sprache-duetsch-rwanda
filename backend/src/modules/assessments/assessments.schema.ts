import { z } from "zod";
import { booleanQuery, idParam, optionalText, paginationQuery } from "../../lib/query.js";

// Closed enum sets mirrored from the Prisma schema (UPPER_SNAKE literals).
export const assessmentTypeSchema = z.enum(["QUIZ", "MODULE_TEST", "FINAL_EXAM", "PLACEMENT"]);

export const questionTypeSchema = z.enum([
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_BLANK",
  "MATCHING",
  "ORDERING",
  "SHORT_TEXT",
  "ESSAY",
]);

export const skillSchema = z.enum([
  "VOCABULARY",
  "GRAMMAR",
  "LISTENING",
  "READING",
  "WRITING",
  "SPEAKING",
]);

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const attemptStatusSchema = z.enum(["IN_PROGRESS", "SUBMITTED", "GRADED"]);

const pointsSchema = z.coerce.number().min(0).max(9999);
const nullablePointsSchema = z.union([z.null(), pointsSchema]);

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------

export const createQuestionSchema = z.object({
  levelId: z.string().min(1),
  moduleId: z.string().min(1).nullable().optional(),
  type: questionTypeSchema,
  skill: skillSchema,
  difficulty: difficultySchema,
  prompt: z.string().trim().min(1).max(2000),
  explanation: optionalText(2000),
  imageUrl: optionalText(500),
  audioUrl: optionalText(500),
  options: z.unknown().optional(),
  correctAnswer: z.unknown().optional(),
  points: pointsSchema.optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const listQuestionQuerySchema = z.object({
  levelId: z.string().min(1).optional(),
  moduleId: z.string().min(1).optional(),
  skill: skillSchema.optional(),
  difficulty: difficultySchema.optional(),
  type: questionTypeSchema.optional(),
  search: optionalText(200),
  ...paginationQuery,
});

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export const assessmentQuestionInputSchema = z.object({
  questionId: z.string().min(1),
  order: z.coerce.number().int().min(0).optional(),
  points: nullablePointsSchema.optional(),
});

export const createAssessmentSchema = z.object({
  levelId: z.string().min(1),
  lessonId: z.string().min(1).nullable().optional(),
  prerequisiteLessonId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(2).max(200),
  description: optionalText(2000),
  type: assessmentTypeSchema,
  durationMinutes: z.coerce.number().int().positive().max(10000).optional(),
  maxAttempts: z.coerce.number().int().positive().max(100).optional(),
  passMark: z.coerce.number().min(0).max(100).optional(),
  availableFrom: z.coerce.date().optional(),
  availableUntil: z.coerce.date().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(assessmentQuestionInputSchema).optional(),
});

export const updateAssessmentSchema = createAssessmentSchema
  .omit({ questions: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const replaceAssessmentQuestionsSchema = z.object({
  questions: z.array(assessmentQuestionInputSchema),
});

export const listAssessmentQuerySchema = z.object({
  levelId: z.string().min(1).optional(),
  type: assessmentTypeSchema.optional(),
  isPublished: booleanQuery.optional(),
  ...paginationQuery,
});

export const myAssessmentsQuerySchema = z.object({ ...paginationQuery });

// ---------------------------------------------------------------------------
// Attempts and grading
// ---------------------------------------------------------------------------

export const listAttemptQuerySchema = z.object({
  assessmentId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  status: attemptStatusSchema.optional(),
  ...paginationQuery,
});

export const gradeAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        answerId: z.string().min(1),
        pointsAwarded: z.coerce.number().min(0),
        feedback: optionalText(2000),
      }),
    )
    .optional(),
  feedback: optionalText(2000),
  passed: z.boolean().optional(),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      response: z.unknown(),
    }),
  ),
});

export const assessmentIdSchema = idParam;

export const skillProfileQuerySchema = z.object({
  studentId: z.string().min(1),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ListQuestionQuery = z.infer<typeof listQuestionQuerySchema>;
export type AssessmentQuestionInput = z.infer<typeof assessmentQuestionInputSchema>;
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type ReplaceAssessmentQuestionsInput = z.infer<typeof replaceAssessmentQuestionsSchema>;
export type ListAssessmentQuery = z.infer<typeof listAssessmentQuerySchema>;
export type MyAssessmentsQuery = z.infer<typeof myAssessmentsQuerySchema>;
export type ListAttemptQuery = z.infer<typeof listAttemptQuerySchema>;
export type SkillProfileQuery = z.infer<typeof skillProfileQuerySchema>;
export type GradeAttemptInput = z.infer<typeof gradeAttemptSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
