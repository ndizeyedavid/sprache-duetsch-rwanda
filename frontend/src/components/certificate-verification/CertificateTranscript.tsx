import { FiAward,FiBookOpen,FiCheckCircle } from 'react-icons/fi';
import type { CertificateVerification } from '../../lib/services';
import { humanize,isoDate } from '../../lib/services';
import { Panel } from '../ui/Panel';

export function CertificateTranscript({ data }: { data: CertificateVerification }) {
  const lessonCount = data.modules.reduce((total, module) => total + module.lessons.length, 0);
  return <>
    {data.modules.length ? <Panel>
      <h2 className="flex items-center gap-2 text-sm font-bold"><FiBookOpen aria-hidden className="text-brand" />Lessons covered — {data.levelCode}</h2>
      <p className="mt-1 text-xs text-muted">{data.modules.length} modules · {lessonCount} lessons</p>
      <div className="mt-3 space-y-3">{data.modules.map(mod => <div key={mod.title} className="rounded-box border border-line bg-base-100 p-3">
        <p className="text-xs font-bold">{mod.order}. {mod.title}</p><ul className="mt-2 grid gap-1 sm:grid-cols-2">{mod.lessons.map(lesson => <li key={lesson.title} className="flex items-center gap-2 text-xs"><FiCheckCircle aria-hidden className="shrink-0 text-success" size={12} /><span className="truncate">{lesson.order}. {lesson.title}</span></li>)}</ul>
      </div>)}</div>
    </Panel> : null}
    {data.assessments.length || data.activities.length ? <Panel>
      <h2 className="flex items-center gap-2 text-sm font-bold"><FiAward aria-hidden className="text-brand" />Graded work</h2>
      <p className="mt-1 text-xs text-muted">Assignments and exams completed for this level — official transcript excerpt.</p>
      {data.assessments.length ? <section className="mt-3"><h3 className="text-xs font-semibold">Assessments</h3><ul className="mt-2 space-y-2">{data.assessments.map((item, index) => <li key={`${item.title}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-line bg-base-100 px-3 py-2">
        <span className="min-w-0"><span className="block truncate text-xs font-semibold">{item.title}</span><span className="text-[11px] text-muted">{humanize(item.type)} · {isoDate(item.submittedAt)}</span></span>
        <span className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.passed ? 'bg-brand text-white' : item.passed === false ? 'bg-coral text-white' : 'bg-base-200'}`}>{item.score !== null ? `${item.score}/${item.maxScore}` : '—'}{item.percentage !== null ? ` · ${item.percentage}%` : ''}</span>{item.passed !== null ? <span className={`rounded-full px-2 py-0.5 text-[11px] ${item.passed ? 'bg-success/15 text-success' : 'bg-coral-soft text-coral'}`}>{item.passed ? 'Passed' : 'Not passed'}</span> : null}</span>
      </li>)}</ul></section> : null}
      {data.activities.length ? <section className="mt-4"><h3 className="text-xs font-semibold">Activities</h3><ul className="mt-2 space-y-2">{data.activities.map((item, index) => <li key={`${item.title}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-line bg-base-100 px-3 py-2">
        <span className="min-w-0"><span className="block truncate text-xs font-semibold">{item.title}</span><span className="text-[11px] text-muted">{humanize(item.type)}</span></span><span className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.isCorrect ? 'bg-brand text-white' : item.isCorrect === false ? 'bg-coral text-white' : 'bg-base-200'}`}>{item.score !== null ? `${item.score}/${item.maxScore}` : '—'}</span>{item.isCorrect !== null ? <span className={`text-[11px] ${item.isCorrect ? 'text-success' : 'text-coral'}`}>{item.isCorrect ? 'Correct' : 'Incorrect'}</span> : null}</span>
      </li>)}</ul></section> : null}
    </Panel> : null}
  </>;
}
