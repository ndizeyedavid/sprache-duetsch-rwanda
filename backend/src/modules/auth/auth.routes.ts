import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "./auth.schema.js";

export const authRouter = Router();

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
