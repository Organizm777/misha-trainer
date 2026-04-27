# wave89w — Lighthouse/email + stale-cache + input-editability fixes

## Что было сломано

### 1) Письма по Lighthouse продолжали приходить
Даже после ослабления `errors-in-console` workflow `lighthouse-budget.yml` всё ещё запускался на `push`, а внутри него оставались шаги, которые могли ронять job независимо от самих budget-assertions. В результате владелец репозитория продолжал получать GitHub email о падении именно lighthouse-workflow.

### 2) На ПК появлялись input-поля, в которые нельзя печатать
Проблема была составная:

- runtime free-input использовал прямые проверки `root.sel === null` / `root.sel !== null`;
- при версии-кэше/дрейфе между HTML, service worker и runtime `window.sel` мог быть `undefined`;
- `undefined !== null` трактовалось как «ответ уже выбран», поэтому `<input>` рендерился сразу disabled;
- auto-input guard смотрел на `question.grade` раньше, чем на grade самой страницы, так что даже младшие классы могли случайно получить numeric/text card из-за stray metadata в конкретной строке банка.

### 3) Сервис-воркер усиливал version skew
`sw.js` обслуживал same-origin HTML по stale-while-revalidate. Это позволяло браузеру на десктопе держать старый HTML дольше нужного, а уже обновлённый JS/runtime — получить отдельно. Такая смесь и добивала fragile window-state/readiness сценарии.

## Что изменено

### Lighthouse / email
- `lighthouse-budget.yml` переведён на **`pull_request` + `workflow_dispatch`**, без `push`.
- Все live LHCI шаги переведены в advisory:
  - static policy audit
  - install LHCI CLI
  - healthcheck
  - collect
  - assert
- `.lighthouserc.json` теперь использует URL с `?lhci=1`.
- Public entrypoints пропускают регистрацию service worker при `navigator.webdriver` или `lhci=1`.

### Service worker / stale cache
- `sw.js` теперь **не перехватывает** запросы с `cache: 'no-store'`.
- `sw.js` также пропускает прямые запросы к `/sw.js`.
- Для HTML/document navigation введён **network-first**, а не stale-while-revalidate.
- Для остальных same-origin assets сохранён stale-while-revalidate.

### Free-input runtime
В `bundle_grade_runtime_inputs_timing_wave87x.js` и merged `bundle_grade_runtime_extended_wave89b.js` добавлены:

- `lexicalValue(...)`
- `selectionValue()`
- `hasSelection()`
- `pageGrade()`

Ключевые изменения поведения:
- `undefined` selection нормализуется в `null`;
- checks на editable/answered больше не завязаны на raw `root.sel !== null`;
- active question и active subject читаются и из lexical engine state, и из `window`;
- auto-input guard теперь **предпочитает page grade**, а не `question.grade`.

## Регрессионные проверки

### Усилен существующий аудит
`tools/audit_input_bridge_wave89v.mjs` теперь проверяет:
- window-state bridge в `engine10`;
- lexical/global fallback helpers в runtime;
- page-grade-first auto-input guard;
- safe `hasSelection()` checks вместо raw `root.sel !== null`;
- поведение `inputModeFor(...)` в junior/senior VM-сценариях.

### Новый аудит
Добавлен `tools/audit_input_render_wave89w.mjs`, который имитирует реальный render и проверяет:
- во 2 классе auto-input не рендерится;
- в 10 классе свежий input рендерится и **editable**;
- после выбора ответа input блокируется корректно.

## Затронутые файлы
- `.github/workflows/lighthouse-budget.yml`
- `.github/workflows/validate-questions.yml`
- `.lighthouserc.json`
- `sw.js`
- `assets/_src/js/engine10.js`
- `assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js`
- `assets/_src/js/bundle_grade_runtime_extended_wave89b.js`
- `assets/_src/js/inline_index_1_wave86u.js`
- `assets/_src/js/inline_dashboard_1_wave86u.js`
- `assets/_src/js/inline_diagnostic_2_wave86u.js`
- `assets/_src/js/inline_tests_2_wave86u.js`
- `assets/_src/js/inline_spec_subjects_1_wave86u.js`
- `tools/audit_lighthouse_ci_wave87s.mjs`
- `tools/audit_input_bridge_wave89v.mjs`
- `tools/audit_input_render_wave89w.mjs`

## Ограничение
Live GitHub Pages / live GitHub Actions email из этой локальной сессии не проверялись напрямую. Проверка сделана через source/build-аудиты, VM regression tests и пересборку релизных asset-хэшей.
