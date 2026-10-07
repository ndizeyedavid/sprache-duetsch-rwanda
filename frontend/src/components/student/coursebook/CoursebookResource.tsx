import { useState } from 'react';
import { FiDownload,FiEye,FiFileText } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { getCoursebook } from '../../../lib/coursebook';
import { CoursebookPreview } from './CoursebookPreview';
import { useCoursebookFile } from './useCoursebookFile';

export function CoursebookResource({ levelId }: { levelId: string }) {
  const book = useApi(`coursebook-${levelId}`, () => getCoursebook(levelId));
  const file = useCoursebookFile(levelId);
  const [preview, setPreview] = useState(false);
  if (book.loading || (!book.data && !book.error)) return null;
  if (book.error) return <div className="text-xs text-base-content/65">Coursebook unavailable. <button className="btn btn-ghost btn-xs" onClick={book.refetch}>Retry</button></div>;
  if (!book.data) return null;
  async function openPreview() {
    try { await file.load(); setPreview(true); } catch { /* Error is shown below. */ }
  }
  async function download() {
    try {
      const url = await file.load();
      const link = document.createElement('a');
      link.href = url;
      link.download = book.data!.filename;
      document.body.append(link);
      link.click();
      link.remove();
    } catch { /* Error is shown below. */ }
  }
  return <>
    <section aria-label="Original coursebook PDF" className="card flex-col gap-3 border border-base-300/70 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-box bg-base-200"><FiFileText aria-hidden className="text-lg" /></span>
        <div><h2 className="text-sm font-semibold">Original coursebook</h2><p className="mt-1 text-xs text-base-content/60">PDF · {book.data.pages} pages · {(book.data.sizeBytes / 1024 / 1024).toFixed(1)} MB</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={file.loading} onClick={() => void openPreview()} className="btn btn-sm"><FiEye aria-hidden />Preview PDF</button>
        <button type="button" disabled={file.loading} onClick={() => void download()} className="btn btn-ghost btn-sm"><FiDownload aria-hidden />Download</button>
        {file.loading ? <span role="status" className="flex items-center gap-2 text-xs text-base-content/60"><span className="loading loading-spinner loading-xs" />Loading PDF…</span> : null}
      </div>
    </section>
    {file.error ? <p role="alert" className="text-xs text-error">{file.error}</p> : null}
    {preview && file.url ? <CoursebookPreview url={file.url} filename={book.data.filename} onClose={() => setPreview(false)} /> : null}
  </>;
}
