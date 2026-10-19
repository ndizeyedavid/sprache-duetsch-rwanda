import { FiCalendar,FiEdit2,FiTrash2,FiXCircle } from 'react-icons/fi';
import { RowMenu } from '../ui/RowMenu';
import type { ScheduleSession } from './ScheduleSessionCard';
import { ScheduleSessionCard } from './ScheduleSessionCard';

type Props = { session: ScheduleSession; onOpen: () => void; onEdit: () => void; onCancel: () => void; onDelete?: () => void };

/** Staff list row: details, edit, cancel (keeps the record) and delete (for classes made by mistake). */
export function SessionRow({ session, onOpen, onEdit, onCancel, onDelete }: Props) {
  const editable = !['CANCELLED', 'COMPLETED'].includes(session.status) && Date.parse(session.endAt) > Date.now();
  const deletable = Boolean(onDelete) && !['LIVE', 'COMPLETED'].includes(session.status);
  const items = [
    { label: 'View details', icon: FiCalendar, onClick: onOpen },
    { label: editable ? 'Edit class' : 'Add notes or recording', icon: FiEdit2, onClick: onEdit },
    ...(editable ? [{ label: 'Cancel class', icon: FiXCircle, onClick: onCancel, tone: 'danger' as const }] : []),
    ...(deletable && onDelete ? [{ label: 'Delete class', icon: FiTrash2, onClick: onDelete, tone: 'danger' as const }] : []),
  ];
  return <ScheduleSessionCard session={session} onOpen={onOpen} actions={<RowMenu label={`Actions for ${session.title}`} items={items} />} />;
}
