import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { ProfileDetails } from "../../components/profile/ProfileDetails";
import { Panel } from "../../components/ui/Panel";
import { ErrorBlock, LoadingBlock } from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage, downloadFile } from "../../lib/api";
import { getMyFinance, getMyProfile, getMyProgress, getMyReceipts, getMySkills, listMyCertificates } from "../../lib/services";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProgressSection } from "../../components/profile/ProgressSection";
import { SkillsSection } from "../../components/profile/SkillsSection";
import { FinanceSection } from "../../components/profile/FinanceSection";
import { DocsSection } from "../../components/profile/DocsSection";

export function Profile() {
  const [params, setParams] = useSearchParams();
  const view = ["overview", "documents", "payments"].includes(params.get("view") ?? "") ? params.get("view") : "overview";
  const profile = useApi("my-profile", getMyProfile);
  const progress = useApi("my-progress", getMyProgress);
  const finance = useApi("my-finance", getMyFinance);
  const certificates = useApi("my-certificates", listMyCertificates);
  const receipts = useApi("my-receipts", getMyReceipts);
  const skills = useApi("my-skills", getMySkills);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(id: string, num: string, path: string) {
    setDownloadError(null);
    setDownloadingId(id);
    try { await downloadFile(path, `${num}.pdf`); } catch (err) { setDownloadError(apiErrorMessage(err, "Could not download file.")); } finally { setDownloadingId(null); }
  }

  if (profile.loading) return <LoadingBlock label="Loading your profile…" />;
  if (profile.error || !profile.data) return <ErrorBlock message={profile.error ?? "Could not load your profile."} onRetry={profile.refetch} />;

  const data = profile.data;

  return (
    <div className="space-y-4">
      <ProfileHeader profile={data} />
      <ProfileStats profile={data} overall={progress.data?.overallPercentage ?? null} />
      <nav aria-label="Profile sections" className="flex flex-wrap gap-2">
        {[['overview', 'Overview'], ['documents', 'Documents'], ['payments', 'Payments']].map(([key, label]) => <button key={key} type="button" aria-pressed={view === key} onClick={() => setParams(key === 'overview' ? {} : { view: key }, { replace: true })} className={`btn btn-sm rounded-full ${view === key ? 'btn-neutral' : 'btn-ghost bg-base-100'}`}>{label}</button>)}
      </nav>
      {view === 'overview' ? <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel><h2 className="mb-4 text-base font-semibold">Learning journey</h2><ProgressSection levels={progress.data?.levels ?? []} loading={progress.loading} error={progress.error} onRetry={progress.refetch} /></Panel>
          <Panel><h2 className="mb-4 text-base font-semibold">My skills</h2><SkillsSection skills={skills.data ?? null} loading={skills.loading} error={skills.error} onRetry={skills.refetch} /></Panel>
        </div>
        <ProfileDetails profile={data} />
      </div> : null}
      {view === 'payments' ? <Panel><h2 className="mb-4 text-base font-semibold">Payment overview</h2><FinanceSection finance={finance.data ?? null} loading={finance.loading} error={finance.error} onRetry={finance.refetch} /></Panel> : null}
      {view === 'documents' ? (
          <DocsSection
            certificates={certificates.data ?? null}
            receipts={receipts.data ?? null}
            certLoading={certificates.loading}
            certError={certificates.error}
            receiptLoading={receipts.loading}
            receiptError={receipts.error}
            onCertRetry={certificates.refetch}
            onReceiptRetry={receipts.refetch}
            downloadingId={downloadingId}
            downloadError={downloadError}
            onDownloadCert={(id, num) => void handleDownload(id, num, `/certificates/${id}/pdf`)}
            onDownloadReceipt={(id, num) => void handleDownload(id, num, `/payments/receipts/${id}/pdf`)}
          />
      ) : null}
    </div>
  );
}
