export type DailyWord = { de: string; en: string; example: string };

/** Everyday A1 words; one is shown per calendar day on the student dashboard. */
export const DAILY_WORDS: DailyWord[] = [
  { de: 'die Freundschaft', en: 'friendship', example: 'Unsere Freundschaft ist mir wichtig.' },
  { de: 'lernen', en: 'to learn', example: 'Ich lerne jeden Tag Deutsch.' },
  { de: 'das Frühstück', en: 'breakfast', example: 'Das Frühstück ist um sieben Uhr.' },
  { de: 'der Bahnhof', en: 'train station', example: 'Wo ist der Bahnhof, bitte?' },
  { de: 'pünktlich', en: 'on time', example: 'Der Kurs beginnt pünktlich.' },
  { de: 'die Familie', en: 'family', example: 'Meine Familie wohnt in Kigali.' },
  { de: 'einkaufen', en: 'to go shopping', example: 'Am Samstag kaufe ich auf dem Markt ein.' },
  { de: 'das Wetter', en: 'the weather', example: 'Wie ist das Wetter heute?' },
  { de: 'die Arbeit', en: 'work', example: 'Nach der Arbeit gehe ich spazieren.' },
  { de: 'gesund', en: 'healthy', example: 'Obst ist gesund.' },
  { de: 'die Wohnung', en: 'flat, apartment', example: 'Die Wohnung hat drei Zimmer.' },
  { de: 'fragen', en: 'to ask', example: 'Darf ich etwas fragen?' },
  { de: 'der Termin', en: 'appointment', example: 'Ich habe morgen einen Termin beim Arzt.' },
  { de: 'die Hausaufgabe', en: 'homework', example: 'Die Hausaufgabe ist nicht schwer.' },
  { de: 'schnell', en: 'fast', example: 'Der Zug fährt sehr schnell.' },
  { de: 'das Wochenende', en: 'weekend', example: 'Was machst du am Wochenende?' },
  { de: 'verstehen', en: 'to understand', example: 'Ich verstehe die Frage nicht.' },
  { de: 'die Sprache', en: 'language', example: 'Deutsch ist eine schöne Sprache.' },
  { de: 'günstig', en: 'cheap, good value', example: 'Das Brot ist hier günstig.' },
  { de: 'die Reise', en: 'trip, journey', example: 'Die Reise nach Berlin war toll.' },
  { de: 'wichtig', en: 'important', example: 'Übung ist sehr wichtig.' },
];

/** Same word all day for everyone, changing at local midnight. */
export function wordOfTheDay(date = new Date()): DailyWord {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return DAILY_WORDS[day % DAILY_WORDS.length];
}
