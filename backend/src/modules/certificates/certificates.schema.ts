import { z } from "zod";
import { idParam,paginationQuery } from "../../lib/query.js";
import { certificateDesignSchema } from './certificate-document.js';

export const issueCertificateSchema = z.object({
  studentId: z.string().min(1),
  levelId: z.string().min(1),
  enrollmentId: z.string().min(1).optional(),
  design: certificateDesignSchema.optional(),
  pdfUrl: z.string().regex(/^\/api\/uploads\/[a-zA-Z0-9._-]+$/, 'Upload a PDF certificate first').optional(),
  replacesCertificateId: z.string().min(1).optional(),
});

export const certificateEligibilityQuerySchema = issueCertificateSchema.pick({ studentId: true, levelId: true });

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
