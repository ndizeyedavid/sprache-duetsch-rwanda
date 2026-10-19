# A1 course import (current)

Source: `deutschsprache-a1.html` (repository root, "Deutsch A1 — Kursprogramm", deutshsprache.org, 2026-10-17). Same JSON format and shared `html-course/` pipeline as A2–B2: 8 modules (A1.1 + A1.2), 24 lessons, 120 exercises (gap-fill + multiple choice), 288 vocabulary entries with EN/FR, 24 dialogues, 24 writing tasks. Manifest: `a1-kursprogramm.json`; namespace `sparch:a1:course:v1`.

```sh
npx tsx prisma/course-import/a1/extract-a1.ts [path/to/deutschsprache-a1.html]   # refresh the manifest
npx tsx prisma/course-import/a1/import-a1.ts            # dry-run
npx tsx prisma/course-import/a1/import-a1.ts --apply    # backup to backups/a1-course-*.json, then import
npx tsx prisma/course-import/a1/verify-a1.ts            # DB vs manifest, grades every answer
```

It **replaces the PDF coursebook edition below**: `A1_SPEC.retiredModuleIds` lists that edition's ten part-modules, which the import archives (unpublished, moved below zero) — never deletes — so lessons, activities, progress and submissions stay as history. Students start the new course at lesson 1. The seed (`seed-content.ts`) imports this course, not the coursebook. Lesson photos are the Unsplash photos named in the source, self-hosted (see "Lesson photos").

# A1 coursebook import (retired edition, history only)

Do not re-run `import-a1.ts --apply` on a database that has the current course: it would republish the archived coursebook modules.


Source: `Deutsch_A1_Kursbuch.pdf`, 215 pages. The checked-in manifest records its SHA-256 hash and source pages for every unit. The original was found at `../dignity/.material/Deutsch_A1_Kursbuch.pdf` relative to the repository.

The actual headings define 10 parts and 50 units (the introduction incorrectly refers to Unit 49 as the answer key; it is Unit 50). Content, tables, original illustrations, dialogue turns, exercises, selected model answers and the word list are retained. Unit 49 has 30 interactive practice-test tasks; the other units contain 229 original exercises. Fifty additional short questions check the unit topics.

From the repository root, rebuild the manifest and compressed source illustrations:

```sh
# Requires Poppler (pdftohtml/pdftotext) and Python Pillow.
python3 scripts/course-import/extract_a1.py /path/to/Deutsch_A1_Kursbuch.pdf
```

From `backend/`, inspect or apply to the configured database:

```sh
npx tsx prisma/course-import/import-a1.ts
npx tsx prisma/course-import/import-a1.ts --apply
```

Application backs up existing A1 curriculum, progress and submissions to private, gitignored `backend/backups/` before a transaction. Old demo modules/lessons/activities and linked assessments are unpublished, preserving their history. Stable IDs make subsequent imports update the same records without resetting student work. The normal seed skips imported coursebook modules. Accounts, enrolments, fees and payment records are untouched.

Self-study activities use `config.practiceMode: true`. Responses save through the existing authenticated activity API and MCQs receive immediate feedback. Practice is excluded from formal assignment lists and grading queues; written practice saves without claiming an automated grade. Model answers are revealed after a response where the source supplies one. Units remain browsable in order, with manual lesson completion tracking.

The source provides transcripts and suggested video searches, but no audio recordings. No audio files or external video URLs have been invented. The book's explanatory prose is predominantly English; examples and dialogues are German. Source exam descriptions are reproduced, not presented as independently verified current exam regulations.

Exercise rendering now uses one task at a time. Lettered sub-items are separate answer fields; source-labelled and unambiguous short answer keys are aligned per item. Long/short vowel and soft/hard pronunciation exercises use explicit choices. Open-ended writing retains a composition field and model comparison. Duplicate static `Übungen` sections are omitted from the reading navigation; interactive practice appears after the reading sections.

The importer logic lives in `a1-import.ts` (`importA1({ apply })`, also used by `npm run db:seed`); `import-a1.ts` is the CLI wrapper. Ids come from `a1-manifest.ts` and must not change.

