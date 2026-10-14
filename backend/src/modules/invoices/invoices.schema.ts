import { z } from "zod";

export const invoiceTokenParam = z.object({ token: z.string().min(20).max(1000) });
export const invoiceCheckoutParam = invoiceTokenParam.extend({ id: z.string().uuid() });
