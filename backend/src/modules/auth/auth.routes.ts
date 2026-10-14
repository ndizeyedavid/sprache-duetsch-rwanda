import { Router } from "express";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { notFound } from "../../lib/http-error.js";
import { requireAuth } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./auth.controller.js";
import {
changePasswordSchema,
forgotPasswordSchema,
googleAuthSchema,
loginSchema,
logoutSchema,
refreshSchema,
registerOtpSchema,
registerSchema,
resetPasswordSchema,
updateProfileSchema,
} from "./auth.schema.js";

export const authRouter = Router();

// Step 1 of sign-up: email a one-time code. Step 2 (/register) must present it.
authRouter.post(
  "/register/otp",
  authLimiter,
  validate({ body: registerOtpSchema }),
  asyncHandler(controller.registerOtp),
);

authRouter.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(controller.register),
);

authRouter.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(controller.login),
);

// Google sign-in is kept for later but switched off unless GOOGLE_AUTH_ENABLED="true".
authRouter.post(
  "/google",
  (_req, _res, next) => next(env.GOOGLE_AUTH_ENABLED === "true" ? undefined : notFound("Google sign-in is disabled")),
  authLimiter,
  validate({ body: googleAuthSchema }),
  asyncHandler(controller.google),
);

authRouter.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(controller.refresh),
);

authRouter.post(
  "/logout",
  validate({ body: logoutSchema }),
  asyncHandler(controller.logout),
);

authRouter.get("/me", requireAuth, asyncHandler(controller.me));

authRouter.patch("/me", requireAuth, validate({ body: updateProfileSchema }), asyncHandler(controller.updateMe));

authRouter.post(
  "/forgot-password",
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(controller.forgotPassword),
);

authRouter.post(
  "/reset-password",
  authLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(controller.resetPassword),
);

authRouter.post(
  "/change-password",
  requireAuth,
  validate({ body: changePasswordSchema }),
  asyncHandler(controller.changePassword),
);
