import { useState } from 'react';
import { FiDownload,FiExternalLink,FiFileText,FiFilm,FiLayers,FiMusic } from 'react-icons/fi';
import { MaterialPreview } from './MaterialPreview';
import { downloadMaterial,openMaterial } from './materialFiles';

type Material = { id: string; title: string; type: string; url: string | null; mimeType: string | null; sizeBytes: number | null; isDownloadable: boolean };
const icons = { VIDEO: FiFilm, AUDIO: FiMusic, PDF: FiFileText, SLIDE: FiLayers } as const;
const formatSize = (bytes: number | null) => !bytes ? null : bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function MaterialResourceList({ materials }: { materials: Material[] }) {
  const [error, setError] = useState<string | null>(null);
  const first = materials.find(item => item.url && (item.type === 'PDF' || item.type === 'VIDEO' || item.mimeType?.includes('pdf') || item.url.endsWith('.pdf')));
  const isPdf = first?.type === 'PDF' || first?.mimeType?.includes('pdf') || first?.url?.endsWith('.pdf');
  return <div id="lesson-resources" className="scroll-mt-24 overflow-hidden rounded-box border border-line bg-base-100">
    <div className="flex items-center justify-between gap-2 border-b border-line bg-base-200 px-4 py-3"><h2 className="flex items-center gap-2 text-sm font-bold"><FiFileText aria-hidden className="text-brand" />Resources<span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">{materials.length}</span></h2><span className="hidden text-[11px] text-muted sm:block">Download permitted files for offline study</span></div>
    {first?.url ? <div className="border-b border-line bg-base-200 p-3"><p className="mb-2 flex items-center gap-2 text-xs font-semibold"><FiFileText aria-hidden className="text-brand" />Preview — {first.title}</p><div className="overflow-hidden rounded-box border border-line bg-base-100"><MaterialPreview url={first.url} title={first.title} pdf={Boolean(isPdf)} /></div></div> : null}
    {error ? <p role="alert" className="px-4 pt-3 text-xs text-error">{error}</p> : null}
    <ul className="grid gap-3 p-4 sm:grid-cols-2">{materials.map(item => {
      const Icon = icons[item.type as keyof typeof icons] ?? FiFileText;
      return <li key={item.id} className="flex gap-3 rounded-box border border-line bg-base-100 p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-box bg-base-200 text-muted"><Icon aria-hidden /></span>
        <span className="min-w-0 grow"><span className="block truncate text-sm font-semibold">{item.title}</span><span className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted"><span>{item.type}</span>{formatSize(item.sizeBytes) ? <span>{formatSize(item.sizeBytes)}</span> : null}{item.isDownloadable ? <span>Offline download available</span> : null}</span></span>
        {item.url ? <div className="flex shrink-0 flex-col gap-1">{item.isDownloadable ? <button type="button" className="btn btn-xs" onClick={() => void downloadMaterial(item.url!, item.title).catch(() => setError('Download failed. Check your connection and retry.'))}><FiDownload aria-hidden />Download</button> : null}<button type="button" className="btn btn-xs btn-ghost" onClick={() => void openMaterial(item.url!, item.title).catch(cause => setError(cause instanceof Error ? cause.message : 'Could not open resource.'))}><FiExternalLink aria-hidden />Open</button></div> : <span className="shrink-0 rounded-full bg-base-200 px-2.5 py-1 text-[11px] text-muted">No file</span>}
      </li>;
    })}</ul>
  </div>;
}
