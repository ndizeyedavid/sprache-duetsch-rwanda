import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfViewer({ url }: { url: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const surface = useRef<HTMLDivElement>(null);
  function movePage(next: number) {
    setPage(next);
    setPageInput(String(next));
  }
  function jumpToPage() {
    const next = Number(pageInput);
    movePage(pdf && Number.isInteger(next) && next >= 1 && next <= pdf.numPages ? next : page);
  }
  useEffect(() => {
    const task = getDocument({ url });
    let active = true;
    task.promise.then(document => { if (active) setPdf(document); })
      .catch(() => { if (active) { setError('Could not display this PDF. You can still download or open it in a new tab.'); setLoading(false); } });
    return () => { active = false; void task.destroy(); };
  }, [url]);
  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => setWidth(Math.max(200, entries[0].contentRect.width - 24)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!pdf || !surface.current) return;
    let active = true;
    let render: RenderTask | undefined;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Original coursebook page ${page}`);
    surface.current.scrollTop = 0;
    setLoading(true);
    setError('');
    pdf.getPage(page).then(async sheet => {
      if (!active) return;
      const viewport = sheet.getViewport({ scale: width / sheet.getViewport({ scale: 1 }).width * zoom });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      surface.current?.append(canvas);
      render = sheet.render({ canvas, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      await render.promise;
      if (active) setLoading(false);
    }).catch(() => { if (active) { setError('Could not display this page. Please try another page or download the PDF.'); setLoading(false); } });
    return () => { active = false; render?.cancel(); canvas.remove(); };
  }, [pdf, page, width, zoom]);
  return <div className="flex min-h-0 flex-1 flex-col gap-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button className="btn btn-sm btn-circle" aria-label="Previous PDF page" disabled={!pdf || page === 1} onClick={() => movePage(page - 1)}><FiChevronLeft aria-hidden /></button>
        <label className="flex items-center gap-2 text-xs">Page<input aria-label="PDF page number" type="number" min={1} max={pdf?.numPages ?? 1} value={pageInput} onChange={event => setPageInput(event.target.value)} onBlur={jumpToPage} onKeyDown={event => { if (event.key === 'Enter') jumpToPage(); }} className="input input-sm w-18" />of {pdf?.numPages ?? '…'}</label>
        <button className="btn btn-sm btn-circle" aria-label="Next PDF page" disabled={!pdf || page === pdf.numPages} onClick={() => movePage(page + 1)}><FiChevronRight aria-hidden /></button>
      </div>
      <select aria-label="PDF zoom" className="select select-sm w-auto" value={zoom} onChange={event => setZoom(Number(event.target.value))}>
        <option value={1}>Fit width</option><option value={1.5}>150%</option><option value={2}>200%</option>
      </select>
    </div>
    {loading ? <p role="status" className="flex items-center gap-2 text-xs text-base-content/60"><span className="loading loading-spinner loading-xs" />Rendering page…</p> : null}
    {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
    <div ref={surface} className="min-h-0 flex-1 overflow-auto rounded-box border border-base-300 bg-base-200 p-3" />
  </div>;
}
