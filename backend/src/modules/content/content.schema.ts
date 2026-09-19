import { z } from "zod";
import { optionalText, paginationQuery } from "../../lib/query.js";

// DB enums are UPPER_SNAKE literals (Prisma enum values).
export const lessonContentTypeSchema = z.enum(["VIDEO", "AUDIO", "TEXT", "PDF", "MIXED"]);
export const materialTypeSchema = z.enum([
  "NOTE",
  "PDF",
  "VIDEO",
  "AUDIO",
  "LINK",
  "WORKSHEET",
  "SLIDE",
  "OTHER",
]);
export const activityTypeSchema = z.enum([
  "VOCABULARY",
  "MATCHING",
  "FILL_BLANK",
  "ORDERING",
  "MCQ",
  "MULTIPLE_SELECT",
  "TRUE_FALSE",
  "LISTENING",
  "READING",
  "WRITING",
  "SPEAKING",
  "PRONUNCIATION",
  "FLASHCARD",
]);
export const progressStatusSchema = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]);
export const searchTypeSchema = z.enum(["LESSON", "MODULE", "MATERIAL"]);
export const noteMaterialTypeSchema = z.enum(["NOTE", "PDF", "WORKSHEET", "SLIDE"]);

const releaseAtSchema = z.coerce.date().nullable().optional();
const requiredText = (max: number) => z.string().trim().min(1).max(max);

export const levelIdParamsSchema = z.object({ levelId: z.string().min(1) });
export const idParamsSchema = z.object({ id: z.string().min(1) });

export const createModuleSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: optionalText(2000),
  order: z.union([z.coerce.number().int().min(0), z.null(), z.literal("")]).optional().transform((v) => (v === null || v === "" ? undefined : v as number)),
  isPublished: z.boolean().optional(),
  releaseAt: releaseAtSchema,
  prerequisiteModuleId: optionalText(60),
});

export const updateModuleSchema = createModuleSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const createLessonSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: optionalText(3000),
  contentType: lessonContentTypeSchema.optional(),
  body: optionalText(50000),
  videoUrl: optionalText(700),
  audioUrl: optionalText(700),
  estimatedMinutes: z.union([z.coerce.number().int().min(0).max(1000), z.null(), z.literal("")]).optional().transform((v) => (v === null || v === "" ? undefined : v as number)),
  order: z.union([z.coerce.number().int().min(0), z.null(), z.literal("")]).optional().transform((v) => (v === null || v === "" ? undefined : v as number)),
  isPublished: z.boolean().optional(),
  releaseAt: releaseAtSchema,
  prerequisiteLessonId: optionalText(60),
});

export const updateLessonSchema = createLessonSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const createMaterialSchema = z.object({
  title: requiredText(200),
  type: materialTypeSchema.optional(),
  url: optionalText(700),
  mimeType: optionalText(120),
  sizeBytes: z.coerce.number().int().min(0).optional(),
  isDownloadable: z.boolean().optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const createActivitySchema = z.object({
  type: activityTypeSchema,
  title: requiredText(200),
  instructions: optionalText(5000),
  order: z.coerce.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  config: z.unknown().optional(),
});

export const updateActivitySchema = createActivitySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const updateProgressSchema = z.object({
  status: progressStatusSchema,
  secondsWatched: z.coerce.number().int().min(0).optional(),
});

export const submitActivitySchema = z.object({
  response: z.unknown(),
});

export const gradeActivitySubmissionSchema = z.object({
  score: z.coerce.number().min(0).max(100).optional(),
  isCorrect: z.boolean().optional(),
  feedback: optionalText(5000),
});

export const listActivitySubmissionsQuerySchema = z.object({
  lessonId: z.string().min(1).optional(),
  activityId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  status: z.enum(["SUBMITTED", "GRADED"]).optional(),
  ...paginationQuery,
});

export const myNotesQuerySchema = z.object({
  type: noteMaterialTypeSchema.optional(),
  search: optionalText(200),
  ...paginationQuery,
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
  levelId: z.string().min(1).optional(),
  type: searchTypeSchema.optional(),
  ...paginationQuery,
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type SubmitActivityInput = z.infer<typeof submitActivitySchema>;
export type GradeActivitySubmissionInput = z.infer<typeof gradeActivitySubmissionSchema>;
export type ListActivitySubmissionsQuery = z.infer<typeof listActivitySubmissionsQuerySchema>;
export type MyNotesQuery = z.infer<typeof myNotesQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
