import { FiArrowLeft,FiClock,FiShield } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { humanize } from '../../lib/services';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { isCompletionType } from './response-utils';

type Props = { slug: string; lessonId: string; code: string; title?: string; type?: string; instructions?: string | null; guarded?: boolean };

/** Compact header of the activity player: what it is, the rules, and the way back to the lesson. */
export function ActivityIntro({ slug, lessonId, code, title, type, instructions, guarded }: Props) {
  return (
    <PageHero
      compact
      eyebrow={`${code} · ${type && isCompletionType(type) ? 'Self-study' : 'Practice activity'}`}
      icon={FiClock}
      title={title ?? 'Practice activity'}
      description={instructions ? <p className="whitespace-pre-wrap">{instructions}</p> : null}
      art="assignments"
      meta={type ? <>
        <span className="hero-chip hero-chip-solid">{humanize(type)}</span>
        {guarded ? <span className="hero-chip"><FiShield aria-hidden />Anti-cheat: fullscreen · no copy/paste · 3 strikes lock</span> : null}
      </> : null}
      actions={<>
        <Link to={`/courses/${slug}/learn/${lessonId}`} className={heroGhost}><FiArrowLeft aria-hidden />Back to lesson</Link>
        <Link to={`/courses/${slug}/learn`} className={heroGhost}>{code} course map</Link>
      </>}
    />
  );
}
