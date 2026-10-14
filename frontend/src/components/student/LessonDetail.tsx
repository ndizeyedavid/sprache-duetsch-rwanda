import { FiArrowRight,FiCheck,FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { humanize } from '../../lib/services';
import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';
import { CourseLessonReader } from './CourseLessonReader';
import { CoursePractice } from './CoursePractice';
import { MaterialResourceList } from './MaterialResourceList';
import { isBookPractice } from './course-practice-utils';

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
type ActivitySubmission = { id: string; status: string; score: string | number | null; maxScore: string | number; isCorrect: boolean | null; feedback: string | null; attemptNumber: number; submittedAt: string; response?: unknown };
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

export function LessonDetail({ detail, slug, completing, actionError, onComplete }: Props) {
  if (!detail) return null;
  const done = detail.progressStatus === 'COMPLETED';
  return (
    <article id="lesson-content" className="scroll-mt-24 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-content">{humanize(detail.contentType)}{detail.estimatedMinutes ? ` · ${detail.estimatedMinutes} min` : ''}</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight">{detail.title}</h1>
          {detail.description ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{detail.description}</p> : null}
        </div>
        <span className={`badge border-0 px-3 py-3 text-[11px] font-medium ${done ? 'bg-success text-success-content' : detail.progressStatus === 'IN_PROGRESS' ? 'bg-info text-info-content' : 'bg-neutral text-neutral-content'}`}>{done ? 'Completed' : humanize(detail.progressStatus)}</span>
      </div>

      {detail.videoUrl ? <AuthenticatedMedia key={detail.videoUrl} url={detail.videoUrl} kind="video" className="w-full rounded-box" /> : null}
      {detail.audioUrl ? <AuthenticatedMedia key={detail.audioUrl} url={detail.audioUrl} kind="audio" className="w-full" /> : null}
      <CourseLessonReader key={detail.id} html={detail.body}>
        <CoursePractice key={`practice-${detail.id}`} activities={detail.activities} />
      </CourseLessonReader>

      {detail.materials.length > 0 ? <MaterialResourceList materials={detail.materials} /> : null}

      {detail.activities.some(a => !isBookPractice(a)) ? (
        <div id="lesson-practice" className="scroll-mt-24 overflow-hidden rounded-box border border-line bg-base-100">
          <div className="border-b border-line bg-base-200 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold">Practice activities<span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">{detail.activities.length}</span></h2>
            <p className="mt-1 text-xs text-muted">Work on each activity on its own page — your progress saves for your facilitator.</p>
          </div>
          <ul className="grid gap-3 p-4 sm:grid-cols-2">
            {detail.activities.filter(a => !isBookPractice(a)).map((a) => {
              const sub = a.mySubmission;
              const done = !!sub;
              const graded = sub?.status === 'GRADED';
              const score = sub?.score !== null && sub?.score !== undefined ? Number(sub.score) : null;
              const max = sub ? Number(sub.maxScore ?? 1) : 1;
              return (
                <li key={a.id} className={`flex flex-col rounded-box border p-4 transition ${done ? (graded ? (sub.isCorrect === false ? 'border-coral bg-coral text-error-content' : 'border-brand bg-brand text-primary-content') : 'border-sun bg-sun text-warning-content') : 'border-line bg-base-100 hover:border-brand'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? (graded ? 'bg-brand text-white' : 'bg-sun text-white') : 'bg-brand text-primary-content'}`}>{activityIcon(a.type)}</span>
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
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${graded ? (sub.isCorrect ? 'bg-brand text-primary-content' : sub.isCorrect === false ? 'bg-coral text-error-content' : 'bg-base-200 text-muted') : 'bg-sun text-warning-content text-[#8A6800]'}`}>{graded ? (sub.isCorrect === true ? 'Correct' : sub.isCorrect === false ? 'Incorrect' : 'Graded') : 'Submitted'}</span>
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
          <p className="text-sm font-semibold">{done ? 'Lesson completed' : 'Finished this lesson?'}</p>
          <p className="text-xs text-muted">{done ? 'You can revisit resources or redo practice any time.' : 'Mark as complete to update your progress and unlock the next lesson.'}</p>
        </div>
        <button type="button" disabled={completing || done} onClick={onComplete} className="btn gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
          {completing ? <span className="loading loading-spinner loading-xs" /> : done ? <FiCheck aria-hidden /> : <FiClock aria-hidden />}{done ? 'Completed' : 'Mark as complete'}
        </button>
      </div>
      {actionError ? <p role="alert" className="rounded-box bg-coral text-error-content px-3 py-2 text-xs font-medium text-[#D8482F]">{actionError}</p> : null}
    </article>
  );
}
