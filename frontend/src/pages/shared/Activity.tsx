import { useMemo, useState } from "react";
import { FiActivity, FiSearch, FiX } from "react-icons/fi";
import { Panel } from "../../components/ui/Panel";
import {
 EmptyBlock,
 ErrorBlock,
 LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { useSession } from "../../lib/session";
import { getFeed } from "../../lib/services";
import { FILTERS, FILTER_ICON } from "../../components/activity/constants";
import type { Filter } from "../../components/activity/constants";
import { ComposerCard } from "../../components/activity/ComposerCard";
import { FeedItem } from "../../components/activity/FeedItem";
import { groupByDay } from "../../components/activity/utils";

export function Activity() {
 const { user } = useSession();
 const [filter, setFilter] = useState<Filter>("All");
 const [q, setQ] = useState("");
 const feed = useApi(`feed-${filter}`, () =>
 getFeed(filter === "All" ? undefined : filter.toUpperCase()),
 );
 // Persistent badge counts: always from the unfiltered feed so pills never disappear
 const feedAll = useApi("feed-all-badges", () => getFeed(undefined));
 const isStaff = user ? user.role !== "STUDENT" : false;
 const events = useMemo(() => feed.data ?? [], [feed.data]);

 const filtered = useMemo(() => {
 if (!q.trim()) return events;
 const needle = q.trim().toLowerCase();
 return events.filter((e) =>
 `${e.title} ${e.body ?? ""} ${e.actorName ?? ""}`
 .toLowerCase()
 .includes(needle),
 );
 }, [events, q]);

 const groups = useMemo(() => groupByDay(filtered), [filtered]);
 const badgeSource = feedAll.data ?? events;
 const counts: Record<string, number> = {};
 for (const e of badgeSource) counts[e.type] = (counts[e.type] ?? 0) + 1;
 const allCount = badgeSource.length;

 const displayName = user
 ? `${user.firstName} ${user.lastName}`.trim()
 : "You";

 return (
 <div className="mx-auto max-w-3xl space-y-4">
 <Panel className="sticky top-0 z-10 border-b-0">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <h1 className="flex items-center gap-2 text-base font-bold">
 <FiActivity aria-hidden className="text-brand" />
 Activity
 </h1>
 <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium">
 {events.length} updates
 </span>
 </div>
 <div className="mt-3 flex flex-wrap gap-1.5">
 {FILTERS.map((name) => {
 const Icon = FILTER_ICON[name];
 const active = filter === name;
 const isActiveFetching = active && feed.fetching;
 const c = name === "All" ? allCount : (counts[name.toUpperCase()] ?? 0);
 return (
 <button
 key={name}
 type="button"
 onClick={() => setFilter(name)}
 aria-pressed={active}
 disabled={feed.fetching}
 className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${active ? "border-brand bg-brand text-white" : "border-line bg-base-100 text-muted hover:border-brand/20 hover:text-ink"}`}
 >
 {isActiveFetching ? (
 <span
 className="loading loading-spinner loading-xs"
 aria-hidden
 />
 ) : (
 <Icon aria-hidden className="text-xs" />
 )}
 {name}
 {c > 0 ? (
 <span
 className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? "bg-white/20" : "bg-base-200"}`}
 >
 {c}
 </span>
 ) : null}
 </button>
 );
 })}
 </div>
 <div className="relative mt-3">
 <FiSearch
 aria-hidden
 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
 />
 <input
 value={q}
 onChange={(e) => setQ(e.currentTarget.value)}
 placeholder="Search activity…"
 className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs"
 />
 {q ? (
 <button
 type="button"
 onClick={() => setQ("")}
 className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"
 >
 <FiX aria-hidden />
 </button>
 ) : null}
 </div>
 </Panel>

 {isStaff ? (
 <ComposerCard
 displayName={displayName}
 avatarUrl={user?.avatarUrl ?? null}
 onPosted={() => {
 feed.refetch();
 feedAll.refetch();
 }}
 />
 ) : null}

 <Panel>
 {feed.loading ? (
 <LoadingBlock label="Loading activity…" />
 ) : feed.error ? (
 <ErrorBlock message={feed.error} onRetry={feed.refetch} />
 ) : filtered.length === 0 ? (
 <EmptyBlock
 title={q ? "No matches" : "Nothing here yet"}
 hint={
 q
 ? "Try another search or clear the filter."
 : "Enrolments, exams, payments and class updates appear in this feed automatically — Canvas style."
 }
 />
 ) : (
 <div className="relative">
 {feed.fetching ? (
 <div
 className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center rounded-box bg-base-100/70 pt-8 backdrop-blur-[1px]"
 aria-live="polite"
 aria-busy="true"
 >
 <span className="inline-flex items-center gap-2 rounded-full border border-line bg-base-100 px-4 py-2 text-xs font-medium">
 <span
 className="loading loading-spinner loading-xs text-brand"
 aria-hidden
 />{" "}
 Updating feed…
 </span>
 </div>
 ) : null}
 <div
 className={`space-y-6 transition ${feed.fetching ? "opacity-60" : "opacity-100"}`}
 aria-busy={feed.fetching}
 >
 {groups.map((g) => (
 <div key={g.label}>
 <div className="sticky top-[88px] z-10 -mx-5 bg-base-100/80 px-5 py-2 backdrop-blur">
 <h2 className="text-xs font-bold tracking-widest text-muted">
 {g.label}
 </h2>
 </div>
 <ul className="mt-2">
 {g.items.map((ev) => (
 <FeedItem
 key={ev.id}
 title={ev.title}
 body={ev.body}
 type={ev.type}
 actorName={ev.actorName}
 actorAvatarUrl={ev.actorAvatarUrl}
 createdAt={ev.createdAt}
 />
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>
 )}
 </Panel>
 </div>
 );
}
