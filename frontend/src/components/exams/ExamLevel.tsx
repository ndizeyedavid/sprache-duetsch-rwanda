import type { ExamCentreLevel } from '../../lib/services/exam-centre';
import { EXAM_GUIDES,PAPER_STEPS } from './exam-guides';
import { ExamGuideCard } from './ExamGuideCard';
import { ExamTests } from './ExamTests';
import { PaperCard } from './PaperCard';

/** One course in the exam centre: how its exam works, our tests in its format, and the official papers. */
export function ExamLevel({ level }: { level: ExamCentreLevel }) {
  const guide = EXAM_GUIDES[level.code];
  return (
    <div className="space-y-4">
      {guide ? <ExamGuideCard guide={guide} /> : null}
      <section className="card border border-base-300 bg-base-100 p-4 sm:p-5" aria-label="Our tests">
        <h2 className="text-lg font-bold">Our tests in the exam format</h2>
        <p className="mb-3 text-sm text-muted">Every module ends with a test, and the course ends with a timed mock exam built like the real one. Your teacher marks the writing.</p>
        <ExamTests tests={level.tests} slug={level.code.toLowerCase()} />
      </section>
      <section className="card border border-base-300 bg-base-100 p-4 sm:p-5" aria-label="Official sample exams">
        <h2 className="text-lg font-bold">Official sample exams</h2>
        <p className="text-sm text-muted">Real exam papers from the Goethe-Institut, free for practice. They are © Goethe-Institut.</p>
        {level.papers.length ? <>
          <ul className="mt-3 grid gap-3 lg:grid-cols-2">{level.papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)}</ul>
          <details className="mt-3 rounded-field bg-base-200 p-3 text-sm">
            <summary className="cursor-pointer font-semibold">How to practise with a sample exam</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5 leading-6">{PAPER_STEPS.map((step) => <li key={step}>{step}</li>)}</ol>
          </details>
        </> : <p className="mt-3 rounded-field border border-dashed border-base-300 p-4 text-sm text-muted">No sample papers for this level yet.</p>}
      </section>
    </div>
  );
}
