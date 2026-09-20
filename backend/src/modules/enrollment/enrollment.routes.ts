import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.js";
import { enrollmentConfirmSchema } from "./enrollment.schema.js";
import { confirmEnrollment } from "./enrollment.controller.js";

export const enrollmentRouter = Router();

// Public endpoint — called by the external registration site.
// No auth. Rate-limited to avoid abuse; CORS still enforced globally via CORS_ORIGINS.
const enrollmentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many requests, please try again later." } },
});

// POST /api/enrollment/confirm
enrollmentRouter.post("/confirm", enrollmentLimiter, validate({ body: enrollmentConfirmSchema }), confirmEnrollment);
