import { useMemo,useState } from 'react';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { IntakeConfirmDialog } from '../../components/intakes/IntakeConfirmDialog';
import { IntakeForm } from '../../components/intakes/IntakeForm';
import { IntakeRow } from '../../components/intakes/IntakeRow';
import { IntakeToolbar } from '../../components/intakes/IntakeToolbar';
import { IntakesHero } from '../../components/intakes/IntakesHero';
import type { RegistrationFilter } from '../../components/intakes/types';
import { useRegistrationToggle } from '../../components/intakes/useRegistrationToggle';
import { matchesRegistration } from '../../components/intakes/utils';
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
  const [filter, setFilter] = useState<RegistrationFilter>('All');
  const registration = useRegistrationToggle(intakes.refetch, setToast);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (intakes.data ?? [])
      .map(registration.withOverride)
      .filter((intake) =>
        needle
          ? `${intake.code} ${intake.name}`.toLowerCase().includes(needle)
          : true,
      )
      .filter((intake) => matchesRegistration(intake, filter));
  }, [intakes.data, query, filter, registration.withOverride]);

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
      setToast(`${intake.code} restored.`);
    } catch (err) {
      setToast(apiErrorMessage(err, 'Could not restore the intake.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <IntakesHero
        intakes={intakes.data}
        onCreate={() => {
          setToast(null);
          setDialog({ kind: 'create' });
        }}
      />

      <IntakeToolbar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />

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
                ? 'Clear the search or pick another filter.'
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
                onToggleRegistration={registration.toggle}
                toggling={registration.isBusy(intake.id)}
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
