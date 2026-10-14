import { useEffect,useRef } from 'react';
import { FiSend } from 'react-icons/fi';
type Props = { draft: string; onDraft: (v: string) => void; onSend: () => void; sending: boolean };
export function MessageComposer({ draft, onDraft, onSend, sending }: Props) {
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{if(input.current){input.current.style.height='auto';input.current.style.height=`${Math.min(input.current.scrollHeight,140)}px`;}},[draft]);
  return <form onSubmit={e=>{e.preventDefault();if(!sending&&draft.trim())onSend();}} className="shrink-0 border-t border-base-300 bg-base-100 p-4"><div className="flex items-end gap-3 rounded-2xl border border-base-300 bg-base-200 p-2"><textarea ref={input} aria-label="Message" value={draft} disabled={sending} onChange={e=>onDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&window.matchMedia('(pointer: fine)').matches){e.preventDefault();if(!sending&&draft.trim())onSend();}}} maxLength={4000} placeholder="Write your message…" rows={1} className="textarea textarea-ghost min-h-10 min-w-0 flex-1 resize-none text-sm focus:outline-none" /><button type="submit" aria-label="Send message" disabled={sending||!draft.trim()} className="btn btn-neutral btn-square shrink-0 rounded-xl">{sending?<span className="loading loading-spinner loading-xs" />:<FiSend aria-hidden size={18}/>}</button></div><p className="mt-2 hidden text-[10px] text-muted sm:block">Enter to send · Shift + Enter for a new line</p></form>;
}
