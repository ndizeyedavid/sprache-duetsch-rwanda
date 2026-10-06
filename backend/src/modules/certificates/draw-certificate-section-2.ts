import type { drawCertificateSection1 } from './draw-certificate-section-1.js';
export function drawCertificateSection2(context: Awaited<ReturnType<typeof drawCertificateSection1>>) {
const { doc, MUTED, proseY, W, GOLD_LIGHT, GOLD, NAVY, certificate, INK } = context;
doc
    .fillColor(MUTED)
    .fontSize(6.5)
    .font("Helvetica-Oblique")
    .text(
      "and is hereby recognized for outstanding academic achievement and commitment to linguistic excellence.",
      0,
      proseY + 12,
      { width: W, align: "center" },
    );
const courseY = proseY + 36;
const shieldW = 420;
const shieldX = W / 2 - shieldW / 2;
const shieldH = 46;
doc.save();
doc.roundedRect(shieldX, courseY, shieldW, shieldH, 6).fill("#ffffff");
doc
    .roundedRect(shieldX, courseY, shieldW, shieldH, 6)
    .lineWidth(0.8)
    .strokeColor(GOLD_LIGHT)
    .stroke();
doc.rect(shieldX, courseY, 4, shieldH).fill(GOLD);
doc.restore();
doc
    .fillColor(NAVY)
    .fontSize(8)
    .font("Helvetica-Bold")
    .text(`${certificate.level.code}`, shieldX + 16, courseY + 10, { width: 60 });
doc
    .fillColor(NAVY)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(certificate.level.title, shieldX + 68, courseY + 9, {
      width: shieldW - 80,
      align: "left",
    });
doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text(
      "Authorized by Deutsch Sprache RW  •  CEFR-aligned  •  Kigali, Rwanda",
      shieldX + 68,
      courseY + 26,
      { width: shieldW - 80 },
    );
const sigY = courseY + shieldH + 28;
const sigGap = 260;
const sigLeftX = W / 2 - sigGap / 2 - 90;
const sigRightX = W / 2 + sigGap / 2 - 90;
doc.save();
doc
    .fillColor(INK)
    .fontSize(11)
    .font("Helvetica-Oblique")
    .text("A. Mukamurenzi", sigLeftX, sigY, { width: 180, align: "center" });
doc
    .moveTo(sigLeftX + 10, sigY + 18)
    .lineTo(sigLeftX + 170, sigY + 18)
    .lineWidth(0.5)
    .strokeColor(GOLD)
    .stroke();
doc
    .fillColor(NAVY)
    .fontSize(6.5)
    .font("Helvetica-Bold")
    .text("Aline Mukamurenzi", sigLeftX, sigY + 22, { width: 180, align: "center" });
doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text("Academic Director  •  Deutsch Sprache RW", sigLeftX, sigY + 30, {
      width: 180,
      align: "center",
    });
doc
    .fillColor(INK)
    .fontSize(11)
    .font("Helvetica-Oblique")
    .text("C. Uwase", sigRightX, sigY, { width: 180, align: "center" });
doc
    .moveTo(sigRightX + 10, sigY + 18)
    .lineTo(sigRightX + 170, sigY + 18)
    .lineWidth(0.5)
    .strokeColor(GOLD)
    .stroke();
doc
    .fillColor(NAVY)
    .fontSize(6.5)
    .font("Helvetica-Bold")
    .text("Clarisse Uwase", sigRightX, sigY + 22, { width: 180, align: "center" });
doc
    .fillColor(MUTED)
    .fontSize(5.5)
    .font("Helvetica")
    .text("Head of German Language Program", sigRightX, sigY + 30, { width: 180, align: "center" });
doc.restore();
const sealCx = W - 92;
const sealCy = sigY + 10;
const sealR = 42;
doc.save();
doc.circle(sealCx, sealCy, sealR).lineWidth(1.2).strokeColor(GOLD).stroke();
return { ...context, doc, MUTED, proseY, W, GOLD_LIGHT, GOLD, NAVY, certificate, INK, courseY, shieldW, shieldX, shieldH, sigY, sigGap, sigLeftX, sigRightX, sealCx, sealCy, sealR };
}
