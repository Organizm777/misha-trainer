# MULTI_SELECT_wave88b

## Что добавлено

`wave88b` закрывает пункт дорожной карты `#28`: в 8–11 классах появился полноценный формат **множественного выбора** — `2–3 правильных ответа из 6`.

Изменения состоят из двух частей:

1. Расширен runtime `bundle_grade_runtime_interactions_wave87w`.
2. Добавлен новый контентный chunk `assets/_src/js/chunk_subject_expansion_wave88b_multi_select_banks.js`.

## Runtime-часть

`bundle_grade_runtime_interactions_wave87w` теперь поддерживает ещё один `interactionType`:

- `multi-select`

Для него добавлены:

- отдельный state-хранилище выбора;
- сериализация ответа в канонический вид `A | B | C`;
- renderer с чекбокс-подобными кнопками;
- helper `requirementText(...)` для правил `ровно 2` / `ровно 3`;
- keyboard support: цифры `1–6` переключают варианты, `Enter` проверяет ответ;
- расширенный feedback с показом правильного набора и выбора ученика.

### Важная совместимость с базовым engine

Базовый движок по-прежнему считает правильность через `sel === answer`.

Поэтому multi-select runtime не переписывает scoring engine, а приводит пользовательский выбор к канонической строке и передаёт её в обычный `ans(idx)` через `submitCustomValue(...)`.

Это сохраняет:

- журнал ошибок;
- дневную статистику;
- прогресс и streak;
- уже существующий feedback pipeline.

## Новый content chunk

`chunk_subject_expansion_wave88b_multi_select_banks` добавляет **8 explicit тем** и **48 explicit rows**:

### Grade 8

- `multibio8w88b`
- `multihis8w88b`

### Grade 9

- `multichem9w88b`
- `multisoc9w88b`

### Grade 10

- `multiinf10w88b`
- `multisoc10w88b`

### Grade 11

- `multirus11w88b`
- `multibio11w88b`

У каждого вопроса есть:

- `interactionType: 'multi-select'`
- `multiSelectOptions` из 6 пунктов
- `multiSelectAnswers`
- `multiSelectMin` / `multiSelectMax`
- обычные `question/answer/options/hint/ex` для совместимости с validator и fallback-режимом

## Поведение в режимах

- в обычном тренажёре multi-select получает свой custom renderer;
- в `rushMode` такие задачи reroll-ятся так же, как sequence/match;
- в диагностике и других режимах без enhancement остаётся fallback через обычный движок, потому что `question.options` тоже заполнены.

## Архитектурная деталь для grade 10

Как и `wave87y` / `wave87z`, новый chunk не ломает lazy-split `wave86s`:

- он патчит `window.SUBJ` shell напрямую;
- не трогает lazy-load flags;
- не подменяет загрузку `grade10_subject_*_wave86s`.

## Что intentionally не делалось

- не переписывался `engine10`;
- не добавлялся drag-select или новый визуальный layout вне существующих `opt/fb`-блоков;
- не переносились старые rich-content interactive rows в multi-select массово;
- не включался отдельный partial-credit scoring.

`wave88b` — это новый формат вопроса, но с сохранением прежней scoring/storage архитектуры.

## Проверки

Минимальный release-набор:

```bash
node tools/audit_multi_select_wave88b.mjs
node tools/audit_interaction_formats_wave87w.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```
