import type { LevelItem } from '../../lib/services';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel } from '../ui/Panel';
import { CurriculumManagerSection1 } from './curriculum-manager-section1';
import { CurriculumManagerSection2 } from './curriculum-manager-section2';
import { CurriculumManagerSection3 } from './curriculum-manager-section3';
import { CurriculumManagerSection4 } from './curriculum-manager-section4';
import { LevelPicker } from './LevelPicker';
export function CurriculumManagerSection101(props: { levels: LevelItem[]; selectedLevel: LevelItem | null; selectLevel: (levelId: string | null) => void; modules: import("../../hooks/useApi").ApiState<import("../../lib/services").ModuleItem[]>; totalLessons: number; canCreateLevel: boolean; onLevelsChanged: (() => void) | undefined; error: string | null; setError: import("react").Dispatch<import("react").SetStateAction<string | null>>; selectedLevelId: string | null; localModules: import("../../lib/services").ModuleItem[] | null; displayModules: import("../../lib/services").ModuleItem[]; moduleForm: { title: string; order: string; }; run: (action: () => Promise<unknown>, fallback: string, after?: (() => void) | undefined) => Promise<void>; setModuleForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; order: string; }>>; busy: boolean; reordering: boolean; collapsed: Record<string, boolean>; dragId: string | null; dragOverId: string | null; publishingIds: Set<string>; setDragOverId: import("react").Dispatch<import("react").SetStateAction<string | null>>; lessonDrag: { moduleId: string; lessonId: string; } | null; handleDrop: (targetId: string) => Promise<void>; setDragId: import("react").Dispatch<import("react").SetStateAction<string | null>>; toggleCollapsed: (id: string) => void; searchParams: URLSearchParams; expandedLessonId: string | null; setSearchParams: import("../../../node_modules/react-router-dom/dist/index").SetURLSearchParams; handlePublishToggle: (mod: { id: string; isPublished?: boolean; }) => Promise<void>; lessonDragOver: { moduleId: string; lessonId: string; } | null; lessonReorderingIds: Set<string>; setLessonDragOver: import("react").Dispatch<import("react").SetStateAction<{ moduleId: string; lessonId: string; } | null>>; handleLessonDrop: (targetModuleId: string, targetLessonId: string) => Promise<void>; setLessonDrag: import("react").Dispatch<import("react").SetStateAction<{ moduleId: string; lessonId: string; } | null>>; toggleLesson: (id: string) => void; lessonLoadingIds: Set<string>; lessonErrors: Record<string, string>; lessonCache: Record<string, import("../../lib/services").AuthoredLesson>; ensureLessonLoaded: (id: string, force?: boolean | undefined) => Promise<void>; fieldErrors: Record<string, string>; setFieldErrors: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; refreshCachedLesson: (id: string) => void; setLessonCache: import("react").Dispatch<import("react").SetStateAction<Record<string, import("../../lib/services").AuthoredLesson>>>; materialForm: { title: string; type: string; url: string; }; setMaterialForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; url: string; }>>; activityForm: { title: string; type: string; instructions: string; }; setActivityForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; instructions: string; }>>; lessonForms: Record<string, string>; lessonTypeForms: Record<string, string>; setLessonForms: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; setLessonTypeForms: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>> }) {
const { levels, selectedLevel, selectLevel, modules, totalLessons, canCreateLevel, onLevelsChanged, error, setError, selectedLevelId, localModules, displayModules, moduleForm, run, setModuleForm, busy, reordering, collapsed, dragId, dragOverId, publishingIds, setDragOverId, lessonDrag, handleDrop, setDragId, toggleCollapsed, searchParams, expandedLessonId, setSearchParams, handlePublishToggle, lessonDragOver, lessonReorderingIds, setLessonDragOver, handleLessonDrop, setLessonDrag, toggleLesson, lessonLoadingIds, lessonErrors, lessonCache, ensureLessonLoaded, fieldErrors, setFieldErrors, refreshCachedLesson, setLessonCache, materialForm, setMaterialForm, activityForm, setActivityForm, lessonForms, lessonTypeForms, setLessonForms, setLessonTypeForms } = props;
return (<div className="space-y-5">
 <LevelPicker
 levels={levels}
 selectedLevel={selectedLevel}
 onSelect={selectLevel}
 moduleCount={modules.data?.length ?? 0}
 lessonCount={totalLessons}
 canManage={canCreateLevel}
 onLevelsChanged={onLevelsChanged}
 onLevelDeleted={(deletedId) => {
 selectLevel(levels.find((l) => l.id !== deletedId)?.id ?? null);
 onLevelsChanged?.();
 }}
 />

 {error ? (
 <div role="alert" className="alert alert-error py-2 text-xs">
 <span>{error}</span>
 <button type="button" className="btn btn-ghost btn-xs" onClick={() => setError(null)}>
 Dismiss
 </button>
 </div>
 ) : null}

 {/* Modules — Canvas vertical stack */}
 <div aria-busy={modules.stale} className={`transition-opacity ${modules.stale ? 'pointer-events-none opacity-50' : ''}`}>
 {!selectedLevelId ? (
 <Panel>
 <EmptyBlock title="Select a level above" hint="Choose a level to view and organize its modules." />
 </Panel>
 ) : modules.loading && !localModules ? (
 <Panel>
 <LoadingBlock label="Loading modules…" />
 </Panel>
 ) : modules.error && !localModules ? (
 <Panel>
 <ErrorBlock message={modules.error} onRetry={modules.refetch} />
 </Panel>
 ) : (displayModules ?? []).length === 0 ? (
 <CurriculumManagerSection4 moduleForm={moduleForm} selectedLevelId={selectedLevelId} run={run} setModuleForm={setModuleForm} modules={modules} busy={busy} />
  ) : (
  <div className="space-y-4">
 {reordering ? (
 <p className="flex items-center gap-2 text-xs text-muted" role="status" aria-live="polite">
 <span className="loading loading-spinner loading-xs text-brand" /> Saving new order…
 </p>
 ) : null}
 {displayModules
 .slice()
 .sort((a, b) => a.order - b.order)
 .map((mod) => {
 const isCollapsed = collapsed[mod.id] ?? false;
 const isDragging = dragId === mod.id;
 const isDragOver = dragOverId === mod.id && dragId !== mod.id;
 const isPublishing = publishingIds.has(mod.id);
 const lessons = [...mod.lessons].sort((a, b) => a.order - b.order);
 const publishedCount = lessons.filter((l) => l.isPublished).length;
  return (
  <div
  key={mod.id}
  onDragOver={(e) => {
  e.preventDefault();
  if (dragId && dragId !== mod.id) setDragOverId(mod.id);
  }}
  onDragLeave={() => setDragOverId((prev) => (prev === mod.id ? null : prev))}
  onDrop={(e) => {
  e.preventDefault();
  // Only handle module drops — lesson drops are handled per-lesson
  if (lessonDrag) return;
  void handleDrop(mod.id);
  }}
  className={`overflow-hidden rounded-box border bg-base-100 transition ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'border-brand ring-1 ring-brand' : 'border-line'} ${reordering ? 'pointer-events-none' : ''} ${isPublishing ? 'opacity-60' : ''}`}
  aria-busy={isPublishing || reordering}
  >
  {/* Module header — Canvas module bar */}
  <CurriculumManagerSection2 reordering={reordering} isPublishing={isPublishing} setDragId={setDragId} mod={mod} setDragOverId={setDragOverId} collapsed={collapsed} toggleCollapsed={toggleCollapsed} searchParams={searchParams} expandedLessonId={expandedLessonId} setSearchParams={setSearchParams} selectedLevelId={selectedLevelId} isCollapsed={isCollapsed} lessons={lessons} publishedCount={publishedCount} handlePublishToggle={handlePublishToggle} />

 {!isCollapsed ? (
 <CurriculumManagerSection1 lessons={lessons} expandedLessonId={expandedLessonId} lessonDrag={lessonDrag} mod={mod} lessonDragOver={lessonDragOver} lessonReorderingIds={lessonReorderingIds} setLessonDragOver={setLessonDragOver} handleLessonDrop={handleLessonDrop} setLessonDrag={setLessonDrag} toggleLesson={toggleLesson} lessonLoadingIds={lessonLoadingIds} lessonErrors={lessonErrors} lessonCache={lessonCache} ensureLessonLoaded={ensureLessonLoaded} busy={busy} run={run} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} refreshCachedLesson={refreshCachedLesson} searchParams={searchParams} setSearchParams={setSearchParams} setLessonCache={setLessonCache} modules={modules} materialForm={materialForm} setMaterialForm={setMaterialForm} activityForm={activityForm} setActivityForm={setActivityForm} lessonForms={lessonForms} lessonTypeForms={lessonTypeForms} setLessonForms={setLessonForms} setLessonTypeForms={setLessonTypeForms} />
  ) : null}
  </div>
  );
  })}

  <CurriculumManagerSection3 selectedLevelId={selectedLevelId} moduleForm={moduleForm} run={run} modules={modules} setModuleForm={setModuleForm} busy={busy} />
  </div>
  )}
 </div>
  </div>);
}
