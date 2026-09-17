import { Link, useParams } from "react-router-dom";
import { Logo } from "../components/ui/Logo";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import {
 EmptyBlock,
 ErrorBlock,
 LoadingBlock,
} from "../components/common/PageState";
import { useApi } from "../hooks/useApi";
import { humanize, isoDate, verifyCertificate } from "../lib/services";

export function VerifyCertificate() {
 const { code = "" } = useParams();
 const result = useApi(`verify-${code}`, () => verifyCertificate(code));

 return (
 <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
 <div className="w-full max-w-md">
 <Link to="/" className="mb-8 flex justify-center">
 <Logo size={44} withWordmark wordmarkClassName="text-ink" />
 </Link>
 <Panel>
 <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
 Certificate verification
 </p>
 {result.loading ? (
 <LoadingBlock label="Verifying…" />
 ) : result.error || !result.data ? (
 <div>
 <ErrorBlock
 message={result.error ?? "Verification failed."}
 onRetry={result.refetch}
 />
 <p className="mt-2 font-mono text-xs text-muted">{code}</p>
 </div>
 ) : (
 <div className="mt-2">
 <StatusBadge
 status={
 result.data.valid ? "Valid" : humanize(result.data.status)
 }
 />
 <h1 className="mt-3 text-xl font-semibold">
 {result.data.studentName}
 </h1>
 <p className="mt-1 text-sm text-muted">
 {result.data.levelCode} · {result.data.levelTitle}
 </p>
 <dl className="mt-4 space-y-2 text-sm">
 <div className="flex items-center justify-between gap-3">
 <dt className="text-muted">Certificate No</dt>
 <dd className="font-mono font-medium">
 {result.data.certificateNumber}
 </dd>
 </div>
 <div className="flex items-center justify-between gap-3">
 <dt className="text-muted">Issued</dt>
 <dd className="font-medium">
 {isoDate(result.data.issuedAt)}
 </dd>
 </div>
 </dl>
 {!result.data.valid ? (
 <EmptyBlock
 title="Not valid"
 hint="This certificate was revoked. Contact the school for details."
 />
 ) : null}
 </div>
 )}
 </Panel>
 <p className="mt-4 text-center text-xs text-muted">
 © 2026 Deutsch Sprache RW
 </p>
 </div>
 </div>
 );
}
