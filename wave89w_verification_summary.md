# wave89w verification summary

Релиз: `wave89w`  
Дата: `2026-04-27`

## Исправлено
- Lighthouse workflow больше не триггерится на `push` и не должен слать обычные push-email как lighthouse failure.
- LHCI URLs переведены на `?lhci=1`, service worker пропускается в webdriver/LHCI-сеансах.
- `sw.js` переведён на network-first для HTML/document navigation и bypass для `cache:'no-store'` / `/sw.js`.
- Free-input runtime больше не считает `window.sel === undefined` признаком уже выбранного ответа.
- Авто-переключение в input-mode теперь приоритетно ориентируется на grade страницы, а не на stray `question.grade`.
- Добавлен render-level regression audit для editable senior input / suppressed junior input.

## Прогнаны проверки
- `node --check assets/_src/js/engine10.js`
- `node --check assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js`
- `node --check assets/_src/js/bundle_grade_runtime_extended_wave89b.js`
- `node --check assets/_src/js/inline_dashboard_1_wave86u.js`
- `node --check assets/_src/js/inline_index_1_wave86u.js`
- `node --check assets/_src/js/inline_diagnostic_2_wave86u.js`
- `node --check assets/_src/js/inline_spec_subjects_1_wave86u.js`
- `node --check assets/_src/js/inline_tests_2_wave86u.js`
- `node tools/audit_input_bridge_wave89v.mjs`
- `node tools/audit_input_render_wave89w.mjs`
- `node tools/audit_lighthouse_ci_wave87s.mjs`
- `node tools/audit_offline_readiness_wave86y.mjs`
- `node tools/audit_play_selection_wave89t.mjs`
- `node tools/audit_diagnostic_exam_bindings_wave89u.mjs`
- `node tools/audit_static_events_wave87e.mjs`
- `node tools/audit_style_csp_wave87q.mjs`
- `node tools/audit_self_host_fonts_wave89p.mjs`
- `node tools/audit_theory_coverage.mjs`
- `node tools/audit_scripts_budget_wave89c.mjs`
- `node tools/audit_critical_bugfixes_wave89a.mjs`
- `node tools/audit_exam_bank_generator_wave89q.mjs`
- `node tools/validate_questions.js`
- `node tools/cleanup_build_artifacts.mjs --check`

## Что проверено дополнительно
- VM check: `grade=2` + numeric high-grade row => `inputModeFor(...) === ''`
- VM check: `grade=2` + explicit `inputMode:'text'` => explicit mode preserved
- VM check: `grade=10` + numeric low-grade row => `inputModeFor(...) === 'numeric'`
- render audit: senior free-input exists and `disabled === false` before answer
- render audit: answered senior free-input exists and `disabled === true` after answer

## Честное ограничение
Не выполнялся live click-through по опубликованному GitHub Pages и не проверялась реальная GitHub email delivery из Actions. Это локальная сборка + статические/VM regression audits.
