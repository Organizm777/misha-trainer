# wave89k — adaptive UI for weak devices

Roadmap item: `#44 Адаптив для слабых устройств: min-font 16px, min-tap 48px`.

This pass keeps the **existing grade-page asset graph** intact while making the UI easier to read and tap on smaller / weaker devices.

## What changed

- No new eager grade-page asset was introduced. The existing merged runtime `bundle_grade_runtime_extended_wave89b` now detects weak-device hints and toggles these classes on grade pages:
  - `wave89k-weak-ui`
  - `wave89k-coarse`
  - `wave89k-compact`
  - `wave89k-reduced-motion`
- Detection combines several cheap signals:
  - coarse pointer / touch
  - compact viewport
  - `navigator.deviceMemory <= 4`
  - `navigator.hardwareConcurrency <= 4`
  - `navigator.connection.saveData`
  - `prefers-reduced-motion: reduce`
- The shared grade CSS asset `wave88d_breadcrumbs.*.css` now also carries the wave89k adaptive layer, which:
  - raises core controls to **48px+ tap targets**
  - raises core readable copy / inputs to **16px**
  - enlarges subject cards, topic rows, search controls and overlays
  - removes expensive blur-heavy surfaces when weak-device mode is active
  - disables extra motion when the reduced-motion signal is present

## UX contract

- Works on `grade1_v2.html` … `grade11_v2.html` because they already load the merged runtime and shared grade CSS.
- Utility pages (`index`, `dashboard`, `diagnostic`, `tests`, `spec_subjects`) stay untouched.
- Script budget does not change because no new script tag is added.

## Validation

Run before shipping:

```bash
node tools/audit_weak_device_adaptive_wave89k.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_parent_dashboard_wave89j.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
