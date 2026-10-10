import { useCallback } from 'react';
import { loadCertificatePdf } from '../../lib/certificates-api';
import type { Certificate } from '../../lib/services';
import { PdfDocumentDialog } from '../documents/PdfDocumentDialog';

export function CertificateDocumentDialog({ certificate, onClose }: { certificate: Certificate; onClose: () => void }) {
  const load = useCallback((signal: AbortSignal) => loadCertificatePdf(certificate.id, signal), [certificate.id]);
  return <PdfDocumentDialog title={certificate.certificateNumber} label="Certificate" onClose={onClose} load={load}
    intro={certificate.pdfUrl ? 'The original certificate uploaded by academic administration.' : 'The issued certificate, exactly as it appears in the downloaded PDF.'}
    downloadPath={`/certificates/${certificate.id}/pdf`} filename={`${certificate.certificateNumber}.pdf`}
    checkHref={`/verify/${certificate.verificationCode}`} checkLabel="Verify certificate" />;
}
