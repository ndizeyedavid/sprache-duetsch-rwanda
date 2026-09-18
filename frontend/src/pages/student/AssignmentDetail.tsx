import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import { Panel } from "../../components/ui/Panel";
import { ErrorBlock, LoadingBlock } from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage } from "../../lib/api";
import { getMyAssignmentDetail, submitActivity } from "../../lib/services";
import { humanize } from "../../lib/services";

export function AssignmentDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const detail = useApi(
    `assignment-${id}`,
    () => getMyAssignmentDetail(id),
    Boolean(id),
  );
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  if (detail.loading) return <LoadingBlock label="Loading assignment…" />;
  if (detail.error || !detail.data)
    return (
      <ErrorBlock
        message={detail.error ?? "Could not load assignment."}
        onRetry={detail.refetch}
      />
    );

  const data = detail.data as {
    source: string;
    activity?: {
      id: string;
      title: string;
      type: string;
      instructions: string | null;
      config: unknown;
      lessonId: string;
    };
    submission?: {
      status: string;
      score: number | null;
      feedback: string | null;
    } | null;
    lesson?: {
      id: string;
      title: string;
      module: { title: string; level: { code: string; title: string } };
    };
    level?: { code: string; title: string };
    assessment?: {
      id: string;
      title: string;
      description: string | null;
      type: string;
      durationMinutes: number | null;
      passMark: unknown;
      availableUntil: string | null;
    };
    attempts?: { status: string }[];
  };

  const isActivity = data.source === "ACTIVITY";
  const activity = data.activity;
  const cfg = (activity?.config ?? {}) as Record<string, unknown>;

  async function handleSubmit() {
    if (!activity) return;
    setSubmitting(true);
    setError(null);
    try {
      let response: unknown = answer;
      if (activity.type === "ORDERING" && answer.trim().startsWith("[")) {
        try {
          response = JSON.parse(answer);
        } catch {
          response = answer;
        }
      }
      await submitActivity(activity.id, response);
      detail.refetch();
      setStarted(false);
    } catch (e) {
      setError(apiErrorMessage(e, "Could not submit."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        to="/assignments"
        className="inline-flex items-center gap-1 text-sm hover:underline"
      >
        <FiArrowLeft aria-hidden />
        Back to assignments
      </Link>

      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`badge badge-sm ${isActivity ? "badge-info" : "badge-primary"}`}
          >
            {isActivity ? "Activity" : "Assessment"}
          </span>
          {data.lesson ? (
            <span className="text-xs text-muted">
              {data.lesson.module.level.code} · {data.lesson.module.title}
            </span>
          ) : data.level ? (
            <span className="text-xs text-muted">
              {data.level.code} · {data.level.title}
            </span>
          ) : null}
          {data.assessment?.availableUntil ? (
            <span className="flex items-center gap-1 text-xs text-muted">
              <FiCalendar aria-hidden />
              Due{" "}
              {new Date(data.assessment.availableUntil).toLocaleString("en-GB")}
            </span>
          ) : null}
        </div>
        <h1 className="mt-2 text-xl font-bold">
          {isActivity ? activity?.title : data.assessment?.title}
        </h1>
        {isActivity && activity?.instructions ? (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {activity.instructions}
          </p>
        ) : null}
        {!isActivity && data.assessment?.description ? (
          <p className="mt-1 text-sm text-muted">
            {data.assessment.description}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-muted">
          {isActivity
            ? humanize(activity?.type ?? "")
            : humanize(data.assessment?.type ?? "")}{" "}
          ·{" "}
          {isActivity
            ? "1 pt"
            : `${data.assessment?.durationMinutes ?? "—"} min · Pass ${String(data.assessment?.passMark ?? "—")}%`}
        </p>
      </Panel>

      {isActivity ? (
        <Panel>
          {!started && !data.submission ? (
            <div className="space-y-4">
              <div className="rounded-box border border-line bg-base-200/40 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <FiFileText aria-hidden />
                  Instructions
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {activity?.instructions ??
                    String(
                      cfg.sentence ??
                        cfg.prompt ??
                        cfg.question ??
                        "Complete the activity as instructed.",
                    )}
                </p>
                {cfg.sentence ? (
                  <p className="mt-2 rounded-box bg-base-100 p-3 text-sm">
                    {String(cfg.sentence)}
                  </p>
                ) : null}
                {Array.isArray(cfg.options) ? (
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(cfg.options as string[]).map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="btn rounded-full border-0 bg-brand px-6 text-white hover:bg-brand/90"
              >
                Start assignment
              </button>
            </div>
          ) : data.submission ? (
            <div className="text-center">
              <div
                className={`mx-auto flex size-12 items-center justify-center rounded-full ${data.submission.status === "GRADED" ? "bg-brand-soft text-brand" : "bg-warning/20 text-warning"}`}
              >
                <FiCheck aria-hidden />
              </div>
              <h3 className="mt-2 text-sm font-bold">
                {data.submission.status === "GRADED"
                  ? "Graded"
                  : "Submitted — awaiting grading"}
              </h3>
              {data.submission.score !== null ? (
                <p className="text-sm">
                  Score: {String(data.submission.score)}/1
                </p>
              ) : null}
              {data.submission.feedback ? (
                <p className="mt-2 rounded-box bg-base-200 px-3 py-2 text-xs">
                  {data.submission.feedback}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="btn btn-sm mt-3 rounded-full border-line bg-base-100"
              >
                Redo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-bold">Your answer</h3>
              {activity?.type === "MCQ" && Array.isArray(cfg.options) ? (
                <div className="space-y-2">
                  {(cfg.options as string[]).map((opt, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 rounded-box border border-line bg-base-100 p-3 text-sm"
                    >
                      <input
                        type="radio"
                        name="mcq"
                        onChange={() => setAnswer(String(idx))}
                        className="radio radio-sm"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : activity?.type === "TRUE_FALSE" ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswer("true")}
                    className={`rounded-box border p-3 text-sm font-semibold ${answer === "true" ? "border-brand bg-brand-soft" : "border-line"}`}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer("false")}
                    className={`rounded-box border p-3 text-sm font-semibold ${answer === "false" ? "border-brand bg-brand-soft" : "border-line"}`}
                  >
                    False
                  </button>
                </div>
              ) : (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="Your answer…"
                  className="textarea w-full rounded-box border-line bg-base-100 text-sm"
                />
              )}
              {error ? <p className="text-xs text-error">{error}</p> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStarted(false)}
                  className="btn btn-sm rounded-full border-line bg-base-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={submitting || !answer.trim()}
                  className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : null}
                  Submit
                </button>
              </div>
            </div>
          )}
        </Panel>
      ) : (
        <Panel>
          <div className="rounded-box border border-line bg-base-200/40 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <FiClock aria-hidden />
              Assessment details
            </h3>
            <p className="mt-1 text-sm text-muted">
              Read the instructions, then start when ready. Your attempt is
              timed if a duration is set.
            </p>
            <ul className="mt-2 list-disc pl-5 text-xs text-muted">
              <li>
                Questions:{" "}
                {String(
                  (data.assessment as { _count?: { questions: number } })
                    ?._count?.questions ?? "—",
                )}
              </li>
              <li>
                Duration:{" "}
                {data.assessment?.durationMinutes
                  ? `${data.assessment.durationMinutes} min`
                  : "Untimed"}
              </li>
              <li>Attempts: {data.attempts?.length ?? 0}</li>
            </ul>
          </div>
          {!started ? (
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="btn mt-3 rounded-full border-0 bg-brand px-6 text-white hover:bg-brand/90"
            >
              View instructions & start
            </button>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm">
                You are about to start{" "}
                <span className="font-semibold">{data.assessment?.title}</span>.
                Once started, the timer begins.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStarted(false)}
                  className="btn btn-sm rounded-full border-line bg-base-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/courses/${(data.level as { code: string })?.code?.toLowerCase() ?? ""}`,
                    )
                  }
                  className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90"
                >
                  Open course
                </button>
              </div>
              <p className="text-xs text-muted">
                Assessment attempts are handled via the course exam flow.
              </p>
            </div>
          )}
          {detail.data &&
          (detail.data as { attempts?: unknown[] }).attempts &&
          (detail.data as { attempts: { status: string }[] }).attempts.length >
            0 ? (
            <p className="mt-3 text-xs text-muted">
              You have {data.attempts?.length} previous attempt(s).
            </p>
          ) : null}
        </Panel>
      )}
    </div>
  );
}
