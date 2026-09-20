import { Router } from "express";
import { asyncHandler } from "./lib/async-handler.js";
import { prisma } from "./lib/prisma.js";
import { activityRouter } from "./modules/activity/activity.routes.js";
import { articlesRouter } from "./modules/articles/articles.routes.js";
import { assessmentsRouter } from "./modules/assessments/assessments.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { campusesRouter } from "./modules/campuses/campuses.routes.js";
import { certificatesRouter } from "./modules/certificates/certificates.routes.js";
import { classesRouter } from "./modules/classes/classes.routes.js";
import { contentRouter } from "./modules/content/content.routes.js";
import { dashboardsRouter } from "./modules/dashboards/dashboards.routes.js";
import { enrollmentsRouter } from "./modules/enrollments/enrollments.routes.js";
import { intakesRouter } from "./modules/intakes/intakes.routes.js";
import { levelsRouter } from "./modules/levels/levels.routes.js";
import { messagesRouter } from "./modules/messages/messages.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { uploadsRouter } from "./modules/uploads/uploads.routes.js";
import { paymentsRouter } from "./modules/payments/payments.routes.js";
import { attendanceRouter, sessionsRouter } from "./modules/sessions/sessions.routes.js";
import { enrollmentRouter } from "./modules/enrollment/enrollment.routes.js";
import { studentsRouter } from "./modules/students/students.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/campuses", campusesRouter);
apiRouter.use("/levels", levelsRouter);
apiRouter.use("/intakes", intakesRouter);
apiRouter.use("/classes", classesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/students", studentsRouter);
apiRouter.use("/enrollments", enrollmentsRouter);
apiRouter.use("/content", contentRouter);
apiRouter.use("/assessments", assessmentsRouter);
apiRouter.use("/sessions", sessionsRouter);
apiRouter.use("/attendance", attendanceRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/dashboards", dashboardsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/activity", activityRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/certificates", certificatesRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/enrollment", enrollmentRouter);

apiRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() },
    });
  }),
);
