# Wave 17 — English infrastructure

## Что сделано

### 1) Общая English infrastructure для grade2–11
- Добавлен `wave17_english_infra.js`.
- Подключён ко всем `grade2_v2.html` … `grade11_v2.html`.
- Добавлены общие ENG-шпаргалки:
  - `Неправильные глаголы`
  - `Словообразование`
  - `Фразовые глаголы`
  - `Артикли: decision tree`
- Внутри предмета `Английский` появился отдельный toolbar с быстрым доступом к этим шпаргалкам.

### 2) English level в профиле и прогрессе
- Добавлен расчёт `English level` по данным `localStorage` всех классов `2–11`.
- Уровни: `Starter → A1 → A2 → B1 → B2 → C1`.
- Метрика встроена:
  - в бейдж на главном экране,
  - в экран `Прогресс`,
  - в модалку `Профиль / Hall of Fame`.
- Добавлена отдельная модалка `showEnglishLevelModal()` с breakdown по диапазонам:
  - `2–4`, `5–7`, `8–9`, `10`, `11`.

### 3) Английский в диагностике
- Добавлен `wave17_english_diag.js`.
- Подключён к `diagnostic.html`.
- Расширен English bank диагностики.
- Итоговый банк English в diagnostic = `50` вопросов.
- Диапазон English в диагностике теперь `2–11`.
- Добавлены `ENGLISH_DIAG_CONFIGS`:
  - `junior`, `basic`, `middle`, `senior`.
- В результатах English-диагностики появился отдельный блок `English level`.

### 4) Service Worker
- `sw.js` обновлён до `trainer-v15`.
- В precache добавлены:
  - `wave17_english_infra.js`
  - `wave17_english_diag.js`

### 5) Автопроверки и аудит
- Добавлен `english_infra_audit.js`.
- Добавлены артефакты:
  - `ENGLISH_INFRA_AUDIT.md`
  - `ENGLISH_INFRA_AUDIT.json`
- Обновлён `browser_e2e_smoke.py`:
  - проверяет English toolbar,
  - English infra в grade2–11,
  - English profile modal,
  - English diagnostics block.
- Обновлён `validate_release.py`:
  - `wave17` hooks,
  - English infra audit,
  - English infra guards.

## Проверки
- Browser E2E: `OK`
- English infra audit: `OK`
- English vertical audit: `OK`
- Curriculum guards: `OK`
- Coverage guards: `OK`
- Theory debt guards: `OK`

## Ключевые числа после wave 17
- English vertical по классам: `2–11` закрыт.
- Английских тем по vertical: `54 / 54`.
- Shared ENG guides: `4`.
- Grade pages с hook English infrastructure: `10 / 10`.
- English diagnostics bank: `50` вопросов.
