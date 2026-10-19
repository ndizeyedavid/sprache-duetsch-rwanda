import { Suspense } from 'react';
import { FiBookOpen,FiDownload,FiExternalLink } from 'react-icons/fi';
import { lazyPage } from '../../../lib/lazy-page';
import { Dialog } from '../../ui/overlay/Dialog';

type Props = { url: string; filename: string; onClose: () => void };
const PdfViewer = lazyPage(() => import('./PdfViewer').then(module => module.default));

/** The original coursebook PDF in a large dialog, with download and new-tab options pinned below. */
export function CoursebookPreview({ url, filename, onClose }: Props) {
  return (
    <Dialog open onClose={onClose} icon={FiBookOpen} title="Original coursebook" widthClassName="sm:max-w-5xl"
      footer={<>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm gap-1.5 rounded-full"><FiExternalLink aria-hidden />Open in new tab</a>
        <a href={url} download={filename} className="btn btn-primary btn-sm gap-1.5 rounded-full"><FiDownload aria-hidden />Download PDF</a>
      </>}>
      <div className="flex h-[68dvh] flex-col">
        <Suspense fallback={<p role="status" className="text-xs text-muted">Loading PDF viewer…</p>}><PdfViewer url={url} /></Suspense>
      </div>
    </Dialog>
  );
}
