# wave89u — exam JSON coverage + CSP-safe diagnostic/exam controls

## Что закрыто

Этот проход продолжает блок **#6–#7** из обновлённого плана: канонический формат экзаменационного банка и генератор вариантов.

## Содержательное покрытие экзаменов

Канонический слой `assets/data/exam_bank/` теперь покрывает все 10 поддерживаемых structured-family и для каждой семьи держит 5 вариантов:

- `oge_math_2026_full` — 125 rows
- `oge_russian_2026_full` — 45 rows
- `oge_english_2026_full` — 100 rows
- `oge_social_2026_full` — 120 rows
- `ege_base_math_2026_full` — 105 rows
- `ege_profile_math_2026_part1` — 60 rows
- `ege_russian_2026_part1` — 100 rows
- `ege_social_2026_part1` — 100 rows
- `ege_english_2026_part1` — 100 rows
- `ege_physics_2026_part1` — 100 rows

Итого canonical JSON/runtime слой держит **955 явных rows**.

## Что было исправлено в схеме

`tools/build_exam_bank_runtime_wave89q.mjs` валидирует полный контракт строки экзаменационного банка:

`{ exam, subject, year, variant, task_num, type, max_score, q, a, o, h, ex, criteria, topic_tag }`

При попытке пересборки выяснилось, что у восьми non-math bank-файлов отсутствует `ex`. В wave89u эти объяснения были backfill'нуты, после чего canonical runtime снова стал собираться и проходить `--check`.

## CSP/desktop-safe binding pass

`diagnostic.html` и exam-hub больше не зависят от legacy inline `onclick` для динамически сгенерированных элементов:

- ответы в `inline_diagnostic_1_wave86u.js`
- кнопки режимов/истории в `bundle_diagnostic_tools.js`
- запуск экзаменационных паков в `bundle_exam.js`

Теперь используются явные data-атрибуты:

- `data-wave89u-diag-action`
- `data-wave89u-diag-answer-index`
- `data-wave89u-diag-tools-action`
- `data-wave89u-diag-tools-mode`
- `data-wave89u-exam-action`
- `data-wave89u-pack-id`

Их обслуживают delegated listeners, экспортируемые как:

- `window.wave89uDiagnosticBinding`
- `window.wave89uDiagnosticToolsBinding`
- `window.wave89uExamBinding`

Дополнительно `adaptNext(...)` теперь short-circuit'ится, пока активен `window.__wave30ActivePack`, чтобы экзаменационный вариант не мутировал mid-run.

## Аудиты

Добавлен новый регрессионный аудит:

- `tools/audit_diagnostic_exam_bindings_wave89u.mjs`

Он проверяет:

- отсутствие legacy inline `onclick` в source и hashed assets
- наличие новых binding exports
- старт JSON-backed exam-pack во VM
- то, что active pack действительно идёт из `structuredFamilySource: 'json_bank'`
- стабильность вопросов во время `adaptNext(true/false)` при активном экзамене

Во время внедрения пришлось усилить сам VM stub аудита: добавить `style.setProperty(...)` и `requestAnimationFrame(...)`, иначе современный diagnostic shell не проходил хардкодированный harness.

## Build / release

Пересобраны и перехэшированы:

- `assets/js/inline_diagnostic_1_wave86u.10ff5e8d9b.js`
- `assets/js/bundle_diagnostic_tools.9792be3cd6.js`
- `assets/js/bundle_exam.385cc1c494.js`
- `assets/js/chunk_exam_bank_wave89q.f7f1c7914a.js`

Release metadata синхронизирована на:

- `wave: wave89u`
- `version: trainer-build-wave89u-2026-04-27`

## Проверки

Пройдены:

- `node tools/build_exam_bank_runtime_wave89q.mjs --check`
- `node tools/audit_exam_bank_generator_wave89q.mjs`
- `node tools/audit_diagnostic_exam_bindings_wave89u.mjs`
- `node tools/audit_lighthouse_ci_wave87s.mjs`
- `node tools/audit_play_selection_wave89t.mjs`
- `node tools/audit_scripts_budget_wave89c.mjs`
- `node tools/audit_style_csp_wave87q.mjs`
- `node tools/audit_offline_readiness_wave86y.mjs`
- `node tools/audit_self_host_fonts_wave89p.mjs`
- `node tools/audit_theory_coverage.mjs`
- `node tools/audit_critical_bugfixes_wave89a.mjs`
- `node tools/cleanup_build_artifacts.mjs --check`
- `node tools/validate_questions.js`

## Честное ограничение

Здесь не прогонялся live-клик по уже опубликованному GitHub Pages build. Проверка сделана на source/build уровне, через VM/static audits и локальную пересборку release-ассетов.
