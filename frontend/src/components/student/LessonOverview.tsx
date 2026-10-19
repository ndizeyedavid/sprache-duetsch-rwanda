import { FiArrowLeft,FiBookOpen,FiCheckCircle,FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { StudentLesson } from '../../lib/services';
import { humanize } from '../../lib/services';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { isBookPractice } from './course-practice-utils';

type Props = { detail: StudentLesson | null; code: string; slug: string; fallbackTitle?: string; position: string };

/** Compact lesson header: where you are, jump links, and teacher feedback in the white strip. */
export function LessonOverview({ detail, code, slug, fallbackTitle, position }: Props) {
  const done = detail?.progressStatus === 'COMPLETED';
  const submitted = detail?.activities.filter(a => a.mySubmission) ?? [];
  const feedback = detail?.activities.filter(a => a.mySubmission?.feedback) ?? [];
  const graded = submitted.filter(a => a.mySubmission?.status === 'GRADED').length;
  const waiting = submitted.filter(a => !isBookPractice(a) && a.mySubmission?.status !== 'GRADED').length;
  return (
    <PageHero
      compact
      eyebrow={`${code} · ${position}`}
      icon={done ? FiCheckCircle : FiBookOpen}
      title={detail?.title ?? fallbackTitle ?? 'Lesson'}
      description={detail ? done ? 'Lesson complete. Keep moving! Your progress is saved.' : 'Read, practise, then mark it complete.' : 'Opening your lesson…'}
      art="notes"
      meta={detail ? <>
        <span className="hero-chip hero-chip-solid">{done ? 'Completed' : humanize(detail.progressStatus)}</span>
        <span className="hero-chip">{humanize(detail.contentType)}{detail.estimatedMinutes ? ` · ${detail.estimatedMinutes} min` : ''}</span>
        {detail.materials.length ? <a href="#lesson-resources" className="hero-chip">{detail.materials.length} resources</a> : null}
        {detail.activities.length ? <a href={detail.activities.some(isBookPractice) ? '#course-reading' : '#lesson-practice'} className="hero-chip">Practice · {submitted.length}/{detail.activities.length} submitted</a> : null}
      </> : null}
      actions={<Link to={`/courses/${slug}/learn`} className={heroGhost}><FiArrowLeft aria-hidden />{code} course map</Link>}
      footer={feedback.length ? (
        <div className="text-base-content">
          <p className="flex items-center gap-2 text-xs font-semibold"><FiMessageSquare aria-hidden />Teacher feedback</p>
          {feedback.map(a => <p key={a.id} className="mt-2 text-xs leading-relaxed"><span className="font-medium">{a.title}: </span>{a.mySubmission?.feedback}</p>)}
        </div>
      ) : submitted.length ? <p className="text-xs text-muted">{graded} graded · {waiting} awaiting feedback</p> : undefined}
    />
  );
}
