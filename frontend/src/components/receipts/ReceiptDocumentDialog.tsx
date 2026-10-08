import { useCallback } from 'react';
import { loadReceiptPdf } from '../../lib/pdf-request';
import { PdfDocumentDialog } from '../documents/PdfDocumentDialog';

type Props = { receipt: { id: string; receiptNumber: string; voidedAt?: string | null }; onClose: () => void };

export function ReceiptDocumentDialog({ receipt, onClose }: Props) {
  const load = useCallback((signal: AbortSignal) => loadReceiptPdf(receipt.id, signal), [receipt.id]);
  return <PdfDocumentDialog title={receipt.receiptNumber} label="Receipt" onClose={onClose} load={load}
    intro={receipt.voidedAt ? 'This receipt was cancelled. It is kept for the record.' : 'Your official payment receipt, exactly as it appears in the downloaded PDF.'}
    downloadPath={`/payments/receipts/${receipt.id}/pdf`} filename={`${receipt.receiptNumber}.pdf`}
    checkHref={`/verify/receipt/${receipt.id}`} checkLabel="Check receipt" />;
}
