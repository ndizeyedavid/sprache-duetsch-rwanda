import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { Pagination } from '../../components/ui/Pagination';
import { CourseCard } from '../../components/cards/CourseCard';
import { courses, popularCategories } from '../../data/mock';

export function Courses() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-5">
      <Panel>
        <SectionHeader title="Popular This Week" action={{ label: 'View all', to: '/courses' }} />
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {popularCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="flex min-w-64 flex-1 items-center gap-3 rounded-field bg-base-200 p-3 text-left transition-colors hover:bg-brand-tint"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-base-100 text-xl">
                {category.emoji}
              </span>
              <span className="min-w-0 grow">
                <span className="block truncate text-sm font-semibold">{category.title}</span>
                <span className="block truncate text-[11px] text-muted">{category.subtitle}</span>
              </span>
              <FiChevronRight className="shrink-0 text-muted" aria-hidden />
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="All Courses" action={{ label: 'View all', to: '/courses' }} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
        <Pagination page={page} pages={3} from={1} to={6} total={100} onChange={setPage} />
      </Panel>
    </div>
  );
}
