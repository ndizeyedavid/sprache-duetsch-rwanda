type Art = { src: string; width: number; height: number; tags: [string?, string?] };

const art = (file: string, width: number, tags: Art['tags']): Art => ({ src: `/heroes/${file}.webp`, width, height: 640, tags });

/**
 * Page illustrations: transparent cut-outs (public/heroes, see prompts.txt) that sit on the hero band.
 * Tags are short German phrases — part of the learning atmosphere, never data.
 */
export const HERO_ART = {
  learners: { src: '/student-hero.webp', width: 1200, height: 1058, tags: ['Hallo! ☀', 'Schritt für Schritt'] },
  courses: art('courses', 699, ['Lesen 📖', 'Wort für Wort']),
  notes: art('notes', 853, ['Notizen ✎', 'Wiederholen!']),
  assignments: art('assignments', 881, ['Hausaufgaben', 'Gut gemacht! ✓']),
  schedule: art('schedule-2', 706, ['Pünktlich ⏰', 'Bis morgen!']),
  attendance: art('attendance', 580, ['Anwesend ✓', 'Alle da?']),
  grades: art('grades', 620, ['Super! ★', 'Weiter so']),
  placement: art('placement', 741, ['Los geht’s!', 'Welches Niveau?']),
  finance: art('finance', 734, ['Bezahlt ✓', 'Quittung bereit']),
  messages: art('messages', 786, ['Hallo! 👋', 'Bis bald']),
  team: art('team', 751, ['Willkommen!', 'Zusammen lernen']),
  reports: art('reports', 765, ['Überblick', 'Fortschritt ↗']),
  certificates: art('certificates', 592, ['Herzlichen Glückwunsch!', 'Zertifikat ★']),
  admissions: art('admissions', 769, ['Willkommen!', 'Anmeldung ✓']),
  live: art('live', 730, ['Live ●', 'Hören Sie zu']),
  campus: art('campus', 679, ['Unsere Schule', 'Kigali']),
  announcements: art('announcements', 570, ['Achtung! 📣', 'Neuigkeiten']),
  teaching: art('teaching', 622, ['Guten Morgen!', 'Sprechen Sie mit']),
  settings: art('settings', 756, ['Ihr Profil', 'Alles klar ✓']),
} satisfies Record<string, Art>;

export type HeroArtKey = keyof typeof HERO_ART;
