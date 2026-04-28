# WAVE91D COMPLETION REPORT

Дата: 2026-04-28
База: wave91c

## Закрыто по плану

### A1–A6. Расширение ОГЭ/ЕГЭ вариантов

Экзаменационные JSON-банки расширены без возврата к монолитному runtime: shell `chunk_exam_bank_wave89q` остаётся lazy-loader, предметные банки остаются отдельными lazy JS chunks.

| Банк | Вариантов | Заданий |
|---|---:|---:|
| ОГЭ математика | 50 | 1250 |
| ОГЭ русский язык | 50 | 450 |
| ОГЭ английский язык | 30 | 600 |
| ОГЭ обществознание | 30 | 720 |
| ЕГЭ базовая математика | 30 | 630 |
| ЕГЭ профильная математика | 50 | 600 |
| ЕГЭ русский язык | 50 | 1300 |
| ЕГЭ обществознание | 50 | 1000 |
| ЕГЭ английский язык | 30 | 600 |
| ЕГЭ физика | 30 | 600 |

Итог: 10 банков, 400 вариантов, 7750 экзаменационных заданий. Добавлено 5840 новых тренировочных строк к базе wave90d/wave91c.

## Runtime / lazy-loading

- Обновлены `assets/data/exam_bank/*.json` и `catalog.json`.
- ЕГЭ русский приведён к 26 заданиям в структуре: добавлены слоты 21–26.
- Обновлены lazy chunks `exam_bank_*_wave91.*.js`.
- Обновлён shell `chunk_exam_bank_wave89q.*.js` с новыми hashed ссылками.
- Обновлён `bundle_exam.*.js`: fallback-count теперь создаёт 50/30 вариантов, а не только 10.
- Обновлены `diagnostic.html`, `dashboard.html`, `sw.js`, `asset-manifest.json`, `healthz.json`.

## Проверки

- `node --check assets/_src/js/bundle_exam.js`
- `node --check assets/_src/js/chunk_exam_bank_wave89q.js`
- `node --check assets/_src/js/exam_bank_*_wave91.js`
- `node --check sw.js`
- `node tools/audit_exam_variant_expansion_wave91d.mjs`
- `node tools/audit_exam_bank_generator_wave89q.mjs`
- `node tools/audit_theory_coverage.mjs`
- `node tools/audit_special_subjects_wave91b.mjs`
- `node tools/audit_art_history_wave91c.mjs`
- `node tools/audit_critical_bugfixes_wave89a.mjs`

## Примечание

Новые варианты — оригинальные тренировочные задания, сгенерированные и нормализованные под текущую структуру приложения. Они не являются копиями заданий из ФИПИ, сборников или сторонних сайтов.
