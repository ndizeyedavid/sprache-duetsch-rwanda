import { useMemo,useState } from 'react';
import type { SessionItem } from '../types';
import type { Answer,Verdict } from './grading';
import { gradeItem,isAnswered } from './grading';

/** A missed question comes back at the end, at most this many extra times. */
const MAX_RETRIES = 2;

type State = {
  queue: string[];
  position: number;
  answer: Answer | null;
  verdict: Verdict | null;
  firstTry: Record<string, boolean>;
  retries: Record<string, number>;
  finished: Set<string>;
};

const fresh = (items: SessionItem[]): State => ({
  queue: items.map((item) => item.id), position: 0, answer: null, verdict: null, firstTry: {}, retries: {}, finished: new Set(),
});

/**
 * Duolingo-style flow: answer → check → feedback → continue. Wrong answers return at the end of the
 * queue; the score is what was right the first time.
 */
export function useSession(items: SessionItem[]) {
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const [state, setState] = useState<State>(() => fresh(items));
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const item = byId.get(state.queue[state.position]) ?? null;
  const done = state.position >= state.queue.length;

  function setAnswer(answer: Answer | null) {
    setState((current) => (current.verdict ? current : { ...current, answer }));
  }

  /** Grade the current answer; `given` lets self-checking questions (match, speak) submit directly. */
  function check(given?: Answer) {
    setState((current) => {
      const currentItem = byId.get(current.queue[current.position]);
      const answer = given ?? current.answer;
      if (!currentItem || current.verdict || !isAnswered(answer)) return current;
      const verdict = gradeItem(currentItem, answer);
      const id = currentItem.id;
      const firstTry = id in current.firstTry ? current.firstTry : { ...current.firstTry, [id]: verdict.correct };
      const tries = current.retries[id] ?? 0;
      const again = !verdict.correct && tries < MAX_RETRIES;
      const finished = again ? current.finished : new Set(current.finished).add(id);
      return { ...current, answer, verdict, firstTry, finished,
        queue: again ? [...current.queue, id] : current.queue, retries: again ? { ...current.retries, [id]: tries + 1 } : current.retries };
    });
  }

  function next() {
    setState((current) => (current.verdict ? { ...current, position: current.position + 1, answer: null, verdict: null } : current));
  }

  /** "Can't speak now": remaining speaking questions count as done. */
  function skipSpeaking() {
    setState((current) => {
      const speaking = new Set(current.queue.slice(current.position).filter((id) => byId.get(id)?.kind === 'speak'));
      const firstTry = { ...current.firstTry };
      speaking.forEach((id) => { if (!(id in firstTry)) firstTry[id] = true; });
      const rest = current.queue.slice(current.position).filter((id) => !speaking.has(id));
      return { ...current, queue: [...current.queue.slice(0, current.position), ...rest], answer: null, verdict: null, firstTry,
        finished: new Set([...current.finished, ...speaking]) };
    });
  }

  function restart() {
    setStartedAt(Date.now());
    setState(fresh(items));
  }

  const correctFirst = items.filter((entry) => state.firstTry[entry.id] === true).length;
  return {
    item, done, answer: state.answer, verdict: state.verdict,
    /** Position in the queue: changes only when moving to the next question. */
    step: state.position,
    progress: items.length ? state.finished.size / items.length : 1,
    remaining: state.queue.length - state.position,
    /** True while the feedback of the very last question is showing. */
    isLast: state.verdict !== null && state.position + 1 >= state.queue.length,
    results: state.firstTry,
    score: items.length ? correctFirst / items.length : 1,
    mistakes: items.filter((entry) => state.firstTry[entry.id] === false),
    seconds: () => Math.round((Date.now() - startedAt) / 1000),
    setAnswer, check, next, skipSpeaking, restart,
  };
}
