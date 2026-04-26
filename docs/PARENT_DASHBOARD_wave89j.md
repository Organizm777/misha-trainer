# wave89j — parent dashboard mode

Roadmap item: `#43 Режим родителя: оптимизированный dashboard`.

Этот документ описывает новый **режим родителя** для `dashboard.html`.

## What changed

- `dashboard.html` now exposes a dedicated parent surface at the top of the page:
  - `#wave89j-parent-toolbar`
  - `#wave89j-parent-summary`
- The dashboard has two persisted modes:
  - `parent` (default) — compact summary with recommendations and advanced analytics hidden
  - `full` — existing detailed analytics stay visible
- A persisted class filter lets the parent switch between:
  - all classes
  - a single class (`1` … `11`)
- The active filter now drives:
  - hero/stats totals
  - activity strip
  - weak-topic list
  - analytics renderers
  - TXT/CSV/PNG exports via `window.__dashboardActiveState`

## Storage keys

- `trainer_dashboard_mode_wave89j_v1`
- `trainer_dashboard_grade_filter_wave89j_v1`
- `trainer_dashboard_active_state_wave89j_v1`

## Rendering contract

- `inline_dashboard_1_wave86u.js` now exposes:
  - `window.__dashboardComposeState(baseState, gradeFilter)`
  - `window.__dashboardRenderCore(baseState, { gradeFilter, viewState })`
  - `window.__dashboardGetActiveState()`
- `bundle_dashboard_tools.js` now exposes:
  - `window.__dashboardEnsureAnalytics(state)`
  - `window.__dashboardRenderAnalytics(state)`
  - `window.__wave89jParentDashboard`

## UX rules

- Default dashboard mode is compact `parent` mode.
- Advanced analytics blocks (`insights`, `heatmap`, `radar`, `trend`, `subject breakdown`) are tagged with `data-wave89j-advanced="1"` and hidden only through CSS when compact mode is active.
- Class cards remain visible and navigable even when the filter is narrowed to one class.
- The compact summary must answer three parent questions fast:
  - what matters now
  - what to do next
  - where the learner is slipping

## Validation

Run before shipping:

```bash
node tools/audit_parent_dashboard_wave89j.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
