import { useState } from "react";
import type { FormEvent } from "react";
import { Panel, SectionHeader } from "../../components/ui/Panel";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage } from "../../lib/api";
import {
  checkCertificateEligibility,
  humanize,
  isoDate,
  issueCertificate,
  listCertificates,
  listLevels,
  listStudents,
  revokeCertificate,
} from "../../lib/services";

export function AdminCertificates() {
  const students = useApi("admin-students", listStudents);
  const levels = useApi("levels-catalog", listLevels);
  const issued = useApi("certificates-list", listCertificates);

  const [studentId, setStudentId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [checking, setChecking] = useState(false);
  const [eligibility, setEligibility] = useState<Awaited<
    ReturnType<typeof checkCertificateEligibility>
  > | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [revokeReason, setRevokeReason] = useState<Record<string, string>>({});

  async function handleCheck(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !levelId) return;
    setChecking(true);
    setFormError(null);
    try {
      setEligibility(await checkCertificateEligibility(studentId, levelId));
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not check eligibility."));
    } finally {
      setChecking(false);
    }
  }

  async function handleIssue() {
    if (!studentId || !levelId) return;
    setWorking(true);
    setFormError(null);
    try {
      await issueCertificate({ studentId, levelId });
      setEligibility(null);
      issued.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not issue the certificate."));
    } finally {
      setWorking(false);
    }
  }

  async function handleRevoke(id: string) {
    const reason = (revokeReason[id] ?? "").trim();
    if (reason.length < 4) {
      setFormError("Give a short reason before revoking.");
      return;
    }
    setWorking(true);
    setFormError(null);
    try {
      await revokeCertificate(id, reason);
      issued.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not revoke the certificate."));
    } finally {
      setWorking(false);
    }
  }

  const list = issued.data ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <SectionHeader title="Issue a certificate" />
        <form onSubmit={handleCheck} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Student</span>
            <select
              required
              value={studentId}
              onChange={(event) => setStudentId(event.currentTarget.value)}
              className="select w-full rounded-field border-line bg-base-200"
            >
              <option value="">Choose…</option>
              {(students.data ?? []).map((row) => (
                <option key={row.id} value={row.id}>
                  {row.user.firstName} {row.user.lastName} ({row.studentCode})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Level</span>
            <select
              required
              value={levelId}
              onChange={(event) => setLevelId(event.currentTarget.value)}
              className="select w-full rounded-field border-line bg-base-200"
            >
              <option value="">Choose…</option>
              {(levels.data ?? []).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.code} · {level.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={checking}
            className="btn btn-sm rounded-full border-brand bg-transparent text-brand hover:border-brand hover:bg-brand hover:text-white disabled:opacity-60"
          >
            {checking ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Check eligibility"
            )}
          </button>
        </form>

        {eligibility ? (
          <div className="mt-4 rounded-field bg-base-200 p-4 text-xs">
            <p className="font-semibold">{eligibility.studentName}</p>
            <p className="mt-1 text-muted">
              {eligibility.lessonsCompleted}/{eligibility.lessonsTotal} lessons
              ·{" "}
              {eligibility.finalExamPassed === null
                ? "no final exam configured"
                : eligibility.finalExamPassed
                  ? "final exam passed"
                  : "final exam NOT passed"}
            </p>
            {eligibility.reasons.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-error">
                {eligibility.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 font-semibold text-brand">
                Eligible — ready to issue.
              </p>
            )}
            <button
              type="button"
              disabled={working || !eligibility.eligible}
              onClick={handleIssue}
              className="btn btn-sm mt-3 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {working ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Issue certificate"
              )}
            </button>
          </div>
        ) : null}

        {formError ? (
          <p role="alert" className="mt-3 text-xs font-medium text-error">
            {formError}
          </p>
        ) : null}
      </Panel>

      <Panel>
        <SectionHeader title={`Issued (${list.length})`} />
        {issued.loading ? (
          <LoadingBlock label="Loading certificates…" />
        ) : issued.error ? (
          <ErrorBlock message={issued.error} onRetry={issued.refetch} />
        ) : list.length === 0 ? (
          <EmptyBlock
            title="No certificates yet"
            hint="Issued certificates appear here with revoke controls."
          />
        ) : (
          <ul className="space-y-3">
            {list.map((certificate) => (
              <li
                key={certificate.id}
                className="rounded-field bg-base-200 px-3 py-2"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold">
                    {certificate.student
                      ? `${certificate.student.user.firstName} ${certificate.student.user.lastName}`
                      : certificate.certificateNumber}{" "}
                    · {certificate.level.code}
                  </span>
                  <StatusBadge status={humanize(certificate.status)} />
                </span>
                <span className="mt-1 block font-mono text-[11px] text-muted">
                  {certificate.certificateNumber} ·{" "}
                  {isoDate(certificate.issuedAt)}
                </span>
                {certificate.status === "ISSUED" ? (
                  <span className="mt-2 flex gap-2">
                    <input
                      value={revokeReason[certificate.id] ?? ""}
                      onChange={(event) =>
                        setRevokeReason((current) => ({
                          ...current,
                          [certificate.id]: event.currentTarget.value,
                        }))
                      }
                      placeholder="Revoke reason"
                      aria-label={`Revoke reason for ${certificate.certificateNumber}`}
                      className="input grow rounded-field border-line bg-base-100"
                    />
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => handleRevoke(certificate.id)}
                      className="btn btn-sm rounded-full border-0 bg-coral text-white hover:bg-coral/90 disabled:opacity-60"
                    >
                      Revoke
                    </button>
                  </span>
                ) : (
                  <span className="mt-1 block text-[11px] text-muted">
                    Reason: {certificate.revokeReason ?? "—"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
