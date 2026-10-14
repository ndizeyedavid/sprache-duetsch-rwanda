import { useState } from 'react';
import { FiArrowLeft,FiArrowRight,FiRotateCw } from 'react-icons/fi';
import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';
import { flashcards } from './config-readers';
import type { PlayerProps } from './types';

/** Flip-card self study: once every card has been turned, the activity can be marked done. */
export function FlashcardPlayer({ config, onChange, disabled }: PlayerProps) {
  const cards = flashcards(config);
  const [index, setIndex] = useState(0), [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const card = cards[index];
  if (!card) return <p className="text-xs text-muted">No cards yet — contact your teacher.</p>;
  function flip() {
    setFlipped(value => !value);
    if (seen.has(index)) return;
    const next = new Set(seen).add(index);
    setSeen(next);
    if (next.size === cards.length) onChange({ reviewed: next.size, total: cards.length });
  }
  const go = (offset: number) => { setIndex((index + offset + cards.length) % cards.length); setFlipped(false); };
  return <div className="space-y-3">
    <div className="flex items-center justify-between text-xs text-muted">
      <span>Card {index + 1} of {cards.length}</span><span>{seen.size}/{cards.length} turned</span>
    </div>
    <progress className="progress progress-primary w-full" value={seen.size} max={cards.length} aria-label="Cards turned" />
    <button type="button" disabled={disabled} onClick={flip} aria-label={flipped ? 'Show the front' : 'Turn the card'}
      className={`flex min-h-48 w-full flex-col items-center justify-center gap-2 rounded-box border-2 p-6 text-center transition ${flipped ? 'border-primary bg-base-200' : 'border-base-300 bg-base-100'}`}>
      <span className="text-xl font-bold" aria-live="polite">{flipped ? card.back : card.front}</span>
      {flipped && card.example ? <span className="text-sm italic text-muted">{card.example}</span> : null}
      <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted"><FiRotateCw aria-hidden />{flipped ? 'Tap to see the word' : 'Tap to see the meaning'}</span>
    </button>
    {flipped && card.audioUrl ? <AuthenticatedMedia key={card.audioUrl} url={card.audioUrl} kind="audio" title="pronunciation" className="w-full" /> : null}
    <div className="flex justify-between gap-2">
      <button type="button" className="btn btn-sm rounded-full" disabled={disabled || cards.length < 2} onClick={() => go(-1)}><FiArrowLeft aria-hidden />Previous</button>
      <button type="button" className="btn btn-sm rounded-full" disabled={disabled || cards.length < 2} onClick={() => go(1)}>Next<FiArrowRight aria-hidden /></button>
    </div>
    {seen.size < cards.length ? <p className="text-xs text-muted">Turn every card to finish this set.</p> : <p role="status" className="text-xs font-semibold text-success">All cards reviewed — mark the set as done.</p>}
  </div>;
}
