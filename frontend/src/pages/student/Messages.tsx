import { useState } from 'react';
import { FiLink2, FiMoreHorizontal, FiPhone, FiVideo } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { TabNav } from '../../components/ui/TabNav';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { MessageComposer } from '../../components/ui/MessageComposer';
import { FileRow } from '../../components/ui/FileRow';
import {
  chatMessages,
  chatThreads,
  contacts,
  currentUser,
  sharedFiles,
  sharedLinks,
} from '../../data/mock';

const CHAT_TABS = ['Private', 'Group'];

export function Messages() {
  const [tab, setTab] = useState(CHAT_TABS[0]);
  const [activeId, setActiveId] = useState(chatThreads[0].id);
  const active = chatThreads.find((thread) => thread.id === activeId) ?? chatThreads[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,16rem)]">
      <div className="space-y-5">
        <Panel className="flex items-center gap-3">
          <img src={currentUser.photo} alt={currentUser.name} className="size-14 rounded-2xl object-cover" />
          <span>
            <span className="block text-sm font-semibold">{currentUser.name}</span>
            <span className="block text-[11px] text-muted">{currentUser.role}</span>
          </span>
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Contacts</h2>
            <button type="button" className="text-[11px] font-medium text-brand hover:underline">
              View All
            </button>
          </div>
          <ul className="flex gap-2 overflow-x-auto scrollbar-none">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <button type="button" aria-label={`Message ${contact.name}`}>
                  <img
                    src={contact.photo}
                    alt={contact.name}
                    loading="lazy"
                    className="size-10 rounded-full object-cover ring-2 ring-transparent transition-all hover:ring-brand"
                  />
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="mb-3 text-sm font-semibold">Chats</h2>
          <TabNav tabs={CHAT_TABS} active={tab} onChange={setTab} className="mb-3" />
          <ul className="max-h-[26rem] space-y-1 overflow-y-auto scrollbar-thin">
            {chatThreads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(thread.id)}
                  aria-current={thread.id === activeId}
                  className={`flex w-full items-center gap-3 rounded-field p-2 text-left transition-colors ${
                    thread.id === activeId ? 'bg-base-200' : 'hover:bg-base-200'
                  }`}
                >
                  <img
                    src={thread.photo}
                    alt={thread.name}
                    loading="lazy"
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                  <span className="min-w-0 grow">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold">{thread.name}</span>
                      <span className="shrink-0 text-[10px] text-muted">{thread.time}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] text-muted">{thread.preview}</span>
                      {thread.unread ? (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand text-[9px] font-semibold text-white">
                          {thread.unread}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel padded={false} className="flex min-h-[34rem] flex-col">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <img src={active.photo} alt={active.name} className="size-10 rounded-full object-cover" />
          <span>
            <span className="block text-sm font-semibold">{active.name}</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              Online
            </span>
          </span>
          <span className="ml-auto flex items-center gap-1">
            <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Start voice call">
              <FiPhone aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Start video call">
              <FiVideo aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost btn-sm btn-circle text-muted" aria-label="Conversation options">
              <FiMoreHorizontal aria-hidden />
            </button>
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-4">
          {chatMessages.map((message) => (
            <ChatBubble key={message.id} body={message.body} time={message.time} from={message.from} />
          ))}
        </div>

        <div className="border-t border-line p-4">
          <MessageComposer placeholder="Write your message..." />
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Shared Files</h2>
            <button type="button" className="text-[11px] font-medium text-brand hover:underline">
              View All
            </button>
          </div>
          <ul className="space-y-4">
            {sharedFiles.map((file) => (
              <li key={file.id}>
                <FileRow name={file.name} size={file.size} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Shared Links</h2>
            <button type="button" className="text-[11px] font-medium text-brand hover:underline">
              View All
            </button>
          </div>
          <ul className="space-y-4">
            {sharedLinks.map((link) => (
              <li key={link.id} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-base-200 text-muted">
                  <FiLink2 aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">{link.name}</span>
                  <span className="block text-[11px] text-muted">{link.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