## A1 cleanup (test and demo leftovers)

```sh
npx tsx prisma/course-import/clean-a1/clean-a1.ts                        # dry-run: lists every step + reason
npx tsx prisma/course-import/clean-a1/clean-a1.ts --apply                # backup to backups/a1-clean-*.json, then apply
npx tsx prisma/course-import/clean-a1/clean-a1.ts --apply --republish-imported   # also re-publish hidden imported A1 records
```

Records owned by the A1 import (stable ids) are never deleted. Everything else in A1 is checked against `clean-a1/signals.ts`: the old seed placeholders ("A1 — Grundlagen", "Modul n für …"), test titles (`test`, `asdf`, home-row mashes like `shdad`), QA markers (`QA`, `fixture`, `regression`, `UI flow`, `all question types` …), long vowel-less keyboard mashes, and dummy links (`sparch.rw/materials/…`, `example.com`). Matches with **no student work** are deleted. Matches with progress, submissions, attempts, linked assignments or uploaded files are kept and unpublished. Question-bank entries left behind by a deleted test assessment are removed when nobody answered them. Unrecognised extra modules are listed as `keep` for manual review. Every delete re-checks for student work inside the transaction. An audit row `CURRICULUM_CLEANED` records the run. Accounts, enrolments and finance are never touched. Review the dry-run before applying to production.

# A2 course import

Source: `deutschsprache-a2.html` (repository root). The complete A2.1/A2.2 course has 8 modules,
24 lessons, 120 exercises (71 gap-fill, 49 multiple choice), 288 vocabulary entries with EN/FR
translations, 24 dialogues and 24 writing tasks. Its checked-in manifest includes the source SHA-256.

```sh
npx tsx prisma/course-import/a2/extract-a2.ts [path/to/deutschsprache-a2.html]
npx tsx prisma/course-import/a2/import-a2.ts            # dry-run
npx tsx prisma/course-import/a2/import-a2.ts --apply    # backup, then import
npx tsx prisma/course-import/a2/verify-a2.ts            # compare database with manifest and grade every answer
```

A2 uses the shared HTML-course pipeline with namespace `sparch:a2:course:v1`. It preserves grammar,
tables, examples, the lesson photo (self-hosted, no credit line), vocabulary, phrases and each dialogue as a separate reader page.
Writing tasks remain self-study compositions with the source word range and checklist, without an
automatic grade. Existing level configuration, accounts, enrolments and finance are preserved.

# B1 course import

Source: `deutschsprache-b1.html` (repository root, "Deutsch B1 — Kursprogramm", deutshsprache.org, original material). The course JSON in its `<script id="course">` block is extracted into the checked-in `b1-course.json`, together with the HTML's SHA-256. The result has 8 modules, 24 lessons, 120 exercises (71 gap-fill, 49 multiple choice) and 288 vocabulary entries with EN/FR translations.

```sh
npx tsx prisma/course-import/b1/extract-b1.ts [path/to/deutschsprache-b1.html]   # refresh b1-course.json
npx tsx prisma/course-import/b1/import-b1.ts            # dry-run (plan for existing B1 modules)
npx tsx prisma/course-import/b1/import-b1.ts --apply    # backup to backups/b1-*.json, then import
npx tsx prisma/course-import/b1/verify-b1.ts            # DB vs manifest, grades every answer via the API grader
```

