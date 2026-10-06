import { FiArrowRight,FiBookOpen,FiEdit2,FiPlus } from 'react-icons/fi';
import type { ModuleItem } from '../../lib/services';

type Props = { modules: ModuleItem[]; onOpen: (id: string) => void; onCreate: () => void; onEdit: (module: ModuleItem) => void };
export function CourseStudioOverview({ modules, onOpen, onCreate, onEdit }: Props) {
  return <section aria-label="Course modules">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Your modules <span className="ml-2 text-sm font-normal text-base-content/50">{modules.length}</span></h2>
      <button className="btn btn-sm border-0" onClick={onCreate}><FiPlus aria-hidden />New module</button></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module, index) => <article key={module.id} className="card bg-base-100 p-5">
        <div className="mb-6 flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-box bg-neutral text-lg font-semibold text-neutral-content">{String(index + 1).padStart(2, '0')}</span>
          <span className={`rounded-full px-3 py-1 text-xs ${module.isPublished ? 'bg-success/15 text-base-content' : 'bg-base-200 text-base-content/60'}`}>{module.isPublished ? 'Published' : 'Draft'}</span></div>
        <h3 className="text-base font-semibold leading-6">{module.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-xs text-base-content/60"><FiBookOpen aria-hidden />{module.lessons.length} lessons · {module.lessons.filter(item => item.isPublished).length} published</p>
        <div className="mt-auto flex gap-2 pt-6"><button className="btn btn-sm grow justify-between border-0 bg-base-200" onClick={() => onOpen(module.id)}>Open module<FiArrowRight aria-hidden /></button>
          <button className="btn btn-sm btn-square btn-ghost" aria-label={`Edit module ${module.title}`} onClick={() => onEdit(module)}><FiEdit2 aria-hidden /></button></div>
      </article>)}
      {!modules.length ? <div className="card col-span-full items-center bg-base-100 px-6 py-12 text-center"><img src="/illustrations/study-books.webp" alt="" width={120} height={100} className="mb-5 h-24 object-contain"/><h3 className="text-xl font-semibold">A fresh start for your course</h3><p className="mt-2 text-sm text-base-content/60">Group your first lessons into a module.</p><button className="btn mt-5" onClick={onCreate}><FiPlus aria-hidden />Create a module</button></div> : null}
    </div>
  </section>;
}
