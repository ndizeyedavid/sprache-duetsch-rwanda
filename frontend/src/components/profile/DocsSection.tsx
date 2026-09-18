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
                className="flex items-center justify-between gap-3 rounded-box bg-base-200 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">
                    {c.level.code} · {c.level.title}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {c.certificateNumber} · {isoDate(c.issuedAt)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={humanize(c.status)} />
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
