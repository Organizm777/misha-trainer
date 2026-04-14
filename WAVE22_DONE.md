# Wave 22 — dashboard / analytics 2.0

## Что сделано

### 1) Dashboard 2.0
- в `dashboard.html` добавлены новые аналитические блоки:
  - `#wave22-insights`
  - `#wave22-heatmap`
  - `#wave22-radar`
  - `#wave22-trend`
  - `#wave22-subjects`
- добавлены новые action-кнопки:
  - `📝 TXT-сводка`
  - `📥 CSV-экспорт`
  - `🖼 PNG-карточка`
  - `🖨 Печать / PDF`

### 2) Новый слой `wave22_dashboard.js`
- строит analytics state поверх `window._dashboardState`
- считает:
  - предметную агрегацию по `trainer_progress_*`
  - started/strong/weak topics
  - 30-дневную активность
  - недельные buckets (12 недель)
  - месячные buckets (6 месяцев)
- рендерит:
  - insight cards
  - GitHub-style heatmap на 26 недель
  - radar chart по top-8 предметам
  - weekly trend chart (объём + точность)
  - subject breakdown cards
- добавляет глобальные export-функции:
  - `downloadDashboardCSV()`
  - `downloadDashboardPNG()`

### 3) История активности расширена
- в `engine10.js` хранение activity увеличено с `90` до `365` дней:
  - `saveActivity()` → `slice(-365)`
  - `applyBackupSnapshot()` → `slice(-365)`
- это даёт реальную базу под длинную heatmap и тренды

### 4) SW и offline
- `sw.js` обновлён до `trainer-v19`
- в precache добавлен `wave22_dashboard.js`

### 5) Проверки и аудит
- добавлен `wave22_dashboard_audit.js`
- генерируются артефакты:
  - `WAVE22_DASHBOARD_AUDIT.md`
  - `WAVE22_DASHBOARD_AUDIT.json`
- `browser_e2e_smoke.py` расширен сценарием `dashboard.html: analytics 2.0`
- `validate_release.py` получил:
  - `check_wave22_hooks()`
  - `check_wave22_dashboard_audit()`
  - `check_wave22_dashboard_guards()`

## Что проверено
- browser E2E: `dashboard.html: analytics 2.0` → OK
- heatmap cells: `182`
- subject cards: `7`
- chart SVG: `2`
- CSV export function: OK
- PNG export function: OK
- wave22 dashboard audit: placeholders `5/5`, actions `4/4`, hooks `6/6`
- flow smoke: OK
- runtime smoke: OK
- curriculum / coverage / English / theory / rush guards: OK

## Замечания
- heatmap сейчас показывает `26 недель`, а не `365` отдельных дней в GitHub-сетке — это осознанный mobile-friendly формат
- PNG-экспорт реализован как canvas summary-card, а не снимок DOM-дерева; для родителя это надёжнее и оффлайн-совместимее
