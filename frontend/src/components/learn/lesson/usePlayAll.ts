import { useEffect,useRef,useState } from 'react';
import { playClip,stopClip } from '../audio/audio-player';
import type { Line } from '../types';

/** Play lines one after another (dialogue, reading text), knowing which one is speaking. */
export function usePlayAll(lines: Line[]) {
  const [current, setCurrent] = useState<number | null>(null);
  const run = useRef(0);
  useEffect(() => () => { run.current += 1; stopClip(); }, []);
  async function playAll(slow = false) {
    const id = ++run.current;
    for (let index = 0; index < lines.length; index += 1) {
      if (run.current !== id) return;
      setCurrent(index);
      // Another clip (a tapped speaker) or Stop interrupted this line: the whole run ends there.
      if (!(await playClip({ url: lines[index].audio, text: lines[index].de, slow }))) {
        if (run.current === id) setCurrent(null);
        return;
      }
      if (run.current === id) await new Promise((resolve) => setTimeout(resolve, slow ? 450 : 300));
    }
    if (run.current === id) setCurrent(null);
  }
  function stop() { run.current += 1; stopClip(); setCurrent(null); }
  return { current, playing: current !== null, playAll, stop };
}
