import type { Request, RequestHandler } from "express";
import type { ZodType } from "zod";
import { badRequest } from "../lib/http-error.js";

export interface RequestSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

// Express 5 exposes `req.query` as a prototype getter, so it must be shadowed with an
// own data property instead of assigned. Parsed values replace the raw input.
const overrideQuery = (req: Request, value: unknown): void => {
  Object.defineProperty(req, "query", {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
};

export const validate =
  (schemas: RequestSchemas): RequestHandler =>
  (req, _res, next) => {
    const issues: Record<string, unknown> = {};
    const validated: { body?: unknown; query?: unknown; params?: unknown } = {};

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (result.success) {
        validated.params = result.data;
        req.params = result.data as typeof req.params;
      } else {
        issues.params = result.error.issues;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (result.success) {
        validated.query = result.data;
        overrideQuery(req, result.data);
      } else {
        issues.query = result.error.issues;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (result.success) {
        validated.body = result.data;
        req.body = result.data;
      } else {
        issues.body = result.error.issues;
      }
    }

    req.validated = validated;

    if (Object.keys(issues).length > 0) {
      next(badRequest("Request validation failed", issues));
      return;
    }

    next();
  };
