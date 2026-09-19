import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
 FiBookOpen,
 FiCheck,
 FiChevronDown,
 FiChevronUp,
 FiDownload,
 FiEdit2,
 FiEye,
 FiEyeOff,
 FiFileText,
 FiFilm,
 FiGrid,
 FiLink,
 FiMove,
 FiLayers,
 FiMusic,
 FiPlus,
 FiTrash2,
 FiX,
} from 'react-icons/fi';
import { Panel, SectionHeader } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { useApi } from '../../hooks/useApi';
import { RichTextEditor } from '../ui/RichTextEditor';
import { apiErrorMessage, apiFieldErrors } from '../../lib/api';
import {
  createActivity,
  createLesson,
  createLevel,
  createMaterial,
  createModule,
  deleteLesson,
  getLesson,
  humanize,
  listLevelModules,
  updateLesson,
  updateModule,
  uploadFile,
} from '../../lib/services';
import type { LevelItem } from '../../lib/services';

const CONTENT_TYPES = ['TEXT', 'VIDEO', 'AUDIO', 'PDF', 'MIXED'] as const;
const MATERIAL_TYPES = ['NOTE', 'PDF', 'VIDEO', 'AUDIO', 'LINK', 'WORKSHEET', 'SLIDE', 'OTHER'] as const;
const ACTIVITY_TYPES = [
 { value: 'FILL_BLANK', label: 'Fill in the blank' },
 { value: 'TRUE_FALSE', label: 'True / False' },
 { value: 'WRITING', label: 'Writing' },
 { value: 'MCQ', label: 'Multiple choice' },
 { value: 'DOCUMENT', label: 'Document submission' },
] as const;

type ActivityQuestion =
 | { kind: 'FILL_BLANK'; sentence: string; answer: string }
 | { kind: 'TRUE_FALSE'; statement: string; correct: boolean }
 | { kind: 'WRITING'; prompt: string; minWords: string }
 | { kind: 'MCQ'; question: string; options: string[]; correctIndex: number }
 | { kind: 'DOCUMENT'; prompt: string; allowedTypes: string };

function buildActivityConfig(type: string, q: ActivityQuestion, instructions: string) {
 const backendType = type === 'DOCUMENT' ? 'WRITING' : type;
 let config: Record<string, unknown> = { instructions };
 if (q.kind === 'MCQ') config = { ...config, question: q.question, options: q.options, correctIndex: q.correctIndex };
 else if (q.kind === 'FILL_BLANK') config = { ...config, sentence: q.sentence, answer: q.answer };
 else if (q.kind === 'TRUE_FALSE') config = { ...config, statement: q.statement, correct: q.correct };
 else if (q.kind === 'WRITING') config = { ...config, prompt: q.prompt, minWords: q.minWords };
 else if (q.kind === 'DOCUMENT') config = { ...config, prompt: q.prompt, allowedTypes: q.allowedTypes, isDocumentSubmission: true };
 return { backendType, config };
}

function contentIcon(type: string) {
 switch (type) {
 case 'VIDEO':
 return FiFilm;
 case 'AUDIO':
 return FiMusic;
 case 'PDF':
 return FiFileText;
 case 'MIXED':
 return FiLayers;
 default:
 return FiBookOpen;
 }
}

type CurriculumManagerProps = {
 levels: LevelItem[];
 canCreateLevel: boolean;
 onLevelsChanged?: () => void;
};

/**
 * Canvas-style vertical Modules page.
 * Level selector on top, then modules stacked vertically like Canvas.
 * Each module header can collapse; lessons sit as indented items underneath.
 * Lessons expand inline to edit notes, media, materials and activities.
 */
