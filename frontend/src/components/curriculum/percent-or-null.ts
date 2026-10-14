/** Blank input → null (placement never recommends the level / system default threshold). */
export const percentOrNull = (value: string): number | null => (value.trim() === '' ? null : Number(value));
