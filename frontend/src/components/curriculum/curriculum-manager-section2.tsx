import {
FiChevronDown,
FiChevronUp,
FiEye,
FiEyeOff,
FiMove
} from 'react-icons/fi';
export function CurriculumManagerSection2(props: { reordering: boolean; isPublishing: boolean; setDragId: import("react").Dispatch<import("react").SetStateAction<string | null>>; mod: import("../../lib/services").ModuleItem; setDragOverId: import("react").Dispatch<import("react").SetStateAction<string | null>>; collapsed: Record<string, boolean>; toggleCollapsed: (id: string) => void; searchParams: URLSearchParams; expandedLessonId: string | null; setSearchParams: import("../../../node_modules/react-router-dom/dist/index").SetURLSearchParams; selectedLevelId: string | null; isCollapsed: boolean; lessons: import("../../lib/services").ModuleLesson[]; publishedCount: number; handlePublishToggle: (mod: { id: string; isPublished?: boolean; }) => Promise<void> }) {
const { reordering, isPublishing, setDragId, mod, setDragOverId, collapsed, toggleCollapsed, searchParams, expandedLessonId, setSearchParams, selectedLevelId, isCollapsed, lessons, publishedCount, handlePublishToggle } = props;
return (<div className="flex items-center gap-3 bg-base-200 px-4 py-3">
  <span
  draggable={!reordering && !isPublishing}
  onDragStart={(e) => {
  if (reordering || isPublishing) { e.preventDefault(); return; }
  e.stopPropagation();
  setDragId(mod.id);
  }}
  onDragEnd={() => {
  setDragId(null);
  setDragOverId(null);
  }}
  className={`flex size-7 shrink-0 items-center justify-center rounded text-muted ${reordering ? 'cursor-not-allowed opacity-40' : 'cursor-grab hover:bg-base-300 active:cursor-grabbing'}`}
  aria-label="Drag to reorder module"
  title={reordering ? 'Saving…' : 'Drag to reorder module'}
  >
  {reordering ? <span className="loading loading-spinner loading-xs" /> : <FiMove aria-hidden />}
  </span>
 <button
 type="button"
 onClick={() => {
 const willCollapse = !collapsed[mod.id];
 toggleCollapsed(mod.id);
 // Reflect active module in URL (?module=) like Canvas does
 const next = new URLSearchParams(searchParams);
 if (willCollapse) {
 // collapsing — if this was the active module, clear it unless a lesson inside is active
 if (searchParams.get('module') === mod.id && !expandedLessonId) {
 next.delete('module');
 setSearchParams(next);
 }
 } else {
 next.set('module', mod.id);
 if (selectedLevelId) next.set('level', selectedLevelId);
 setSearchParams(next);
 }
 }}
 className="btn btn-ghost btn-xs btn-circle"
 aria-label={isCollapsed ? 'Expand module' : 'Collapse module'}
 aria-expanded={!isCollapsed}
 disabled={reordering}
 >
 {isCollapsed ? <FiChevronDown aria-hidden /> : <FiChevronUp aria-hidden />}
 </button>
 <div className="min-w-0 grow">
 <h3 className="truncate text-sm font-semibold leading-tight">{mod.title}</h3>
 <p className="truncate text-[11px] text-muted">
 Order {mod.order} · {lessons.length} lesson{lessons.length === 1 ? '' : 's'} · {publishedCount} published
 {mod.description ? ` · ${mod.description}` : ''}
 </p>
 </div>
 <label className="hidden shrink-0 cursor-pointer items-center gap-2 text-xs font-medium sm:flex">
 <input
 type="checkbox"
 className="checkbox checkbox-xs"
 checked={Boolean(mod.isPublished ?? true)}
 onChange={() => void handlePublishToggle(mod as { id: string; isPublished?: boolean })}
 disabled={isPublishing || reordering}
 aria-label={`Publish ${mod.title}`}
 />
 <span className="inline-flex items-center gap-1">
 {isPublishing ? (
 <span className="loading loading-spinner loading-xs text-brand" />
 ) : (mod.isPublished ?? true) ? (
 <FiEye aria-hidden className="text-brand" />
 ) : (
 <FiEyeOff aria-hidden className="text-muted" />
 )}
 {(mod.isPublished ?? true) ? 'Published' : 'Unpublished'}
 </span>
 </label>
 <label className="flex shrink-0 cursor-pointer items-center gap-1 sm:hidden" title={(mod.isPublished ?? true) ? 'Published' : 'Unpublished'}>
 <input
 type="checkbox"
 className="checkbox checkbox-xs"
 checked={Boolean(mod.isPublished ?? true)}
 onChange={() => void handlePublishToggle(mod as { id: string; isPublished?: boolean })}
 disabled={isPublishing || reordering}
 aria-label={`Publish ${mod.title}`}
 />
 {isPublishing ? <span className="loading loading-spinner loading-xs text-brand" /> : null}
 </label>
 </div>);
}
