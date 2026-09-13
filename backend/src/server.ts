import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { startReminderJobs } from "./lib/reminders.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Deutsch Sprache RW API listening on http://localhost:${env.PORT}`);
  startReminderJobs();
});

let shuttingDown = false;

const shutdown = (signal: string): void => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  logger.info({ signal }, "Shutting down");

  const forceExit = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(() => {
    void prisma
      .$disconnect()
      .catch((error: unknown) => logger.error({ err: error }, "Prisma disconnect failed"))
      .finally(() => process.exit(0));
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
