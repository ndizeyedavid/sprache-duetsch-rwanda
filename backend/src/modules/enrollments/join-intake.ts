import type { Request, Response } from 'express';
import { z } from 'zod';
import { forbidden } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { validatedBody } from '../../lib/request.js';
import { createEnrollment } from './enrollment-commands.js';

export const joinIntakeSchema = z.object({ intakeId: z.string().min(1), levelId: z.string().min(1) }).strict();
export async function joinIntake(req: Request, res: Response): Promise<void> {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.id }, select: { id: true } });
  if (!student) throw forbidden('No student profile is linked to this account');
  const input = validatedBody<z.infer<typeof joinIntakeSchema>>(req);
  const data = await createEnrollment({ ...input, studentId: student.id }, req.user!.id);
  res.status(201).json({ success: true, data });
}
