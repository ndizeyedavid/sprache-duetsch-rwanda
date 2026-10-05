import { StudentSessionDetails } from './StudentSessionDetails';
import type { StudentSessionDetail } from './StudentDetailDrawerContent';
export function StudentDetailDrawer({ open, onClose, session }: { open:boolean; onClose:()=>void; session:StudentSessionDetail|null }) {
  return open && session ? <StudentSessionDetails id={session.id} onClose={onClose} /> : null;
}
