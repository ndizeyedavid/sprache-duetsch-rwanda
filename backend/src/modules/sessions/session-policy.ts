import { z } from 'zod';
import type { ClassSession,Prisma } from '../../generated/prisma/client.js';
import { badRequest,conflict } from '../../lib/http-error.js';
export const safeSessionUrl = z.string().trim().max(1000).url().refine(v => ['https:', 'http:'].includes(new URL(v).protocol), 'Use an HTTP or HTTPS URL').nullable().optional();
export const timezoneSchema = z.string().trim().max(64).refine(v => { try { new Intl.DateTimeFormat('en', { timeZone: v }); return true; } catch { return false; } }, 'Invalid timezone').optional();
export function checkSessionChange(before: ClassSession, input: { startAt?: Date; endAt?: Date; status?: string; title?: unknown; mode?: unknown; provider?: unknown; meetingUrl?: unknown; timezone?: unknown; room?: unknown }, now = new Date()) {
  const scheduling = ['startAt','endAt','title','mode','provider','meetingUrl','timezone','room'].some(k => input[k as keyof typeof input] !== undefined);
  if (['COMPLETED','CANCELLED'].includes(before.status) && (scheduling || input.status && input.status !== before.status)) throw conflict('This session is closed. Only notes, recordings and materials can be updated.');
  if (input.status === 'LIVE' && (before.startAt > now || before.endAt <= now)) throw badRequest('A session can only be started during its scheduled time.');
  if (input.status === 'COMPLETED' && before.startAt > now) throw badRequest('A future session cannot be completed.');
  if (before.status === 'LIVE' && input.status && !['LIVE','COMPLETED','CANCELLED'].includes(input.status)) throw conflict('A live session can only be completed or cancelled.');
  if (before.endAt <= now && scheduling) throw conflict('Past sessions cannot be rescheduled or have scheduling details changed.');
}
export async function checkOverlap(tx: Prisma.TransactionClient, session: { classGroupId: string; teacherId: string | null; startAt: Date; endAt: Date; mode: string; room: string | null }, id?: string) {
  const match = await tx.classSession.findFirst({ where: { ...(id ? { id: { not: id } } : {}), status: { notIn: ['CANCELLED','COMPLETED'] }, startAt: { lt: session.endAt }, endAt: { gt: session.startAt }, OR: [{ classGroupId: session.classGroupId }, ...(session.teacherId ? [{ teacherId: session.teacherId }] : []), ...(session.room && session.mode !== 'ONLINE' ? [{ room: session.room, classGroup: { campusId: (await tx.classGroup.findUniqueOrThrow({where:{id:session.classGroupId},select:{campusId:true}})).campusId } }] : [])] }, select: { title: true } });
  if (match) throw conflict(`This time overlaps with ${match.title ?? 'another class'} for the class, teacher or room.`);
}
