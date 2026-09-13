import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { useSession } from '../../lib/session';
import { getFeed, humanize, isoDate, postFeedEvent } from '../../lib/services';

const FILTERS = ['All', 'Announcement', 'Exam', 'Attendance', 'Enrollment', 'Payment', 'Class'] as const;

const POST_TYPES = ['ANNOUNCEMENT', 'CLASS', 'SCHEDULE', 'EXAM', 'LESSON'] as const;

/** Shared activity feed. Staff/teachers additionally get the post composer. */
export function Activity() {
  const { user } = useSession();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const feed = useApi(
    `feed-${filter}`,
    () => getFeed(filter === 'All' ? undefined : filter.toUpperCase()),
  );

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState<string>('ANNOUNCEMENT');
  const [postError, setPostError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const isStaff = user ? user.role !== 'STUDENT' : false;
  const events = feed.data ?? [];

  async function handlePost(event: FormEvent) {
    event.preventDefault();
    setPostError(null);
    setPosting(true);
    try {
      await postFeedEvent({ type: postType, title: title.trim(), body: body.trim() || undefined });
      setTitle('');
      setBody('');
      feed.refetch();
    } catch (err) {
      setPostError(apiErrorMessage(err, 'Could not publish the update.'));
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-5">
      {isStaff ? (
        <Panel>
          <SectionHeader title="Post an update" />
          <form onSubmit={handlePost} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={postType}
                onChange={(event) => setPostType(event.target.value)}
                className="select w-full rounded-field border-line bg-base-200"
                aria-label="Update type"
              >
                {POST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {humanize(type)}
                  </option>
                ))}
              </select>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Headline"
                className="input w-full rounded-field border-line bg-base-200 sm:col-span-2"
              />
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Details (optional)"
              rows={2}
              className="textarea w-full rounded-field border-line bg-base-200"
            />
            {postError ? (
              <p role="alert" className="text-xs font-medium text-error">
                {postError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={posting}
              className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {posting ? <span className="loading loading-spinner loading-sm" /> : 'Publish'}
            </button>
          </form>
        </Panel>
      ) : null}

      <Panel>
        <SectionHeader title="Activity feed" />
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilter(name)}
              className={`btn btn-sm rounded-full ${
                filter === name ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {feed.loading ? (
          <LoadingBlock label="Loading activity…" />
        ) : feed.error ? (
          <ErrorBlock message={feed.error} onRetry={feed.refetch} />
        ) : events.length === 0 ? (
          <EmptyBlock
            title="Nothing here yet"
            hint="Enrolments, exams, payments and class updates appear in this feed automatically."
          />
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-3 rounded-field bg-base-200 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug">{event.title}</p>
                  {event.body ? (
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted">{event.body}</p>
                  ) : null}
                  <p className="mt-1.5 text-[11px] text-muted">
                    {event.actorName ?? 'Sprache RW'} · {isoDate(event.createdAt)}
                  </p>
                </div>
                <StatusBadge status={humanize(event.type)} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
