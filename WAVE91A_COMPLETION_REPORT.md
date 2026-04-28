# wave91a completion report

Дата: 2026-04-28

## Сделано

- 0.1: блок «Задание дня» удалён с `index.html`; daily-question CSS/JS исключены из `sw.js` precache.
- 0.2: обновлены цифры и подписи главной страницы; добавлен `tools/update_index_stats.mjs`.
- 0.3: FAB-переключатель темы не создаётся; остаточные проверки только удаляют старые DOM-узлы, переключатель темы остаётся в настройках.
- 0.4: добавлен режим «Простой / Полный» с ключом `trainer_ui_mode`, значениями `simple/full`, совместимостью с `trainer_simple_mode_v1` и default `simple`.
- 0.5: `chunk_exam_bank_wave89q` превращён в shell + catalog + lazy loader; 10 предметных exam-bank chunks загружаются по выбору экзамена.
- 0.6: senior-school expansion 10/11 подключается через lazy-loader на `grade10_v2.html` и `grade11_v2.html`.
- 0.7: root `wave*_verification_summary.*` удалены; добавлено правило в `.gitignore`.

## Проверки

- `node --check` для изменённых JS/SW файлов — OK.
- `node tools/audit_daily_question_wave88a.mjs` — OK.
- `node tools/audit_exam_bank_generator_wave89q.mjs` — OK.
- `node tools/audit_exam_variant_depth_wave90d.mjs` — OK, с lazy-split режимом.
- `node tools/audit_simple_mode_wave89d.mjs` — OK.
- `node tools/audit_critical_bugfixes_wave89a.mjs` — OK.

## Примечание

Шрифтовые файлы не включены в архив результата; они не менялись. При развёртывании поверх исходной сборки каталог `assets/fonts/` остаётся прежним. Exam-bank shell занимает около 40 KB, потому что в нём оставлен `catalog`; предметные банки вынесены в 10 lazy chunks.
