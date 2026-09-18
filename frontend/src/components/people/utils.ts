export function initials(a: string, b: string): string {
  return `${a.charAt(0)}${b.charAt(0)}`.toUpperCase();
}

export function matches(hay: string, needle: string): boolean {
  return hay.toLowerCase().includes(needle.toLowerCase());
}