- **Mapping:** module → `Module` (order 1–8). Lesson → `Lesson` (global order 1–24, title "Thema — Titel", `kurz` as description). The `body` is HTML whose `<h2>` sections become reader pages: Lernziele (one self-hosted lead photo, see "Lesson photos" below), one page per grammar topic (explanation, table, examples, tip), Wortschatz (EN/FR + example sentence) and Redemittel.
- **Exercises:** one practice activity per exercise (`practiceMode: true`, `items: [{ id, prompt, options?, answer, answers?, explanation }]`). Gap-fills are `FILL_BLANK` and multiple choice is `MCQ`. `answers` holds the accepted alternatives (for example "falls"/"wenn", or "werde … anrufen"). Alternatives are graded leniently by `src/modules/content/accepted-answers.ts`, ignoring case, ellipses, commas and extra spaces. The student sanitizer hides `answer`, `answers` and `explanation` until submission. The activity-level `explanation` is shown after a wrong answer.
- **Vocabulary:** one published `FLASHCARD` activity per lesson, `config.cards: [{ front, back: "en / fr", example }]`.
- **Shared pipeline:** the logic lives in `html-course/` (`extract`, `course` validation, `body`, `activities`, `existing-modules`, `importer`, `verify`), driven by a `CourseSpec` per level (`b1/course.ts`, `b2/course.ts`). The B1 spec keeps namespace `sparch:b1:course:v1`, so ids never change.
- **Existing B1 modules:** seed placeholders without student work are deleted. Placeholders with work are unpublished and moved below zero. Other staff-made modules stay published and only move behind the course if their order collides with 1–8.
- **Level:** the B1 level is created from `demo-demo-levels.ts` only when missing. An existing level (fees, titles) is never modified.

# B2.1 course import

Source: `deutschsprache-b2-1.html` (repository root, "Deutsch B2.1 — Kursprogramm", first half of B2, same JSON format as B1). Extracted into `b2-course.json`: 6 modules, 18 lessons, 108 exercises (53 gap-fill, 55 multiple choice), 252 vocabulary entries and 18 writing tasks. It is imported into the existing **B2** level as modules 1–6 with namespace `sparch:b2-1:course:v1`, so a later B2.2 export can get its own ids and modules 7+.

```sh
npx tsx prisma/course-import/b2/extract-b2.ts [path/to/deutschsprache-b2-1.html]   # refresh b2-course.json
npx tsx prisma/course-import/b2/import-b2.ts            # dry-run
npx tsx prisma/course-import/b2/import-b2.ts --apply    # backup to backups/b2-*.json, then import
npx tsx prisma/course-import/b2/verify-b2.ts            # DB vs manifest
```

Same mapping as B1, plus the B2-only fields: `textsorte` and `pruefung` appear on the Lernziele page ("Textsorte", "Prüfungsbezug"). Each `schreibaufgabe` becomes a `WRITING` practice activity ("Schreibaufgabe", last in the lesson): task, `Umfang` and checklist in the instruction, `wordRange`/`checklist` in the config. It saves like the A1 compositions, without an automatic grade, and stays out of grading queues. No model answers exist in the source, so none are shown.

`npm run db:seed` imports A1, A2, B1 and B2 through `seed-content.ts`, so no placeholder modules are seeded for these levels. `npm run db:seed:demo` skips placeholder content for every level in `imported-levels.ts`. On production, use only the level-specific importers: the ordinary seed also changes unrelated account/demo data.

# Lesson photos

Every lesson of A1, A2, B1 and B2 opens its Lernziele page with one lead photo, served by the frontend from `frontend/public/coursebook/photos/` (800×533 WebP, ~35 KB, lazy-loaded). **Real photographs only — no AI-generated images.** All are the Unsplash-licence photos chosen in each course's source HTML (free to use without attribution; no Unsplash+ images), downloaded with Unsplash's face/entropy smart crop and named after the photo id (`photo-….webp`). `html-course/body.ts` renders them caption-free via `lesson-photos/figure.ts`.

The retired A1 coursebook edition briefly carried AI-generated unit photos (`a1-NN.webp`); they were removed on 2026-10-17 and its units have no lead photo.

Existing databases are updated in place, touching photo markup only (lesson text edited by staff stays as is):

```sh
npx tsx prisma/course-import/lesson-photos/apply-lesson-photos.ts          # dry-run: counts per level, sample
npx tsx prisma/course-import/lesson-photos/apply-lesson-photos.ts --apply  # backs up touched bodies to backups/lesson-photos-*.json first
```

It rewrites old hotlinked, credited Unsplash figures to the local caption-free ones and removes any AI-generated photo (`a1-NN.webp`). It is idempotent and fails if a referenced photo file is missing (when `frontend/` is present). Deploy the frontend (with the photos) before applying it to production.
