# wave89p — self-host fonts + theory coverage CI gate

## Что сделано

### 1) Self-host fonts (`#4`)

- Добавлен локальный пакет шрифтов в `assets/fonts/`:
  - `Unbounded`
  - `Golos Text`
  - `JetBrains Mono`
- Создан общий локальный stylesheet: `assets/_src/css/wave89p_self_host_fonts.css`.
- Все публичные страницы (`index`, `dashboard`, `diagnostic`, `tests`, `spec_subjects`, `grade1–11`) переведены с Google Fonts на same-origin CSS/WOFF2.
- Из HTML и CSP удалены `fonts.googleapis.com` / `fonts.gstatic.com`.
- Service worker больше не делает отдельный runtime-path для внешних font-hosts и работает только с same-origin ассетами.
- `tools/sync_release_metadata.mjs` расширен: локальные `assets/fonts/*.woff2` теперь попадают в SW precache.

### 2) Theory coverage CI gate (`#5`)

- Уже существующий `tools/audit_theory_coverage.mjs` поднят до обязательного CI gate.
- Оба workflow теперь запускают:
  - `node tools/audit_self_host_fonts_wave89p.mjs`
  - `node tools/audit_theory_coverage.mjs`
- Добавлен регрессионный аудит `tools/audit_self_host_fonts_wave89p.mjs`, который проверяет:
  - что все публичные страницы используют локальный font stylesheet,
  - что Google Fonts отсутствуют в HTML/CSP/SW,
  - что SW precache включает локальные font files.

## Ключевые файлы

- `assets/fonts/*`
- `assets/_src/css/wave89p_self_host_fonts.css`
- `tools/audit_self_host_fonts_wave89p.mjs`
- `tools/sync_release_metadata.mjs`
- `.github/workflows/validate-questions.yml`
- `.github/workflows/lighthouse-budget.yml`
- `tools/audit_lighthouse_ci_wave87s.mjs`

## Проверка

Рекомендуемый набор:

```bash
node tools/audit_self_host_fonts_wave89p.mjs
node tools/audit_theory_coverage.mjs
node tools/audit_offline_readiness_wave86y.mjs
node tools/audit_style_csp_wave87q.mjs
node tools/audit_lighthouse_ci_wave87s.mjs
node tools/cleanup_build_artifacts.mjs --check
```
