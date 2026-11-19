# Course v2 — Duolingo-style lessons with English help and audio

Course v2 upgrades the imported A1–B2 courses in place. Each lesson gets:

- **Lesson.content** — a structured lesson the student reads first: goals, words, dialogue, grammar,
  phrases, pronunciation, a reading text. Every German line has an English meaning and a speaker
  button, and every German word can be tapped for its meaning (glossary).
- **PRACTICE activities** — 4–5 short sessions ("Wörter", "Grammatik", "Hören & Sprechen", "Lesen",
  "Übersetzen"): one question per screen, checked instantly, wrong answers come back at the end.
  Finishing every session completes the lesson automatically.
- **Writing and speaking tasks** — sent to the teacher (grading queue), with a model answer the
  student sees after handing in.
- **Flashcards** — the lesson's words with English and audio.

The v1 single-question exercises are unpublished (history kept). Lesson ids stay the v1 stable ids,
so progress and submissions survive re-imports.

## Files

| Path | What |
| --- | --- |
| `packs/<level>/lesson-NN.json` | One pack per lesson (the source of truth for v2 content). |
| `packs/<level>/glossary.json` | Level glossary: German form → `[English]` or `[English, dictionary form]`. |
| `pack-schema.ts` | Zod schema of a pack — read it, it documents every field. |
| `importer.ts` / `import-v2.ts` | Build + write to the database (dry-run unless `--apply`, backs up first). |
| `verify-v2.ts` / `checks.ts` | Pack checks without a database (schema, answers, glossary, audio). |
| `audio.ts`, `generate_audio.py`, `qa_audio.py` | Audio URLs, Piper generation, Whisper listen-check. |
| `fix_word_audio.py`, `audio-skip.json` | Listen-check of single words and short phrases (tap-a-word, word lists): re-synthesises the ones Whisper mishears; the ones no version fixes are listed in `audio-skip.json` and get no recording (no speaker in the app). |
| `build-*.ts`, `body-html.ts`, `german-texts.ts`, `tokens.ts` | Pack → content/activities/HTML; tappable text; tokenizer (keep in sync with `frontend/src/components/learn/translate/tokens.ts`). |

## Commands (from `backend/`)

```sh
npx tsx prisma/course-import/v2/verify-v2.ts --level A1 --lessons 1-3          # must print "ok": true
npx tsx prisma/course-import/v2/import-v2.ts --level A1 --lessons 1-3          # dry-run; writes v2/audio-A1.json
~/.cache/dsrw-tts/venv/bin/python prisma/course-import/v2/generate_audio.py prisma/course-import/v2/audio-A1.json
~/.cache/dsrw-tts/venv/bin/python prisma/course-import/v2/qa_audio.py prisma/course-import/v2/audio-A1.json   # optional listen-check
~/.cache/dsrw-tts/venv/bin/python prisma/course-import/v2/fix_word_audio.py prisma/course-import/v2/audio-A1.json   # words: fix or list as unclear
npx tsx prisma/course-import/v2/import-v2.ts --level A1 --lessons 1-3 --apply  # local replica first (index.md §9.5)
```

The level's v1 import must have run first (it creates the lessons). Audio files land in
`frontend/public/audio/<voice>/<hash>.mp3` and ship with the web app.

**One voice everywhere.** A speaker in the app only plays recordings (`SayButton` hides itself without
one): the device's own German voice is female on most phones and in Chrome, so mixing it in sounds like a
second person repeating the line. Thorsten garbles the first sound of many words said on their own, so
single words and short phrases go through `fix_word_audio.py` after `generate_audio.py` (it also covers the
word lists of the translated HTML lessons: run it on `v2/audio-<LEVEL>-words.json` after
`translate/import.ts`), then the import runs again with `--apply` so words in `audio-skip.json` lose their
recording.

## Writing a pack

Start from `packs/a1/lesson-01.json` (the reference lesson) and the v1 source lesson in the level
manifest (`a1-kursprogramm.json`, `a2-course.json`, …). Keep the source's German (fix real mistakes),
translate everything, then add what v1 lacked.

### Language and level

- **English only** for help text (no French, no Kinyarwanda) — decided by the school on 2026-10-22.
- German must be correct, natural and at the lesson's CEFR level. Practice uses only words and
  grammar the lesson (or an earlier one) teaches; a reading text may stretch slightly — the glossary
  covers new words.
- English is short, plain and natural (learners in Rwanda read English well; avoid idioms).
  `en` fields translate meaning, not word for word (`Ich heiße Amina.` → `My name is Amina.`).
- Names and places should feel local and international: Amina, Keza, Eric, Aline; Kigali, Huye,
  Musanze; Berlin, Köln, Wien. Keep the source's characters where they exist.
- `exam` names the real exam part (Goethe-Zertifikat A1 = Start Deutsch 1, A2, B1, B2; telc; ÖSD)
  with the skill that actually matches the lesson (Lesen/Hören/Schreiben/Sprechen + Teil).

