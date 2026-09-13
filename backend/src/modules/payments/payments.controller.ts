import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type {
  CreateChargeInput,
  CreateDiscountInput,
  CreatePaymentInput,
  CreatePaymentMethodInput,
  CreateRefundInput,
  DeleteChargeInput,
  DeletePaymentInput,
  FinanceSummaryQuery,
  ListChargesQuery,
  ListDiscountsQuery,
  ListPaymentMethodQuery,
  ListPaymentsQuery,
  ListReceiptsQuery,
  MyReceiptsQuery,
  OutstandingQuery,
  RejectDiscountInput,
  RunRemindersInput,
  UpdateChargeInput,
  UpdatePaymentInput,
  UpdatePaymentMethodInput,
} from "./payments.schema.js";
import * as service from "./payments.service.js";

// --- Payment methods ---

export const listMethods = async (req: Request, res: Response): Promise<void> => {
  const data = await service.listPaymentMethods(validatedQuery<ListPaymentMethodQuery>(req));
  res.json({ success: true, data });
};

export const createMethod = async (req: Request, res: Response): Promise<void> => {
  const method = await service.createPaymentMethod(
    validatedBody<CreatePaymentMethodInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data: method });
};

export const updateMethod = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const method = await service.updatePaymentMethod(
    id,
    validatedBody<UpdatePaymentMethodInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: method });
};

export const disableMethod = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const method = await service.disablePaymentMethod(id, actorId(req));
  res.json({ success: true, data: method });
};

// --- Charges ---

export const createCharge = async (req: Request, res: Response): Promise<void> => {
  const charge = await service.createCharge(validatedBody<CreateChargeInput>(req), actorId(req));
  res.status(201).json({ success: true, data: charge });
};

export const listCharges = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listCharges(validatedQuery<ListChargesQuery>(req));
  res.json({ success: true, ...result });
};

export const updateCharge = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const charge = await service.updateCharge(
    id,
    validatedBody<UpdateChargeInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: charge });
};

export const deleteCharge = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteCharge(id, validatedBody<DeleteChargeInput>(req), actorId(req));
  res.json({ success: true, data: result });
};

// --- Discounts ---

export const createDiscount = async (req: Request, res: Response): Promise<void> => {
  const discount = await service.createDiscount(
    validatedBody<CreateDiscountInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data: discount });
};

export const listDiscounts = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listDiscounts(validatedQuery<ListDiscountsQuery>(req));
  res.json({ success: true, ...result });
};

export const approveDiscount = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const discount = await service.approveDiscount(id, actorId(req));
  res.json({ success: true, data: discount });
};

export const rejectDiscount = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const discount = await service.rejectDiscount(
    id,
    validatedBody<RejectDiscountInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: discount });
};

// --- Payments ---

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const payment = await service.createPayment(
    validatedBody<CreatePaymentInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data: payment });
};

export const listPayments = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listPayments(validatedQuery<ListPaymentsQuery>(req));
  res.json({ success: true, ...result });
};

export const getPayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const payment = await service.getPayment(id);
  res.json({ success: true, data: payment });
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const payment = await service.updatePayment(
    id,
    validatedBody<UpdatePaymentInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: payment });
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deletePayment(
    id,
    validatedBody<DeletePaymentInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: result });
};

export const createRefund = async (req: Request, res: Response): Promise<void> => {
  const refund = await service.createRefund(validatedBody<CreateRefundInput>(req), actorId(req));
  res.status(201).json({ success: true, data: refund });
};

// --- Receipts ---

export const listReceipts = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listReceipts(validatedQuery<ListReceiptsQuery>(req));
  res.json({ success: true, ...result });
};

export const getReceipt = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const user = req.user!;
  const receipt = await service.getReceipt(id, { id: user.id, role: user.role });
  res.json({ success: true, data: receipt });
};

// --- Student self-service ---

export const getMyFinance = async (req: Request, res: Response): Promise<void> => {
  const finance = await service.getMyFinance(req.user!.id);
  res.json({ success: true, data: finance });
};

export const getMyReceipts = async (req: Request, res: Response): Promise<void> => {
  const result = await service.getMyReceipts(req.user!.id, validatedQuery<MyReceiptsQuery>(req));
  res.json({ success: true, ...result });
};

// --- Reports ---

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  const summary = await service.getFinanceSummary(validatedQuery<FinanceSummaryQuery>(req));
  res.json({ success: true, data: summary });
};

export const listOutstanding = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listOutstanding(validatedQuery<OutstandingQuery>(req));
  res.json({ success: true, ...result });
};

// --- Reminders ---

export const runReminders = async (req: Request, res: Response): Promise<void> => {
  const result = await service.runPaymentReminders(
    validatedBody<RunRemindersInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: result });
};
