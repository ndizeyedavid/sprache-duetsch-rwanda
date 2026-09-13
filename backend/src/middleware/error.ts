import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env.js";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
};

const PRISMA_STATUS: Record<string, { status: number; code: string; message: string }> = {
  P2002: { status: 409, code: "DUPLICATE", message: "A record with these details already exists" },
  P2003: { status: 409, code: "FK_CONSTRAINT", message: "Related record constraint failed" },
  P2025: { status: 404, code: "NOT_FOUND", message: "Record not found" },
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: error.issues },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_STATUS[error.code];
    if (mapped) {
      res.status(mapped.status).json({
        success: false,
        error: { code: mapped.code, message: mapped.message, details: error.meta },
      });
      return;
    }
  }

  logger.error({ err: error }, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        isProduction || !(error instanceof Error)
          ? "Something went wrong on our side"
          : error.message,
    },
  });
};
