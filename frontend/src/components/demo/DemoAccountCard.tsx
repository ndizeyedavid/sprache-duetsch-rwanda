import { FiArrowRight } from 'react-icons/fi';
import type { DemoAccount } from '../../lib/demo-accounts';
import { demoRoleSummary } from '../../lib/demo-accounts';
import { roleLabel } from '../../lib/roles';
import { CopyValue } from './CopyValue';

type Props = { account: DemoAccount; busy: boolean; disabled: boolean; onSignIn: (account: DemoAccount) => void };

export function DemoAccountCard({ account, busy, disabled, onSignIn }: Props) {
  return (
    <article className="flex flex-col rounded-[1.5rem] border border-base-300 bg-base-100 p-5">
      <h2 className="text-lg font-semibold">{roleLabel[account.role]}</h2>
      <p className="mt-1 min-h-10 text-sm text-muted">{demoRoleSummary[account.role]}</p>
      <div className="mt-4 space-y-2">
        <CopyValue label="Email" value={account.email} />
        <CopyValue label="Password" value={account.password} mono />
      </div>
      <button type="button" disabled={disabled} onClick={() => onSignIn(account)}
        className="btn mt-5 h-11 w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
        {busy ? <span className="loading loading-spinner loading-sm" aria-hidden /> : null}
        Sign in as {roleLabel[account.role]}<FiArrowRight aria-hidden />
      </button>
    </article>
  );
}
