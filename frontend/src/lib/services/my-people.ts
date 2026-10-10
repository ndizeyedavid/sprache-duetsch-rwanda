export type MyPeople = {
  groups: { id: string; code: string; name: string; shift: string; capacity: number; room: string | null; isActive: boolean; level: { id: string; code: string; title: string; levelLabel: string }; intake: { id: string; code: string; name: string }; campus: { id: string; code: string; name: string }; teacher: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null } | null; _count: { enrollments: number } }[];
  classmates: { userId: string; studentId: string; studentCode: string; firstName: string; lastName: string; email: string; avatarUrl: string | null; status: string; shift: string; currentLevel: { code: string; title: string } | null; groups: { id: string; name: string }[] }[];
  teachers: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null; groups: { id: string; name: string }[] }[];
};
