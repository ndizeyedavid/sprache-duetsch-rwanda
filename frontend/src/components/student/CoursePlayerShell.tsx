import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { CourseSidebar } from './CourseSidebar';
import type { MyCourse } from '../../lib/services';

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
    <div className="flex min-h-[70vh] flex-col gap-4 lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-[320px] shrink-0 lg:block">
        <div className="sticky top-[68px] max-h-[calc(100vh-76px)] overflow-y-auto pr-1 scrollbar-thin">
          <CourseSidebar course={course} slug={slug} activeLessonId={activeLessonId} collapsed={collapsed} onToggle={toggle} onSelect={onSelect} />
        </div>
      </aside>
      {/* Mobile drawer toggle */}
      <div className="flex items-center gap-2 lg:hidden">
        <button type="button" onClick={() => setMobileOpen((v) => !v)} className="btn btn-sm gap-2 rounded-full border-line bg-base-100">
          {mobileOpen ? <FiX aria-hidden /> : <FiMenu aria-hidden />} {mobileOpen ? 'Hide' : 'Contents'}
        </button>
        <span className="truncate text-xs text-muted">{course.level.code} · {course.level.title}</span>
      </div>
      {mobileOpen ? (
        <div className="lg:hidden">
          <CourseSidebar course={course} slug={slug} activeLessonId={activeLessonId} collapsed={collapsed} onToggle={toggle} onSelect={onSelect} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {header ? <div className="mb-3">{header}</div> : null}
        {children}
      </div>
    </div>
  );
}
