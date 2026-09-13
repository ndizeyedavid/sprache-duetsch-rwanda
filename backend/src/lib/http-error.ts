// Application error with an HTTP status and a stable machine-readable code.
// Anything thrown that is not an AppError becomes a 500 by the error handler.
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    options?: { code?: string; details?: unknown },
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = options?.code ?? "ERROR";
    this.details = options?.details;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest = (message: string, details?: unknown): AppError =>
  new AppError(400, message, { code: "BAD_REQUEST", details });

export const unauthorized = (message = "Authentication required"): AppError =>
  new AppError(401, message, { code: "UNAUTHORIZED" });

export const forbidden = (message = "Insufficient permissions"): AppError =>
  new AppError(403, message, { code: "FORBIDDEN" });

export const notFound = (message = "Resource not found"): AppError =>
  new AppError(404, message, { code: "NOT_FOUND" });

export const conflict = (message: string, details?: unknown): AppError =>
  new AppError(409, message, { code: "CONFLICT", details });

export const unprocessable = (message: string, details?: unknown): AppError =>
  new AppError(422, message, { code: "UNPROCESSABLE_ENTITY", details });

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
