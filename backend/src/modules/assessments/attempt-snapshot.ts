import type { Prisma,QuestionType } from "../../generated/prisma/client.js";
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
export function publicSnapshot(rows: SnapshotQuestion[]) {
  return rows.map(row => {
    const { correctAnswer: _key, ...question } = row.question;
    return { ...row, question };
  });
}
