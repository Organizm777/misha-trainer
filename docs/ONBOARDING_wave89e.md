# ONBOARDING_wave89e

## Scope

Roadmap item `#38` from the updated 100-improvements plan: add a **3-step onboarding overlay** for grade pages so first-time learners understand the shortest happy path through the trainer.

## Runtime strategy

No new eager asset was introduced.

Instead:
- `assets/_src/js/bundle_grade_runtime_extended_wave89b.js` now also carries the `wave89e` onboarding runtime;
- `assets/_src/css/wave88d_breadcrumbs.css` now also contains the overlay / highlight styles for the quick tour.

This preserves the wave89b merge-pass and the wave89c script-budget ceiling while adding the onboarding flow inside the already-merged grade-page runtime.

## Persistence

- storage key: `trainer_onboarding_wave89e_v1`
- values: `done` / `skipped`
- auto-open only for fresh learners without meaningful local progress
- manual reopen entry: `⚙️ Настройки → 👋 Быстрый тур`

## Tour flow

The onboarding runs in **3 steps**:
1. **Choose a subject** on the main screen.
2. **Read theory first** — the runtime opens a real topic in theory mode and highlights the `✏️ Начать тренажёр` CTA.
3. **Use `▶ Заниматься`** for smart-start; the final step also explains that advanced scenarios can be restored by disabling simple mode in settings.

The tour is additive:
- it does not rewrite `engine10`
- it does not create new grade-page script tags
- it blocks background scrolling while open
- it highlights the current target with a non-inline CSS ring
- it can be dismissed with `Пропустить`, `Escape`, or finished with `Готово`

## Manual reopen / guardrails

- the settings modal now includes `👋 Быстрый тур`
- the tour refuses to open while the learner is inside an active play/result flow
- auto-open is skipped for returning users that already have solved questions, a saved topic, journal rows, or a session snapshot

## Verification

Run:

```bash
node tools/audit_onboarding_wave89e.mjs
node tools/audit_simple_mode_wave89d.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_merge_pass_wave89b.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
