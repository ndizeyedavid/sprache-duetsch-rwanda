import { useShuffledOptions } from '../../hooks/useShuffledOptions';
import { choiceQuestions } from './config-readers';
import type { PlayerProps } from './types';

/** MCQ (radio) and MULTIPLE_SELECT (checkboxes); responses use the original option index. */
export function ChoicePlayer({ activityId, type, config, value, onChange, disabled }: PlayerProps) {
  const question = choiceQuestions(config)[0] ?? { prompt: '', options: [] };
  const multiple = type === 'MULTIPLE_SELECT';
  const options = useShuffledOptions(question.options, activityId);
  const selected = Array.isArray(value) ? value.map(Number) : [];
  return <fieldset disabled={disabled} className="space-y-2">
    <legend className="mb-3 text-sm font-medium">
      {question.prompt}
      {multiple ? <span className="mt-1 block text-xs font-normal text-muted">Choose every correct answer.</span> : null}
    </legend>
    {options.map(({ value: option, index }, position) => {
      const checked = multiple ? selected.includes(index) : value === index;
      return <label key={index} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-box border px-4 py-3 text-sm transition ${checked ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100 hover:border-primary'}`}>
        <input type={multiple ? 'checkbox' : 'radio'} name={`choice-${activityId}`} checked={checked}
          className={multiple ? 'checkbox checkbox-sm' : 'radio radio-sm'}
          onChange={() => onChange(multiple ? (checked ? selected.filter(item => item !== index) : [...selected, index]) : index)} />
        <span className="text-xs font-bold opacity-70">{String.fromCharCode(65 + position)}</span>
        <span>{option}</span>
      </label>;
    })}
    {!options.length ? <p className="text-xs text-muted">No options configured — contact your teacher.</p> : null}
  </fieldset>;
}
