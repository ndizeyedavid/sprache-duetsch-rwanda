import { FiMail,FiPhone,FiUserCheck } from 'react-icons/fi';
import type { IntakeItem,LevelItem } from '../../../lib/services';
import type { TeachingTeacher } from '../../../lib/teaching';
import { Drawer } from '../../ui/overlay/Drawer';
import { StatusBadge } from '../../ui/StatusBadge';
import { TeacherAvatar } from '../TeacherAvatar';
import type { TeacherActions } from '../useTeacherActions';
import { statusLabel,teacherName } from '../utils';
import { ClassesSection } from './ClassesSection';
import { IntakesSection } from './IntakesSection';
import { LevelsSection } from './LevelsSection';

type Props = {
  open: boolean;
  teacher: TeachingTeacher | null;
  levels: LevelItem[];
  intakes: IntakeItem[];
  actions: TeacherActions;
  onClose: () => void;
};

/** Everything about one teacher in a side panel: levels, their classes, and classes to give them. */
export function TeacherDrawer({ open, teacher, levels, intakes, actions, onClose }: Props) {
  const feedback = actions.feedback;
  return (
    <Drawer open={open} onClose={onClose} title={teacher ? teacherName(teacher) : ''}
      subtitle={teacher ? <span className="flex items-center gap-1"><FiMail aria-hidden />{teacher.email}</span> : null}>
      {teacher ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-box bg-base-200 p-3">
            <TeacherAvatar teacher={teacher} size="size-12" />
            <div className="min-w-0 flex-1 text-xs">
              <StatusBadge status={statusLabel(teacher.status)} className="!px-2.5 !py-0.5" />
              {teacher.phone ? <p className="mt-1 flex items-center gap-1 text-muted"><FiPhone aria-hidden />{teacher.phone}</p> : null}
            </div>
            {teacher.status === 'PENDING' ? (
              <button type="button" disabled={Boolean(actions.busyKey)} onClick={() => void actions.activate(teacher)} className="btn btn-sm btn-primary rounded-full">
                <FiUserCheck aria-hidden /> Activate
              </button>
            ) : null}
          </div>
          {teacher.status !== 'ACTIVE' ? (
            <p className="rounded-box border border-line p-3 text-xs text-muted">
              {teacher.status === 'PENDING' ? 'Activate this account to give it levels and classes.' : 'This account is not active, so it cannot hold levels or classes. Reactivate it in People.'}
            </p>
          ) : null}
          {feedback ? (
            <p role={feedback.tone === 'error' ? 'alert' : 'status'}
              className={`rounded-box px-3 py-2 text-xs font-medium ${feedback.tone === 'error' ? 'bg-error text-error-content' : 'bg-success text-success-content'}`}>
              {feedback.text}
            </p>
          ) : null}
          <IntakesSection teacher={teacher} intakes={intakes} actions={actions} />
          <LevelsSection teacher={teacher} levels={levels} actions={actions} />
          <ClassesSection teacher={teacher} actions={actions} />
        </div>
      ) : null}
    </Drawer>
  );
}
