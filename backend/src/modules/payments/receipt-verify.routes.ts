import type { Request, Response } from "express";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { idParam } from "../../lib/query.js";
import { validatedParams } from "../../lib/request.js";
import { validate } from "../../middleware/validate.js";
import { verifyReceipt } from "./verify-receipt.js";

/** Public, no sign-in: anyone holding a printed receipt can check it. */
export const receiptVerifyRouter = Router();
receiptVerifyRouter.get("/verify/:id", validate({ params: idParam }), asyncHandler(async (req: Request, res: Response) => {
  const { id } = validatedParams<{ id: string }>(req);
  res.setHeader("X-Robots-Tag", "noindex");
  res.json({ success: true, data: await verifyReceipt(id) });
}));