export function CurriculumManager({ levels, canCreateLevel, onLevelsChanged }: CurriculumManagerProps) {
 const [searchParams, setSearchParams] = useSearchParams();

 const [selectedLevelId, setSelectedLevelId] = useState<string | null>(() => {
 const param = new URLSearchParams(window.location.search).get('level');
 if (param) {
 const found = levels.find((l) => l.id === param || l.code === param);
 if (found) return found.id;
 }
 return levels[0]?.id ?? null;
 });

 // Keep selected level in sync with URL (?level=) — deep link & back/forward
 useEffect(() => {
 const param = searchParams.get('level');
 if (param) {
 const found = levels.find((l) => l.id === param || l.code === param);
 if (found && found.id !== selectedLevelId) setSelectedLevelId(found.id);
 } else if (!selectedLevelId && levels.length > 0) {
 setSelectedLevelId(levels[0].id);
 }
 }, [levels, searchParams, selectedLevelId]);

 // Push level to URL when it changes (so sharing & history work)
 useEffect(() => {
 if (!selectedLevelId) return;
 const param = searchParams.get('level');
 // Use code for prettier URLs when possible, but accept id too
 const levelForUrl = levels.find((l) => l.id === selectedLevelId)?.code ?? selectedLevelId;
 if (param === selectedLevelId || param === levelForUrl) return;
 const next = new URLSearchParams(searchParams);
 next.set('level', selectedLevelId);
 setSearchParams(next, { replace: true });
 }, [selectedLevelId, levels, searchParams, setSearchParams]);

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
 useEffect(() => {
 if (modules.data) {
 if (!reordering) setLocalModules([...modules.data].sort((a, b) => a.order - b.order));
 }
 }, [modules.data, reordering]);
 const displayModules = localModules ?? [...(modules.data ?? [])].sort((a, b) => a.order - b.order);

 async function handlePublishToggle(mod: { id: string; isPublished?: boolean }) {
 const next = !(mod.isPublished ?? true);
 const previous = displayModules;
 setLocalModules((prev) =>
 prev ? prev.map((m) => (m.id === mod.id ? { ...m, isPublished: next } : m)) : prev,
 );
 setPublishingIds((prev) => new Set(prev).add(mod.id));
 setError(null);
 try {
 await updateModule(mod.id, { isPublished: next });
 } catch (err) {
 setLocalModules(previous ?? null);
 setError(apiErrorMessage(err, 'Could not update the module.'));
 } finally {
 setPublishingIds((prev) => {
 const nextSet = new Set(prev);
 nextSet.delete(mod.id);
 return nextSet;
 });
 }
 }

  async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId || !selectedLevelId) return;
    const ordered = [...displayModules].sort((a, b) => a.order - b.order);
    const from = ordered.findIndex((m) => m.id === dragId);
    const to = ordered.findIndex((m) => m.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    const optimistic = ordered.map((m, index) => ({ ...m, order: index }));
    setLocalModules(optimistic);
    setDragId(null);
    setDragOverId(null);
    setReordering(true);
    setError(null);
    try {
      // Avoid unique [levelId, order] collisions — bump to temp offset first, then to final order
      const TEMP = 1000;
      for (let i = 0; i < optimistic.length; i++) {
        await updateModule(optimistic[i].id, { order: TEMP + i });
      }
      for (let i = 0; i < optimistic.length; i++) {
        const original = (modules.data ?? []).find((m) => m.id === optimistic[i].id);
        if (original?.order !== optimistic[i].order) {
          await updateModule(optimistic[i].id, { order: optimistic[i].order });
        }
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not reorder modules.'));
      setLocalModules(modules.data ? [...modules.data].sort((a, b) => a.order - b.order) : null);
    } finally {
      setReordering(false);
      modules.refetch();
    }
  }

  async function handleLessonDrop(targetModuleId: string, targetLessonId: string) {
    if (!lessonDrag || lessonDrag.moduleId !== targetModuleId || lessonDrag.lessonId === targetLessonId) return;
    const mod = displayModules.find((m) => m.id === targetModuleId);
    if (!mod) return;
    const ordered = [...mod.lessons].sort((a, b) => a.order - b.order);
    const from = ordered.findIndex((l) => l.id === lessonDrag.lessonId);
    const to = ordered.findIndex((l) => l.id === targetLessonId);
    if (from === -1 || to === -1) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    const optimistic = ordered.map((l, index) => ({ ...l, order: index }));
    setLocalModules((prev) => (prev ? prev.map((m) => (m.id === targetModuleId ? { ...m, lessons: optimistic as never } : m)) : prev));
    setLessonDrag(null);
    setLessonDragOver(null);
    setLessonReorderingIds((prev) => new Set(prev).add(targetModuleId));
    setError(null);
    try {
      const TEMP = 1000;
      for (let i = 0; i < optimistic.length; i++) {
        await updateLesson(optimistic[i].id, { order: TEMP + i });
      }
      for (let i = 0; i < optimistic.length; i++) {
        const original = (modules.data ?? []).find((m) => m.id === targetModuleId)?.lessons.find((l) => l.id === optimistic[i].id);
        if (original?.order !== optimistic[i].order) {
          await updateLesson(optimistic[i].id, { order: optimistic[i].order });
        }
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not reorder lessons.'));
      setLocalModules(modules.data ? [...modules.data].sort((a, b) => a.order - b.order) : null);
    } finally {
      setLessonReorderingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetModuleId);
        return next;
      });
      modules.refetch();
    }
  }

 const [expandedLessonId, setExpandedLessonId] = useState<string | null>(() => {
 return new URLSearchParams(window.location.search).get('lesson');
 });
 const [lessonCache, setLessonCache] = useState<Record<string, Awaited<ReturnType<typeof getLesson>>>>({});
 const [lessonLoadingIds, setLessonLoadingIds] = useState<Set<string>>(new Set());
 const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

 async function ensureLessonLoaded(id: string, force = false) {
 if (!force && (lessonCache[id] || lessonLoadingIds.has(id))) return;
 setLessonLoadingIds((prev) => new Set(prev).add(id));
 setLessonErrors((prev) => {
 const next = { ...prev };
 delete next[id];
 return next;
 });
 try {
 const data = await getLesson(id);
 setLessonCache((prev) => ({ ...prev, [id]: data }));
 } catch (err) {
 setLessonErrors((prev) => ({ ...prev, [id]: apiErrorMessage(err, 'Could not load this lesson.') }));
 } finally {
 setLessonLoadingIds((prev) => {
 const next = new Set(prev);
 next.delete(id);
 return next;
 });
 }
 }

 // Sync expanded lesson with URL (?lesson= & ?module=) — deep link, share, back/forward
 useEffect(() => {
 const lessonParam = searchParams.get('lesson');
 if (lessonParam && lessonParam !== expandedLessonId) {
 setExpandedLessonId(lessonParam);
 void ensureLessonLoaded(lessonParam);
 } else if (!lessonParam && expandedLessonId) {
 setExpandedLessonId(null);
 }
 // ensureLessonLoaded is intentionally not in deps — we only want to react to URL changes
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [searchParams, expandedLessonId]);

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

 // Ensure the deep-linked lesson from the initial URL is fetched on first paint
 useEffect(() => {
 const lessonParam = new URLSearchParams(window.location.search).get('lesson');
 if (lessonParam) void ensureLessonLoaded(lessonParam);
 // run once on mount — ensureLessonLoaded is stable for this purpose
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 function toggleLesson(id: string) {
 if (expandedLessonId === id) {
 setExpandedLessonId(null);
 const next = new URLSearchParams(searchParams);
 next.delete('lesson');
 // keep ?module so user stays in the module, keep ?level
 setSearchParams(next);
 } else {
 setExpandedLessonId(id);
 void ensureLessonLoaded(id);
 const next = new URLSearchParams(searchParams);
 next.set('lesson', id);
 const parent = displayModules.find((m) => m.lessons.some((l) => l.id === id));
 if (parent) {
 next.set('module', parent.id);
 // ensure module is expanded
 setCollapsed((prev) => {
 if (!prev[parent.id]) return prev;
 const nextCollapsed = { ...prev };
 delete nextCollapsed[parent.id];
 return nextCollapsed;
 });
 }
 if (selectedLevelId) next.set('level', selectedLevelId);
 setSearchParams(next);
 }
 }

 function refreshCachedLesson(id: string) {
 setLessonCache((prev) => {
 const next = { ...prev };
 delete next[id];
 return next;
 });
 void ensureLessonLoaded(id, true);
 modules.refetch();
 }

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

 // Forms
 const [levelForm, setLevelForm] = useState({ code: '', title: '', levelLabel: '', defaultFee: '' });
 const [moduleForm, setModuleForm] = useState({ title: '', order: '' });
 const [lessonForms, setLessonForms] = useState<Record<string, string>>({});
 const [lessonTypeForms, setLessonTypeForms] = useState<Record<string, string>>({});

 const [materialForm, setMaterialForm] = useState({ title: '', type: 'NOTE', url: '' });
 const [activityForm, setActivityForm] = useState({ title: '', type: 'MCQ', instructions: '' });

  async function run(action: () => Promise<unknown>, fallback: string, after?: () => void) {
  setError(null);
  setFieldErrors({});
  setBusy(true);
  try {
  await action();
  after?.();
  } catch (err) {
  setError(apiErrorMessage(err, fallback));
  setFieldErrors(apiFieldErrors(err));
  } finally {
  setBusy(false);
  }
  }

 const totalLessons = useMemo(
 () => (modules.data ?? []).reduce((acc, m) => acc + m.lessons.length, 0),
 [modules.data],
 );

 return (
 <div className="space-y-5">
 {/* Level selector — Canvas course picker analogue */}
 <Panel>
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
 <FiGrid aria-hidden /> Level
 </span>
 <div className="flex flex-wrap gap-2">
 {levels.length === 0 ? (
 <span className="text-xs text-muted">No levels assigned</span>
 ) : (
 levels.map((level) => (
 <button
 key={level.id}
 type="button"
 onClick={() => {
 setSelectedLevelId(level.id);
 setExpandedLessonId(null);
 const next = new URLSearchParams(searchParams);
 next.set('level', level.id);
 next.delete('lesson');
 next.delete('module');
 setSearchParams(next);
 }}
 className={`btn btn-sm rounded-full ${selectedLevelId === level.id ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'}`}
 >
 {level.code} · {level.levelLabel}
 </button>
 ))
 )}
 </div>
 {selectedLevel ? (
 <span className="ml-auto hidden items-center gap-2 text-xs text-muted lg:flex">
 <span className="font-semibold text-ink">{selectedLevel.title}</span>
 <span>·</span>
 <span>{modules.data?.length ?? 0} modules</span>
 <span>·</span>
 <span>{totalLessons} lessons</span>
 </span>
 ) : null}
 </div>

 {canCreateLevel ? (
 <details className="collapse collapse-arrow mt-3 rounded-box border border-line bg-base-200/40">
 <summary className="collapse-title py-3 text-xs font-semibold">Create a new level</summary>
 <div className="collapse-content">
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void run(
 () =>
 createLevel({
 code: levelForm.code.trim().toUpperCase(),
 title: levelForm.title.trim(),
 levelLabel: levelForm.levelLabel.trim(),
 defaultFee: levelForm.defaultFee ? Number(levelForm.defaultFee) : 0,
 }),
 'Could not create the level.',
 () => {
 setLevelForm({ code: '', title: '', levelLabel: '', defaultFee: '' });
 onLevelsChanged?.();
 },
 );
 }}
 className="space-y-3 pt-2"
 >
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Code</span>
 <input required value={levelForm.code} onChange={(e) => { const v = e.currentTarget.value; setLevelForm((f) => ({ ...f, code: v })) }} placeholder="e.g. A1" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Label</span>
 <input required value={levelForm.levelLabel} onChange={(e) => { const v = e.currentTarget.value; setLevelForm((f) => ({ ...f, levelLabel: v })) }} placeholder="e.g. Beginner" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 </div>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Title</span>
 <input required value={levelForm.title} onChange={(e) => { const v = e.currentTarget.value; setLevelForm((f) => ({ ...f, title: v })) }} placeholder="e.g. German A1 — Beginner" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Default fee (RWF)</span>
 <input value={levelForm.defaultFee} onChange={(e) => { const v = e.currentTarget.value; setLevelForm((f) => ({ ...f, defaultFee: v })) }} inputMode="numeric" placeholder="e.g. 45000" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : null} Create level
  </button>
 </form>
 </div>
 </details>
 ) : null}
 </Panel>

 {error ? (
 <div role="alert" className="alert alert-error py-2 text-xs">
 <span>{error}</span>
 <button type="button" className="btn btn-ghost btn-xs" onClick={() => setError(null)}>
 Dismiss
 </button>
 </div>
 ) : null}

 {/* Modules — Canvas vertical stack */}
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
 <Panel>
 <EmptyBlock title="No modules yet" hint="Create the first module below to start building this course." />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 const title = moduleForm.title.trim();
 if (!title || !selectedLevelId) return;
 void run(
 () => createModule(selectedLevelId, { title, order: Number(moduleForm.order) || 0, isPublished: true }),
 'Could not create the module.',
 () => {
 setModuleForm({ title: '', order: '' });
 modules.refetch();
 },
 );
 }}
 className="mx-auto mt-4 max-w-lg space-y-3"
 >
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Module title</span>
 <input required value={moduleForm.title} onChange={(e) => { const v = e.currentTarget.value; setModuleForm((f) => ({ ...f, title: v })) }} placeholder="e.g. Module 1: Foundations" className="input input w-full rounded-full border-line bg-base-200" />
 </label>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add module
  </button>
  </form>
  </Panel>
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
  <div className="flex items-center gap-3 bg-base-200 px-4 py-3">
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
 </div>

 {!isCollapsed ? (
 <div className="divide-y divide-line">
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
  setExpandedLessonId(null);
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
  </div>
  ) : null}
  </div>
  );
  })}

  <Panel>
  <SectionHeader title="Add a module" />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 if (!selectedLevelId) return;
 const title = moduleForm.title.trim();
 if (!title) return;
 void run(
 () => createModule(selectedLevelId, { title, order: (modules.data?.length ?? 0), isPublished: true }),
 'Could not create the module.',
 () => {
 setModuleForm({ title: '', order: '' });
 modules.refetch();
 },
 );
 }}
 className="space-y-3"
 >
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Module title</span>
  <input
  required
  value={moduleForm.title}
  onChange={(e) => { const v = e.currentTarget.value; setModuleForm((f) => ({ ...f, title: v })) }}
  placeholder="e.g. Module 2: Everyday German"
  className="input input w-full rounded-full border-line bg-base-200"
  />
  </label>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add module
  </button>
  </form>
  </Panel>
  </div>
  )}
  </div>
  );
}

