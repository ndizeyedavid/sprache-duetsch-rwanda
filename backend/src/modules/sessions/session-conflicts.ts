// Prisma 7 may surface serialization failures during commit as an adapter error,
// while failures during queries use Prisma's P2034 code.
export function isScheduleWriteConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: unknown; cause?: unknown };
  if (['P2034', 'P2025', '40001', '40P01'].includes(String(value.code))) return true;
  if (!value.cause || typeof value.cause !== 'object') return false;
  const cause = value.cause as { kind?: unknown; originalCode?: unknown };
  return cause.kind === 'TransactionWriteConflict' || ['40001', '40P01'].includes(String(cause.originalCode));
}
