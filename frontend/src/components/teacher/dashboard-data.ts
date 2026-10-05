import { apiGet } from '../../lib/api';
import type { TeacherDashboard } from '../../lib/services';
export type TeachingOverview = TeacherDashboard & { pendingHomeworkCount: number; pendingActivityCount: number; attendanceNeeds: { id:string;title:string|null;className:string;startAt:string;unmarked:number }[]; gradingByClass: {classGroupId:string;className:string;assessments:number;homework:number}[]; upcoming: TeacherDashboard['sessionsToday'] };
export const loadTeachingOverview=()=>apiGet<TeachingOverview>('/dashboards/teacher');
