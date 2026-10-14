import { FiPlus } from 'react-icons/fi';
import type { EditorProps } from './editor-config';
import { moveItem,rows,str } from './editor-config';
import { MediaUrlField } from './MediaUrlField';
import { RowButtons } from './RowButtons';

type Card = { front: string; back: string; example: string; audioUrl: string };

/** VOCABULARY / FLASHCARD sets: completion-based self study. */
export function CardsEditor({ config, onChange }: EditorProps) {
  const cards: Card[] = rows(config.cards).map(card => ({ front: str(card.front), back: str(card.back), example: str(card.example), audioUrl: str(card.audioUrl) }));
  const set = (next: Card[]) => onChange({ ...config, cards: next });
  const edit = (i: number, patch: Partial<Card>) => set(cards.map((card, n) => n === i ? { ...card, ...patch } : card));
  return <div className="space-y-3">
    <p className="text-xs text-muted">Students flip each card; the set counts as done once every card is turned.</p>
    {cards.map((card, i) => <fieldset key={i} className="space-y-2 rounded-box bg-base-200 p-3">
      <div className="flex items-center justify-between"><legend className="text-xs font-medium">Card {i + 1}</legend>
        <RowButtons label={`card ${i + 1}`} index={i} count={cards.length} onMove={to => set(moveItem(cards, i, to))} onRemove={() => set(cards.filter((_, n) => n !== i))} /></div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input required className="input input-sm w-full" aria-label={`Card ${i + 1} front`} placeholder="Front · der Hund" value={card.front} onChange={event => edit(i, { front: event.target.value })} />
        <input required className="input input-sm w-full" aria-label={`Card ${i + 1} back`} placeholder="Back · the dog" value={card.back} onChange={event => edit(i, { back: event.target.value })} />
      </div>
      <input className="input input-sm w-full" aria-label={`Card ${i + 1} example`} placeholder="Example sentence (optional)" value={card.example} onChange={event => edit(i, { example: event.target.value })} />
      <details><summary className="cursor-pointer text-xs text-muted">Pronunciation audio</summary>
        <div className="mt-2"><MediaUrlField label="Audio" value={card.audioUrl} onChange={audioUrl => edit(i, { audioUrl })} /></div></details>
    </fieldset>)}
    <button type="button" className="btn btn-sm btn-ghost" onClick={() => set([...cards, { front: '', back: '', example: '', audioUrl: '' }])}><FiPlus aria-hidden />Add card</button>
  </div>;
}
