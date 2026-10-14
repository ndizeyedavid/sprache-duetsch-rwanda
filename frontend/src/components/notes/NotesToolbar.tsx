import { FiSearch,FiX } from 'react-icons/fi';
import { NOTE_TYPES } from './notes-utils';

type Props = {
  query: string;
  onQuery: (query: string) => void;
  type: string | null;
  onType: (type: string | null) => void;
  /** Types that actually have notes; chips for the rest are hidden. */
  available: Set<string>;
};

/** Search box and type chips above the notes list. */
export function NotesToolbar({ query, onQuery, type, onType, available }: Props) {
  const chips = NOTE_TYPES.filter(item => available.has(item.id));
  return (
    <div className="space-y-3">
      <label className="input w-full rounded-full border-base-300 bg-base-100">
        <FiSearch aria-hidden className="text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.currentTarget.value)}
          placeholder="Search notes, lessons or modules"
          aria-label="Search notes"
          className="grow"
        />
        {query ? (
          <button type="button" onClick={() => onQuery('')} aria-label="Clear search" className="btn btn-ghost btn-xs btn-circle">
            <FiX aria-hidden />
          </button>
        ) : null}
      </label>
      {chips.length > 1 ? (
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={type === null} onClick={() => onType(null)} className={`btn btn-xs rounded-full ${type === null ? 'btn-neutral' : 'border-base-300 bg-base-100'}`}>
            All
          </button>
          {chips.map(item => (
            <button key={item.id} type="button" aria-pressed={type === item.id} onClick={() => onType(type === item.id ? null : item.id)} className={`btn btn-xs rounded-full ${type === item.id ? 'btn-neutral' : 'border-base-300 bg-base-100'}`}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
