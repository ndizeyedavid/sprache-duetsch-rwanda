import { humanize, money } from '../../lib/services';

export function typeLabel(value: string): string {
  return humanize(value);
}

export function pointsLabel(value: unknown): string {
  const n = money(value as string | number);
  return `${n} pt${n === 1 ? '' : 's'}`;
}

export function groupAssessments<T extends { type: string }>(rows: T[]) {
  const groups: Record<string, T[]> = {
    QUIZ: [],
    MODULE_TEST: [],
    FINAL_EXAM: [],
    PLACEMENT: [],
  };
  for (const row of rows) {
    if (groups[row.type]) groups[row.type].push(row);
    else groups[row.type] = [row];
  }
  return groups;
}

import { backendToFriendly, hydrateFriendlyType } from './constants';

export function filterQuestions<T extends { levelId: string; type: string; skill: string; difficulty: string; prompt: string; audioUrl?: string | null }>(
  rows: T[],
  levelId: string | null,
  search: string,
  type: string,
  skill: string,
  difficulty: string,
) {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (levelId && row.levelId !== levelId) return false;
    if (type !== 'ALL') {
      const friendly = hydrateFriendlyType(row as never);
      if (friendly !== type) return false;
      // also keep legacy mapping fallback
      if (friendly !== type && backendToFriendly(row.type) !== type) return false;
    }
    if (skill !== 'ALL' && row.skill !== skill) return false;
    if (difficulty !== 'ALL' && row.difficulty !== difficulty) return false;
    if (q && !row.prompt.toLowerCase().includes(q)) return false;
    return true;
  });
}
