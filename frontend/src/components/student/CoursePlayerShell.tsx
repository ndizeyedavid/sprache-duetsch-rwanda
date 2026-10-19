import { useState } from 'react';
import { FiMenu,FiX } from 'react-icons/fi';
import type { MyCourse } from '../../lib/services';
import { CourseSidebar } from './CourseSidebar';
import { CoursebookResource } from './coursebook/CoursebookResource';

type Props = {
  course: MyCourse;
  slug: string;
  activeLessonId: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  onSelect?: (id: string) => void;
};

export function CoursePlayerShell({ course, slug, activeLessonId, header, children, onSelect }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return (
    <div className="flex min-h-[70vh] min-w-0 flex-col gap-3 xl:flex-row roomy:gap-4">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 xl:block roomy:w-[17.5rem]">
        <div className="sticky top-24 max-h-[calc(100dvh-6.75rem)] overflow-y-auto pr-1 scrollbar-slim">
          <CourseSidebar course={course} slug={slug} activeLessonId={activeLessonId} collapsed={collapsed} onToggle={toggle} onSelect={onSelect} />
        </div>
      </aside>
      {/* Mobile drawer toggle */}
      <div className="flex min-w-0 items-center gap-2 xl:hidden">
        <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-course-guide" onClick={() => setMobileOpen((v) => !v)} className="btn btn-sm shrink-0 gap-2 rounded-full border-line bg-base-100">
          {mobileOpen ? <FiX aria-hidden /> : <FiMenu aria-hidden />} {mobileOpen ? 'Hide guide' : 'Course guide'}
        </button>
        <span className="truncate text-xs text-muted">{course.level.code} · {course.level.title}</span>
      </div>
      {mobileOpen ? (
        <div id="mobile-course-guide" className="max-h-[60dvh] overflow-y-auto scrollbar-slim xl:hidden">
          <CourseSidebar course={course} slug={slug} activeLessonId={activeLessonId} collapsed={collapsed} onToggle={toggle} onSelect={onSelect ? (id) => { onSelect(id); setMobileOpen(false); } : undefined} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {header ? <div className="mb-3">{header}</div> : null}
        <div className="mb-3"><CoursebookResource key={course.level.id} levelId={course.level.id} /></div>
        {children}
      </div>
    </div>
  );
}
