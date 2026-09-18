import { FiSend } from "react-icons/fi";

type Props = {
  draft: string;
  onDraft: (v: string) => void;
  onSend: () => void;
  sending: boolean;
};

export function MessageComposer({ draft, onDraft, onSend, sending }: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex items-end gap-2 border-t border-line bg-base-100 p-3">
      <textarea
        value={draft}
        onChange={(e) => onDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
        rows={1}
        className="textarea max-h-24 min-h-10 flex-1 resize-none rounded-box border-line bg-base-200 text-sm leading-relaxed"
      />
      <button type="submit" disabled={sending || !draft.trim()} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
        {sending ? <span className="loading loading-spinner loading-xs" /> : <FiSend aria-hidden />}Send
      </button>
    </form>
  );
}
