# wave89t — desktop play selection fix

## Scope

This pass addresses the regression the user reported in the desktop browser build: quiz answers on grade pages could be rendered but were not reliably clickable/selectable on PC Chromium/Edge.

The failure path was concentrated in the dynamic play screen produced by `engine10`.

## Root cause

`engine10` rendered quiz answer buttons and the play-screen helper controls (`Подсказка`, `Шпаргалка`, `Следующий`) through `innerHTML` with legacy inline handlers:

- `onclick="ans(${a})"`
- `onclick="wave86uToggleHint()"`
- `onclick="wave86uToggleShp()"`
- `onclick="nextQ()"`

The project already contains strict-CSP bridges for older markup, but relying on dynamic inline handler scrubbing at this point in the play flow is fragile. On desktop Chromium/Edge, that path could leave the quiz options visually present but inert.

## What changed

### 1) engine10 render path

Updated `assets/_src/js/engine10.js` so the dynamic play controls are rendered with explicit data attributes instead of inline JavaScript:

- answer buttons now use `data-wave89t-play-action="answer"`
- answer index is stored in `data-wave89t-answer-index`
- next button uses `data-wave89t-play-action="next"`
- hint button uses `data-wave89t-play-action="hint"`
- theory/shpargalka button uses `data-wave89t-play-action="shp"`

### 2) Delegated runtime binding

Added a document-level delegated click bridge in `engine10`:

- locates the nearest node with `data-wave89t-play-action`
- routes actions to the already existing quiz APIs:
  - `ans(index)`
  - `nextQ()`
  - `wave86uToggleHint()`
  - `wave86uToggleShp()`
- exposes `window.wave89tPlayBinding` for diagnostics / audit visibility
- marks successful binding with `document.__wave89tPlayControlsBound`

This makes desktop behavior independent from the older inline-handler CSP compatibility path.

### 3) Audit / CI hardening

Added `tools/audit_play_selection_wave89t.mjs`.

It verifies that:

- source and hashed runtime `engine10` contain the new `data-wave89t-*` markers
- source and built assets export `window.wave89tPlayBinding`
- legacy inline play-control snippets are absent from both source and built engine assets

The new audit is now required in both GitHub workflows:

- `.github/workflows/lighthouse-budget.yml`
- `.github/workflows/validate-questions.yml`

### 4) Rebuilds and metadata

Rebuilt the hashed engine asset and synced release metadata:

- old engine asset: `assets/js/engine10.90815e0ece.js`
- new engine asset: `assets/js/engine10.5b67e7e188.js`
- release wave: `wave89t`
- release version: `trainer-build-wave89t-2026-04-26`

## Verification

Executed successfully:

- `node --check assets/_src/js/engine10.js`
- `node tools/audit_play_selection_wave89t.mjs`
- `node tools/audit_static_events_wave87e.mjs`
- `node tools/audit_lighthouse_ci_wave87s.mjs`
- `node tools/audit_scripts_budget_wave89c.mjs`
- `node tools/audit_style_csp_wave87q.mjs`
- `node tools/audit_offline_readiness_wave86y.mjs`
- `node tools/audit_self_host_fonts_wave89p.mjs`
- `node tools/audit_critical_bugfixes_wave89a.mjs`
- `node tools/audit_theory_coverage.mjs`
- `node tools/cleanup_build_artifacts.mjs --check`

## Notes

This pass specifically hardens the quiz play screen on desktop browsers. It does not change the question bank itself, scoring logic, or exam-bank generation; it only removes the fragile inline-click dependency for dynamic answer selection and related play controls.
