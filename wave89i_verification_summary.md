# wave89i verification summary

- Wave: `wave89i`
- Date: `2026-04-26`
- Plan item: `#42 Цветовые группы: 5 вместо 15 цветов предметов`
- Release version: `trainer-build-wave89i-2026-04-26`
- Hashed asset count: `101`

## What changed

- Reduced the grade-page subject palette to **5 stable groups** via `chunk_subject_expansion_wave63_quality`, which now normalizes `subject.cl/bg/dot` **before** `engine10.js` renders the main screen.
- Covered the full assembled subject surface, not just base grade shells: injected ids like `read`, `eng`, `orkse`, `odnknr`, `obzh`, `art`, `oly`, and `bridge1011` are grouped too.
- Patched late topic injectors in `chunk_subject_expansion_wave89b_inputs_interactions_banks` so new topics inherit `subject.dot / subject.cl` instead of reintroducing one-off colors.
- Patched `chunk_grade10_lazy_wave86s` so on-demand grade 10 subject chunks also inherit the grouped palette when lazy topics are attached.
- Added `tools/audit_subject_color_groups_wave89i.mjs`, `docs/SUBJECT_COLOR_GROUPS_wave89i.md`, and wired the new audit into both CI workflows.

## Rebuilt assets

- Quality chunk: `assets/js/chunk_subject_expansion_wave63_quality.d20866bc5a.js`
- Merged banks chunk: `assets/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.bbaba018eb.js`
- Grade 10 lazy helper: `assets/js/chunk_grade10_lazy_wave86s.135fbaef2b.js`

## Verification

- `audit_subject_color_groups_wave89i` — ok (`uniquePairCount=5`, `logic=27`, `language=32`, `nature=31`, `society=16`, `creative=5`)
- `audit_subject_color_groups_wave89i` lazy sample — ok (`phy → nature`, `art → creative`)
- `audit_skeleton_loading_wave89h` — ok
- `audit_minimal_footer_wave89g` — ok
- `audit_hamburger_wave89f` — ok
- `audit_onboarding_wave89e` — ok (`pagesChecked=11`)
- `audit_simple_mode_wave89d` — ok (`defaultOn=true`)
- `audit_scripts_budget_wave89c` — ok (`maxScripts=20`)
- `audit_merge_pass_wave89b` — ok (`seniorMaxScripts=19`)
- `audit_performance_wave86z` — ok (`maxGradeJsBytes=1840286`)
- `audit_keyboard_shortcuts_wave88c` — ok
- `audit_breadcrumbs_wave88d` — ok
- `audit_interaction_formats_wave87w` — ok (`interactiveRows=13`)
- `audit_free_input_timing_wave87x` — ok (`englishBlankCount=451`)
- `audit_free_input_banks_wave87y` — ok (`numericRows=76`)
- `audit_text_input_fuzzy_wave87z` — ok (`textTopics=8`)
- `audit_multi_select_wave88b` — ok (`totalRows=48`)
- `audit_daily_question_wave88a` — ok (`poolSize=16`)
- `audit_theory_coverage` — ok (`topics=633`, `fallbackTopics=0`)
- `audit_critical_bugfixes_wave89a` — ok
- `audit_runtime_split_wave87n` — ok
- `cleanup_build_artifacts --check` — ok
- `validate_questions.js` — ok (`samples=3165`, `failures=0`, `loadErrors=0`, `immediateRepeats=18`)

## Notes

- No new eager grade-page asset was added; the change reuses existing grade chunks and keeps the current merged-runtime strategy intact.
- Script-budget and performance guards stayed green after the palette pass.
- The non-blocking validator tail is unchanged: `immediateRepeats=18` remains in older generators outside the wave89i scope.
