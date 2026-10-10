export const studentSummarySelect = {
  id: true,
  studentCode: true,
  user: { select: { firstName: true, lastName: true, email: true } },
} as const;
