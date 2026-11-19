import { AppError, badRequest } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import type { GatewayRefusal } from "./xendly-client.js";

/** Turns a XendlyPay refusal into what the payer should read. Key or account problems are never shown to them. */
export function refusalError(error: GatewayRefusal): AppError {
  if (error.status === 401 || error.status === 403) {
    logger.error({ status: error.status, message: error.message }, "XendlyPay rejected the API key or app");
    return new AppError(503, "Online payments are temporarily unavailable. Please contact finance.");
  }
  if (error.status === 429) return new AppError(503, "Payments are busy right now. Please try again in a minute.");
  return badRequest(error.message);
}