function materialIcon(type: string) {
 switch (type) {
 case 'VIDEO':
 return FiFilm;
 case 'AUDIO':
 return FiMusic;
 case 'PDF':
 return FiFileText;
 case 'LINK':
 return FiLink;
 case 'SLIDE':
 return FiLayers;
 default:
 return FiBookOpen;
 }
}

function LessonEditor({
  lessonId,
  data,
  busy,
  onRun,
  fieldErrors,
  onFieldErrorsChange,
  onSaved,
  onDeleted,
  materialForm,
  setMaterialForm,
  activityForm,
  setActivityForm,
}: {
  lessonId: string;
  data: NonNullable<ReturnType<typeof useApi>['data']> & {
  title: string;
  contentType: string;
  body: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  estimatedMinutes: number | null;
  isPublished: boolean;
  materials: {
  id: string;
  title: string;
  type: string;
  url: string | null;
  isDownloadable: boolean;
  mimeType: string | null;
  }[];
  activities: {
  id: string;
  title: string;
  type: string;
  instructions: string | null;
  order: number;
  isPublished: boolean;
  }[];
  };
  busy: boolean;
  onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>;
  fieldErrors: Record<string, string>;
  onFieldErrorsChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSaved: () => void;
  onDeleted: () => void;
  materialForm: { title: string; type: string; url: string };
  setMaterialForm: React.Dispatch<React.SetStateAction<{ title: string; type: string; url: string }>>;
  activityForm: { title: string; type: string; instructions: string };
  setActivityForm: React.Dispatch<React.SetStateAction<{ title: string; type: string; instructions: string }>>;
}) {
 const [edit, setEdit] = useState({
 title: data.title,
 contentType: data.contentType,
 body: data.body ?? '',
 videoUrl: data.videoUrl ?? '',
 audioUrl: data.audioUrl ?? '',
 estimatedMinutes: data.estimatedMinutes != null ? String(data.estimatedMinutes) : '',
 isPublished: data.isPublished,
 });
 useEffect(() => {
 setEdit({
 title: data.title,
 contentType: data.contentType,
 body: data.body ?? '',
 videoUrl: data.videoUrl ?? '',
 audioUrl: data.audioUrl ?? '',
 estimatedMinutes: data.estimatedMinutes != null ? String(data.estimatedMinutes) : '',
 isPublished: data.isPublished,
 });
 }, [data]);

 const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
 const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
 const [materialDraft, setMaterialDraft] = useState({ title: '', type: 'NOTE', url: '', isDownloadable: true });
 const [activityDraft, setActivityDraft] = useState({ title: '', type: 'MCQ', instructions: '', isPublished: true });
 const [showAddMaterial, setShowAddMaterial] = useState(false);
 const [showAddActivity, setShowAddActivity] = useState(false);
 const [activityQ, setActivityQ] = useState<ActivityQuestion>({ kind: 'MCQ', question: '', options: ['', '', '', ''], correctIndex: 0 });

 function startEditMaterial(m: { id: string; title: string; type: string; url: string | null; isDownloadable: boolean }) {
 setEditingMaterialId(m.id);
 setMaterialDraft({ title: m.title, type: m.type, url: m.url ?? '', isDownloadable: m.isDownloadable });
 }

 function startEditActivity(a: { id: string; title: string; type: string; instructions: string | null; isPublished: boolean }) {
 setEditingActivityId(a.id);
 setActivityDraft({ title: a.title, type: a.type, instructions: a.instructions ?? '', isPublished: a.isPublished });
 }

 return (
 <div className="space-y-6">
 {/* ── Lesson Details — distinct white card with brand accent ── */}
 <div className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="flex items-center gap-3 border-b border-line bg-brand/[0.04] px-4 py-3">
 <span className="flex size-8 items-center justify-center rounded-full bg-brand text-white">
 <FiBookOpen aria-hidden />
 </span>
 <div>
 <h4 className="text-sm font-bold leading-none">Lesson details</h4>
 <p className="text-[11px] text-muted">Core content students read, watch or listen to</p>
 </div>
 <span className="ml-auto hidden items-center gap-1 rounded-full bg-base-200 px-2.5 py-1 text-[11px] font-medium text-muted sm:flex">
 <span className={`size-2 rounded-full ${edit.isPublished ? 'bg-success' : 'bg-muted'}`} aria-hidden />
 {edit.isPublished ? 'Published' : 'Draft'}
 </span>
 </div>
 <div className="space-y-4 p-4">
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Lesson title</span>
  <input value={edit.title} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, title: v })); if (fieldErrors.title) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.title; return n; }) }} placeholder="e.g. Greetings & Introductions" className={`input input w-full rounded-field bg-base-100 ${fieldErrors.title ? 'input-error border-error' : 'border-line'}`} aria-invalid={Boolean(fieldErrors.title)} />
  {fieldErrors.title ? <p className="mt-1 text-xs text-error">{fieldErrors.title}</p> : null}
  </label>
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Content type</span>
  <select value={edit.contentType} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, contentType: v })); if (fieldErrors.contentType) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.contentType; return n; }) }} className={`select select w-full rounded-field bg-base-100 ${fieldErrors.contentType ? 'select-error border-error' : 'border-line'}`}>
  {CONTENT_TYPES.map((t) => (
  <option key={t} value={t}>
  {humanize(t)}
  </option>
  ))}
  </select>
  {fieldErrors.contentType ? <p className="mt-1 text-xs text-error">{fieldErrors.contentType}</p> : null}
  </label>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Duration (minutes)</span>
  <input value={edit.estimatedMinutes} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, estimatedMinutes: v })); if (fieldErrors.estimatedMinutes) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.estimatedMinutes; return n; }) }} inputMode="numeric" placeholder="e.g. 30" className={`input input w-full rounded-field bg-base-100 ${fieldErrors.estimatedMinutes ? 'input-error border-error' : 'border-line'}`} />
  {fieldErrors.estimatedMinutes ? <p className="mt-1 text-xs text-error">{fieldErrors.estimatedMinutes}</p> : null}
  </label>
  <label className="flex items-center gap-2 pt-6 text-xs font-medium">
  <input type="checkbox" className="checkbox checkbox-sm" checked={edit.isPublished} onChange={(e) => { const v = e.currentTarget.checked; setEdit((f) => ({ ...f, isPublished: v })) }} />
  Published — visible to students
  </label>
  </div>
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Lesson notes — rich text</span>
  <RichTextEditor value={edit.body} onChange={(html) => { setEdit((f) => ({ ...f, body: html })); if (fieldErrors.body) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.body; return n; }) }} placeholder="Write the lesson content — bold, colors, headings, lists, images…" error={fieldErrors.body ?? null} />
  </label>
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Video URL</span>
  <input value={edit.videoUrl} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, videoUrl: v })); if (fieldErrors.videoUrl) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.videoUrl; return n; }) }} placeholder="https://youtube.com/..." className={`input input w-full rounded-field bg-base-100 ${fieldErrors.videoUrl ? 'input-error border-error' : 'border-line'}`} aria-invalid={Boolean(fieldErrors.videoUrl)} />
  {fieldErrors.videoUrl ? <p className="mt-1 text-xs text-error">{fieldErrors.videoUrl}</p> : null}
  </label>
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Audio URL</span>
  <input value={edit.audioUrl} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, audioUrl: v })); if (fieldErrors.audioUrl) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.audioUrl; return n; }) }} placeholder="https://..." className={`input input w-full rounded-field bg-base-100 ${fieldErrors.audioUrl ? 'input-error border-error' : 'border-line'}`} aria-invalid={Boolean(fieldErrors.audioUrl)} />
  {fieldErrors.audioUrl ? <p className="mt-1 text-xs text-error">{fieldErrors.audioUrl}</p> : null}
  </label>
  </div>

  <div className="flex flex-wrap gap-2">
  <button
  type="button"
  disabled={busy}
  onClick={() =>
  onRun(
  () =>
  updateLesson(lessonId, {
  title: edit.title.trim(),
  contentType: edit.contentType,
  body: edit.body.trim() || null,
  videoUrl: edit.videoUrl.trim() || null,
  audioUrl: edit.audioUrl.trim() || null,
  estimatedMinutes: edit.estimatedMinutes ? Number(edit.estimatedMinutes) : null,
  isPublished: edit.isPublished,
  }),
  'Could not save the lesson.',
  onSaved,
  )
  }
  className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
  >
  {busy ? <span className="loading loading-spinner loading-xs" /> : null} Save lesson
  </button>
  <button
  type="button"
  disabled={busy}
  onClick={() => onRun(() => deleteLesson(lessonId), 'Could not delete the lesson.', onDeleted)}
  className="btn btn-sm gap-1 rounded-full border-0 bg-coral text-white hover:bg-coral/90 disabled:opacity-60"
  >
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 aria-hidden />} Delete lesson
  </button>
  </div>
 </div>
 </div>

 {/* ── Divider: attached content — visually separates lesson form from extras ── */}
 <div className="relative flex items-center gap-3 py-1">
 <div className="h-px grow bg-line" aria-hidden />
 <span className="rounded-full border border-line bg-base-200 px-3 py-1 text-[11px] font-semibold tracking-widest text-muted">Attached content</span>
 <div className="h-px grow bg-line" aria-hidden />
 </div>

 {/* ── Materials — Canvas Files analogue · blue accent ─────── */}
 <div className="overflow-hidden rounded-box border border-line bg-base-100 border-l-4 border-l-info">
 <div className="border-b border-line bg-[#eff6ff] px-3 py-2.5">
 <div className="flex items-center justify-between gap-2">
 <h4 className="flex items-center gap-2 text-xs font-semibold">
 <FiFileText aria-hidden className="text-brand" />
 Resources
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">
 {data.materials.length}
 </span>
 </h4>
 <span className="hidden text-[11px] text-muted sm:block">Files & links students use to learn</span>
 </div>
 <p className="mt-1 text-[11px] leading-snug text-muted">
 Notes, PDFs, slides, videos and links. Published lessons show their resources to enrolled students.
 </p>
 </div>

 <div className="p-3">
 {data.materials.length === 0 ? (
 <div className="rounded-box border border-dashed border-line bg-base-200/30 px-4 py-6 text-center">
 <FiFileText aria-hidden className="mx-auto text-xl text-muted" />
 <p className="mt-2 text-xs font-medium">No resources yet</p>
 <p className="mx-auto mt-1 max-w-sm text-[11px] leading-snug text-muted">
 Add the first file — e.g. a vocabulary PDF or a link to a video. Students see it inside this lesson.
 </p>
 </div>
 ) : (
 <ul className="space-y-2">
 {data.materials.map((m) => {
 const Icon = materialIcon(m.type);
 const isEditing = editingMaterialId === m.id;
 return (
 <li key={m.id} className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="flex items-center gap-3 px-3 py-2.5">
 <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-muted">
 <Icon aria-hidden className="text-sm" />
 </span>
 <span className="min-w-0 grow">
 <span className="block truncate text-xs font-medium leading-tight">{m.title}</span>
 <span className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
 <span className="rounded-full bg-base-200 px-2 py-0.5">{humanize(m.type)}</span>
 {m.url ? (
 <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 truncate font-medium text-brand hover:underline">
 <FiLink aria-hidden className="shrink-0" />
 <span className="max-w-[14rem] truncate">{m.url}</span>
 </a>
 ) : (
 <span className="italic">No URL — upload a file</span>
 )}
 {m.isDownloadable ? (
 <span className="inline-flex items-center gap-1">
 <FiDownload aria-hidden className="text-[11px]" />
 Downloadable
 </span>
 ) : null}
 </span>
 </span>
 <span className="flex shrink-0 items-center gap-1">
 <button
 type="button"
 onClick={() => (isEditing ? setEditingMaterialId(null) : startEditMaterial(m))}
 className="btn btn-ghost btn-xs btn-circle"
 aria-label={isEditing ? 'Cancel edit' : `Edit ${m.title}`}
 >
 {isEditing ? <FiX aria-hidden /> : <FiEdit2 aria-hidden />}
 </button>
 <button
 type="button"
 onClick={() => {
 if (!confirm(`Delete "${m.title}"?`)) return;
 void onRun(() => import('../../lib/services').then((s) => s.deleteMaterial(m.id)), 'Could not delete the resource.', onSaved);
 }}
 className="btn btn-ghost btn-xs btn-circle text-coral"
 aria-label={`Delete ${m.title}`}
 >
 <FiTrash2 aria-hidden />
 </button>
 </span>
 </div>

 {isEditing ? (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setEditingMaterialId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () =>
 import('../../lib/services').then((s) =>
 s.updateMaterial(m.id, {
 title: materialDraft.title.trim(),
 type: materialDraft.type,
 url: materialDraft.url.trim() || null,
 isDownloadable: materialDraft.isDownloadable,
 }),
 ),
 'Could not save the resource.',
 () => {
 setEditingMaterialId(null);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setEditingMaterialId(null)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-info text-white">
 <FiFileText aria-hidden />
 </span>
 Edit resource
 </h4>
 <p className="mt-1 text-xs text-muted">Update the file details — changes are visible to students immediately.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={materialDraft.title} onChange={(e) => { const v = e.currentTarget.value; setMaterialDraft((f) => ({ ...f, title: v })) }} className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select value={materialDraft.type} onChange={(e) => { const v = e.currentTarget.value; setMaterialDraft((f) => ({ ...f, type: v })) }} className="select select w-full rounded-field border-line bg-base-100">
 {MATERIAL_TYPES.map((t) => (
 <option key={t} value={t}>
 {humanize(t)}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1 mt-3 block text-xs font-medium">URL</span>
 <input value={materialDraft.url} onChange={(e) => { const v = e.currentTarget.value; setMaterialDraft((f) => ({ ...f, url: v })) }} placeholder="https://..." className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="mt-3 flex items-center gap-2 text-xs font-medium">
 <input type="checkbox" className="checkbox checkbox-xs" checked={materialDraft.isDownloadable} onChange={(e) => { const v = e.currentTarget.checked; setMaterialDraft((f) => ({ ...f, isDownloadable: v })) }} />
 Downloadable for students
 </label>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setEditingMaterialId(null)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />} Save changes
  </button>
 </div>
 </form>
 </div>
 ) : null}
 </li>
 );
 })}
 </ul>
 )}

 <button type="button" onClick={() => setShowAddMaterial(true)} className="mt-4 btn btn-sm gap-2 rounded-full border border-dashed border-info bg-[#eff6ff] text-info hover:bg-info hover:text-white">
 <FiPlus aria-hidden /> Add resource
 </button>

 {showAddMaterial ? (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setShowAddMaterial(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () =>
 createMaterial(lessonId, {
 title: materialForm.title.trim(),
 type: materialForm.type,
 url: materialForm.url.trim() || undefined,
 isDownloadable: true,
 }),
 'Could not add the resource.',
 () => {
 setMaterialForm({ title: '', type: 'NOTE', url: '' });
 setShowAddMaterial(false);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setShowAddMaterial(false)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-info text-white">
 <FiFileText aria-hidden />
 </span>
 Add resource
 </h4>
 <p className="mt-1 text-xs text-muted">A file, link or note students will see inside this lesson.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={materialForm.title} onChange={(e) => { const v = e.currentTarget.value; setMaterialForm((f) => ({ ...f, title: v })) }} placeholder="e.g. Vocabulary List — Greetings" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select value={materialForm.type} onChange={(e) => { const v = e.currentTarget.value; setMaterialForm((f) => ({ ...f, type: v })) }} className="select select w-full rounded-field border-line bg-base-100">
 {MATERIAL_TYPES.map((t) => (
 <option key={t} value={t}>
 {humanize(t)}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1 mt-3 block text-xs font-medium">Link</span>
 <input value={materialForm.url} onChange={(e) => { const v = e.currentTarget.value; setMaterialForm((f) => ({ ...f, url: v })) }} placeholder="https://... or leave empty and upload" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <label className="btn btn-sm gap-1 rounded-full border-line bg-base-100">
 <FiFileText aria-hidden /> Upload file
 <input
 type="file"
 className="hidden"
 onChange={(e) => {
 const file = e.currentTarget.files?.[0];
 if (!file) return;
 void onRun(
 async () => {
 const result = await uploadFile(file);
 setMaterialForm((f) => ({ ...f, url: result.url }));
 },
 'Could not upload the file.',
 );
 }}
 />
 </label>
 {materialForm.url ? <span className="truncate text-xs text-muted">Linked: {materialForm.url}</span> : null}
 </div>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setShowAddMaterial(false)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add resource
  </button>
 </div>
 </form>
 </div>
 ) : null}
 </div>
 </div>

 {/* ── Activities — Canvas Assignments / Practice ───────────── */}
 <div className="rounded-box border border-line bg-base-100">
 <div className="border-b border-line bg-base-200/50 px-3 py-2">
 <div className="flex items-center justify-between gap-2">
 <h4 className="flex items-center gap-2 text-xs font-semibold">
 <FiLayers aria-hidden className="text-brand" />
 Practice activities
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">{data.activities.length}</span>
 </h4>
 <span className="hidden text-[11px] text-muted sm:block">Tasks students do — auto-graded or teacher-graded</span>
 </div>
 <p className="mt-1 text-[11px] leading-snug text-muted">
 Vocabulary, listening, writing and speaking exercises. Published activities appear in the lesson for students.
 </p>
 </div>

 <div className="p-3">
 {data.activities.length === 0 ? (
 <div className="rounded-box border border-dashed border-line bg-base-200/30 px-4 py-6 text-center">
 <FiLayers aria-hidden className="mx-auto text-xl text-muted" />
 <p className="mt-2 text-xs font-medium">No activities yet</p>
 <p className="mx-auto mt-1 max-w-sm text-[11px] leading-snug text-muted">
 Add the first exercise — e.g. a vocabulary matching or a short writing task. Students complete it inside the lesson.
 </p>
 </div>
 ) : (
 <ul className="space-y-2">
 {[...data.activities]
 .sort((a, b) => a.order - b.order)
 .map((a) => {
 const isEditing = editingActivityId === a.id;
 return (
 <li key={a.id} className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="flex items-center gap-3 px-3 py-2.5">
 <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${a.isPublished ? 'bg-brand-soft text-brand' : 'bg-base-200 text-muted'}`}>
 <FiLayers aria-hidden className="text-xs" />
 </span>
 <span className="min-w-0 grow">
 <span className="flex flex-wrap items-center gap-2">
 <span className="truncate text-xs font-medium leading-tight">{a.title}</span>
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px]">{humanize(a.type)}</span>
 {a.isPublished ? (
 <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">Published</span>
 ) : (
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-muted">Draft</span>
 )}
 </span>
 {a.instructions ? (
 <span className="mt-0.5 line-clamp-1 block text-[11px] text-muted">{a.instructions}</span>
 ) : null}
 <span className="text-[11px] text-muted">Order {a.order}</span>
 </span>
 <span className="flex shrink-0 items-center gap-1">
 <button
 type="button"
 onClick={() => (isEditing ? setEditingActivityId(null) : startEditActivity(a))}
 className="btn btn-ghost btn-xs btn-circle"
 aria-label={isEditing ? 'Cancel edit' : `Edit ${a.title}`}
 >
 {isEditing ? <FiX aria-hidden /> : <FiEdit2 aria-hidden />}
 </button>
 <button
 type="button"
 onClick={() => {
 if (!confirm(`Delete "${a.title}"?`)) return;
 void onRun(() => import('../../lib/services').then((s) => s.deleteActivity(a.id)), 'Could not delete the activity.', onSaved);
 }}
 className="btn btn-ghost btn-xs btn-circle text-coral"
 aria-label={`Delete ${a.title}`}
 >
 <FiTrash2 aria-hidden />
 </button>
 </span>
 </div>

 {isEditing ? (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setEditingActivityId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () =>
 import('../../lib/services').then((s) =>
 s.updateActivity(a.id, {
 title: activityDraft.title.trim(),
 type: activityDraft.type,
 instructions: activityDraft.instructions.trim() || null,
 isPublished: activityDraft.isPublished,
 }),
 ),
 'Could not save the activity.',
 () => {
 setEditingActivityId(null);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setEditingActivityId(null)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-sun text-white">
 <FiLayers aria-hidden />
 </span>
 Edit activity
 </h4>
 <p className="mt-1 text-xs text-muted">Update instructions or publish state for this practice task.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={activityDraft.title} onChange={(e) => { const v = e.currentTarget.value; setActivityDraft((f) => ({ ...f, title: v })) }} className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select value={activityDraft.type} onChange={(e) => { const v = e.currentTarget.value; setActivityDraft((f) => ({ ...f, type: v })) }} className="select select w-full rounded-field border-line bg-base-100">
 {ACTIVITY_TYPES.map((t) => (
 <option key={t.value} value={t.value}>
 {t.label}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1 mt-3 block text-xs font-medium">Instructions</span>
 <input value={activityDraft.instructions} onChange={(e) => { const v = e.currentTarget.value; setActivityDraft((f) => ({ ...f, instructions: v })) }} placeholder="What should the student do?" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="mt-3 flex items-center gap-2 text-xs font-medium">
 <input type="checkbox" className="checkbox checkbox-xs" checked={activityDraft.isPublished} onChange={(e) => { const v = e.currentTarget.checked; setActivityDraft((f) => ({ ...f, isPublished: v })) }} />
 Published — visible to students
 </label>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setEditingActivityId(null)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />} Save changes
  </button>
 </div>
 </form>
 </div>
 ) : null}
 </li>
 );
 })}
 </ul>
 )}

           <button type="button" onClick={() => setShowAddActivity(true)} className="mt-4 btn btn-sm gap-2 rounded-full border border-dashed border-sun bg-[#fffbeb] text-[#8A6800] hover:bg-sun hover:text-white">
             <FiPlus aria-hidden /> Add practice activity
           </button>

 {showAddActivity ? (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setShowAddActivity(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () => {
 const { backendType, config } = buildActivityConfig(activityForm.type, activityQ, activityForm.instructions.trim() || '');
 return createActivity(lessonId, {
 title: activityForm.title.trim(),
 type: backendType,
 instructions: activityForm.instructions.trim() || undefined,
 isPublished: true,
 config,
 });
 },
 'Could not add the activity.',
 () => {
 setActivityForm({ title: '', type: 'MCQ', instructions: '' });
 setShowAddActivity(false);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setShowAddActivity(false)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-sun text-white">
 <FiLayers aria-hidden />
 </span>
 Add practice activity
 </h4>
 <p className="mt-1 text-xs text-muted">A task students complete and submit — you grade it or it auto-grades.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={activityForm.title} onChange={(e) => { const v = e.currentTarget.value; setActivityForm((f) => ({ ...f, title: v })) }} placeholder="e.g. Greetings Quiz" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select
 value={activityForm.type}
 onChange={(e) => {
 const v = e.currentTarget.value;
 setActivityForm((f) => ({ ...f, type: v }));
 if (v === 'MCQ') setActivityQ({ kind: 'MCQ', question: '', options: ['', '', '', ''], correctIndex: 0 });
 else if (v === 'FILL_BLANK') setActivityQ({ kind: 'FILL_BLANK', sentence: '', answer: '' });
 else if (v === 'TRUE_FALSE') setActivityQ({ kind: 'TRUE_FALSE', statement: '', correct: true });
 else if (v === 'WRITING') setActivityQ({ kind: 'WRITING', prompt: '', minWords: '' });
 else if (v === 'DOCUMENT') setActivityQ({ kind: 'DOCUMENT', prompt: '', allowedTypes: 'pdf,docx' });
 }}
 className="select select w-full rounded-field border-line bg-base-100"
 >
 {ACTIVITY_TYPES.map((t) => (
 <option key={t.value} value={t.value}>
 {t.label}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1 mt-3 block text-xs font-medium">Instructions</span>
 <input value={activityForm.instructions} onChange={(e) => { const v = e.currentTarget.value; setActivityForm((f) => ({ ...f, instructions: v })) }} placeholder="What should students do?" className="input input w-full rounded-field border-line bg-base-100" />
 </label>

 <div className="rounded-box border border-line bg-base-200/30 p-3">
 <p className="text-xs font-semibold">Question details</p>
 {activityQ.kind === 'MCQ' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Question</span>
 <input value={activityQ.question} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, question: v })); }} placeholder="e.g. What is 'hello' in German?" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <div className="grid gap-2 sm:grid-cols-2">
 {activityQ.options.map((opt, idx) => (
 <label key={idx} className="block">
 <span className="mb-1 block text-[11px] font-medium">Option {idx + 1}</span>
 <input value={opt} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, options: (prev as Extract<ActivityQuestion, { kind: 'MCQ' }>).options.map((o: string, i: number) => (i === idx ? v : o)) } as ActivityQuestion)); }} placeholder={`Option ${idx + 1}`} className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 ))}
 </div>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Correct option (1-4)</span>
 <select value={String(activityQ.correctIndex + 1)} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, correctIndex: Math.max(0, Number(v) - 1) })); }} className="select select w-full rounded-field border-line bg-base-100">
 <option value="1">1</option>
 <option value="2">2</option>
 <option value="3">3</option>
 <option value="4">4</option>
 </select>
 </label>
 </div>
 ) : activityQ.kind === 'FILL_BLANK' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Sentence (use ___ for blank)</span>
 <input value={activityQ.sentence} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, sentence: v })); }} placeholder="e.g. Ich ___ Deutsch." className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Correct answer</span>
 <input value={activityQ.answer} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, answer: v })); }} placeholder="e.g. lerne" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 </div>
 ) : activityQ.kind === 'TRUE_FALSE' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Statement</span>
 <input value={activityQ.statement} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, statement: v })); }} placeholder="e.g. Berlin is the capital of Germany." className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Correct answer</span>
 <select value={activityQ.correct ? 'true' : 'false'} onChange={(e) => { const v = e.currentTarget.value === 'true'; setActivityQ((prev) => ({ ...prev, correct: v })); }} className="select select w-full rounded-field border-line bg-base-100">
 <option value="true">True</option>
 <option value="false">False</option>
 </select>
 </label>
 </div>
 ) : activityQ.kind === 'WRITING' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Writing prompt</span>
 <textarea value={activityQ.prompt} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, prompt: v })); }} placeholder="e.g. Write 100 words about your family..." rows={2} className="textarea w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Minimum words (optional)</span>
 <input value={activityQ.minWords} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, minWords: v })); }} placeholder="e.g. 100" inputMode="numeric" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 </div>
 ) : (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Document prompt</span>
 <textarea value={activityQ.prompt} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, prompt: v })); }} placeholder="e.g. Upload your handwritten letter..." rows={2} className="textarea w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Allowed file types</span>
 <input value={activityQ.allowedTypes} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, allowedTypes: v })); }} placeholder="e.g. pdf,docx,jpg" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 </div>
 )}
 </div>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setShowAddActivity(false)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add activity
  </button>
 </div>
 </form>
 </div>
 ) : null}
 </div>
 </div>
 </div>
 );
}
