import { useEffect,useRef,useState } from 'react';
import { FiHeadphones,FiPlay } from 'react-icons/fi';
import { stopClip } from '../../learn/audio/audio-player';

type Props = { url: string; plays: number; playKey: string; label?: string };

function playsLeftLabel(left: number, plays: number) {
  if (!left) return 'No plays left';
  if (left === plays) return plays === 1 ? 'You can play this once' : `You can play this ${plays} times`;
  return `${left} more play${left > 1 ? 's' : ''}`;
}

/**
 * An exam recording with a play limit ("Sie hören den Text zweimal"): it always plays from the start
 * and cannot be paused or skipped, like the real exam. The plays used are remembered per attempt on
 * this device, so reloading the page does not reset them.
 */
export function LimitedAudio({ url, plays, playKey, label = 'Recording' }: Props) {
  const storageKey = `plays:${playKey}:${url}`;
  const [used, setUsed] = useState(() => Number(localStorage.getItem(storageKey) ?? 0));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { audio.current?.pause(); }, []);
  const left = Math.max(0, plays - used);

  function count(delta: number) {
    setUsed((previous) => {
      const next = Math.max(0, previous + delta);
      localStorage.setItem(storageKey, String(next));
      return next;
    });
  }

  function play() {
    if (playing || !left) return;
    stopClip();
    const element = audio.current ?? new Audio(url);
    audio.current = element;
    element.currentTime = 0;
    element.ontimeupdate = () => setProgress(element.duration ? element.currentTime / element.duration : 0);
    element.onended = () => { setPlaying(false); setProgress(0); };
    // A clip that cannot load or start gives the play back (once, however many errors fire).
    let refunded = false;
    const refund = () => { if (refunded) return; refunded = true; setPlaying(false); setFailed(true); count(-1); };
    element.onerror = refund;
    setFailed(false);
    setPlaying(true);
    count(1);
    element.play().catch(refund);
  }

  return (
    <div className="flex items-center gap-3 rounded-field border border-base-300 bg-base-200 p-3">
      <button type="button" onClick={play} disabled={playing || !left} aria-label={`Play ${label.toLowerCase()} (${playsLeftLabel(left, plays)})`}
        className="btn btn-primary btn-circle btn-sm shrink-0">
        {playing ? <FiHeadphones aria-hidden /> : <FiPlay aria-hidden />}
      </button>
      <div className="min-w-0 grow">
        <progress className="progress progress-primary h-1.5 w-full" value={playing ? progress : 0} max={1} aria-label={`${label} progress`} />
        <p className="mt-1 text-xs text-muted" aria-live="polite">
          {failed ? 'The recording could not load. Check your connection and press play again.' : playing ? 'Playing… listen carefully.' : `${label} · ${playsLeftLabel(left, plays)}`}
        </p>
      </div>
    </div>
  );
}
