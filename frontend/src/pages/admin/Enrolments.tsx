import { useMemo,useState } from 'react';
import { EnrolFeedback } from '../../components/enrolments/EnrolFeedback';
import { EnrolmentCreateDialog } from '../../components/enrolments/EnrolmentCreateDialog';
import { EnrolmentManageDialog } from '../../components/enrolments/EnrolmentManageDialog';
import { EnrolmentRegister } from '../../components/enrolments/EnrolmentRegister';
import { EnrolmentSummary } from '../../components/enrolments/EnrolmentSummary';
import { EMPTY_FILTERS } from '../../components/enrolments/constants';
import type { EnrolmentFilters } from '../../components/enrolments/types';
import { useEnrolmentActions } from '../../components/enrolments/useEnrolmentActions';
import { filterEnrolments,registerStats,resetFilters } from '../../components/enrolments/utils';
import { useApi } from '../../hooks/useApi';
import type { EnrollmentRow } from '../../lib/services';
import {
listClasses,
listEnrollments,
listIntakesFull,
listLevels,
listStudents,
} from '../../lib/services';

export function AdminEnrolments() {
  const enrolments = useApi('admin-enrolments', listEnrollments);
  const students = useApi('admin-students', listStudents);
  const levels = useApi('levels-catalog', listLevels);
  const intakes = useApi('intakes-full', listIntakesFull);
  const groups = useApi('admin-classes', listClasses);

  const [filters, setFilters] = useState<EnrolmentFilters>(EMPTY_FILTERS);
  const [creating, setCreating] = useState(false);
  const [managing, setManaging] = useState<EnrollmentRow | null>(null);
  const actions = useEnrolmentActions(enrolments.refetch);

  const data = enrolments.data;
  const rows = useMemo(() => data ?? [], [data]);
  const visible = useMemo(() => filterEnrolments(rows, filters), [rows, filters]);
  const stats = useMemo(() => registerStats(rows), [rows]);

  return (
    <div className="space-y-5">
      {enrolments.data && <EnrolmentSummary
        stats={stats}
        awaitingActive={filters.awaitingOnly}
        onToggleAwaiting={() =>
          setFilters((current) => ({ ...current, awaitingOnly: !current.awaitingOnly }))
        }
      />}

      <EnrolFeedback
        error={actions.error}
        success={actions.success}
        onDismiss={actions.clearFeedback}
      />

      <EnrolmentRegister
          state={enrolments}
          rows={rows}
          visible={visible}
          filters={filters}
          onFilter={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onClear={() => setFilters(resetFilters())}
          onManage={setManaging}
          onCreate={() => setCreating(true)}
          savingId={actions.savingId}
          levels={levels.data ?? []}
          intakes={intakes.data ?? []}
          groups={groups.data ?? []}
      />

      <EnrolmentCreateDialog
        open={creating}
        students={students.data ?? []}
        levels={levels.data ?? []}
        intakes={intakes.data ?? []}
        groups={groups.data ?? []}
        enrolments={rows}
        saving={actions.saving}
        onClose={() => setCreating(false)}
        onCreate={actions.create}
      />

      <EnrolmentManageDialog
        row={managing}
        groups={groups.data ?? []}
        saving={actions.savingId !== null}
        onClose={() => setManaging(null)}
        onSave={actions.update}
      />
    </div>
  );
}