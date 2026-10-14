import { prisma } from '../../lib/prisma.js';

/** Flip-card study sets: completion-based, never formal assignments or grading work. */
export const SELF_STUDY_TYPES = ['VOCABULARY', 'FLASHCARD'] as const;

export function isPracticeConfig(config: unknown): boolean {
  return !!config && typeof config === 'object' && 'practiceMode' in config && config.practiceMode === true;
}

/** Structured self-study (practiceMode) or a flashcard/vocabulary set. */
export function isSelfStudyActivity(activity: { type: string; config: unknown }): boolean {
  return isPracticeConfig(activity.config) || (SELF_STUDY_TYPES as readonly string[]).includes(activity.type);
}

/** Activities kept out of assignment feeds, grading queues and backlog counts. */
export async function getPracticeActivityIds(): Promise<string[]> {
  const rows = await prisma.activity.findMany({
    where: { OR: [{ config: { path: ['practiceMode'], equals: true } }, { type: { in: [...SELF_STUDY_TYPES] } }] }, select: { id: true },
  });
  return rows.map(row => row.id);
}
