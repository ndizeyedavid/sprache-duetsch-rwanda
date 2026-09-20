import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiClock, FiDownload, FiExternalLink, FiFileText, FiFilm, FiLayers, FiMusic } from 'react-icons/fi';
import { StatusBadge } from '../ui/StatusBadge';
import { RichTextViewer } from '../ui/RichTextViewer';
import { humanize } from '../../lib/services';

function materialIcon(type: string) {
  switch (type) {
    case 'VIDEO': return FiFilm;
    case 'AUDIO': return FiMusic;
    case 'PDF': return FiFileText;
    case 'SLIDE': return FiLayers;
    default: return FiFileText;
  }
}

function activityIcon(type: string) {
  switch (type) {
    case 'FILL_BLANK': return 'Aa';
    case 'TRUE_FALSE': return 'TF';
    case 'WRITING':
    case 'DOCUMENT': return '✎';
    case 'MCQ': return '◉';
    default: return '•';
  }
}

type Material = { id: string; title: string; type: string; url: string | null; mimeType: string | null; sizeBytes: number | null; isDownloadable: boolean };
type ActivitySubmission = { id: string; status: string; score: string | number | null; maxScore: string | number; isCorrect: boolean | null; feedback: string | null; attemptNumber: number; submittedAt: string };
type Activity = { id: string; title: string; type: string; instructions: string | null; config?: unknown; mySubmission?: ActivitySubmission | null };
type Detail = {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  contentType: string;
  estimatedMinutes: number | null;
  progressStatus: string;
  materials: Material[];
  activities: Activity[];
};

type Props = {
  detail: Detail | null | undefined;
  slug: string;
  completing: boolean;
  actionError: string | null;
  onComplete: () => void;
};

