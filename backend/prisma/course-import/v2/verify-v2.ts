// Usage (from backend/): npx tsx prisma/course-import/v2/verify-v2.ts --level A1 [--lessons 1-3]
// Checks every pack without touching the database: schema, answer keys, glossary coverage, audio files.
// Exits 1 when anything needs fixing.
import { existsSync } from "node:fs";
import { AudioCollector } from "./audio.js";
import { buildLessonContent, lessonGlossary } from "./build-content.js";
import { sessionActivities } from "./build-sessions.js";
import { flashcardTask, speakingTask } from "./build-tasks.js";
import { packProblems } from "./checks.js";
import { buildTest } from "./build-test.js";
import { loadLevelGlossary, loadPacks, loadSource, loadTestPacks, parseLessons } from "./packs.js";
import { testProblems } from "./test-checks.js";

const arg = (name: string) => { const index = process.argv.indexOf(name); return index > 0 ? process.argv[index + 1] : undefined; };
const level = (arg("--level") ?? "").toUpperCase();
const { course } = await loadSource(level);
const glossary = await loadLevelGlossary(level);
const packs = await loadPacks(level, parseLessons(arg("--lessons")));
const publicDir = new URL("../../../../frontend/public", import.meta.url).pathname;

let failed = false;
const lessons = packs.map(({ file, pack }) => {
  const audio = new AudioCollector();
  buildLessonContent(pack, course.lektionen.find((lesson) => lesson.nr === pack.lesson)?.bild, glossary, audio);
  const sessions = sessionActivities(pack, audio);
  flashcardTask(pack, audio); speakingTask(pack, audio);
  const problems = packProblems(pack);
  const missingWords = lessonGlossary(pack, glossary).missing;
  const missingAudio = audio.list().filter((clip) => !existsSync(`${publicDir}${clip.url}`)).length;
  if (problems.length || missingWords.length) failed = true;
  return { file, questions: sessions.reduce((n, s) => n + s.config.items.length, 0), sessions: sessions.map((s) => `${s.config.session}:${s.config.items.length}`),
    clips: audio.list().length, missingAudio, problems, missingWords };
});
const tests = (await loadTestPacks(level)).map(({ file, pack }) => {
  const audio = new AudioCollector();
  const { questions } = buildTest(pack, audio);
  const problems = testProblems(pack);
  if (problems.length) failed = true;
  return { file, questions: questions.length, points: questions.reduce((sum, q) => sum + q.points, 0), missingAudio: audio.list().filter((clip) => !existsSync(`${publicDir}${clip.url}`)).length, problems };
});
console.log(JSON.stringify({ level, packs: lessons.length, ok: !failed, lessons, tests }, null, 2));
process.exit(failed ? 1 : 0);
