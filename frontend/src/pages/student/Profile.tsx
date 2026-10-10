import { useCallback,useMemo,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { AttendanceStanding } from '../../components/profile/AttendanceStanding';
import { CertificatePreview } from '../../components/profile/CertificatePreview';
import { ReceiptDocumentDialog } from '../../components/receipts/ReceiptDocumentDialog';
import { DEFAULT_VIEW,isProfileView } from '../../components/profile/constants';
import { DocumentsView } from '../../components/profile/DocumentsView';
import { FinanceSection } from '../../components/profile/FinanceSection';
import { ProfileDetails } from '../../components/profile/ProfileDetails';
import { ProfileIdentity } from '../../components/profile/ProfileIdentity';
import { ProfileStatStrip } from '../../components/profile/ProfileStatStrip';
import { ProfileViewTabs } from '../../components/profile/ProfileViewTabs';
import { ProgressSection } from '../../components/profile/ProgressSection';
import { SkillsSection } from '../../components/profile/SkillsSection';
import { TuitionStanding } from '../../components/profile/TuitionStanding';
import { useDocumentDownload } from '../../components/profile/useDocumentDownload';
import { clampPercent,levelTally } from '../../components/profile/utils';
import { useApi } from '../../hooks/useApi';
import type { Certificate,ReceiptRow } from '../../lib/services';
import {
getMyFinance,
getMyProfile,
getMyProgress,
getMyReceipts,
getMySkills,
listMyCertificates,
} from '../../lib/services';

export function Profile() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const view = isProfileView(requested) ? requested : DEFAULT_VIEW;
  const overview = view === 'overview';
  const documents = view === 'documents';

  const profile = useApi('my-profile', getMyProfile);
  const progress = useApi('my-progress', getMyProgress, overview);
  const skills = useApi('my-skills', getMySkills, overview);
  const finance = useApi('my-finance', getMyFinance, view === 'payments');
  const certificates = useApi('my-certificates', listMyCertificates, documents);
  const receipts = useApi('my-receipts', getMyReceipts, documents);

  const { pendingId, error: downloadError, download } = useDocumentDownload();
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<ReceiptRow | null>(null);

  const changeView = useCallback(
    (next: typeof view) => setParams(next === DEFAULT_VIEW ? {} : { view: next }, { replace: true }),
    [setParams],
  );

  const saveCertificate = useCallback(
    (certificate: Certificate) => void download(certificate.id, certificate.certificateNumber, `/certificates/${certificate.id}/pdf`),
    [download],
  );

  const saveReceipt = useCallback(
    (receipt: ReceiptRow) => void download(receipt.id, receipt.receiptNumber, `/payments/receipts/${receipt.id}/pdf`),
    [download],
  );

  const overall = useMemo(() => {
    const levels = progress.data?.levels ?? [];
    if (!levels.length) return clampPercent(progress.data?.overallPercentage);
    const done = levels.reduce((sum, level) => sum + levelTally(level).done, 0);
    const total = levels.reduce((sum, level) => sum + levelTally(level).total, 0);
    return total ? Math.round((done / total) * 100) : null;
  }, [progress.data]);

  const counts = {
    payments: finance.data?.finance ? 1 : 0,
    documents: (certificates.data?.length ?? 0) + (receipts.data?.length ?? 0),
  };

  if (profile.loading) return <LoadingBlock label="Loading your profile…" />;
  if (profile.error || !profile.data) {
    return <ErrorBlock message={profile.error ?? 'Could not load your profile.'} onRetry={profile.refetch} />;
  }

  const data = profile.data;

  return (
    <div className="space-y-4">
      <ProfileIdentity profile={data} />
      <ProfileViewTabs view={view} onChange={changeView} counts={counts} />

      <div id={`profile-panel-${view}`} role="tabpanel" aria-labelledby={`profile-tab-${view}`}>
        {overview ? (
          <div className="space-y-4">
            <ProfileStatStrip profile={data} overall={overall} />
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <AttendanceStanding attendance={data.attendance} />
              <TuitionStanding finance={data.finance} onOpenPayments={() => changeView('payments')} />
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <ProgressSection
                  levels={progress.data?.levels ?? []}
                  loading={progress.loading}
                  error={progress.error}
                  onRetry={progress.refetch}
                />
                <SkillsSection
                  skills={skills.data ?? null}
                  loading={skills.loading}
                  error={skills.error}
                  onRetry={skills.refetch}
                />
              </div>
              <ProfileDetails profile={data} onOpenDocuments={() => changeView('documents')} />
            </div>
          </div>
        ) : null}

        {view === 'payments' ? (
          <FinanceSection
            finance={finance.data ?? null}
            loading={finance.loading}
            error={finance.error}
            onRetry={finance.refetch}
          />
        ) : null}

        {documents ? (
          <DocumentsView
            certificates={certificates.data ?? null}
            certificatesLoading={certificates.loading}
            certificatesError={certificates.error}
            onRetryCertificates={certificates.refetch}
            receipts={receipts.data ?? null}
            receiptsLoading={receipts.loading}
            receiptsError={receipts.error}
            onRetryReceipts={receipts.refetch}
            pendingId={pendingId}
            downloadError={downloadError}
            onPreview={setPreview}
            onCertificateDownload={saveCertificate}
            onReceiptDownload={saveReceipt}
            onReceiptPreview={setReceiptPreview}
          />
        ) : null}
      </div>

      {receiptPreview ? <ReceiptDocumentDialog receipt={receiptPreview} onClose={() => setReceiptPreview(null)} /> : null}
      <CertificatePreview
        certificate={preview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
