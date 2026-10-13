import type { ApplicationStatus } from "../../generated/prisma/client.js";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import type { DeliveryMail } from "../../lib/notification-delivery.js";
import { queueTransactionalEmail } from "../../lib/notification-delivery.js";

export interface ApplicantMailContext {
  id: string;
  reference: string;
  firstName: string;
  email: string;
  levelTitle?: string | null;
  intakeName?: string | null;
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const appUrl = (): string => env.PUBLIC_APP_URL.replace(/\/$/, "");

const courseLine = (app: ApplicantMailContext): string =>
  [app.levelTitle, app.intakeName].filter(Boolean).join(" · ") || "your selected course";

const wrap = (paragraphs: string[]): string =>
  `<div style="font-family:Inter,system-ui,sans-serif;color:#0f204b;font-size:14px;line-height:1.6">${paragraphs.map((p) => `<p>${p}</p>`).join("")}<p style="color:#6b7280;font-size:12px">— Deutsch Sprache RW, Kigali</p></div>`;

/** Acknowledgement sent once per new application. */
export function applicationReceivedMail(app: ApplicantMailContext): DeliveryMail {
  const course = courseLine(app);
  return {
    subject: `Application received · ${app.reference}`,
    text: `Hello ${app.firstName},\n\nWe received your application for ${course}. Your reference is ${app.reference}.\nOur admissions team will review it and email you the decision.\n\nCourse catalogue: ${appUrl()}/catalog\n\n— Deutsch Sprache RW, Kigali`,
    html: wrap([
      `Hello ${escapeHtml(app.firstName)},`,
      `We received your application for <strong>${escapeHtml(course)}</strong>. Your reference is <strong>${escapeHtml(app.reference)}</strong>.`,
      "Our admissions team will review it and email you the decision.",
    ]),
  };
}

const DECISION_COPY: Partial<Record<ApplicationStatus, { subject: string; body: string }>> = {
  ACCEPTED: {
    subject: "Your application was accepted",
    body: "Good news — your application was accepted. We will email you a link to set up your student account and the next steps for enrolment.",
  },
  WAITLISTED: {
    subject: "You are on the waitlist",
    body: "The class you chose is currently full, so we placed you on the waitlist. We will contact you as soon as a seat opens.",
  },
  REJECTED: {
    subject: "Update on your application",
    body: "Thank you for applying. We are unable to offer you a place for this course at the moment. You are welcome to apply for a later intake or another level.",
  },
};

export function applicationDecisionMail(app: ApplicantMailContext, status: ApplicationStatus): DeliveryMail | null {
  const copy = DECISION_COPY[status];
  if (!copy) return null;
  const course = courseLine(app);
  return {
    subject: `${copy.subject} · ${app.reference}`,
    text: `Hello ${app.firstName},\n\n${copy.body}\n\nCourse: ${course}\nReference: ${app.reference}\n\n— Deutsch Sprache RW, Kigali`,
    html: wrap([
      `Hello ${escapeHtml(app.firstName)},`,
      escapeHtml(copy.body),
      `Course: <strong>${escapeHtml(course)}</strong><br>Reference: <strong>${escapeHtml(app.reference)}</strong>`,
    ]),
  };
}

/**
 * Applicants have no user account yet, so the delivery row is keyed by the application.
 * The event key makes each email idempotent: a repeated event never queues a second copy.
 */
export async function queueApplicantMail(app: { id: string; email: string }, mail: DeliveryMail, event: string): Promise<void> {
  try {
    await queueTransactionalEmail(`application:${app.id}`, app.email, mail, `application:${app.id}:${event}`);
  } catch (error) {
    logger.error({ error, applicationId: app.id, event }, "Applicant email could not be queued");
  }
}
