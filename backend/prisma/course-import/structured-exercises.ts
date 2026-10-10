type Exercise = { key: string; prompt: string; modelAnswer: string | null; options?: string[] | null };
export type ExerciseItem = { id: string; prompt: string; options?: string[]; answer?: string };
export function structureExercise(exercise: Exercise) {
  if (exercise.options) return {};
  const matches = [...exercise.prompt.matchAll(/(?:^|\s)([a-z])\)\s*(.+?)(?=\s+[a-z]\)|$)/g)];
  let instruction = matches.length ? exercise.prompt.slice(0, matches[0].index).trim() : exercise.prompt;
  let items: ExerciseItem[] = matches.map(m => ({ id: m[1], prompt: m[2].trim() }));
  if (!items.length && !/write.*(?:email|letter|message|dialogue|paragraph|self-introduction)/i.test(exercise.prompt)) {
    const splitAt = exercise.prompt.search(/[:?] /);
    if (splitAt >= 0) {
      const content = exercise.prompt.slice(splitAt + 2);
      const separator = content.includes(' · ') ? /\s*·\s*/ : content.includes(' — ') ? /\s*—\s*/ : /,\s+/;
      let parts = content.split(separator);
      if (parts.length < 2) parts = content.split(/(?<=[.!?])\s+(?=[A-Za-zÄÖÜäöü])/);
      if (parts.length > 1) { instruction = exercise.prompt.slice(0, splitAt + 1); items = parts.map((prompt, i) => ({ id: String(i), prompt: prompt.trim() })); }
    }
  }
  const answers = [...(exercise.modelAnswer ?? '').matchAll(/(?:^|\s)([a-z])\)\s*(.+?)(?=\s+[a-z]\)|$)/g)];
  const keyed = new Map(answers.map(m => [m[1], m[2].trim()]));
  const positional = !answers.length ? exercise.modelAnswer?.split(/\s*[,·]\s*|\s+—\s+/) : undefined;
  const options = /long.*short/.test(instruction) ? ['L', 'S'] : /soft.*hard/.test(instruction) ? ['soft', 'hard']
    : /^du or Sie/i.test(instruction) ? ['du', 'Sie'] : /ß or ss/i.test(instruction) ? ['ß', 'ss'] : /(?:give the article|sort into der)/i.test(instruction) ? ['der', 'die', 'das'] : undefined;
  items = items.map((item, i) => ({ ...item, ...(options ? { options } : {}),
    ...(keyed.has(item.id) ? { answer: keyed.get(item.id) } : positional?.length === items.length ? { answer: positional[i] } : {}) }));
  if (/ß or ss/i.test(instruction)) items = items.map(item => ({ ...item, ...(item.answer ? { answer: item.answer.includes('ß') ? 'ß' : 'ss' } : {}) }));
  if (exercise.key === '1.3') {
    instruction = 'Say each spelling aloud, then write the letters separately.';
    items = ['Your first name', 'Your surname', 'Your city', 'Straße'].map((prompt, i) => ({ id: String(i), prompt }));
  }
  if (exercise.key === '1.4') items = items.map((item, i) => ({ ...item, options: ['v', 'f'], answer: ['f','v','f','v','f','f'][i] }));
  if (exercise.key === '1.5') {
    instruction = 'How many letters does each word have?';
    items = ['Größe','Straße','weiß','Fuß'].map((prompt, i) => ({ id: String(i), prompt, answer: String([5,6,4,3][i]) }));
  }
  items = items.map(item => item.answer && (item.answer.split(/\s+/).length > 3 || item.answer.includes('/')) ? { id: item.id, prompt: item.prompt, ...(item.options ? { options: item.options } : {}) } : item);
  return items.length ? { instruction, items } : {};
}
