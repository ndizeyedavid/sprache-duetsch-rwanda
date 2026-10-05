import { z } from "zod";
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
    maxSubmissions: z.number().int().min(1).max(20).default(3),
    resources: z.array(resource).max(10).default([]),
    rubric: z.array(rubric).max(10).default([]),
    studentIds: z.array(z.uuid()).max(500).default([]),
  })
  .superRefine((v, ctx) => {
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
  fileIds: z.array(z.uuid()).max(5).default([]),
  version: z.iso.datetime().nullable().optional(),
});
export const reviewBody = z.object({
  action: z.enum(["GRADE", "RETURN"]),
  score: z.number().min(0).max(1000).optional(),
  feedback: z.string().trim().min(1).max(10000),
  rubricScores: z.array(z.number().min(0).max(1000)).max(10).default([]),
});
export type AssignmentInput = z.infer<typeof assignmentBody>;
export type DraftInput = z.infer<typeof draftBody>;
export type ReviewInput = z.infer<typeof reviewBody>;
