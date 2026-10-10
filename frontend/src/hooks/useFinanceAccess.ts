import { isFinance } from '../lib/roles';
import { useSession } from '../lib/session';

export function useFinanceAccess(): boolean {
  const { user } = useSession();
  return Boolean(user && isFinance(user.role));
}
