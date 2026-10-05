import { ScheduleAgenda } from './ScheduleAgenda';
import type { ScheduleSession } from './ScheduleSessionCard';
type Props = { sessions: ScheduleSession[]; onOpen: (id: string) => void; onEdit: (id: string) => void; onCancel: (id: string) => void };
export function AgendaGrouped(props: Props) {
  return <ScheduleAgenda {...props} />;
}
