import { useApi } from "../../hooks/useApi";
import { getInheritedThreshold } from "../../lib/class-threshold";

type Props = { levelId: string; value: string; onChange: (value: string) => void };

/** Optional per-class low-attendance threshold; blank inherits the level, then the system default. */
export function ClassThresholdField({ levelId, value, onChange }: Props) {
  const inherited = useApi(`class-threshold-${levelId}`, () => getInheritedThreshold(levelId), Boolean(levelId));
  const source = inherited.data?.inheritedSource === "LEVEL" ? "level setting" : "system default";
  const hint = !levelId
    ? "Choose a level to see the inherited threshold."
    : inherited.data
      ? `Leave blank to use ${inherited.data.inherited}% (${source}).${value !== "" ? ` This class overrides it with ${value}%.` : ""}`
      : inherited.error ? "Could not load the inherited threshold." : "Loading inherited threshold…";
  return (
    <label className="block sm:col-span-2">
      <span className="mb-1.5 block text-xs font-medium">Low-attendance alert threshold (%)</span>
      <input
        type="number"
        min={0}
        max={100}
        step={1}
        inputMode="numeric"
        className="input w-full sm:w-40"
        placeholder={inherited.data ? String(inherited.data.inherited) : "Inherit"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="mt-1 block text-xs text-muted">
        {hint} Students below it, their teacher and academic admins are alerted.
      </span>
    </label>
  );
}
