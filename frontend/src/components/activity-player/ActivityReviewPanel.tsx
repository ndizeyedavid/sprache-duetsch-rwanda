import { FiCheck,FiFileText,FiX } from 'react-icons/fi';
import { openMaterial } from '../student/materialFiles';
import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';
import { asFileResponse } from './config-readers';
import { reviewRows } from './review-rows';
import type { ActivityConfig,ActivityReview } from './types';

type Props = { type: string; config: ActivityConfig; response: unknown; review: ActivityReview | null | undefined };

/** After submission: each part with the correct answer, plus transcript, model answer and the student's own file. */
export function ActivityReviewPanel({ type, config, response, review }: Props) {
  const file = asFileResponse(response);
  const rows = review ? reviewRows(type, config, response, review) : [];
  const writing = type === 'WRITING' && typeof response === 'string' ? response : '';
  if (!rows.length && !file && !writing && !review?.transcript && !review?.modelAnswer && !review?.explanation) return null;
  return <section className="mt-5 space-y-3 text-left" aria-label="Review your answers">
    <h3 className="text-sm font-semibold">Review</h3>
    {rows.length ? <ol className="space-y-2">
      {rows.map((row, i) => <li key={i} className="rounded-box border border-base-300 bg-base-100 p-3 text-sm">
        <p className="text-xs text-muted">{row.label}</p>
        <p className="mt-1 flex items-start gap-2">
          {row.correct === true ? <FiCheck aria-label="Correct" className="mt-0.5 shrink-0 text-success" /> : row.correct === false ? <FiX aria-label="Incorrect" className="mt-0.5 shrink-0 text-error" /> : null}
          <span>Your answer: <span className="font-semibold">{row.given}</span></span>
        </p>
        {row.correct === false && row.expected ? <p className="mt-1 text-xs">Correct answer: <span className="font-semibold">{row.expected}</span></p> : null}
      </li>)}
    </ol> : null}
    {writing ? <div className="rounded-box bg-base-200 p-3 text-sm whitespace-pre-wrap"><p className="mb-1 text-xs font-semibold">Your answer</p>{writing}</div> : null}
    {file ? file.mimeType?.startsWith('audio/')
      ? <div><p className="mb-1 text-xs font-semibold">Your recording</p><AuthenticatedMedia url={file.fileUrl} kind="audio" title="your recording" className="w-full" /></div>
      : <button type="button" className="btn btn-sm gap-2 rounded-full" onClick={() => void openMaterial(file.fileUrl, 'Your submission').catch(() => {})}><FiFileText aria-hidden />Open your file</button> : null}
    {file?.text ? <p className="rounded-box bg-base-200 p-3 text-xs">Your note: {file.text}</p> : null}
    {review?.transcript ? <details className="rounded-box bg-base-200 p-3 text-sm" open><summary className="cursor-pointer text-xs font-semibold">Transcript</summary><p className="mt-2 whitespace-pre-wrap" lang="de">{review.transcript}</p></details> : null}
    {review?.modelAnswer ? <details className="rounded-box bg-base-200 p-3 text-sm"><summary className="cursor-pointer text-xs font-semibold">Compare with the model answer</summary><p className="mt-2 whitespace-pre-wrap" lang="de">{review.modelAnswer}</p></details> : null}
    {review?.explanation ? <p className="rounded-box bg-base-200 p-3 text-xs">{review.explanation}</p> : null}
  </section>;
}
