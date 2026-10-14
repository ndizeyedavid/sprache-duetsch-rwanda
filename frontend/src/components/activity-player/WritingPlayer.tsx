import { useRef } from 'react';
import { text,wordCount } from './config-readers';
import type { PlayerProps } from './types';
import { UmlautKeys } from './UmlautKeys';

/** Free writing with a live word count against the optional minimum. */
export function WritingPlayer({ activityId, config, value, onChange, disabled }: PlayerProps) {
  const answer = typeof value === 'string' ? value : '';
  const minWords = Number(config.minWords) || 0;
  const words = wordCount(answer);
  const field = useRef<HTMLTextAreaElement>(null);
  function insert(letter: string) {
    const input = field.current;
    const start = input?.selectionStart ?? answer.length, end = input?.selectionEnd ?? answer.length;
    onChange(`${answer.slice(0, start)}${letter}${answer.slice(end)}`);
    requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + 1, start + 1); });
  }
  const prompt = text(config.prompt);
  return <div className="space-y-2">
    {prompt ? <p className="rounded-box border border-base-300 bg-base-200 p-3 text-sm whitespace-pre-wrap">{prompt}</p> : null}
    <label htmlFor={`writing-${activityId}`} className="block text-sm font-medium">Your answer</label>
    <textarea ref={field} id={`writing-${activityId}`} value={answer} disabled={disabled} rows={7} onChange={event => onChange(event.target.value)}
      placeholder="Write your answer here…" className="textarea w-full rounded-box border-base-300 bg-base-100 text-sm leading-7" aria-describedby={`writing-count-${activityId}`} />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <UmlautKeys disabled={disabled} onInsert={insert} />
      <p id={`writing-count-${activityId}`} className={`text-xs ${minWords && words < minWords ? 'text-warning' : 'text-muted'}`}>
        {words} word{words === 1 ? '' : 's'}{minWords ? ` · minimum ${minWords}` : ''}
      </p>
    </div>
    <p className="text-xs text-muted">Your teacher reviews and grades this.</p>
  </div>;
}
