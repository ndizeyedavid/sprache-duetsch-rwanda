export function rangeForPreset(
  preset: string,
  from: string,
  to: string,
): { from: Date | null; to: Date | null } {
  const now = new Date();
  if (preset === "7")
    return { from: new Date(now.getTime() - 7 * 864e5), to: now };
  if (preset === "30")
    return { from: new Date(now.getTime() - 30 * 864e5), to: now };
  if (preset === "90")
    return { from: new Date(now.getTime() - 90 * 864e5), to: now };
  if (preset === "custom")
    return {
      from: from ? new Date(from) : null,
      to: to ? new Date(`${to}T23:59:59`) : null,
    };
  return { from: null, to: null };
}
