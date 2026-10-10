import type { ClassGroupItem } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import type { Coverage,CoverageFilter,TeachingFilters } from './types';

/** Mirrors the backend rule: an active teacher approved for the class's level. */
export function eligibleTeachers(
  group: ClassGroupItem,
  teachers: TeachingTeacher[],
): TeachingTeacher[] {
  return teachers.filter(
    (teacher) =>
      teacher.status === 'ACTIVE' &&
      teacher.teachingLevels.some((approved) => approved.levelId === group.levelId),
  );
}

export function teacherClassCount(teacher: TeachingTeacher): number {
  return teacher.teacherClasses.filter((group) => group.isActive).length;
}

export function teacherInitials(teacher: TeachingTeacher): string {
  return `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase();
}

/** Approved level ids as a stable primitive, so a card resyncs only on real data change. */
export function teacherApprovedKey(teacher: TeachingTeacher): string {
  return teacher.teachingLevels
    .map((approved) => approved.levelId)
    .sort()
    .join(',');
}

/** Students sitting in this teacher's active classes — the load behind the count. */
export function teacherStudentCount(teacher: TeachingTeacher): number {
  return teacher.teacherClasses
    .filter((group) => group.isActive)
    .reduce((total, group) => total + group._count.enrollments, 0);
}

export function teachingCoverage(
  teachers: TeachingTeacher[],
  classes: ClassGroupItem[],
): Coverage {
  const activeClasses = classes.filter((group) => group.isActive);
  const inactiveTeachers = teachers.filter((teacher) => teacher.status !== 'ACTIVE');

  return {
    teachers: teachers.length,
    activeTeachers: teachers.length - inactiveTeachers.length,
    inactiveTeachers: inactiveTeachers.length,
    classes: activeClasses.length,
    staffed: activeClasses.filter((group) => group.teacherId).length,
    unstaffed: activeClasses.filter((group) => !group.teacherId).length,
    blocked: activeClasses.filter(
      (group) => eligibleTeachers(group, teachers).length === 0,
    ).length,
  };
}

export function filterTeachers(
  teachers: TeachingTeacher[],
  filters: TeachingFilters,
): TeachingTeacher[] {
  const query = filters.query.trim().toLowerCase();
  return teachers.filter((teacher) => {
    if (filters.teacherStatus === 'ACTIVE' && teacher.status !== 'ACTIVE') return false;
    if (filters.teacherStatus === 'inactive' && teacher.status === 'ACTIVE') return false;
    if (
      filters.levelId &&
      !teacher.teachingLevels.some((approved) => approved.levelId === filters.levelId)
    ) {
      return false;
    }
    if (query && !`${teacher.firstName} ${teacher.lastName} ${teacher.email}`.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });
}

export function filterClasses(
  classes: ClassGroupItem[],
  teachers: TeachingTeacher[],
  filters: TeachingFilters,
  coverage: CoverageFilter,
): ClassGroupItem[] {
  const query = filters.query.trim().toLowerCase();
  return classes.filter((group) => {
    if (filters.levelId && group.levelId !== filters.levelId) return false;
    // Coverage counts are active-class only, so the filter must agree.
    if (coverage === 'unstaffed' && (!group.isActive || group.teacherId)) return false;
    if (coverage === 'blocked' && (!group.isActive || eligibleTeachers(group, teachers).length)) {
      return false;
    }
    if (
      query &&
      !`${group.name} ${group.code} ${group.level.code} ${group.intake.name} ${group.campus.name}`
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });
}

export const hasTeachingFilters = (filters: TeachingFilters): boolean =>
  Boolean(filters.query.trim() || filters.levelId || filters.teacherStatus);

/**
 * The backend refuses to drop a teaching level while an active class still runs
 * on it (`PUT /users/:id/teaching-levels` → 409). Recover the class name so the
 * UI can point the academic admin at the exact row that blocks the save.
 */
export function conflictClassName(message: string): string | null {
  const match = /^Reassign or deactivate (.+) before removing its teaching level$/.exec(message);
  return match?.[1] ?? null;
}