import type { ClassGroupItem } from '../../lib/services';
import type { TeachingClass,TeachingTeacher } from '../../lib/teaching';
import type { TeacherFilters } from './types';

export const teacherName = (teacher: Pick<TeachingTeacher, 'firstName' | 'lastName'>) => `${teacher.firstName} ${teacher.lastName}`;
export const teacherInitials = (teacher: Pick<TeachingTeacher, 'firstName' | 'lastName'>) =>
  `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase();

/** Account status in the closed set's display form ("ACTIVE" → "Active"). */
export const statusLabel = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();

export const activeClasses = (teacher: TeachingTeacher) => teacher.teacherClasses.filter((group) => group.isActive);
export const studentLoad = (teacher: TeachingTeacher) => activeClasses(teacher).reduce((sum, group) => sum + group._count.enrollments, 0);
export const approvedLevelIds = (teacher: TeachingTeacher) => teacher.teachingLevels.map((row) => row.levelId);

export function filterTeachers(teachers: TeachingTeacher[], filters: TeacherFilters): TeachingTeacher[] {
  const query = filters.query.trim().toLowerCase();
  return teachers.filter((teacher) => {
    if (filters.status === 'Active' && teacher.status !== 'ACTIVE') return false;
    if (filters.status === 'Pending' && teacher.status !== 'PENDING') return false;
    if (filters.status === 'Inactive' && ['ACTIVE', 'PENDING'].includes(teacher.status)) return false;
    if (filters.levelId && !approvedLevelIds(teacher).includes(filters.levelId)) return false;
    return !query || `${teacherName(teacher)} ${teacher.email}`.toLowerCase().includes(query);
  });
}

/** Classes grouped by intake (newest intake name last is fine: names carry the date). */
export function groupByIntake<T extends Pick<TeachingClass, 'intake'>>(classes: T[]): { intake: T['intake']; classes: T[] }[] {
  const groups = new Map<string, { intake: T['intake']; classes: T[] }>();
  for (const group of classes) {
    const bucket = groups.get(group.intake.id) ?? { intake: group.intake, classes: [] as T[] };
    bucket.classes.push(group);
    groups.set(group.intake.id, bucket);
  }
  return [...groups.values()];
}

/** Active teachers approved for the class's level — the backend's assignment rule. */
export const eligibleFor = (group: ClassGroupItem, teachers: TeachingTeacher[]) =>
  teachers.filter((teacher) => teacher.status === 'ACTIVE' && approvedLevelIds(teacher).includes(group.levelId));

/** The API refuses to drop a level that an active class still runs on; surface the class name. */
export function conflictClassName(message: string): string | null {
  return /^Reassign or deactivate (.+) before removing its teaching level$/.exec(message)?.[1] ?? null;
}


/** Intakes the teacher works in: added directly, or implied by an active class there. */
export function teacherIntakeIds(teacher: TeachingTeacher): Set<string> {
  return new Set([...teacher.teachingIntakes.map((row) => row.intakeId), ...activeClasses(teacher).map((group) => group.intake.id)]);
}
