import { useEffect, useRef } from 'react';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { isoDate } from '../../lib/services';
import { threadTitle, initials, accentFor, dedupeParticipants } from './utils';
import type { ChatMessage, Conversation } from '../../lib/services';
import { ChatBubble } from '../ui/ChatBubble';

type Props = {
 thread: Conversation | null;
 messages: ChatMessage[];
 loading: boolean;
 error: string | null;
 onRetry: () => void;
 myId: string | null | undefined;
 draft: string;
 onDraft: (v: string) => void;
 onSend: () => void;
 sending: boolean;
 chatError: string | null;
 onBack?: () => void;
};

export function ThreadView({ thread, messages, loading, error, onRetry, myId, draft, onDraft, onSend, sending, chatError, onBack }: Props) {
 const listRef = useRef<HTMLUListElement>(null);

 useEffect(() => {
 if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
 }, [messages]);

 if (!thread) {
 return (
 <div className="flex h-full min-h-[50vh] items-center justify-center">
 <EmptyBlock title="Select a conversation" hint="Choose a thread on the left — Canvas opens the chat here." />
 </div>
 );
 }

 if (loading) return <LoadingBlock label="Loading messages…" />;
 if (error) return <ErrorBlock message={error} onRetry={onRetry} />;

 const title = threadTitle(thread, myId);
 const others = dedupeParticipants(thread.participants).filter((p) => p.user.id !== myId);

 return (
 <div className="flex h-full min-h-[60vh] flex-col">
 <div className="flex items-center gap-3 border-b border-line bg-base-100 px-4 py-3">
 {onBack ? <button type="button" onClick={onBack} className="btn btn-ghost btn-xs btn-circle lg:hidden"><FiArrowLeft aria-hidden /></button> : null}
 <span className="flex -space-x-2">
 {others.slice(0, 3).map((p) => (
 <span key={p.user.id} className={`flex size-8 items-center justify-center rounded-full border-2 border-base-100 text-[11px] font-bold ${accentFor(p.user.firstName)}`}>{initials(p.user.firstName, p.user.lastName)}</span>
 ))}
 </span>
 <span className="min-w-0 grow">
 <span className="block truncate text-sm font-bold leading-tight">{title}</span>
 <span className="block truncate text-[11px] text-muted">{others.map((p) => `${p.user.firstName} ${p.user.lastName}`).join(' · ') || 'Just you'}</span>
 </span>
 <span className="hidden rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium sm:block">{dedupeParticipants(thread.participants).length} members</span>
 </div>

 {chatError ? <p role="alert" className="mx-4 mt-3 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{chatError}</p> : null}

 <ul ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-base-200/20 px-4 py-4">
 {messages.length === 0 ? (
 <li className="py-10 text-center text-xs text-muted">No messages yet — say hello to start the conversation.</li>
 ) : (
 messages.map((m) => {
 const mine = m.senderId === myId;
 return <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><ChatBubble body={m.body} time={isoDate(m.createdAt)} from={mine ? 'me' : 'them'} /></li>;
 })
 )}
 </ul>

 <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex items-end gap-2 border-t border-line bg-base-100 p-3">
 <textarea
 value={draft}
 onChange={(e) => onDraft(e.currentTarget.value)}
 onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
 placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
 rows={1}
 className="textarea max-h-24 min-h-10 flex-1 resize-none rounded-box border-line bg-base-200 text-sm leading-relaxed placeholder:text-muted"
 />
 <button type="submit" disabled={sending || !draft.trim()} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {sending ? <span className="loading loading-spinner loading-xs" /> : <FiSend aria-hidden />}Send
 </button>
 </form>
 </div>
 );
}
