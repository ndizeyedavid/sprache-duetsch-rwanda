import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import {
  getMyAssignmentDetail,
  submitActivity,
  getMyAssessment,
  startAttempt,
  submitAttempt,
  reportActivityViolation,
  reportAttemptViolation,
} from "../../lib/services";
import type { MyAssessmentDetail } from "../../lib/services";
import { humanize } from "../../lib/services";
import { AntiCheatGuard } from "../../components/assignments/AntiCheatGuard";

export function AssignmentDetail() {
  const { id = "" } = useParams();
  const detail = useApi(
    `assignment-${id}`,
    () => getMyAssignmentDetail(id),
    Boolean(id),
  );
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [cheatLocked, setCheatLocked] = useState(false);
  const [cheatNotice, setCheatNotice] = useState<string | null>(null);

  // Assessment quiz state
  const [fullAssessment, setFullAssessment] =
    useState<MyAssessmentDetail | null>(null);
  const [attempt, setAttempt] = useState<{ id: string } | null>(null);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Preload full assessment for question count (must be before early return for hook order)
  useEffect(() => {
    const raw = detail.data as
      | { assessment?: { id: string }; source?: string }
      | undefined;
    const aid = raw?.assessment?.id;
    const src = raw?.source;
    if (src && src !== "ACTIVITY" && aid && !fullAssessment) {
      getMyAssessment(aid)
        .then(setFullAssessment)
        .catch(() => {});
    }
  }, [detail.data, fullAssessment]);

  // Countdown timer for timed assessments
  useEffect(() => {
    if (timeLeft === null || !attempt || quizResult) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(t);
          void handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null, !!attempt, !!quizResult]);

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
    if (cheatLocked) {
      setCheatNotice(
        "Submission blocked — too many violations. Your attempt has been flagged.",
      );
      return;
    }
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
      setCheatLocked(false);
      setCheatNotice(null);
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch {
        // ignore
      }
    } catch (e) {
      setError(apiErrorMessage(e, "Could not submit."));
    } finally {
      setSubmitting(false);
    }
  }

  // Attempts exhausted check for assessments — fall back to detail's assessment so it works even before fullAssessment loads or when that fetch previously 403'd
  const attemptsCount = data.attempts?.length ?? 0;
  const maxAttempts =
    fullAssessment?.maxAttempts ??
    (data.assessment as { maxAttempts?: number | null } | undefined)?.maxAttempts ??
    null;
  const isExhausted =
    typeof maxAttempts === "number" &&
    maxAttempts > 0 &&
    attemptsCount >= maxAttempts;

  async function handleStartQuiz() {
    const assessmentId = data.assessment?.id;
    if (!assessmentId) return;
    if (isExhausted) {
      setQuizError(
        `No attempts remaining — you have used all ${maxAttempts} attempt(s).`,
      );
      return;
    }
    // Try to enter fullscreen synchronously on the user gesture so the browser allows it
    try {
      if (!document.fullscreenElement)
        await document.documentElement.requestFullscreen();
    } catch {
      // ignore — AntiCheatGuard will show the centered modal with the manual button
    }
    setQuizError(null);
    setStartingQuiz(true);
    try {
      if (!fullAssessment) {
        const fa = await getMyAssessment(assessmentId);
        setFullAssessment(fa);
      }
      const at = await startAttempt(assessmentId);
      setAttempt(at as { id: string });
      setResponses({});
      setQuizResult(null);
      setCheatLocked(false);
      setCheatNotice(null);
      setStarted(true);
      const fa =
        fullAssessment ??
        (await getMyAssessment(assessmentId).catch(() => null));
      if (fa?.durationMinutes) setTimeLeft(fa.durationMinutes * 60);
      // Ensure fullscreen again after the quiz UI mounts
      try {
        if (!document.fullscreenElement)
          await document.documentElement.requestFullscreen();
      } catch {
        // AntiCheatGuard will handle fallback modal
      }
    } catch (e) {
      setQuizError(apiErrorMessage(e, "Could not start quiz."));
      // If server says no attempts left, reflect locally
      const msg = apiErrorMessage(e, "");
      if (msg.toLowerCase().includes("maximum number of attempts")) {
        setQuizError(`No attempts remaining — ${msg}`);
      }
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch {
        // ignore
      }
    } finally {
      setStartingQuiz(false);
    }
  }

  async function handleSubmitQuiz() {
    if (!attempt) {
      if (cheatLocked)
        setCheatNotice("Submission blocked — too many violations.");
      return;
    }
    if (!fullAssessment) return;
    // If locked, submit even if flagged, otherwise check unanswered
    if (!cheatLocked) {
      const unanswered = fullAssessment.questions.filter(
        (q) =>
          responses[q.question.id] === undefined ||
          responses[q.question.id] === "" ||
          (Array.isArray(responses[q.question.id]) &&
            (responses[q.question.id] as unknown[]).length === 0),
      );
      if (
        unanswered.length > 0 &&
        !confirm(`${unanswered.length} question(s) unanswered. Submit anyway?`)
      )
        return;
    }
    setSubmittingQuiz(true);
    setQuizError(null);
    try {
      const answers = fullAssessment.questions.map((q) => ({
        questionId: q.question.id,
        response: responses[q.question.id] ?? null,
      }));
      const res = await submitAttempt(attempt.id, answers);
      if (res.status === "GRADED") {
        setQuizResult({
          score: res.score ?? 0,
          maxScore: res.maxScore ?? 0,
          percentage: res.percentage ?? 0,
          passed: !!res.passed,
        });
      } else {
        setQuizResult({ score: 0, maxScore: 0, percentage: 0, passed: false });
      }
      localStorage.removeItem(`cheat:ASM:${attempt.id}`);
      if (data.assessment)
        localStorage.removeItem(`cheat:ASM:${data.assessment.id}`);
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
      } catch {
        // ignore
      }
    } catch (e) {
      setQuizError(apiErrorMessage(e, "Could not submit quiz."));
    } finally {
      setSubmittingQuiz(false);
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
              <div className="rounded-box border border-warning/20 bg-warning/5 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-warning">
                  <FiClock aria-hidden />
                  Anti-cheat — read before starting
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted">
                  <li>
                    Assignment runs in fullscreen — exiting fullscreen counts as
                    a violation.
                  </li>
                  <li>Copy, cut, paste, right-click and drag are blocked.</li>
                  <li>Switching tabs or windows is detected and counted.</li>
                  <li>PrintScreen and select-all are blocked.</li>
                  <li>3 violations lock the assignment for teacher review.</li>
                </ul>
              </div>
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
                onClick={() => {
                  setCheatLocked(false);
                  setCheatNotice(null);
                  setStarted(true);
                }}
                className="btn rounded-full border-0 bg-brand px-6 text-white hover:bg-brand/90"
              >
                Start assignment — enter fullscreen
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
            <AntiCheatGuard
              enabled={started && !cheatLocked}
              persistKey={activity ? `cheat:ACT:${activity.id}` : undefined}
              onViolation={(type) => {
                if (activity)
                  void reportActivityViolation(activity.id, type).catch(
                    () => {},
                  );
              }}
              onLock={() => {
                setCheatLocked(true);
                setCheatNotice(
                  "Assignment locked — 3 violations. Auto-submitting and flagged for teacher review.",
                );
                if (activity) {
                  const v = answer.trim()
                    ? answer
                    : "[No answer — auto-submitted due to violations]";
                  void submitActivity(activity.id, v)
                    .then(() => {
                      detail.refetch();
                      try {
                        if (document.fullscreenElement)
                          void document.exitFullscreen();
                      } catch {
                        // ignore
                      }
                      localStorage.removeItem(`cheat:ACT:${activity.id}`);
                    })
                    .catch(() => {});
                }
              }}
            >
              <div className="space-y-3 p-1">
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
                          disabled={cheatLocked}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : activity?.type === "TRUE_FALSE" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={cheatLocked}
                      onClick={() => setAnswer("true")}
                      className={`rounded-box border p-3 text-sm font-semibold ${answer === "true" ? "border-brand bg-brand-soft" : "border-line"} disabled:opacity-50`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      disabled={cheatLocked}
                      onClick={() => setAnswer("false")}
                      className={`rounded-box border p-3 text-sm font-semibold ${answer === "false" ? "border-brand bg-brand-soft" : "border-line"} disabled:opacity-50`}
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
                    disabled={cheatLocked}
                    className="textarea w-full rounded-box border-line bg-base-100 text-sm disabled:opacity-50"
                  />
                )}
                {cheatNotice ? (
                  <p
                    role="alert"
                    className="rounded-box bg-error px-3 py-2 text-xs font-bold text-white"
                  >
                    {cheatNotice}
                  </p>
                ) : null}
                {error ? <p className="text-xs text-error">{error}</p> : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setStarted(false);
                      setCheatLocked(false);
                      setCheatNotice(null);
                      try {
                        if (document.fullscreenElement)
                          await document.exitFullscreen();
                      } catch {
                        // ignore
                      }
                    }}
                    className="btn btn-sm rounded-full border-line bg-base-100"
                  >
                    Exit & save draft
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={submitting || !answer.trim() || cheatLocked}
                    className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : null}
                    Submit
                  </button>
                </div>
              </div>
            </AntiCheatGuard>
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
                  fullAssessment?.questions.length ??
                    (data.assessment as { _count?: { questions: number } })
                      ?._count?.questions ??
                    "—",
                )}
              </li>
              <li>
                Duration:{" "}
                {(fullAssessment?.durationMinutes ??
                data.assessment?.durationMinutes)
                  ? `${fullAssessment?.durationMinutes ?? data.assessment?.durationMinutes} min`
                  : "Untimed"}
              </li>
              <li>
                Attempts: {data.attempts?.length ?? 0} /{" "}
                {fullAssessment?.maxAttempts ?? "—"}
              </li>
              {fullAssessment?.passMark !== null &&
              fullAssessment?.passMark !== undefined ? (
                <li>Pass mark: {String(fullAssessment.passMark)}%</li>
              ) : null}
            </ul>
          </div>

          {quizResult ? (
            <div className="mt-4 space-y-4 text-center">
              <div
                className={`mx-auto flex size-14 items-center justify-center rounded-full ${quizResult.passed ? "bg-brand-soft text-brand" : "bg-coral-soft text-coral"}`}
              >
                <FiCheck aria-hidden className="text-xl" />
              </div>
              <h3 className="text-lg font-bold">
                {quizResult.passed ? "Passed!" : "Submitted"}
              </h3>
              <p className="text-sm">
                Score: {quizResult.score} / {quizResult.maxScore} (
                {quizResult.percentage}%)
              </p>
              <p className="text-xs text-muted">
                {quizResult.passed
                  ? "Congratulations!"
                  : "Keep practicing and try again if allowed."}
              </p>
              <div className="flex justify-center gap-2">
                <Link
                  to="/assignments"
                  className="btn btn-sm rounded-full border-line bg-base-100"
                >
                  Back to assignments
                </Link>
                <Link
                  to="/grades"
                  className="btn btn-sm rounded-full border-0 bg-brand text-white"
                >
                  View grades
                </Link>
              </div>
            </div>
          ) : !started || !attempt ? (
            <>
              <div className="mt-3 rounded-box border border-warning/20 bg-warning/5 p-3">
                <p className="text-xs font-bold text-warning">
                  Anti-cheat active on start
                </p>
                <p className="text-xs text-muted">
                  Fullscreen required · clipboard blocked · tab switch =
                  violation · 3 violations lock & auto-submit.
                </p>
              </div>
              {quizError ? (
                <p
                  role="alert"
                  className="mt-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-coral"
                >
                  {quizError}
                </p>
              ) : null}
              {isExhausted ? (
                <div className="mt-3 rounded-box border border-coral/20 bg-coral-soft/40 p-4 text-center">
                  <p className="text-sm font-bold text-coral">
                    No attempts remaining
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    You have used all {maxAttempts} attempt
                    {maxAttempts === 1 ? "" : "s"} for this quiz.
                  </p>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={startingQuiz || isExhausted}
                  onClick={() => void handleStartQuiz()}
                  className="btn gap-2 rounded-full border-0 bg-brand px-6 text-white hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={isExhausted ? "No attempts remaining" : undefined}
                >
                  {startingQuiz ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : null}
                  {isExhausted ? "No attempts left" : "Start quiz"}
                </button>
                {isExhausted ? (
                  <Link
                    to="/grades"
                    className="btn gap-2 rounded-full border-0 bg-base-200 px-6 hover:bg-base-300"
                  >
                    View grades
                  </Link>
                ) : null}
              </div>
              {detail.data &&
              (detail.data as { attempts?: unknown[] }).attempts &&
              (detail.data as { attempts: { status: string }[] }).attempts
                .length > 0 ? (
                <p className="mt-3 text-xs text-muted">
                  You have {data.attempts?.length} previous attempt(s).
                </p>
              ) : null}
            </>
          ) : (
            <AntiCheatGuard
              enabled={started && !cheatLocked && !quizResult}
              persistKey={
                attempt
                  ? `cheat:ASM:${attempt.id}`
                  : data.assessment
                    ? `cheat:ASM:${data.assessment.id}`
                    : undefined
              }
              onViolation={(type) => {
                if (attempt)
                  void reportAttemptViolation(attempt.id, type).catch(() => {});
              }}
              onLock={() => {
                setCheatLocked(true);
                setCheatNotice(
                  "Assessment locked — 3 violations. Auto-submitting…",
                );
                void handleSubmitQuiz();
              }}
            >
              <div className="mt-3 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-box bg-base-200 px-3 py-2 text-xs">
                  <span className="font-semibold">
                    {fullAssessment?.title ?? data.assessment?.title} ·{" "}
                    {fullAssessment?.questions.length ?? 0} questions
                  </span>
                  {timeLeft !== null ? (
                    <span
                      className={`rounded-full px-2.5 py-1 font-bold ${timeLeft < 60 ? "bg-error text-white" : timeLeft < 300 ? "bg-warning text-white" : "bg-base-100"}`}
                    >
                      {Math.floor(timeLeft / 60)}:
                      {String(timeLeft % 60).padStart(2, "0")}
                    </span>
                  ) : null}
                </div>
                {cheatNotice ? (
                  <p
                    role="alert"
                    className="rounded-box bg-error px-3 py-2 text-xs font-bold text-white"
                  >
                    {cheatNotice}
                  </p>
                ) : null}
                {quizError ? (
                  <p
                    role="alert"
                    className="rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-coral"
                  >
                    {quizError}
                  </p>
                ) : null}

                {fullAssessment ? (
                  <div className="space-y-4">
                    {fullAssessment.questions.map((q, idx) => {
                      const opts = q.question.options as unknown;
                      const optList = Array.isArray(opts)
                        ? (opts as string[])
                        : [];
                      const qType = q.question.type;
                      const val = responses[q.question.id];
                      return (
                        <div
                          key={q.question.id}
                          className="rounded-box border border-line bg-base-100 p-4"
                        >
                          <p className="flex gap-2 text-sm font-semibold">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                              {idx + 1}
                            </span>
                            {q.question.prompt}
                          </p>
                          {q.question.imageUrl ? (
                            <img
                              src={q.question.imageUrl}
                              alt=""
                              className="mt-2 max-h-48 rounded-box"
                            />
                          ) : null}
                          {q.question.audioUrl ? (
                            <audio
                              controls
                              src={q.question.audioUrl}
                              className="mt-2 w-full"
                            />
                          ) : null}
                          <div className="mt-3">
                            {qType === "SINGLE_CHOICE" ||
                            qType === "TRUE_FALSE" ? (
                              <div className="space-y-2">
                                {(optList.length
                                  ? optList
                                  : qType === "TRUE_FALSE"
                                    ? ["True", "False"]
                                    : []
                                ).map((opt, oIdx) => (
                                  <label
                                    key={oIdx}
                                    className={`flex cursor-pointer items-center gap-2 rounded-box border p-3 text-sm ${val === opt || val === String(oIdx) ? "border-brand bg-brand-soft" : "border-line bg-base-100 hover:border-brand/20"}`}
                                  >
                                    <input
                                      type="radio"
                                      name={q.question.id}
                                      checked={
                                        val === opt ||
                                        val === String(oIdx) ||
                                        val === oIdx
                                      }
                                      onChange={() =>
                                        setResponses((p) => ({
                                          ...p,
                                          [q.question.id]: opt,
                                        }))
                                      }
                                      className="radio radio-sm"
                                      disabled={cheatLocked}
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            ) : qType === "MULTIPLE_CHOICE" ? (
                              <div className="space-y-2">
                                {optList.map((opt, oIdx) => {
                                  const arr = Array.isArray(val)
                                    ? (val as string[])
                                    : [];
                                  const checked = arr.includes(opt);
                                  return (
                                    <label
                                      key={oIdx}
                                      className={`flex cursor-pointer items-center gap-2 rounded-box border p-3 text-sm ${checked ? "border-brand bg-brand-soft" : "border-line bg-base-100"}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          const next = e.target.checked
                                            ? [...arr, opt]
                                            : arr.filter((x) => x !== opt);
                                          setResponses((p) => ({
                                            ...p,
                                            [q.question.id]: next,
                                          }));
                                        }}
                                        className="checkbox checkbox-sm"
                                        disabled={cheatLocked}
                                      />
                                      {opt}
                                    </label>
                                  );
                                })}
                              </div>
                            ) : qType === "FILL_BLANK" ? (
                              <input
                                value={(val as string) ?? ""}
                                onChange={(e) =>
                                  setResponses((p) => ({
                                    ...p,
                                    [q.question.id]: e.target.value,
                                  }))
                                }
                                placeholder="Your answer…"
                                disabled={cheatLocked}
                                className="input w-full rounded-box border-line bg-base-100 text-sm"
                              />
                            ) : (
                              <textarea
                                value={(val as string) ?? ""}
                                onChange={(e) =>
                                  setResponses((p) => ({
                                    ...p,
                                    [q.question.id]: e.target.value,
                                  }))
                                }
                                rows={3}
                                placeholder="Your answer…"
                                disabled={cheatLocked}
                                className="textarea w-full rounded-box border-line bg-base-100 text-sm"
                              />
                            )}
                          </div>
                          <p className="mt-2 text-xs text-muted">
                            {q.question.points} pts
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Loading questions…</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setStarted(false);
                      setCheatLocked(false);
                      setCheatNotice(null);
                      try {
                        if (document.fullscreenElement)
                          await document.exitFullscreen();
                      } catch {
                        // ignore
                      }
                    }}
                    className="btn btn-sm rounded-full border-line bg-base-100"
                  >
                    Exit
                  </button>
                  <button
                    type="button"
                    disabled={submittingQuiz || cheatLocked}
                    onClick={() => void handleSubmitQuiz()}
                    className="btn btn-sm gap-2 rounded-full border-0 bg-brand px-6 text-white hover:bg-brand/90 disabled:opacity-60"
                  >
                    {submittingQuiz ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : null}
                    Submit quiz
                  </button>
                </div>
              </div>
            </AntiCheatGuard>
          )}
        </Panel>
      )}
    </div>
  );
}
