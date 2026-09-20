import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { corsOrigins, defaultEnrollmentOrigins, enrollmentAllowedOrigins, isTest } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { globalLimiter } from "./middleware/rate-limit.js";
import { apiRouter } from "./routes.js";

export const createApp = (): Express => {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginEmbedderPolicy: false,
    }),
  );
  // Enrollment site is external (Vercel + custom domain) — allow it even if CORS_ORIGINS not yet updated on Render
  const enrollmentOrigins = [...new Set([...enrollmentAllowedOrigins, ...defaultEnrollmentOrigins])];
  const allowedOrigins = [...new Set([...corsOrigins, ...enrollmentOrigins])];
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());

  if (!isTest) {
    app.use(
      pinoHttp({
        logger,
        autoLogging: { ignore: (req) => req.url === "/api/health" },
      }),
    );
  }

  app.use(globalLimiter);
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
