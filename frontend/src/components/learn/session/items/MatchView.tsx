import { useState } from 'react';
import { useShuffledOptions } from '../../../../hooks/useShuffledOptions';
import { playClip } from '../../audio/audio-player';
import type { MatchItem } from '../../types';
import type { ItemViewProps } from './types';

type Side = 'de' | 'en';

/** Tap the pairs: a German word, then its meaning. Done when every pair is found. */
export function MatchView({ item, verdict, submit }: ItemViewProps<MatchItem>) {
  const left = useShuffledOptions(item.pairs.map(([de], index) => ({ text: de, index })), `${item.id}:de`);
  const right = useShuffledOptions(item.pairs.map(([, en], index) => ({ text: en, index })), `${item.id}:en`);
  const [picked, setPicked] = useState<{ side: Side; index: number } | null>(null);
  const [found, setFound] = useState<Set<number>>(() => new Set());
  const [wrong, setWrong] = useState<{ de: number; en: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);

  function tap(side: Side, index: number) {
    if (verdict || found.has(index)) return;
    const url = item.pairAudio[index];
    if (side === 'de' && url) void playClip({ url, text: item.pairs[index][0] });
    if (!picked || picked.side === side) { setPicked({ side, index }); return; }
    const pair = side === 'de' ? { de: index, en: picked.index } : { de: picked.index, en: index };
    setPicked(null);
    if (pair.de === pair.en) {
      const next = new Set(found).add(pair.de);
      setFound(next);
      if (next.size === item.pairs.length) submit({ kind: 'matched', mistakes });
    } else {
      setMistakes((count) => count + 1);
      setWrong(pair);
      setTimeout(() => setWrong(null), 600);
    }
  }
  const tone = (side: Side, index: number) => found.has(index) ? 'border-ok bg-ok-soft text-ok'
    : wrong && wrong[side] === index ? 'border-bad bg-bad-soft text-bad'
      : picked?.side === side && picked.index === index ? 'border-primary bg-brand-soft' : 'border-line bg-base-100 hover:border-primary';
  const column = (side: Side, entries: { value: { text: string; index: number } }[]) => <div className="grid gap-2">
    {entries.map(({ value }) => <button key={value.index} type="button" disabled={found.has(value.index) || !!verdict} onClick={() => tap(side, value.index)} lang={side}
      className={`min-h-12 rounded-box border-2 px-3 py-2 text-center text-base font-medium transition-colors ${tone(side, value.index)}`}>{value.text}</button>)}
  </div>;
  return <div className="space-y-5">
    <p className="text-sm font-semibold text-muted">Tap the matching pairs</p>
    <div className="grid grid-cols-2 gap-3">{column('de', left)}{column('en', right)}</div>
    {mistakes ? <p className="text-xs text-muted">{mistakes} wrong {mistakes === 1 ? 'try' : 'tries'}</p> : null}
  </div>;
}
