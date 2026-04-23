# wave87g — Grade 11 balance: Art + Olympiad live banks

wave87g continues roadmap item B6: grade 11 should be closer to grade 10 in subject breadth and depth.

## What changed

Grade 11 now receives two additional runtime-injected subjects in the grade-specific gap-balance chunk:

- `art` / «Искусство» — 4 topics
  - `art11_modern_wave87g`
  - `art11_rus_wave87g`
  - `art11_media_wave87g`
  - `art11_theatre_wave87g`
- `oly` / «Олимпиада» — 4 topics
  - `oly11_logic_wave87g`
  - `oly11_inter_wave87g`
  - `oly11_research_wave87g`
  - `oly11_strategy_wave87g`

Each topic uses 15 live-bank scenario rows with `q/a/o/h/ex`, not the generic `facts -> makeGen()` fallback. Total new rows: 120.

## Files

Edit source:

- `assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.js`

Rebuild the hashed asset and update references in:

- `grade11_v2.html`
- `sw.js`
- `assets/asset-manifest.json`
- `healthz.json`

## Validation

```bash
node tools/audit_grade11_balance_wave87g.mjs
GRADE_FILTER=11 SAMPLE_PER_TOPIC=5 node tools/validate_questions.js
```

The dedicated audit verifies:

- grade 11 has 16 subjects after injection;
- `art` and `oly` are present;
- all 8 wave87g topics exist;
- each topic exposes 15 live-bank rows;
- generated samples have four unique options, answer included and `ex` present;
- old generic facts stems do not leak into the new topics;
- hashed asset references are synchronized in HTML, SW and manifest.
