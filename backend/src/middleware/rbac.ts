import type { RequestHandler } from "express";
import type { Role } from "../generated/prisma/client.js";
import { forbidden, unauthorized } from "../lib/http-error.js";

/** Route guard: the authenticated user must hold one of the given roles. */
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(forbidden("Your role does not allow this action"));
      return;
    }

    next();
  };
