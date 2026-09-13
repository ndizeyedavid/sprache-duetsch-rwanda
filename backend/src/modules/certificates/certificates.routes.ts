import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES, STAFF_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./certificates.controller.js";
import {
  certificateIdSchema,
  issueCertificateSchema,
  listCertificatesQuerySchema,
  revokeCertificateSchema,
} from "./certificates.schema.js";

export const certificatesRouter = Router();

// Public verification for third parties (no login required).
certificatesRouter.get("/verify/:code", asyncHandler(controller.verify));

certificatesRouter.get(
  "/my",
  requireAuth,
  asyncHandler(controller.mine),
);

certificatesRouter.get(
  "/eligibility",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  asyncHandler(controller.eligibility),
);

certificatesRouter.get(
  "/",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate({ query: listCertificatesQuerySchema }),
  asyncHandler(controller.list),
);

certificatesRouter.post(
  "/",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ body: issueCertificateSchema }),
  asyncHandler(controller.issue),
);

certificatesRouter.get(
  "/:id",
  requireAuth,
  validate({ params: certificateIdSchema }),
  asyncHandler(controller.get),
);

certificatesRouter.get(
  "/:id/pdf",
  requireAuth,
  validate({ params: certificateIdSchema }),
  asyncHandler(controller.pdf),
);

certificatesRouter.post(
  "/:id/revoke",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: certificateIdSchema, body: revokeCertificateSchema }),
  asyncHandler(controller.revoke),
);

certificatesRouter.post(
  "/:id/reissue",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: certificateIdSchema }),
  asyncHandler(controller.reissue),
);
