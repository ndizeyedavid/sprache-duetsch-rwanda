import type { RequestHandler } from "express";
import { logger } from "../../lib/logger.js";
import { validatedBody } from "../../lib/request.js";
import type { EnrollmentConfirmInput } from "./enrollment.schema.js";
import { recordWebsiteEnrollment } from "./enrollment.service.js";

export const confirmEnrollment: RequestHandler = (req, res) => {
  const input = validatedBody<EnrollmentConfirmInput>(req);

  // Contract kept for the external site: answer immediately, never hang on the database or mail.
  res.status(200).json({ success: true, data: { sent: true, message: "Enrollment received — confirmation email is on its way." } });

  // Saved as a WEBSITE application; the confirmation email is queued only for a new record.
  recordWebsiteEnrollment(input)
    .then((result) => logger.info({ reference: result.reference, created: result.created }, "Website enrollment recorded"))
    .catch((err: unknown) => logger.error({ err }, "Website enrollment could not be recorded"));
};
