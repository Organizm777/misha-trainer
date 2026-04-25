# SCRIPTS_BUDGET_wave89c

## Что сделано

Волна `wave89c` продолжает merge-pass из `wave89b` и закрывает пункт плана `#72`: теперь **каждая grade-страница держится в бюджете `<= 20` внешних `<script>`**.

### Новый merged 7–9 STEM chunk

`assets/_src/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.js`

Внутри объединены два прежних live-слоя:
- `chunk_subject_expansion_wave58_secondary_math_7_9`
- `chunk_subject_expansion_wave59_physics_chemistry_7_9`

Новый chunk подключается только там, где раньше стояли оба слоя — на `grade7_v2.html`, `grade8_v2.html`, `grade9_v2.html`.

## Эффект по количеству script-тегов

- `grade7_v2.html`: `21 → 20`
- `grade8_v2.html`: `20 → 19`
- `grade9_v2.html`: `18 → 17`

Итог по всем grade-страницам после сборки:

- `grade1`: `14`
- `grade2`: `15`
- `grade3`: `16`
- `grade4`: `17`
- `grade5`: `20`
- `grade6`: `20`
- `grade7`: `20`
- `grade8`: `19`
- `grade9`: `17`
- `grade10`: `18`
- `grade11`: `18`

## Почему это важно

После `wave89b` merge-pass бюджет всё ещё пробивался на одном классе (`grade7`). `wave89c` убирает этот хвост и делает budget-гейт пригодным для CI: теперь `validate-questions` и `lighthouse-budget` могут реально падать на превышении лимита, а не только сигналить о нём локально.

## Tooling

- `tools/build_scripts_budget_wave89c.mjs` — собирает merged исходник для нового 7–9 STEM chunk.
- `tools/audit_scripts_budget_wave89c.mjs` — проверяет бюджет `<= 20`, наличие нового merged-ассета в HTML/SW и отсутствие legacy wave58/wave59 ассетов в manifest/SW/grade-страницах.

## Проверка

Основные проверки:

```bash
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_performance_wave86z.mjs
```
