export type TeacherStatusFilter = 'All' | 'Active' | 'Pending' | 'Inactive';

export type TeacherFilters = { query: string; levelId: string; status: TeacherStatusFilter };

export const EMPTY_TEACHER_FILTERS: TeacherFilters = { query: '', levelId: '', status: 'All' };
