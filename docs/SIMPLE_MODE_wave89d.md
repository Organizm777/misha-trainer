# SIMPLE_MODE_wave89d

## Scope

Roadmap items `#36` and `#37` from the updated 100-improvements plan: add a **simple mode** for grade pages, default **ON**, and turn the main practice CTA into a **smart-start** flow so the app hides advanced scenarios and leads the learner straight into the next useful trainer step.

## Runtime strategy

No new eager asset was introduced.

Instead:
- `assets/_src/js/bundle_grade_runtime_extended_wave89b.js` now carries the `wave89d` simple-mode gate;
- `assets/_src/css/wave88d_breadcrumbs.css` now also contains the `.simple-mode` visibility rules and the settings modal styles.

This keeps the wave89b merge-pass and wave89c script-budget work intact while extending the existing merged runtime with the smart-start planner.

## Persistence

- storage key: `trainer_simple_mode_v1`
- default for fresh installs: `on`
- DOM markers: `html.simple-mode`, `body.simple-mode`

## UX behavior

When simple mode is enabled:
- hides PvP card
- hides weekly / exam / leaderboard card
- hides cloud sync entry points
- hides hall-of-fame sync / leaderboard actions
- blocks the same advanced actions at the function/API level
- converts the mixed-practice CTA into direct `▶ Заниматься`
- opens `⚙️ Настройки` from the former `ℹ️ О проекте` button

The `▶ Заниматься` CTA now resolves the next step in this order:
1. due review errors for today
2. sticky review errors
3. weak-topics training
4. resume an unfinished session
5. continue the last topic
6. open a fresh untouched topic in `train` mode
7. fall back to the regular global mix

The settings modal still lets the user:
- toggle simple mode on/off
- open `📖 Справка`
- open the legacy `ℹ️ О проекте` dialog

## Verification

Run:

```bash
node tools/audit_simple_mode_wave89d.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_merge_pass_wave89b.mjs
node tools/audit_theory_coverage.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
