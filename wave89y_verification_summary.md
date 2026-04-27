# wave89y verification summary

## Scope

- fixed the real GitHub email regression: `Validate question banks` failing because `lighthouse-budget.yml` no longer satisfied the cross-workflow assertions embedded in the existing wave89e→wave89n audits
- restored the missing advisory audits in the Lighthouse workflow
- added an explicit workflow-parity preflight audit so the same class of regression fails early and clearly next time
- bumped `actions/checkout` + `actions/setup-node` to `@v5` in both workflows

## Root cause reproduced locally

The failing command was:

- `node tools/audit_onboarding_wave89e.mjs`

with the assertion:

- `lighthouse workflow should run the onboarding audit`

That was only the first failure in a series; the same mismatch affected the other wave89f→wave89n cross-workflow audits too.

## Commands run

- `node tools/audit_workflow_parity_wave89y.mjs`
- `node tools/cleanup_build_artifacts.mjs --check`
- `node tools/audit_critical_bugfixes_wave89a.mjs`
- `node tools/audit_scripts_budget_wave89c.mjs`
- `node tools/audit_simple_mode_wave89d.mjs`
- `node tools/audit_onboarding_wave89e.mjs`
- `node tools/audit_hamburger_wave89f.mjs`
- `node tools/audit_minimal_footer_wave89g.mjs`
- `node tools/audit_skeleton_loading_wave89h.mjs`
- `node tools/audit_subject_color_groups_wave89i.mjs`
- `node tools/audit_parent_dashboard_wave89j.mjs`
- `node tools/audit_weak_device_adaptive_wave89k.mjs`
- `node tools/audit_spaced_repetition_sm2_wave89l.mjs`
- `node tools/audit_adaptive_difficulty_wave89m.mjs`
- `node tools/audit_learning_path_wave89n.mjs`
- `node tools/audit_exam_bank_generator_wave89q.mjs`
- `node tools/audit_self_host_fonts_wave89p.mjs`
- `node tools/audit_theory_coverage.mjs`
- `node tools/audit_play_selection_wave89t.mjs`
- `node tools/audit_input_bridge_wave89v.mjs`
- `node tools/audit_input_render_wave89w.mjs`
- `node tools/audit_optional_input_banks_wave89x.mjs`
- `node tools/audit_performance_wave86z.mjs`
- `node tools/audit_lighthouse_ci_wave87s.mjs`
- `node tools/audit_diagnostic_exam_bindings_wave89u.mjs`
- `node tools/validate_questions.js`

## Key results

- `audit_workflow_parity_wave89y` — OK
- full validate audit chain — OK locally
- `audit_performance_wave86z` remains green with `maxGradeJsBytes=1824519` and budget `1900000`
- `validate_questions.js` — OK, `failures=0`, `loadErrors=0`

## Honesty note

No live GitHub Actions rerun was executed from this environment. Verification here is local: workflow file repair + full audit chain reproduction.
