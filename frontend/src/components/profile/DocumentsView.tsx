import { FiFileText } from 'react-icons/fi';
import type { Certificate,ReceiptRow } from '../../lib/services';
import { CertificatesCard } from './CertificatesCard';
import { ReceiptsCard } from './ReceiptsCard';

type Props = {
  certificates: Certificate[] | null;
  certificatesLoading: boolean;
  certificatesError: string | null;
  onRetryCertificates: () => void;
  receipts: ReceiptRow[] | null;
  receiptsLoading: boolean;
  receiptsError: string | null;
  onRetryReceipts: () => void;
  pendingId: string | null;
  downloadError: string | null;
  onPreview: (certificate: Certificate) => void;
  onCertificateDownload: (certificate: Certificate) => void;
  onReceiptDownload: (receipt: ReceiptRow) => void;
  onReceiptPreview: (receipt: ReceiptRow) => void;
};

export function DocumentsView({
  certificates,
  certificatesLoading,
  certificatesError,
  onRetryCertificates,
  receipts,
  receiptsLoading,
  receiptsError,
  onRetryReceipts,
  pendingId,
  downloadError,
  onPreview,
  onCertificateDownload,
  onReceiptDownload,
  onReceiptPreview,
}: Props) {
  return (
    <div className="space-y-4">
      {downloadError ? (
        <p role="alert" className="alert alert-error rounded-box py-3 text-xs">
          {downloadError}
        </p>
      ) : null}

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted">
        <FiFileText aria-hidden className="mt-0.5 shrink-0" />
        Your certificates and payment receipts. Open one to view it, or download the PDF.
      </p>

      <CertificatesCard
        certificates={certificates}
        loading={certificatesLoading}
        error={certificatesError}
        onRetry={onRetryCertificates}
        pendingId={pendingId}
        onPreview={onPreview}
        onDownload={onCertificateDownload}
      />

      <ReceiptsCard
        receipts={receipts}
        loading={receiptsLoading}
        error={receiptsError}
        onRetry={onRetryReceipts}
        pendingId={pendingId}
        onPreview={onReceiptPreview}
        onDownload={onReceiptDownload}
      />
    </div>
  );
}