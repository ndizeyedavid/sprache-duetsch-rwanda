import { useState } from 'react';
import { FiPaperclip, FiSend } from 'react-icons/fi';

type MessageComposerProps = {
  placeholder?: string;
  onSend?: (value: string) => void;
  className?: string;
};

export function MessageComposer({
  placeholder = 'Type a message...',
  onSend,
  className = '',
}: MessageComposerProps) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setValue('');
  }

  return (
    <form
      className={`flex items-center gap-2 ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-circle text-muted"
        aria-label="Attach file"
      >
        <FiPaperclip aria-hidden />
      </button>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input input-sm grow rounded-full border-0 bg-base-200 text-sm"
      />
      <button
        type="submit"
        className="btn btn-sm gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
      >
        Send
        <FiSend aria-hidden />
      </button>
    </form>
  );
}
