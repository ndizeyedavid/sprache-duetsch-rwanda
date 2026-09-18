import { FiBookOpen, FiMapPin, FiUsers } from "react-icons/fi";

type Group = {
  id: string;
  code: string;
  name: string;
  shift: string;
  capacity: number;
  room: string | null;
  level: { code: string; title: string };
  campus: { name: string };
  teacher: { firstName: string; lastName: string } | null;
  _count: { enrollments: number };
};

export function GroupsTable({ groups }: { groups: Group[] }) {
  if (groups.length === 0) return <p className="py-8 text-center text-sm text-muted">No groups yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr className="text-xs text-muted">
            <th>Group</th>
            <th>Level</th>
            <th className="hidden sm:table-cell">Campus</th>
            <th>Members</th>
            <th>Teacher</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id} className="hover">
              <td>
                <p className="text-sm font-semibold">{g.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted"><FiBookOpen aria-hidden size={11} />{g.code} · {g.shift}{g.room ? ` · ${g.room}` : ""}</p>
              </td>
              <td><span className="badge badge-sm">{g.level.code}</span> <span className="hidden sm:inline text-xs text-muted">{g.level.title}</span></td>
              <td className="hidden sm:table-cell text-xs"><span className="inline-flex items-center gap-1"><FiMapPin aria-hidden size={11} />{g.campus.name}</span></td>
              <td><span className="inline-flex items-center gap-1 text-xs"><FiUsers aria-hidden size={11} />{g._count.enrollments}/{g.capacity}</span></td>
              <td className="text-xs">{g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
