import type { Prisma,QuestionType } from "../../generated/prisma/client.js";
import { readSections } from "./assessment-sections.js";
import type { AssessmentSection } from "./assessment-sections.js";
export interface SnapshotQuestion {
  id: string; order: number; points: string | null;
  question: { id: string; type: QuestionType; points: string; correctAnswer: unknown;
    prompt: string; options: unknown; audioUrl: string | null; imageUrl: string | null;
    skill: string; difficulty: string };
}
export function readSnapshot(value: Prisma.JsonValue | null): SnapshotQuestion[] | null {
  if (Array.isArray(value)) return value as unknown as SnapshotQuestion[];
  if (value && typeof value === 'object' && Array.isArray(value.questions)) return value.questions as unknown as SnapshotQuestion[];
  return null;
}
export function readAttemptPolicy(value: Prisma.JsonValue | null, fallback: { durationMinutes?: number | null; passMark?: unknown }) {
  const snapshot = value && !Array.isArray(value) && typeof value === 'object' ? value : null;
  return { durationMinutes: snapshot && 'durationMinutes' in snapshot ? snapshot.durationMinutes as number | null : fallback.durationMinutes,
    passMark: snapshot && 'passMark' in snapshot ? Number(snapshot.passMark) : Number(fallback.passMark ?? 50) };
}
/** Sections frozen when the attempt started; null for attempts started before tests had sections. */
export function snapshotSections(value: Prisma.JsonValue | null): AssessmentSection[] | null {
  const snapshot = value && !Array.isArray(value) && typeof value === 'object' ? value : null;
  return snapshot && 'sections' in snapshot ? readSections(snapshot.sections) : null;
}
export function publicSnapshot(rows: SnapshotQuestion[]) {
  return rows.map(row => {
    // Explanations often reveal the answer, so students never receive them with open questions.
    const { correctAnswer: _key, explanation: _explanation, ...question } = row.question as typeof row.question & { explanation?: unknown };
    return { ...row, question };
  });
}
