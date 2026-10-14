import { useRef } from 'react';
import { blankSentences } from './config-readers';
import type { PlayerProps } from './types';
import { UmlautKeys } from './UmlautKeys';

const BLANK = /_{2,}/;

/** One input per sentence, placed where the sentence shows `___`; the response is a string per sentence. */
export function FillBlankPlayer({ activityId, config, value, onChange, disabled }: PlayerProps) {
  const sentences = blankSentences(config);
  const answers = sentences.map((_, index) => (Array.isArray(value) ? String(value[index] ?? '') : ''));
  const focused = useRef(0);
  const set = (index: number, next: string) => onChange(answers.map((answer, i) => (i === index ? next : answer)));
  return <div className="space-y-3">
    <p className="text-sm font-medium">Fill in the blank{sentences.length > 1 ? 's' : ''}</p>
    <ol className="space-y-2">
      {sentences.map((sentence, index) => {
        const [before, ...rest] = sentence.split(BLANK);
        const input = <input id={`blank-${activityId}-${index}`} value={answers[index]} disabled={disabled} aria-label={`Blank ${index + 1}`}
          autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="…"
          onFocus={() => { focused.current = index; }} onChange={event => set(index, event.target.value)}
          className="input input-sm mx-1 inline-flex w-36 max-w-full rounded-field border-base-300 bg-base-100 align-middle text-sm" />;
        return <li key={index} className="rounded-box border border-base-300 bg-base-100 p-3 text-sm leading-9">
          {sentences.length > 1 ? <span className="mr-2 text-xs text-muted">{index + 1}.</span> : null}
          {rest.length ? <>{before}{input}{rest.join('___')}</> : <>{sentence || 'Complete the sentence:'} {input}</>}
        </li>;
      })}
    </ol>
    <UmlautKeys disabled={disabled} onInsert={letter => set(focused.current, `${answers[focused.current] ?? ''}${letter}`)} />
    <p className="text-xs text-muted">Spelling matters. Capital letters do not.</p>
  </div>;
}
