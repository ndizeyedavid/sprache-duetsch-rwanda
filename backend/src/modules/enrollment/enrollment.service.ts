import { prisma } from "../../lib/prisma.js";
import { matchLevel,matchShift } from "../applications/application-matching.js";
import type { SubmitResult } from "../applications/submit-application.js";
import { submitApplication } from "../applications/submit-application.js";
import { enrollmentConfirmationMail } from "./enrollment-mail.js";
import type { EnrollmentConfirmInput } from "./enrollment.schema.js";

const blankToNull = (value: string | undefined): string | null => value?.trim() || null;

/**
 * Persist an external-site enrolment as a WEBSITE application before anything is emailed.
 * The confirmation is queued only for a new record, so resubmitting the same email cannot be
 * used to send repeated mail to an address.
 */
export const recordWebsiteEnrollment = async (input: EnrollmentConfirmInput): Promise<SubmitResult> => {
  const levels = await prisma.level.findMany({ where: { isActive: true }, select: { id: true, code: true, title: true } });
  const level = matchLevel(input.course, levels);
  return submitApplication(
    {
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email,
      phone: blankToNull(input.phone),
      levelId: level?.id ?? null,
      shift: matchShift(input.schedule),
      experience: blankToNull(input.experience),
      message: blankToNull(input.message),
      source: "WEBSITE",
      rawPayload: {
        course: input.course ?? "",
        schedule: input.schedule ?? "",
        submittedAt: input.submitted_at ?? "",
        matchedLevel: level?.code ?? null,
      },
    },
    (context) => enrollmentConfirmationMail(input, context.reference),
  );
};
