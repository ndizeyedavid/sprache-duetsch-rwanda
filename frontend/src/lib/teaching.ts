import { apiDelete,apiGet,apiPatch,apiPost,apiPut } from './api';
import { listLevels } from './services';
/** A class as the Teachers page sees it: enough to group by intake without the (intake-scoped) class list. */
export type TeachingClass = { id: string; name: string; code: string; levelId: string; isActive: boolean; shift: string; capacity: number; level: { code: string }; intake: { id: string; name: string }; campus: { name: string }; _count: { enrollments: number } };
export type TeachingTeacher = { id: string; firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null; status: string; lastLoginAt: string | null; teachingLevels: { levelId: string; assignedAt: string; level: { id: string; code: string; title: string; isActive: boolean } }[]; teachingIntakes: { intakeId: string; assignedAt: string; intake: { id: string; name: string; startDate: string; endDate: string; isActive: boolean } }[]; teacherClasses: TeachingClass[] };
export const listTeachingAssignments = () => apiGet<TeachingTeacher[]>('/users/teaching-assignments');
export const assignTeachingLevels = (id: string, levelIds: string[]) => apiPut(`/users/${id}/teaching-levels`, { levelIds });
export const assignClassTeacher = (id: string, teacherId: string | null) => apiPatch(`/classes/${id}`, { teacherId });
export async function listMyTeachingLevels() { const [ids,levels]=await Promise.all([apiGet<string[]>('/users/me/teaching-levels'),listLevels()]); return levels.filter(l=>ids.includes(l.id)); }

export const addTeacherIntake = (id: string, intakeId: string) => apiPost(`/users/${id}/teaching-intakes/${intakeId}`, {});
export const removeTeacherIntake = (id: string, intakeId: string) => apiDelete(`/users/${id}/teaching-intakes/${intakeId}`);
