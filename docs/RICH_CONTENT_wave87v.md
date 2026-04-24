# wave87v — rich formulas and code for grades 8–11

This pass closes the practical part of roadmap items `#12` and `#13` without introducing a new rendering layer.
The runtime already supported:

- `prob.code` → multiline `<pre class="qcode">`
- `prob.isMath` → math-style question text styling

## What changed

- Added explicit rich-content topics to grades 8, 9, 10 and 11 for:
  - mathematics / algebra (`formula*w87v`)
  - physics (`calc*w87v`)
  - informatics (`code*w87v`)
- Added chemistry formula/calculation topics across 8–11:
  - grade 8–9 via `chunk_subject_expansion_wave59_physics_chemistry_7_9`
  - grade 10 via `grade10_subject_chem_wave86s`
  - grade 11 via `chunk_subject_expansion_wave61_senior_school_10_11`

## Design notes

- No page-level script count increase.
- Grade 10 keeps lazy subject loading for the new algebra/physics/informatics/chemistry rich topics.
- Grade 8/9/11 topics are appended inside their existing content bundles.
- Each new topic uses explicit `{q,a,o,h,ex}` rows instead of generic fact→generator fallback.
- Formula-heavy rows mark `isMath:true`; code-tracing rows pass multiline `code` snippets.

## Verification

Run:

```bash
node tools/audit_rich_content_wave87v.mjs
GRADE_FILTER=8,9,10,11 SAMPLE_PER_TOPIC=6 node tools/validate_questions.js
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
