import { useEffect,useMemo,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import {
getLesson,
listLevelModules
} from '../../lib/services';
import { createEnsureLessonLoaded } from './curriculum-manager-ensure-lesson-loaded';
import { createHandleDrop } from './curriculum-manager-handle-drop';
import { createHandleLessonDrop } from './curriculum-manager-handle-lesson-drop';
import { createHandlePublishToggle } from './curriculum-manager-handle-publish-toggle';
import type { CurriculumManagerProps } from './curriculum-manager-props';
import { createRun } from './curriculum-manager-run';
import { CurriculumManagerSection101 } from './curriculum-manager-section101';
import { createToggleLesson } from './curriculum-manager-toggle-lesson';
export function CurriculumManager({ levels, canCreateLevel, onLevelsChanged }: CurriculumManagerProps) {
 const [searchParams, setSearchParams] = useSearchParams();

 // ?level= is the single source of truth. Mirroring it in state made a click flash:
 // React Router commits URL changes in a transition, so the stale param snapped the
 // selection back for a render before the new one landed.
 const levelParam = searchParams.get('level');
 const selectedLevelId = useMemo(() => {
 const found = levelParam ? levels.find((l) => l.id === levelParam || l.code === levelParam) : undefined;
 return found?.id ?? levels[0]?.id ?? null;
 }, [levels, levelParam]);

 const modules = useApi(
 `level-modules-${selectedLevelId ?? 'none'}`,
 () => listLevelModules(selectedLevelId ?? ''),
 selectedLevelId !== null,
 );

 const selectedLevel = useMemo(
 () => levels.find((l) => l.id === selectedLevelId) ?? null,
 [levels, selectedLevelId],
 );

 const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
 const toggleCollapsed = (id: string) =>
 setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  // Drag state for module reordering (Canvas-style) — optimistic, no full reload
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());

  // Drag state for lessons inside a module — Canvas lets teachers reorder lessons like modules
  const [lessonDrag, setLessonDrag] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [lessonDragOver, setLessonDragOver] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [lessonReorderingIds, setLessonReorderingIds] = useState<Set<string>>(new Set());

 // Local optimistic copy of modules so we can reorder / toggle publish without a full reload
 const [localModules, setLocalModules] = useState<typeof modules.data | null>(null);
 const [localModulesLevelId, setLocalModulesLevelId] = useState(selectedLevelId);
 if (localModulesLevelId !== selectedLevelId) {
 setLocalModulesLevelId(selectedLevelId);
 setLocalModules(null);
 }
 useEffect(() => {
 if (modules.data) {
 if (!reordering) setLocalModules([...modules.data].sort((a, b) => a.order - b.order));
 }
 }, [modules.data, reordering]);
 const displayModules = localModules ?? [...(modules.data ?? [])].sort((a, b) => a.order - b.order);

 const handlePublishToggle = (...args: Parameters<ReturnType<typeof createHandlePublishToggle>>) => createHandlePublishToggle({ displayModules, setLocalModules, setPublishingIds, setError })(...args);

  const handleDrop = (...args: Parameters<ReturnType<typeof createHandleDrop>>) => createHandleDrop({ dragId, selectedLevelId, displayModules, setLocalModules, setDragId, setDragOverId, setReordering, setError, modules })(...args);

  const handleLessonDrop = (...args: Parameters<ReturnType<typeof createHandleLessonDrop>>) => createHandleLessonDrop({ lessonDrag, displayModules, setLocalModules, setLessonDrag, setLessonDragOver, setLessonReorderingIds, setError, modules })(...args);

 const expandedLessonId = searchParams.get('lesson');
 const [lessonCache, setLessonCache] = useState<Record<string, Awaited<ReturnType<typeof getLesson>>>>({});
 const [lessonLoadingIds, setLessonLoadingIds] = useState<Set<string>>(new Set());
 const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

 const ensureLessonLoaded = (...args: Parameters<ReturnType<typeof createEnsureLessonLoaded>>) => createEnsureLessonLoaded({ lessonCache, lessonLoadingIds, setLessonLoadingIds, setLessonErrors, setLessonCache })(...args);

 // Load the open lesson whenever ?lesson= changes — clicks, deep links, back/forward
 useEffect(() => {
 if (expandedLessonId) void ensureLessonLoaded(expandedLessonId);
 // ensureLessonLoaded is intentionally not in deps — we only want to react to URL changes
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [expandedLessonId]);

 // When lesson param changes and modules are ready, un-collapse its parent module
 useEffect(() => {
 const lessonParam = searchParams.get('lesson');
 const moduleParam = searchParams.get('module');
 if (!lessonParam || !displayModules.length) return;
 const parent = displayModules.find((m) => m.lessons.some((l) => l.id === lessonParam));
 const targetModuleId = parent?.id ?? moduleParam;
 if (targetModuleId && collapsed[targetModuleId]) {
 setCollapsed((prev) => {
 const next = { ...prev };
 delete next[targetModuleId];
 return next;
 });
 }
 // collapsed is read but we don't want to re-run when it changes — only when URL/module list changes
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [searchParams, displayModules]);

 // Keep module param in sync so ?module= reflects the currently viewed module
 useEffect(() => {
 if (!expandedLessonId) return;
 const parent = displayModules.find((m) => m.lessons.some((l) => l.id === expandedLessonId));
 if (!parent) return;
 const currentModule = searchParams.get('module');
 if (currentModule === parent.id) return;
 const next = new URLSearchParams(searchParams);
 next.set('module', parent.id);
 if (selectedLevelId) next.set('level', selectedLevelId);
 setSearchParams(next, { replace: true });
 }, [expandedLessonId, displayModules, selectedLevelId, searchParams, setSearchParams]);

 const toggleLesson = (...args: Parameters<ReturnType<typeof createToggleLesson>>) => createToggleLesson({ expandedLessonId, searchParams, setSearchParams, displayModules, setCollapsed, selectedLevelId })(...args);

 function refreshCachedLesson(id: string) {
 setLessonCache((prev) => {
 const next = { ...prev };
 delete next[id];
 return next;
 });
 void ensureLessonLoaded(id, true);
 modules.refetch();
 }

 // Switch level and drop lesson/module deep links from the URL.
 function selectLevel(levelId: string | null) {
 const next = new URLSearchParams(searchParams);
 if (levelId) next.set('level', levelId);
 else next.delete('level');
 next.delete('lesson');
 next.delete('module');
 setSearchParams(next);
 }

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

 // Forms
 const [moduleForm, setModuleForm] = useState({ title: '', order: '' });
 const [lessonForms, setLessonForms] = useState<Record<string, string>>({});
 const [lessonTypeForms, setLessonTypeForms] = useState<Record<string, string>>({});

 const [materialForm, setMaterialForm] = useState({ title: '', type: 'NOTE', url: '' });
 const [activityForm, setActivityForm] = useState({ title: '', type: 'MCQ', instructions: '' });

  const run = (...args: Parameters<ReturnType<typeof createRun>>) => createRun({ setError, setFieldErrors, setBusy })(...args);

 const totalLessons = useMemo(
 () => (modules.data ?? []).reduce((acc, m) => acc + m.lessons.length, 0),
 [modules.data],
 );

 return (
 <CurriculumManagerSection101 levels={levels} selectedLevel={selectedLevel} selectLevel={selectLevel} modules={modules} totalLessons={totalLessons} canCreateLevel={canCreateLevel} onLevelsChanged={onLevelsChanged} error={error} setError={setError} selectedLevelId={selectedLevelId} localModules={localModules} displayModules={displayModules} moduleForm={moduleForm} run={run} setModuleForm={setModuleForm} busy={busy} reordering={reordering} collapsed={collapsed} dragId={dragId} dragOverId={dragOverId} publishingIds={publishingIds} setDragOverId={setDragOverId} lessonDrag={lessonDrag} handleDrop={handleDrop} setDragId={setDragId} toggleCollapsed={toggleCollapsed} searchParams={searchParams} expandedLessonId={expandedLessonId} setSearchParams={setSearchParams} handlePublishToggle={handlePublishToggle} lessonDragOver={lessonDragOver} lessonReorderingIds={lessonReorderingIds} setLessonDragOver={setLessonDragOver} handleLessonDrop={handleLessonDrop} setLessonDrag={setLessonDrag} toggleLesson={toggleLesson} lessonLoadingIds={lessonLoadingIds} lessonErrors={lessonErrors} lessonCache={lessonCache} ensureLessonLoaded={ensureLessonLoaded} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} refreshCachedLesson={refreshCachedLesson} setLessonCache={setLessonCache} materialForm={materialForm} setMaterialForm={setMaterialForm} activityForm={activityForm} setActivityForm={setActivityForm} lessonForms={lessonForms} lessonTypeForms={lessonTypeForms} setLessonForms={setLessonForms} setLessonTypeForms={setLessonTypeForms} />
  );
}
