import type { ClassGroupItem,LevelItem } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';

/** Teacher-account scope for the level approval roster. */
export type TeacherStatusFilter = 'ACTIVE' | 'inactive' | '';

/**
 * The two class states that need academic attention. They double as the filter
 * the coverage strip toggles, so the number that needs action is the control.
 */
export type CoverageFilter = 'unstaffed' | 'blocked' | '';

/** One filter bar drives both rosters, so the page keeps a single scoping control. */
export type TeachingFilters = {
  query: string;
  levelId: string;
  teacherStatus: TeacherStatusFilter;
};

/** Only ever computed from active classes, so counts and the coverage filters agree. */
export type Coverage = {
  teachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  classes: number;
  staffed: number;
  unstaffed: number;
  /** Active classes whose level no active teacher is approved for. */
  blocked: number;
};

export type TeacherRosterProps = {
  teachers: TeachingTeacher[];
  levels: LevelItem[];
};

export type ClassRosterProps = {
  classes: ClassGroupItem[];
  teachers: TeachingTeacher[];
};