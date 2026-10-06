import PDFDocument from "pdfkit";
import type { Role } from "../../generated/prisma/client.js";
import { getReceipt } from './get-receipt.js';
export const renderReceiptPdf = async (
  id: string,
  user: { id: string; role: Role },
): Promise<{ filename: string; pdf: Buffer }> => {
  const receipt = await getReceipt(id, user);
  const name =
    `${receipt.payment.student.user.firstName} ${receipt.payment.student.user.lastName}`.trim();

  const doc = new PDFDocument({ size: "A5", margin: 48 });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error: Error) => reject(error));
  });

  doc.rect(0, 0, 420, 12).fill("#fb0d00");
  doc.moveDown(2);
  doc.fontSize(16).fillColor("#374557").text("Deutsch Sprache RW");
  doc.fontSize(11).fillColor("#a098ae").text("Payment Receipt");
  doc.moveDown();
  doc.fontSize(12).fillColor("#374557").text(`Receipt No: ${receipt.receiptNumber}`);
  doc.text(`Date: ${receipt.issuedAt.toISOString().slice(0, 10)}`);
  doc.moveDown();
  doc.text(`Received from: ${name} (${receipt.payment.student.studentCode})`);
  if (receipt.voidedAt) doc.text("VOID — this receipt is retained for audit only");
  doc.text(`Amount: ${receipt.payment.amount.toString()} ${receipt.payment.currency}`);
  doc.text(`Method: ${receipt.payment.method.name}`);
  doc.text(`Reference: ${receipt.payment.reference ?? "—"}`);
  if (receipt.notes) {
    doc.moveDown();
    doc.fontSize(10).fillColor("#a098ae").text(receipt.notes);
  }
  doc.moveDown(2);
  doc.fontSize(10).fillColor("#a098ae").text("Murakoze! Thank you for your payment.");
  doc.end();

  return { filename: `receipt-${receipt.receiptNumber}.pdf`, pdf: await done };
};
