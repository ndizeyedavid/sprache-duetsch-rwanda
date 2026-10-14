import { text } from './config-readers';
import type { PlayerProps } from './types';

export function TrueFalsePlayer({ activityId, config, value, onChange, disabled }: PlayerProps) {
  return <fieldset disabled={disabled}>
    <legend className="text-sm font-medium">True or false?</legend>
    <p className="mt-2 rounded-box border border-base-300 bg-base-100 p-4 text-sm font-medium">{text(config.statement ?? config.sentence ?? config.prompt)}</p>
    <div className="mt-3 grid grid-cols-2 gap-3">
      {[true, false].map(option => <label key={String(option)} className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-box border p-4 text-sm font-semibold transition ${value === option ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100 hover:border-primary'}`}>
        <input type="radio" className="radio radio-sm" name={`tf-${activityId}`} checked={value === option} onChange={() => onChange(option)} />
        {option ? 'True' : 'False'}
      </label>)}
    </div>
  </fieldset>;
}
