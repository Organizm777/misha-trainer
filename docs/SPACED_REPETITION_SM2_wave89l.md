# wave89l — spaced repetition (SM-2)

Roadmap item: `#45 Spaced repetition (SM-2): алгоритм повторения`.

This pass upgrades the grade-page review / mistake journal from a fixed `[1, 3, 7, 14, 30]` ladder to a real **SM-2-style scheduler** while keeping the existing grade-page asset graph intact.

## What changed

- No new eager grade-page asset was introduced. The existing core runtime `bundle_grade_runtime_core_wave87n` now carries the `wave89l` review engine.
- The persisted review store stays under the same per-grade key pattern:
  - `trainer_review_<grade>`
- The storage shape is upgraded to:

```json
{
  "version": 2,
  "algo": "sm2",
  "items": {
    "...": {
      "repetitions": 2,
      "step": 2,
      "intervalDays": 6,
      "ef": 2.38,
      "lapses": 1,
      "sticky": false
    }
  }
}
```

## Scheduling contract

- A fresh lapse still produces a **1-day** repeat.
- The first confident success keeps the card at **1 day**.
- The second confident success moves the card to **6 days**.
- After that, the interval grows by the card’s **EF** (ease factor):
  - `1 день → 6 дней → дальше по EF`
- Hinted / helped answers are treated gently:
  - they reset the card to a quick repeat,
  - use a softer grade (`quality = 3`),
  - and avoid inflating EF.

## Compatibility rules

- Legacy fixed-step review data is migrated in place when loaded.
- `step` still mirrors `repetitions` so existing backup / sharing / report layers remain compatible.
- Sticky cards are no longer permanent: repeated lapses still mark a card as sticky, but **two confident answers in a row** can release it again.
- Grade pages continue to expose the same high-level actions:
  - `startDueReview()`
  - `startStickyReview()`
  - `startSpacedReview()`

## UI changes

- Main review card, progress card and mistake journal now label the system as **SM-2**.
- Review summaries now include:
  - cards due today,
  - cards due within the next week,
  - sticky cards,
  - mastered cards,
  - average EF.
- Review session meta now shows the current card EF and a preview of the next interval after a correct answer.

## Validation

Run before shipping:

```bash
node tools/audit_spaced_repetition_sm2_wave89l.mjs
node tools/audit_weak_device_adaptive_wave89k.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
