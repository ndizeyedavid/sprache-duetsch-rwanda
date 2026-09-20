import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiFilm,
  FiLayers,
  FiMusic,
} from "react-icons/fi";
import { ProgressBar } from "../ui/ProgressBar";
import { humanize } from "../../lib/services";
import type { MyCourse } from "../../lib/services";

function contentIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return FiFilm;
    case "AUDIO":
      return FiMusic;
    case "PDF":
      return FiFileText;
    case "MIXED":
      return FiLayers;
    default:
      return FiBookOpen;
  }
}

type Props = {
  course: MyCourse;
  slug: string;
  activeLessonId: string | null;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (id: string) => void;
};

export function CourseSidebar({
  course,
  slug,
  activeLessonId,
  collapsed,
  onToggle,
  onSelect,
}: Props) {
  return (
    <nav aria-label="Course content" className="space-y-3">
      <div className="rounded-box border border-line bg-base-100 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
          {course.level.code} · {course.level.levelLabel}
        </p>
        <Link
          to={`/courses/${slug.toLowerCase()}`}
          className="mt-1 block text-sm font-bold leading-tight hover:text-brand hover:underline"
        >
          {course.level.title}
        </Link>
        <div className="mt-2">
          <ProgressBar value={course.stats.completionPercentage} tone="brand" />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {course.stats.completedLessons}/{course.stats.totalLessons} lessons ·{" "}
          {course.stats.completionPercentage}%
        </p>
      </div>
      {course.modules
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((mod) => {
          const done = mod.lessons.filter(
            (l) => l.progressStatus === "COMPLETED",
          ).length;
          const isCollapsed = collapsed.has(mod.id);
          const lessons = [...mod.lessons].sort((a, b) => a.order - b.order);
          return (
            <div
              key={mod.id}
              className="overflow-hidden rounded-box border border-line bg-base-100"
            >
              <button
                type="button"
                onClick={() => onToggle(mod.id)}
                className="flex w-full items-center gap-2 bg-base-200 px-3 py-2.5 text-left"
              >
                <span className="min-w-0 grow">
                  <span className="block truncate text-xs font-bold leading-tight">
                    {mod.title}
                  </span>
                  <span className="block text-[11px] text-muted">
                    {done}/{lessons.length} ·{" "}
                    {mod.description?.slice(0, 40) ?? ""}
                  </span>
                </span>
                {isCollapsed ? (
                  <FiChevronDown aria-hidden className="text-muted" />
                ) : (
                  <FiChevronUp aria-hidden className="text-muted" />
                )}
              </button>
              {!isCollapsed ? (
                <ul className="divide-y divide-line">
                  {lessons.map((lesson) => {
                    const Icon = contentIcon(lesson.contentType);
                    const active = lesson.id === activeLessonId;
                    const Row = (
                      <>
                        <span
                          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs ${active || lesson.progressStatus === "COMPLETED" ? "bg-brand text-white" : "bg-base-200 text-muted"}`}
                        >
                          {lesson.progressStatus === "COMPLETED" ? (
                            <FiCheckCircle aria-hidden />
                          ) : (
                            <Icon aria-hidden />
                          )}
                        </span>
                        <span className="min-w-0 grow">
                          <span
                            className={`block truncate text-xs font-medium leading-tight ${active ? "text-brand" : ""}`}
                          >
                            {lesson.title}
                          </span>
                          <span
                            className={`block text-[11px] ${active ? "text-brand/70" : "text-muted"}`}
                          >
                            {humanize(lesson.contentType)} ·{" "}
                            {lesson.progressStatus === "COMPLETED"
                              ? "Completed"
                              : lesson.progressStatus === "IN_PROGRESS"
                                ? "In progress"
                                : `${lesson.estimatedMinutes ?? ""} min`}
                          </span>
                        </span>
                        <span
                          className={`hidden size-2 shrink-0 rounded-full ${lesson.progressStatus === "COMPLETED" ? "bg-brand" : lesson.progressStatus === "IN_PROGRESS" ? "bg-sun" : "bg-base-300"}`}
                          aria-hidden
                        />
                      </>
                    );
                    return (
                      <li key={lesson.id}>
                        {onSelect ? (
                          <button
                            type="button"
                            onClick={() => onSelect(lesson.id)}
                            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition ${active ? "bg-brand-soft text-brand border-l-4 border-brand" : "hover:bg-base-200/60 border-l-4 border-transparent"}`}
                          >
                            {Row}
                          </button>
                        ) : (
                          <Link
                            to={`/courses/${slug}/learn/${lesson.id}`}
                            className={`flex items-center gap-2 px-3 py-2.5 text-left transition ${active ? "bg-brand-soft text-brand border-l-4 border-brand" : "hover:bg-base-200/60 border-l-4 border-transparent"}`}
                          >
                            {Row}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                  {lessons.length === 0 ? (
                    <li className="px-3 py-4 text-center text-xs text-muted">
                      No lessons yet
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          );
        })}
    </nav>
  );
}
