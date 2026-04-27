# wave89r exam-bank JSON runtime

`wave89q` introduced the structured exam-bank contract inside `bundle_exam`.
`wave89r` moves the first canonical families out of bundle internals and into explicit source data files.

## Source of truth

Canonical files now live in `assets/data/exam_bank/`:

- `catalog.json`
- `oge_math_2026_foundation.json`
- `ege_profile_math_2026_foundation.json`

Each row keeps the stable contract from roadmap items `#6–#7`:

```json
{
  "exam": "ОГЭ",
  "subject": "math",
  "year": 2026,
  "variant": 1,
  "task_num": 7,
  "type": "choice",
  "max_score": 1,
  "q": "...",
  "a": "...",
  "o": ["...", "...", "...", "..."],
  "h": "...",
  "ex": "...",
  "criteria": ["1 балл за правильный ответ"],
  "topic_tag": "..."
}
```

Extra metadata such as `section`, `topic`, `part`, `score_model`, and `source_pack` remains additive.

## Build chain

1. `assets/data/exam_bank/catalog.json` describes the available structures/families.
2. `tools/build_exam_bank_runtime_wave89q.mjs` validates catalog + bank files and compiles them into `assets/_src/js/chunk_exam_bank_wave89q.js`.
3. The hashed `chunk_exam_bank_wave89q.*.js` asset is loaded before `bundle_exam.*.js` on `diagnostic.html` and `dashboard.html`.
4. `bundle_exam` now prefers `window.WAVE89Q_EXAM_BANK.families[familyId]` and marks those variants as `generatedFromStructuredJson: true` with `structuredFamilySource: 'json_bank'`.
5. Families that are not externalized yet still fall back to the previous legacy compile path, so existing exam UI stays stable.

## Current scope

The first externalized families are intentionally narrow:

- `oge_math_2026_full`
- `ege_profile_math_2026_part1`

This matches the next content priorities from the plan: first build the infrastructure, then expand the actual OГЭ/ЕГЭ subject coverage.
