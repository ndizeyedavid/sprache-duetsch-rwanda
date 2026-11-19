import { FiAlertCircle,FiCheckCircle } from 'react-icons/fi';
import { SayButton } from '../audio/SayButton';
import { GermanText } from '../translate/GermanText';
import type { Verdict } from './grading';

type Props = {
  verdict: Verdict | null;
  canCheck: boolean;
  /** Self-checking questions (matching) have no Check button. */
  selfChecking: boolean;
  speaking: boolean;
  onCheck: () => void;
  onContinue: () => void;
  onSkipSpeaking: () => void;
};

/** Bottom bar: "Check" while answering, then the result with the right answer, its meaning and audio. */
export function FeedbackBar({ verdict, canCheck, selfChecking, speaking, onCheck, onContinue, onSkipSpeaking }: Props) {
  if (!verdict) {
    return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      {speaking ? <button type="button" className="btn btn-ghost btn-sm text-muted" onClick={onSkipSpeaking}>Can’t speak now</button> : <span />}
      {selfChecking ? <span className="text-xs text-muted">Find every pair to continue</span>
        : <button type="button" disabled={!canCheck} onClick={onCheck} className="btn min-w-36 rounded-full border-0 bg-primary text-primary-content disabled:bg-base-300">Check</button>}
    </div>;
  }
  const good = verdict.correct;
  return <div role="status" className={`space-y-3 rounded-box p-4 ${good ? 'border-2 border-ok bg-ok-soft text-ok' : 'border-2 border-bad bg-bad-soft text-bad'}`}>
    <div className="flex items-center gap-2 text-lg font-bold">
      {good ? <FiCheckCircle aria-hidden /> : <FiAlertCircle aria-hidden />}
      {good ? 'Richtig! · Correct!' : 'Nicht ganz · Not quite'}
    </div>
    {verdict.expected && (!good || verdict.note) ? <div className="text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide">Correct answer</p>
      <p className="mt-0.5 flex items-start gap-2 text-base font-semibold">
        <SayButton text={verdict.audioText ?? verdict.expected} audio={verdict.audio} />
        <span className="pt-0.5">{verdict.expectedLang === 'de' ? <GermanText text={verdict.expected} /> : verdict.expected}</span>
      </p>
    </div> : verdict.audio ? <p className="flex items-center gap-2 text-sm"><SayButton text={verdict.audioText ?? verdict.expected ?? ''} audio={verdict.audio} />Listen again</p> : null}
    {verdict.meaning ? <p className="text-sm"><span className="font-semibold">Meaning: </span>{verdict.meaning}</p> : null}
    {verdict.note ? <p className="text-sm font-semibold">{verdict.note}</p> : null}
    {verdict.explanation ? <p className="text-sm leading-relaxed">{verdict.explanation}</p> : null}
    <div className="flex justify-end">
      <button type="button" autoFocus onClick={onContinue} className={`btn min-w-36 rounded-full border-0 text-white ${good ? 'bg-ok hover:bg-ok' : 'bg-bad hover:bg-bad'}`}>Continue</button>
    </div>
  </div>;
}
