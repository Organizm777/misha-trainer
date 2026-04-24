# wave87r direct static bindings

## Что изменилось

- Static HTML больше не использует `data-wave87e-click`.
- Публичные страницы держат только пассивные `data-wave87r-action` markers.
- Реальные `addEventListener(...)` бинды живут в owning bundles:
  - `bundle_grade_runtime_core_wave87n.js`
  - `inline_dashboard_1_wave86u.js`
  - `inline_diagnostic_1_wave86u.js`
  - `inline_tests_3_wave86u.js`
- `chunk_roadmap_wave86u_csp_bridge.js` больше не dispatch'ит static actions и оставлен только для legacy runtime inline handlers.

## Grade pages

Grade runtime core binds all main navigation / result controls directly and preserves lazy hydration through `hydrateForAction(action)` for badges, profile, reports and backup.

## Dashboard / diagnostic / tests

Each page owns свои direct handlers. Для non-button controls (`diagnostic` header back buttons и `tests` launch cards) добавлены keyboard bindings for `Enter` / `Space`.

## Проверка

```bash
node tools/audit_static_events_wave87e.mjs
node tools/audit_runtime_split_wave87n.mjs
node tools/cleanup_build_artifacts.mjs --check
node tools/validate_questions.js
```
