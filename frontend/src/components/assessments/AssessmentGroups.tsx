import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { useApi } from '../../hooks/useApi';
import { deleteAssessment, listAssessments, updateAssessment, money } from '../../lib/services';
import { apiErrorMessage } from '../../lib/api';
import { ASSESSMENT_TYPES } from './constants';
import { groupAssessments } from './utils';
import { AssessmentCard } from './AssessmentCard';
import { AssessmentEditorModal } from './AssessmentEditorModal';

type Level = { id: string; code: string; title: string };
type Props = { levels: Level[]; selectedLevelId: string | null };

export function AssessmentGroups({ levels, selectedLevelId }: Props) {
 const assessments = useApi('assessments-list', listAssessments);
 const [search, setSearch] = useState('');
 const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
 const [editorOpen, setEditorOpen] = useState(false);
 const [editing, setEditing] = useState<{ id: string } | null>(null);
 const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());
 const [error, setError] = useState<string | null>(null);

 const rows = useMemo(() => {
 const all = assessments.data ?? [];
 let list = selectedLevelId ? all.filter((a) => a.levelId === selectedLevelId) : all;
 if (search.trim()) {
 const q = search.trim().toLowerCase();
 list = list.filter((a) => a.title.toLowerCase().includes(q));
 }
 return list;
 }, [assessments.data, selectedLevelId, search]);

 const groups = groupAssessments(rows);
 const levelCode = (id: string) => levels.find((l) => l.id === id)?.code ?? '—';

 async function togglePublish(row: { id: string; isPublished: boolean }) {
 const next = !row.isPublished;
 setPublishingIds((prev) => new Set(prev).add(row.id));
 setError(null);
 try {
 await updateAssessment(row.id, { isPublished: next });
 assessments.refetch();
 } catch (err) {
 setError(apiErrorMessage(err, 'Could not update.'));
 } finally {
 setPublishingIds((prev) => {
 const n = new Set(prev);
 n.delete(row.id);
 return n;
 });
 }
 }

 async function handleDelete(id: string, title: string) {
 if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
 setError(null);
 try {
 await deleteAssessment(id);
 assessments.refetch();
 } catch (err) {
 setError(apiErrorMessage(err, 'Could not delete.'));
 }
 }

 return (
 <>
 <div className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="border-b border-line bg-base-200/40 px-4 py-3">
 <div className="flex flex-wrap items-center gap-2">
 <div className="relative grow sm:max-w-sm">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input value={search} onChange={(e) => setSearch(e.currentTarget.value)} placeholder="Search assessments…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-9" />
 {search ? <button type="button" onClick={() => setSearch('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
 </div>
 <button type="button" onClick={() => { setEditing(null); setEditorOpen(true); }} className="btn btn-sm ml-auto gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90"><FiPlus aria-hidden />New assessment</button>
 </div>
 <p className="mt-2 text-[11px] text-muted">{rows.length} assessment{rows.length === 1 ? '' : 's'} · {rows.filter((r) => r.isPublished).length} published · {rows.filter((r) => !r.isPublished).length} draft</p>
 {error ? <p role="alert" className="mt-2 text-xs font-medium text-error">{error}</p> : null}
 </div>

 {assessments.loading ? <div className="p-4"><LoadingBlock label="Loading assessments…" /></div> : assessments.error ? <div className="p-4"><ErrorBlock message={assessments.error} onRetry={assessments.refetch} /></div> : rows.length === 0 ? <div className="p-4"><EmptyBlock title="No assessments yet" hint="Create a quiz or exam for this level." /></div> : (
 <div className="divide-y divide-line">
 {ASSESSMENT_TYPES.map((group) => {
 const items = groups[group.value] ?? [];
 if (items.length === 0) return null;
 const isCollapsed = collapsed[group.value] ?? false;
 const publishedCount = items.filter((i) => i.isPublished).length;
 return (
 <div key={group.value} className="bg-base-100">
 <button type="button" onClick={() => setCollapsed((prev) => ({ ...prev, [group.value]: !prev[group.value] }))} className="flex w-full items-center gap-3 bg-base-200 px-4 py-3 text-left">
 <span className="btn btn-ghost btn-xs btn-circle shrink-0">{isCollapsed ? <FiChevronDown aria-hidden /> : <FiChevronUp aria-hidden />}</span>
 <span className="min-w-0 grow">
 <span className="block text-sm font-bold leading-tight">{group.label}</span>
 <span className="block text-[11px] text-muted">{items.length} · {publishedCount} published · {money(items.reduce((acc, a) => acc + Number(money(a.passMark as string)), 0))} avg pass</span>
 </span>
 <span className="rounded-full bg-base-100 px-2.5 py-1 text-xs font-medium">{items.length}</span>
 </button>
 {!isCollapsed ? (
 <ul className="divide-y divide-line">
 {items.map((row) => (
 <li key={row.id}>
 <AssessmentCard assessment={row as never} levelCode={levelCode(row.levelId)} onEdit={() => { setEditing({ id: row.id }); setEditorOpen(true); }} onDelete={() => void handleDelete(row.id, row.title)} onTogglePublish={() => void togglePublish(row)} publishing={publishingIds.has(row.id)} />
 </li>
 ))}
 </ul>
 ) : null}
 </div>
 );
 })}
 </div>
 )}
 </div>

 <AssessmentEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} levels={levels} initialLevelId={selectedLevelId ?? levels[0]?.id ?? ''} editing={editing} onSaved={() => assessments.refetch()} />
 </>
 );
}
