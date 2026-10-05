import { ScheduleAgenda } from './ScheduleAgenda';
import type { ScheduleSession } from './ScheduleSessionCard';
export function StudentAgendaGrouped({ sessions, onOpen }: { sessions: ScheduleSession[]; onOpen: (id: string) => void }) {
  return <ScheduleAgenda sessions={sessions} onOpen={onOpen} />;
}
