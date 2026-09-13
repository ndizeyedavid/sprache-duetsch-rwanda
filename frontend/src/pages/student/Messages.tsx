import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { fetchMe } from '../../lib/auth-store';
import {
  createConversation,
  humanize,
  isoDate,
  listContacts,
  listConversations,
  listNotifications,
  listThreadMessages,
  markAllNotificationsRead,
  markConversationRead,
  markNotificationRead,
  sendChatMessage,
} from '../../lib/services';
import type { Conversation } from '../../lib/services';

const TABS = ['Chats', 'Notices'] as const;

function threadTitle(thread: Conversation, myId: string | null): string {
  if (thread.title) return thread.title;
  const others = thread.participants.filter((member) => member.user.id !== myId);
  if (others.length === 0) return 'Just me';
  return others
    .slice(0, 2)
    .map((member) => `${member.user.firstName} ${member.user.lastName}`)
    .join(', ');
}

export function Messages() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Chats');
  const me = useApi('auth-me', fetchMe);

  // ---- Chats ----
  const threads = useApi('conversations', listConversations);
  const contacts = useApi('contacts', listContacts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const messages = useApi(`thread-${selectedId ?? 'none'}`, () =>
    listThreadMessages(selectedId ?? ''),
  );

  // Light polling so new messages arrive without a reload.
  useEffect(() => {
    if (tab !== 'Chats') return;
    const timer = setInterval(() => {
      threads.refetch();
      if (selectedId) messages.refetch();
    }, 15000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedId]);

  async function pickThread(id: string) {
    setSelectedId(id);
    setChatError(null);
    try {
      await markConversationRead(id);
      threads.refetch();
    } catch {
      // Reading still works; the badge just refreshes later.
    }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!selectedId || !body) return;
    setSending(true);
    setChatError(null);
    try {
      await sendChatMessage(selectedId, body);
      setDraft('');
      messages.refetch();
      threads.refetch();
    } catch (err) {
      setChatError(apiErrorMessage(err, 'Could not send the message.'));
    } finally {
      setSending(false);
    }
  }

  async function startChat(contactId: string) {
    setChatError(null);
    try {
      const existing = (threads.data ?? []).find(
        (thread) =>
          !thread.title &&
          thread.participants.length === 2 &&
          thread.participants.some((member) => member.user.id === contactId),
      );
      if (existing) {
        setSelectedId(existing.id);
      } else {
        const created = await createConversation({ participantIds: [contactId] });
        threads.refetch();
        setSelectedId(created.id);
      }
      setShowNewChat(false);
    } catch (err) {
      setChatError(apiErrorMessage(err, 'Could not start the conversation.'));
    }
  }

  // ---- Notices ----
  const inbox = useApi('notifications', listNotifications);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

  async function openNotice(id: string) {
    setSelectedNoticeId(id);
    try {
      await markNotificationRead(id);
      inbox.refetch();
    } catch (err) {
      setNoticeError(apiErrorMessage(err, 'Could not mark the notice as read.'));
    }
  }

  const threadList = threads.data ?? [];
  const threadMessages = messages.data ?? [];
  const selectedThread = threadList.find((thread) => thread.id === selectedId) ?? null;
  const notices = inbox.data ?? [];
  const selectedNotice = notices.find((item) => item.id === selectedNoticeId) ?? notices[0] ?? null;

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Messages" className="tabs tabs-boxed w-fit bg-base-100 p-1">
        {TABS.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`tab ${tab === name ? 'tab-active' : ''}`}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === 'Chats' ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel className="lg:col-span-1">
            <SectionHeader title="Conversations" />
            <button
              type="button"
              onClick={() => setShowNewChat((value) => !value)}
              className="btn btn-sm mb-3 w-full rounded-full border-brand bg-transparent text-brand hover:border-brand hover:bg-brand hover:text-white"
            >
              New chat
            </button>
            {showNewChat ? (
              <div className="mb-3 rounded-field bg-base-200 p-2">
                {contacts.loading ? (
                  <p className="p-2 text-xs text-muted">Loading contacts…</p>
                ) : contacts.error || !contacts.data ? (
                  <p className="p-2 text-xs text-error">{contacts.error ?? 'Could not load contacts.'}</p>
                ) : contacts.data.length === 0 ? (
                  <p className="p-2 text-xs text-muted">No contacts yet — classmates and teachers appear here.</p>
                ) : (
                  <ul className="max-h-48 space-y-1 overflow-y-auto">
                    {contacts.data.map((contact) => (
                      <li key={contact.id}>
                        <button
                          type="button"
                          onClick={() => startChat(contact.id)}
                          className="w-full rounded-field px-3 py-2 text-left text-xs hover:bg-brand-tint"
                        >
                          <span className="block font-semibold">
                            {contact.firstName} {contact.lastName}
                          </span>
                          <span className="block text-muted">{humanize(contact.role)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            {threads.loading ? (
              <LoadingBlock label="Loading conversations…" />
            ) : threads.error ? (
              <ErrorBlock message={threads.error} onRetry={threads.refetch} />
            ) : threadList.length === 0 ? (
              <EmptyBlock title="No conversations" hint="Start a chat with a classmate or teacher." />
            ) : (
              <ul className="space-y-2">
                {threadList.map((thread) => {
                  const last = thread.messages[0];
                  return (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => pickThread(thread.id)}
                        className={`w-full rounded-field p-3 text-left transition-colors ${
                          selectedId === thread.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold">
                            {threadTitle(thread, me.data?.id ?? null)}
                          </span>
                          {thread.unreadCount > 0 ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                              {thread.unreadCount}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-muted">
                          {last ? `${last.sender.firstName}: ${last.body}` : 'No messages yet'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel className="lg:col-span-2">
            {chatError ? (
              <p role="alert" className="mb-3 text-xs font-medium text-error">
                {chatError}
              </p>
            ) : null}
            {!selectedId ? (
              <EmptyBlock title="Select a conversation" hint="Choose a thread on the left to read and reply." />
            ) : messages.loading ? (
              <LoadingBlock label="Loading messages…" />
            ) : messages.error ? (
              <ErrorBlock message={messages.error} onRetry={messages.refetch} />
            ) : (
              <div>
                <h1 className="text-base font-semibold">
                  {selectedThread ? threadTitle(selectedThread, me.data?.id ?? null) : 'Conversation'}
                </h1>
                <ul className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                  {threadMessages.length === 0 ? (
                    <li className="text-xs text-muted">Say hello to start the conversation.</li>
                  ) : (
                    threadMessages.map((message) => {
                      const mine = message.senderId === me.data?.id;
                      return (
                        <li key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-box px-4 py-2 text-sm ${
                              mine ? 'bg-brand text-white' : 'bg-base-200 text-ink'
                            }`}
                          >
                            {!mine ? (
                              <p className="mb-0.5 text-[11px] font-semibold opacity-70">
                                {message.sender.firstName} {message.sender.lastName}
                              </p>
                            ) : null}
                            <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                            <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-muted'}`}>
                              {isoDate(message.createdAt)}
                            </p>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
                <form onSubmit={handleSend} className="mt-4 flex gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message…"
                    aria-label="Write a message"
                    className="input w-full rounded-full border-line bg-base-200"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="btn rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
                  >
                    {sending ? <span className="loading loading-spinner loading-sm" /> : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </Panel>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel className="lg:col-span-1">
            <SectionHeader title="Notices" />
            {inbox.loading ? (
              <LoadingBlock label="Loading notices…" />
            ) : inbox.error ? (
              <ErrorBlock message={inbox.error} onRetry={inbox.refetch} />
            ) : notices.length === 0 ? (
              <EmptyBlock title="No notices" hint="Announcements from teachers and admins appear here." />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    markAllNotificationsRead()
                      .then(() => inbox.refetch())
                      .catch((err: unknown) =>
                        setNoticeError(apiErrorMessage(err, 'Could not mark all as read.')),
                      )
                  }
                  className="btn btn-sm mb-3 w-full rounded-full border-line bg-base-200"
                >
                  Mark all as read
                </button>
                <ul className="space-y-2">
                  {notices.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => openNotice(item.id)}
                        className={`w-full rounded-field p-3 text-left transition-colors ${
                          selectedNotice?.id === item.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold">{item.title}</span>
                          {!item.readAt ? (
                            <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-brand" />
                          ) : null}
                        </span>
                        <span className="mt-1 block text-[11px] text-muted">
                          {humanize(item.type)} · {isoDate(item.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
          <Panel className="lg:col-span-2">
            {noticeError ? (
              <p role="alert" className="mb-3 text-xs font-medium text-error">
                {noticeError}
              </p>
            ) : null}
            {!selectedNotice ? (
              <EmptyBlock title="Select a notice" hint="Choose a notice on the left to read it here." />
            ) : (
              <article>
                <StatusBadge status={selectedNotice.readAt ? 'Read' : 'Unread'} />
                <h1 className="mt-2 text-lg font-semibold">{selectedNotice.title}</h1>
                <p className="mt-1 text-[11px] text-muted">
                  {humanize(selectedNotice.type)} · {isoDate(selectedNotice.createdAt)}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedNotice.body ?? 'No content.'}
                </p>
              </article>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
