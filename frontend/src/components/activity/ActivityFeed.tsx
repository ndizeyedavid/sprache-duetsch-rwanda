import { EmptyBlock, ErrorBlock, LoadingBlock } from "../common/PageState";
import { FeedItem } from "./FeedItem";

type Group = { label: string; items: { id: string; title: string; body: string | null; type: string; actorName: string | null; actorAvatarUrl?: string | null; createdAt: string }[] };

type Props = {
  groups: Group[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fetching: boolean;
  hasQuery: boolean;
};

export function ActivityFeed({ groups, loading, error, onRetry, fetching, hasQuery }: Props) {
  if (loading) return <LoadingBlock label="Loading activity…" />;
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />;
  const empty = groups.length === 0 || groups.every((g) => g.items.length === 0);
  if (empty) {
    return <EmptyBlock title={hasQuery ? "No matches" : "Nothing here yet"} hint={hasQuery ? "Try another search or clear the filter." : "Enrolments, exams, payments and class updates appear here automatically."} />;
  }
  return (
    <div className="relative">
      {fetching ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-box bg-base-100/60 pt-6 backdrop-blur-[1px]" aria-live="polite" aria-busy="true">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-base-100 px-4 py-2 text-xs font-medium">
            <span className="loading loading-spinner loading-xs text-brand" aria-hidden /> Updating feed…
          </span>
        </div>
      ) : null}
      <div className={`space-y-6 transition ${fetching ? "opacity-60" : "opacity-100"}`} aria-busy={fetching}>
        {groups.map((g) => (
          <div key={g.label}>
            <div className="sticky top-0 z-10 -mx-5 bg-base-100/80 px-5 py-2 backdrop-blur">
              <h2 className="inline-flex rounded-full bg-base-200 px-3 py-1 text-xs font-bold tracking-wide text-muted">{g.label}</h2>
            </div>
            <ul className="mt-3">
              {g.items.map((ev) => (
                <FeedItem key={ev.id} title={ev.title} body={ev.body} type={ev.type} actorName={ev.actorName} actorAvatarUrl={ev.actorAvatarUrl} createdAt={ev.createdAt} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
