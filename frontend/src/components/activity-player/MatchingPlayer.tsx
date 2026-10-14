import { useShuffledOptions } from '../../hooks/useShuffledOptions';
import { matchingSides } from './config-readers';
import type { PlayerProps } from './types';

/** Choose the matching meaning for each word; the response lists the chosen right side per left item. */
export function MatchingPlayer({ activityId, config, value, onChange, disabled }: PlayerProps) {
  const { left, right } = matchingSides(config);
  const choices = useShuffledOptions(right, activityId);
  const answers = left.map((_, index) => (Array.isArray(value) ? String(value[index] ?? '') : ''));
  return <fieldset disabled={disabled} className="space-y-2">
    <legend className="mb-2 text-sm font-medium">Match each item</legend>
    {left.map((item, index) => <label key={index} className="grid items-center gap-2 rounded-box border border-base-300 bg-base-100 p-3 sm:grid-cols-2">
      <span className="text-sm font-medium">{item}</span>
      <select className="select select-sm w-full" aria-label={`Match for ${item}`} value={answers[index]}
        onChange={event => onChange(answers.map((answer, i) => (i === index ? event.target.value : answer)))}>
        <option value="">Choose a match</option>
        {choices.map(({ value: choice, index: key }) => <option key={key} value={choice}>{choice}{answers.includes(choice) && answers[index] !== choice ? ' (used)' : ''}</option>)}
      </select>
    </label>)}
    {!left.length ? <p className="text-xs text-muted">No pairs configured — contact your teacher.</p> : null}
  </fieldset>;
}
