import { useState } from "react";
import { FiEye, FiX } from "react-icons/fi";
import { StatusBadge } from "../ui/StatusBadge";
import { humanize, isoDate } from "../../lib/services";
import type { Certificate, ReceiptRow } from "../../lib/services";

type Props = {
  certificates: Certificate[] | null;
  receipts: ReceiptRow[] | null;
  certLoading: boolean;
  certError: string | null;
  receiptLoading: boolean;
  receiptError: string | null;
  onCertRetry: () => void;
  onReceiptRetry: () => void;
  downloadingId: string | null;
  downloadError: string | null;
  onDownloadCert: (id: string, num: string) => void;
  onDownloadReceipt: (id: string, num: string) => void;
};

export function DocsSection({
  certificates,
  receipts,
  certLoading,
  certError,
  receiptLoading,
  receiptError,
  onCertRetry,
  onReceiptRetry,
  downloadingId,
  downloadError,
  onDownloadCert,
  onDownloadReceipt,
}: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewCert = previewId ? certificates?.find((c) => c.id === previewId) ?? null : null;
  return (
    <div className="space-y-4">
      <div className="rounded-box border border-line bg-base-100 p-4">
        <h3 className="text-sm font-bold">Certificates</h3>
        {certLoading ? (
          <p className="py-4 text-center text-sm text-muted">Loading…</p>
        ) : certError ? (
          <div className="py-2 text-center">
            <p className="text-xs text-error">{certError}</p>
            <button
              type="button"
              onClick={onCertRetry}
              className="btn btn-xs mt-2 rounded-full border-line bg-base-100"
            >
              Retry
            </button>
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            No certificates yet — finish all lessons and pass the final exam.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {certificates.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-box border border-line bg-base-100 px-3 py-2 hover:border-brand/20"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">
                    {c.level.code} · {c.level.title}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {c.certificateNumber} · {isoDate(c.issuedAt)}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusBadge status={humanize(c.status)} />
                  <button
                    type="button"
                    onClick={() => setPreviewId(c.id)}
                    className="btn btn-xs gap-1 rounded-full border-line bg-base-100"
                  >
                    <FiEye aria-hidden size={12} />
                    Preview
                  </button>
                  <button
                    type="button"
                    disabled={downloadingId === c.id}
                    onClick={() => onDownloadCert(c.id, c.certificateNumber)}
                    className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
                  >
                    PDF
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

      {previewCert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={() => setPreviewId(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-box bg-base-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h4 className="text-sm font-bold">
                {previewCert.level.code} · {previewCert.level.title}
              </h4>
              <button type="button" onClick={() => setPreviewId(null)} className="btn btn-ghost btn-xs btn-circle">
                <FiX aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#fdfbf7] p-4">
              {/* Mini certificate preview — mirrors new PDF: flag, centred logo, gold seal */}
              <div className="mx-auto max-h-[520px] max-w-[640px] overflow-hidden rounded-box border-[1.5px] border-[#c5a253] bg-[#fdfbf7] shadow-lg">
                {/* Flag top */}
                <div className="flex h-1.5 w-full">
                  <span className="flex-1 bg-black" />
                  <span className="flex-1 bg-[#dd0000]" />
                  <span className="flex-1 bg-[#ffce00]" />
                </div>
                <div className="px-6 py-5 text-center">
                  <img src="/logo.png" alt="Deutsch Sprache RW" className="mx-auto h-14 w-14 rounded-full border border-[#e7d9b0] bg-white object-contain p-1" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#c5a253]">Deutsch Sprache RW • Kigali</p>
                  <div className="mx-auto mt-2 flex w-40 items-center gap-2">
                    <span className="h-px flex-1 bg-[#e7d9b0]" />
                    <span className="flex gap-1">
                      <span className="h-1 w-6 bg-black" />
                      <span className="h-1 w-6 bg-[#dd0000]" />
                      <span className="h-1 w-6 bg-[#ffce00]" />
                    </span>
                    <span className="h-px flex-1 bg-[#e7d9b0]" />
                  </div>
                  <p className="mt-2 text-lg font-bold tracking-wide text-[#0f204b]">ZERTIFIKAT</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted">Certificate of Achievement</p>

                  <p className="mt-4 text-[11px] text-muted">This is to certify that</p>
                  <p className="mt-1 font-serif text-base font-bold text-[#0f204b]">Certificate Holder</p>
                  <div className="mx-auto mt-2 h-px w-40 bg-[#c5a253]" />
                  <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-[#1f2937]">
                    has demonstrated exceptional dedication and excellence in mastering the German language
                  </p>
                  <div className="mx-auto mt-3 flex max-w-[380px] items-center gap-2 rounded-lg border border-[#f4e8c1] bg-white px-3 py-2 text-left">
                    <span className="h-8 w-1 shrink-0 rounded bg-[#c5a253]" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-[#0f204b]">{previewCert.level.code} — {previewCert.level.title}</span>
                      <span className="block text-[10px] text-muted">Authorized by Deutsch Sprache RW • CEFR-aligned</span>
                    </span>
                  </div>
                  <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="font-serif text-xs italic">A. Mukamurenzi</p>
                      <div className="mt-1 h-px bg-[#c5a253]" />
                      <p className="mt-1 text-[10px] font-bold">Aline Mukamurenzi</p>
                      <p className="text-[10px] text-muted">Academic Director</p>
                    </div>
                    <div>
                      <p className="font-serif text-xs italic">C. Uwase</p>
                      <div className="mt-1 h-px bg-[#c5a253]" />
                      <p className="mt-1 text-[10px] font-bold">Clarisse Uwase</p>
                      <p className="text-[10px] text-muted">Head of Program</p>
                    </div>
                  </div>
                  <p className="mt-4 font-mono text-[10px] text-muted">{previewCert.certificateNumber} · {previewCert.verificationCode}</p>
                  <a href={`/verify/${previewCert.verificationCode}`} className="mt-1 inline-block text-xs font-medium text-brand hover:underline">
                    Verify at /verify/{previewCert.verificationCode} →
                  </a>
                </div>
                <div className="flex h-1.5 w-full">
                  <span className="flex-1 bg-black" />
                  <span className="flex-1 bg-[#dd0000]" />
                  <span className="flex-1 bg-[#ffce00]" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-line bg-base-100 px-4 py-3">
              <button type="button" onClick={() => setPreviewId(null)} className="btn btn-sm rounded-full border-line bg-base-100">
                Close
              </button>
              <button
                type="button"
                disabled={downloadingId === previewCert.id}
                onClick={() => onDownloadCert(previewCert.id, previewCert.certificateNumber)}
                className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>

      <div className="rounded-box border border-line bg-base-100 p-4">
        <h3 className="text-sm font-bold">Receipts</h3>
        {receiptLoading ? (
          <p className="py-4 text-center text-sm text-muted">Loading…</p>
        ) : receiptError ? (
          <div className="py-2 text-center">
            <p className="text-xs text-error">{receiptError}</p>
            <button
              type="button"
              onClick={onReceiptRetry}
              className="btn btn-xs mt-2 rounded-full border-line bg-base-100"
            >
              Retry
            </button>
          </div>
        ) : !receipts || receipts.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            No receipts yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {receipts.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-box bg-base-200 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-xs font-semibold">
                    {r.receiptNumber}
                  </span>
                  <span className="text-xs text-muted">
                    {r.payment.method?.name ?? "—"} ·{" "}
                    {isoDate(r.payment.paidAt)}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={downloadingId === r.id}
                  onClick={() => onDownloadReceipt(r.id, r.receiptNumber)}
                  className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
                >
                  PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {downloadError ? (
        <p role="alert" className="text-xs font-medium text-error">
          {downloadError}
        </p>
      ) : null}
    </div>
  );
}
