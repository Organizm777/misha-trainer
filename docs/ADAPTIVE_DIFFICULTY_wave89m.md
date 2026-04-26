# wave89m — adaptive difficulty

Roadmap item: `#46 Adaptive difficulty: если 5 верных подряд → усложнить`.

This pass adds an **adaptive-difficulty layer** on top of the existing merged grade-page runtime without introducing a new eager script tag.

## What changed

- No new eager grade-page asset was introduced. The existing merged runtime `bundle_grade_runtime_extended_wave89b` now also carries the `wave89m` adaptive selector.
- The runtime persists a per-grade adaptive store under:
  - `trainer_adaptive_difficulty_<grade>`
- The adaptive profile is tracked **per subject/topic context** and keeps:
  - asked / correct / wrong / helped counts
  - recent answer streaks
  - average and last response time
  - per-bucket stats for levels `1–3`
  - current baseline difficulty level for the topic
- The layer reuses the existing difficulty metadata that is already stamped into questions by the quality pass:
  - `difficulty`
  - `diffBucket`
  - `diffScore`
  - `difficultyLevel`

## Selection contract

The engine now nudges the target difficulty by **one step** during a session:

- after **5 confident correct answers in a row** → raise the target by one step
- after **2 mistakes in a row** → lower the target by one step
- after **3 slow answers in a row** → lower the target by one step
- helped / hint-assisted answers do not accelerate promotion and can contribute to a temporary downgrade

This session shift is then combined with the topic baseline. The baseline itself is derived from:

- recent accuracy for the current topic
- historical `wave87x` **время ответа** samples from `trainer_response_timing_<grade>`
- how well the learner already handles medium / hard buckets for that topic

## UI changes

- On the play screen the learner now sees a compact `🎚 Адаптивная сложность` card with:
  - current target level
  - actual level of the shown question
  - answer streak
  - explanatory reason when the engine just raised or lowered the target
- On the progress screen the learner now gets an adaptive summary card with:
  - tracked topic count
  - how many topics currently sit at levels `1`, `2`, `3`
  - the most recently updated adaptive topic profiles with accuracy and response-time context

## Scope guards

Adaptive selection intentionally delegates to the existing engine instead of taking control in these modes:

- rush / lightning mode
- diagnostic mode
- queued review / error-review sessions
- SM-2 review sessions

## Validation

Run before shipping:

```bash
node tools/audit_adaptive_difficulty_wave89m.mjs
node tools/audit_spaced_repetition_sm2_wave89l.mjs
node tools/audit_weak_device_adaptive_wave89k.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