### Sections

- `goals` — the source `lernziele` + English.
- `vocab` — 12–18 words: the source list plus words the dialogue/reading/practice need. Nouns with
  article and plural (`der Name, -n`) and `say` = the spoken form (`der Name`); `noteEn` for plurals,
  irregular forms or usage. Every example sentence has `exampleEn`.
- `grammar` — the source topics with `explanationEn` that a beginner understands without a teacher,
  a table where it helps, 2–4 examples with English, `tipEn`. Add a topic when the practice needs
  grammar the course never explains (lesson 1 added "Verben im Präsens: ich, du, Sie").
- `phrases`, `pronunciation` — from the source, with English.
- `dialogue` — the source dialogue with English; give every speaker a voice (`m`/`f`). B1/B2 lessons
  have no source dialogue: write one (8–12 lines) on the lesson topic. `say` overrides what the voice
  reads when the display text is not speakable (spelling: `"T-O-M"` → `"Tee — O — Emm."`).
- `reading` — new: a short text on the lesson topic (A1: 6–10 sentences, A2: 10–14, B1/B2: 150–250
  words), split into sentences with English.
- `writing` — the source task + checklist, English for both, and a model answer at the level within
  the word range. B1 had no writing tasks: write one per lesson.
- `speaking` — new: a task in the style of the exam's speaking part, 3–5 prompts, a model answer.

### Practice sessions (the most important part)

Five sessions per lesson, in this order, 50–65 questions in total:

| key | title | size | content |
| --- | --- | --- | --- |
| `words` | Wörter | 10–14 | `match` (5–6 pairs) ×2, `choose` meaning (some with `listen: true`), `translate` short phrases both ways, `fill` with options, one `listen` |
| `grammar` | Grammatik | 12–15 | the v1 exercises (keep them), more `fill` (typed and with options), `choose` with gap prompts, `order` (3–4) |
| `listen` | Hören & Sprechen | 10–12 | `passage: "dialogue"` + 3 `truefalse` about it, `listen` choose/type, 3 `speak` |
| `read` | Lesen | 6–8 | `passage: "reading"` + `truefalse` and `choose` comprehension |
| `translate` | Übersetzen | 10 | 5 × `from: "de"`, 5 × `from: "en"`, full sentences from the lesson |

Rules the checker cannot see:

- One clear correct answer. `accepted` lists every other correct translation a learner may type
  (word order variants, du/Sie, synonyms); contractions are already handled ("I'm" = "I am").
- Distractors are plausible but wrong (other verb forms, near meanings) and never also correct.
- `explanationEn` on grammar items says *why* (the rule), not just the answer.
- `fill` text has exactly one `___`; give `options` when typing the form would be unfair at the level.
- `choose`: German `prompt` gets audio; use `promptEn` for English questions and say `optionsLang: "en"`
  when the options are English.
- Do not reuse the exact same sentence in two sessions of one lesson (vary names and details).

### Glossary

Every German word the student can tap (see `german-texts.ts`) must have an entry, or `verify-v2`
fails with `missingWords`. Put new words in the pack's `glossary` (lesson-specific) or the level
`glossary.json` (shared). Keys: nouns capitalised, everything else lower case; inflected forms carry
the dictionary form (`"kommst": ["come (with du)", "kommen"]`). Multi-word entries (`"guten Tag"`,
`"bis morgen"`, up to 3 words) win over single words. Names: `["Keza (a first name)"]`.

## Tests (module tests and the mock final exam)

