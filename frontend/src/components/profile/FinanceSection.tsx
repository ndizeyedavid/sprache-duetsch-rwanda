import { rwf } from "../../lib/format";
import { money } from "../../lib/services";
import type { MyFinance } from "../../lib/services";

type Props = { finance: MyFinance | null; loading: boolean; error: string | null; onRetry: () => void };

export function FinanceSection({ finance, loading, error, onRetry }: Props) {
  if (loading) return <p className="py-6 text-center text-sm text-muted">Loading finance…</p>;
  if (error) return <div className="py-4 text-center"><p className="text-sm text-error">{error}</p><button type="button" onClick={onRetry} className="btn btn-xs mt-2 rounded-full border-line bg-base-100">Retry</button></div>;
  if (!finance || !finance.finance) return <p className="py-6 text-center text-sm text-muted">No charges yet — tuition appears once enrolled.</p>;
  const f = finance.finance;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-box bg-base-200 p-3"><p className="text-xs text-muted">Total due</p><p className="mt-1 font-bold">{rwf(money(f.totalDue))}</p></div>
        <div className="rounded-box bg-brand-soft p-3"><p className="text-xs text-muted">Total paid</p><p className="mt-1 font-bold text-brand">{rwf(money(f.totalPaid))}</p></div>
        <div className="rounded-box bg-base-200 p-3"><p className="text-xs text-muted">Balance</p><p className="mt-1 font-bold">{rwf(money(f.balance))}</p></div>
      </div>
      {finance.charges.length ? <details className="rounded-box border border-line bg-base-100 p-3"><summary className="cursor-pointer text-sm font-semibold">Charges ({finance.charges.length})</summary><ul className="mt-2 space-y-1 text-xs">{finance.charges.slice(0, 6).map((c) => <li key={c.id} className="flex justify-between"><span>{c.type}</span><span>{rwf(money(c.amount))}</span></li>)}</ul></details> : null}
      {finance.payments.length ? <details className="rounded-box border border-line bg-base-100 p-3"><summary className="cursor-pointer text-sm font-semibold">Payments ({finance.payments.length})</summary><ul className="mt-2 space-y-1 text-xs">{finance.payments.slice(0, 6).map((p) => <li key={p.id} className="flex justify-between"><span>{p.method?.name ?? "—"} · {new Date(p.paidAt).toLocaleDateString("en-GB")}</span><span>{rwf(money(p.amount))}</span></li>)}</ul></details> : null}
    </div>
  );
}
