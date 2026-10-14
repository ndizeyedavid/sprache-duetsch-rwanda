import { useMemo } from 'react';
import { FiFileText } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { BookLoader } from '../components/common/BookLoader';
import { InvoiceDocument } from '../components/invoice/InvoiceDocument';
import { PaymentRequestHistory } from '../components/payments/PaymentRequestHistory';
import { PaypackCheckout } from '../components/payments/PaypackCheckout';
import { usePaypackCheckout } from '../components/payments/usePaypackCheckout';
import { Logo } from '../components/ui/Logo';
import { useApi } from '../hooks/useApi';
import { getInvoice, invoicePaypackClient } from '../lib/invoice';
import { money } from '../lib/services/money';

/** Public invoice opened from a balance-reminder email: see every charge and pay by mobile money without signing in. */
export function PublicInvoice() {
  const { token = '' } = useParams();
  const invoice = useApi(`invoice-${token}`, () => getInvoice(token));
  const client = useMemo(() => invoicePaypackClient(token), [token]);
  const checkout = usePaypackCheckout(invoice.refetch, client);
  const data = invoice.data;
  const expired = !!invoice.error && /invalid or has expired|no longer available/i.test(invoice.error);

  return (
    <div className="min-h-screen bg-base-200">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <Link to="/"><Logo size={38} withWordmark wordmarkClassName="text-ink" /></Link>
        <Link to="/login" className="text-xs font-medium text-brand hover:underline">Student sign in</Link>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-14">
        {invoice.loading ? <BookLoader label="Opening your invoice…" className="min-h-[50vh]" />
          : data ? (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <InvoiceDocument invoice={data} />
              <section className="rounded-box border border-base-300 bg-base-100 p-6 sm:p-7">
                <PaypackCheckout balance={Math.max(0, money(data.summary?.balance))} currency={data.summary?.currency ?? 'RWF'}
                  checkout={checkout} config={data.paypack} />
                <PaymentRequestHistory rows={checkout.rows} receiptsLink={false} />
                <p className="mt-6 border-t border-base-300 pt-4 text-xs text-muted">
                  Receipts are issued automatically once a payment is confirmed. Sign in to download them, or contact the finance office with any questions.
                </p>
              </section>
            </div>
          ) : (
            <section className="page-enter rounded-[1.75rem] border border-base-300 bg-base-100 px-6 py-12 text-center sm:px-10">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-base-200 text-xl text-muted"><FiFileText aria-hidden /></span>
              <h1 className="mt-4 text-xl font-semibold">{expired ? 'This invoice link has expired' : 'Could not open this invoice'}</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{expired ? 'Sign in to see your current balance and pay, or ask the finance office for a new link.' : invoice.error ?? 'Check your connection and try again.'}</p>
              {expired ? <Link to="/login" className="btn btn-sm mt-5 rounded-full">Sign in</Link>
                : <button type="button" className="btn btn-sm mt-5 rounded-full" onClick={invoice.refetch}>Try again</button>}
            </section>
          )}
        <p className="mt-10 text-center text-xs text-muted">© 2026 Deutsch Sprache RW · Kigali, Rwanda</p>
      </main>
    </div>
  );
}
