import { useMemo,useState } from 'react';
import { EnrolFeedback } from '../../components/enrolments/EnrolFeedback';
import { EnrolmentBulkBar } from '../../components/enrolments/EnrolmentBulkBar';
import { EnrolmentCreateDialog } from '../../components/enrolments/EnrolmentCreateDialog';
import { EnrolmentManageDialog } from '../../components/enrolments/EnrolmentManageDialog';
import { EnrolmentRegister } from '../../components/enrolments/EnrolmentRegister';
import { EnrolmentSummary } from '../../components/enrolments/EnrolmentSummary';
import { EnrolmentsHero } from '../../components/enrolments/EnrolmentsHero';
import { EMPTY_FILTERS } from '../../components/enrolments/constants';
import { enrolmentCsv } from '../../components/enrolments/export-csv';
import type { EnrolmentFilters } from '../../components/enrolments/types';
import { useEnrolmentActions } from '../../components/enrolments/useEnrolmentActions';
import { filterEnrolments,registerStats,resetFilters } from '../../components/enrolments/utils';
import { useApi } from '../../hooks/useApi';
import { useFinanceAccess } from '../../hooks/useFinanceAccess';
import { downloadCsv } from '../../lib/csv-download';
import type { EnrollmentRow } from '../../lib/services';
import { listClasses,listIntakesFull,listLevels,listStudents } from '../../lib/services';
import { getEnrolmentRegister } from '../../lib/services/enrolment-register';

/** Enrolled students: class placement, course access (payment), learning progress, and bulk work on them. */
export function AdminEnrolments() {
  const enrolments = useApi('admin-enrolment-register', getEnrolmentRegister);
  const students = useApi('admin-students', listStudents);
  const levels = useApi('levels-catalog', listLevels);
  const intakes = useApi('intakes-full', listIntakesFull);
  const groups = useApi('admin-classes', listClasses);
  const withMoney = useFinanceAccess();

  const [filters, setFilters] = useState<EnrolmentFilters>(EMPTY_FILTERS);
  const [creating, setCreating] = useState(false);
  const [managing, setManaging] = useState<EnrollmentRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const actions = useEnrolmentActions(() => { enrolments.refetch(); groups.refetch(); });

  const data = enrolments.data;
  const rows = useMemo(() => data ?? [], [data]);
  const visible = useMemo(() => filterEnrolments(rows, filters), [rows, filters]);
  const stats = useMemo(() => registerStats(rows), [rows]);
  const picked = useMemo(() => rows.filter((row) => selected.has(row.id)), [rows, selected]);

  function select(ids: string[], checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }
  const exportRows = (list: EnrollmentRow[], name: string) =>
    downloadCsv(enrolmentCsv(list, withMoney), `${name}-${new Date().toISOString().slice(0, 10)}.csv`);

  return (
    <div className="space-y-5">
      <EnrolmentsHero onCreate={() => setCreating(true)} />

      {enrolments.data && <EnrolmentSummary stats={stats} filters={filters} onToggle={(patch) => setFilters((current) => ({ ...current, ...patch }))} />}

      <EnrolFeedback error={actions.error} success={actions.success} onDismiss={actions.clearFeedback} />

      <EnrolmentRegister
        state={enrolments}
        rows={rows}
        visible={visible}
        filters={filters}
        onFilter={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onClear={() => setFilters(resetFilters())}
        onManage={setManaging}
        savingId={actions.savingId}
        levels={levels.data ?? []}
        intakes={intakes.data ?? []}
        groups={groups.data ?? []}
        selected={selected}
        onSelect={select}
        onExport={() => exportRows(visible, 'enrolments')}
        bulkBar={<EnrolmentBulkBar rows={picked} groups={groups.data ?? []} busy={actions.assigning}
          onAssign={(classGroupId) => void actions.assign(picked.map((row) => row.id), classGroupId).then((ok) => { if (ok) setSelected(new Set()); })}
          onExport={() => exportRows(picked, 'enrolments-selected')} onClear={() => setSelected(new Set())} />}
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
