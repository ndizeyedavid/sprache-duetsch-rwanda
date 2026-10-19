import { useSession } from '../../lib/session';

/** Teaching tools are shared by teachers and academic admins: which side are we on? */
export function useStaffPortal() {
  const { user } = useSession();
  const admin = Boolean(user && user.role !== 'TEACHER');
  return { admin, portal: admin ? '/admin' : '/teacher' };
}
