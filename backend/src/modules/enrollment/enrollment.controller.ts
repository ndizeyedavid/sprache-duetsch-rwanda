import type { RequestHandler } from "express";
import { validatedBody } from "../../lib/request.js";
import { logger } from "../../lib/logger.js";
import { sendEnrollmentConfirmation } from "./enrollment.service.js";
import type { EnrollmentConfirmInput } from "./enrollment.schema.js";

export const confirmEnrollment: RequestHandler = async (req, res) => {
  const input = validatedBody<EnrollmentConfirmInput>(req);

  // Respond immediately so the enrollment site never hangs — email sends in background.
  // This also avoids Render's 30s proxy timeout on slow SMTP handshakes.
  res.status(200).json({ success: true, data: { sent: true, message: "Enrollment received — confirmation email is on its way." } });

  // Background send with detailed error logging (visible in Render → Logs)
  sendEnrollmentConfirmation(input).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string })?.code;
    const response = (err as { response?: string })?.response;
    logger.error({ err, email: input.email, code, response, msg }, "Enrollment confirmation email failed");
  });
};