`packs/<level>/test-module-NN.json` (one per module, opens after the module's last lesson) and
`packs/<level>/test-final.json` (Goethe-style mock exam; passing every published FINAL_EXAM is a
certificate requirement) follow `test-schema.ts`. They become Assessments (MODULE_TEST / FINAL_EXAM)
with Questions, so students take them in the existing quiz player (timer, attempts, gradebook) and the
lesson page of lesson `after` links to them.

```sh
npx tsx prisma/course-import/v2/import-tests.ts --level A1            # dry-run; writes v2/audio-A1-tests.json
~/.cache/dsrw-tts/venv/bin/python prisma/course-import/v2/generate_audio.py prisma/course-import/v2/audio-A1-tests.json
npx tsx prisma/course-import/v2/import-tests.ts --level A1 --apply
```

- Only test what the course taught. Tests grade exact matches: `fill` answers are one word with one
  spelling; prefer `choose` when several answers would be right.
- `intro` is German · English; the description says what is tested, the time and the pass mark.

### Exam format (Goethe)

Tests copy the Goethe-Institut exam **format**, so students know the real exam long before they sit it.
The sample papers in the repo root (`sd_1_modellsatz.pdf`, `A2_Modellsatz_Erwachsene.pdf`,
`A2_Uebungssatz_Erwachsene (1).pdf`) are © Goethe-Institut: use them for structure only. Every text,
name, number, situation and question in a pack is our own.

A section is one exam part ("Hören, Teil 1 · Listening, part 1"). Fields that make it work like the paper:

- `passage`: the reading text, shown once above the part (email, article, store guide). Lists the
  student chooses from are written one per paragraph with their letter: `a  Musikschule Klangwerk: …`.
- `listen` on a question: that item's own recording (Hören Teil 1 and 3). `listen` on the section: one
  recording for all its questions (A2 Hören Teil 2 and 4).
- Scripts are plain German (one voice) or a conversation where every line starts with `M: ` or `F: `
  (Thorsten and Kerstin). Write what the student must hear in words, not digits: `neunzehn Euro
  fünfzig`, `um Viertel nach drei`.
- Paragraphs (blank lines) in a question's `prompt` or a `truefalse` `statement` show the leading
  ones in a box above the question: put a sign and where it hangs there (Lesen Teil 3), the
  statement or question last.
- `plays`: 2 = "Sie hören jeden Text zweimal", 1 = "einmal"; the player stops after that many plays.
- `letters: true`: options keep their written order and show as a, b, c. Options that are only letters
  (`"a"` … `"i"`, `"x"`) give a compact answer row; use them when the choices are listed in the
  passage (ads a–f, places a–i described in words). Up to 10 options, only with `letters`.

**Module tests** (one per module, about 25 questions, 30 minutes): one exam-style part per skill
(Hören Teil 1 dialogues with `plays: 2`; Lesen signs or a short email, richtig/falsch), then Wörter and
Grammatik on the module, then Schreiben in exam form (a short message covering three points).

**Final exam** (`test-final.json`): the level's written exam, part for part. Sprechen is not online;
students practise it with speaking tasks in lessons and with their teacher.

A1 · Start Deutsch 1: 65 minutes, 45 points (Hören 15, Lesen 15, Schreiben 15), pass mark 60 %.

| Part | Items | Format |
|---|---|---|
| Hören 1 | 6 | short everyday dialogues; question with a/b/c; `plays: 2` |
| Hören 2 | 4 | announcements (station, airport, shop, radio); richtig/falsch; `plays: 1` |
| Hören 3 | 5 | answering-machine messages; question with a/b/c; `plays: 2` |
| Lesen 1 | 5 | two short texts (email, note) in the passage; richtig/falsch |
| Lesen 2 | 5 | a situation and two web or ad snippets; choose a or b |
| Lesen 3 | 5 | a sign or notice (where it hangs + text) in the prompt; richtig/falsch |
| Schreiben 1 | 5 | a short text about a person in the passage; five form fields as `fill` (one word each) |
| Schreiben 2 | 1 | a message of about 30 words covering three points; `write`, 10 points (3 per point, 1 for greeting and closing) |

A2 · Goethe-Zertifikat A2: 90 minutes, 60 points (Lesen 20, Hören 20, Schreiben 20), pass mark 60 %.

| Part | Items | Format |
|---|---|---|
| Lesen 1 | 5 | newspaper or magazine article; a/b/c |
| Lesen 2 | 5 | information board (store floors, fair halls); "Wohin gehen Sie?" a/b/c, one option "anderer Stock" |
| Lesen 3 | 5 | personal email; a/b/c |
| Lesen 4 | 5 | six ads a–f in the passage; five people, each gets a letter or "x" (no ad fits, exactly once) |
| Hören 1 | 5 | radio, phone and public announcements; a/b/c; `plays: 2` |
| Hören 2 | 5 | one conversation (section `listen`): match five days or people to options a–i in the passage; `plays: 1` |
| Hören 3 | 5 | five short conversations; a/b/c (what a picture would show, in words); `plays: 1` |
| Hören 4 | 5 | one radio interview (section `listen`); Ja/Nein; `plays: 2` |
| Schreiben 1 | 1 | SMS to a friend, 20–30 words, three points; `write`, 10 points |
| Schreiben 2 | 1 | semi-formal email (teacher, landlord, boss, hotel), 30–40 words, three points; `write`, 10 points |

Item writing:

- Wrong options are things the text mentions and then rejects or changes ("eigentlich am Samstag,
  aber …", the old price, the first suggested time), so students must understand, not spot a word.
- One clearly right answer per item. Questions follow the order of the text.
- Use the level's language only: A1 tests stay inside A1 grammar and the course's words; A2 tests
  may use Perfekt, Präteritum of sein/haben/modals, dative, weil/dass/wenn and comparison.
- `write` prompts give the situation and the three points as German bullets; `promptEn` translates
  them; `modelAnswer` keeps to the word count.

## Audio

`audio.ts` maps speaker voices to Piper models (only Thorsten is clear enough among free German
voices for lessons; tests add Kerstin for women in conversations, see `EXAM_VOICES`). A test
conversation becomes one clip under `/audio/dialogue/`. A clip URL is a hash of voice + spoken text, so changing a sentence
makes a new clip. `generate_audio.py` only creates missing files. `qa_audio.py` flags clips Whisper
hears differently; names and digits are often its own mistakes — listen before changing anything.
