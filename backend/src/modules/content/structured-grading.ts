export function gradeStructured(response: unknown, items: unknown[]) {
  const record = response && typeof response === 'object' && !Array.isArray(response) ? response as Record<string, unknown> : {};
  const keys = items.map(item => item as { id: string; answer?: string });
  if (!keys.length || keys.some(item => typeof item.answer !== 'string')) return { isCorrect: null, score: null, auto: false };
  const correct = keys.filter(item => typeof record[item.id] === 'string' &&
    (record[item.id] as string).trim().toLocaleLowerCase('de') === item.answer?.trim().toLocaleLowerCase('de')).length;
  return { isCorrect: correct === keys.length, score: correct / keys.length, auto: true };
}
