import { FiArrowLeft,FiBookOpen,FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroGhost } from '../../hero/hero-actions';
import { PageHero } from '../../hero/PageHero';
import { dateLabel } from './format';
import type { Homework,Submission } from './types';

/** Homework header: class, title, teacher + deadline, linked lesson, and the four-step progress strip. */
export function HomeworkHero({ assignment: a, submission: s }: { assignment: Homework; submission: Submission | null }) {
  const steps = [
    { label: 'Read & prepare', done: true },
    { label: 'Save your work', done: Boolean(s) },
    { label: 'Submit', done: (s?.revision ?? 0) > 0 },
    { label: 'Use feedback', done: Boolean(s?.feedback) },
  ];
  return (
    <PageHero
      eyebrow={`${a.classGroup.level.code} · ${a.classGroup.name} · Homework`}
      icon={FiFileText}
      title={a.title}
      description={<>Shared by {a.createdBy.firstName} {a.createdBy.lastName} · {a.extension ? <strong className="font-semibold">Extended to {dateLabel(a.dueAt, true)}</strong> : dateLabel(a.dueAt, true)}</>}
      art="assignments"
      actions={<>
        <Link to="/assignments" className={heroGhost}><FiArrowLeft aria-hidden />All assignments</Link>
        {a.lesson ? <Link to={`/courses/${a.classGroup.level.code.toLowerCase()}/learn/${a.lesson.id}`} className={heroGhost}><FiBookOpen aria-hidden />Practises: {a.lesson.title}</Link> : null}
      </>}
      footer={<ol className="steps w-full text-[0.6875rem]">{steps.map(step => <li key={step.label} className={`step ${step.done ? 'step-primary' : ''}`}>{step.label}</li>)}</ol>}
    />
  );
}
