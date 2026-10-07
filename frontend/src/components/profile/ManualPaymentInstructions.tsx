import { useApi } from '../../hooks/useApi';
import { listPaymentMethods } from '../../lib/services';

export function ManualPaymentInstructions() {
  const methods = useApi('student-payment-methods', listPaymentMethods);
  const available = methods.data?.filter(method => method.isActive !== false && method.code !== 'PAYPACK') ?? [];
  return <section className="space-y-2">
    <h4 className="text-xs font-semibold">How to pay</h4>
    {methods.loading ? <p role="status" className="text-xs">Loading payment instructions…</p> : null}
    {methods.error ? <div className="alert alert-warning text-xs">Payment instructions could not load.<button type="button" className="btn btn-xs" onClick={methods.refetch}>Retry</button></div> : null}
    <ul className="space-y-2">{available.map(method => <li key={method.id} className="rounded-box bg-base-200 p-3 text-xs">
      <p className="font-medium">{method.name}</p>
      {method.instructions ? <p className="mt-1 whitespace-pre-wrap">{method.instructions}</p> : null}
      {method.requiresReference ? <p className="mt-1">Keep your transaction reference for the finance office.</p> : null}
    </li>)}</ul>
    <p className="text-xs text-base-content/60">Pay using an approved method above. Give the finance office your student ID and payment reference. Staff confirm received payments and issue receipts.</p>
  </section>;
}
