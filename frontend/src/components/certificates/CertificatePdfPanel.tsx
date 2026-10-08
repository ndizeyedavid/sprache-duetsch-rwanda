import { Suspense } from 'react';
import { lazyPage } from '../../lib/lazy-page';
import { FiFileText } from 'react-icons/fi';
const PdfViewer = lazyPage(() => import('../student/coursebook/PdfViewer').then(module => module.default));

type Props = { url: string | null; loading?: boolean; onReady?: () => void; onError?: () => void };
export function CertificatePdfPanel({ url, loading, onReady, onError }: Props) {
  return <section aria-label="Certificate preview" className="flex min-h-[350px] flex-col rounded-box border border-base-300 bg-base-200/40 p-4 lg:min-h-[530px]">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">Document preview</h3><span className="text-xs text-base-content/60">PDF · zoom to inspect</span></div>
    {loading ? <div role="status" className="grid flex-1 place-content-center gap-3 text-center text-sm"><span className="loading loading-spinner mx-auto"/>Preparing your certificate…</div>
      : url ? <Suspense fallback={<p role="status">Opening PDF preview…</p>}><PdfViewer key={url} url={url} documentLabel="Certificate" onReady={onReady} onError={onError}/></Suspense>
      : <div className="grid flex-1 place-content-center justify-items-center px-5 text-center"><FiFileText size={36} className="mb-4 text-base-content/35" aria-hidden/><p className="font-medium">See the certificate before you issue it</p><p className="mt-2 max-w-sm text-sm leading-6 text-base-content/60">Choose a learner and course, then preview the document. Changes to the details need a new preview.</p></div>}
  </section>;
}
