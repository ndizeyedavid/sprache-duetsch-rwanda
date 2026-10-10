import { useState } from 'react';
import { FiArrowRight,FiEdit2,FiPlus } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import type { LevelItem,ModuleItem } from '../../lib/services';
import { listLevelModules } from '../../lib/services';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { CourseOutline } from './CourseOutline';
import { CourseStudioOverview } from './CourseStudioOverview';
import { PreparationLesson } from './PreparationLesson';
import { StudioModuleForm } from './StudioModuleForm';
import { StudioNewLesson } from './StudioNewLesson';

export function TeacherCourseWorkspace({ levels, academic = false }: { levels: LevelItem[]; academic?: boolean }) {
  const [params, setParams] = useSearchParams();
  const [dirty, setDirty] = useState(false);
  const [moduleForm, setModuleForm] = useState<ModuleItem | 'new' | null>(null);
  const [newLesson, setNewLesson] = useState<string | null>(null);
  const level = levels.find(item => item.id === params.get('level') || item.code === params.get('level')) ?? levels[0];
  const modules = useApi(`prepare-modules-${level.id}`, () => listLevelModules(level.id));
  const ordered = [...(modules.stale ? [] : modules.data ?? [])].sort((a, b) => a.order - b.order);
  const selected = ordered.flatMap(module => module.lessons).find(lesson => lesson.id === params.get('lesson'));
  const module = ordered.find(item => selected ? item.lessons.some(lesson => lesson.id === selected.id) : item.id === params.get('module'));
  const lessonCount = ordered.reduce((sum, item) => sum + item.lessons.length, 0);
  function navigate(next: Record<string, string>) {
    if (dirty && !confirm('Discard unsaved lesson changes?')) return;
    setDirty(false); setParams(next);
  }
  function select(lesson: string, moduleId: string) {
    if (lesson === selected?.id) return;
    navigate({ level: level.id, module: moduleId, lesson });
  }
  function openModule(id: string) {
    const first = [...(ordered.find(item => item.id === id)?.lessons ?? [])].sort((a,b) => a.order-b.order)[0];
    navigate({ level: level.id, module: id, ...(first ? { lesson: first.id } : {}) });
  }
  const overview = () => navigate({ level: level.id });
  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="mb-1 text-xs font-medium text-base-content/50">{academic ? 'ACADEMIC CURRICULUM' : 'TEACHING WORKSPACE'}</p><h1 className="text-2xl font-semibold">Course studio</h1></div>
      <label className="flex items-center gap-3 text-sm"><span className="text-base-content/60">Course</span>
        <select aria-label="Choose course" className="select max-w-[260px] border-0 bg-base-100" value={level.id} onChange={event => navigate({ level: event.target.value })}>
          {levels.map(item => <option key={item.id} value={item.id}>{item.code} · {item.title}</option>)}
        </select></label>
    </header>
    {modules.loading || modules.stale ? <LoadingBlock label="Loading course…"/> : modules.error ? <ErrorBlock message={modules.error} onRetry={modules.refetch}/> : module ? (
      <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
        <CourseOutline modules={ordered} module={module} selected={selected?.id} busy={false} onSelect={select}
          onModule={openModule} onOverview={overview}
          onAdd={item => { if (!dirty || confirm('Discard unsaved lesson changes?')) { setDirty(false); setParams({level:level.id,module:item.id}); setNewLesson(item.id); } }}/>
        <div className="min-w-0">
          {selected ? <PreparationLesson key={selected.id} id={selected.id} modulePublished={module.isPublished} moduleTitle={module.title}
            onSaved={modules.refetch} onDirty={setDirty} onDeleted={() => { setDirty(false); setParams({ level: level.id, module: module.id }); modules.refetch(); }}/>
            : <section className="card bg-base-100 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-base-content/50">MODULE {ordered.indexOf(module) + 1}</p><h2 className="mt-2 text-2xl font-semibold">{module.title}</h2></div><button className="btn btn-sm btn-square btn-ghost" aria-label="Edit module" onClick={() => setModuleForm(module)}><FiEdit2 aria-hidden/></button></div>
              <p className="mt-3 text-sm text-base-content/60">{module.lessons.length} lessons · {module.isPublished ? 'Published' : 'Draft'}</p>
              <div className="my-10 flex justify-center"><img src="/illustrations/study-books.webp" alt="" width={180} height={150} className="h-36 object-contain"/></div>
              <div className="flex flex-wrap justify-center gap-3">{module.lessons.length ? <button className="btn btn-neutral" onClick={() => select([...module.lessons].sort((a,b)=>a.order-b.order)[0].id, module.id)}>Start preparing<FiArrowRight aria-hidden/></button> : null}<button className="btn border-0" onClick={() => setNewLesson(module.id)}><FiPlus aria-hidden/>New lesson</button></div>
            </section>}
        </div>
      </div>
    ) : <><section className="flex items-center justify-between gap-5 rounded-box bg-neutral px-6 py-6 text-neutral-content sm:px-8">
      <div><p className="text-sm text-neutral-content/60">{level.code} · {lessonCount} lessons</p><h2 className="mt-2 text-xl font-semibold sm:text-2xl">{academic ? level.title : 'Good lessons start here.'}</h2><p className="mt-2 text-sm text-neutral-content/70">{academic ? `${ordered.length} modules · ${lessonCount} lessons` : 'Choose a module and make it your own.'}</p></div>
      <img src="/illustrations/study-books.webp" alt="" width={130} height={110} className="hidden h-28 w-32 object-contain sm:block"/></section>
      <CourseStudioOverview modules={ordered} onOpen={openModule} onCreate={() => setModuleForm('new')} onEdit={setModuleForm}/></>}
    {moduleForm ? <StudioModuleForm levelId={level.id} module={moduleForm === 'new' ? undefined : moduleForm} onClose={() => setModuleForm(null)} onSaved={modules.refetch}/> : null}
    {newLesson ? <StudioNewLesson moduleId={newLesson} onClose={() => setNewLesson(null)} onCreated={id => { setParams({level:level.id,module:newLesson,lesson:id});modules.refetch(); }}/> : null}
  </div>;
}
