export const participantSelect = {
  user: { select: { id: true, firstName: true, lastName: true, role: true } },
  lastReadAt: true,
} as const;
