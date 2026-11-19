import { useEffect,useState } from 'react';
import { clipKey,playClip,subscribe } from './audio-player';

/** Play one clip and know whether it (normal or slow) is playing right now. */
export function useClip(url: string | undefined, text: string) {
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => subscribe(setPlaying), []);
  return {
    playing: playing === clipKey(url, text) ? 'normal' as const : playing === clipKey(url, text, true) ? 'slow' as const : null,
    play: (slow = false) => playClip({ url, text, slow }),
  };
}
