import { FiDownload } from 'react-icons/fi';
import type { Certificate } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { CertificateSheet } from './CertificateSheet';

type Props = {
  certificate: Certificate | null;
  studentName: string;
  onClose: () => void;
  onDownload: (certificate: Certificate) => void;
};

export function CertificatePreview({ certificate, studentName, onClose, onDownload }: Props) {
  return (
    <Modal
      open={certificate !== null}
      onClose={onClose}
      title={certificate ? `${certificate.level.code} certificate` : 'Certificate'}
      boxClassName="max-w-3xl"
    >
      {certificate ? (
        <div className="space-y-4">
          <CertificateSheet certificate={certificate} studentName={studentName} />
          <p className="text-xs leading-5 text-muted">
            This is a preview. Download the PDF for the signed document with its verification QR code.
          </p>
          <button type="button" onClick={() => onDownload(certificate)} className="btn btn-primary btn-sm gap-2 rounded-full">
            <FiDownload aria-hidden />Download PDF
          </button>
        </div>
      ) : null}
    </Modal>
  );
}