import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Panel } from "../ui/Panel";
import { EmptyBlock, LoadingBlock } from "../common/PageState";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage } from "../../lib/api";
import { completeLesson, getStudentLesson, humanize } from "../../lib/services";
import type { MyCourse } from "../../lib/services";
import { LessonDetail } from "./LessonDetail";
import { CoursePlayerShell } from "./CoursePlayerShell";

type Props = { course: MyCourse; slug: string; onProgress?: () => void };

export function HorizontalCourseView({ course, slug, onProgress }: Props) {
  const ordered = useMemo(
    () =>
      course.modules
        .slice()
        .sort((a, b) => a.order - b.order)
        .flatMap((m) =>
          m.lessons
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((l) => ({ ...l, moduleTitle: m.title })),
        ),
    [course],
  );
  const [activeId, setActiveId] = useState<string | null>(
    ordered[0]?.id ?? null,
  );
  useEffect(() => {
    if (!activeId && ordered[0]) setActiveId(ordered[0].id);
    if (activeId && !ordered.some((l) => l.id === activeId))
      setActiveId(ordered[0]?.id ?? null);
  }, [ordered, activeId]);

  const lesson = useApi(
    `lesson-${activeId ?? "none"}`,
    () => getStudentLesson(activeId!),
    Boolean(activeId),
  );
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [localCompleted, setLocalCompleted] = useState(false);
  useEffect(() => {
    setLocalCompleted(false);
    setActionError(null);
  }, [activeId]);

  const idx = ordered.findIndex((l) => l.id === activeId);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;
  const isSwitching =
    lesson.fetching &&
    !!lesson.data &&
    (lesson.data as { id: string }).id !== activeId;

  async function handleComplete() {
    if (!activeId) return;
    setActionError(null);
    setCompleting(true);
    try {
      await completeLesson(activeId);
      setLocalCompleted(true);
      onProgress?.();
    } catch (e) {
      setActionError(apiErrorMessage(e, "Could not save progress."));
    } finally {
      setCompleting(false);
    }
  }

  if (ordered.length === 0)
    return (
      <Panel>
        <EmptyBlock
          title="No lessons yet"
          hint="Lessons will appear here once published."
        />
      </Panel>
    );
  if (!activeId) return <LoadingBlock label="Loading lesson…" />;
  if (lesson.loading) return <LoadingBlock label="Loading lesson…" />;
  if (lesson.error || !lesson.data) {
    const msg = lesson.error ?? "Could not load lesson.";
    const locked = msg.toLowerCase().includes("prerequisite");
    return (
      <Panel>
        <EmptyBlock
          title={locked ? "Lesson locked" : "Lesson unavailable"}
          hint={msg}
        />
      </Panel>
    );
  }

  const rawDetail = lesson.data as unknown as {
    id: string;
    module: { title: string };
    contentType: string;
    estimatedMinutes: number | null;
  };
  const detail = localCompleted
    ? ({ ...(lesson.data as object), progressStatus: "COMPLETED" } as never)
    : (lesson.data as never);
  const currentMeta = ordered.find((l) => l.id === activeId) ?? null;

  return (
    <CoursePlayerShell
      course={course}
      slug={slug}
      activeLessonId={activeId}
      onSelect={setActiveId}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate text-muted">
            {currentMeta?.moduleTitle ??
              (rawDetail as { module: { title: string } }).module.title}{" "}
            · {idx + 1}/{ordered.length} ·{" "}
            {humanize((rawDetail as { contentType: string }).contentType)}
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              disabled={!prev || isSwitching}
              onClick={() => prev && setActiveId(prev.id)}
              className="btn btn-xs btn-circle border-line bg-base-100 disabled:opacity-40"
            >
              <FiChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              disabled={!next || isSwitching}
              onClick={() => next && setActiveId(next.id)}
              className="btn btn-xs btn-circle border-line bg-base-100 disabled:opacity-40"
            >
              <FiChevronRight aria-hidden />
            </button>
          </span>
        </div>
        <Panel className="relative overflow-hidden">
          {isSwitching ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-base-100/70 pt-12 backdrop-blur-[1px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-base-100 px-4 py-2 text-xs font-medium shadow">
                <span
                  className="loading loading-spinner loading-xs text-brand"
                  aria-hidden
                />{" "}
                Loading…
              </span>
            </div>
          ) : null}
          <div
            className={`${isSwitching ? "opacity-50" : "opacity-100"} transition`}
            aria-busy={isSwitching}
          >
            <LessonDetail
              detail={detail}
              slug={slug}
              completing={completing}
              actionError={actionError}
              onComplete={handleComplete}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-line pt-4">
            {prev ? (
              <button
                type="button"
                onClick={() => setActiveId(prev.id)}
                className="btn btn-sm gap-1 rounded-full border-line bg-base-100"
              >
                <FiChevronLeft aria-hidden />
                Previous
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                type="button"
                onClick={() => setActiveId(next.id)}
                data-tip={next.title}
                className="tooltip tooltip-left btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
              >
                Next
                <FiChevronRight aria-hidden />
              </button>
            ) : (
              <Link
                to={`/courses/${slug}`}
                className="btn btn-sm rounded-full border-0 bg-brand text-white"
              >
                Back to course
              </Link>
            )}
          </div>
        </Panel>
      </div>
    </CoursePlayerShell>
  );
}