function formatSize(bytes: number | null): string | null {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LessonDetail({ detail, slug, completing, actionError, onComplete }: Props) {
  if (!detail) return null;
  const done = detail.progressStatus === 'COMPLETED';
  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-[#B30A00]">{humanize(detail.contentType)}{detail.estimatedMinutes ? ` · ${detail.estimatedMinutes} min` : ''}</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight">{detail.title}</h1>
          {detail.description ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{detail.description}</p> : null}
        </div>
        <StatusBadge status={done ? 'Completed' : humanize(detail.progressStatus)} />
      </div>

      {detail.videoUrl ? <video key={detail.videoUrl} controls preload="metadata" className="w-full rounded-box bg-night"><source src={detail.videoUrl} /></video> : null}
      {detail.audioUrl ? <audio key={detail.audioUrl} controls preload="metadata" className="w-full"><source src={detail.audioUrl} /></audio> : null}
      <RichTextViewer html={detail.body} />

      {detail.materials.length > 0 ? (
        <div className="overflow-hidden rounded-box border border-line bg-base-100">
          <div className="flex items-center justify-between gap-2 border-b border-line bg-[#eff6ff] px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold"><FiFileText aria-hidden className="text-brand" />Resources<span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">{detail.materials.length}</span></h2>
            <span className="hidden text-[11px] text-muted sm:block">Tap Open to view or download</span>
          </div>
          {/* Inline preview for first PDF/video if available */}
          {(() => {
            const first = detail.materials.find((m) => m.url && (m.type === 'PDF' || m.type === 'VIDEO' || m.mimeType?.includes('pdf') || m.url?.endsWith('.pdf')));
            if (!first?.url) return null;
            const isPdf = first.type === 'PDF' || first.mimeType?.includes('pdf') || first.url.endsWith('.pdf');
            return (
              <div className="border-b border-line bg-base-200/30 p-3">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold"><FiFileText aria-hidden className="text-brand" />Preview — {first.title}</p>
                {isPdf ? (
                  <div className="overflow-hidden rounded-box border border-line bg-base-100">
                    <iframe src={first.url} title={first.title} className="h-[420px] w-full" />
                  </div>
                ) : (
                  <video controls src={first.url} className="max-h-[420px] w-full rounded-box bg-night" />
                )}
              </div>
            );
          })()}
          <ul className="grid gap-3 p-4 sm:grid-cols-2">
            {detail.materials.map((m) => {
              const Icon = materialIcon(m.type);
              const size = formatSize(m.sizeBytes);
              return (
                <li key={m.id} className="flex gap-3 rounded-box border border-line bg-base-100 p-3 transition hover:border-brand/20">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-box bg-base-200 text-muted"><Icon aria-hidden /></span>
                  <span className="min-w-0 grow">
                    <span className="block truncate text-sm font-semibold leading-tight">{m.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                      <span className="rounded-full bg-base-200 px-2 py-0.5">{humanize(m.type)}</span>
                      {size ? <span>{size}</span> : null}
                      {m.isDownloadable ? <span className="inline-flex items-center gap-1"><FiDownload aria-hidden />Downloadable</span> : null}
                    </span>
                  </span>
                  {m.url ? <a href={m.url} target="_blank" rel="noreferrer" className="btn btn-sm shrink-0 gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90"><FiExternalLink aria-hidden />Open</a> : <span className="shrink-0 rounded-full bg-base-200 px-2.5 py-1 text-[11px] text-muted">No file</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {detail.activities.length > 0 ? (
        <div className="overflow-hidden rounded-box border border-line bg-base-100">
          <div className="border-b border-line bg-base-200/50 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold">Practice activities<span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">{detail.activities.length}</span></h2>
            <p className="mt-1 text-xs text-muted">Work on each activity on its own page — your progress saves for your facilitator.</p>
          </div>
          <ul className="grid gap-3 p-4 sm:grid-cols-2">
            {detail.activities.map((a) => {
              const sub = a.mySubmission;
              const done = !!sub;
              const graded = sub?.status === 'GRADED';
              const score = sub?.score !== null && sub?.score !== undefined ? Number(sub.score) : null;
              const max = sub ? Number(sub.maxScore ?? 1) : 1;
              return (
                <li key={a.id} className={`flex flex-col rounded-box border p-4 transition ${done ? (graded ? (sub.isCorrect === false ? 'border-coral/30 bg-coral-soft/20' : 'border-brand/20 bg-brand-soft/30') : 'border-sun/30 bg-sun-soft/20') : 'border-line bg-base-100 hover:border-brand/20'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? (graded ? 'bg-brand text-white' : 'bg-sun text-white') : 'bg-brand-soft text-brand'}`}>{activityIcon(a.type)}</span>
                    <span className="flex items-center gap-1">
                      <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px]">{humanize(a.type)}</span>
                      {done ? <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${graded ? 'bg-brand text-white' : 'bg-sun text-white'}`}>{graded ? 'Completed' : 'Submitted'}</span> : null}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{a.title}</h3>
                  {a.instructions ? <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{a.instructions}</p> : <p className="mt-1 text-xs text-muted">Open to start this activity.</p>}
                  {done ? (
                    <div className="mt-2 space-y-1 rounded-box bg-base-100 p-2">
                      <p className="flex items-center justify-between text-xs">
                        <span className="font-medium">{graded ? (score !== null ? `Score: ${score}/${max}` : 'Graded') : 'Awaiting grading'}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${graded ? (sub.isCorrect ? 'bg-brand-soft text-brand' : sub.isCorrect === false ? 'bg-coral-soft text-coral' : 'bg-base-200 text-muted') : 'bg-sun-soft text-[#8A6800]'}`}>{graded ? (sub.isCorrect === true ? 'Correct' : sub.isCorrect === false ? 'Incorrect' : 'Graded') : 'Submitted'}</span>
                      </p>
                      {sub.feedback ? <p className="rounded bg-base-200 px-2 py-1 text-[11px] leading-relaxed">Feedback: {sub.feedback}</p> : null}
                    </div>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <Link to={`/courses/${slug}/learn/${detail.id}/activity/${a.id}`} className={`btn btn-sm flex-1 gap-1 rounded-full border-0 text-white hover:opacity-90 ${done ? 'bg-base-300 text-ink hover:bg-base-300' : 'bg-brand'}`}>{done ? 'Redo' : 'Start activity'}<FiArrowRight aria-hidden /></Link>
                    {done ? <Link to={`/courses/${slug}/learn/${detail.id}/activity/${a.id}`} className="btn btn-sm rounded-full border-line bg-base-100">View</Link> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 rounded-box border border-line bg-base-100 p-4">
        <div className="min-w-0 grow">
          <p className="text-sm font-semibold">{done ? 'Lesson completed' : 'Ready to continue?'}</p>
          <p className="text-xs text-muted">{done ? 'You can revisit resources or redo practice any time.' : 'Mark as complete to update your progress and unlock the next lesson.'}</p>
        </div>
        <button type="button" disabled={completing || done} onClick={onComplete} className="btn gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
          {completing ? <span className="loading loading-spinner loading-xs" /> : done ? <FiCheck aria-hidden /> : <FiClock aria-hidden />}{done ? 'Completed' : 'Mark as complete'}
        </button>
      </div>
      {actionError ? <p role="alert" className="rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{actionError}</p> : null}
    </article>
  );
}
