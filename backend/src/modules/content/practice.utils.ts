import { prisma } from '../../lib/prisma.js';
export function isPracticeConfig(config: unknown): boolean {
  return !!config && typeof config === 'object' && 'practiceMode' in config && config.practiceMode === true;
}
export async function getPracticeActivityIds(): Promise<string[]> {
  const rows = await prisma.activity.findMany({
    where: { config: { path: ['practiceMode'], equals: true } }, select: { id: true },
  });
  return rows.map(row => row.id);
}
