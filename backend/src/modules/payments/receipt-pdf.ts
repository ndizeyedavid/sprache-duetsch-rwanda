import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { brandPalette, collectPdf, registerBrandFonts } from '../../lib/pdf-brand.js';
import type { ReceiptDocument } from './receipt-document.js';
import { drawReceiptBody, drawReceiptSummary } from './receipt-pdf-body.js';
import { drawReceiptFooter } from './receipt-pdf-footer.js';
import { drawReceiptHeader, drawVoidMark } from './receipt-pdf-header.js';

/** A4 school receipt in the same family as the certificate. */
export async function createReceiptPdf(data: ReceiptDocument): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
    Title: `Receipt ${data.receiptNumber} - ${data.payer.name}`, Author: 'Deutsch Sprache RW', Subject: 'Payment receipt',
  } });
  const result = collectPdf(doc);
  registerBrandFonts(doc);
  const qr = await QRCode.toBuffer(data.verifyUrl, { width: 360, margin: 1, errorCorrectionLevel: 'M', color: { dark: brandPalette.navy } });
  drawReceiptHeader(doc, data);
  const next = drawReceiptBody(doc, data);
  drawReceiptSummary(doc, data, next);
  drawReceiptFooter(doc, data, qr);
  if (data.voidedAt) drawVoidMark(doc);
  doc.end();
  return result;
}
