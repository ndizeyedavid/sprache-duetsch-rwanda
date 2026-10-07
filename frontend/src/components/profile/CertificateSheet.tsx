import type { Certificate } from '../../lib/services';
import { isoDate } from '../../lib/services';

/** Signatory blocks mirror the official PDF in the backend certificate service. */
const SIGNATURES = [
  { mark: 'A. Mukamurenzi', name: 'Aline Mukamurenzi', role: 'Academic Director · Deutsch Sprache RW' },
  { mark: 'C. Uwase', name: 'Clarisse Uwase', role: 'Head of German Language Program' },
];

type Props = { certificate: Certificate; studentName: string };

/** Screen facsimile of the issued certificate: what the student gets, before the PDF. */
export function CertificateSheet({ certificate, studentName }: Props) {
  const name = certificate.student
    ? `${certificate.student.user.firstName} ${certificate.student.user.lastName}`
    : studentName;

  return (
    <div className="rounded-box border-2 border-sun bg-white p-4 text-night sm:p-6">
      <div className="rounded-box border border-line p-5 sm:p-8">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
          Deutsch Sprache Rwanda
        </p>
        <h4 className="mt-4 text-center text-xl font-semibold tracking-tight sm:text-2xl">
          Certificate of Achievement
        </h4>
        <div aria-hidden className="mx-auto mt-3 h-1 w-16 bg-sun" />

        <p className="mt-6 text-center text-xs text-muted">This is to certify that</p>
        <p className="mt-2 text-center text-2xl font-semibold sm:text-3xl">{name}</p>
        <div aria-hidden className="mx-auto mt-3 h-px w-40 bg-line" />
        <p className="mx-auto mt-4 max-w-md text-center text-xs leading-5 text-muted">
          has completed every requirement of the course below and is hereby recognised for outstanding academic
          achievement and commitment to linguistic excellence.
        </p>

        <div className="mt-6 flex items-stretch overflow-hidden rounded-box border border-line">
          <span aria-hidden className="w-1.5 shrink-0 bg-sun" />
          <div className="min-w-0 px-4 py-3">
            <p className="text-xs font-bold">{certificate.level.code}</p>
            <p className="text-sm font-semibold">{certificate.level.title}</p>
            <p className="mt-1 text-[10px] leading-4 text-muted">
              Authorized by Deutsch Sprache RW · CEFR-aligned · Kigali, Rwanda
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {SIGNATURES.map((signatory) => (
            <div key={signatory.name} className="text-center">
              <p className="text-sm italic">{signatory.mark}</p>
              <div aria-hidden className="mx-auto mt-2 h-px w-36 bg-sun" />
              <p className="mt-2 text-xs font-semibold">{signatory.name}</p>
              <p className="mt-1 text-[10px] leading-4 text-muted">{signatory.role}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
          <p className="font-mono text-[10px] leading-4 text-muted">
            {certificate.certificateNumber}
            <br />
            Issued {isoDate(certificate.issuedAt)} · verify /verify/{certificate.verificationCode}
          </p>
          <div className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-sun text-center text-[9px] font-bold leading-tight">
            Deutsch
            <br />
            Sprache RW
          </div>
        </div>
      </div>
    </div>
  );
}