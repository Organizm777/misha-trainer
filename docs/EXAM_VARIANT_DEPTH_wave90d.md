# wave90d — exam variant depth across all canonical families

## Что сделано

В этой волне продолжен экзаменационный блок из обновлённого roadmap: канонический JSON-backed слой ОГЭ/ЕГЭ доведён до `10` вариантов **для всех 10 поддерживаемых structured-family**, а не только для математики.

Дополнительно устранён скрытый источник дрейфа при повторной генерации банков: `tools/export_exam_bank_foundations_wave90d.mjs` теперь запускает legacy pack builders в детерминированном seeded-VM, поэтому варианты с перемешиваемыми опциями (в первую очередь `ege_physics`) больше не меняют порядок ответов между одинаковыми rerun'ами и `--check` режим остаётся зелёным.

## Экзаменные семьи после wave90d

| Family | Bank rows | Варианты |
|---|---:|---:|
| `oge_math_2026_full` | 250 | 10 |
| `oge_russian_2026_full` | 90 | 10 |
| `oge_english_2026_full` | 200 | 10 |
| `oge_social_2026_full` | 240 | 10 |
| `ege_base_math_2026_full` | 210 | 10 |
| `ege_profile_math_2026_part1` | 120 | 10 |
| `ege_russian_2026_part1` | 200 | 10 |
| `ege_social_2026_part1` | 200 | 10 |
| `ege_english_2026_part1` | 200 | 10 |
| `ege_physics_2026_part1` | 200 | 10 |

Итого в canonical structured runtime теперь `1910` explicit exam rows.

## Изменённые файлы

- `tools/export_exam_bank_foundations_wave90d.mjs`
- `tools/audit_exam_variant_depth_wave90d.mjs`
- `tools/audit_workflow_parity_wave89y.mjs`
- `.github/workflows/validate-questions.yml`
- `.github/workflows/lighthouse-budget.yml`
- `assets/_src/js/bundle_exam.js`
- `assets/_src/js/chunk_exam_bank_wave89q.js`
- `assets/data/exam_bank/catalog.json`
- `assets/data/exam_bank/oge_russian_2026_foundation.json`
- `assets/data/exam_bank/oge_english_2026_foundation.json`
- `assets/data/exam_bank/oge_social_2026_foundation.json`
- `assets/data/exam_bank/ege_base_math_2026_foundation.json`
- `assets/data/exam_bank/ege_russian_2026_foundation.json`
- `assets/data/exam_bank/ege_social_2026_foundation.json`
- `assets/data/exam_bank/ege_english_2026_foundation.json`
- `assets/data/exam_bank/ege_physics_2026_foundation.json`
- `assets/js/chunk_exam_bank_wave89q.a3c103d1d8.js`
- `dashboard.html`
- `diagnostic.html`
- `sw.js`
- `CHANGELOG.md`
- `tools/README.md`
- `healthz.json`
- `assets/asset-manifest.json`

## Проверки

Прогнаны локально:

- `node tools/export_exam_bank_foundations_wave90d.mjs --check`
- `node tools/build_exam_bank_runtime_wave89q.mjs --check`
- `node tools/audit_exam_bank_generator_wave89q.mjs`
- `node tools/audit_math_exam_depth_wave90c.mjs`
- `node tools/audit_exam_variant_depth_wave90d.mjs`
- все `node`-шаги из `validate-questions.yml` по отдельности
- `node tools/validate_questions.js`
- `node tools/cleanup_build_artifacts.mjs --check`

Ключевые результаты:

- `catalog.json` → `version: "wave90d"`
- release metadata → `trainer-build-wave90d-2026-04-28`
- rebuilt exam-bank runtime chunk → `assets/js/chunk_exam_bank_wave89q.a3c103d1d8.js`
- `validate_questions.js` → `failures=0`, `loadErrors=0`
- `audit_theory_coverage.mjs` → `topics=602`, `fallbackTopics=0`, `loadErrors=0`

## Ограничения

- Это всё ещё не плановые `50–100` реальных вариантов по каждому предмету; текущий проход доводит общий canonical слой до устойчивых `10` вариантов на каждую уже поддерживаемую family.
- Live GitHub Actions rerun и ручной тест опубликованного GitHub Pages в этой волне не запускались; подтверждение выполнено локальной пересборкой и полным audit-chain.
