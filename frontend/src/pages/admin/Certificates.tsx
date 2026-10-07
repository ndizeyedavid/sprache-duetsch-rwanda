import { useState } from "react";
import { AcademicModalAction } from "../../components/admin/AcademicModalAction";
import { AcademicSummary } from "../../components/admin/AcademicSummary";
import { CertificateIssueForm } from "../../components/admin/CertificateIssueForm";
import { CertificateRegister } from "../../components/admin/CertificateRegister";
import { CertificateRevokeDialog } from "../../components/admin/CertificateRevokeDialog";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import type { Certificate } from "../../lib/services";
import { listCertificates } from "../../lib/services";

export function AdminCertificates() {
  const issued = useApi("certificates-list", listCertificates);
  const [revoking, setRevoking] = useState<Certificate | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const rows = issued.data ?? [];
  return (
    <div className="space-y-5">
      {issued.data && (
        <AcademicSummary
          items={[
            {
              label: "Certificates",
              value: rows.length,
              note: "Certificate records",
            },
            {
              label: "Issued",
              value: rows.filter((c) => c.status === "ISSUED").length,
              note: "Current credentials",
            },
            {
              label: "Revoked",
              value: rows.filter((c) => c.status === "REVOKED").length,
              note: "Withdrawn credentials",
            },
          ]}
        />
      )}
      <Panel>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <SectionHeader title="Certificates" className="mb-0" />
          <AcademicModalAction
            label="Issue certificate"
            title="Issue certificate"
          >
            {(done) => (
              <CertificateIssueForm
                onIssued={() => {
                  issued.refetch();
                  done("Certificate issued.");
                }}
              />
            )}
          </AcademicModalAction>
        </div>
        {success && (
          <p
            role="status"
            className="alert alert-success alert-soft mb-4 text-xs"
          >
            {success}
          </p>
        )}
        {issued.loading ? (
          <LoadingBlock label="Loading certificates…" />
        ) : issued.error ? (
          <ErrorBlock message={issued.error} onRetry={issued.refetch} />
        ) : !rows.length ? (
          <EmptyBlock title="No certificates yet" />
        ) : (
          <CertificateRegister certificates={rows} onRevoke={setRevoking} />
        )}
      </Panel>
      {revoking && (
        <CertificateRevokeDialog
          certificate={revoking}
          onClose={() => setRevoking(null)}
          onRevoked={() => {
            issued.refetch();
            setRevoking(null);
            setSuccess("Certificate revoked.");
          }}
        />
      )}
    </div>
  );
}
