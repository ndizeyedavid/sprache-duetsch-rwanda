import type { CertificateEligibility } from '../../lib/services';

export function CertificateEligibilityCard({ eligibility, working, onIssue }: { eligibility: CertificateEligibility; working: boolean; onIssue: () => void }) {
 return (
<div className="mt-4 rounded-field bg-base-200 p-4 text-xs">
            <p className="text-sm font-semibold">{eligibility.studentName}</p>
 <progress aria-label="Completed lessons for certificate eligibility" className="progress progress-success my-3 h-2 w-full" value={eligibility.lessonsCompleted} max={Math.max(1, eligibility.lessonsTotal)} />
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
              onClick={onIssue}
              className="btn btn-sm mt-3 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {working ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Issue certificate"
              )}
            </button>
          </div>
 );
}
