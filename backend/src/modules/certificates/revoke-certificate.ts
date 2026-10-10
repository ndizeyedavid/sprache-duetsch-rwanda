import { writeAuditTx } from "../../lib/audit.js";
import { conflict,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { certificateInclude } from './certificate-include.js';
export const revokeCertificate = async (id: string, reason: string, actorId?: string) => transact(async tx => {
  const before = await tx.certificate.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Certificate not found");
  }
  if (before.status === "REVOKED") {
    throw conflict("Certificate is already revoked");
  }

  const certificate = await tx.certificate.update({
    where: { id },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revokedById: actorId ?? null,
      revokeReason: reason,
    },
    include: certificateInclude,
  });

  await writeAuditTx(tx, {
    actorId: actorId ?? null,
    action: "CERTIFICATE_REVOKED",
    entityType: "Certificate",
    entityId: id,
    before,
    after: certificate,
    reason,
  });

  return certificate;
});
