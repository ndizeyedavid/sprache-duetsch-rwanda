import { writeActivityTx } from "../activity/activity-transaction.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest } from "../../lib/http-error.js";
import { generateCertificateNumber,generateVerificationCode } from "../../lib/ids.js";
import { transact } from "../../lib/transactions.js";
import { certificateInclude } from './certificate-include.js';
import type { IssueCertificateInput } from "./certificates.schema.js";
import { checkEligibility } from "./completion-policy.js";
export const issueCertificate = async (input: IssueCertificateInput, actorId?: string) => {
  const certificate = await transact(async tx => {
  const eligibility = await checkEligibility(input.studentId, input.levelId, tx);
  if (input.enrollmentId && !await tx.enrollment.findFirst({ where: { id: input.enrollmentId, studentId: input.studentId, levelId: input.levelId, status: { in: ["ACTIVE", "COMPLETED"] } } })) throw badRequest("Enrolment must belong to this student and level");
  if (!eligibility.eligible) {
    throw badRequest(`Student is not eligible yet: ${eligibility.reasons.join("; ")}`);
  }


    const certificateNumber = await generateCertificateNumber(tx);
    const created = await tx.certificate.create({
      data: {
        certificateNumber,
        verificationCode: generateVerificationCode(),
        studentId: input.studentId,
        levelId: input.levelId,
        enrollmentId: input.enrollmentId ?? eligibility.enrollmentId,
        issuedById: actorId ?? null,
        metadata: {
          completionPercentage: eligibility.completionPercentage,
          finalExamPassed: eligibility.finalExamPassed,
        },
      },
      include: certificateInclude,
    });
    await writeAuditTx(tx, { actorId, action: "CERTIFICATE_ISSUED", entityType: "Certificate", entityId: created.id, after: created });
    await writeActivityTx(tx, { actorId, type: "SYSTEM", title: `Certificate issued: ${created.certificateNumber}`, studentId: input.studentId });
    return created;
  });

  return certificate;
};
