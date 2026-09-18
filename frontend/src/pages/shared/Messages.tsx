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
  const [draft, setDraft] = useState("");
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
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");

  const messagesApi = useApi(`thread-${selectedId ?? "none"}`, () => listThreadMessages(selectedId ?? ""), selectedId !== null);
  const [localThreads, setLocalThreads] = useState<typeof threads.data>(null);
  const [localMessages, setLocalMessages] = useState<typeof messagesApi.data>(null);
  useEffect(() => { if (threads.data) setLocalThreads(threads.data); }, [threads.data]);
  useEffect(() => { setLocalMessages(null); }, [selectedId]);
  useEffect(() => { if (messagesApi.data) setLocalMessages(messagesApi.data); }, [messagesApi.data]);

  useEffect(() => {
    const v = searchParams.get("tab") as Tab;
    if (v && TABS.includes(v) && v !== tab) setTab(v);
    const t = searchParams.get("thread");
    if (t !== selectedId) setSelectedId(t);
  }, [searchParams, tab, selectedId]);

  function switchTab(next: Tab) {
    setTab(next);
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
    if (!selectedId || !body) return;
    setSending(true);
    setChatError(null);
    try {
      const msg = await sendChatMessage(selectedId, body);
      setDraft("");
      setLocalMessages((prev) => (prev ? [...prev, msg] : [msg]));
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
      setLocalThreads((prev) => (prev ? [created as never, ...prev] : [created as never]));
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
  const threadMessages = useMemo(() => localMessages ?? messagesApi.data ?? [], [localMessages, messagesApi.data]);
  const unreadChats = threadList.filter((t) => t.unreadCount > 0).length;
  const unreadNotices = notices.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-4">
      <Panel>
        <InboxHeader tab={tab} onTab={switchTab} unreadChats={unreadChats} unreadNotices={unreadNotices} totalChats={threadList.length} totalNotices={notices.length} onCompose={() => setShowCompose(true)} />
        <p className="mt-2 text-xs text-muted">{tab === "Chats" ? `${unreadChats} unread · ${threadList.length} conversations` : `${unreadNotices} unread · ${notices.length} notices`}</p>
      </Panel>

      {tab === "Chats" ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <Panel className={`lg:col-span-4 xl:col-span-4 ${mobileView === "thread" ? "hidden lg:block" : ""}`} padded={false}>
            <div className="p-4">
              <ConversationList threads={threadList} loading={threads.loading} error={threads.error} onRetry={threads.refetch} selectedId={selectedId} onPick={pickThread} myId={me?.id} search={threadSearch} onSearch={setThreadSearch} filter={threadFilter} onFilter={setThreadFilter} onCompose={() => setShowCompose(true)} />
            </div>
          </Panel>
          <Panel className={`overflow-hidden p-0 lg:col-span-8 xl:col-span-8 ${mobileView === "list" ? "hidden lg:block" : ""}`}>
            <MessageView thread={selectedThread} messages={threadMessages} loading={messagesApi.loading && !localMessages} error={messagesApi.error} onRetry={messagesApi.refetch} myId={me?.id} draft={draft} onDraft={setDraft} onSend={() => void handleSend()} sending={sending} chatError={chatError} onBack={() => setMobileView("list")} />
          </Panel>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          <Panel className={`lg:col-span-4 xl:col-span-4 ${selectedNoticeId && mobileView === "thread" ? "hidden lg:block" : ""}`} padded={false}>
            <div className="p-4">
              <NoticeList notices={filteredNotices} loading={inbox.loading} error={inbox.error} onRetry={inbox.refetch} selectedId={selectedNotice?.id ?? null} onPick={openNotice} search={noticeSearch} onSearch={setNoticeSearch} filter={noticeFilter} onFilter={setNoticeFilter} onMarkAll={() => void handleMarkAll()} markingAll={markingAll} noticeError={noticeError} />
            </div>
          </Panel>
          <Panel className={`overflow-hidden p-0 lg:col-span-8 xl:col-span-8 ${!selectedNoticeId && mobileView === "list" ? "hidden lg:block" : ""}`}>
            <NoticeDetail notice={selectedNotice as never} onBack={() => setMobileView("list")} />
          </Panel>
        </div>
      )}

      <ComposeModal open={showCompose} onClose={() => setShowCompose(false)} contacts={contacts.data ?? []} loading={contacts.loading} error={contacts.error} onCreate={(ids, title) => void handleCreate(ids, title)} creating={creating} />
    </div>
  );
}
