export type ClassGroupDetail = {
  id: string;
  code: string;
  name: string;
  levelId: string;
  intakeId: string;
  campusId: string;
  teacherId: string | null;
  shift: string;
  capacity: number;
  room: string | null;
  isActive: boolean;
  level: { id: string; code: string; title: string };
  intake: { id: string; code: string; name: string };
  campus: { id: string; code: string; name: string };
  enrollments: {
    student: {
      id: string;
      studentCode: string;
      status: string;
      user: { id: string; firstName: string; lastName: string; email: string; phone: string | null };
    };
  }[];
};
