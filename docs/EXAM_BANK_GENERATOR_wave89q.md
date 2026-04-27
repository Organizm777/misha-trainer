# wave89q structured exam bank + KIM generator

`bundle_exam` now carries a canonical structured exam-bank layer on top of the existing OГЭ/ЕГЭ pack hub.
The goal is to stop treating every exam variant as an ad-hoc `sections + sources` object and introduce a stable JSON-shaped bank that later real FIPI tasks can reuse without rewriting the runtime.

## Canonical row schema

Schema id: `wave89q_exam_bank_v1`.

Every structured bank row keeps the following JSON-compatible fields:

```json
{
  "exam": "ЕГЭ",
  "subject": "profile_math",
  "year": 2026,
  "variant": 2,
  "task_num": 7,
  "type": "single",
  "max_score": 1,
  "q": "sin(π/6) равен...",
  "a": "1/2",
  "o": ["1/2", "√3/2", "1", "0"],
  "h": "Стандартное значение синуса 30°.",
  "ex": "",
  "criteria": ["1 балл за верный ответ."],
  "topic_tag": "функции_графики_производная"
}
```

Extra metadata such as `section`, `part`, `source_pack`, `score_kind`, and `score_model` may also be attached, but the fields above are the stable contract.

## Runtime API

The new namespace is exported from `window.wave30Exam`:

- `wave30Exam.buildStructuredKim(familyId, variantNo)`
- `wave30Exam.buildLegacyPack(packId)`
- `wave30Exam.structured.schema`
- `wave30Exam.structured.listFamilies()`
- `wave30Exam.structured.matchPackId(packId)`
- `wave30Exam.structured.getFamily(familyId)`
- `wave30Exam.structured.getRows(familyId)`
- `wave30Exam.structured.getBlueprint(familyId)`
- `wave30Exam.structured.buildKim(familyId, variantNo)`
- `wave30Exam.structured.exportSnapshot()`

## How generation works

1. Existing `wave69`/`wave70`/`wave71` exam variants are still described by the old pack config.
2. For supported families, `bundle_exam` compiles those deterministic variants into a structured bank snapshot.
3. `buildStructuredKim(...)` reconstructs a full KIM strictly from the structured bank rows and blueprint task order.
4. `buildPack(packId)` now automatically routes supported variant families through the structured generator and falls back to `buildLegacyPack(packId)` for everything else.

So the live diagnostic / exam UI is unchanged, but supported exam packs are now bank-backed under the hood.

## Initial structured families

The first catalog covers the variant families already present in the trainer:

- `oge_math_2026_full`
- `oge_russian_2026_full`
- `oge_english_2026_full`
- `oge_social_2026_full`
- `ege_base_math_2026_full`
- `ege_profile_math_2026_part1`
- `ege_russian_2026_part1`
- `ege_social_2026_part1`
- `ege_english_2026_part1`
- `ege_physics_2026_part1`

## Why this matters for the roadmap

This closes the infrastructure half of roadmap items `#6–#7`:

- there is now a stable exam-bank JSON shape for future real OГЭ/ЕГЭ tasks;
- full variants can be rebuilt from bank rows + blueprint task numbering instead of hand-written section objects;
- the runtime already exposes enough metadata (`task_num`, `max_score`, `criteria`, `topic_tag`, `variant`, `year`) to plug in genuine exam content later.

Current limitation: the bank is still seeded from the trainer’s existing deterministic exam variants, not from an imported official archive yet. That content expansion belongs to the follow-up subject tasks (`#10+`, `#13+`).
