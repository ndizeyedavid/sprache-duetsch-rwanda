import { useLastValue } from './session-drawer/useLastValue';
import type { StudentSessionDetail } from './StudentDetailDrawerContent';
import { StudentSessionDetails } from './StudentSessionDetails';

/** Stays mounted while closing so the drawer can slide out with the class it was showing. */
export function StudentDetailDrawer({ open, onClose, session: current }: { open: boolean; onClose: () => void; session: Pick<StudentSessionDetail, 'id' | 'title'> | null }) {
  const session = useLastValue(current);
  return session ? <StudentSessionDetails id={session.id} title={session.title} open={open && Boolean(current)} onClose={onClose} /> : null;
}
