import { FiAward,FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { humanize } from '../../lib/services/humanize';
import { listStudentCertificates } from '../../lib/services/list-student-certificates';
import { SectionState } from '../profile/SectionState';
import { useDocumentDownload } from '../profile/useDocumentDownload';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { shortDate } from './utils';

export function CertificatesTab({ studentId }: { studentId: string }) {
  const certificates = useApi(`student-certificates-${studentId}`, () => listStudentCertificates(studentId));
  const { pendingId, error, download } = useDocumentDownload();
  const rows = certificates.data ?? [];

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiAward aria-hidden className="text-brand" />Certificates
        </h2>
        <Link to="/admin/certificates" className="text-xs font-semibold text-brand hover:underline">Issue or revoke</Link>
      </div>
      {error ? <p role="alert" className="mt-2 text-xs text-error">{error}</p> : null}
      <div className="mt-3">
        <SectionState
          loading={certificates.loading}
          loadingLabel="Loading certificates…"
          error={certificates.error}
          onRetry={certificates.refetch}
          isEmpty={!rows.length}
          emptyTitle="No certificates yet"
          emptyHint="Certificates are issued once the student meets a level's completion rules."
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {rows.map((row) => (
              <li key={row.id} className="rounded-box border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{row.level.code} · {row.level.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">{row.certificateNumber}</p>
                  </div>
                  <StatusBadge status={humanize(row.status)} className="px-3 py-1" />
                </div>
                <p className="mt-2 text-xs text-muted">
                  Issued {shortDate(row.issuedAt)}
                  {row.revokedAt ? ` · revoked ${shortDate(row.revokedAt)}${row.revokeReason ? ` (${row.revokeReason})` : ''}` : ''}
                </p>
                <button
                  type="button"
                  disabled={pendingId === row.id}
                  onClick={() => void download(row.id, row.certificateNumber, `/certificates/${row.id}/pdf`)}
                  className="btn btn-sm mt-3 gap-2 rounded-full"
                >
                  <FiDownload aria-hidden />{pendingId === row.id ? 'Downloading…' : 'Download PDF'}
                </button>
              </li>
            ))}
          </ul>
        </SectionState>
      </div>
    </Panel>
  );
}
