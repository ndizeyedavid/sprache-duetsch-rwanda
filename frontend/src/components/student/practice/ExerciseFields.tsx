import { isAcceptedAnswer } from './accepted';
import { ExerciseChoices } from './ExerciseChoices';
import type { Item } from './types';
export function ExerciseFields({ items, answers, checked, allCorrect, onChange, group }: {
  group: string; items: Item[]; answers: Record<string, string>; checked: boolean; allCorrect?: boolean; onChange: (id: string, value: string) => void;
}) {
  return <div className="grid gap-3 sm:grid-cols-2">
    {items.map((item, index) => {
      const answer = answers[item.id] ?? '';
      // The server's verdict wins: when it marks the set correct, every item is correct.
      const correct = !!allCorrect || isAcceptedAnswer(answer, item);
      return <fieldset key={item.id} className={`rounded-box border p-4 ${checked && item.answer ? correct ? 'border-success' : 'border-error' : 'border-base-300'}`}>
        <legend className="max-w-full px-2 text-sm font-semibold"><span className="mr-2 text-muted">{index + 1}.</span>{item.prompt}</legend>
        {item.options ? <ExerciseChoices options={item.options} group={`${group}-${item.id}`} answer={answer} onChange={value => onChange(item.id, value)} /> : <input className="input w-full" aria-label={item.prompt} value={answer} placeholder="Your answer" onChange={e => onChange(item.id, e.target.value)} />}
        {checked && item.answer ? <p role="status" className={`mt-2 text-xs font-medium ${correct ? 'text-success' : 'text-error'}`}>{correct ? '✓ Correct' : `Try again · ${item.answer}`}</p> : null}
        {checked && item.explanation ? <p className="mt-2 rounded-field bg-base-200 p-2 text-xs leading-relaxed">{item.explanation}</p> : null}
      </fieldset>;
    })}
  </div>;
}
