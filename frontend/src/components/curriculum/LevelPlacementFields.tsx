export type LevelPlacementDraft = { placementMinScore: string; attendanceAlertThreshold: string };

type Props = { value: LevelPlacementDraft; onChange: (value: Partial<LevelPlacementDraft>) => void };

/** Placement band and low-attendance alert threshold for one level (both 0–100 %, optional). */
export function LevelPlacementFields({ value, onChange }: Props) {
  return (
    <fieldset className="grid gap-3 rounded-box border border-base-300 p-3 sm:grid-cols-2">
      <legend className="px-1 text-sm font-medium">Placement and attendance</legend>
      <label className="block text-xs">
        Placement test minimum (%)
        <input type="number" min="0" max="100" step="1" inputMode="numeric" value={value.placementMinScore} onChange={(event) => onChange({ placementMinScore: event.target.value })} placeholder="Blank = never recommended" className="input input-sm mt-1 w-full" />
        <span className="mt-1 block text-[11px] text-muted">The test recommends the highest active level whose minimum the score reaches. Leave blank for specialised tracks.</span>
      </label>
      <label className="block text-xs">
        Low-attendance alert below (%)
        <input type="number" min="0" max="100" step="1" inputMode="numeric" value={value.attendanceAlertThreshold} onChange={(event) => onChange({ attendanceAlertThreshold: event.target.value })} placeholder="Blank = school default" className="input input-sm mt-1 w-full" />
        <span className="mt-1 block text-[11px] text-muted">Overrides the default alert threshold for classes at this level.</span>
      </label>
    </fieldset>
  );
}
