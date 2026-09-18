import { useMemo, useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import { useSession } from "../../lib/session";
import { getFeed } from "../../lib/services";
import type { Filter } from "../../components/activity/constants";
import { ActivityHeader } from "../../components/activity/ActivityHeader";
import { ActivityStats } from "../../components/activity/ActivityStats";
import { ActivityFeed } from "../../components/activity/ActivityFeed";
import { ComposerCard } from "../../components/activity/ComposerCard";
import { HighlightsRail } from "../../components/activity/HighlightsRail";
import { groupByDay } from "../../components/activity/utils";

export function Activity() {
  const { user } = useSession();
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const feed = useApi(`feed-${filter}`, () =>
    getFeed(filter === "All" ? undefined : filter.toUpperCase()),
  );
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

  const total = badgeSource.length;
  const announcements = counts.ANNOUNCEMENT ?? 0;
  const recent = badgeSource.filter(
    (e) =>
      Date.now() - new Date(e.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "You";

  return (
    <div className="space-y-4">
      <Panel>
        <ActivityHeader
          total={total}
          counts={counts}
          filter={filter}
          onFilter={setFilter}
          q={q}
          onQ={setQ}
          fetching={feed.fetching}
        />
      </Panel>

      <ActivityStats
        total={total}
        announcements={announcements}
        recent={recent}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
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
            <ActivityFeed
              groups={groups}
              loading={feed.loading}
              error={feed.error}
              onRetry={feed.refetch}
              fetching={feed.fetching}
              hasQuery={Boolean(q.trim() || filter !== "All")}
            />
          </Panel>
        </div>
        <div className="lg:col-span-4">
          <div className="sticky top-4 space-y-4">
            <HighlightsRail events={badgeSource} />
            <Panel className="border-dashed">
              <h3 className="text-sm font-bold">About this feed</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Enrolments, exams, attendance, payments and class updates appear
                here automatically.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
