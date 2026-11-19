import { useState } from 'react';
import { FiType } from 'react-icons/fi';
import { SayButton } from '../../audio/SayButton';
import { GermanText } from '../../translate/GermanText';
import type { OrderItem,TranslateItem } from '../../types';
import { TextAnswer } from './TextAnswer';
import type { ItemViewProps } from './types';

/** Build a sentence from word tiles (translate or word order), or switch to the keyboard. */
export function TilesView({ item, answer, setAnswer, verdict, submit }: ItemViewProps<TranslateItem | OrderItem>) {
  const [keyboard, setKeyboard] = useState(false);
  const chosen = answer?.kind === 'tiles' ? answer.value : [];
  const used = answer?.kind === 'tiles' ? answer.picks : [];
  const target = item.kind === 'order' || item.from === 'en' ? 'de' : 'en';
  function add(index: number) {
    if (verdict) return;
    const picks = [...used, index];
    setAnswer({ kind: 'tiles', value: picks.map((pick) => item.tiles[pick]), picks });
  }
  function remove(position: number) {
    if (verdict) return;
    const picks = used.filter((_, at) => at !== position);
    setAnswer(picks.length ? { kind: 'tiles', value: picks.map((pick) => item.tiles[pick]), picks } : null);
  }
  const typed = answer?.kind === 'text' ? answer.value : '';
  return <div className="space-y-5">
    <p className="text-sm font-semibold text-muted">{item.kind === 'order' ? 'Put the words in order' : target === 'en' ? 'Write this in English' : 'Write this in German'}</p>
    {item.kind === 'order'
      ? <p className="text-xl font-bold leading-snug">{item.en}</p>
      : <div className="flex items-start gap-3">
        {item.from === 'de' ? <SayButton text={item.text} audio={item.audio} slow size="md" /> : null}
        <p className="text-xl font-bold leading-snug">{item.from === 'de' ? <GermanText text={item.text} /> : item.text}</p>
      </div>}
    {keyboard
      ? <TextAnswer value={typed} onChange={(value) => setAnswer(value ? { kind: 'text', value } : null)} onEnter={() => submit()} disabled={!!verdict} lang={target} placeholder={target === 'de' ? 'Auf Deutsch …' : 'In English …'} label="Your answer" />
      : <>
        <div className="flex min-h-14 flex-wrap content-start gap-2 border-b-2 border-line pb-3" aria-label="Your answer" lang={target}>
          {chosen.map((word, position) => <button key={`${position}-${word}`} type="button" onClick={() => remove(position)} disabled={!!verdict}
            className="btn h-auto min-h-10 rounded-field border-2 border-line bg-base-100 px-3 py-1.5 text-base font-medium normal-case">{word}</button>)}
        </div>
        <div className="flex flex-wrap justify-center gap-2" lang={target}>
          {item.tiles.map((word, index) => {
            const taken = used.includes(index);
            return <button key={index} type="button" onClick={() => add(index)} disabled={taken || !!verdict}
              className={`btn h-auto min-h-10 rounded-field border-2 px-3 py-1.5 text-base font-medium normal-case ${taken ? 'border-base-200 bg-base-200 text-transparent' : 'border-line bg-base-100 hover:border-primary'}`}>{word}</button>;
          })}
        </div>
      </>}
    {!verdict ? <button type="button" className="btn btn-ghost btn-xs gap-1 text-muted" onClick={() => { setKeyboard(!keyboard); setAnswer(null); }}>
      <FiType aria-hidden />{keyboard ? 'Use word tiles' : 'Use the keyboard'}</button> : null}
  </div>;
}
