import { FiFileText } from 'react-icons/fi';
import { asFileResponse } from '../activity-player/config-readers';
import { openMaterial } from '../student/materialFiles';
import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';

const describe = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(describe).join(' · ');
  return Object.entries(value as Record<string, unknown>).map(([key, item]) => `${key}: ${describe(item)}`).join(' · ');
};

/** A student's activity response for grading: recordings play inline, documents open, text stays readable. */
export function ActivityResponseView({ response }: { response: unknown }) {
  const file = asFileResponse(response);
  if (!file) return <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap rounded bg-base-200 px-2 py-1 text-xs">Response: {describe(response)}</p>;
  return <div className="mt-1.5 space-y-1 rounded bg-base-200 p-2 text-xs" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
    {file.mimeType?.startsWith('audio/')
      ? <><p className="font-medium">Recording{file.durationSeconds ? ` · ${file.durationSeconds}s` : ''}</p><AuthenticatedMedia url={file.fileUrl} kind="audio" title="student recording" className="h-9 w-full" /></>
      : <button type="button" className="btn btn-xs gap-1 rounded-full" onClick={() => void openMaterial(file.fileUrl, 'Student submission').catch(() => {})}><FiFileText aria-hidden />Open submitted file</button>}
    {file.text ? <p className="whitespace-pre-wrap">Note: {file.text}</p> : null}
  </div>;
}
