import { useShuffledOptions } from '../../hooks/useShuffledOptions';
import type { MyAssessmentDetail } from '../../lib/services';
import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';
import { ChoiceAnswer } from './exam/ChoiceAnswer';
import { LimitedAudio } from './exam/LimitedAudio';
import { MatchingAnswer } from "./MatchingAnswer";
import { OrderingAnswer } from "./OrderingAnswer";

/** How the question's exam part behaves: a/b/c labels in written order, and a play limit per recording. */
export type QuestionPart = { letters?: boolean; plays?: number | null; playKey?: string };
type Props = { item: MyAssessmentDetail['questions'][number]; index: number; value: unknown; onChange: (value: unknown) => void; disabled: boolean; part?: QuestionPart };

export function AssessmentQuestion({ item, index, value, onChange, disabled, part }: Props) {
  const question = item.question;
  const list = Array.isArray(question.options) ? question.options.map(String) : question.type === 'TRUE_FALSE' ? ['True', 'False'] : [];
  const options = useShuffledOptions(list, question.id);
  // Blank lines split an instruction / reading text (shown in a box) from the question itself.
  const parts = question.prompt.split(/\n\s*\n/);
  const ask = parts.pop() ?? '';
  return (
    <section className="card gap-4 border border-base-300 bg-base-100 p-4 sm:p-5">
      {parts.length ? <div className="space-y-2 rounded-field bg-base-200 p-3 text-sm leading-6 whitespace-pre-line">{parts.map((part, at) => <p key={at}>{part}</p>)}</div> : null}
      <h3 className="flex items-start gap-3 text-sm font-semibold leading-6 whitespace-pre-line"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-content text-xs text-primary">{index + 1}</span>{ask}</h3>
      {question.imageUrl ? <AuthenticatedMedia url={question.imageUrl} kind="image" title="Question illustration" className="max-h-52 max-w-full rounded-field object-contain" /> : null}
      {question.audioUrl && part?.plays ? <LimitedAudio url={question.audioUrl} plays={part.plays} playKey={part.playKey ?? question.id} label={`Recording ${index + 1}`} />
        : question.audioUrl ? <AuthenticatedMedia url={question.audioUrl} kind="audio" className="w-full" /> : null}
      {question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE' ? <ChoiceAnswer name={question.id} number={index + 1} options={list} value={value} onChange={onChange} disabled={disabled} letters={part?.letters} />
        : question.type === 'MULTIPLE_CHOICE' ? <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="sr-only">Select answers for question {index + 1}</legend>{options.map(({ value: option, index: optionIndex }) => {
        const selected = Array.isArray(value) ? value as string[] : [];
        const checked = selected.includes(option);
        return <label key={optionIndex} className={`flex cursor-pointer items-center gap-3 rounded-field border p-3 text-sm ${checked ? 'border-primary bg-primary text-primary-content' : 'border-base-300'}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked ? [...selected, option] : selected.filter((entry) => entry !== option))} disabled={disabled} className="checkbox checkbox-primary checkbox-sm" />{option}</label>;
      })}</fieldset> : question.type === 'ORDERING' ? <OrderingAnswer options={list} value={value} onChange={onChange} disabled={disabled} id={question.id} /> : question.type === 'MATCHING' ? <MatchingAnswer options={question.options} value={value} onChange={onChange} disabled={disabled} /> : question.type === 'FILL_BLANK' ? <input aria-label={`Answer for question ${index + 1}`} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder="Your answer…" className="input w-full rounded-field border-base-300 bg-base-100 text-sm" /> : <textarea aria-label={`Answer for question ${index + 1}`} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} disabled={disabled} rows={question.type === 'ESSAY' ? 7 : 4} placeholder="Your answer…" className="textarea w-full rounded-field border-base-300 bg-base-100 text-sm" />}
      <p className="text-[0.625rem] text-muted">{String(item.points ?? question.points)} pts</p>
    </section>
  );
}
