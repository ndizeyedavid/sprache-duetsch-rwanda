import { z } from "zod";
import { idParam, paginationQuery } from "../../lib/query.js";

export const issueCertificateSchema = z.object({
  studentId: z.string().min(1),
  levelId: z.string().min(1),
  enrollmentId: z.string().min(1).optional(),
});

export const revokeCertificateSchema = z.object({
  reason: z.string().trim().min(4).max(500),
});

export const listCertificatesQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  levelId: z.string().min(1).optional(),
  status: z.enum(["ISSUED", "REVOKED"]).optional(),
  ...paginationQuery,
});

export const certificateIdSchema = idParam;

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
export type RevokeCertificateInput = z.infer<typeof revokeCertificateSchema>;
export type ListCertificatesQuery = z.infer<typeof listCertificatesQuerySchema>;
