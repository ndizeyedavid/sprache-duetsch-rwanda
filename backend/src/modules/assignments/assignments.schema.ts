import { z } from "zod";
import { authoredQuestionsSchema } from "../assessments/authored-question.schema.js";
export const assignmentParams = z.object({ id: z.uuid() });
export const submissionParams = z.object({ id: z.uuid(), submissionId: z.uuid() });
const resource = z.object({
  title: z.string().trim().min(1).max(120),
  url: z.url().refine((v) => /^https?:\/\//.test(v), "Use an http or https link"),
});
const rubric = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(500).default(""),
  points: z.number().positive().max(1000),
});
export const assignmentBody = z
  .object({
    classGroupId: z.uuid(),
    title: z.string().trim().min(3).max(160),
    instructions: z.string().trim().min(10).max(20000),
    responseType: z.enum(["TEXT", "FILE", "AUDIO", "MIXED"]).default("TEXT"),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    dueAt: z.iso.datetime().nullable().default(null),
    releaseAt: z.iso.datetime().nullable().default(null),
    estimatedMinutes: z.number().int().min(1).max(600).default(20),
    maxPoints: z.number().positive().max(1000).default(10),
    allowLate: z.boolean().default(true),
    gracePeriodMinutes: z.number().int().min(0).max(10080).default(0),
    latePenaltyPercentPerDay: z.number().min(0).max(100).default(0),
    latePenaltyMaxPercent: z.number().min(0).max(100).default(100),
    lessonId: z.uuid().nullable().default(null),
    maxSubmissions: z.number().int().min(1).max(20).default(3),
    questions: authoredQuestionsSchema.default([]),
    resources: z.array(resource).max(10).default([]),
    rubric: z.array(rubric).max(10).default([]),
    studentIds: z.array(z.uuid()).max(500).default([]),
  })
  .superRefine((v, ctx) => {
    if (v.questions.length && v.rubric.length) ctx.addIssue({ code: "custom", path: ["rubric"], message: "Question-based work uses per-question points instead of a rubric" });
    if (v.questions.length && v.responseType !== "TEXT") ctx.addIssue({ code: "custom", path: ["responseType"], message: "Question-based assignments use written answers" });
    if (new Set(v.questions.map(q => q.id)).size !== v.questions.length) ctx.addIssue({ code: "custom", path: ["questions"], message: "Select each question once" });
    if (v.releaseAt && v.dueAt && v.releaseAt >= v.dueAt)
      ctx.addIssue({
        code: "custom",
        path: ["dueAt"],
        message: "Deadline must follow release time",
      });
    if (
      v.rubric.length &&
      Math.abs(v.rubric.reduce((s, r) => s + r.points, 0) - v.maxPoints) > 0.001
    )
      ctx.addIssue({
        code: "custom",
        path: ["rubric"],
        message: "Rubric points must total the assignment points",
      });
  });
export const draftBody = z.object({
  text: z.string().max(30000).default(""),
  responses: z.record(z.uuid(), z.json()).default({}),
  fileIds: z.array(z.uuid()).max(5).default([]),
  version: z.iso.datetime().nullable().optional(),
});
export const penaltyOverrideBody = z.object({
  percent: z.number().min(0).max(100),
  reason: z.string().trim().min(3).max(500),
});
export const reviewBody = z.object({
  action: z.enum(["GRADE", "RETURN"]),
  score: z.number().min(0).max(1000).optional(),
  feedback: z.string().trim().max(10000).default(""),
  feedbackAudioFileId: z.uuid().nullable().default(null),
  penaltyOverride: penaltyOverrideBody.optional(),
  questionScores: z.array(z.number().min(0).max(1000)).max(50).default([]),
  rubricScores: z.array(z.number().min(0).max(1000)).max(10).default([]),
}).refine(v => v.feedback || v.feedbackAudioFileId, { path: ["feedback"], message: "Write feedback or record audio feedback" });
export type AssignmentInput = z.infer<typeof assignmentBody>;
export type DraftInput = z.infer<typeof draftBody>;
export type ReviewInput = z.infer<typeof reviewBody>;
export type PenaltyOverrideInput = z.infer<typeof penaltyOverrideBody>;
export const myListQuery = z.object({ lessonId: z.uuid().optional() });

export const assignmentStatusBody = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]) });
export const extensionParams = z.object({ id: z.uuid(), studentId: z.uuid() });
export const extensionBody = z.object({
  dueAt: z.iso.datetime({ offset: true }),
  reason: z.string().trim().max(500).optional(),
});
export type ExtensionInput = z.infer<typeof extensionBody>;
