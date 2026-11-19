import { FiVolume2 } from 'react-icons/fi';
import { useClip } from './useClip';

type Props = {
  text: string;
  audio?: string;
  /** Also offer the slow version (turtle) next to the normal one. */
  slow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
};

const SIZES = { sm: 'size-7 text-sm', md: 'size-9 text-base', lg: 'size-14 text-2xl' };

/**
 * Speaker button for a German word or sentence; the turtle plays it slowly. Without a recording there is
 * no button: the device's own voice (often female) next to the lesson's recordings sounds like a second
 * speaker repeating the line.
 */
export function SayButton({ text, audio, slow = false, size = 'sm', label, className = '' }: Props) {
  const clip = useClip(audio, text);
  if (!audio) return null;
  return <span className={`inline-flex shrink-0 items-center gap-1 align-middle ${className}`}>
    <button type="button" onClick={() => void clip.play()} aria-label={label ?? `Listen: ${text}`} title="Listen"
      className={`btn btn-circle border-0 ${SIZES[size]} ${clip.playing === 'normal' ? 'bg-primary text-primary-content' : 'bg-brand-soft text-brand-soft-ink hover:bg-primary hover:text-primary-content'}`}>
      <FiVolume2 aria-hidden className={clip.playing === 'normal' ? 'animate-pulse' : ''} />
    </button>
    {slow ? <button type="button" onClick={() => void clip.play(true)} aria-label={`Listen slowly: ${text}`} title="Listen slowly"
      className={`btn btn-circle border-0 ${SIZES[size === 'lg' ? 'md' : 'sm']} ${clip.playing === 'slow' ? 'bg-primary text-primary-content' : 'bg-base-200 text-ink hover:bg-primary hover:text-primary-content'}`}>
      <span aria-hidden className="text-[0.95em] leading-none">🐢</span>
    </button> : null}
  </span>;
}
