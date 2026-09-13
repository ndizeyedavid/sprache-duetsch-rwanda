import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const rateLimited = (message: string) => ({
  success: false,
  error: { code: "RATE_LIMITED", message },
});

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimited("Too many requests, please try again later"),
});

// Tighter budget for credential endpoints; successful logins do not count.
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: rateLimited("Too many authentication attempts, please try again later"),
});
