import { useState } from 'react';
import { FiHeadphones,FiPlay } from 'react-icons/fi';
import type { PaperAudio } from '../../lib/services/exam-centre';
import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';

/**
 * A past paper's listening recordings. Each one is fetched only when the student asks for it (recordings
 * of a whole exam part can be 20 MB), then plays in the normal audio player.
 */
export function PaperAudioList({ audio }: { audio: PaperAudio[] }) {
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  if (!audio.length) return null;
  return (
    <ul className="space-y-2" aria-label="Listening recordings">
      {audio.map((track) => (
        <li key={track.url} className="rounded-field border border-base-300 bg-base-100 p-2">
          <p className="flex items-center gap-2 text-sm font-semibold"><FiHeadphones aria-hidden className="text-primary" /><span lang="de">{track.title}</span></p>
          {loaded.has(track.url) ? <AuthenticatedMedia url={track.url} kind="audio" title={track.title} className="mt-2 w-full" />
            : <button type="button" onClick={() => setLoaded((current) => new Set(current).add(track.url))} className="btn btn-sm mt-2 gap-2 rounded-full border-line bg-base-200">
              <FiPlay aria-hidden />Load the recording
            </button>}
        </li>
      ))}
    </ul>
  );
}
