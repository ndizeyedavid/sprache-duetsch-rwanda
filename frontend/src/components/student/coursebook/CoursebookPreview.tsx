import { Suspense,useEffect,useRef } from 'react';
import { lazyPage } from '../../../lib/lazy-page';
import { FiDownload,FiExternalLink,FiX } from 'react-icons/fi';

type Props = { url: string; filename: string; onClose: () => void };
const PdfViewer = lazyPage(() => import('./PdfViewer').then(module => module.default));
export function CoursebookPreview({ url, filename, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="modal" aria-labelledby="coursebook-preview-title" onClose={onClose}>
    <div className="modal-box flex h-[90dvh] w-full max-w-5xl flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="coursebook-preview-title" className="text-base font-semibold">Original coursebook</h2>
        <form method="dialog"><button className="btn btn-ghost btn-sm btn-circle" aria-label="Close PDF preview"><FiX aria-hidden /></button></form>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a href={url} download={filename} className="btn btn-sm"><FiDownload aria-hidden />Download PDF</a>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><FiExternalLink aria-hidden />Open in new tab</a>
      </div>
      <Suspense fallback={<p role="status" className="text-xs text-base-content/60">Loading PDF viewer…</p>}><PdfViewer url={url} /></Suspense>
    </div>
    <form method="dialog" className="modal-backdrop"><button aria-label="Close PDF preview">Close</button></form>
  </dialog>;
}
