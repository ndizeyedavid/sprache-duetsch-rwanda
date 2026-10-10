import type { Doc } from '../../lib/pdf-brand.js';
import { brandPalette as c, fittedText } from '../../lib/pdf-brand.js';
import type { ReceiptDocument } from './receipt-document.js';
import { COL } from './receipt-pdf-header.js';

const { left: L, right: R } = COL;

/** QR check, school seal like the certificate's, and the thank-you line. */
export function drawReceiptFooter(doc: Doc, data: ReceiptDocument, qr: Buffer): void {
  doc.roundedRect(L, 652, 92, 92, 8).fillAndStroke(c.white, c.sand);
  doc.image(qr, L + 6, 658, { width: 80, height: 80 });
  doc.link(L, 652, 92, 92, data.verifyUrl);
  fittedText(doc, 'Scan to check this receipt', { x: L + 106, y: 664, width: 190, height: 14 }, { font: 'sans-bold', size: 10, color: c.navy });
  fittedText(doc, 'Shows the amount, date and whether the receipt is still valid.', { x: L + 106, y: 680, width: 180, height: 26 }, { font: 'sans', size: 8.5, color: c.muted });
  fittedText(doc, data.verifyUrl.replace(/^https?:\/\//, ''), { x: L + 106, y: 712, width: 200, height: 22 }, { font: 'sans', size: 7, color: c.muted });

  const seal = { x: 470, y: 690 };
  const voided = !!data.voidedAt;
  doc.circle(seal.x, seal.y, 36).fill(voided ? c.muted : c.red);
  doc.circle(seal.x, seal.y, 29).lineWidth(0.8).strokeColor(c.white).stroke();
  fittedText(doc, 'DSRW', { x: seal.x - 32, y: seal.y - 13, width: 64, height: 16 }, { font: 'sans-bold', size: 12, color: c.white, align: 'center', spacing: 1 });
  fittedText(doc, voided ? 'VOID' : 'PAID', { x: seal.x - 32, y: seal.y + 4, width: 64, height: 10 }, { font: 'sans-bold', size: 6.5, color: c.white, align: 'center', spacing: 2 });
  doc.moveTo(seal.x - 80, 742).lineTo(seal.x + 69, 742).lineWidth(0.8).strokeColor(c.navy).stroke();
  fittedText(doc, data.receivedBy ? `Received by ${data.receivedBy}` : 'Finance office', { x: seal.x - 90, y: 748, width: 159, height: 13 }, { font: 'sans-bold', size: 9, color: c.navy, align: 'right' });
  fittedText(doc, 'Issued electronically. Valid without a signature.', { x: seal.x - 130, y: 762, width: 199, height: 12 }, { font: 'sans', size: 7.5, color: c.muted, align: 'right' });

  fittedText(doc, 'Murakoze — thank you for your payment.', { x: L, y: 784, width: 300, height: 16 }, { font: 'serif', size: 11, color: c.navy });
  fittedText(doc, 'Keep this receipt for your records.', { x: R - 200, y: 787, width: 200, height: 12 }, { font: 'sans', size: 8.5, color: c.muted, align: 'right' });
}
