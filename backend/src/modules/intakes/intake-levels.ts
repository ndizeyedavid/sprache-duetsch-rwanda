import { badRequest, conflict } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';

export const intakeLevelSelect = { id: true, code: true, title: true, isActive: true } as const;
export async function validateIntakeLevels(ids: string[], intakeId?: string): Promise<void> {
  if (!ids.length || await prisma.level.count({ where: { id: { in: ids } } }) !== ids.length ||
    !await prisma.level.count({ where: { id: { in: ids }, isActive: true } })) throw badRequest('Choose at least one active level');
  if (intakeId && await prisma.enrollment.count({ where: { intakeId, levelId: { notIn: ids } } })) throw conflict('Keep levels that already have enrolled students in this intake');
  if (intakeId && await prisma.classGroup.count({ where: { intakeId, levelId: { notIn: ids } } })) throw conflict('Keep levels that already have class groups in this intake');
}
