import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./applications.controller.js";
import {
applicationIdSchema,
createApplicationSchema,
createStudentFromApplicationSchema,
listApplicationsQuerySchema,
transitionApplicationSchema,
updateApplicationSchema,
waitlistQuerySchema,
} from "./applications.schema.js";

export const applicationsRouter = Router();

// Public form: a tight per-IP budget (each new application queues an email).
const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many applications from this connection. Please try again later." } },
});

applicationsRouter.post("/", applicationLimiter, validate({ body: createApplicationSchema }), asyncHandler(controller.create));

// Admissions queue: academic admins and super admins only (no finance data is returned).
const staff = Router();
staff.use(requireAuth, requireRole(...ADMIN_ROLES));
staff.get("/", validate({ query: listApplicationsQuerySchema }), asyncHandler(controller.list));
staff.get("/summary", validate({ query: listApplicationsQuerySchema }), asyncHandler(controller.summary));
staff.get("/waitlist", validate({ query: waitlistQuerySchema }), asyncHandler(controller.waitlist));
staff.get("/:id", validate({ params: applicationIdSchema }), asyncHandler(controller.get));
staff.patch("/:id", validate({ params: applicationIdSchema, body: updateApplicationSchema }), asyncHandler(controller.update));
staff.post("/:id/status", validate({ params: applicationIdSchema, body: transitionApplicationSchema }), asyncHandler(controller.transition));
staff.post("/:id/student", validate({ params: applicationIdSchema, body: createStudentFromApplicationSchema }), asyncHandler(controller.createStudent));

applicationsRouter.use(staff);
