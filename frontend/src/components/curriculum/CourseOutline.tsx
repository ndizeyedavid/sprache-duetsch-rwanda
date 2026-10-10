import { FiArrowLeft,FiCheck,FiPlus } from 'react-icons/fi';
import type { ModuleItem } from '../../lib/services';
import { contentIcon } from './utils';

type Props = {
  modules: ModuleItem[]; module: ModuleItem; selected?: string; busy: boolean;
  onSelect: (lesson: string, module: string) => void;
  onModule: (module: string) => void; onOverview: () => void; onAdd: (module: ModuleItem) => void;
};

export function CourseOutline({ modules, module, selected, busy, onSelect, onModule, onOverview, onAdd }: Props) {
  return (
    <>
    <div className="rounded-box bg-base-100 p-4 lg:hidden">
      <div className="mb-3 flex items-center justify-between gap-2"><button className="btn btn-sm btn-ghost" onClick={onOverview}><FiArrowLeft aria-hidden/>All modules</button><button className="btn btn-sm btn-ghost" onClick={() => onAdd(module)} disabled={busy}><FiPlus aria-hidden/>New lesson</button></div>
      <select aria-label="Choose lesson" className="select w-full border-0 bg-base-200" value={selected ?? ''} onChange={event => { const parent = modules.find(item => item.lessons.some(lesson => lesson.id === event.target.value)); if (parent) onSelect(event.target.value, parent.id); }}>
        <option value="" disabled>Choose a lesson</option>
        {modules.map(item => <optgroup key={item.id} label={item.title}>{[...item.lessons].sort((a,b) => a.order-b.order).map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</optgroup>)}
      </select>
    </div>
    <aside className="hidden min-w-0 rounded-box bg-base-100 p-4 lg:sticky lg:top-24 lg:block">
      <button className="btn btn-sm btn-ghost mb-4 justify-start" onClick={onOverview}><FiArrowLeft aria-hidden />All modules</button>
      <label className="block text-xs font-semibold text-base-content/60">
        MODULE
        <select className="select mt-2 w-full bg-base-200 border-0" value={module.id} onChange={event => onModule(event.target.value)}>
          {modules.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.title}</option>)}
        </select>
      </label>
      <div className="mb-3 mt-5 flex items-center justify-between text-xs text-base-content/60">
        <span>{module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}</span><span>{module.isPublished ? 'Module published' : 'Module draft'}</span>
      </div>
      <nav aria-label="Lessons in this module" className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[55vh] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
        {[...module.lessons].sort((a, b) => a.order - b.order).map((lesson, index) => {
          const Icon = contentIcon(lesson.contentType);
          const active = selected === lesson.id;
          return <button key={lesson.id} onClick={() => onSelect(lesson.id, module.id)} aria-current={active ? 'page' : undefined}
            className={`flex w-56 shrink-0 items-center gap-3 rounded-field px-3 py-3 text-left transition lg:w-full ${active ? 'bg-neutral text-neutral-content' : 'hover:bg-base-200'}`}>
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-field ${active ? 'bg-neutral-content/15' : 'bg-base-200'}`}><Icon aria-hidden /></span>
            <span className="min-w-0 grow"><span className="block text-[13px] font-medium leading-5">{lesson.title}</span>
              <span className="mt-1 block text-[11px] opacity-60">Lesson {index + 1}{lesson.estimatedMinutes ? ` · ${lesson.estimatedMinutes} min` : ''}</span></span>
            {lesson.isPublished && module.isPublished ? <FiCheck aria-label="Published" className="shrink-0" /> : null}
          </button>;
        })}
      </nav>
      <button className="btn btn-sm mt-3 w-full border-0 bg-base-200" disabled={busy} onClick={() => onAdd(module)}><FiPlus aria-hidden />New lesson</button>
    </aside>
    </>
  );
}
