import { FiDownload,FiEye } from 'react-icons/fi';
import type { Certificate } from '../../lib/services';
import { humanize,isoDate } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { SectionState } from './SectionState';

type Props = {
  certificates: Certificate[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  pendingId: string | null;
  onPreview: (certificate: Certificate) => void;
  onDownload: (certificate: Certificate) => void;
};

export function CertificatesCard({
  certificates,
  loading,
  error,
  onRetry,
  pendingId,
  onPreview,
  onDownload,
}: Props) {
  const rows = certificates ?? [];

  return (
    <Panel padded={false}>
      <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold">
        Certificates
        {certificates ? (
          <span className="ml-auto text-xs font-normal text-muted">{certificates.length}</span>
        ) : null}
      </h2>

      <SectionState
        loading={loading}
        loadingLabel="Loading your certificates…"
        error={error}
        onRetry={onRetry}
        isEmpty={!rows.length}
        emptyTitle="No certificates yet"
        emptyHint="Finish every lesson and pass the final exam to earn one."
      >
        <ul>
          {rows.map((certificate) => (
            <li
              key={certificate.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {certificate.level.code} · {certificate.level.title}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {certificate.certificateNumber} · {isoDate(certificate.issuedAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={humanize(certificate.status)} />
                <button
                  type="button"
                  onClick={() => onPreview(certificate)}
                  disabled={certificate.status !== 'ISSUED'}
                  className="btn btn-ghost btn-xs gap-1.5 rounded-full border border-line"
                >
                  <FiEye aria-hidden size={12} />
                  Preview
                </button>
                <button
                  type="button"
                  disabled={pendingId === certificate.id || certificate.status !== 'ISSUED'}
                  onClick={() => onDownload(certificate)}
                  className="btn btn-primary btn-xs gap-1.5 rounded-full"
                >
                  {pendingId === certificate.id ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <FiDownload aria-hidden size={12} />
                  )}
                  PDF
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionState>
    </Panel>
  );
}
