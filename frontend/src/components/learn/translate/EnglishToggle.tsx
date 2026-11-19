import { setShowEnglish,useShowEnglish } from './english';

/** "Show English" switch for the lesson (remembered per level on this device). */
export function EnglishToggle({ level }: { level: string }) {
  const on = useShowEnglish(level);
  return <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
    <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={on} onChange={(event) => setShowEnglish(level, event.target.checked)} />
    Show English
  </label>;
}
