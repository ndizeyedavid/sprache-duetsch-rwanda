import { FiShield } from 'react-icons/fi';
import type { CertificateVerification } from '../../lib/services';
import { humanize,isoDate } from '../../lib/services';
import { EmptyBlock } from '../common/PageState';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';

export function CertificateRecord({ data }: { data: CertificateVerification }) {
  return <Panel>
    <div className="flex flex-wrap items-start justify-between gap-3"><div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Certificate verification</p>
      <h1 className="mt-1 text-xl font-bold leading-tight">{data.studentName}</h1>
      <p className="mt-1 text-sm text-muted">{data.studentCode} · {data.levelCode} · {data.levelTitle}</p>
    </div><StatusBadge status={data.valid ? 'Valid' : humanize(data.status)} /></div>
    <dl className="mt-4 grid gap-3 rounded-box border border-line bg-base-100 p-3 text-sm sm:grid-cols-2">
      <div><dt className="text-xs text-muted">Certificate No</dt><dd className="font-mono font-medium">{data.certificateNumber}</dd></div>
      <div><dt className="text-xs text-muted">Verification</dt><dd className="font-mono text-xs">{data.verificationCode}</dd></div>
      <div><dt className="text-xs text-muted">Issued</dt><dd className="font-medium">{isoDate(data.issuedAt)}</dd></div>
      <div><dt className="text-xs text-muted">Status</dt><dd className="font-medium">{data.valid ? 'Valid — confirmed by Deutsch Sprache RW' : humanize(data.status)}</dd></div>
    </dl>
    {!data.valid ? <div className="mt-4"><EmptyBlock title="Not valid" hint="This certificate was revoked. Contact the school for details." /></div> :
      <p className="mt-3 flex items-center gap-1.5 rounded-box bg-success/10 px-3 py-2 text-xs font-medium text-success"><FiShield aria-hidden /> Verified — this learner completed the course and is recorded in the school registry.</p>}
  </Panel>;
}
