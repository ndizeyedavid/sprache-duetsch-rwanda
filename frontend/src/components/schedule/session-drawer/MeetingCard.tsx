import { useState } from 'react';
import { FiCheck,FiCopy,FiExternalLink,FiVideo } from 'react-icons/fi';
import { ClassJoinLink } from '../ClassJoinLink';

type Props = { sessionId: string; url: string; live: boolean; joinLabel: string };

/** The meeting link with one big join button and a copy button that confirms it worked. */
export function MeetingCard({ sessionId, url, live, joinLabel }: Props) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  }
  return (
    <section className="rounded-box border border-primary bg-brand-tint p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-primary"><FiVideo aria-hidden />{live ? 'Class is live now' : 'Meeting link'}</p>
      <p className="mt-1 truncate font-mono text-xs text-muted" title={url}>{url}</p>
      <div className="mt-3 flex gap-2">
        <ClassJoinLink sessionId={sessionId} href={url} className="btn btn-primary btn-sm flex-1 gap-1.5 rounded-full"><FiExternalLink aria-hidden />{joinLabel}</ClassJoinLink>
        <button type="button" onClick={() => void copy()} className="btn btn-sm gap-1.5 rounded-full border-line bg-base-100">
          {copied ? <FiCheck aria-hidden className="text-success" /> : <FiCopy aria-hidden />}{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </section>
  );
}
