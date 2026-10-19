import { z } from "zod";
import { optionalText } from "../../lib/query.js";

export const manualPlacementSchema = z.object({
  score: z.coerce.number().int().min(0).max(100),
  /** Decide at once: confirm the recommendation or override it (reason required). */
  assignedLevelId: z.string().min(1).optional(),
  overrideReason: optionalText(500),
  note: optionalText(500),
});

export const placementDecisionSchema = z.object({
  assignedLevelId: z.string().min(1),
  overrideReason: optionalText(500),
});

export const placementResultParamsSchema = z.object({
  id: z.string().min(1),
  resultId: z.string().min(1),
});

export const placementDraftSchema = z.object({
  responses: z
    .record(z.string(), z.unknown())
    .refine((value) => JSON.stringify(value).length <= 100000, "Draft is too large"),
});

export const placementSubmitSchema = z.object({
  answers: z
    .array(z.object({ questionId: z.string().min(1), response: z.unknown() }))
    .max(500),
});

export const placementQueueQuerySchema = z.object({ intakeId: z.string().min(1).optional() });

export type PlacementQueueQuery = z.infer<typeof placementQueueQuerySchema>;
export type ManualPlacementInput = z.infer<typeof manualPlacementSchema>;
export type PlacementDecisionInput = z.infer<typeof placementDecisionSchema>;
export type PlacementDraftInput = z.infer<typeof placementDraftSchema>;
export type PlacementSubmitInput = z.infer<typeof placementSubmitSchema>;
