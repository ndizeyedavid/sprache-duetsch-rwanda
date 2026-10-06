import type { FormEvent } from 'react';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiGet } from '../../lib/api';
import { humanize,listLevelModules,listLevels } from '../../lib/services';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel,SectionHeader } from '../ui/Panel';
import { SearchField } from '../ui/SearchField';
import { StatusBadge } from '../ui/StatusBadge';
type SearchHit = {
 id: string;
 type: string;
 title: string;
 snippet: string | null;
 levelId: string | null;
};

export function ResourceLibrary() {
 const levels = useApi('admin-levels', listLevels);
 const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
 const [query, setQuery] = useState('');
 const [hits, setHits] = useState<SearchHit[] | null>(null);
 const [searching, setSearching] = useState(false);
 const [searchError, setSearchError] = useState<string | null>(null);

 const modules = useApi(
 `level-modules-${selectedLevelId ?? 'none'}`,
 () => listLevelModules(selectedLevelId ?? ''),
 selectedLevelId !== null,
 );

 async function handleSearch(event: FormEvent) {
 event.preventDefault();
 const needle = query.trim();
 if (needle.length < 2) {
 setSearchError('Type at least 2 characters to search.');
 return;
 }
 setSearching(true);
 setSearchError(null);
 try {
 const results = await apiGet<SearchHit[]>('/content/search', {
 params: { q: needle, pageSize: 30 },
 });
 setHits(results);
 } catch (err) {
 setSearchError(err instanceof Error ? err.message : 'Search failed.');
 } finally {
 setSearching(false);
 }
 }

 return (
 <div className="grid gap-5 lg:grid-cols-2">
 <Panel>
 <SectionHeader title="Content library" />
 <form onSubmit={handleSearch} className="space-y-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Search curriculum</span>
 <div className="flex gap-2">
 <div className="grow">
 <SearchField value={query} onChange={setQuery} ariaLabel="Search content" placeholder="Search modules, lessons, materials…" />
 </div>
 <button type="submit" disabled={searching} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {searching ? <span className="loading loading-spinner loading-sm" /> : 'Search'}
 </button>
 </div>
 </label>
 </form>
 {searchError ? (
 <ErrorBlock message={searchError} />
 ) : hits === null ? (
 <p className="mt-4 text-xs text-muted">Search the whole curriculum — modules, lessons and materials.</p>
 ) : hits.length === 0 ? (
 <div className="mt-4">
 <EmptyBlock title="No results" hint="Try a German word like “Grüße” or a topic like “Verben”." />
 </div>
 ) : (
 <ul className="mt-4 space-y-2">
 {hits.map((hit) => (
 <li key={`${hit.type}-${hit.id}`} className="rounded-field bg-base-200 px-3 py-2">
 <span className="flex items-center justify-between gap-2">
 <span className="truncate text-xs font-semibold">{hit.title}</span>
 <StatusBadge status={humanize(hit.type)} />
 </span>
 {hit.snippet ? (
 <span className="mt-1 line-clamp-2 block text-[11px] text-muted">{hit.snippet}</span>
 ) : null}
 </li>
 ))}
 </ul>
 )}
 </Panel>

 <Panel>
 <SectionHeader title="Modules by level" />
 {levels.loading ? (
 <LoadingBlock label="Loading levels…" />
 ) : levels.error || !levels.data ? (
 <ErrorBlock message={levels.error ?? 'Could not load levels.'} onRetry={levels.refetch} />
 ) : (
 <>
 <div className="flex flex-wrap gap-2">
 {levels.data.map((level) => (
 <button
 key={level.id}
 type="button"
 onClick={() => setSelectedLevelId(level.id)}
 className={`btn btn-sm rounded-full ${
 selectedLevelId === level.id ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'
 }`}
 >
 {level.code}
 </button>
 ))}
 </div>
 <div className="mt-4">
 {!selectedLevelId ? (
 <EmptyBlock title="Pick a level" hint="Choose A1, A2, B1 or B2 to browse its modules." />
 ) : modules.loading ? (
 <LoadingBlock label="Loading modules…" />
 ) : modules.error ? (
 <ErrorBlock message={modules.error} onRetry={modules.refetch} />
 ) : !modules.data || modules.data.length === 0 ? (
 <EmptyBlock title="No modules yet" hint="Create modules from the Courses page." />
 ) : (
 <ul className="space-y-2">
 {modules.data.map((module) => (
 <li key={module.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
 <p className="font-semibold">{module.title}</p>
 <p className="mt-0.5 text-muted">Order {module.order}</p>
 </li>
 ))}
 </ul>
 )}
 </div>
 </>
 )}
 </Panel>
 </div>
 );
}

