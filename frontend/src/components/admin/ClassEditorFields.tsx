import type { CampusItem,IntakeItem,LevelItem } from "../../lib/services";
import { humanize } from "../../lib/services";
import type { TeachingTeacher } from "../../lib/teaching";
import type { ClassDraft } from "./class-draft";

type Props = {
  draft: ClassDraft;
  onChange: (patch: Partial<ClassDraft>) => void;
  levels: LevelItem[];
  intakes: IntakeItem[];
  campuses: CampusItem[];
  teachers: TeachingTeacher[];
};
export function ClassEditorFields({
  draft,
  onChange,
  levels,
  intakes,
  campuses,
  teachers,
}: Props) {
  const references = [
    {
      key: "levelId" as const,
      label: "Level",
      options: levels.map((l) => ({
        id: l.id,
        name: `${l.code} · ${l.title}`,
      })),
    },
    { key: "intakeId" as const, label: "Intake", options: intakes },
    { key: "campusId" as const, label: "Campus", options: campuses },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["code", "name"] as const).map((key) => (
        <label key={key} className="block">
          <span className="mb-1.5 block text-xs font-medium">
            {key === "code" ? "Code" : "Class name"}
          </span>
          <input
            required
            minLength={key === "name" ? 2 : 1}
            maxLength={key === "code" ? 30 : 160}
            className="input w-full"
            value={draft[key]}
            onChange={(e) => onChange({ [key]: e.target.value })}
          />
        </label>
      ))}
      {references.map((field) => (
        <label key={field.key} className="block">
          <span className="mb-1.5 block text-xs font-medium">
            {field.label}
          </span>
          <select
            required
            className="select w-full"
            value={draft[field.key]}
            onChange={(e) =>
              onChange({
                [field.key]: e.target.value,
                ...(field.key === "levelId" ? { teacherId: "" } : {}),
              })
            }
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Teacher</span>
        <select
          className="select w-full"
          value={draft.teacherId}
          onChange={(e) => onChange({ teacherId: e.target.value })}
        >
          <option value="">Assign later</option>
          {teachers
            .filter(
              (t) =>
                t.status === "ACTIVE" &&
                t.teachingLevels.some((l) => l.levelId === draft.levelId),
            )
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Shift</span>
        <select
          className="select w-full"
          value={draft.shift}
          onChange={(e) => onChange({ shift: e.target.value })}
        >
          {["MORNING", "AFTERNOON", "EVENING", "WEEKEND"].map((shift) => (
            <option key={shift} value={shift}>
              {humanize(shift)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Capacity</span>
        <input
          required
          type="number"
          min={1}
          step={1}
          className="input w-full"
          value={draft.capacity}
          onChange={(e) => onChange({ capacity: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Room</span>
        <input
          maxLength={60}
          className="input w-full"
          value={draft.room}
          onChange={(e) => onChange({ room: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Status</span>
        <select
          className="select w-full"
          value={String(draft.isActive)}
          onChange={(e) => onChange({ isActive: e.target.value === "true" })}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </label>
    </div>
  );
}
