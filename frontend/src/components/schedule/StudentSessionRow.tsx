import { ScheduleSessionCard } from './ScheduleSessionCard';
import type { ScheduleSession } from './ScheduleSessionCard';
export function StudentSessionRow({ session, onOpen }: { session: ScheduleSession; onOpen: () => void }) {
  return <ScheduleSessionCard session={session} onOpen={onOpen} />;
}
