import { certificateDate, certificatePalette, eyebrow, fittedText, MAIN } from './certificate-pdf-layout.js';
import type { CertificatePdfData, Doc } from './certificate-pdf-layout.js';

const { red, redSoft, navy, ink, muted, peach, sand, white } = certificatePalette;
const { x, right, width } = MAIN;

/** Hairline frame with red corner accents around the main column. */
export function drawCertificateFrame(doc: Doc): void {
  doc.rect(248, 22, right + 24 - 248, 551).lineWidth(0.7).strokeColor(sand).stroke();
  for (const [cx, cy, dx, dy] of [[right + 24, 22, -1, 1], [right + 24, 573, -1, -1]] as const) {
    doc.moveTo(cx + dx * 42, cy).lineTo(cx, cy).lineTo(cx, cy + dy * 42).lineWidth(2.2).strokeColor(red).stroke();
  }
}

export function drawCertificateHeader(doc: Doc): void {
  fittedText(doc, 'DEUTSCH SPRACHE RW', { x, y: 46, width: 320, height: 20 }, { font: 'sans-bold', size: 14.5, color: navy, spacing: 2.5 });
  fittedText(doc, 'German language school · Kigali, Rwanda', { x, y: 67, width: 320, height: 14 }, { font: 'sans', size: 8.5, color: muted });
  eyebrow(doc, 'Est. 2024', x + 330, 50, width - 330, muted, 'right');
  doc.moveTo(x, 92).lineTo(x + 46, 92).lineWidth(2).strokeColor(red).stroke();
  doc.moveTo(x + 46, 92).lineTo(right, 92).lineWidth(0.7).strokeColor(sand).stroke();
}

export function drawCertificateBody(doc: Doc, data: CertificatePdfData): void {
  const { design, studentName, levelTitle, levelCode } = data.document;
  eyebrow(doc, 'Learning · Commitment · Achievement', x, 116, width, red);
  fittedText(doc, design.title, { x, y: 132, width, height: 46 }, { font: 'serif', size: 31, color: navy });
  eyebrow(doc, 'This is to certify that', x, 192, width, muted);
  fittedText(doc, studentName, { x, y: 208, width, height: 50 }, { font: 'serif', size: 34, color: red });
  doc.moveTo(x, 264).lineTo(x + 300, 264).lineWidth(0.9).strokeColor(peach).stroke();
  fittedText(doc, design.statement, { x, y: 276, width: width - 20, height: 38 }, { font: 'sans', size: 11, color: muted });

  eyebrow(doc, 'Course completed', x, 326, width, red);
  doc.font('sans-bold').fontSize(11);
  const badgeWidth = Math.max(44, doc.widthOfString(levelCode) + 20);
  doc.roundedRect(x, 342, badgeWidth, 24, 5).fill(red);
  fittedText(doc, levelCode, { x, y: 348, width: badgeWidth, height: 14 }, { font: 'sans-bold', size: 11, color: white, align: 'center' });
  fittedText(doc, levelTitle, { x: x + badgeWidth + 12, y: 344, width: width - badgeWidth - 12, height: 24 }, { font: 'sans-bold', size: 17, color: navy });

  if (design.grade) {
    doc.font('sans-bold').fontSize(9);
    const pillWidth = Math.min(width, doc.widthOfString(design.grade) + 24);
    doc.roundedRect(x, 378, pillWidth, 20, 10).fill(redSoft);
    fittedText(doc, design.grade, { x: x + 12, y: 383, width: pillWidth - 24, height: 12 }, { font: 'sans-bold', size: 9, color: red });
  }
}

export function drawCertificateFooter(doc: Doc, data: CertificatePdfData): void {
  const { design } = data.document;
  doc.moveTo(x, 482).lineTo(x + 200, 482).lineWidth(0.8).strokeColor(navy).stroke();
  fittedText(doc, design.signatoryName, { x, y: 490, width: 210, height: 16 }, { font: 'sans-bold', size: 11, color: navy });
  fittedText(doc, design.signatoryRole, { x, y: 507, width: 210, height: 14 }, { font: 'sans', size: 9, color: muted });

  const seal = { cx: 548, cy: 494 };
  doc.circle(seal.cx, seal.cy, 31).fill(red);
  doc.circle(seal.cx, seal.cy, 25).lineWidth(0.8).strokeColor(white).stroke();
  fittedText(doc, 'DSRW', { x: seal.cx - 30, y: seal.cy - 11, width: 60, height: 14 }, { font: 'sans-bold', size: 10.5, color: white, align: 'center', spacing: 1 });
  fittedText(doc, 'CERTIFIED', { x: seal.cx - 30, y: seal.cy + 3, width: 60, height: 8 }, { font: 'sans-bold', size: 5.5, color: white, align: 'center', spacing: 1.5 });

  eyebrow(doc, 'Completed on', right - 200, 470, 200, red, 'right');
  fittedText(doc, certificateDate(design.completionDate), { x: right - 200, y: 485, width: 200, height: 16 }, { font: 'sans-bold', size: 11, color: navy, align: 'right' });
  fittedText(doc, design.issuedPlace, { x: right - 200, y: 503, width: 200, height: 14 }, { font: 'sans', size: 9, color: muted, align: 'right' });

  doc.moveTo(x, 538).lineTo(right, 538).lineWidth(0.7).strokeColor(sand).stroke();
  const verify = data.preview ? 'The verification link and code are added when the certificate is issued.'
    : `Verify this certificate at ${data.verifyUrl}`;
  fittedText(doc, verify, { x, y: 547, width: width - 170, height: 12 }, { font: 'sans', size: 7.5, color: muted });
  if (!data.preview) fittedText(doc, `Code ${data.verificationCode}`, { x: right - 160, y: 547, width: 160, height: 12 }, { font: 'sans-bold', size: 7.5, color: ink, align: 'right' });
}

export function drawPreviewMarks(doc: Doc): void {
  doc.save().rotate(-20, { origin: [x + width / 2, 320] }).fillOpacity(0.06);
  doc.font('serif').fontSize(96).fillColor(red).text('PREVIEW', x - 40, 262, { width: width + 80, align: 'center' });
  doc.restore();
  doc.roundedRect(x, 26, 206, 16, 8).fill(redSoft);
  eyebrow(doc, 'Preview · not an issued certificate', x, 30, 206, red, 'center');
}
