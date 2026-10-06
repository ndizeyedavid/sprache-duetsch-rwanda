import type { drawCertificateSection3 } from './draw-certificate-section-3.js';
export function drawCertificateSection4(context: Awaited<ReturnType<typeof drawCertificateSection3>>) {
const { doc, W, H } = context;
doc
    .fillColor("#9ca3af")
    .fontSize(4.4)
    .font("Helvetica")
    .text(
      "This certificate recognizes the successful completion of a Deutsch Sprache RW program. It does not constitute formal enrollment at a university nor an official state diploma. Recognition is at the discretion of receiving institutions.",
      W / 2 - 260,
      H - 22,
      { width: 520, align: "center" },
    );
doc.end();
return { ...context, doc, W, H };
}
