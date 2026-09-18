import { useEffect, useMemo, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../common/PageState";
import { threadTitle, initials, accentFor, dedupeParticipants } from "./utils";
import type { ChatMessage, Conversation } from "../../lib/services";
import { ChatBubble } from "../ui/ChatBubble";
import { isoDate } from "../../lib/services";
import { MessageComposer } from "./MessageComposer";
import { format, isToday, isYesterday, parseISO } from "date-fns";

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

function dayLabel(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "EEE, d MMM yyyy");
  } catch { return ""; }
}

export function MessageView({ thread, messages, loading, error, onRetry, myId, draft, onDraft, onSend, sending, chatError, onBack }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages]);

  const grouped = useMemo(() => {
    const out: { label: string; items: ChatMessage[] }[] = [];
    let lastLabel = "";
    for (const m of messages) {
      const label = dayLabel(m.createdAt);
      if (!out.length || label !== lastLabel) { out.push({ label, items: [m] }); lastLabel = label; }
      else out[out.length - 1].items.push(m);
    }
    return out;
  }, [messages]);

  if (!thread) {
    return <div className="flex h-full min-h-[50vh] items-center justify-center p-6"><EmptyBlock title="Select a conversation" hint="Choose a thread on the left to read and reply." /></div>;
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
          {others.slice(0, 3).map((p) => <span key={p.user.id} className={`flex size-8 items-center justify-center rounded-full border-2 border-base-100 text-[11px] font-bold ${accentFor(p.user.firstName)}`}>{initials(p.user.firstName, p.user.lastName)}</span>)}
        </span>
        <span className="min-w-0 grow">
          <span className="block truncate text-sm font-bold leading-tight">{title}</span>
          <span className="block truncate text-xs text-muted">{others.map((p) => `${p.user.firstName} ${p.user.lastName}`).join(" · ") || "Just you"} · {dedupeParticipants(thread.participants).length} members</span>
        </span>
      </div>

      {chatError ? <p role="alert" className="mx-4 mt-3 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{chatError}</p> : null}

      <ul ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-base-200/20 px-4 py-4">
        {grouped.length === 0 ? <li className="py-10 text-center text-xs text-muted">No messages yet — say hello to start the conversation.</li> : grouped.map((g) => (
          <li key={g.label} className="space-y-3">
            <div className="flex justify-center"><span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium text-muted">{g.label}</span></div>
            {g.items.map((m) => { const mine = m.senderId === myId; return <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><ChatBubble body={m.body} time={isoDate(m.createdAt)} from={mine ? "me" : "them"} /></div>; })}
          </li>
        ))}
      </ul>

      <MessageComposer draft={draft} onDraft={onDraft} onSend={onSend} sending={sending} />
    </div>
  );
}
