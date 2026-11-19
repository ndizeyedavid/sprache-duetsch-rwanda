import { FiArrowRight,FiAward,FiCheck,FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { StudentLesson } from '../../../lib/services';

type Test = NonNullable<StudentLesson['tests']>[number];

function result(test: Test): { label: string; passed: boolean } {
  const last = test.attempts[0];
  if (!last) return { label: 'Not taken yet', passed: false };
  if (last.status !== 'GRADED') return { label: last.status === 'IN_PROGRESS' ? 'In progress' : 'Waiting for your teacher', passed: false };
  const percent = Number(last.maxScore) ? Math.round(Number(last.score ?? 0) / Number(last.maxScore) * 100) : 0;
  return { label: `${percent}% · ${last.passed ? 'passed' : `pass mark ${Number(test.passMark)}%`}`, passed: last.passed === true };
}

/** The module test (or final exam) that opens after this lesson: graded, timed, counts for the certificate. */
export function LessonTests({ tests }: { tests: StudentLesson['tests'] }) {
  if (!tests?.length) return null;
  return <section className="card border border-base-300 bg-base-100 p-4 xl:p-5" aria-label="Tests">
    <h2 className="text-lg font-bold">{tests.some((test) => test.type === 'FINAL_EXAM') ? 'Abschlusstest · Final exam' : 'Modultest · Module test'}</h2>
    <p className="text-xs text-muted">Check what you learned in this module: listening, reading, words, grammar and writing. Your teacher sees the result.</p>
    <ul className="mt-3 grid gap-2 md:grid-cols-2">
      {tests.map((test) => {
        const state = result(test);
        return <li key={test.id}>
          <Link to={`/assignments/ASM-${test.id}`} className="flex items-center gap-3 rounded-box border border-line bg-base-100 p-3 transition-colors hover:border-primary">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg ${state.passed ? 'bg-ok-soft text-ok' : 'bg-primary text-primary-content'}`}>
              {state.passed ? <FiCheck aria-hidden /> : <FiAward aria-hidden />}
            </span>
            <span className="min-w-0 grow">
              <span className="block font-semibold leading-tight" lang="de">{test.title}</span>
              <span className="flex items-center gap-1 text-xs text-muted">{test.durationMinutes ? <><FiClock aria-hidden />{test.durationMinutes} min · </> : null}{state.label}</span>
            </span>
            <FiArrowRight aria-hidden className="shrink-0 text-muted" />
          </Link>
        </li>;
      })}
    </ul>
  </section>;
}
