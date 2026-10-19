import { FiArchive,FiPlus } from 'react-icons/fi';
import type { ModuleItem } from '../../lib/services';
import { ModuleCard } from './module-card/ModuleCard';
import { isArchived,moduleStats } from './module-card/module-stats';

type Props = { modules: ModuleItem[]; onOpen: (id: string) => void; onCreate: () => void; onEdit: (module: ModuleItem) => void };

const pad = (value: number) => String(value).padStart(2, '0');

/** Course studio home: one chapter card per module, archived seed modules tucked away below. */
export function CourseStudioOverview({ modules, onOpen, onCreate, onEdit }: Props) {
  const current = modules.filter((module) => !isArchived(module));
  const archived = modules.filter(isArchived);
  const totals = current.map(moduleStats).reduce((sum, s) => ({ lessons: sum.lessons + s.lessons, published: sum.published + s.published, activities: sum.activities + s.activities }), { lessons: 0, published: 0, activities: 0 });
  return <section aria-label="Course modules" className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Your modules <span className="ml-1 text-sm font-normal text-muted">{current.length}</span></h2>
        <p className="text-xs text-muted">{totals.published}/{totals.lessons} lessons live · {totals.activities} practice activities</p>
      </div>
      <button type="button" className="btn btn-primary btn-sm rounded-full" onClick={onCreate}><FiPlus aria-hidden />New module</button>
    </div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {current.map((module, index) => <ModuleCard key={module.id} module={module} number={pad(index + 1)} onOpen={onOpen} onEdit={onEdit} />)}
      {!current.length ? <div className="card col-span-full items-center bg-base-100 px-6 py-12 text-center"><img src="/illustrations/study-books.webp" alt="" width={120} height={100} className="mb-5 h-24 object-contain"/><h3 className="text-xl font-semibold">A fresh start for your course</h3><p className="mt-2 text-sm text-muted">Group your first lessons into a module.</p><button type="button" className="btn btn-primary mt-5 rounded-full" onClick={onCreate}><FiPlus aria-hidden />Create a module</button></div> : null}
    </div>
    {archived.length ? (
      <details className="rounded-box border border-line bg-base-100">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-3 text-sm font-semibold"><FiArchive aria-hidden className="text-muted" />Archived modules <span className="font-normal text-muted">({archived.length}) — older drafts kept for student history</span></summary>
        <div className="grid gap-5 p-5 pt-2 md:grid-cols-2 xl:grid-cols-3">
          {archived.map((module) => <ModuleCard key={module.id} module={module} number="—" onOpen={onOpen} onEdit={onEdit} />)}
        </div>
      </details>
    ) : null}
  </section>;
}
