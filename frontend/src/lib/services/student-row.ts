export type StudentRow = {
  id: string;
  studentCode: string;
  status: string;
  finance?: { currency: string } | null;
  shift: string;
  user: { firstName: string; lastName: string; email: string; status: string };
  campus: { name: string } | null;
  currentLevel: { code: string; title: string } | null;
};
