import { brandPalette } from '../../lib/pdf-brand.js';
import type { CertificateSnapshot } from './certificate-document.js';

export type { Box, Doc, TextStyle } from '../../lib/pdf-brand.js';
export { eyebrow, fittedText, longDate as certificateDate } from '../../lib/pdf-brand.js';

/** Certificates use the shared school palette. */
export const certificatePalette = brandPalette;

export const PAGE = { width: 841.89, height: 595.28, sidebar: 212, slant: 34 } as const;
/** Main column (right of the red panel). */
export const MAIN = { x: 270, right: 796, width: 526 } as const;

export interface CertificatePdfData {
  document: CertificateSnapshot;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date;
  verifyUrl: string;
  preview?: boolean;
}
