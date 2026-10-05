import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Panel } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage } from "../../lib/api";
import { useSession } from "../../lib/session";
import {
  createConversation,
  listContacts,
  listConversations,
  listNotifications,
  listThreadMessages,
  markAllNotificationsRead,
  markConversationRead,
  markNotificationRead,
  sendChatMessage,
} from "../../lib/services";
import { TABS } from "../../components/messaging/constants";
import type { Tab } from "../../components/messaging/constants";
import { InboxHeader } from "../../components/messaging/InboxHeader";
import { ConversationList } from "../../components/messaging/ConversationList";
import { MessageView } from "../../components/messaging/MessageView";
import { ComposeModal } from "../../components/messaging/ComposeModal";
import { NoticeList, NoticeDetail } from "../../components/messaging/NoticePane";

export function Messages() {
  const { user: me } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get("tab") as Tab) || "Chats";
  const [tab, setTab] = useState<Tab>(TABS.includes(tabParam) ? tabParam : "Chats");

  const threads = useApi("conversations", listConversations);
  const contacts = useApi("contacts", listContacts);
  const inbox = useApi("notifications", listNotifications);

  const threadParam = searchParams.get("thread");
  const [selectedId, setSelectedId] = useState<string | null>(threadParam);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draft = selectedId ? drafts[selectedId] ?? "" : "";
  const setDraft = (value: string) => { if (selectedId) setDrafts(prev => ({ ...prev, [selectedId]: value })); };
  const [chatError, setChatError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [creating, setCreating] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");
  const [threadFilter, setThreadFilter] = useState<"all" | "unread">("all");
  const [noticeSearch, setNoticeSearch] = useState("");
  const [noticeFilter, setNoticeFilter] = useState<"all" | "unread">("all");
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const selectedNoticeId = searchParams.get("notice");
  const [mobileView, setMobileView] = useState<"list" | "thread">(threadParam || selectedNoticeId ? "thread" : "list");

  const messagesApi = useApi(`thread-${selectedId ?? "none"}`, () => listThreadMessages(selectedId ?? ""), selectedId !== null);
  const [localThreads, setLocalThreads] = useState<typeof threads.data>(null);
  const [localMessages, setLocalMessages] = useState<typeof messagesApi.data>(null);
  useEffect(() => { if (threads.data) setLocalThreads(threads.data); }, [threads.data]);
  useEffect(() => { setLocalMessages(null); }, [selectedId]);
  useEffect(() => { if (messagesApi.data && !messagesApi.stale) setLocalMessages(messagesApi.data); }, [messagesApi.data, messagesApi.stale]);

  useEffect(() => {
    const v = searchParams.get("tab") as Tab;
    if (v && TABS.includes(v) && v !== tab) setTab(v);
    const t = searchParams.get("thread");
    if (t !== selectedId) setSelectedId(t);
  }, [searchParams, tab, selectedId]);

  function switchTab(next: Tab) {
    setTab(next);
    setMobileView("list");
    const p = new URLSearchParams(searchParams);
    p.set("tab", next);
    setSearchParams(p);
  }

  function pickThread(id: string) {
    setSelectedId(id);
    setChatError(null);
    setMobileView("thread");
    const p = new URLSearchParams(searchParams);
    p.set("thread", id);
    p.set("tab", "Chats");
    setSearchParams(p);
    setLocalThreads((prev) => (prev ? prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)) : prev));
    markConversationRead(id).catch(() => {});
  }

  useEffect(() => {
    if (tab !== "Chats") return;
    const timer = setInterval(() => { threads.refetch(); if (selectedId) messagesApi.refetch(); }, 15000);
    return () => clearInterval(timer);
  }, [tab, selectedId, threads, messagesApi]);

  async function handleSend() {
    const body = draft.trim();
    if (!selectedId || !body || sending) return;
    setSending(true);
    setChatError(null);
    try {
      const msg = await sendChatMessage(selectedId, body);
      setDrafts(prev => ({ ...prev, [selectedId]: "" }));
      messagesApi.refetch();
      setLocalThreads((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((t) => t.id === selectedId);
        if (idx === -1) return prev;
        const updated = { ...prev[idx], messages: [msg], updatedAt: msg.createdAt, unreadCount: 0 };
        return [updated, ...prev.filter((t) => t.id !== selectedId)];
      });
    } catch (err) { setChatError(apiErrorMessage(err, "Could not send.")); } finally { setSending(false); }
  }

  async function handleCreate(ids: string[], title?: string) {
    setCreating(true);
    setChatError(null);
    try {
      const source = localThreads ?? threads.data ?? [];
      if (ids.length === 1) {
        const contactId = ids[0];
        const existing = source.find((th) => {
          if (th.title) return false;
          const uniq = [...new Set(th.participants.map((m) => m.user.id))];
          return uniq.length === 2 && uniq.includes(contactId) && me?.id && uniq.includes(me.id);
        });
        if (existing) { pickThread(existing.id); setShowCompose(false); return; }
      }
      const created = await createConversation({ participantIds: ids, title });
      setLocalThreads((prev) => [created, ...(prev ?? []).filter((thread) => thread.id !== created.id)]);
      pickThread(created.id);
      threads.refetch();
      setShowCompose(false);
    } catch (err) { setChatError(apiErrorMessage(err, "Could not start chat.")); } finally { setCreating(false); }
  }

  async function openNotice(id: string) {
    const p = new URLSearchParams(searchParams);
    p.set("notice", id);
    p.set("tab", "Notices");
    setSearchParams(p);
    setMobileView("thread");
    try { await markNotificationRead(id); inbox.refetch(); } catch (err) { setNoticeError(apiErrorMessage(err, "Could not mark read.")); }
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    setNoticeError(null);
    try { await markAllNotificationsRead(); inbox.refetch(); } catch (err) { setNoticeError(apiErrorMessage(err, "Could not mark all.")); } finally { setMarkingAll(false); }
  }

  const threadList = useMemo(() => localThreads ?? threads.data ?? [], [localThreads, threads.data]);
  const selectedThread = useMemo(() => threadList.find((t) => t.id === selectedId) ?? null, [threadList, selectedId]);
  const notices = useMemo(() => inbox.data ?? [], [inbox.data]);
  const filteredNotices = useMemo(() => {
    let list = notices;
    if (noticeFilter === "unread") list = list.filter((n) => !n.readAt);
    if (noticeSearch.trim()) list = list.filter((n) => `${n.title} ${n.body ?? ""}`.toLowerCase().includes(noticeSearch.trim().toLowerCase()));
    return list;
  }, [notices, noticeFilter, noticeSearch]);
  const selectedNotice = useMemo(() => (selectedNoticeId ? notices.find((n) => n.id === selectedNoticeId) ?? null : filteredNotices[0] ?? null), [notices, selectedNoticeId, filteredNotices]);
  const threadMessages = useMemo(() => messagesApi.stale ? [] : localMessages ?? messagesApi.data ?? [], [localMessages, messagesApi.data, messagesApi.stale]);
  const unreadChats = threadList.filter((t) => t.unreadCount > 0).length;
  const unreadNotices = notices.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-4">
      <Panel className="p-5 sm:p-7">
        <InboxHeader tab={tab} onTab={switchTab} unreadChats={unreadChats} unreadNotices={unreadNotices} totalChats={threadList.length} totalNotices={notices.length} onCompose={() => setShowCompose(true)} />
      </Panel>

      {tab === "Chats" ? (
        <div className="grid min-h-[480px] gap-0 overflow-hidden rounded-box border border-base-300 bg-base-100 lg:h-[min(720px,calc(100dvh-260px))] lg:grid-cols-12">
          <Panel className={`min-h-0 border-0 border-r border-base-300 rounded-none! lg:col-span-4 xl:col-span-4 ${mobileView === "thread" ? "hidden lg:block" : ""}`} padded={false}>
            <div className="h-full min-h-[460px] lg:min-h-0">
              <ConversationList threads={threadList} loading={threads.loading} error={threads.error} onRetry={threads.refetch} selectedId={selectedId} onPick={pickThread} myId={me?.id} search={threadSearch} onSearch={setThreadSearch} filter={threadFilter} onFilter={setThreadFilter} onCompose={() => setShowCompose(true)} />
            </div>
          </Panel>
          <Panel padded={false} className={`h-[calc(100dvh-240px)] min-h-[440px] overflow-hidden rounded-none! border-0 lg:h-full lg:col-span-8 xl:col-span-8 ${mobileView === "list" ? "hidden lg:block" : ""}`}>
            <MessageView thread={selectedThread} messages={threadMessages} loading={messagesApi.stale || (messagesApi.loading && !localMessages)} error={messagesApi.error} onRetry={messagesApi.refetch} myId={me?.id} draft={draft} onDraft={setDraft} onSend={() => void handleSend()} sending={sending} chatError={chatError} onBack={() => setMobileView("list")} />
          </Panel>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-12">
          <Panel className={`min-w-0 lg:col-span-4 xl:col-span-4 ${selectedNoticeId && mobileView === "thread" ? "hidden lg:block" : ""}`} padded={false}>
            <div className="p-4">
              <NoticeList notices={filteredNotices} loading={inbox.loading} error={inbox.error} onRetry={inbox.refetch} selectedId={selectedNotice?.id ?? null} onPick={openNotice} search={noticeSearch} onSearch={setNoticeSearch} filter={noticeFilter} onFilter={setNoticeFilter} onMarkAll={() => void handleMarkAll()} markingAll={markingAll} noticeError={noticeError} />
            </div>
          </Panel>
          <Panel className={`min-w-0 overflow-hidden p-0 lg:col-span-8 xl:col-span-8 ${mobileView === "list" ? "hidden lg:block" : ""}`}>
            <NoticeDetail notice={selectedNotice as never} onBack={() => setMobileView("list")} />
          </Panel>
        </div>
      )}

      <ComposeModal key={showCompose ? "open" : "closed"} open={showCompose} onClose={() => setShowCompose(false)} contacts={contacts.data ?? []} loading={contacts.loading} error={contacts.error || chatError} onCreate={(ids, title) => void handleCreate(ids, title)} creating={creating} />
    </div>
  );
}
