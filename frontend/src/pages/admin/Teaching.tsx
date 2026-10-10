import { useMemo,useState } from 'react';
import { EmptyBlock,ErrorBlock } from '../../components/common/PageState';
import { ClassRoster } from '../../components/teaching/ClassRoster';
import { StepHeader } from '../../components/teaching/StepHeader';
import { TeacherLevelsCard } from '../../components/teaching/TeacherLevelsCard';
import { TeachingCoverage } from '../../components/teaching/TeachingCoverage';
import { TeachingSkeleton } from '../../components/teaching/TeachingSkeleton';
import { TeachingToolbar } from '../../components/teaching/TeachingToolbar';
import { useRevealClass } from '../../components/teaching/useRevealClass';
import { useTeachingFilters } from '../../components/teaching/useTeachingFilters';
import { teacherApprovedKey } from '../../components/teaching/utils';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { listClasses,listLevels } from '../../lib/services';
import { listTeachingAssignments } from '../../lib/teaching';

/** Both list endpoints are capped server-side, so say so instead of implying completeness. */
const PAGE_CAP = 100;

export function AdminTeaching() {
  const teachers = useApi('teaching-assignments', listTeachingAssignments);
  const levels = useApi('levels-catalog', listLevels);
  const classes = useApi('teaching-classes', listClasses);

  const [savedTeacherId, setSavedTeacherId] = useState<string | null>(null);
  const reveal = useRevealClass(classes.data ?? []);

  const teacherRows = useMemo(() => teachers.data ?? [], [teachers.data]);
  const classRows = useMemo(() => classes.data ?? [], [classes.data]);
  const levelRows = useMemo(() => levels.data ?? [], [levels.data]);

  const view = useTeachingFilters(teacherRows, classRows, reveal);

  const filter = (patch: Parameters<typeof view.filter>[0]) => {
    view.filter(patch);
    setSavedTeacherId(null);
  };
  const setCoverage = (next: Parameters<typeof view.setCoverage>[0]) => {
    view.setCoverage(next);
    setSavedTeacherId(null);
  };
  const reset = () => {
    view.reset();
    setSavedTeacherId(null);
  };
  const refreshRoster = () => {
    teachers.refetch();
    classes.refetch();
  };
  const onLevelsSaved = (teacherId: string) => {
    setSavedTeacherId(teacherId);
    refreshRoster();
  };
  const retry = () => {
    teachers.refetch();
    classes.refetch();
    levels.refetch();
  };
  // A level removal can be blocked by a class that a filter is currently hiding,
  // so drop every filter before revealing it — otherwise there is nothing to scroll to.
  const revealClass = (className: string) => {
    reset();
    reveal.reveal(className);
  };

  const loading = teachers.loading || levels.loading || classes.loading;
  const error = teachers.error || levels.error || classes.error;

  return (
    <div className="space-y-6">

      {loading ? (
        <TeachingSkeleton />
      ) : error ? (
        <ErrorBlock message={error} onRetry={retry} />
      ) : (
        <>
          <TeachingCoverage
            coverage={view.coverageStats}
            filter={view.coverage}
            onFilter={setCoverage}
          />

          <TeachingToolbar
            filters={view.filters}
            onFilter={filter}
            onClear={reset}
            hasFilters={view.hasFilters}
            levels={levelRows}
          />

          <section aria-labelledby="teaching-levels-heading" className="space-y-4">
            <StepHeader
              step={1}
              titleId="teaching-levels-heading"
              title="Approve teaching levels"
              hint="Levels unlock curriculum and assessments. Reassign or deactivate a class before removing a level."
              action={{ label: 'Manage people', to: '/admin/people' }}
            />
            {teacherRows.length === 0 ? (
              <EmptyBlock
                title="No teachers yet"
                hint="Create a teacher account in People, then approve their levels here."
              />
            ) : view.visibleTeachers.length === 0 ? (
              <EmptyBlock
                title="No teachers match these filters"
                hint="Clear the search, or pick another level."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {view.visibleTeachers.map((teacher) => (
                  <TeacherLevelsCard
                    key={teacher.id}
                    teacher={teacher}
                    levels={levelRows}
                    approvedKey={teacherApprovedKey(teacher)}
                    saved={savedTeacherId === teacher.id}
                    onSaved={onLevelsSaved}
                    onRevealClass={revealClass}
                  />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="class-teachers-heading" className="space-y-4">
            <StepHeader
              step={2}
              titleId="class-teachers-heading"
              title="Assign class teachers"
              hint="Each class lists only the active teachers approved for its level."
            />
            <Panel padded={false} className="overflow-hidden">
              <div
                ref={reveal.ref}
                tabIndex={-1}
                role="group"
                aria-label="Class teacher assignments"
                className="outline-none"
              >
                {classRows.length === 0 ? (
                  <div className="p-5">
                    <EmptyBlock
                      title="No classes yet"
                      hint="Create a class, then assign its teacher here."
                    />
                  </div>
                ) : view.visibleClasses.length === 0 ? (
                  <div className="p-5">
                    <EmptyBlock
                      title="No classes match these filters"
                      hint="Clear the filters, or switch off the coverage filter."
                    />
                  </div>
                ) : (
                  <ClassRoster
                    classes={view.visibleClasses}
                    teachers={teacherRows}
                    highlightedId={reveal.highlightedId}
                    onSaved={refreshRoster}
                  />
                )}
              </div>
            </Panel>
            {classRows.length >= PAGE_CAP ? (
              <p className="text-xs text-muted">
                Showing the first {PAGE_CAP} classes. Narrow the list with the search or
                level filter.
              </p>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}