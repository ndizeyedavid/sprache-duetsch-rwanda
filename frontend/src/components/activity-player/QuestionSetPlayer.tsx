import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';
import { choiceQuestions,text } from './config-readers';
import type { PlayerProps } from './types';

/** LISTENING (audio) and READING (passage) followed by multiple-choice questions; one index per question. */
export function QuestionSetPlayer({ activityId, type, config, value, onChange, disabled }: PlayerProps) {
  const questions = choiceQuestions(config);
  const answers = questions.map((_, index) => (Array.isArray(value) && typeof value[index] === 'number' ? value[index] as number : null));
  const audioUrl = text(config.audioUrl);
  const passage = text(config.passage);
  return <div className="space-y-4">
    {type === 'LISTENING' ? <div className="rounded-box border border-base-300 bg-base-100 p-3">
      <p className="mb-2 text-xs font-semibold">Listen carefully — you can replay the audio.</p>
      {audioUrl ? <AuthenticatedMedia url={audioUrl} kind="audio" title="listening audio" className="w-full" /> : <p className="text-xs text-muted">No audio attached — contact your teacher.</p>}
    </div> : null}
    {passage ? <article className="max-h-96 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-4 text-sm leading-7 whitespace-pre-wrap" tabIndex={0} aria-label="Reading passage">{passage}</article> : null}
    <ol className="space-y-3">
      {questions.map((question, qIndex) => <li key={qIndex}>
        <fieldset disabled={disabled} className="rounded-box border border-base-300 bg-base-100 p-3">
          <legend className="px-1 text-sm font-medium">{qIndex + 1}. {question.prompt || 'Choose the right answer'}</legend>
          <div className="mt-2 grid gap-2">
            {question.options.map((option, oIndex) => <label key={oIndex} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-field border px-3 py-2 text-sm ${answers[qIndex] === oIndex ? 'border-primary bg-primary text-primary-content' : 'border-base-300'}`}>
              <input type="radio" className="radio radio-sm" name={`q-${activityId}-${qIndex}`} checked={answers[qIndex] === oIndex}
                onChange={() => onChange(answers.map((answer, i) => (i === qIndex ? oIndex : answer)))} />
              {option}
            </label>)}
          </div>
        </fieldset>
      </li>)}
    </ol>
    {!questions.length ? <p className="text-xs text-muted">No questions configured — contact your teacher.</p> : null}
  </div>;
}
