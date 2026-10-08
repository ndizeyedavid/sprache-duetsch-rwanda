import type { Role } from "../../generated/prisma/client.js";
import { getReceipt } from './get-receipt.js';
import { loadReceiptDocument } from './receipt-document.js';
import { createReceiptPdf } from './receipt-pdf.js';

/** Access is checked first (students only see their own receipts), then the branded PDF is drawn. */
export const renderReceiptPdf = async (
  id: string,
  user: { id: string; role: Role },
): Promise<{ filename: string; pdf: Buffer }> => {
  const receipt = await getReceipt(id, user);
  const pdf = await createReceiptPdf(await loadReceiptDocument(receipt.id));
  return { filename: `receipt-${receipt.receiptNumber}.pdf`, pdf };
};
