export const certificateInclude = {
  student: {
    select: {
      id: true,
      studentCode: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  },
  level: { select: { id: true, code: true, title: true } },
} as const;
