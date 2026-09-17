import { useState } from 'react';
import { Panel } from '../../components/ui/Panel';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, downloadFile } from '../../lib/api';
import { rwf } from '../../lib/format';
import {
 getMyFinance,
 getMyProfile,
 getMyProgress,
 getMyReceipts,
 getMySkills,
 humanize,
 isoDate,
 listMyCertificates,
 money,
} from '../../lib/services';

export function Profile() {
 const profile = useApi('my-profile', getMyProfile);
 const progress = useApi('my-progress', getMyProgress);
 const finance = useApi('my-finance', getMyFinance);
 const certificates = useApi('my-certificates', listMyCertificates);
 const receipts = useApi('my-receipts', getMyReceipts);
 const skills = useApi('my-skills', getMySkills);
 const [downloadError, setDownloadError] = useState<string | null>(null);
 const [downloadingId, setDownloadingId] = useState<string | null>(null);

 async function handleDownload(id: string, number: string) {
 setDownloadError(null);
 setDownloadingId(id);
 try {
 await downloadFile(`/certificates/${id}/pdf`, `certificate-${number}.pdf`);
 } catch (err) {
 setDownloadError(apiErrorMessage(err, 'Could not download the certificate.'));
 } finally {
 setDownloadingId(null);
 }
 }

 async function handleReceiptDownload(id: string, number: string) {
 setDownloadError(null);
 setDownloadingId(id);
 try {
 await downloadFile(`/payments/receipts/${id}/pdf`, `${number}.pdf`);
 } catch (err) {
 setDownloadError(apiErrorMessage(err, 'Could not download the receipt.'));
 } finally {
 setDownloadingId(null);
 }
 }

 if (profile.loading) return <LoadingBlock label="Loading your profile…" />;
 if (profile.error || !profile.data) {
 return <ErrorBlock message={profile.error ?? 'Could not load your profile.'} onRetry={profile.refetch} />;
 }

 const data = profile.data;
 const levels = progress.data?.levels ?? [];

 return (
 <div className="grid gap-5 lg:grid-cols-3">
 <Panel className="lg:col-span-1">
 <span className="flex size-20 items-center justify-center rounded-full bg-brand-tint text-2xl font-bold text-brand">
 {data.user.firstName.charAt(0)}
 {data.user.lastName.charAt(0)}
 </span>
 <h1 className="mt-3 text-xl font-semibold">
 {data.user.firstName} {data.user.lastName}
 </h1>
 <p className="mt-1 text-xs text-muted">{data.user.email}</p>
 <p className="mt-0.5 text-xs text-muted">Student ID · {data.studentCode}</p>
 <div className="mt-3 flex flex-wrap gap-2">
 <StatusBadge status={humanize(data.user.status)} />
 {data.finance ? <StatusBadge status={humanize(data.finance.status)} /> : null}
 </div>

 <dl className="mt-5 space-y-3 text-sm">
 <div className="flex items-center justify-between gap-3">
 <dt className="text-muted">Campus</dt>
 <dd className="font-medium">{data.campus?.name ?? '—'}</dd>
 </div>
 <div className="flex items-center justify-between gap-3">
 <dt className="text-muted">Intake</dt>
 <dd className="font-medium">{data.intake?.name ?? '—'}</dd>
 </div>
 <div className="flex items-center justify-between gap-3">
 <dt className="text-muted">Current level</dt>
 <dd className="font-medium">{data.currentLevel?.code ?? '—'}</dd>
 </div>
 <div className="flex items-center justify-between gap-3">
 <dt className="text-muted">Certificates</dt>
 <dd className="font-medium">{data.certificates}</dd>
 </div>
 <div className="flex items-center justify-between gap-3">
 <dt className="text-muted">Lessons done</dt>
 <dd className="font-medium">{data.lessonsCompleted}</dd>
 </div>
 </dl>
 </Panel>

 <div className="space-y-5 lg:col-span-2">
 <Panel>
 <h2 className="mb-4 text-base font-semibold">Learning progress</h2>
 {progress.loading ? (
 <LoadingBlock label="Loading progress…" />
 ) : progress.error ? (
 <ErrorBlock message={progress.error} onRetry={progress.refetch} />
 ) : levels.length === 0 ? (
 <EmptyBlock title="No progress yet" hint="Start a lesson to track your progress." />
 ) : (
 <div className="space-y-4">
 {levels.map((level) => (
 <div key={level.id}>
 <div className="mb-1 flex items-center justify-between gap-3 text-xs">
 <span className="font-semibold">
 {level.code} · {level.title}
 </span>
 <span className="text-muted">{level.completionPercentage}%</span>
 </div>
 <ProgressBar value={level.completionPercentage} tone="brand" />
 </div>
 ))}
 </div>
 )}
 </Panel>

 <Panel>
 <h2 className="mb-4 text-base font-semibold">Skills</h2>
 {skills.loading ? (
 <LoadingBlock label="Loading skills…" />
 ) : skills.error ? (
 <ErrorBlock message={skills.error} onRetry={skills.refetch} />
 ) : !skills.data || skills.data.length === 0 ? (
 <EmptyBlock title="No graded work yet" hint="Skill scores appear once your exams are graded." />
 ) : (
 <div className="space-y-4">
 {skills.data.map((skill) => (
 <div key={skill.skill}>
 <div className="mb-1 flex items-center justify-between gap-3 text-xs">
 <span className="font-semibold">{humanize(skill.skill)}</span>
 <span className="text-muted">
 {skill.earned}/{skill.possible} · {skill.percentage}%
 </span>
 </div>
 <ProgressBar value={skill.percentage} tone="sun" />
 </div>
 ))}
 </div>
 )}
 </Panel>

 <Panel>
 <h2 className="mb-4 text-base font-semibold">Certificates</h2>
 {certificates.loading ? (
 <LoadingBlock label="Loading certificates…" />
 ) : certificates.error ? (
 <ErrorBlock message={certificates.error} onRetry={certificates.refetch} />
 ) : !certificates.data || certificates.data.length === 0 ? (
 <EmptyBlock
 title="No certificates yet"
 hint="Finish all lessons and pass the final exam to earn your first certificate."
 />
 ) : (
 <ul className="space-y-3">
 {certificates.data.map((certificate) => (
 <li
 key={certificate.id}
 className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2"
 >
 <div className="min-w-0">
 <p className="truncate text-xs font-semibold">
 {certificate.level.code} · {certificate.level.title}
 </p>
 <p className="font-mono text-[11px] text-muted">
 {certificate.certificateNumber} · {isoDate(certificate.issuedAt)}
 </p>
 </div>
 <span className="flex items-center gap-2">
 <StatusBadge status={humanize(certificate.status)} />
 <button
 type="button"
 disabled={downloadingId === certificate.id}
 onClick={() => handleDownload(certificate.id, certificate.certificateNumber)}
 className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
 >
 PDF
 </button>
 </span>
 </li>
 ))}
 </ul>
 )}
 {downloadError ? (
 <p role="alert" className="mt-3 text-xs font-medium text-error">
 {downloadError}
 </p>
 ) : null}
 <p className="mt-3 text-[11px] text-muted">
 Third parties can verify any certificate at <span className="font-mono">/verify/&lt;code&gt;</span>{' '}
 using the QR code on the PDF.
 </p>
 </Panel>

 <Panel>
 <h2 className="mb-4 text-base font-semibold">Receipts</h2>
 {receipts.loading ? (
 <LoadingBlock label="Loading receipts…" />
 ) : receipts.error ? (
 <ErrorBlock message={receipts.error} onRetry={receipts.refetch} />
 ) : !receipts.data || receipts.data.length === 0 ? (
 <EmptyBlock title="No receipts yet" hint="A receipt is generated for every confirmed payment." />
 ) : (
 <ul className="space-y-3">
 {receipts.data.map((receipt) => (
 <li
 key={receipt.id}
 className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2"
 >
 <div className="min-w-0">
 <p className="truncate font-mono text-xs font-semibold">{receipt.receiptNumber}</p>
 <p className="text-[11px] text-muted">
 {receipt.payment.method?.name ?? '—'} · {isoDate(receipt.payment.paidAt)}
 </p>
 </div>
 <button
 type="button"
 disabled={downloadingId === receipt.id}
 onClick={() => handleReceiptDownload(receipt.id, receipt.receiptNumber)}
 className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
 >
 PDF
 </button>
 </li>
 ))}
 </ul>
 )}
 </Panel>

 <Panel>
 <h2 className="mb-4 text-base font-semibold">Payments</h2>
 {finance.loading ? (
 <LoadingBlock label="Loading payments…" />
 ) : finance.error || !finance.data ? (
 <ErrorBlock message={finance.error ?? 'Could not load payments.'} onRetry={finance.refetch} />
 ) : !finance.data.finance ? (
 <EmptyBlock title="No charges yet" hint="Tuition charges will appear here once enrolled." />
 ) : (
 <dl className="grid gap-3 text-sm sm:grid-cols-3">
 <div className="rounded-field bg-base-200 p-3">
 <dt className="text-[11px] text-muted">Total due</dt>
 <dd className="mt-1 font-semibold">{rwf(money(finance.data.finance.totalDue))}</dd>
 </div>
 <div className="rounded-field bg-base-200 p-3">
 <dt className="text-[11px] text-muted">Total paid</dt>
 <dd className="mt-1 font-semibold text-brand">{rwf(money(finance.data.finance.totalPaid))}</dd>
 </div>
 <div className="rounded-field bg-base-200 p-3">
 <dt className="text-[11px] text-muted">Balance</dt>
 <dd className="mt-1 font-semibold">{rwf(money(finance.data.finance.balance))}</dd>
 </div>
 </dl>
 )}
 </Panel>
 </div>
 </div>
 );
}
