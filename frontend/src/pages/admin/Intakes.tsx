import { useMemo,useState } from 'react';
import { AcademicSummary } from '../../components/admin/AcademicSummary';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { IntakeConfirmDialog } from '../../components/intakes/IntakeConfirmDialog';
import { IntakeForm } from '../../components/intakes/IntakeForm';
import { IntakeRow } from '../../components/intakes/IntakeRow';
import { IntakeToolbar } from '../../components/intakes/IntakeToolbar';
import { intakePhase } from '../../components/intakes/utils';
import { Modal } from '../../components/ui/Modal';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import type { IntakeItem } from '../../lib/services';
import {
archiveIntake,
createIntake,
listIntakesFull,
updateIntake,
} from '../../lib/services';

type Dialog = { kind: 'create' } | { kind: 'edit'; intake: IntakeItem } | null;

export function AdminIntakes() {
  const intakes = useApi('intakes-full', listIntakesFull);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [archiving, setArchiving] = useState<IntakeItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('All');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (intakes.data ?? [])
      .filter((intake) =>
        needle
          ? `${intake.code} ${intake.name}`.toLowerCase().includes(needle)
          : true,
      )
      .filter((intake) => (phase === 'All' ? true : intakePhase(intake) === phase));
  }, [intakes.data, query, phase]);

  const close = () => setDialog(null);

  async function handleArchive(intake: IntakeItem) {
    setBusyId(intake.id);
    try {
      await archiveIntake(intake.id);
      intakes.refetch();
      setArchiving(null);
      setToast(`${intake.code} archived.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRestore(intake: IntakeItem) {
    setBusyId(intake.id);
    setToast(null);
    try {
      await updateIntake(intake.id, { isActive: true });
      intakes.refetch();
      setToast(`${intake.code} is open again.`);
    } catch (err) {
      setToast(apiErrorMessage(err, 'Could not restore the intake.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {intakes.data && <AcademicSummary items={[
        { label: 'Intakes', value: intakes.data.length, note: 'Loaded cohort windows' },
        { label: 'Active intakes', value: intakes.data.filter(i => i.isActive).length, note: 'Available academic periods' },
        { label: 'Archived', value: intakes.data.filter(i => !i.isActive).length, note: 'Retained for historical records' },
        { label: 'Matching filters', value: rows.length, note: 'Cohorts shown in the register below' },
      ]} />}

      <IntakeToolbar
        query={query}
        onQueryChange={setQuery}
        phase={phase}
        onPhaseChange={setPhase}
        onCreate={() => {
          setToast(null);
          setDialog({ kind: 'create' });
        }}
      />

      {toast ? (
        <p role="status" className="text-xs font-medium text-brand">
          {toast}
        </p>
      ) : null}

      <Panel padded={false} className="p-4 sm:p-5">
        {intakes.loading ? (
          <LoadingBlock label="Loading intakes…" />
        ) : intakes.error ? (
          <ErrorBlock message={intakes.error} onRetry={intakes.refetch} />
        ) : rows.length === 0 ? (
          <EmptyBlock
            title={intakes.data?.length ? 'No intakes match these filters' : 'No intakes yet'}
            hint={
              intakes.data?.length
                ? 'Clear the search or pick another phase.'
                : 'Create the first intake so classes and enrolments have a cohort to attach to.'
            }
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((intake) => (
              <IntakeRow
                key={intake.id}
                intake={intake}
                busyId={busyId}
                onEdit={(row) => {
                  setToast(null);
                  setDialog({ kind: 'edit', intake: row });
                }}
                onArchive={setArchiving}
                onRestore={handleRestore}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Modal
        open={dialog?.kind === 'create'}
        onClose={close}
        title="New intake"
      >
        {dialog?.kind === 'create' ? (
          <IntakeForm
            onSubmit={async (values) => {
              const created = await createIntake(values);
              setToast(`${created.code} created.`);
              return created;
            }}
            onDone={() => {
              close();
              intakes.refetch();
            }}
            onCancel={close}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.kind === 'edit'}
        onClose={close}
        title={dialog?.kind === 'edit' ? `Edit ${dialog.intake.code}` : 'Edit intake'}
      >
        {dialog?.kind === 'edit' ? (
          <IntakeForm
            key={dialog.intake.id}
            initial={dialog.intake}
            onSubmit={async (values) => {
              const saved = await updateIntake(dialog.intake.id, values);
              setToast(`${saved.code} updated.`);
              return saved;
            }}
            onDone={() => {
              close();
              intakes.refetch();
            }}
            onCancel={close}
          />
        ) : null}
      </Modal>

      <IntakeConfirmDialog
        intake={archiving}
        onCancel={() => setArchiving(null)}
        onConfirm={handleArchive}
      />
    </div>
  );
}
