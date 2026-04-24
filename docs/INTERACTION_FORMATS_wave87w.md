# wave87w — interactive question formats for grades 8–11

This pass closes the first practical slice of roadmap item `#14`.
Instead of changing the base `engine10` renderer, wave87w adds a thin runtime patch plus new explicit-bank rows that opt into richer interaction modes.

## What changed

- Added a new runtime bundle: `bundle_grade_runtime_interactions_wave87w`.
- Grades 8, 9, 10 and 11 now eagerly load that bundle after `bundle_grade_runtime_core_wave87n`.
- Existing rich topics from wave87v now contain interactive rows with three formats:
  - `find-error`
  - `sequence`
  - `match`

## Design notes

- The base engine is left intact: scoring, streaks, exam mode, error journal and explanations still flow through the existing `ans()` / `render()` logic.
- Interactive rows stay in the same explicit-bank shape as normal questions and only add metadata fields like:
  - `interactionType`
  - `errorSteps`
  - `sequenceItems` / `sequencePool`
  - `matchPairs` / `matchOptions`
- Grade 10 keeps lazy subject loading; the new interaction rows live inside its existing subject chunks.
- Rush mode rerolls heavy interaction types (`sequence`, `match`) so the speed flow stays lightweight.

## Coverage

- grade 8: algebra / physics / informatics
- grade 9: algebra / physics / informatics
- grade 10: algebra / physics / informatics / chemistry
- grade 11: algebra / physics / informatics

## Verification

Run:

```bash
node tools/audit_interaction_formats_wave87w.mjs
GRADE_FILTER=8,9,10,11 SAMPLE_PER_TOPIC=6 node tools/validate_questions.js
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
