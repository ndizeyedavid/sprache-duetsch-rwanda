import { Suspense, useEffect, useState } from 'react';
import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { apiErrorMessage, downloadFile } from '../../lib/api';
import { lazyPage } from '../../lib/lazy-page';
import { BookLoader } from '../common/BookLoader';
import { Modal } from '../ui/Modal';

const PdfViewer = lazyPage(() => import('../student/coursebook/PdfViewer').then(module => module.default));

type Props = {
  title: string; intro: string; label: string;
  load: (signal: AbortSignal) => Promise<Blob>;
  downloadPath: string; filename: string;
  checkHref?: string; checkLabel?: string;
  onClose: () => void;
};

/** Shared preview for school PDFs (receipts, certificates): view in place, download, or open the public check. */
export function PdfDocumentDialog({ title, intro, label, load, downloadPath, filename, checkHref, checkLabel = 'Check online', onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setUrl(null); setError(null);
    load(controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(e => { if (!controller.signal.aborted) setError(apiErrorMessage(e, `Could not load the ${label.toLowerCase()}.`)); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [load, label, retry]);
  async function download() {
    setDownloading(true);
    try { await downloadFile(downloadPath, filename); }
    catch (e) { setError(apiErrorMessage(e, `Could not download the ${label.toLowerCase()}.`)); }
    finally { setDownloading(false); }
  }
  return (
    <Modal open onClose={onClose} title={title} boxClassName="max-w-4xl">
      <div className="space-y-4">
        <p className="text-sm text-muted">{intro}</p>
        <div className="flex min-h-[420px] flex-col rounded-box border border-base-300 bg-base-200/40 p-3">
          {error ? <div role="alert" className="alert alert-error alert-soft">{error}<button className="btn btn-sm" onClick={() => setRetry(value => value + 1)}>Retry</button></div>
            : url ? <Suspense fallback={<BookLoader className="flex-1" />}><PdfViewer key={url} url={url} documentLabel={label} /></Suspense>
            : <BookLoader label={`Preparing your ${label.toLowerCase()}…`} className="flex-1" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn rounded-full border-0 bg-brand text-white hover:bg-brand/90" disabled={downloading || !url} onClick={() => void download()}>
            <FiDownload aria-hidden />{downloading ? 'Downloading…' : 'Download PDF'}
          </button>
          {checkHref ? <a className="btn btn-ghost rounded-full" href={checkHref} target="_blank" rel="noreferrer"><FiExternalLink aria-hidden />{checkLabel}</a> : null}
        </div>
      </div>
    </Modal>
  );
}
