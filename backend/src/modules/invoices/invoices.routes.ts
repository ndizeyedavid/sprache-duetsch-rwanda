import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { checkoutSchema } from "../paypack/paypack.schema.js";
import * as controller from "./invoices.controller.js";
import { invoiceCheckoutParam, invoiceTokenParam } from "./invoices.schema.js";

// Public: the signed token in the path is the only credential (emailed in balance reminders).
export const invoicesRouter = Router();
const readLimit = rateLimit({ windowMs: 60000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false });
invoicesRouter.get("/:token", readLimit, validate({ params: invoiceTokenParam }), asyncHandler(controller.show));
invoicesRouter.post("/:token/pay", rateLimit({ windowMs: 60000, limit: 5 }),
  validate({ params: invoiceTokenParam, body: checkoutSchema }), asyncHandler(controller.pay));
invoicesRouter.get("/:token/checkouts/:id", readLimit, validate({ params: invoiceCheckoutParam }), asyncHandler(controller.check));
