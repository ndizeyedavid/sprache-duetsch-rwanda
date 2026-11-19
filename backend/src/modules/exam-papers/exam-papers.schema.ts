import { z } from "zod";

export const paperIdSchema = z.object({ id: z.string().uuid() });

const optional = (max: number) => z.string().trim().max(max).nullish().transform((value) => value || null);

/** Staff create/replace an exam paper: a PDF uploaded through /api/uploads and/or an official https link. */
export const paperBodySchema = z.object({
  levelId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  description: optional(600),
  provider: z.string().trim().min(2).max(60).default("Goethe-Institut"),
  edition: optional(40),
  fileUrl: z.string().regex(/^\/api\/uploads\/[\w.-]+$/, "Upload the PDF first").nullish().transform((value) => value ?? null),
  fileName: optional(120),
  sizeBytes: z.number().int().positive().nullish().transform((value) => value ?? null),
  sourceUrl: z.string().trim().url().max(500).refine((url) => url.startsWith("https://"), "Use an https:// link").nullish().or(z.literal("")).transform((value) => value || null),
  /** One line per part: "Lesen Teil 1 | a b c | b b c b a" (answer-key.ts). */
  answerKey: optional(4000),
  order: z.number().int().min(0).max(999).default(0),
  isPublished: z.boolean().default(true),
  /** Listening recordings in play order, each an audio file uploaded through /api/uploads. */
  audio: z.array(z.object({
    title: z.string().trim().min(1).max(80),
    url: z.string().regex(/^\/api\/uploads\/[\w.-]+$/, "Upload the recording first"),
  })).max(12).default([]),
}).refine((paper) => paper.fileUrl || paper.sourceUrl, "Upload a PDF or add a link");
export type PaperBody = z.infer<typeof paperBodySchema>;

export const checkSheetSchema = z.object({
  responses: z.array(z.array(z.string().trim().max(20).nullable()).max(30)).max(20),
});
export type CheckSheetBody = z.infer<typeof checkSheetSchema>;
