import { Link,useParams } from 'react-router-dom';
import { CertificateRecord } from '../components/certificate-verification/CertificateRecord';
import { CertificateTranscript } from '../components/certificate-verification/CertificateTranscript';
import { ErrorBlock,LoadingBlock } from '../components/common/PageState';
import { Logo } from '../components/ui/Logo';
import { Panel } from '../components/ui/Panel';
import { useApi } from '../hooks/useApi';
import { verifyCertificate } from '../lib/services';

export function VerifyCertificate() {
  const { code = '' } = useParams();
  const result = useApi(`verify-${code}`, () => verifyCertificate(code));
  return <div className="min-h-screen bg-base-200 px-4 py-8"><div className="mx-auto w-full max-w-3xl">
    <Link to="/" className="mb-6 flex justify-center"><Logo size={150} /></Link>
    {result.loading ? <Panel><LoadingBlock label="Verifying…" /></Panel> : result.error || !result.data ? <Panel>
      <ErrorBlock message={result.error ?? 'Verification failed.'} onRetry={result.refetch} /><p className="mt-2 font-mono text-xs text-muted">{code}</p>
    </Panel> : <div className="space-y-4"><CertificateRecord data={result.data} /><CertificateTranscript data={result.data} /><p className="text-center text-xs text-muted">© 2026 Deutsch Sprache RW · Kigali · Rwanda</p></div>}
  </div></div>;
}
