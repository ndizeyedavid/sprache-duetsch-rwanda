import { Link, useParams } from "react-router-dom";
import { FiAward, FiBookOpen, FiCheckCircle, FiShield } from "react-icons/fi";
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
    <div className="min-h-screen bg-base-200 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo size={150} />
        </Link>

        {result.loading ? (
          <Panel>
            <LoadingBlock label="Verifying…" />
          </Panel>
        ) : result.error || !result.data ? (
          <Panel>
            <ErrorBlock
              message={result.error ?? "Verification failed."}
              onRetry={result.refetch}
            />
            <p className="mt-2 font-mono text-xs text-muted">{code}</p>
          </Panel>
        ) : (
          <div className="space-y-4">
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                    Certificate verification
                  </p>
                  <h1 className="mt-1 text-xl font-bold leading-tight">
                    {result.data.studentName}
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    {result.data.studentCode} · {result.data.levelCode} ·{" "}
                    {result.data.levelTitle}
                  </p>
                </div>
                <StatusBadge
                  status={
                    result.data.valid ? "Valid" : humanize(result.data.status)
                  }
                />
              </div>

              <dl className="mt-4 grid gap-3 rounded-box border border-line bg-base-100 p-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Certificate No</dt>
                  <dd className="font-mono font-medium">
                    {result.data.certificateNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Verification</dt>
                  <dd className="font-mono text-xs">
                    {result.data.verificationCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Issued</dt>
                  <dd className="font-medium">
                    {isoDate(result.data.issuedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Status</dt>
                  <dd className="font-medium">
                    {result.data.valid
                      ? "Valid — confirmed by Deutsch Sprache RW"
                      : humanize(result.data.status)}
                  </dd>
                </div>
              </dl>
              {!result.data.valid ? (
                <div className="mt-4">
                  <EmptyBlock
                    title="Not valid"
                    hint="This certificate was revoked. Contact the school for details."
                  />
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 rounded-box bg-success/10 px-3 py-2 text-xs font-medium text-success">
                  <FiShield aria-hidden /> Verified — this learner completed the
                  course and is recorded in the school registry.
                </p>
              )}
            </Panel>

            {result.data.modules.length > 0 ? (
              <Panel>
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <FiBookOpen aria-hidden className="text-brand" />
                  Lessons covered — {result.data.levelCode}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {result.data.modules.length} modules ·{" "}
                  {result.data.modules.reduce(
                    (acc, m) => acc + m.lessons.length,
                    0,
                  )}{" "}
                  lessons
                </p>
                <div className="mt-3 space-y-3">
                  {result.data.modules.map((mod) => (
                    <div
                      key={mod.title}
                      className="rounded-box border border-line bg-base-100 p-3"
                    >
                      <p className="text-xs font-bold">
                        {mod.order}. {mod.title}
                      </p>
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                        {mod.lessons.map((lesson) => (
                          <li
                            key={lesson.title}
                            className="flex items-center gap-2 text-xs"
                          >
                            <FiCheckCircle
                              aria-hidden
                              className="shrink-0 text-success"
                              size={12}
                            />
                            <span className="truncate">
                              {lesson.order}. {lesson.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {result.data.assessments.length > 0 ||
            result.data.activities.length > 0 ? (
              <Panel>
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <FiAward aria-hidden className="text-brand" />
                  Graded work
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Assignments and exams completed for this level — official
                  transcript excerpt.
                </p>

                {result.data.assessments.length > 0 ? (
                  <div className="mt-3">
                    <h3 className="text-xs font-semibold">Assessments</h3>
                    <ul className="mt-2 space-y-2">
                      {result.data.assessments.map((a, idx) => (
                        <li
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-line bg-base-100 px-3 py-2"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold">
                              {a.title}
                            </span>
                            <span className="text-[11px] text-muted">
                              {humanize(a.type)} · {isoDate(a.submittedAt)}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${a.passed ? "bg-brand text-white" : a.passed === false ? "bg-coral text-white" : "bg-base-200"}`}
                            >
                              {a.score !== null
                                ? `${a.score}/${a.maxScore}`
                                : "—"}{" "}
                              {a.percentage !== null
                                ? `· ${a.percentage}%`
                                : ""}
                            </span>
                            {a.passed !== null ? (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] ${a.passed ? "bg-success/15 text-success" : "bg-coral-soft text-coral"}`}
                              >
                                {a.passed ? "Passed" : "Not passed"}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {result.data.activities.length > 0 ? (
                  <div className="mt-4">
                    <h3 className="text-xs font-semibold">Activities</h3>
                    <ul className="mt-2 space-y-2">
                      {result.data.activities.map((s, idx) => (
                        <li
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-line bg-base-100 px-3 py-2"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold">
                              {s.title}
                            </span>
                            <span className="text-[11px] text-muted">
                              {humanize(s.type)}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${s.isCorrect ? "bg-brand text-white" : s.isCorrect === false ? "bg-coral text-white" : "bg-base-200"}`}
                            >
                              {s.score !== null
                                ? `${s.score}/${s.maxScore}`
                                : "—"}
                            </span>
                            {s.isCorrect !== null ? (
                              <span
                                className={`text-[11px] ${s.isCorrect ? "text-success" : "text-coral"}`}
                              >
                                {s.isCorrect ? "Correct" : "Incorrect"}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Panel>
            ) : null}

            <p className="text-center text-xs text-muted">
              © 2026 Deutsch Sprache RW · Kigali · Rwanda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
