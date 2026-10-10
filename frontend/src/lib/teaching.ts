import { apiGet,apiPatch,apiPut } from './api';
import { listLevels } from './services';
export type TeachingTeacher = { id: string; firstName: string; lastName: string; email: string; status: string; teachingLevels: { levelId: string; assignedAt: string; level: { id: string; code: string; title: string; isActive: boolean } }[]; teacherClasses: { id: string; name: string; levelId: string; isActive: boolean; _count: { enrollments: number } }[] };
export const listTeachingAssignments = () => apiGet<TeachingTeacher[]>('/users/teaching-assignments');
export const assignTeachingLevels = (id: string, levelIds: string[]) => apiPut(`/users/${id}/teaching-levels`, { levelIds });
export const assignClassTeacher = (id: string, teacherId: string | null) => apiPatch(`/classes/${id}`, { teacherId });
export async function listMyTeachingLevels() { const [ids,levels]=await Promise.all([apiGet<string[]>('/users/me/teaching-levels'),listLevels()]); return levels.filter(l=>ids.includes(l.id)); }
