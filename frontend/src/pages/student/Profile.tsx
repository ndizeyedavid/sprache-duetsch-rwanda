import { useState } from "react";
import { Link } from "react-router-dom";
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
      <Panel>
        <ProfileHeader profile={data} />
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-box bg-base-200 px-3 py-2"><span className="text-xs text-muted">Campus</span><p className="font-medium">{data.campus?.name ?? "—"}</p></div>
          <div className="rounded-box bg-base-200 px-3 py-2"><span className="text-xs text-muted">Intake</span><p className="font-medium">{data.intake?.name ?? "—"}</p></div>
          <div className="rounded-box bg-base-200 px-3 py-2"><span className="text-xs text-muted">Current level</span><p className="font-medium">{data.currentLevel ? `${data.currentLevel.code} · ${data.currentLevel.title}` : "—"}</p></div>
          <div className="rounded-box bg-base-200 px-3 py-2"><span className="text-xs text-muted">Intended level</span><p className="font-medium">{data.intendedLevel ? `${data.intendedLevel.code} · ${data.intendedLevel.title}` : "—"}</p></div>
        </div>
        {data.enrollments.length ? <div className="mt-3 flex flex-wrap gap-1.5">{data.enrollments.map((e, i) => <span key={i} className="badge badge-sm">{e.level.code}{e.classGroup ? ` · ${e.classGroup.name}` : ""}</span>)}</div> : null}
        <div className="mt-3 flex gap-2">
          <Link to="/grades" className="btn btn-sm rounded-full border-line bg-base-100">View grades</Link>
          <Link to="/settings" className="btn btn-sm rounded-full border-line bg-base-100">Settings</Link>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Panel>
            <h2 className="text-sm font-bold">Learning progress</h2>
            <p className="text-xs text-muted">Per level — modules and lesson completion</p>
            <div className="mt-3"><ProgressSection levels={progress.data?.levels ?? []} loading={progress.loading} error={progress.error} onRetry={progress.refetch} /></div>
          </Panel>
          <Panel>
            <h2 className="text-sm font-bold">Skills</h2>
            <div className="mt-3"><SkillsSection skills={skills.data ?? null} loading={skills.loading} error={skills.error} onRetry={skills.refetch} /></div>
          </Panel>
        </div>
        <div className="space-y-4 lg:col-span-5">
          <Panel>
            <h2 className="text-sm font-bold">Finance</h2>
            <div className="mt-3"><FinanceSection finance={finance.data ?? null} loading={finance.loading} error={finance.error} onRetry={finance.refetch} /></div>
          </Panel>
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
        </div>
      </div>
    </div>
  );
}
