import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { drawCertificateBody, drawCertificateFooter, drawCertificateFrame, drawCertificateHeader, drawPreviewMarks } from './certificate-pdf-body.js';
import { collectPdf, registerBrandFonts } from '../../lib/pdf-brand.js';
import { certificatePalette, PAGE } from './certificate-pdf-layout.js';
import type { CertificatePdfData } from './certificate-pdf-layout.js';
import { drawCertificateSidebar } from './certificate-pdf-sidebar.js';

/** The same renderer creates academic previews and issued student downloads. */
export async function createCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, info: {
    Title: `${data.document.design.title} - ${data.document.studentName}`,
    Author: 'Deutsch Sprache RW', Subject: data.preview ? 'Preview - not issued' : data.certificateNumber,
  } });
  const result = collectPdf(doc);
  registerBrandFonts(doc);
  const qr = data.preview ? null : await QRCode.toBuffer(data.verifyUrl, { width: 400, margin: 1, errorCorrectionLevel: 'M', color: { dark: certificatePalette.navy } });

  doc.rect(0, 0, PAGE.width, PAGE.height).fill(certificatePalette.paper);
  drawCertificateSidebar(doc, data, qr);
  drawCertificateFrame(doc);
  drawCertificateHeader(doc);
  drawCertificateBody(doc, data);
  drawCertificateFooter(doc, data);
  if (data.preview) drawPreviewMarks(doc);
  doc.end();
  return result;
}
