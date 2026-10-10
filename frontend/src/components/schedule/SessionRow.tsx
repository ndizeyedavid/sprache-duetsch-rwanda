import { FiCalendar,FiEdit2,FiTrash2 } from 'react-icons/fi';
import { RowMenu } from '../ui/RowMenu';
import type { ScheduleSession } from './ScheduleSessionCard';
import { ScheduleSessionCard } from './ScheduleSessionCard';
export function SessionRow({ session, onOpen, onEdit, onCancel }: { session: ScheduleSession; onOpen: () => void; onEdit: () => void; onCancel: () => void }) {
  const editable = !['CANCELLED', 'COMPLETED'].includes(session.status) && Date.parse(session.endAt)>Date.now();
  const items = [{ label: 'View details', icon: FiCalendar, onClick: onOpen }, { label: editable ? 'Edit session' : 'Add notes or recording', icon: FiEdit2, onClick: onEdit }, ...(editable ? [ { label: 'Cancel session', icon: FiTrash2, onClick: onCancel, tone: 'danger' as const }] : [])];
  return <ScheduleSessionCard session={session} onOpen={onOpen} actions={<RowMenu label={`Actions for ${session.title}`} items={items} />} />;
}
