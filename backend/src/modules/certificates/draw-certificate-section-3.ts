import type { drawCertificateSection2 } from './draw-certificate-section-2.js';
export function drawCertificateSection3(context: Awaited<ReturnType<typeof drawCertificateSection2>>) {
const { doc, sealCx, sealCy, sealR, GOLD, NAVY, RED, MUTED, H, qr, verifyUrl, certificate, dateStr } = context;
doc
    .circle(sealCx, sealCy, sealR - 3)
    .lineWidth(0.4)
    .strokeColor("#e7d9b0")
    .stroke();
doc
    .circle(sealCx, sealCy, sealR - 7)
    .fillOpacity(0.06)
    .fill(GOLD);
doc.fillOpacity(1);
doc.save();
doc
    .circle(sealCx, sealCy, sealR - 10)
    .lineWidth(2)
    .strokeColor("#000000")
    .strokeOpacity(0.08)
    .stroke();
doc.restore();
doc
    .fillColor(NAVY)
    .fontSize(5.5)
    .font("Helvetica-Bold")
    .text("DEUTSCH", sealCx - 30, sealCy - 14, { width: 60, align: "center" });
doc
    .fillColor(RED)
    .fontSize(5)
    .font("Helvetica-Bold")
    .text("SPRACHE RW", sealCx - 30, sealCy - 4, { width: 60, align: "center" });
doc
    .fillColor(MUTED)
    .fontSize(4.5)
    .font("Helvetica")
    .text("OFFICIAL  •  ESTD 2024", sealCx - 30, sealCy + 6, { width: 60, align: "center" });
doc
    .fillColor(GOLD)
    .fontSize(6)
    .font("Helvetica")
    .text("ORIGINAL", sealCx - 30, sealCy + 14, { width: 60, align: "center" });
doc.restore();
const qrSize = 54;
const qrX = 30;
const qrY = H - 82;
doc.save();
doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4).fill("#ffffff");
doc
    .roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4)
    .lineWidth(0.5)
    .strokeColor("#e5e7eb")
    .stroke();
doc.restore();
try {
    doc.image(qr, qrX, qrY, { width: qrSize });
  } catch {
    // ignore
  }
const qrTextX = qrX + qrSize + 12;
doc
    .fillColor(NAVY)
    .fontSize(5.5)
    .font("Helvetica-Bold")
    .text("Verify authenticity at:", qrTextX, qrY + 2);
doc
    .fillColor("#2563eb")
    .fontSize(5.5)
    .font("Helvetica")
    .text(verifyUrl, qrTextX, qrY + 11, { width: 280 });
doc
    .fillColor(MUTED)
    .fontSize(5)
    .font("Helvetica")
    .text(
      "Deutsch Sprache RW has confirmed the identity and successful completion of this learner.",
      qrTextX,
      qrY + 22,
      { width: 280 },
    );
doc
    .fillColor(MUTED)
    .fontSize(4.8)
    .font("Helvetica")
    .text(
      `Certificate  ${certificate.certificateNumber}  •  Student  ${certificate.student.studentCode}  •  Verification  ${certificate.verificationCode}`,
      qrTextX,
      qrY + 32,
      { width: 300 },
    );
doc
    .fillColor(MUTED)
    .fontSize(4.8)
    .font("Helvetica")
    .text(
      `Issued  ${dateStr}  •  ${certificate.level.code}  •  Deutsch Sprache RW, Kigali`,
      qrTextX,
      qrY + 40,
      { width: 300 },
    );
return { ...context, doc, sealCx, sealCy, sealR, GOLD, NAVY, RED, MUTED, H, qr, verifyUrl, certificate, dateStr, qrSize, qrX, qrY, qrTextX };
}
