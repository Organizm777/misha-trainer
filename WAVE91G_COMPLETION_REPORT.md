# WAVE91G COMPLETION REPORT

Дата сборки: 2026-04-28  
Build/cache: `trainer-build-wave91g-2026-04-28`  
Runtime: `assets/js/bundle_grade_runtime_extended_wave89b.7037118c49.js`

## Закрытые пункты плана

### E1 — SVG-чертежи для Геометрии 7–11
Добавлен runtime-рендер геометрических SVG-схем на экране тренировки:
- треугольник с высотой и углами;
- окружность с радиусом, диаметром и касательной;
- четырёхугольник/трапеция с высотой;
- координатная плоскость / график.

Схема выбирается по предмету, теме и тексту текущего задания.

### E2 — SVG-карты для Географии
Добавлены схемы:
- карта России с Уралом, Европейской частью и Сибирью;
- природные зоны;
- базовая карта мира с экватором.

### E3 — Химические структурные формулы
Добавлены SVG-структуры:
- бензол;
- этанол;
- уксусная кислота / карбоновая группа;
- аммиак;
- универсальная схема функциональной группы.

### E5 — Печатные рабочие листы
Добавлена генерация рабочего листа по текущей теме / текущему вопросу:
- создаётся print-ready HTML;
- браузерная печать позволяет сохранить как PDF;
- при блокировке pop-up создаётся HTML-файл для скачивания.

Это намеренно browser-safe реализация для статического PWA, без внешнего PDF-движка и CDN.

### E6 — Схемы опытов для Физики
Добавлены SVG-схемы:
- электрическая цепь;
- линза и ход лучей;
- маятник;
- рычаг;
- базовая схема сил.

### F1–F6 — Интерактивные форматы заданий
Добавлена лаборатория интерактивных форматов:
- F1 timeline/sort — сортировка шагов решения;
- F2 match — соответствия A↔B;
- F3 data table — работа с таблицей данных;
- F4 graph analysis — анализ SVG-графика;
- F5 geometric construction — клик по плоскости;
- F6 canvas formula input — рукописный черновик формулы.

Runtime также поддерживает future-proof форматные вопросы через поля `format`, `fmt`, `type` или `kind` в объекте задания.

### J5 — ARCHITECTURE.md
Добавлен `ARCHITECTURE.md` с описанием слоёв приложения, правил пересборки hashed assets, offline/CSP подхода и performance budget.

## Техническая реализация

- Новый функционал встроен в существующий `bundle_grade_runtime_extended_wave89b`.
- Новый eager-скрипт на страницы классов не добавлен.
- Лимит внешних scripts на grade pages сохранён: максимум `20`.
- В simple mode скрыта главная карточка wave91g, чтобы не перегружать минимальный интерфейс.
- `tools/audit_learning_formats_wave91e.mjs` переведён на wave91e+ gate, чтобы CI не ломался на последующих сборках wave91f/wave91g.

## CI / audit

Добавлен:
```bash
node tools/audit_visual_interactive_wave91g.mjs
```

Проверки, выполненные для сборки:

```bash
node --check sw.js
node --check assets/_src/js/bundle_grade_runtime_extended_wave89b.js
node --check assets/js/bundle_grade_runtime_extended_wave89b.7037118c49.js
node tools/audit_visual_interactive_wave91g.mjs
node tools/audit_learning_formats_wave91e.mjs
node tools/audit_learning_formats_wave91f.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_hamburger_wave89f.mjs
node tools/audit_simple_mode_wave89d.mjs
node tools/update_index_stats.mjs --check
node tools/audit_workflow_parity_wave89y.mjs
node tools/validate_questions.js
```

## Metadata

```json
{
  "wave": "wave91g",
  "cache": "trainer-build-wave91g-2026-04-28",
  "hashed_asset_count": 112,
  "runtime": "assets/js/bundle_grade_runtime_extended_wave89b.7037118c49.js"
}
```

## Примечание

`assets/fonts/*` не включены в архив, как и в предыдущих wave91-сборках. При наложении сборки нужно сохранить production-каталог шрифтов.
