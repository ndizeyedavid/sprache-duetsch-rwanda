import { z } from "zod";

export const bankParams = z.object({ id: z.uuid() });

const criterion = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(500).default(""),
  points: z.number().positive().max(1000),
});

export const rubricTemplateBody = z.object({
  title: z.string().trim().min(2).max(120),
  criteria: z.array(criterion).min(1).max(10),
  isShared: z.boolean().default(false),
});

export const feedbackCommentBody = z.object({
  text: z.string().trim().min(1).max(2000),
  category: z
    .string()
    .trim()
    .max(60)
    .nullable()
    .optional()
    .transform((v) => v || null),
});

export type RubricTemplateInput = z.infer<typeof rubricTemplateBody>;
export type FeedbackCommentInput = z.infer<typeof feedbackCommentBody>;
