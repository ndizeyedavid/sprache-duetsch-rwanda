// Exam parts of an assessment (Assessment.sections, written by the course v2 test importer): what a paper
// exam prints or plays once per part — instructions, a reading text, one recording — and how the part
// behaves (play limit, options labelled a, b, c). The student test screen groups questions by them.
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

const assessmentSection = z.object({
  title: z.string(),
  intro: z.string().nullish(),
  passage: z.string().nullish(),
  audioUrl: z.string().nullish(),
  plays: z.number().int().positive().nullish(),
  letters: z.boolean().optional(),
  skill: z.string().optional(),
  questionIds: z.array(z.string()),
});
export type AssessmentSection = z.infer<typeof assessmentSection>;

/** Sections stored on an assessment or frozen in an attempt snapshot; [] when absent or malformed. */
export function readSections(value: Prisma.JsonValue | null | undefined): AssessmentSection[] {
  const parsed = z.array(assessmentSection).safeParse(value ?? []);
  return parsed.success ? parsed.data : [];
}
