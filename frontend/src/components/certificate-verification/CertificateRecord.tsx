import { useState } from 'react';
import { FiCheck, FiLink } from 'react-icons/fi';
import type { CertificateVerification } from '../../lib/services';
import { longDate } from './format';
import { VerifyStatus } from './VerifyStatus';

/** Public certificate check: who, which course, when, and whether it is still valid. */
export function CertificateRecord({ data }: { data: CertificateVerification }) {
  const [copied, setCopied] = useState(false);
  const facts = [
    { label: 'Completed on', value: longDate(data.completionDate) },
    { label: 'Issued on', value: longDate(data.issuedAt) },
    { label: 'Certificate number', value: data.certificateNumber, mono: true },
  ];
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
    catch { /* Clipboard can be blocked; the address bar still has the link. */ }
  }
  return (
    <article className="page-enter overflow-hidden rounded-[1.75rem] border border-base-300 bg-base-100">
      <VerifyStatus valid={data.valid} revokedAt={data.revokedAt} />
      <div className={`relative overflow-hidden px-6 py-9 sm:px-10 sm:py-12 ${data.valid ? '' : 'opacity-70'}`}>
        <img src="/logo.png" alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-10 size-72 opacity-[0.05]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand">Certificate of completion</p>
        <p className="mt-7 text-sm text-muted">{data.valid ? 'This confirms that' : 'This was issued to'}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{data.studentName}</h1>
        <p className="mt-6 text-sm text-muted">completed the course</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-brand px-2.5 py-1 text-sm font-bold text-white">{data.levelCode}</span>
          <span className="text-lg font-semibold sm:text-xl">{data.levelTitle}</span>
        </div>
        {data.grade ? <p className="mt-4 inline-flex rounded-full bg-brand text-primary-content px-3 py-1 text-sm font-medium text-brand">{data.grade}</p> : null}

        <dl className="mt-9 grid gap-px overflow-hidden rounded-box border border-base-300 bg-base-300 sm:grid-cols-3">
          {facts.map(fact => (
            <div key={fact.label} className="bg-base-100 p-4">
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className={`mt-1 font-semibold ${fact.mono ? 'font-mono text-sm' : ''}`}>{fact.value}</dd>
            </div>
          ))}
        </dl>
        {data.issuedBy ? <p className="mt-6 text-sm text-muted">Signed by <span className="font-semibold text-base-content">{data.issuedBy}</span>{data.issuedByRole ? `, ${data.issuedByRole}` : ''}</p> : null}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 bg-base-200 px-6 py-4 sm:px-10">
        <p className="text-xs text-muted">Verification code <span className="ml-1 font-mono text-base-content">{data.verificationCode}</span></p>
        <button type="button" onClick={() => void copyLink()} className="btn btn-ghost btn-sm rounded-full">
          {copied ? <FiCheck aria-hidden /> : <FiLink aria-hidden />}{copied ? 'Link copied' : 'Copy link'}
        </button>
      </footer>
    </article>
  );
}
