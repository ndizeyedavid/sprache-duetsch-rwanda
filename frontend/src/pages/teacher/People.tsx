import { useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { BulkBar } from '../../components/teacher/people/BulkBar';
import { ClassPulse } from '../../components/teacher/people/ClassPulse';
import { PeopleHero } from '../../components/teacher/people/PeopleHero';
import { filterRoster,type RosterFilter } from '../../components/teacher/people/roster-data';
import { RosterTable } from '../../components/teacher/people/RosterTable';
import { RosterToolbar } from '../../components/teacher/people/RosterToolbar';
import { useRosterInsights } from '../../components/teacher/people/useRosterInsights';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { createConversation,getClass,listClasses } from '../../lib/services';

const EMPTY: never[] = [];

/** One class: its pulse, then every learner with attendance, scores and support flags. */
export function TeacherPeople() {
  const { classGroupId = '' } = useParams();
  const navigate = useNavigate();
  const classes = useApi('teacher-classes', listClasses);
  const detail = useApi(`class-${classGroupId}`, () => getClass(classGroupId), Boolean(classGroupId));
  const { roster, loading: insightsLoading } = useRosterInsights(classGroupId, detail.data?.enrollments ?? EMPTY);
  const [filter, setFilter] = useState<RosterFilter>({ query: '', status: 'ALL', support: false, sort: 'name' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const rows = filterRoster(roster, filter);
  const threshold = detail.data?.attendanceThreshold?.value ?? null;

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  }
  const toggleAll = () => setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((row) => row.userId)));

  async function message(userIds: string[]) {
    setBulkError(null);
    setSending(true);
    try {
      const conversation = await createConversation({ participantIds: userIds });
      navigate(`/teacher/messages?thread=${conversation.id}`);
    } catch (err) {
      setBulkError(apiErrorMessage(err, 'Could not start the conversation.'));
    } finally {
      setSending(false);
    }
  }

  const hero = <PeopleHero group={detail.data ?? undefined} classes={classes.data ?? undefined} classGroupId={classGroupId} onSwitch={(id) => navigate(`/teacher/classes/${id}/people`)} />;
  if (detail.loading) return <div className="space-y-5">{hero}<LoadingBlock label="Loading roster…" /></div>;
  if (detail.error || !detail.data) {
    return <div className="space-y-5">{hero}<ErrorBlock message={detail.error ?? 'Could not load this class.'} onRetry={detail.refetch} /></div>;
  }
  return (
    <div className="space-y-5">
      {hero}
      <ClassPulse roster={roster} capacity={detail.data.capacity} threshold={threshold} loading={insightsLoading} />
      <RosterToolbar roster={roster} filter={filter} onChange={(patch) => setFilter((prev) => ({ ...prev, ...patch }))} />
      {rows.length ? (
        <RosterTable rows={rows} selected={selected} threshold={threshold} classGroupId={classGroupId}
          onToggle={toggle} onToggleAll={toggleAll} onMessage={(ids) => void message(ids)} />
      ) : (
        <div className="rounded-box border border-line bg-base-100 p-8">
          <EmptyBlock title={roster.length ? 'No students match' : 'No students in this class yet'} hint={roster.length ? 'Try another filter or search.' : 'Enrolled learners appear here automatically.'} />
        </div>
      )}
      <BulkBar count={selected.size} sending={sending} error={bulkError} onMessage={() => void message([...selected])} onClear={() => { setSelected(new Set()); setBulkError(null); }} />
    </div>
  );
}
