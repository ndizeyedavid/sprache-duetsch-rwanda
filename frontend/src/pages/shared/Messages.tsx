import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { useSession } from '../../lib/session';
import { createConversation, listContacts, listConversations, listNotifications, listThreadMessages, markAllNotificationsRead, markConversationRead, markNotificationRead, sendChatMessage } from '../../lib/services';
import { TABS } from '../../components/messaging/constants';
import type { Tab } from '../../components/messaging/constants';
import { ThreadList } from '../../components/messaging/ThreadList';
import { ThreadView } from '../../components/messaging/ThreadView';
import { ContactPicker } from '../../components/messaging/ContactPicker';
import { NoticeList, NoticeDetail } from '../../components/messaging/NoticePane';

export function Messages() {
 const { user: me } = useSession();
 const [searchParams, setSearchParams] = useSearchParams();
 const tabParam = (searchParams.get('tab') as Tab) || 'Chats';
 const [tab, setTab] = useState<Tab>(TABS.includes(tabParam) ? tabParam : 'Chats');

 const threads = useApi('conversations', listConversations);
 const contacts = useApi('contacts', listContacts);
 const inbox = useApi('notifications', listNotifications);

 const threadParam = searchParams.get('thread');
 const [selectedId, setSelectedId] = useState<string | null>(threadParam);
 const [draft, setDraft] = useState('');
 const [chatError, setChatError] = useState<string | null>(null);
 const [sending, setSending] = useState(false);
 const [showPicker, setShowPicker] = useState(false);
 const [threadSearch, setThreadSearch] = useState('');
 const [threadFilter, setThreadFilter] = useState<'all' | 'unread'>('all');
 const [noticeSearch, setNoticeSearch] = useState('');
 const [noticeError, setNoticeError] = useState<string | null>(null);
 const [markingAll, setMarkingAll] = useState(false);
 const selectedNoticeId = searchParams.get('notice');
 const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');

 const messagesApi = useApi(`thread-${selectedId ?? 'none'}`, () => listThreadMessages(selectedId ?? ''), selectedId !== null);
 // Local optimistic state so sending doesn't flash LoadingBlock on either pane
 const [localThreads, setLocalThreads] = useState<typeof threads.data>(null);
 const [localMessages, setLocalMessages] = useState<typeof messagesApi.data>(null);
 useEffect(() => { if (threads.data) setLocalThreads(threads.data); }, [threads.data]);
 useEffect(() => { setLocalMessages(null); }, [selectedId]);
 useEffect(() => { if (messagesApi.data) setLocalMessages(messagesApi.data); }, [messagesApi.data]);

 useEffect(() => {
 const v = searchParams.get('tab') as Tab;
 if (v && TABS.includes(v) && v !== tab) setTab(v);
 const t = searchParams.get('thread');
 if (t !== selectedId) setSelectedId(t);
 }, [searchParams, tab, selectedId]);

 function switchTab(next: Tab) {
 setTab(next);
 const p = new URLSearchParams(searchParams);
 p.set('tab', next);
 setSearchParams(p);
 }

 function pickThread(id: string) {
 setSelectedId(id);
 setChatError(null);
 setMobileView('thread');
 const p = new URLSearchParams(searchParams);
 p.set('thread', id);
 p.set('tab', 'Chats');
 setSearchParams(p);
 // Optimistically clear unread badge without full refetch flash
 setLocalThreads((prev) => (prev ? prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)) : prev));
 markConversationRead(id).catch(() => {});
 }

 useEffect(() => {
 if (tab !== 'Chats') return;
 const timer = setInterval(() => { threads.refetch(); if (selectedId) messagesApi.refetch(); }, 15000);
 return () => clearInterval(timer);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [tab, selectedId]);

 async function handleSend() {
 const body = draft.trim();
 if (!selectedId || !body) return;
 setSending(true); setChatError(null);
 try {
 const msg = await sendChatMessage(selectedId, body);
 setDraft('');
 // Optimistic append — no LoadingBlock flash
 setLocalMessages((prev) => (prev ? [...prev, msg] : [msg]));
 // Patch thread list: move to top, update last message + updatedAt, clear unread
 setLocalThreads((prev) => {
 if (!prev) return prev;
 const idx = prev.findIndex((t) => t.id === selectedId);
 if (idx === -1) return prev;
 const updated = { ...prev[idx], messages: [msg], updatedAt: msg.createdAt, unreadCount: 0 };
 return [updated, ...prev.filter((t) => t.id !== selectedId)];
 });
 } catch (err) { setChatError(apiErrorMessage(err, 'Could not send.')); } finally { setSending(false); }
 }

 async function startChat(contactId: string) {
 setChatError(null);
 try {
 const source = localThreads ?? threads.data ?? [];
 // Dedupe participants before checking existing 1-1 threads
 const existing = source.find((th) => {
 if (th.title) return false;
 const ids = [...new Set(th.participants.map((m) => m.user.id))];
 return ids.length === 2 && ids.includes(contactId) && me?.id && ids.includes(me.id);
 });
 if (existing) pickThread(existing.id);
 else {
 const created = await createConversation({ participantIds: [contactId] });
 // Optimistically insert new thread so side list updates without flash
 setLocalThreads((prev) => (prev ? [created as never, ...prev] : [created as never]));
 pickThread(created.id);
 // Background sync
 threads.refetch();
 }
 setShowPicker(false);
 } catch (err) { setChatError(apiErrorMessage(err, 'Could not start chat.')); }
 }

 async function openNotice(id: string) {
 const p = new URLSearchParams(searchParams);
 p.set('notice', id); p.set('tab', 'Notices');
 setSearchParams(p);
 try { await markNotificationRead(id); inbox.refetch(); } catch (err) { setNoticeError(apiErrorMessage(err, 'Could not mark read.')); }
 }

 async function handleMarkAll() {
 setMarkingAll(true); setNoticeError(null);
 try { await markAllNotificationsRead(); inbox.refetch(); } catch (err) { setNoticeError(apiErrorMessage(err, 'Could not mark all.')); } finally { setMarkingAll(false); }
 }

 const threadList = localThreads ?? threads.data ?? [];
 const selectedThread = threadList.find((t) => t.id === selectedId) ?? null;
 const notices = inbox.data ?? [];
 const selectedNotice = selectedNoticeId ? notices.find((n) => n.id === selectedNoticeId) ?? null : notices[0] ?? null;
 const threadMessages = localMessages ?? messagesApi.data ?? [];

 return (
 <div className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div role="tablist" aria-label="Messages" className="tabs tabs-boxed w-fit bg-base-100 p-1">
 {TABS.map((name) => (
 <button key={name} role="tab" aria-selected={tab === name} onClick={() => switchTab(name as Tab)} className={`tab ${tab === name ? 'tab-active bg-brand text-white' : ''}`}>{name}</button>
 ))}
 </div>
 <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium">{tab === 'Chats' ? `${threadList.filter((t) => t.unreadCount > 0).length} unread · ${threadList.length} chats` : `${notices.filter((n) => !n.readAt).length} unread · ${notices.length} notices`}</span>
 </div>

 {tab === 'Chats' ? (
 <div className="grid gap-4 lg:grid-cols-12">
 <Panel className={`lg:col-span-4 xl:col-span-4 ${mobileView === 'thread' ? 'hidden lg:block' : ''}`} padded={false}>
 <div className="p-4">
 <ThreadList threads={threadList} loading={threads.loading} error={threads.error} onRetry={threads.refetch} selectedId={selectedId} onPick={pickThread} myId={me?.id} search={threadSearch} onSearch={setThreadSearch} filter={threadFilter} onFilter={setThreadFilter} onNew={() => setShowPicker(true)} />
 </div>
 </Panel>
 <Panel className={`overflow-hidden p-0 lg:col-span-8 xl:col-span-8 ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>
 <ThreadView thread={selectedThread} messages={threadMessages} loading={messagesApi.loading && !localMessages} error={messagesApi.error} onRetry={messagesApi.refetch} myId={me?.id} draft={draft} onDraft={setDraft} onSend={() => void handleSend()} sending={sending} chatError={chatError} onBack={() => setMobileView('list')} />
 </Panel>
 </div>
 ) : (
 <div className="grid gap-4 lg:grid-cols-12">
 <Panel className={`lg:col-span-4 xl:col-span-4 ${selectedNoticeId && mobileView === 'thread' ? 'hidden lg:block' : ''}`} padded={false}>
 <div className="p-4">
 <NoticeList notices={notices} loading={inbox.loading} error={inbox.error} onRetry={inbox.refetch} selectedId={selectedNotice?.id ?? null} onPick={openNotice} search={noticeSearch} onSearch={setNoticeSearch} onMarkAll={() => void handleMarkAll()} markingAll={markingAll} noticeError={noticeError} />
 </div>
 </Panel>
 <Panel className={`overflow-hidden p-0 lg:col-span-8 xl:col-span-8 ${!selectedNoticeId && mobileView === 'list' ? 'hidden lg:block' : ''}`}>
 <NoticeDetail notice={selectedNotice as never} />
 </Panel>
 </div>
 )}

 <ContactPicker open={showPicker} onClose={() => setShowPicker(false)} contacts={contacts.data ?? []} loading={contacts.loading} error={contacts.error} onPick={(id) => void startChat(id)} />
 </div>
 );
}
