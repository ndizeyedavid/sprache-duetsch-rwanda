/** A pending older write can change the server even if the UI returns to its saved value. */
export function needsPreferenceSave(current: string, saved: string, queued: string) {
  return current !== saved || current !== queued;
}
