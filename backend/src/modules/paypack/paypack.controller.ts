import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { validatedBody, validatedParams } from "../../lib/request.js";
import { resolveStudentId } from "../payments/resolve-student-id.js";
import { paypackEnabled } from "./paypack-client.js";
import type { CheckoutInput } from "./paypack.schema.js";
import { listMyCheckouts, refreshCheckout, startCheckout } from "./paypack.service.js";
import { closeUnsubmittedCheckout, reconcileCheckout } from "./review-checkout.js";

export const config = async (_req: Request, res: Response): Promise<void> => {
  const method = await prisma.paymentMethodConfig.findUnique({ where: { code: "PAYPACK" } });
  res.json({ success: true, data: { enabled: paypackEnabled() && method?.isActive !== false, minimumAmount: 100, currency: "RWF" } });
};
export const listMine = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await listMyCheckouts(req.user!.id) });
};
export const checkout = async (req: Request, res: Response): Promise<void> => {
  res.status(202).json({ success: true, data: await startCheckout(req.user!.id, validatedBody<CheckoutInput>(req)) });
};
export const list = async (_req: Request, res: Response): Promise<void> => {
  const rows = await prisma.paymentCheckout.findMany({ orderBy: { createdAt: "desc" }, take: 100,
    include: { student: { select: { studentCode: true, user: { select: { firstName: true, lastName: true } } } } } });
  res.json({ success: true, data: rows });
};
export const get = async (req: Request, res: Response): Promise<void> => {
  const studentId = req.user!.role === "STUDENT" ? await resolveStudentId(req.user!.id) : undefined;
  res.json({ success: true, data: await refreshCheckout(validatedParams<{ id: string }>(req).id, studentId) });
};
export const reconcile = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const { reference, reason } = validatedBody<{ reference: string; reason: string }>(req);
  res.json({ success: true, data: await reconcileCheckout(id, reference, reason, req.user!.id) });
};
export const close = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const { reason } = validatedBody<{ reason: string }>(req);
  res.json({ success: true, data: await closeUnsubmittedCheckout(id, reason, req.user!.id) });
};
