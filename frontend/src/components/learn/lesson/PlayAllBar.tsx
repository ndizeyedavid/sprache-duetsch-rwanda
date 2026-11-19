import { FiPlay,FiSquare } from 'react-icons/fi';

/** "Listen to everything" controls for a dialogue or text. */
export function PlayAllBar({ playing, onPlay, onStop, label }: { playing: boolean; onPlay: (slow: boolean) => void; onStop: () => void; label: string }) {
  return <div className="flex flex-wrap items-center gap-2">
    {playing
      ? <button type="button" className="btn btn-sm rounded-full border-0 bg-primary text-primary-content" onClick={onStop}><FiSquare aria-hidden />Stop</button>
      : <>
        <button type="button" className="btn btn-sm rounded-full border-0 bg-primary text-primary-content" onClick={() => onPlay(false)}><FiPlay aria-hidden />{label}</button>
        <button type="button" className="btn btn-sm rounded-full border-line bg-base-100" onClick={() => onPlay(true)}><span aria-hidden>🐢</span>Slowly</button>
      </>}
  </div>;
}
