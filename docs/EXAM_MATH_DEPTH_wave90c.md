# wave90c — расширение exam-bank для математики

## Цель

Продолжить экзаменационный блок плана за счёт реального увеличения глубины банков для:

- `#10` ЕГЭ профильная математика
- `#13` ОГЭ математика

## Изменения

### 1. Canonical JSON bank

Обновлены файлы:

- `assets/data/exam_bank/oge_math_2026_foundation.json`
- `assets/data/exam_bank/ege_profile_math_2026_foundation.json`

Новая глубина:

- ОГЭ математика: с `5` до `10` вариантов
- ЕГЭ профильная математика: с `5` до `10` вариантов

Итоговые объёмы:

- ОГЭ математика: `250` строк (`10 × 25`)
- ЕГЭ профильная математика: `120` строк (`10 × 12`)

Новые добавленные строки помечены тегом:

- `source_tag: "wave90c_math_expansion"`

### 2. Runtime / fallback

В `assets/_src/js/bundle_exam.js` обновлены fallback-подсказки количества вариантов для math families:

- `structuredVariantNosHint('oge_math_2026_full', 10)`
- `structuredVariantNosHint('ege_profile_math_2026_part1', 10)`

Это важно на случай неполного structured runtime и предотвращает деградацию обратно до 5 вариантов.

### 3. Catalog / release metadata

- `assets/data/exam_bank/catalog.json` → `version: wave90c`
- `healthz.json` / release metadata синхронизированы на `wave90c`

### 4. Новый CI-аудит

Добавлен `tools/audit_math_exam_depth_wave90c.mjs`, который проверяет:

- наличие 10 вариантов в обеих math families
- корректные диапазоны variant `1..10`
- точные task ranges:
  - ОГЭ: `1..25`
  - ЕГЭ профиль: `1..12`
- консистентность source/runtime fallback
- наличие метки `wave90c_math_expansion` у новых строк

Аудит подключён в:

- `validate-questions.yml` как hard gate
- `lighthouse-budget.yml` как advisory
- `audit_workflow_parity_wave89y.mjs` как обязательная parity-проверка

## Команды проверки

```bash
node tools/build_exam_bank_runtime_wave89q.mjs --check
node tools/audit_exam_bank_generator_wave89q.mjs
node tools/audit_math_exam_depth_wave90c.mjs
node tools/audit_workflow_parity_wave89y.mjs
```

## Результат

Релиз `wave90c` расширяет именно математику — самый приоритетный экзаменационный слой — без регресса в существующей exam runtime / CI цепочке.
