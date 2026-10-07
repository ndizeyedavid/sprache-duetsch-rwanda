import { useMediaSource } from '../../hooks/useMediaSource';

export function AuthenticatedMedia({ url, kind, title, className }: {
  url: string; kind: 'audio' | 'video' | 'image' | 'pdf'; title?: string; className?: string;
}) {
  const { source, error } = useMediaSource(url);
  if (error) return <p role="alert" className="alert alert-error text-sm">Unable to load {title ?? kind}. Check your connection and reload.</p>;
  if (!source) return <p role="status" className="text-sm text-base-content/60">Loading {title ?? kind}…</p>;
  if (kind === 'image') return <img src={source} alt={title ?? 'Learning illustration'} className={className} />;
  if (kind === 'pdf') return <iframe src={source} title={title ?? 'Document'} className={className} />;
  if (kind === 'video') return <video controls preload="metadata" src={source} className={className} />;
  return <audio controls preload="metadata" src={source} className={className} />;
}
