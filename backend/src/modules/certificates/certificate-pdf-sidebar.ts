import { existsSync } from 'node:fs';
import path from 'node:path';
import { certificateDate, certificatePalette, eyebrow, fittedText, PAGE } from './certificate-pdf-layout.js';
import type { CertificatePdfData, Doc } from './certificate-pdf-layout.js';

const { red, redDeep, white, peach, onRed } = certificatePalette;
const CENTER = 96;

/** Slanted red panel on the left: logo, level, verification QR and record numbers. */
export function drawCertificateSidebar(doc: Doc, data: CertificatePdfData, qr: Buffer | null): void {
  const { height, sidebar, slant } = PAGE;
  doc.polygon([0, 0], [sidebar, 0], [sidebar - slant, height], [0, height]).fill(red);
  doc.polygon([sidebar, 0], [sidebar + 12, 0], [sidebar - slant + 12, height], [sidebar - slant, height]).fill(redDeep);
  doc.polygon([sidebar + 18, 0], [sidebar + 20, 0], [sidebar - slant + 20, height], [sidebar - slant + 18, height]).fill(peach);

  doc.circle(CENTER, 92, 50).fill(white);
  const logo = path.resolve('public-logo.png');
  if (existsSync(logo)) doc.image(logo, CENTER - 40, 52, { fit: [80, 80], align: 'center', valign: 'center' });
  else fittedText(doc, 'DSRW', { x: CENTER - 40, y: 80, width: 80, height: 24 }, { font: 'sans-bold', size: 18, color: red, align: 'center' });

  fittedText(doc, data.document.levelCode, { x: CENTER - 70, y: 158, width: 140, height: 36 }, { font: 'sans-bold', size: 30, color: white, align: 'center' });
  eyebrow(doc, 'Course level', CENTER - 70, 196, 140, onRed, 'center');

  if (qr) {
    doc.roundedRect(CENTER - 48, 222, 96, 96, 6).fill(white);
    doc.image(qr, CENTER - 43, 227, { width: 86, height: 86 });
    doc.link(CENTER - 48, 222, 96, 96, data.verifyUrl);
    fittedText(doc, 'Scan to verify', { x: CENTER - 70, y: 326, width: 140, height: 14 }, { font: 'sans-bold', size: 9, color: white, align: 'center' });
    doc.link(CENTER - 70, 326, 140, 14, data.verifyUrl);
  } else {
    doc.roundedRect(CENTER - 48, 222, 96, 96, 6).lineWidth(0.8).strokeColor(onRed).dash(3, { space: 3 }).stroke().undash();
    fittedText(doc, 'Verification QR\nadded on issue', { x: CENTER - 44, y: 256, width: 88, height: 30 }, { font: 'sans', size: 8.5, color: onRed, align: 'center' });
  }

  const rows: [string, string, number][] = [
    ['Certificate number', data.certificateNumber, 362],
    ['Student number', data.document.studentCode, 414],
    ['Date issued', certificateDate(data.issuedAt), 466],
  ];
  for (const [label, value, y] of rows) {
    eyebrow(doc, label, 18, y, 156, onRed, 'center');
    fittedText(doc, value, { x: 14, y: y + 14, width: 160, height: 26 }, { font: 'sans-bold', size: 10.5, color: white, align: 'center' });
  }
  doc.moveTo(40, 540).lineTo(150, 540).lineWidth(0.6).strokeColor(onRed).stroke();
  doc.font('sans').fontSize(6.5).fillColor(onRed).text('OFFICIAL SCHOOL RECORD', 10, 548, { width: 170, align: 'center', characterSpacing: 1.5 });
}
