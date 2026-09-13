import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { Panel, SectionHeader } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
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
  uploadFile,
} from '../../lib/services';
import type { LevelItem } from '../../lib/services';

const CONTENT_TYPES = ['TEXT', 'VIDEO', 'AUDIO', 'PDF', 'MIXED'] as const;
const MATERIAL_TYPES = ['NOTE', 'PDF', 'VIDEO', 'AUDIO', 'LINK', 'WORKSHEET', 'SLIDE', 'OTHER'] as const;
const ACTIVITY_TYPES = [
  'VOCABULARY',
  'MATCHING',
  'FILL_BLANK',
  'ORDERING',
  'MCQ',
  'MULTIPLE_SELECT',
  'TRUE_FALSE',
  'LISTENING',
  'READING',
  'WRITING',
  'SPEAKING',
  'PRONUNCIATION',
  'FLASHCARD',
] as const;

type CurriculumManagerProps = {
  levels: LevelItem[];
  canCreateLevel: boolean;
  onLevelsChanged?: () => void;
};

/**
 * Shared Level → Module → Lesson → Material/Activity authoring surface.
 * The API enforces that teachers only touch levels they teach; this component
 * is given the levels a role may manage.
 */
export function CurriculumManager({ levels, canCreateLevel, onLevelsChanged }: CurriculumManagerProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const modules = useApi(
    `level-modules-${selectedLevelId ?? 'none'}`,
    () => listLevelModules(selectedLevelId ?? ''),
    selectedLevelId !== null,
  );
  const lesson = useApi(
    `lesson-${selectedLessonId ?? 'none'}`,
    () => getLesson(selectedLessonId ?? ''),
    selectedLessonId !== null,
  );

  const [levelForm, setLevelForm] = useState({ code: '', title: '', levelLabel: '', defaultFee: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', order: '0' });
  const [lessonForm, setLessonForm] = useState({ title: '', order: '0', contentType: 'TEXT' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'NOTE', url: '' });
  const [activityForm, setActivityForm] = useState({ title: '', type: 'MCQ', instructions: '' });

  // Lesson editor state, seeded from the loaded lesson.
  const [edit, setEdit] = useState({
    title: '',
    contentType: 'TEXT',
    body: '',
    videoUrl: '',
    audioUrl: '',
    estimatedMinutes: '',
    isPublished: true,
  });
  useEffect(() => {
    const data = lesson.data;
    if (!data) return;
    setEdit({
      title: data.title,
      contentType: data.contentType,
      body: data.body ?? '',
      videoUrl: data.videoUrl ?? '',
      audioUrl: data.audioUrl ?? '',
      estimatedMinutes: data.estimatedMinutes != null ? String(data.estimatedMinutes) : '',
      isPublished: data.isPublished,
    });
  }, [lesson.data]);

  function pickLevel(id: string) {
    setSelectedLevelId(id);
    setSelectedModuleId(null);
    setSelectedLessonId(null);
    setError(null);
  }

  async function run(action: () => Promise<unknown>, fallback: string, after?: () => void) {
    setError(null);
    setBusy(true);
    try {
      await action();
      after?.();
    } catch (err) {
      setError(apiErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateLevel(event: FormEvent) {
    event.preventDefault();
    await run(
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
  }

  const currentLevel = levels.find((level) => level.id === selectedLevelId) ?? null;
  const currentModule = (modules.data ?? []).find((m) => m.id === selectedModuleId) ?? null;

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {/* Levels + modules */}
      <div className="space-y-5">
        <Panel>
          <SectionHeader title="Levels" />
          {levels.length === 0 ? (
            <EmptyBlock
              title="No levels assigned"
              hint={canCreateLevel ? 'Create the first level below.' : 'You can author content once you are assigned a class.'}
            />
          ) : (
            <ul className="space-y-2">
              {levels.map((level) => (
                <li key={level.id}>
                  <button
                    type="button"
                    onClick={() => pickLevel(level.id)}
                    className={`w-full rounded-field p-3 text-left transition-colors ${
                      selectedLevelId === level.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                    }`}
                  >
                    <span className="block text-xs font-semibold">
                      {level.code} · {level.title}
                    </span>
                    <span className="block text-[11px] text-muted">{level.levelLabel}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {canCreateLevel ? (
            <form onSubmit={handleCreateLevel} className="mt-4 space-y-2 border-t border-line pt-4">
              <p className="text-xs font-semibold">New level</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input required value={levelForm.code} onChange={(e) => setLevelForm((f) => ({ ...f, code: e.target.value }))} placeholder="Code (A1)" className="input input-sm w-full rounded-field border-line bg-base-200" />
                <input required value={levelForm.levelLabel} onChange={(e) => setLevelForm((f) => ({ ...f, levelLabel: e.target.value }))} placeholder="Label (Beginner)" className="input input-sm w-full rounded-field border-line bg-base-200" />
              </div>
              <input required value={levelForm.title} onChange={(e) => setLevelForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="input input-sm w-full rounded-field border-line bg-base-200" />
              <input value={levelForm.defaultFee} onChange={(e) => setLevelForm((f) => ({ ...f, defaultFee: e.target.value }))} inputMode="numeric" placeholder="Default fee (RWF)" className="input input-sm w-full rounded-field border-line bg-base-200" />
              <button type="submit" disabled={busy} className="btn btn-sm w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
                Create level
              </button>
            </form>
          ) : null}
        </Panel>

        <Panel>
          <SectionHeader title={currentLevel ? `Modules · ${currentLevel.code}` : 'Modules'} />
          {!selectedLevelId ? (
            <EmptyBlock title="Select a level" hint="Choose a level to see and edit its modules." />
          ) : modules.loading ? (
            <LoadingBlock label="Loading modules…" />
          ) : modules.error ? (
            <ErrorBlock message={modules.error} onRetry={modules.refetch} />
          ) : (modules.data ?? []).length === 0 ? (
            <EmptyBlock title="No modules yet" hint="Add the first module below." />
          ) : (
            <ul className="space-y-2">
              {(modules.data ?? []).map((module) => (
                <li key={module.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModuleId(module.id);
                      setSelectedLessonId(null);
                    }}
                    className={`w-full rounded-field p-3 text-left transition-colors ${
                      selectedModuleId === module.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{module.title}</span>
                    <span className="block text-[11px] text-muted">
                      Order {module.order} · {module.lessons.length} lesson(s)
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedLevelId ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedLevelId) return;
                void run(
                  () => createModule(selectedLevelId, { title: moduleForm.title.trim(), order: Number(moduleForm.order) || 0, isPublished: true }),
                  'Could not create the module.',
                  () => {
                    setModuleForm({ title: '', order: '0' });
                    modules.refetch();
                  },
                );
              }}
              className="mt-4 space-y-2 border-t border-line pt-4"
            >
              <p className="text-xs font-semibold">New module</p>
              <input required value={moduleForm.title} onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))} placeholder="Module title" className="input input-sm w-full rounded-field border-line bg-base-200" />
              <input value={moduleForm.order} onChange={(e) => setModuleForm((f) => ({ ...f, order: e.target.value }))} inputMode="numeric" placeholder="Order" className="input input-sm w-full rounded-field border-line bg-base-200" />
              <button type="submit" disabled={busy} className="btn btn-sm w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
                Create module
              </button>
            </form>
          ) : null}
        </Panel>
      </div>

      {/* Lessons */}
      <Panel>
        <SectionHeader title={currentModule ? `Lessons · ${currentModule.title}` : 'Lessons'} />
        {!selectedModuleId ? (
          <EmptyBlock title="Select a module" hint="Choose a module to manage its lessons." />
        ) : (
          <>
            <ul className="space-y-2">
              {currentModule?.lessons.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLessonId(item.id)}
                    className={`w-full rounded-field p-3 text-left transition-colors ${
                      selectedLessonId === item.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold">{item.title}</span>
                      <StatusBadge status={item.isPublished ? 'Active' : 'Pending'} />
                    </span>
                    <span className="block text-[11px] text-muted">
                      {humanize(item.contentType)} · Order {item.order}
                    </span>
                  </button>
                </li>
              ))}
              {currentModule && currentModule.lessons.length === 0 ? (
                <li className="text-xs text-muted">No lessons yet — add one below.</li>
              ) : null}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedModuleId) return;
                void run(
                  () => createLesson(selectedModuleId, { title: lessonForm.title.trim(), order: Number(lessonForm.order) || 0, contentType: lessonForm.contentType, isPublished: true }),
                  'Could not create the lesson.',
                  () => {
                    setLessonForm({ title: '', order: '0', contentType: 'TEXT' });
                    modules.refetch();
                  },
                );
              }}
              className="mt-4 space-y-2 border-t border-line pt-4"
            >
              <p className="text-xs font-semibold">New lesson</p>
              <input required value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} placeholder="Lesson title" className="input input-sm w-full rounded-field border-line bg-base-200" />
              <div className="grid grid-cols-2 gap-2">
                <select value={lessonForm.contentType} onChange={(e) => setLessonForm((f) => ({ ...f, contentType: e.target.value }))} className="select select-sm w-full rounded-field border-line bg-base-200" aria-label="Content type">
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {humanize(type)}
                    </option>
                  ))}
                </select>
                <input value={lessonForm.order} onChange={(e) => setLessonForm((f) => ({ ...f, order: e.target.value }))} inputMode="numeric" placeholder="Order" className="input input-sm w-full rounded-field border-line bg-base-200" />
              </div>
              <button type="submit" disabled={busy} className="btn btn-sm w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
                Create lesson
              </button>
            </form>
          </>
        )}
      </Panel>

      {/* Lesson editor */}
      <Panel>
        <SectionHeader title="Lesson content" />
        {error ? (
          <p role="alert" className="mb-3 text-xs font-medium text-error">
            {error}
          </p>
        ) : null}
        {!selectedLessonId ? (
          <EmptyBlock title="Select a lesson" hint="Edit notes, media, materials and activities here." />
        ) : lesson.loading ? (
          <LoadingBlock label="Loading lesson…" />
        ) : lesson.error || !lesson.data ? (
          <ErrorBlock message={lesson.error ?? 'Could not load this lesson.'} onRetry={lesson.refetch} />
        ) : (
          <div className="space-y-4">
            <input value={edit.title} onChange={(e) => setEdit((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <div className="grid grid-cols-2 gap-2">
              <select value={edit.contentType} onChange={(e) => setEdit((f) => ({ ...f, contentType: e.target.value }))} className="select select-sm w-full rounded-field border-line bg-base-200" aria-label="Content type">
                {CONTENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {humanize(type)}
                  </option>
                ))}
              </select>
              <input value={edit.estimatedMinutes} onChange={(e) => setEdit((f) => ({ ...f, estimatedMinutes: e.target.value }))} inputMode="numeric" placeholder="Minutes" className="input input-sm w-full rounded-field border-line bg-base-200" />
            </div>
            <textarea value={edit.body} onChange={(e) => setEdit((f) => ({ ...f, body: e.target.value }))} placeholder="Lesson notes / body" rows={4} className="textarea w-full rounded-field border-line bg-base-200" />
            <input value={edit.videoUrl} onChange={(e) => setEdit((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="Video URL" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input value={edit.audioUrl} onChange={(e) => setEdit((f) => ({ ...f, audioUrl: e.target.value }))} placeholder="Audio URL" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <label className="flex items-center gap-2 text-xs font-medium">
              <input type="checkbox" className="checkbox checkbox-sm" checked={edit.isPublished} onChange={(e) => setEdit((f) => ({ ...f, isPublished: e.target.checked }))} />
              Published
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(
                    () =>
                      updateLesson(selectedLessonId, {
                        title: edit.title.trim(),
                        contentType: edit.contentType,
                        body: edit.body.trim() || null,
                        videoUrl: edit.videoUrl.trim() || null,
                        audioUrl: edit.audioUrl.trim() || null,
                        estimatedMinutes: edit.estimatedMinutes ? Number(edit.estimatedMinutes) : null,
                        isPublished: edit.isPublished,
                      }),
                    'Could not save the lesson.',
                    () => {
                      lesson.refetch();
                      modules.refetch();
                    },
                  )
                }
                className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
              >
                Save lesson
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(
                    () => deleteLesson(selectedLessonId),
                    'Could not delete the lesson.',
                    () => {
                      setSelectedLessonId(null);
                      modules.refetch();
                    },
                  )
                }
                className="btn btn-sm gap-1 rounded-full border-0 bg-coral text-white hover:bg-coral/90 disabled:opacity-60"
              >
                <FiTrash2 aria-hidden />
                Delete
              </button>
            </div>

            {/* Materials */}
            <div className="border-t border-line pt-4">
              <p className="text-xs font-semibold">Materials ({lesson.data.materials.length})</p>
              <ul className="mt-2 space-y-1">
                {lesson.data.materials.map((material) => (
                  <li key={material.id} className="flex items-center justify-between gap-2 rounded-field bg-base-200 px-3 py-1.5 text-[11px]">
                    <span className="truncate">{material.title}</span>
                    <span className="shrink-0 text-muted">{humanize(material.type)}</span>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedLessonId) return;
                  void run(
                    () => createMaterial(selectedLessonId, { title: materialForm.title.trim(), type: materialForm.type, url: materialForm.url.trim() || undefined, isDownloadable: true }),
                    'Could not add the material.',
                    () => {
                      setMaterialForm({ title: '', type: 'NOTE', url: '' });
                      lesson.refetch();
                    },
                  );
                }}
                className="mt-2 space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input required value={materialForm.title} onChange={(e) => setMaterialForm((f) => ({ ...f, title: e.target.value }))} placeholder="Material title" className="input input-sm w-full rounded-field border-line bg-base-200" />
                  <select value={materialForm.type} onChange={(e) => setMaterialForm((f) => ({ ...f, type: e.target.value }))} className="select select-sm w-full rounded-field border-line bg-base-200" aria-label="Material type">
                    {MATERIAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {humanize(type)}
                      </option>
                    ))}
                  </select>
                </div>
                <input value={materialForm.url} onChange={(e) => setMaterialForm((f) => ({ ...f, url: e.target.value }))} placeholder="URL (or upload below)" className="input input-sm w-full rounded-field border-line bg-base-200" />
                <div className="flex items-center gap-2">
                  <label className="btn btn-xs rounded-full border-line bg-base-100">
                    Upload file
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void run(
                          async () => {
                            const result = await uploadFile(file);
                            setMaterialForm((f) => ({ ...f, url: result.url }));
                          },
                          'Could not upload the file.',
                        );
                      }}
                    />
                  </label>
                  <button type="submit" disabled={busy} className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
                    Add material
                  </button>
                </div>
              </form>
            </div>

            {/* Activities */}
            <div className="border-t border-line pt-4">
              <p className="text-xs font-semibold">Activities ({lesson.data.activities.length})</p>
              <ul className="mt-2 space-y-1">
                {lesson.data.activities.map((activity) => (
                  <li key={activity.id} className="flex items-center justify-between gap-2 rounded-field bg-base-200 px-3 py-1.5 text-[11px]">
                    <span className="truncate">{activity.title}</span>
                    <span className="shrink-0 text-muted">{humanize(activity.type)}</span>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedLessonId) return;
                  void run(
                    () => createActivity(selectedLessonId, { title: activityForm.title.trim(), type: activityForm.type, instructions: activityForm.instructions.trim() || undefined, isPublished: true }),
                    'Could not add the activity.',
                    () => {
                      setActivityForm({ title: '', type: 'MCQ', instructions: '' });
                      lesson.refetch();
                    },
                  );
                }}
                className="mt-2 space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input required value={activityForm.title} onChange={(e) => setActivityForm((f) => ({ ...f, title: e.target.value }))} placeholder="Activity title" className="input input-sm w-full rounded-field border-line bg-base-200" />
                  <select value={activityForm.type} onChange={(e) => setActivityForm((f) => ({ ...f, type: e.target.value }))} className="select select-sm w-full rounded-field border-line bg-base-200" aria-label="Activity type">
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {humanize(type)}
                      </option>
                    ))}
                  </select>
                </div>
                <input value={activityForm.instructions} onChange={(e) => setActivityForm((f) => ({ ...f, instructions: e.target.value }))} placeholder="Instructions (optional)" className="input input-sm w-full rounded-field border-line bg-base-200" />
                <button type="submit" disabled={busy} className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
                  Add activity
                </button>
              </form>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
