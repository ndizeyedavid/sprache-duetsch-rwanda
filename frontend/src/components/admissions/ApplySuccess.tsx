import { FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ApplicationReceipt } from '../../lib/admissions-types';

/** Confirmation with the reference to quote when contacting admissions. */
export function ApplySuccess({ receipt, email }: { receipt: ApplicationReceipt; email: string }) {
  return (
    <section className="page-enter text-center" aria-live="polite">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand text-2xl text-white"><FiCheckCircle aria-hidden /></span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        {receipt.duplicate ? 'We already have your application' : 'Application received'}
      </h1>
      {receipt.reference ? (
        <>
          <p className="mt-3 text-sm text-muted">Your reference</p>
          <p className="mt-1 select-all font-mono text-2xl font-semibold tracking-wide">{receipt.reference}</p>
        </>
      ) : null}
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">
        {receipt.duplicate
          ? 'This course choice is already being reviewed, so we did not create a second application. Quote the reference above if you contact us.'
          : `We emailed a confirmation to ${email.trim()}. Our admissions team will review your application and email you the decision.`}
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link to="/catalog" className="btn rounded-full border-line bg-base-200 text-sm">Back to courses</Link>
        <Link to="/login" className="btn rounded-full border-0 bg-brand text-sm text-white hover:bg-night">Sign in</Link>
      </div>
    </section>
  );
}
