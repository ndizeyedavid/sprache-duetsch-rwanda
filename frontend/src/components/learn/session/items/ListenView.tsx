import { useEffect } from 'react';
import { useShuffledOptions } from '../../../../hooks/useShuffledOptions';
import { playClip } from '../../audio/audio-player';
import { SayButton } from '../../audio/SayButton';
import { GermanText } from '../../translate/GermanText';
import type { ListenItem } from '../../types';
import { OptionButton } from './OptionButton';
import { TextAnswer } from './TextAnswer';
import type { ItemViewProps } from './types';

/** Hear a sentence (it plays once by itself), then pick it or type it. */
export function ListenView({ item, answer, setAnswer, verdict, submit }: ItemViewProps<ListenItem>) {
  const options = useShuffledOptions(item.options ?? [], item.id);
  useEffect(() => { void playClip({ url: item.audio, text: item.text }); }, [item.audio, item.text]);
  const given = answer && (answer.kind === 'option' || answer.kind === 'text') ? answer.value : '';
  return <div className="space-y-5">
    <p className="text-sm font-semibold text-muted">{item.mode === 'type' ? 'Type what you hear' : 'What do you hear?'}</p>
    <div className="flex items-center justify-center gap-3 py-2"><SayButton text={item.text} audio={item.audio} slow size="lg" label="Play again" /></div>
    {verdict ? <p className="text-center text-lg font-semibold"><GermanText text={item.text} /><span className="mt-1 block text-sm font-normal text-muted">{item.en}</span></p> : null}
    {item.mode === 'choose'
      ? <div className="grid gap-2">{options.map(({ value }, index) => <OptionButton key={value} label={value} index={index} lang="de" selected={given === value} disabled={!!verdict}
        state={!verdict ? 'idle' : value === item.text ? 'right' : value === given ? 'wrong' : 'idle'} onClick={() => setAnswer({ kind: 'option', value })} />)}</div>
      : <TextAnswer value={given} onChange={(value) => setAnswer(value ? { kind: 'text', value } : null)} onEnter={() => submit()} disabled={!!verdict} lang="de" placeholder="Schreiben Sie, was Sie hören …" label="What you hear" />}
  </div>;
}
