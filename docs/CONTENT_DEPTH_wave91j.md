# CONTENT DEPTH wave91j

Закрытый пакет: I1–I6, K1, K2, K5, K6, L3–L6.

## Данные

Новые JSON-банки лежат в `assets/data/content_depth/`:

- `school_question_pack_primary.json` — дополнительный банк 1–4 классов.
- `school_question_pack_middle.json` — дополнительный банк 5–9 классов.
- `school_question_pack_senior.json` — дополнительный банк 10–11 классов.
- `functional_literacy_pisa.json` — PISA/функциональная грамотность.
- `cross_grade_diagnostic.json` — сквозная диагностика.
- `final_essay_bank.json` — итоговое сочинение.
- `textbook_bindings.json` — привязка к учебникам и параграфам.

Контент не добавляется в eager grade runtime. Данные загружаются со страницы `content_depth.html` по требованию.

## Экосистема

- `landing.html` — лендинг.
- `teacher.html` — режим учителя.
- `embed.html` — embed-виджет.
- `assets/data/api/trainer3_content_api.json` — статический API-index.
- `staging.html` — staging checklist.

## Логи

`bundle_navigation_logger` ведёт локальный журнал переходов в `localStorage`. Standalone `bundle_error_tracking` расширен навигационным контекстом для ошибок.
