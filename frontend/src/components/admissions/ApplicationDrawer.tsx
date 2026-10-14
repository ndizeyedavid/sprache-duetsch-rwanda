import { useApi } from '../../hooks/useApi';
import { getApplication } from '../../lib/admissions-api';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { Modal } from '../ui/Modal';
import { ApplicationCourseEditor } from './ApplicationCourseEditor';
import { ApplicationDecision } from './ApplicationDecision';
import { ApplicationDetails } from './ApplicationDetails';
import { ApplicationHistory } from './ApplicationHistory';
import { CreateStudentAction } from './CreateStudentAction';
import type { AdmissionRefs } from './useAdmissionRefs';
import { useDrawerActions } from './useDrawerActions';

const OPEN = ['NEW', 'REVIEWING', 'ACCEPTED', 'WAITLISTED'];

type Props = { id: string | null; refs: AdmissionRefs; onClose: () => void; onChanged: () => void };

/** Review one application: facts, course corrections, decision, account creation and audit trail. */
export function ApplicationDrawer({ id, refs, onClose, onChanged }: Props) {
  const detail = useApi(`application:${id ?? ''}`, () => getApplication(id ?? ''), Boolean(id));
  const { refetch } = detail;
  const actions = useDrawerActions(id, () => { refetch(); onChanged(); });
  const app = detail.stale ? null : detail.data;

  function close() {
    if (actions.busy) return;
    actions.reset();
    onClose();
  }

  return (
    <Modal open={Boolean(id)} onClose={close} busy={actions.busy} title={app ? `Application ${app.reference}` : 'Application'} boxClassName="max-w-2xl">
      {detail.error ? (
        <ErrorBlock message={detail.error} onRetry={refetch} />
      ) : !app ? (
        <LoadingBlock label="Loading application…" />
      ) : (
        <div className="space-y-4">
          <ApplicationDetails app={app} />
          {actions.notice ? (
            <p role={actions.notice.tone === 'error' ? 'alert' : 'status'}
              className={`rounded-field px-3 py-2 text-xs font-medium ${actions.notice.tone === 'error' ? 'bg-coral text-[#AE3522]' : 'bg-brand-soft text-brand-soft-ink'}`}>
              {actions.notice.text}
            </p>
          ) : null}
          {OPEN.includes(app.status) && !app.studentId ? (
            <ApplicationCourseEditor key={`${app.id}:${app.levelId}:${app.intakeId}:${app.campusId}:${app.shift}`} app={app} refs={refs} busy={actions.busy} onSave={actions.saveCourse} />
          ) : null}
          <ApplicationDecision key={`${app.id}:${app.status}`} app={app} busy={actions.busy} onTransition={actions.transition} />
          <CreateStudentAction key={app.id} app={app} refs={refs} busy={actions.busy} created={actions.created} onCreate={actions.createStudent} />
          <ApplicationHistory history={app.history} />
        </div>
      )}
    </Modal>
  );
}
