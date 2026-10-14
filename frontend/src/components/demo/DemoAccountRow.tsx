import { FiArrowRight } from 'react-icons/fi';
import type { DemoAccount } from './demo-accounts';

type Props = { account: DemoAccount; pending: boolean; disabled: boolean; onSignIn: (email: string) => void };

export function DemoAccountRow({ account, pending, disabled, onSignIn }: Props) {
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {account.label}
          {account.blocked ? <span className="badge badge-ghost badge-sm ml-2 align-middle">blocked</span> : null}
        </p>
        <p className="truncate font-mono text-xs text-muted">{account.email}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted">{account.detail}</p>
      </div>
      <button type="button" disabled={disabled} onClick={() => onSignIn(account.email)}
        className="btn btn-sm shrink-0 gap-1 rounded-full border-base-300 bg-base-100 hover:border-brand hover:text-brand">
        {pending ? <span className="loading loading-spinner loading-xs" /> : null}
        Sign in
        <FiArrowRight aria-hidden />
      </button>
    </li>
  );
}
