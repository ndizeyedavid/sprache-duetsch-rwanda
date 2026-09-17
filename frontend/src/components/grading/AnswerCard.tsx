import { FiAward, FiMessageSquare } from 'react-icons/fi';
import { formatResponse, isAudioResponse } from './utils';

type Props = {
 index: number;
 total: number;
 prompt: string;
 response: unknown;
 maxPoints: number;
 points: string;
 onPoints: (v: string) => void;
 feedback: string;
 onFeedback: (v: string) => void;
 isCorrect?: boolean | null;
};

export function AnswerCard({ index, total, prompt, response, maxPoints, points, onPoints, feedback, onFeedback, isCorrect }: Props) {
 const audio = isAudioResponse(response);
 const text = formatResponse(response);
 const num = Number(points);
 const isFull = Number.isFinite(num) && num === maxPoints;
 const isZero = num === 0;

 return (
 <li className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="flex items-center justify-between gap-2 bg-base-200/50 px-3 py-2">
 <span className="text-xs font-bold">Question {index + 1} of {total}</span>
 <span className="flex items-center gap-2">
 {isCorrect === true ? <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-[#B30A00]">Correct</span> : isCorrect === false ? <span className="rounded-full bg-coral-soft px-2 py-0.5 text-[11px] font-medium text-[#D8482F]">Incorrect</span> : null}
 <span className="rounded-full bg-base-100 px-2 py-0.5 text-[11px] font-medium text-muted">{maxPoints} pts</span>
 </span>
 </div>
 <div className="p-3">
 <p className="text-sm font-semibold leading-snug">{prompt}</p>
 <div className="mt-2 rounded-box border border-line bg-base-200/30 p-3">
 <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted"><FiMessageSquare aria-hidden />Student answer</p>
 {audio ? <audio controls src={audio} className="mt-2 w-full" preload="metadata" /> : <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{text || '— No answer'}</p>}
 </div>
 <div className="mt-3 flex flex-wrap items-end gap-2">
 <label className="flex items-center gap-2 text-xs font-medium">
 <span className="inline-flex items-center gap-1"><FiAward aria-hidden className="text-brand" />Points</span>
 <input type="number" min={0} max={maxPoints} value={points} onChange={(e) => onPoints(e.currentTarget.value)} className="input input-sm w-20 rounded-full border-line bg-base-100 text-center font-semibold" />
 <span className="text-muted">/ {maxPoints}</span>
 </label>
 <span className="flex gap-1">
 <button type="button" onClick={() => onPoints(String(maxPoints))} className={`btn btn-xs rounded-full ${isFull ? 'bg-brand text-white border-brand' : 'border-line bg-base-100'}`}>Full</button>
 <button type="button" onClick={() => onPoints('0')} className={`btn btn-xs rounded-full ${isZero ? 'bg-night text-white border-night' : 'border-line bg-base-100'}`}>Zero</button>
 </span>
 <label className="block min-w-[200px] grow">
 <span className="mb-1 block text-[11px] font-medium text-muted">Feedback for this answer</span>
 <input value={feedback} onChange={(e) => onFeedback(e.currentTarget.value)} placeholder="Optional — visible to student" className="input input-sm w-full rounded-full border-line bg-base-100 text-xs" />
 </label>
 </div>
 </div>
 </li>
 );
}
