import { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

/** A labelled value with a one-tap copy button. */
export function CopyValue({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { /* Clipboard can be blocked; the value stays visible to select by hand. */ }
  }
  return (
    <div className="flex items-center gap-2 rounded-field bg-base-200/70 py-1.5 pl-3 pr-1.5">
      <span className="w-16 shrink-0 text-xs text-muted">{label}</span>
      <span className={`min-w-0 flex-1 truncate text-sm ${mono ? 'font-mono' : ''}`} title={value}>{value}</span>
      <button type="button" onClick={() => void copy()} aria-label={`Copy ${label.toLowerCase()}`} className="btn btn-ghost btn-xs btn-square">
        {copied ? <FiCheck aria-hidden className="text-success" /> : <FiCopy aria-hidden />}
      </button>
    </div>
  );
}
