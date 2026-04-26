# MINIMAL_FOOTER_wave89g

## Scope

Roadmap item `#40` from the updated 100-improvements plan: simplify the **grade-page main footer / utility block** down to **2 visible quick actions** while keeping the rest of the utility surface reachable through the existing `☰` menu.

## Runtime strategy

No new eager grade-page asset was introduced.

Instead:
- `assets/_src/js/bundle_grade_runtime_extended_wave89b.js` now also carries the `wave89g` minimal-footer runtime;
- `assets/_src/css/wave88d_breadcrumbs.css` now also contains the compact footer styles and the legacy-row hiding rule.

This preserves the wave89b merge-pass and the wave89c 20-script budget.

## UX behavior

On the main screen of every `grade*_v2.html` page:
- the scattered legacy utility rows are condensed into one compact footer card;
- only **two visible buttons** remain on the surface:
  - `📈 Прогресс`
  - `⚙️ Настройки`
- the footer explicitly hints that the rest of the actions live under `☰`.

The old main-screen utility rows are hidden additively through `data-wave89g-footer-legacy="1"` rather than by editing static HTML.

## Hamburger follow-up

To keep the hidden functionality reachable, the hamburger menu now also exposes:
- `📖 Справка`
- `🔁 Ошибки`
- `🏆 Награды`
- `📅 Даты диагностик`

This means the decluttering pass reduces visual noise without deleting any workflow.

## Verification

Run:

```bash
node tools/audit_minimal_footer_wave89g.mjs
node tools/audit_hamburger_wave89f.mjs
node tools/audit_onboarding_wave89e.mjs
node tools/audit_simple_mode_wave89d.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
