# wave87t fact review

Roadmap item `#17` moves from ad-hoc spot checks to a deterministic first-pass audit. This wave does not claim a full manual review of all question banks; instead it combines source guards, broad sampling and targeted probes so obvious content regressions fail early.

## Fixed issues

- Grade 1 Russian phonetics: the question about `Е/Ё/Ю/Я` is now scoped to the **beginning of the word**, which is the context where these letters can denote two sounds.
- Grade 4 speed generators now use integer-friendly `(distance, time)` / `(speed, distance)` pairs so visible answers do not spill into `3.3333333333333335 ч`-style decimals.
- Roman history wording is refined in two places: the Senate is no longer called a generic `выборный орган`, and the Republic prompt now speaks about the Senate plus elected magistrates.
- Grade 6 hydro booster now answers the prompt `Как называется круговорот воды в природе?` with the term itself (`круговорот воды`) instead of a list of process stages.
- Grade 11 `source11_wave87j` is fully localized: the Russian history-source bank no longer emits English answer labels such as `historical context` or `limitation`.

## Audit command

```bash
node tools/audit_fact_review_wave87t.mjs
```

Optional knobs:

```bash
SAMPLE_PER_GRADE=80 TARGET_RUNS=80 node tools/audit_fact_review_wave87t.mjs
```

## What the audit checks

1. **Round-robin sampling:** 50 generated prompts per grade so each class gets a broad first-pass slice.
2. **Heuristics:**
   - Latin-only answer labels outside English/Informatics
   - descriptive/list-like answers to `Как называется ...`
   - long decimal outputs in primary grades
   - the old broad `Е/Ё/Ю/Я` stem
3. **Source guards:** fixed strings stay fixed in the touched source files.
4. **Targeted probes:** repeated runtime sampling for the corrected grade4 speed, grade6 hydro and grade11 history-source topics.

## Release flow

After touching the related source assets:

```bash
node tools/rebuild_hashed_assets.mjs <touched files...>
node tools/audit_fact_review_wave87t.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
