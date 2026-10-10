import { ExerciseChoices } from './ExerciseChoices';
import type { Item } from './types';
export function ExerciseFields({ items, answers, checked, onChange, group }: {
  group: string; items: Item[]; answers: Record<string, string>; checked: boolean; onChange: (id: string, value: string) => void;
}) {
  return <div className="grid gap-3 sm:grid-cols-2">
    {items.map((item, index) => {
      const answer = answers[item.id] ?? '';
      const correct = item.answer !== undefined && answer.trim().toLocaleLowerCase('de') === item.answer.trim().toLocaleLowerCase('de');
      return <fieldset key={item.id} className={`rounded-box border p-4 ${checked && item.answer ? correct ? 'border-success' : 'border-error' : 'border-base-300'}`}>
        <legend className="max-w-full px-2 text-sm font-semibold"><span className="mr-2 text-muted">{index + 1}.</span>{item.prompt}</legend>
        {item.options ? <ExerciseChoices options={item.options} group={`${group}-${item.id}`} answer={answer} onChange={value => onChange(item.id, value)} /> : <input className="input w-full" aria-label={item.prompt} value={answer} placeholder="Your answer" onChange={e => onChange(item.id, e.target.value)} />}
        {checked && item.answer ? <p role="status" className={`mt-2 text-xs font-medium ${correct ? 'text-success' : 'text-error'}`}>{correct ? '✓ Correct' : `Try again · ${item.answer}`}</p> : null}
      </fieldset>;
    })}
  </div>;
}
