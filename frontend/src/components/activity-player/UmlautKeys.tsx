const KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

/** German letters for phones and keyboards without them; keeps focus on the answer field. */
export function UmlautKeys({ onInsert, disabled }: { onInsert: (letter: string) => void; disabled?: boolean }) {
  return <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Insert German letters">
    {KEYS.map(letter => <button key={letter} type="button" disabled={disabled} className="btn btn-xs min-w-8 rounded-field border-base-300 bg-base-100 font-semibold"
      onMouseDown={event => event.preventDefault()} onClick={() => onInsert(letter)} aria-label={`Insert ${letter}`}>{letter}</button>)}
  </div>;
}
