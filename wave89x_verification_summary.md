# wave89x verification summary

## Scope

- lazy-load optional senior input/interactions bank on grades 8–11
- restore `tools/audit_performance_wave86z.mjs` to green
- hard-gate the new lazy-loader wiring in `validate-questions.yml`

## Key results

- `grade8_v2.html`, `grade9_v2.html`, `grade10_v2.html`, `grade11_v2.html` no longer eagerly include `chunk_subject_expansion_wave89b_inputs_interactions_banks.*.js`
- merged runtime exposes `window.__wave89xOptionalInputBanks`
- performance proxy summary after rebuild:
  - `maxGradeScripts`: 20
  - `maxGradeJsBytes`: 1824409
- representative grade pages:
  - `grade8_v2.html`: 18 scripts, 1824409 bytes local eager JS
  - `grade10_v2.html`: 17 scripts, 1575869 bytes local eager JS
  - `grade11_v2.html`: 17 scripts, 1808884 bytes local eager JS

## Commands run

- `node --check assets/_src/js/bundle_grade_runtime_extended_wave89b.js`
- `node --check assets/js/bundle_grade_runtime_extended_wave89b.f740e8fed5.js`
- `node tools/audit_optional_input_banks_wave89x.mjs`
- `node tools/audit_performance_wave86z.mjs`
- `node tools/audit_scripts_budget_wave89c.mjs`
- `node tools/audit_input_bridge_wave89v.mjs`
- `node tools/audit_input_render_wave89w.mjs`
- `node tools/audit_play_selection_wave89t.mjs`
- `node tools/audit_lighthouse_ci_wave87s.mjs`
- `node tools/audit_critical_bugfixes_wave89a.mjs`
- `node tools/audit_self_host_fonts_wave89p.mjs`
- `node tools/audit_diagnostic_exam_bindings_wave89u.mjs`
- `node tools/audit_theory_coverage.mjs`
- `node tools/audit_offline_readiness_wave86y.mjs`
- `node tools/audit_style_csp_wave87q.mjs`
- `node tools/validate_questions.js`
- `node tools/cleanup_build_artifacts.mjs --check`

## Honesty note

No live GitHub Pages click-through or real headless Lighthouse browser run was executed in this pass. Verification here is local: rebuild + static/regression audits.
