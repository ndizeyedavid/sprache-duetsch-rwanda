import type { RequestHandler } from "express";
import { validatedBody } from "../../lib/request.js";
import { logger } from "../../lib/logger.js";
import { sendEnrollmentConfirmation } from "./enrollment.service.js";
import type { EnrollmentConfirmInput } from "./enrollment.schema.js";

export const confirmEnrollment: RequestHandler = async (req, res) => {
  const input = validatedBody<EnrollmentConfirmInput>(req);

  // Fire-and-forget style would hide errors from the caller, so we await.
  // Validation already ensures email is present; service discards extra fields.
  try {
    await sendEnrollmentConfirmation(input);
  } catch (err) {
    logger.error({ err, email: input.email }, "Enrollment confirmation email failed");
    res.status(200).json({ success: true, data: { sent: false, message: "Enrollment received — confirmation email will be retried." } });
    return;
  }

  res.status(200).json({ success: true, data: { sent: true, message: "Confirmation email sent." } });
};
