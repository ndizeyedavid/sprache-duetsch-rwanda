import { useMemo,useState } from 'react';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { StaffCreateDialog } from '../../components/staff/StaffCreateDialog';
import { StaffFeedback } from '../../components/staff/StaffFeedback';
import { useStaffActions } from '../../components/staff/useStaffActions';
import { TeacherDrawer } from '../../components/teachers/drawer/TeacherDrawer';
import { TeacherListRow } from '../../components/teachers/TeacherListRow';
import { TeachersHero } from '../../components/teachers/TeachersHero';
import { TeachersToolbar } from '../../components/teachers/TeachersToolbar';
import type { TeacherFilters } from '../../components/teachers/types';
import { EMPTY_TEACHER_FILTERS } from '../../components/teachers/types';
import { UnstaffedClasses } from '../../components/teachers/UnstaffedClasses';
import { useTeacherActions } from '../../components/teachers/useTeacherActions';
import { filterTeachers } from '../../components/teachers/utils';
import { useLastValue } from '../../components/ui/overlay/useLastValue';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { listClasses,listIntakesFull,listLevels } from '../../lib/services';
import { listTeachingAssignments } from '../../lib/teaching';

/** Teachers: add them, approve their levels and give them classes per intake — list + side panel. */
export function AdminTeachers() {
  const teachers = useApi('teaching-assignments', listTeachingAssignments);
  const levels = useApi('levels-catalog', listLevels);
  const classes = useApi('teaching-classes', listClasses);
  const intakes = useApi('teacher-intakes', listIntakesFull);
  const [filters, setFilters] = useState<TeacherFilters>(EMPTY_TEACHER_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const refresh = () => { teachers.refetch(); classes.refetch(); };
  const actions = useTeacherActions(refresh);
  const staff = useStaffActions(teachers.refetch);

  const rows = useMemo(() => teachers.data ?? [], [teachers.data]);
  const classRows = useMemo(() => classes.data ?? [], [classes.data]);
  const visible = useMemo(() => filterTeachers(rows, filters), [rows, filters]);
  const unstaffed = useMemo(() => classRows.filter((group) => group.isActive && !group.teacherId), [classRows]);
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const shown = useLastValue(selected);

  const stats = teachers.data ? {
    teachers: rows.length,
    active: rows.filter((row) => row.status === 'ACTIVE').length,
    pending: rows.filter((row) => row.status === 'PENDING').length,
    unstaffed: unstaffed.length,
  } : null;
  const loading = teachers.loading || levels.loading || classes.loading;
  const error = teachers.error || levels.error || classes.error;
  const open = (id: string) => { actions.clearFeedback(); setSelectedId(id); };

  return (
    <div className="space-y-5">
      <TeachersHero stats={stats} onAdd={() => { staff.clearFeedback(); setAdding(true); }} />
      <StaffFeedback error={staff.error} success={staff.success} onDismiss={staff.clearFeedback} />
      {loading ? <LoadingBlock label="Loading teachers…" /> : error ? (
        <ErrorBlock message={error} onRetry={() => { refresh(); levels.refetch(); }} />
      ) : (
        <>
          <UnstaffedClasses classes={unstaffed} teachers={rows} actions={actions} />
          {!selectedId && actions.feedback ? (
            <p role="status" className={`text-xs font-medium ${actions.feedback.tone === 'error' ? 'text-error' : 'text-primary'}`}>{actions.feedback.text}</p>
          ) : null}
          <TeachersToolbar filters={filters} levels={levels.data ?? []} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} />
          <Panel padded={false} className="overflow-hidden">
            {visible.length ? (
              <ul>
                {visible.map((teacher) => (
                  <TeacherListRow key={teacher.id} teacher={teacher} activating={actions.busyKey === `status:${teacher.id}`}
                    onOpen={() => open(teacher.id)} onActivate={() => void actions.activate(teacher)} />
                ))}
              </ul>
            ) : (
              <div className="p-6">
                <EmptyBlock title={rows.length ? 'No teachers match these filters' : 'No teachers yet'}
                  hint={rows.length ? 'Clear the search or pick another level.' : 'Click "Add teacher" to create the first account.'} />
              </div>
            )}
          </Panel>
        </>
      )}
      <TeacherDrawer open={Boolean(selected)} teacher={shown} levels={levels.data ?? []} intakes={intakes.data ?? []}
        actions={actions} onClose={() => { setSelectedId(null); actions.clearFeedback(); }} />
      {adding ? (
        <StaffCreateDialog creatableRoles={['TEACHER']} saving={staff.creating} onClose={() => setAdding(false)} onSubmit={staff.create} />
      ) : null}
    </div>
  );
}
