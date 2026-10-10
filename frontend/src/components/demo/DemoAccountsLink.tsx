import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { listDemoAccounts } from '../../lib/demo-accounts';

/** Shown on sign-in only while test accounts are switched on. */
export function DemoAccountsLink() {
  const accounts = useApi('demo-accounts', listDemoAccounts);
  if (!accounts.data?.length) return null;
  return (
    <Link to="/demo" className="mt-4 block rounded-full border border-dashed border-base-300 px-4 py-2.5 text-center text-sm font-medium text-muted transition-colors hover:border-brand/40 hover:text-brand">
      Testing? Use a test account
    </Link>
  );
}
