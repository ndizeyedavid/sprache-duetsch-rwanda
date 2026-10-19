import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { WORKSPACE_CONTEXT } from "../../components/admin/workspace-context";
import { heroAction,heroGhost } from "../../components/hero/hero-actions";
import { PageHero } from "../../components/hero/PageHero";
import { CertificateComposer } from '../../components/certificates/CertificateComposer';
import { CertificateDocumentDialog } from '../../components/certificates/CertificateDocumentDialog';
import { Modal } from '../../components/ui/Modal';
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

const context = WORKSPACE_CONTEXT.certificates;

export function AdminCertificates() {
  const issued = useApi("certificates-list", listCertificates);
  const [revoking, setRevoking] = useState<Certificate | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [composing, setComposing] = useState<Certificate | 'new' | null>(null);
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [busy, setBusy] = useState(false);
  const rows = issued.data ?? [];
  const count = (status: Certificate["status"]) => rows.filter((c) => c.status === status).length;
  return (
    <div className="space-y-5">
      <PageHero eyebrow={context.category} icon={context.icon} title="Certificates" art="certificates" scoped
        description="Prepare, preview and verify certificates for learners who completed their level."
        meta={issued.data ? <>
          <span className="hero-chip hero-chip-solid">{rows.length} {rows.length === 1 ? "record" : "records"}</span>
          <span className="hero-chip">{count("ISSUED")} issued</span>
          <span className="hero-chip">{count("REVOKED")} revoked</span>
        </> : null}
        actions={<>
          <button type="button" className={heroAction} onClick={() => setComposing('new')}><FiPlus aria-hidden />Prepare certificate</button>
          {context.links.map((link) => <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>)}
        </>} />
      <Panel>
        <SectionHeader title="Certificate register" />
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
          <CertificateRegister certificates={rows} onRevoke={setRevoking} onPreview={setPreview} onReissue={setComposing}/>
        )}
      </Panel>
      <Modal open={composing !== null} busy={busy} onClose={() => setComposing(null)} title={composing === 'new' ? 'Prepare a certificate' : 'Prepare a replacement certificate'} boxClassName="max-w-7xl">
        {composing && <CertificateComposer initial={composing === 'new' ? undefined : composing} onBusyChange={setBusy} onIssued={certificate => {
          setComposing(null); setPreview(certificate); setSuccess('Certificate issued and added to the student’s profile.'); issued.refetch();
        }}/>}
      </Modal>
      {preview && <CertificateDocumentDialog certificate={preview} onClose={() => setPreview(null)}/>}
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
