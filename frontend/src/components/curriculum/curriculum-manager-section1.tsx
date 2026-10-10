import {
FiChevronDown,
FiMove,
FiPlus
} from 'react-icons/fi';
import {
createLesson,
humanize
} from '../../lib/services';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { StatusBadge } from '../ui/StatusBadge';
import { contentIcon } from './content-icon';
import { CONTENT_TYPES } from './content-types';
import { LessonEditor } from './lesson-editor';
export function CurriculumManagerSection1(props: { lessons: import("../../lib/services").ModuleLesson[]; expandedLessonId: string | null; lessonDrag: { moduleId: string; lessonId: string; } | null; mod: import("../../lib/services").ModuleItem; lessonDragOver: { moduleId: string; lessonId: string; } | null; lessonReorderingIds: Set<string>; setLessonDragOver: import("react").Dispatch<import("react").SetStateAction<{ moduleId: string; lessonId: string; } | null>>; handleLessonDrop: (targetModuleId: string, targetLessonId: string) => Promise<void>; setLessonDrag: import("react").Dispatch<import("react").SetStateAction<{ moduleId: string; lessonId: string; } | null>>; toggleLesson: (id: string) => void; lessonLoadingIds: Set<string>; lessonErrors: Record<string, string>; lessonCache: Record<string, import("../../lib/services").AuthoredLesson>; ensureLessonLoaded: (id: string, force?: boolean) => Promise<void>; busy: boolean; run: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; fieldErrors: Record<string, string>; setFieldErrors: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; refreshCachedLesson: (id: string) => void; searchParams: URLSearchParams; setSearchParams: import("../../../node_modules/react-router-dom/dist/index").SetURLSearchParams; setLessonCache: import("react").Dispatch<import("react").SetStateAction<Record<string, import("../../lib/services").AuthoredLesson>>>; modules: import("../../hooks/useApi").ApiState<import("../../lib/services").ModuleItem[]>; materialForm: { title: string; type: string; url: string; }; setMaterialForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; url: string; }>>; activityForm: { title: string; type: string; instructions: string; }; setActivityForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; instructions: string; }>>; lessonForms: Record<string, string>; lessonTypeForms: Record<string, string>; setLessonForms: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; setLessonTypeForms: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>> }) {
const { lessons, expandedLessonId, lessonDrag, mod, lessonDragOver, lessonReorderingIds, setLessonDragOver, handleLessonDrop, setLessonDrag, toggleLesson, lessonLoadingIds, lessonErrors, lessonCache, ensureLessonLoaded, busy, run, fieldErrors, setFieldErrors, refreshCachedLesson, searchParams, setSearchParams, setLessonCache, modules, materialForm, setMaterialForm, activityForm, setActivityForm, lessonForms, lessonTypeForms, setLessonForms, setLessonTypeForms } = props;
return (<div className="divide-y divide-line">
 {lessons.length === 0 ? (
 <p className="px-4 py-6 text-center text-xs text-muted">No lessons in this module yet. Add one below.</p>
 ) : (
  lessons.map((item) => {
  const Icon = contentIcon(item.contentType);
  const isExpanded = expandedLessonId === item.id;
  const isLessonDragging = lessonDrag?.lessonId === item.id && lessonDrag?.moduleId === mod.id;
  const isLessonDragOver = lessonDragOver?.lessonId === item.id && lessonDragOver?.moduleId === mod.id && !isLessonDragging;
  const isLessonReordering = lessonReorderingIds.has(mod.id);
  return (
  <div
  key={item.id}
  draggable={false}
  onDragOver={(e) => {
  e.preventDefault();
  e.stopPropagation();
  if (lessonDrag && lessonDrag.moduleId === mod.id && lessonDrag.lessonId !== item.id) {
  setLessonDragOver({ moduleId: mod.id, lessonId: item.id });
  }
  }}
  onDragLeave={() => setLessonDragOver((prev) => (prev?.lessonId === item.id && prev?.moduleId === mod.id ? null : prev))}
  onDrop={(e) => {
  e.preventDefault();
  e.stopPropagation();
  void handleLessonDrop(mod.id, item.id);
  }}
  className={`bg-base-100 transition ${isLessonDragging ? 'opacity-50' : ''} ${isLessonDragOver ? 'ring-1 ring-inset ring-brand' : ''} ${isLessonReordering ? 'pointer-events-none opacity-60' : ''}`}
  >
  <div className="flex w-full items-center gap-2 border-l-4 pl-1 pr-2 py-0 text-left transition-colors hover:bg-base-200/60 data-[expanded=true]:bg-brand-tint data-[expanded=true]:border-brand" data-expanded={isExpanded}>
  {/* Lesson drag handle — independent from module drag */}
  <span
  draggable={!isLessonReordering}
  onDragStart={(e) => {
  e.stopPropagation();
  setLessonDrag({ moduleId: mod.id, lessonId: item.id });
  }}
  onDragEnd={() => { setLessonDrag(null); setLessonDragOver(null); }}
  className={`flex size-6 shrink-0 items-center justify-center rounded text-muted ${isLessonReordering ? 'cursor-not-allowed opacity-40' : 'cursor-grab hover:bg-base-300 active:cursor-grabbing'}`}
  aria-label="Drag to reorder lesson"
  title={isLessonReordering ? 'Saving…' : 'Drag to reorder lesson'}
  >
  {isLessonReordering && isLessonDragging ? <span className="loading loading-spinner loading-xs" /> : <FiMove aria-hidden className="text-xs" />}
  </span>
  <button
  type="button"
  onClick={() => toggleLesson(item.id)}
  className="flex min-w-0 grow items-center gap-3 py-3 text-left"
  >
  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isExpanded ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>
  <Icon aria-hidden className="text-sm" />
  </span>
  <span className="min-w-0 grow">
  <span className="block truncate text-sm font-medium leading-tight">{item.title}</span>
  <span className="block truncate text-[11px] text-muted">
  {humanize(item.contentType)} · Order {item.order}
  {item.estimatedMinutes ? ` · ${item.estimatedMinutes} min` : ''}
  </span>
  </span>
  <StatusBadge status={item.isPublished ? 'Active' : 'Pending'} />
  {isExpanded && lessonLoadingIds.has(item.id) ? (
  <span className="loading loading-spinner loading-xs text-brand" />
  ) : null}
  <FiChevronDown className={`shrink-0 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden />
  </button>
  </div>

 {isExpanded ? (
 <div className="border-t border-line bg-base-200/30 px-4 py-4">
 {lessonLoadingIds.has(item.id) ? (
 <LoadingBlock label="Loading lesson…" />
 ) : lessonErrors[item.id] || !lessonCache[item.id] ? (
 <ErrorBlock message={lessonErrors[item.id] ?? 'Could not load this lesson.'} onRetry={() => void ensureLessonLoaded(item.id)} />
 ) : (
  <LessonEditor
  lessonId={item.id}
  data={lessonCache[item.id]}
  busy={busy}
  onRun={run}
  fieldErrors={fieldErrors}
  onFieldErrorsChange={setFieldErrors}
  onSaved={() => refreshCachedLesson(item.id)}
  onDeleted={() => {
  const next = new URLSearchParams(searchParams);
  next.delete('lesson');
  setSearchParams(next, { replace: true });
  setLessonCache((prev) => {
  const next = { ...prev };
  delete next[item.id];
  return next;
  });
  modules.refetch();
  }}
  materialForm={materialForm}
  setMaterialForm={setMaterialForm}
  activityForm={activityForm}
  setActivityForm={setActivityForm}
  />
 )}
 </div>
 ) : null}
 </div>
 );
 })
 )}

 <div className="bg-base-200/30 px-4 py-3">
 <p className="mb-2 text-xs font-semibold">Add a lesson to this module</p>
 <form
 onSubmit={(e) => {
 e.preventDefault();
 const title = (lessonForms[mod.id] ?? '').trim();
 const type = lessonTypeForms[mod.id] ?? 'TEXT';
 if (!title) return;
 void run(
 () =>
 createLesson(mod.id, {
 title,
 order: lessons.length,
 contentType: type,
 isPublished: true,
 }),
 'Could not create the lesson.',
 () => {
 setLessonForms((prev) => ({ ...prev, [mod.id]: '' }));
 modules.refetch();
 },
 );
 }}
 className="flex flex-wrap items-end gap-2"
 >
 <label className="block grow">
 <span className="mb-1 block text-[11px] font-medium">Lesson title</span>
 <input
 required
 value={lessonForms[mod.id] ?? ''}
 onChange={(e) => { const v = e.currentTarget.value; setLessonForms((prev) => ({ ...prev, [mod.id]: v })); }}
 placeholder="e.g. Greetings & Introductions"
 className="input input w-full rounded-full border-line bg-base-100"
 />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Content type</span>
 <select
 value={lessonTypeForms[mod.id] ?? 'TEXT'}
 onChange={(e) => { const v = e.currentTarget.value; setLessonTypeForms((prev) => ({ ...prev, [mod.id]: v })); }}
 className="select select rounded-full border-line bg-base-100"
 >
 {CONTENT_TYPES.map((t) => (
 <option key={t} value={t}>
 {humanize(t)}
 </option>
 ))}
 </select>
 </label>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add lesson
  </button>
  </form>
  </div>
  </div>);
}
