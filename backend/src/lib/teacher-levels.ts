import { forbidden } from './http-error.js';
import { prisma } from './prisma.js';
export async function getTeacherLevelIds(teacherId: string): Promise<string[]> {
  const rows = await prisma.teacherLevel.findMany({ where: { teacherId, teacher: { role: 'TEACHER', status: 'ACTIVE' } }, select: { levelId: true } });
  return rows.map(row => row.levelId);
}
export async function assertTeacherLevel(teacherId: string, levelId: string): Promise<void> {
  if (!(await getTeacherLevelIds(teacherId)).includes(levelId)) throw forbidden('Academic staff must assign this teaching level before you can use it');
}
