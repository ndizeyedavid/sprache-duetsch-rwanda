export const releasedFilter = (now: Date) => ({
  isPublished: true,
  OR: [{ releaseAt: null }, { releaseAt: { lte: now } }],
});
