import type { ClassSession,Prisma,Role } from '../../generated/prisma/client.js';
import { assertTeacherOwnsClass } from '../../lib/access.js';
import { writeAudit } from '../../lib/audit.js';
import { badRequest,conflict,forbidden,notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { assertTeacherLevel } from "../../lib/teacher-levels.js";
import { assertValidTeacher } from './session-access.js';
import { isScheduleWriteConflict } from './session-conflicts.js';
import { addSessionWeeks } from "./session-dates.js";
import { notifySessionChange } from './session-notifications.js';
import { checkOverlap,checkSessionChange } from './session-policy.js';
import type { CancelSessionInput,CreateSessionInput,RescheduleSessionInput,UpdateSessionInput } from './sessions.schema.js';
async function transact<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  try { return await prisma.$transaction(work, { isolationLevel: 'Serializable', timeout: 15000 }); }
  catch(e) { if(isScheduleWriteConflict(e)) throw conflict('Another schedule change happened at the same time. Please retry.'); throw e; }
}
async function ownClass(classId:string,actorId?:string,role?:Role) {
  if(role==='TEACHER') { if(!actorId) throw forbidden(); await assertTeacherOwnsClass(actorId,classId); }
}
function validateTiming(startAt:Date,endAt:Date,mode:string,url:string|null) {
  if(startAt>=endAt) throw badRequest('Start must be before end.');
  if(['ONLINE','HYBRID'].includes(mode)&&!url) throw badRequest('Meeting link is required for online and hybrid classes.');
}
async function audit(action:string,after:ClassSession,actorId?:string,before?:ClassSession,reason?:string|null) {
  await writeAudit({actorId:actorId??null,action,entityType:'ClassSession',entityId:after.id,before,after,reason:reason??null});
}
export async function createSession(input:CreateSessionInput,actorId?:string,role?:Role) {
  const group=await prisma.classGroup.findUnique({where:{id:input.classGroupId},select:{teacherId:true,isActive:true,levelId:true}});
  if(!group) throw notFound('Class group not found');
  if(!group.isActive) throw badRequest('Class group is inactive');
  await ownClass(input.classGroupId,actorId,role);
  const teacherId=input.teacherId??group.teacherId;
  await assertValidTeacher(teacherId);
  if(teacherId) await assertTeacherLevel(teacherId,group.levelId);
  if(role==='TEACHER'&&teacherId!==actorId) throw forbidden('Teachers cannot assign sessions to another teacher.');
  validateTiming(input.startAt,input.endAt,input.mode,input.meetingUrl??null);
  if(input.startAt<=new Date()) throw badRequest('New sessions must start in the future.');
  const rows=await transact(async tx=>{
    const created:ClassSession[]=[];
    for(let i=0;i<(input.repeatWeeks??1);i++) {
      const data={classGroupId:input.classGroupId,teacherId,title:input.title??null,mode:input.mode,provider:input.provider,meetingUrl:input.meetingUrl??null,startAt:addSessionWeeks(input.startAt,i,input.timezone??'Africa/Kigali'),endAt:addSessionWeeks(input.endAt,i,input.timezone??'Africa/Kigali'),timezone:input.timezone??'Africa/Kigali',room:input.room??null,recordingUrl:input.recordingUrl??null,notes:input.notes??null};
      await checkOverlap(tx,data);
      created.push(await tx.classSession.create({data}));
    }
    return created;
  });
  for(const row of rows) { await audit('SESSION_CREATED',row,actorId); await notifySessionChange(row,'New class scheduled'); }
  return rows[0];
}
export async function updateSession(id:string,input:Partial<UpdateSessionInput>,actorId?:string,role?:Role,reason?:string) {
  const before=await prisma.classSession.findUnique({where:{id}});
  if(!before) throw notFound('Session not found');
  await ownClass(before.classGroupId,actorId,role);
  checkSessionChange(before,input);
  if(input.status==='CANCELLED') return cancelSession(id,{reason:undefined},actorId,role);
  const startAt=input.startAt??before.startAt,endAt=input.endAt??before.endAt,mode=input.mode??before.mode;
  validateTiming(startAt,endAt,mode,input.meetingUrl===undefined?before.meetingUrl:input.meetingUrl);
  const moved=startAt.getTime()!==before.startAt.getTime()||endAt.getTime()!==before.endAt.getTime();
  if(moved&&startAt<=new Date()) throw badRequest('Rescheduled sessions must start in the future.');
  if(moved&&before.status==='LIVE') throw conflict('Complete or cancel the live class before scheduling a new one.');
  const row=await transact(async tx=>{
    if(!['COMPLETED','CANCELLED'].includes(before.status) && (moved || input.mode !== undefined || input.room !== undefined)) await checkOverlap(tx,{...before,startAt,endAt,mode,room:input.room===undefined?before.room:input.room??null},id);
    return tx.classSession.update({where:{id,updatedAt:before.updatedAt},data:{...input,...(moved?{status:'RESCHEDULED' as const}:{})}});
  });
  await audit(moved?'SESSION_RESCHEDULED':'SESSION_UPDATED',row,actorId,before,reason);
  if(moved||input.status||input.meetingUrl!==undefined||input.room!==undefined) await notifySessionChange(row,moved?'Class rescheduled':input.status==='LIVE'?'Class is live':input.status==='COMPLETED'?'Class completed':'Class details updated',reason);
  return row;
}
export async function cancelSession(id:string,input:CancelSessionInput,actorId?:string,role?:Role) {
  const before=await prisma.classSession.findUnique({where:{id}});
  if(!before) throw notFound('Session not found');
  await ownClass(before.classGroupId,actorId,role);
  if(before.status==='CANCELLED') return before;
  if(before.status==='COMPLETED'||before.endAt<=new Date()) throw conflict('Past or completed classes cannot be cancelled.');
  const row=await transact(tx => tx.classSession.update({where:{id,updatedAt:before.updatedAt},data:{status:'CANCELLED'}}));
  await audit('SESSION_CANCELLED',row,actorId,before,input.reason);
  await notifySessionChange(row,'Class cancelled',input.reason);
  return row;
}
export async function rescheduleSession(id:string,input:RescheduleSessionInput,actorId?:string,role?:Role) {
  return updateSession(id,{startAt:input.startAt,endAt:input.endAt},actorId,role,input.reason);
}
