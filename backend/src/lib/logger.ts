import { pino } from "pino";
import { env,isDevelopment } from "../config/env.js";
import { REDACTED_PATHS } from "./log-redaction.js";

// Single app logger. Pretty output in development, JSON in production.
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "sparch-api", env: env.NODE_ENV },
  redact: { paths: REDACTED_PATHS, censor: "[redacted]" },
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname,service,env",
        },
      }
    : undefined,
});
