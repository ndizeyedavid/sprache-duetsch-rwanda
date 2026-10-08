import { z } from 'zod';

const singleLine = (value: string) => !/\p{Cc}/u.test(value);
const line = (max: number) => z.string().trim().min(1).max(max).refine(singleLine, 'Use a single line of text');
const optionalLine = (max: number) => z.string().trim().max(max).refine(singleLine, 'Use a single line of text').optional();

/** Fields academic staff may adjust before issuing; everything else comes from school records. */
export const certificateDesignSchema = z.object({
  title: line(70),
  statement: z.string().trim().min(10).max(280),
  grade: optionalLine(80),
  signatoryName: line(100),
  signatoryRole: line(80),
  issuedPlace: line(80),
  completionDate: z.iso.date().refine(value => value <= new Date().toISOString().slice(0, 10), 'Completion date cannot be in the future'),
});
export type CertificateDesign = z.infer<typeof certificateDesignSchema>;
export const certificateSnapshotSchema = z.object({
  version: z.literal(1), studentName: z.string(), studentCode: z.string(),
  levelCode: z.string(), levelTitle: z.string(), design: certificateDesignSchema,
});
export type CertificateSnapshot = z.infer<typeof certificateSnapshotSchema>;

export function defaultCertificateDesign(signatoryName = 'Academic Administration', date = new Date()): CertificateDesign {
  return {
    title: 'Certificate of Completion',
    statement: 'has successfully completed the learning requirements of the following course.',
    signatoryName, signatoryRole: 'Academic Administration', issuedPlace: 'Kigali, Rwanda',
    completionDate: date.toISOString().slice(0, 10),
  };
}

export function readCertificateSnapshot(metadata: unknown): CertificateSnapshot | null {
  if (!metadata || typeof metadata !== 'object' || !('document' in metadata)) return null;
  const result = certificateSnapshotSchema.safeParse(metadata.document);
  return result.success ? result.data : null;
}
