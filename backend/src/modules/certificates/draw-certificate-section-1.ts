import type { prepareCertificatePdf } from './prepare-certificate-pdf.js';
export function drawCertificateSection1(context: Awaited<ReturnType<typeof prepareCertificatePdf>>) {
const { logoBuffer, doc, logoX, logoY, logoW, logoH, NAVY, W, MUTED, dateStr, certificate, GOLD, INK, studentName } = context;
if (logoBuffer) {
    try {
      doc.image(logoBuffer, logoX, logoY, { width: logoW, height: logoH });
    } catch {
      // fallback: text mark
      doc
        .fillColor(NAVY)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("DEUTSCH", W / 2 - 45, logoY + 22, { width: 90, align: "center" });
    }
  } else {
    doc
      .fillColor(NAVY)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("DEUTSCH", W / 2 - 50, logoY + 28, { width: 100, align: "center" });
    doc
      .fillColor(MUTED)
      .fontSize(7)
      .font("Helvetica")
      .text("SPRACHE RW  •  ESTD. 2024", W / 2 - 50, logoY + 52, { width: 100, align: "center" });
  }
doc
    .fillColor(MUTED)
    .fontSize(6.5)
    .font("Helvetica")
    .text(dateStr, W - 120, 30, { width: 100, align: "right" });
doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text(`No. ${certificate.certificateNumber}`, 28, 30);
const titleY = 132;
doc
    .fillColor(GOLD)
    .fontSize(7)
    .font("Helvetica-Bold")
    .text("DEUTSCH SPRACHE RW  •  KIGALI, RWANDA", 0, titleY, { width: W, align: "center" });
const divY = titleY + 18;
const divW = 260;
const divX = W / 2 - divW / 2;
doc.save();
doc
    .moveTo(divX, divY)
    .lineTo(divX + divW, divY)
    .lineWidth(0.6)
    .strokeColor("#e7d9b0")
    .stroke();
const tickW = 28;
const tickX = W / 2 - (tickW * 3) / 2;
doc.rect(tickX, divY - 1.5, tickW, 3).fill("#000000");
doc.rect(tickX + tickW, divY - 1.5, tickW, 3).fill("#dd0000");
doc.rect(tickX + tickW * 2, divY - 1.5, tickW, 3).fill("#ffce00");
doc.restore();
doc
    .fillColor(NAVY)
    .fontSize(30)
    .font("Helvetica-Bold")
    .text("ZERTIFIKAT", 0, divY + 12, { width: W, align: "center" });
doc
    .fillColor(MUTED)
    .fontSize(7)
    .font("Helvetica")
    .text("Certificate  of  Achievement  •  Urkunde", 0, divY + 46, {
      width: W,
      align: "center",
      characterSpacing: 1.2,
    });
const nameY = divY + 72;
doc
    .fillColor(MUTED)
    .fontSize(7)
    .font("Helvetica")
    .text("This is to certify that", 0, nameY, { width: W, align: "center" });
doc
    .fillColor(INK)
    .fontSize(26)
    .font("Helvetica-Bold")
    .text(studentName, 0, nameY + 16, { width: W, align: "center" });
doc.save();
const nameW = doc.widthOfString(studentName);
const lineW = Math.min(420, Math.max(220, nameW + 40));
doc
    .moveTo(W / 2 - lineW / 2, nameY + 46)
    .lineTo(W / 2 + lineW / 2, nameY + 46)
    .lineWidth(0.9)
    .strokeColor(GOLD)
    .stroke();
const nTickX = W / 2 - 18;
doc.rect(nTickX, nameY + 50, 12, 2).fill("#000000");
doc.rect(nTickX + 12, nameY + 50, 12, 2).fill("#dd0000");
doc.rect(nTickX + 24, nameY + 50, 12, 2).fill("#ffce00");
doc.restore();
const proseY = nameY + 62;
doc
    .fillColor("#1f2937")
    .fontSize(7.2)
    .font("Helvetica")
    .text(
      "has demonstrated exceptional dedication, perseverance and excellence in mastering the German language",
      0,
      proseY,
      { width: W, align: "center" },
    );
return { ...context, logoBuffer, doc, logoX, logoY, logoW, logoH, NAVY, W, MUTED, dateStr, certificate, GOLD, INK, studentName, titleY, divY, divW, divX, tickW, tickX, nameY, nameW, lineW, nTickX, proseY };
}
