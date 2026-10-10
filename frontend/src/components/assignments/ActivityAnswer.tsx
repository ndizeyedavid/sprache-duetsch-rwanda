import { useShuffledOptions } from '../../hooks/useShuffledOptions';
import { MatchingAnswer } from "./MatchingAnswer";
import { OrderingAnswer } from "./OrderingAnswer";
import type { AssignmentDetailData } from './types';

type Props = { activity: NonNullable<AssignmentDetailData['activity']>; answer: string; onAnswer: (value: string) => void; disabled: boolean };

export function ActivityAnswer({ activity, answer, onAnswer, disabled }: Props) {
  const config = (activity.config ?? {}) as Record<string, unknown>;
  const options = useShuffledOptions(Array.isArray(config.options) ? config.options : [], activity.id);
  const parsed = (() => { try { return JSON.parse(answer) as unknown; } catch { return undefined; } })();
  if (activity.type === 'ORDERING') return <OrderingAnswer options={Array.isArray(config.options) ? config.options.map(String) : Array.isArray(config.items) ? config.items.map(String) : []} value={parsed} onChange={v => onAnswer(JSON.stringify(v))} disabled={disabled} id={activity.id} />;
  if (activity.type === 'MATCHING') return <MatchingAnswer options={config.options ?? config} value={parsed} onChange={v => onAnswer(JSON.stringify(v))} disabled={disabled} />;
  if (activity.type === 'MULTIPLE_SELECT') { const selected = Array.isArray(parsed) ? parsed.map(Number) : []; return <fieldset className="space-y-2"><legend className="mb-3 text-xs">Choose all matching answers</legend>{options.map(({ value, index }) => <label key={index} className="flex items-center gap-3 rounded-field border border-base-300 p-4 text-sm"><input type="checkbox" className="checkbox checkbox-sm" disabled={disabled} checked={selected.includes(index)} onChange={e => onAnswer(JSON.stringify(e.target.checked ? [...selected, index] : selected.filter(v => v !== index)))} />{String(value)}</label>)}</fieldset>; }
  if (activity.type === 'MCQ' && Array.isArray(config.options)) return <fieldset className="space-y-2"><legend className="sr-only">Choose your answer</legend>{options.map(({ value: option, index }) => <label key={index} className={`flex cursor-pointer items-center gap-3 rounded-field border p-4 text-sm ${answer === String(index) ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100'}`}><input type="radio" name="activity-answer" checked={answer === String(index)} onChange={() => onAnswer(String(index))} disabled={disabled} className="radio radio-primary radio-sm" />{String(option)}</label>)}</fieldset>;
  if (activity.type === 'TRUE_FALSE') return <div className="grid grid-cols-2 gap-3">{['true', 'false'].map((value) => <button key={value} type="button" disabled={disabled} aria-pressed={answer === value} onClick={() => onAnswer(value)} className={`btn h-16 rounded-field capitalize ${answer === value ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100'}`}>{value}</button>)}</div>;
  return <textarea aria-label="Your answer" value={answer} onChange={(event) => onAnswer(event.target.value)} rows={6} placeholder="Write your answer here…" disabled={disabled} className="textarea w-full rounded-field border-base-300 bg-base-100 text-sm leading-7" />;
}
