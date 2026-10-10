export function isBookPractice(activity: { config?: unknown }) {
  return (activity.config as { practiceMode?: boolean } | null)?.practiceMode === true;
}
