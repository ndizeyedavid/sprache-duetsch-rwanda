import { FiArrowRight,FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroAction } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import type { GradeEntry } from './result-model';

/** Grades header: what this page holds, and the one next step (revise returned work or go practise). */
export function ResultsHero({ entries }: { entries: GradeEntry[] }) {
  const returned = entries.find(e => e.state === 'returned');
  return (
    <PageHero
      eyebrow="Your results"
      icon={FiStar}
      title="Grades & feedback"
      description="See your progress, know your next step. All your grades and teacher feedback together — your scores and what to practise next."
      art="grades"
      meta={<><span className="hero-chip">Homework, quizzes & exams</span><span className="hero-chip">Feedback to help you improve</span></>}
      actions={<Link className={heroAction} to={returned?.href ?? '/assignments'}>{returned ? 'Review requested changes' : 'Go to assignments'}<FiArrowRight aria-hidden /></Link>}
    />
  );
}
