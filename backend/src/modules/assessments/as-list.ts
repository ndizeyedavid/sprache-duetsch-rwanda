import { canon } from './canon.js';
export const asList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(canon);
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(
      ([key, val]) => `${key.trim().toLowerCase()}:${canon(val)}`,
    );
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [canon(value)];
};
