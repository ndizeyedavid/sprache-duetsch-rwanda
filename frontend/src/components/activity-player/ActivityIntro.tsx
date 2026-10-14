import { FiClock } from 'react-icons/fi';
import { Panel } from '../ui/Panel';
import { isCompletionType } from './response-utils';

type Props = { title: string; type: string; instructions: string | null; guarded: boolean };

export function ActivityIntro({ title, type, instructions, guarded }: Props) {
  return <Panel>
    {guarded ? <span className="mb-3 inline-flex rounded-box border border-warning bg-warning px-3 py-1.5 text-xs font-bold text-warning-content">Anti-cheat: fullscreen · no copy/paste · 3 strikes lock</span> : null}
    <span className="flex w-fit items-center gap-2 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-primary-content"><FiClock aria-hidden />{isCompletionType(type) ? 'Self-study' : 'Practice activity'}</span>
    <h1 className="mt-2 text-xl font-bold leading-tight">{title}</h1>
    {instructions ? <p className="mt-1 text-sm leading-relaxed text-muted whitespace-pre-wrap">{instructions}</p> : null}
  </Panel>;
}
