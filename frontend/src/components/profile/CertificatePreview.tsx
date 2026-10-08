import type { Certificate } from '../../lib/services';
import { CertificateDocumentDialog } from '../certificates/CertificateDocumentDialog';

type Props = {
  certificate: Certificate | null;
  onClose: () => void;
};

export function CertificatePreview({ certificate, onClose }: Props) {
  return certificate ? <CertificateDocumentDialog certificate={certificate} onClose={onClose}/> : null;
}
