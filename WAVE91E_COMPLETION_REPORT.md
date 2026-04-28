# WAVE91E COMPLETION REPORT

Build: `trainer-build-wave91e-2026-04-28`
Wave: `wave91e`
Hashed asset count: `112`

## Scope

Wave91e continues the wave91 plan after wave91d. It focuses on the practical Package 5 items and one exam UX item:

- D1 — “Объясни другу” learning-by-teaching mode.
- D4 — Pomodoro training session.
- D8 — Anki export for error review, implemented as a static-web compatible TSV import file.
- A10 — OГЭ/ЕГЭ countdown widget for grades 9 and 11.
- J1 — `tools/update_index_stats.mjs --check` CI-style index stats check.
- J2/C1/C5 — verified through existing full theory coverage audit.

## Runtime changes

The new feature pack lives in:

- `assets/_src/js/chunk_wave91e_learning_formats.js`

For performance, it is merged into the existing extended runtime rather than shipped as a new eager grade-page script:

- `assets/_src/js/bundle_grade_runtime_extended_wave89b.js`
- `assets/js/bundle_grade_runtime_extended_wave89b.dbfcb83bfc.js`

This keeps the grade-page script budget unchanged:

- max grade-page scripts: `20`
- wave91e external scripts added: `0`

## Features

### D1 — “Объясни другу”

On the practice screen, before answering, the user can open a small explanation task:

1. write the solution in their own words;
2. reveal the model explanation built from `ex`, `hint`, and answer data;
3. self-grade: “Понял”, “Не совсем”, “Не понял”.

Stored per grade under:

- `trainer_explain_friend_wave91e_<grade>`

### D4 — Pomodoro

The main grade screen now has a Pomodoro card:

- 25 minutes focus;
- 5 minutes break;
- reset/stop;
- persistent counters per grade;
- mini timer in the play header.

Stored per grade under:

- `trainer_pomodoro_wave91e_<grade>`

### D8 — Anki export

The app can export the existing error journal into an Anki-compatible TSV import file.

Input:

- `trainer_journal_<grade>`

Output filename pattern:

- `trainer3_grade<grade>_errors_anki_import.txt`

Note: this is intentionally a browser-safe TSV import path, not a binary `.apkg` writer. It avoids adding SQLite/ZIP dependencies to the static app.

### A10 — Exam countdown

For grades 9 and 11, the main screen now shows a configurable countdown:

- grade 9: OГЭ;
- grade 11: ЕГЭ;
- date stored locally;
- daily plan: solve 5 exam tasks and review mistakes.

Stored per grade under:

- `trainer_exam_date_wave91e_<grade>`

### J1 — index stats check

`tools/update_index_stats.mjs` now supports:

```bash
node tools/update_index_stats.mjs --check
```

The validation workflow runs it to ensure `index.html` stays synchronized with generated hero/special/exam stats.

## New/updated audits

Added:

```bash
node tools/audit_learning_formats_wave91e.mjs
```

Updated for wave91e/lazy compatibility:

```bash
node tools/update_index_stats.mjs --check
node tools/audit_math_exam_depth_wave90c.mjs
node tools/audit_diagnostic_exam_bindings_wave89u.mjs
node tools/audit_exam_variant_expansion_wave91d.mjs
node tools/audit_special_subjects_wave91b.mjs
```

## Verification run

Passed:

```bash
node --check assets/_src/js/chunk_wave91e_learning_formats.js
node --check assets/_src/js/bundle_grade_runtime_extended_wave89b.js
node --check assets/js/bundle_grade_runtime_extended_wave89b.dbfcb83bfc.js
node --check sw.js
node tools/audit_learning_formats_wave91e.mjs
node tools/update_index_stats.mjs --check
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_simple_mode_wave89d.mjs
node tools/audit_hamburger_wave89f.mjs
node tools/audit_exam_variant_expansion_wave91d.mjs
node tools/audit_exam_variant_depth_wave90d.mjs
node tools/audit_math_exam_depth_wave90c.mjs
node tools/audit_theory_coverage.mjs
node tools/audit_diagnostic_exam_bindings_wave89u.mjs
node tools/audit_answer_click_runtime_wave90a.mjs
node tools/audit_exam_mode_navigation_wave90b.mjs
node tools/validate_questions.js
```

Known packaging note: `assets/fonts/*` is intentionally not included in this archive. Keep or overlay the existing font directory from the source deployment before running the self-host-font audit.
