# HAMBURGER_MENU_wave89f

## Scope

Roadmap item `#39` from the updated 100-improvements plan: add a compact **hamburger menu `☰`** on grade pages and move secondary actions (`profile/rating/backup/sync/export`) out of the main learning surface.

## Runtime strategy

No new eager grade-page asset was introduced.

Instead:
- `assets/_src/js/bundle_grade_runtime_extended_wave89b.js` now also carries the `wave89f` hamburger-menu runtime;
- `assets/_src/css/wave88d_breadcrumbs.css` now also styles the menu trigger, overlay, panel, and relocated-action hiding rules.

This preserves the wave89b merge-pass and the wave89c 20-script budget.

## What moved into the menu

The header now gets a `☰` trigger on every `grade*_v2.html` page. The menu groups secondary actions into one place:

- **Аккаунт**: profile and, outside simple mode, the rush rating
- **Отчёты и экспорт**: parent report, progress sharing, CSV export, JSON export
- **Данные**: backup and, outside simple mode, cloud sync
- **Система**: settings and class picker

Legacy visible buttons are now marked with `data-wave89f-relocated="1"` and hidden through shared CSS instead of inline styling. Empty legacy rows are collapsed via `data-wave89f-empty-row="1"`.

## Interaction details

- the menu closes on backdrop click or `Escape`
- opening a secondary action from an active play session first confirms and then finalizes the session via `endSession()`
- sync still uses `wave86wCloudSync.open()` and export still uses `wave86nProgressTools.exportParentProgress(...)`; the UI surface moved, not the underlying logic
- simple mode keeps rating/sync out of the menu as well, so the simplified UX remains consistent

## Verification

Run:

```bash
node tools/audit_hamburger_wave89f.mjs
node tools/audit_onboarding_wave89e.mjs
node tools/audit_simple_mode_wave89d.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_merge_pass_wave89b.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
