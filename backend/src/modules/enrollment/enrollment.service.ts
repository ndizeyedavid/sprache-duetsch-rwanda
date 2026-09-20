import { env } from "../../config/env.js";
import { sendMail } from "../../lib/mailer.js";
import type { EnrollmentConfirmInput } from "./enrollment.schema.js";

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const sendEnrollmentConfirmation = async (input: EnrollmentConfirmInput): Promise<void> => {
  const firstName = input.first_name.trim();
  const course = (input.course ?? "").trim();
  const schedule = (input.schedule ?? "").trim();

  const subject = `Welcome to Deutsch Sprache RW — enrollment received${course ? ` · ${course}` : ""}`;

  const safeFirstName = escapeHtml(firstName);
  const safeCourse = escapeHtml(course || "your selected course");
  const safeSchedule = escapeHtml(schedule);

  const appUrl = env.PUBLIC_APP_URL.replace(/\/$/, "");

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#fdfbf7;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f204b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e7d9b0;border-radius:12px;overflow:hidden;">
        <!-- Flag bar -->
        <tr><td style="height:6px;line-height:6px;font-size:0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="height:6px;background:#000;"></td>
            <td style="height:6px;background:#dd0000;"></td>
            <td style="height:6px;background:#ffce00;"></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:28px 32px 8px;text-align:center;">
          <p style="margin:0;font-size:10px;letter-spacing:0.18em;font-weight:700;color:#c5a253;">DEUTSCH SPRACHE RW · KIGALI</p>
          <h1 style="margin:10px 0 0;font-size:22px;line-height:1.2;color:#0f204b;">Hello There, ${safeFirstName}! 🎉</h1>
          <p style="margin:6px 0 0;font-size:12px;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;">Enrollment confirmation</p>
        </td></tr>
        <tr><td style="padding:16px 32px 0;">
          <p style="margin:0;font-size:14px;line-height:1.7;color:#1f2937;">
            We received your enrollment for <strong style="color:#0f204b;">${safeCourse}</strong>${safeSchedule ? ` · <span style="color:#6b7280;">${safeSchedule}</span>` : ""}.
            Our team will review your submission and get back to you shortly with next steps.
          </p>
        </td></tr>
        <tr><td style="padding:18px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#fdfbf7;border:1px solid #f4e8c1;border-radius:10px;">
            <tr><td style="padding:14px 16px;">
              <p style="margin:0;font-size:12px;font-weight:700;color:#0f204b;">What happens next?</p>
              <ol style="margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.7;color:#374151;">
                <li>Our admissions team confirms your details and schedule.</li>
                <li>You'll receive placement / onboarding instructions by email.</li>
                <li>Once enrolled, sign in to access your course materials.</li>
              </ol>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:22px 32px 0;">
          <a href="${appUrl}/login" style="display:inline-block;padding:11px 22px;background:#0f204b;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:0.03em;">Go to Deutsch Sprache RW →</a>
          <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;">Or visit <a href="${appUrl}" style="color:#0f204b;text-decoration:underline;">${escapeHtml(appUrl)}</a></p>
        </td></tr>
        <tr><td style="padding:20px 32px 22px;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
            Questions? Just reply to this email — we're happy to help. We're excited to have you learn German with us!
          </p>
          <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">— The Deutsch Sprache RW Team</p>
        </td></tr>
        <tr><td style="height:6px;line-height:6px;font-size:0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="height:6px;background:#000;"></td>
            <td style="height:6px;background:#dd0000;"></td>
            <td style="height:6px;background:#ffce00;"></td>
          </tr></table>
        </td></tr>
      </table>
      <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;max-width:600px;padding:0 16px;">
        This is an automated confirmation for your enrollment submission. If you didn't submit this form, you can safely ignore this email.
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Murakaza neza, ${firstName}!

We received your enrollment for ${course || "your selected course"}${schedule ? ` (${schedule})` : ""}.
Our admissions team will review your submission and get back to you shortly.

What happens next:
1. We confirm your details and schedule.
2. You'll receive onboarding instructions by email.
3. Once enrolled, sign in at ${appUrl}/login

Questions? Just reply to this email.

— Deutsch Sprache RW, Kigali
${appUrl}`;

  await sendMail({ to: input.email, subject, html, text });
};
