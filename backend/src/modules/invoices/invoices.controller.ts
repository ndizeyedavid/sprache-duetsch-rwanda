import type { Request, Response } from "express";
import { validatedBody, validatedParams } from "../../lib/request.js";
import type { CheckoutInput } from "../paypack/paypack.schema.js";
import { checkInvoicePayment, getInvoice, payInvoice } from "./invoices.service.js";

export const show = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await getInvoice(validatedParams<{ token: string }>(req).token) });
};
export const pay = async (req: Request, res: Response): Promise<void> => {
  const { token } = validatedParams<{ token: string }>(req);
  res.status(202).json({ success: true, data: await payInvoice(token, validatedBody<CheckoutInput>(req)) });
};
export const check = async (req: Request, res: Response): Promise<void> => {
  const { token, id } = validatedParams<{ token: string; id: string }>(req);
  res.json({ success: true, data: await checkInvoicePayment(token, id) });
};
