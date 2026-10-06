import type { FormEvent } from 'react';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { checkCertificateEligibility,issueCertificate,listLevels,listStudents } from '../../lib/services';
import { CertificateEligibilityCard } from './CertificateEligibilityCard';

export function CertificateIssueForm({ onIssued }: { onIssued: () => void }) {
  const students = useApi("admin-students", listStudents);
  const levels = useApi("levels-catalog", listLevels);

  const [studentId, setStudentId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [checking, setChecking] = useState(false);
  const [eligibility, setEligibility] = useState<Awaited<
    ReturnType<typeof checkCertificateEligibility>
  > | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

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
      onIssued();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not issue the certificate."));
    } finally {
      setWorking(false);
    }
  }

 return (<div>
        <form onSubmit={handleCheck} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Student</span>
            <select
              required
              disabled={checking || working}
              value={studentId}
              onChange={(event) => { setStudentId(event.currentTarget.value); setEligibility(null); }}
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
              disabled={checking || working}
              value={levelId}
              onChange={(event) => { setLevelId(event.currentTarget.value); setEligibility(null); }}
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

        {eligibility && <CertificateEligibilityCard eligibility={eligibility} working={working} onIssue={handleIssue} />}

        {formError ? (
          <p role="alert" className="mt-3 text-xs font-medium text-error">
            {formError}
          </p>
        ) : null}
 </div>);
}
