import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Doc } from '../../lib/pdf-brand.js';
import { brandPalette as c, eyebrow, fittedText } from '../../lib/pdf-brand.js';
import type { ReceiptDocument } from './receipt-document.js';

export const PAGE = { width: 595.28, height: 841.89 } as const;
/** Content column inside the frame. */
export const COL = { left: 56, right: 539, width: 483, split: 310 } as const;

/** Certificate-style header: slanted red band, deep-red stripe and peach line, logo in a white seal. */
export function drawReceiptHeader(doc: Doc, data: ReceiptDocument): void {
  const W = PAGE.width;
  doc.rect(0, 0, W, PAGE.height).fill(c.paper);
  doc.polygon([0, 0], [W, 0], [W, 120], [0, 150]).fill(c.red);
  doc.polygon([0, 150], [W, 120], [W, 130], [0, 160]).fill(c.redDeep);
  doc.polygon([0, 164], [W, 134], [W, 136], [0, 166]).fill(c.peach);

  doc.circle(86, 68, 36).fill(c.white);
  const logo = path.resolve('public-logo.png');
  if (existsSync(logo)) doc.image(logo, 58, 40, { fit: [56, 56] });
  eyebrow(doc, 'Deutsch Sprache RW', 138, 40, 230, c.onRed);
  fittedText(doc, 'Payment Receipt', { x: 138, y: 54, width: 250, height: 36 }, { font: 'serif', size: 26, color: c.white });
  fittedText(doc, `German language school · Kigali, Rwanda · ${data.appHost}`, { x: 138, y: 92, width: 280, height: 12 }, { font: 'sans', size: 8, color: c.onRed });

  eyebrow(doc, 'Receipt number', COL.right - 160, 40, 160, c.onRed, 'right');
  fittedText(doc, data.receiptNumber, { x: COL.right - 200, y: 54, width: 200, height: 20 }, { font: 'sans-bold', size: 14, color: c.white, align: 'right' });
  const label = data.voidedAt ? 'VOID' : 'PAID';
  doc.font('sans-bold').fontSize(8);
  const pill = doc.widthOfString(label, { characterSpacing: 2 }) + 28;
  doc.roundedRect(COL.right - pill, 80, pill, 19, 9.5).fill(c.white);
  fittedText(doc, label, { x: COL.right - pill, y: 85.5, width: pill, height: 10 }, { font: 'sans-bold', size: 8, color: data.voidedAt ? c.red : c.green, align: 'center', spacing: 2 });

  // Hairline frame with red corner accents, as on the certificate.
  doc.rect(28, 186, W - 56, 630).lineWidth(0.7).strokeColor(c.sand).stroke();
  doc.moveTo(28, 228).lineTo(28, 186).lineTo(70, 186).lineWidth(2.2).strokeColor(c.red).stroke();
  doc.moveTo(W - 70, 816).lineTo(W - 28, 816).lineTo(W - 28, 774).lineWidth(2.2).strokeColor(c.red).stroke();
}

/** Diagonal watermark so a cancelled receipt can never be mistaken for a valid one. */
export function drawVoidMark(doc: Doc): void {
  doc.save().rotate(-30, { origin: [297, 470] }).fillOpacity(0.08);
  doc.font('serif').fontSize(150).fillColor(c.red).text('VOID', 0, 390, { width: PAGE.width, align: 'center' });
  doc.restore();
}
