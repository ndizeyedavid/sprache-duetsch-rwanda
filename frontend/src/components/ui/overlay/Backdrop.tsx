/** Soft, warm, slightly blurred scrim behind dialogs and drawers; click to close unless busy. */
export function Backdrop({ closing, busy, onClose }: { closing: boolean; busy: boolean; onClose: () => void }) {
  return (
    <button type="button" tabIndex={-1} aria-label="Close" onClick={() => { if (!busy) onClose(); }}
      className={`overlay-backdrop absolute inset-0 cursor-default bg-[#1d1511]/40 backdrop-blur-[3px] ${closing ? 'overlay-out' : 'overlay-in'}`} />
  );
}
