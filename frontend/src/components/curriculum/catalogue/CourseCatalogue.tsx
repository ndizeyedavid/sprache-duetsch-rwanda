import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { getLevelsOverview } from '../../../lib/levels-overview';
import type { LevelItem } from '../../../lib/services';
import { SearchField } from '../../ui/SearchField';
import { LevelCourseCard } from './LevelCourseCard';

type Filter = 'all' | 'live' | 'hidden';
type Props = { levels: LevelItem[]; onOpen: (level: LevelItem) => void };

const pill = (active: boolean) => `btn btn-xs h-8 rounded-full px-3 ${active ? 'btn-primary' : 'border-line bg-base-100'}`;

/** Every level as a course card, like the student catalogue but with the numbers staff need. */
export function CourseCatalogue({ levels, onOpen }: Props) {
  const overview = useApi('levels-overview', getLevelsOverview);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const needle = query.trim().toLowerCase();
  const visible = [...levels].sort((a, b) => a.order - b.order)
    .filter((level) => filter === 'all' || (filter === 'live') === level.isActive)
    .filter((level) => !needle || `${level.code} ${level.title} ${level.levelLabel}`.toLowerCase().includes(needle));
  const hidden = levels.filter((level) => !level.isActive).length;
  return (
    <section aria-label="Courses" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter courses">
          <button type="button" className={pill(filter === 'all')} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All {levels.length}</button>
          <button type="button" className={pill(filter === 'live')} aria-pressed={filter === 'live'} onClick={() => setFilter('live')}>Open to students {levels.length - hidden}</button>
          {hidden ? <button type="button" className={pill(filter === 'hidden')} aria-pressed={filter === 'hidden'} onClick={() => setFilter('hidden')}>Hidden {hidden}</button> : null}
        </div>
        <SearchField value={query} onChange={setQuery} ariaLabel="Find a course" placeholder="Find a course…" className="w-full border border-line sm:w-72" />
      </div>
      {overview.error ? <p role="alert" className="text-xs text-error">Course numbers could not load: {overview.error}</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((level) => (
          <LevelCourseCard key={level.id} level={level} stats={overview.data?.find((row) => row.levelId === level.id)} onOpen={() => onOpen(level)} />
        ))}
      </div>
      {!visible.length ? <p className="rounded-box border border-line bg-base-100 p-6 text-center text-sm text-muted">No course matches.</p> : null}
    </section>
  );
}
