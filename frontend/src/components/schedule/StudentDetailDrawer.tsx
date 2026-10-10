import type { StudentSessionDetail } from './StudentDetailDrawerContent';
import { StudentSessionDetails } from './StudentSessionDetails';
export function StudentDetailDrawer({ open, onClose, session }: { open:boolean; onClose:()=>void; session:StudentSessionDetail|null }) {
  return open && session ? <StudentSessionDetails id={session.id} onClose={onClose} /> : null;
}
