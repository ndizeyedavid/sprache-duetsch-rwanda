import { AuthenticatedMedia } from '../../ui/AuthenticatedMedia';
import type { HomeworkQuestion } from '../homework/types';
const responseLabel = (value: unknown): string => value == null ? 'No answer' : typeof value === 'string' ? value : Array.isArray(value) ? value.map(responseLabel).join(', ') : typeof value === 'object' ? Object.entries(value).map(([key, v]) => `${key}: ${responseLabel(v)}`).join('\n') : String(value);

type Props = { questions: HomeworkQuestion[]; responses: Record<string, unknown>; values: string[]; editable: boolean; onChange: (index: number, value: string) => void };
export function QuestionScoring({ questions, responses, values, editable, onChange }: Props) {
  return <div className="space-y-4">{questions.map(({ question: q, points }, index) => <section key={q.id} className="rounded-box border border-base-300 p-4">
    <h3 className="text-sm font-semibold leading-6">{index + 1}. {q.prompt}</h3>
    {q.imageUrl ? <AuthenticatedMedia url={q.imageUrl} kind="image" title="Question illustration" className="mt-3 max-h-44 max-w-full object-contain" /> : null}
    {q.audioUrl ? <AuthenticatedMedia url={q.audioUrl} kind="audio" className="mt-3 w-full" /> : null}
    <p className="mt-3 text-[11px] font-semibold text-base-content/55">Student’s answer</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7">{responseLabel(responses[q.id])}</p>
    {q.correctAnswer != null ? <details className="mt-3 text-xs text-base-content/65"><summary className="cursor-pointer">Answer key · staff only</summary><p className="mt-2 whitespace-pre-wrap leading-6">{responseLabel(q.correctAnswer)}</p></details> : null}
    <label className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-base-content/60">{['ESSAY', 'SHORT_TEXT'].includes(q.type) ? 'Teacher review required' : 'Suggested score · check before sending'}</span><span className="flex items-center gap-2 text-xs"><input type="number" aria-label={`Question ${index + 1} score`} className="input input-sm w-24" disabled={!editable} min={0} max={Number(points ?? q.points)} step="0.01" value={values[index] ?? ''} onChange={e => onChange(index, e.target.value)} />/ {points ?? q.points} pts</span></label>
  </section>)}</div>;
}
