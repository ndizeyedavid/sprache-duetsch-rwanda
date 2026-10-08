import { FiSearch } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { CertificateRecord } from '../components/certificate-verification/CertificateRecord';
import { CheckAnotherCode } from '../components/certificate-verification/CheckAnotherCode';
import { BookLoader } from '../components/common/BookLoader';
import { Logo } from '../components/ui/Logo';
import { useApi } from '../hooks/useApi';
import { verifyCertificate } from '../lib/services';

/** Public page anyone can open from the QR code or link on a certificate. */
export function VerifyCertificate() {
  const { code = '' } = useParams();
  const result = useApi(`verify-${code}`, () => verifyCertificate(code));
  const notFound = !!result.error && /no certificate/i.test(result.error);
  return (
    <div className="min-h-screen bg-base-200">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link to="/"><Logo size={38} withWordmark wordmarkClassName="text-ink" /></Link>
        <span className="text-xs font-medium text-muted">Certificate check</span>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-14">
        {result.loading ? <BookLoader label="Checking certificate…" className="min-h-[50vh]" />
          : result.data ? <CertificateRecord data={result.data} />
          : (
            <section className="page-enter rounded-[1.75rem] border border-base-300 bg-base-100 px-6 py-12 text-center sm:px-10">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-base-200 text-xl text-muted"><FiSearch aria-hidden /></span>
              <h1 className="mt-4 text-xl font-semibold">{notFound ? 'Certificate not found' : 'Could not check this certificate'}</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                {notFound ? 'No certificate matches this code. Check the code printed on the certificate, or contact the school.' : 'Check your connection and try again.'}
              </p>
              <p className="mt-4 font-mono text-xs text-muted">{code}</p>
              {!notFound ? <button type="button" className="btn btn-sm mt-5 rounded-full" onClick={result.refetch}>Try again</button> : null}
            </section>
          )}
        {!result.loading ? <CheckAnotherCode label={result.data ? 'Check another certificate' : 'Try another code'} /> : null}
        <p className="mt-10 text-center text-xs text-muted">© 2026 Deutsch Sprache RW · Kigali, Rwanda</p>
      </main>
    </div>
  );
}
