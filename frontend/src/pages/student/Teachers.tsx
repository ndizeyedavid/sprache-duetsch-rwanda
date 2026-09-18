import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Panel } from "../../components/ui/Panel";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage } from "../../lib/api";
import { createConversation, getMyPeople } from "../../lib/services";
import { PeopleToolbar } from "../../components/people/PeopleToolbar";
import { PeopleTable } from "../../components/people/PeopleTable";
import { GroupsTable } from "../../components/people/GroupsTable";
import type { PeopleTab } from "../../components/people/constants";
import { matches } from "../../components/people/utils";

export function Teachers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const people = useApi("my-people", getMyPeople);

  const tab = (searchParams.get("tab") as PeopleTab) || "All";
  const q = searchParams.get("q") || "";
  const groupFilter = searchParams.get("group") || "";
  const [localQ, setLocalQ] = useState(q);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [msgError, setMsgError] = useState<string | null>(null);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  const data = people.data;
  const groups = useMemo(() => data?.groups ?? [], [data]);
  const classmates = useMemo(() => data?.classmates ?? [], [data]);
  const teachers = useMemo(() => data?.teachers ?? [], [data]);

  const counts = useMemo(
    () =>
      ({
        All: classmates.length + teachers.length,
        Students: classmates.length,
        Teachers: teachers.length,
        Groups: groups.length,
      }) as Record<PeopleTab, number>,
    [classmates.length, teachers.length, groups.length],
  );

  const filteredPeople = useMemo(() => {
    let rows: {
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
      roleLabel: string;
      groups: { id: string; name: string }[];
      status?: string;
      extra?: string;
    }[] = [];
    if (tab === "All" || tab === "Students") {
      rows = rows.concat(
        classmates.map((c) => ({
          userId: c.userId,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          avatarUrl: c.avatarUrl,
          roleLabel: "Student",
          groups: c.groups,
          status: c.status,
          extra: c.currentLevel ? c.currentLevel.code : undefined,
        })),
      );
    }
    if (tab === "All" || tab === "Teachers") {
      rows = rows.concat(
        teachers.map((t) => ({
          userId: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          avatarUrl: t.avatarUrl,
          roleLabel: "Teacher",
          groups: t.groups,
        })),
      );
    }
    if (groupFilter)
      rows = rows.filter((r) => r.groups.some((g) => g.id === groupFilter));
    if (q)
      rows = rows.filter((r) =>
        matches(`${r.firstName} ${r.lastName} ${r.email}`, q),
      );
    return rows.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
      ),
    );
  }, [tab, classmates, teachers, groupFilter, q]);

  const filteredGroups = useMemo(() => {
    let list = groups;
    if (q)
      list = list.filter((g) =>
        matches(`${g.name} ${g.code} ${g.level.code}`, q),
      );
    if (groupFilter) list = list.filter((g) => g.id === groupFilter);
    return list;
  }, [groups, q, groupFilter]);

  async function handleMessage(userId: string) {
    setSendingId(userId);
    setMsgError(null);
    try {
      const convo = await createConversation({ participantIds: [userId] });
      navigate(`/messages?tab=Chats&thread=${convo.id}`);
    } catch (e) {
      setMsgError(apiErrorMessage(e, "Could not start conversation."));
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold">People</h1>
        </div>
        <div className="mt-4">
          <PeopleToolbar
            tab={tab as PeopleTab}
            onTab={(t) => setParam("tab", t === "All" ? null : t)}
            counts={counts}
            search={localQ}
            onSearch={setLocalQ}
            groupFilter={groupFilter}
            onGroupFilter={(v) => setParam("group", v || null)}
            groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          />
          {localQ !== q ? (
            <button
              type="button"
              onClick={() => setParam("q", localQ || null)}
              className="btn btn-xs mt-2 rounded-full border-line bg-base-100"
            >
              Apply search
            </button>
          ) : null}
          {msgError ? (
            <p className="alert alert-error mt-3 py-2 text-xs">{msgError}</p>
          ) : null}
        </div>
      </Panel>

      <Panel>
        {people.loading ? (
          <LoadingBlock label="Loading people…" />
        ) : people.error || !people.data ? (
          <ErrorBlock
            message={people.error ?? "Could not load people."}
            onRetry={people.refetch}
          />
        ) : groups.length === 0 ? (
          <EmptyBlock
            title="No groups yet"
            hint="You will see classmates and teachers once you are assigned to a group."
          />
        ) : tab === "Groups" ? (
          <GroupsTable groups={filteredGroups as never} />
        ) : (
          <PeopleTable
            rows={filteredPeople}
            onMessage={(id) => void handleMessage(id)}
            sendingId={sendingId}
          />
        )}
      </Panel>
    </div>
  );
}
