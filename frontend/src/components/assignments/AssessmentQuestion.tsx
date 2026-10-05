import { OrderingAnswer } from "./OrderingAnswer";
import { MatchingAnswer } from "./MatchingAnswer";
import type { MyAssessmentDetail } from '../../lib/services';
import { useShuffledOptions } from '../../hooks/useShuffledOptions';

type Props = { item: MyAssessmentDetail['questions'][number]; index: number; value: unknown; onChange: (value: unknown) => void; disabled: boolean };

export function AssessmentQuestion({ item, index, value, onChange, disabled }: Props) {
  const question = item.question;
  const options = useShuffledOptions(Array.isArray(question.options) ? question.options.map(String) : question.type === 'TRUE_FALSE' ? ['True', 'False'] : [], question.id);
  return (
    <section className="card gap-4 border border-base-300/70 bg-base-100 p-4 sm:p-5">
      <h3 className="flex items-start gap-3 text-sm font-semibold leading-6"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs text-primary">{index + 1}</span>{question.prompt}</h3>
      {question.imageUrl ? <img src={question.imageUrl} alt="Question illustration" className="max-h-52 max-w-full rounded-field object-contain" /> : null}
      {question.audioUrl ? <audio controls src={question.audioUrl} className="w-full" /> : null}
      {question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE' ? <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="sr-only">Select one answer for question {index + 1}</legend>{options.map(({ value: option, index: optionIndex }) => {
        const checked = value === option || value === String(optionIndex) || value === optionIndex;
        return <label key={optionIndex} className={`flex cursor-pointer items-center gap-3 rounded-field border p-3 text-sm ${checked ? 'border-primary/40 bg-primary/5' : 'border-base-300'}`}><input type="radio" name={question.id} checked={checked} onChange={() => onChange(option)} disabled={disabled} className="radio radio-primary radio-sm" />{option}</label>;
      })}</fieldset> : question.type === 'MULTIPLE_CHOICE' ? <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="sr-only">Select answers for question {index + 1}</legend>{options.map(({ value: option, index: optionIndex }) => {
        const selected = Array.isArray(value) ? value as string[] : [];
        const checked = selected.includes(option);
        return <label key={optionIndex} className={`flex cursor-pointer items-center gap-3 rounded-field border p-3 text-sm ${checked ? 'border-primary/40 bg-primary/5' : 'border-base-300'}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked ? [...selected, option] : selected.filter((entry) => entry !== option))} disabled={disabled} className="checkbox checkbox-primary checkbox-sm" />{option}</label>;
      })}</fieldset> : question.type === 'ORDERING' ? <OrderingAnswer options={Array.isArray(question.options) ? question.options.map(String) : []} value={value} onChange={onChange} disabled={disabled} id={question.id} /> : question.type === 'MATCHING' ? <MatchingAnswer options={question.options} value={value} onChange={onChange} disabled={disabled} /> : question.type === 'FILL_BLANK' ? <input aria-label={`Answer for question ${index + 1}`} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder="Your answer…" className="input w-full rounded-field border-base-300 bg-base-100 text-sm" /> : <textarea aria-label={`Answer for question ${index + 1}`} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} disabled={disabled} rows={4} placeholder="Your answer…" className="textarea w-full rounded-field border-base-300 bg-base-100 text-sm" />}
      <p className="text-[10px] text-base-content/55">{String(item.points ?? question.points)} pts</p>
    </section>
  );
}
