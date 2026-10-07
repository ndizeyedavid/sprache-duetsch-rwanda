export type ClassGroupItem = {
  id: string;
  code: string;
  name: string;
  shift: string;
  levelId: string;
  intakeId: string;
  campusId: string;
  teacherId: string | null;
  isActive: boolean;
  level: { id: string; code: string; title: string; levelLabel: string };
  intake: { id: string; code: string; name: string };
  campus: { id: string; code: string; name: string };
  _count: { enrollments: number };
};
