import type { Prisma } from '../generated/prisma/client.js';
import { isScheduleWriteConflict } from '../modules/sessions/session-conflicts.js';
import { conflict } from './http-error.js';
import { prisma } from './prisma.js';
export async function academicTransaction<T>(work:(tx:Prisma.TransactionClient)=>Promise<T>):Promise<T>{
  try{return await prisma.$transaction(work,{isolationLevel:'Serializable',timeout:15000});}
  catch(error){if(isScheduleWriteConflict(error))throw conflict('Another academic record changed at the same time. Refresh and review before saving.');throw error;}
}
