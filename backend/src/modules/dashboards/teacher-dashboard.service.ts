import type { Prisma,Role } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { getPracticeActivityIds } from "../content/practice.utils.js";
import type { DashboardFilter } from './dashboards.schema.js';
export async function getTeacherDashboard(userId: string, role: Role, filter: DashboardFilter) {
  const where: Prisma.ClassGroupWhereInput={isActive:true,...(role==='TEACHER'?{teacherId:userId}:filter.teacherId?{teacherId:filter.teacherId}:{}),...(filter.levelId?{levelId:filter.levelId}:{}),...(filter.campusId?{campusId:filter.campusId}:{}),...(filter.intakeId?{intakeId:filter.intakeId}:{})};
  const classes=await prisma.classGroup.findMany({where,select:{id:true,levelId:true,name:true,enrollments:{where:{status:{in:['ACTIVE','COMPLETED']}},select:{studentId:true,status:true,enrolledAt:true}}}});
  const classIds=classes.map(c=>c.id),levelIds=[...new Set(classes.map(c=>c.levelId))],studentIds=[...new Set(classes.flatMap(c=>c.enrollments.filter(e=>e.status==='ACTIVE').map(e=>e.studentId)))];
  const now=new Date(),monthAgo=new Date(now.getTime()-30*86400000);
  const [attempts,homework,upcoming,past,recentAssessments,pendingActivityCount]=await Promise.all([
    prisma.attempt.findMany({where:{status:'SUBMITTED',studentId:{in:studentIds},assessment:{levelId:{in:levelIds}}},select:{studentId:true,assessment:{select:{levelId:true}}}}),
    prisma.assignmentSubmission.findMany({where:{status:'SUBMITTED',assignment:{classGroupId:{in:classIds}}},select:{assignment:{select:{classGroupId:true}}}}),
    prisma.classSession.findMany({where:{classGroupId:{in:classIds},status:{in:['SCHEDULED','LIVE','RESCHEDULED']},endAt:{gt:now}},orderBy:{startAt:'asc'},select:{id:true,title:true,startAt:true,endAt:true,status:true,classGroup:{select:{id:true,code:true,name:true}}}}),
    prisma.classSession.findMany({where:{classGroupId:{in:classIds},status:{not:'CANCELLED'},startAt:{gte:monthAgo,lte:now}},orderBy:{startAt:'desc'},select:{id:true,title:true,classGroupId:true,startAt:true,endAt:true,attendance:{select:{studentId:true}}}}),
    prisma.assessment.findMany({where:{isPublished:true,levelId:{in:levelIds}},orderBy:{createdAt:'desc'},take:5,select:{id:true,title:true,type:true,createdAt:true}}),
    prisma.activitySubmission.count({where:{status:'SUBMITTED',studentId:{in:studentIds},activityId:{notIn:await getPracticeActivityIds()},activity:{lesson:{module:{levelId:{in:levelIds}}}}}}),
  ]);
  const attendanceNeeds=past.flatMap(s=>{const group=classes.find(c=>c.id===s.classGroupId)!;const expected=new Set(group.enrollments.filter(e=>e.enrolledAt<=s.endAt).map(e=>e.studentId));const marked=new Set(s.attendance.map(a=>a.studentId));const unmarked=[...expected].filter(id=>!marked.has(id)).length;return unmarked?[{id:s.id,title:s.title,className:group.name,startAt:s.startAt,unmarked}]:[];});
  const gradingByClass=classes.map(c=>({classGroupId:c.id,className:c.name,assessments:attempts.filter(a=>a.assessment.levelId===c.levelId&&c.enrollments.some(e=>e.studentId===a.studentId&&e.status==='ACTIVE')).length,homework:homework.filter(h=>h.assignment.classGroupId===c.id).length}));
  return {classesCount:classes.length,studentsCount:studentIds.length,upcomingSessionsCount:upcoming.length,pendingGradingCount:attempts.length,pendingHomeworkCount:homework.length,pendingActivityCount,attendanceNeeds,gradingByClass,upcoming,sessionsToday:upcoming.filter(s=>s.startAt.toISOString().slice(0,10)===now.toISOString().slice(0,10)),recentAssessments};
}
