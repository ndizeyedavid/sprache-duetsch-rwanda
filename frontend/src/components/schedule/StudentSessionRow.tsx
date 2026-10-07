import type { ScheduleSession } from './ScheduleSessionCard';
import { ScheduleSessionCard } from './ScheduleSessionCard';
export function StudentSessionRow({ session, onOpen }: { session: ScheduleSession; onOpen: () => void }) {
  return <ScheduleSessionCard session={session} onOpen={onOpen} />;
}
