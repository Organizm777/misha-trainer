# wave89k verification summary

## Release

- wave: `wave89k`
- version: `trainer-build-wave89k-2026-04-26`
- generated_at_utc: `2026-04-26T00:00:00Z`
- hashed_asset_count: `101`

## Scope

Roadmap item `#44`: adaptive weak-device UI.

Implemented without adding a new eager grade-page script tag:

- rebuilt runtime: `assets/js/bundle_grade_runtime_extended_wave89b.b59d2c38d8.js`
- rebuilt shared grade CSS: `assets/css/wave88d_breadcrumbs.499ce33258.css`
- new audit: `tools/audit_weak_device_adaptive_wave89k.mjs`
- new doc: `docs/WEAK_DEVICE_ADAPTIVE_wave89k.md`

Wave89k runtime now detects these state classes on grade pages:

- `wave89k-weak-ui`
- `wave89k-coarse`
- `wave89k-compact`
- `wave89k-reduced-motion`

## wave89k audit

```json
{
  "ok": true,
  "wave": "wave89k",
  "hashedAssetCount": 101,
  "gradePages": 11,
  "weakState": {
    "enabled": true,
    "coarse": true,
    "compact": true,
    "lowMemory": true,
    "lowCpu": true,
    "saveData": true,
    "reducedMotion": false,
    "viewportWidth": 390,
    "viewportHeight": 780
  },
  "desktopState": {
    "enabled": false,
    "coarse": false,
    "compact": false,
    "lowMemory": false,
    "lowCpu": false,
    "saveData": false,
    "reducedMotion": false,
    "viewportWidth": 1366,
    "viewportHeight": 900
  },
  "reducedState": {
    "enabled": true,
    "coarse": false,
    "compact": false,
    "lowMemory": false,
    "lowCpu": false,
    "saveData": false,
    "reducedMotion": true,
    "viewportWidth": 1024,
    "viewportHeight": 768
  }
}
```

## Core regression checks

- `audit_scripts_budget_wave89c`: ok, maxScripts=`20`
- `audit_parent_dashboard_wave89j`: ok, filters tested=`all, 10`
- `audit_minimal_footer_wave89g`: ok, footer buttons=`go-prog, show-about`
- `audit_performance_wave86z`: ok, maxGradeJsBytes=`1846484`
- `audit_theory_coverage`: ok, topics=`633`, fallbackTopics=`0`
- `validate_questions.js`: ok=`True`, samples=`3165`, failures=`0`, loadErrors=`0`
- `cleanup_build_artifacts --check`: no orphan manifest assets found

## Honest non-blocking note

`validate_questions.js` still reports `immediateRepeats=18` in legacy generators outside the wave89k scope.

## Changed source files

- `assets/_src/js/bundle_grade_runtime_extended_wave89b.js`
- `assets/_src/css/wave88d_breadcrumbs.css`
- `tools/audit_weak_device_adaptive_wave89k.mjs`
- `docs/WEAK_DEVICE_ADAPTIVE_wave89k.md`
- `.github/workflows/validate-questions.yml`
- `.github/workflows/lighthouse-budget.yml`
- `CHANGELOG.md`
- `CLAUDE.md`
- `tools/README.md`
