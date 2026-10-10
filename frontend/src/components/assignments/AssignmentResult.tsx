import { FiCheck,FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

type Props = { title: string; score?: string | null; feedback?: string | null; onRedo?: () => void; retryLabel?: string };

export function AssignmentResult({ title, score, feedback, onRedo, retryLabel = 'Redo activity' }: Props) {
  return (
    <section className="card learning-panel items-center gap-4 p-6 text-center sm:p-8">
      <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><FiCheck aria-hidden className="text-3xl" /></span>
      <h3 className="text-xl font-semibold">{title}</h3>
      {score ? <p className="text-lg font-semibold">{score}</p> : null}
      {feedback ? <div className="w-full max-w-xl rounded-field bg-base-200/60 p-4 text-left"><p className="mb-2 flex items-center gap-2 text-xs font-semibold"><FiMessageCircle aria-hidden />Teacher feedback</p><p className="whitespace-pre-wrap text-sm leading-7 text-base-content/75">{feedback}</p></div> : null}
      <div className="flex flex-wrap justify-center gap-2"><Link to="/grades" className="btn btn-primary btn-sm rounded-full">View grades</Link><Link to="/assignments" className="btn btn-sm rounded-full">Assignments</Link>{onRedo ? <button type="button" onClick={onRedo} className="btn btn-ghost btn-sm rounded-full">{retryLabel}</button> : null}</div>
    </section>
  );
}
