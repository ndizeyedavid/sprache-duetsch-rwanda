import type { Prisma } from '../../generated/prisma/client.js';
import { writeAuditTx } from '../../lib/audit.js';
import { badRequest,conflict,forbidden,notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { isScheduleWriteConflict } from '../sessions/session-conflicts.js';
import { checkOverlap } from '../sessions/session-policy.js';
import type { CreateClassInput,UpdateClassInput } from './classes.schema.js';
async function transact<T>(work:(tx:Prisma.TransactionClient)=>Promise<T>):Promise<T>{try{return await prisma.$transaction(work,{isolationLevel:'Serializable',timeout:15000});}catch(e){if(isScheduleWriteConflict(e))throw conflict('Another assignment changed at the same time. Please retry.');throw e;}}
async function validateTeacher(tx:Prisma.TransactionClient,id:string,levelId:string){
  const teacher=await tx.user.findUnique({where:{id},select:{role:true,status:true}});
  if(!teacher||teacher.role!=='TEACHER'||teacher.status!=='ACTIVE')throw badRequest('Choose an active teacher');
  if(!await tx.teacherLevel.findUnique({where:{teacherId_levelId:{teacherId:id,levelId}}}))throw forbidden('Academic staff must approve this teaching level before assigning the class');
}
async function validateReferences(tx:Prisma.TransactionClient,input:Partial<CreateClassInput>){
  if(input.levelId&&!await tx.level.findUnique({where:{id:input.levelId}}))throw notFound('Level not found');
  if(input.intakeId&&!await tx.intake.findUnique({where:{id:input.intakeId}}))throw notFound('Intake not found');
  if(input.campusId&&!await tx.campus.findUnique({where:{id:input.campusId}}))throw notFound('Campus not found');
}
export async function createClass(input:CreateClassInput,actorId?:string){return transact(async tx=>{
  if(await tx.classGroup.findUnique({where:{code:input.code}}))throw conflict('A class with this code already exists');
  await validateReferences(tx,input);
  if (input.levelId && input.intakeId && !await tx.intake.findFirst({ where: { id: input.intakeId, levels: { some: { id: input.levelId } } } })) throw badRequest('This level is not offered in the selected intake');
  if(input.teacherId)await validateTeacher(tx,input.teacherId,input.levelId);
  const row=await tx.classGroup.create({data:{...input,teacherId:input.teacherId??null,capacity:input.capacity??30,isActive:input.isActive??true}});
  await writeAuditTx(tx,{actorId,action:'CLASS_CREATED',entityType:'ClassGroup',entityId:row.id,after:row});return row;
});}
export async function updateClass(id:string,input:UpdateClassInput,actorId?:string){return transact(async tx=>{
  const before=await tx.classGroup.findUnique({where:{id}});if(!before)throw notFound('Class not found');
  if(input.code&&input.code!==before.code&&await tx.classGroup.findUnique({where:{code:input.code}}))throw conflict('A class with this code already exists');
  await validateReferences(tx,input);
  if (!await tx.intake.findFirst({ where: { id: input.intakeId ?? before.intakeId, levels: { some: { id: input.levelId ?? before.levelId } } } })) throw badRequest('This level is not offered in the selected intake');
  if(input.levelId&&input.levelId!==before.levelId&&await tx.enrollment.count({where:{classGroupId:id}}))throw conflict('A class with enrolled students cannot change levels. Create a new class instead.');
  if(input.capacity!==undefined&&await tx.enrollment.count({where:{classGroupId:id,status:"ACTIVE"}})>input.capacity)throw conflict("Capacity cannot be lower than active enrolments");
  if((input.intakeId&&input.intakeId!==before.intakeId||input.campusId&&input.campusId!==before.campusId)&&await tx.enrollment.count({where:{classGroupId:id}}))throw conflict("A class with enrolments cannot change intake or campus");
  const teacherId=input.teacherId===undefined?before.teacherId:input.teacherId;
  if(teacherId&&(input.isActive??before.isActive))await validateTeacher(tx,teacherId,input.levelId??before.levelId);
  if(input.teacherId!==undefined&&teacherId!==before.teacherId){
    const future=await tx.classSession.findMany({where:{classGroupId:id,startAt:{gt:new Date()},status:{in:['SCHEDULED','RESCHEDULED']}}});
    for(const session of future){if(teacherId)await checkOverlap(tx,{...session,teacherId},session.id);await tx.classSession.update({where:{id:session.id},data:{teacherId}});}
  }
  const row=await tx.classGroup.update({where:{id},data:input});
  await writeAuditTx(tx,{actorId,action:'CLASS_UPDATED',entityType:'ClassGroup',entityId:id,before,after:row});return row;
});}
export async function deleteClass(id:string,actorId?:string){return updateClass(id,{isActive:false},actorId);}
