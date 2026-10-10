export const canon = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return "";
};
