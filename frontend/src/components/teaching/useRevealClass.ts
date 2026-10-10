import { useEffect,useRef,useState } from 'react';
import type { ClassGroupItem } from '../../lib/services';

export type RevealClass = {
  /** Attach to the section the class lives in (`tabIndex={-1}`) as a focus target. */
  ref: React.RefObject<HTMLDivElement | null>;
  highlightedId: string | null;
  reveal: (className: string) => void;
  clear: () => void;
};

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Points the academic admin at the class that blocked a level removal. The
 * caller clears filters first, so the row is guaranteed to be mounted when we
 * move focus and scroll to it.
 */
export function useRevealClass(classes: ClassGroupItem[]): RevealClass {
  const ref = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightedId) return;
    const node = ref.current;
    if (!node) return;
    node.focus({ preventScroll: true });
    node.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [highlightedId]);

  return {
    ref,
    highlightedId,
    reveal: (className) =>
      setHighlightedId(classes.find((group) => group.name === className)?.id ?? null),
    clear: () => setHighlightedId(null),
  };
}