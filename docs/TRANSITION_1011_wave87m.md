# wave87m — переход 10 → 11 + диагностический мост

## Что закрыто

Этот проход продолжает приоритетный блок актуализированного плана:

- `#19` — вопросы на соответствие МЭШ/диагностическому переходу 10→11 класс

## Что добавлено

### Новый subject на странице 10 класса

В `grade10_v2.html` подключён отдельный transition chunk `chunk_grade_content_wave87m_transition_1011.*.js`.

Он добавляет новый subject:

- `id: bridge1011`
- title: `Переход 10→11`
- icon: `🧭`

Позиция — сразу после `eng`, чтобы блок был виден в основном списке предметов 10 класса, но не раздувал базовый `grade10_data` shell.

### Темы

Внутри `bridge1011` добавлены 6 explicit-bank тем:

- `math_bridge` — функции, вероятность, стереометрические опоры
- `russian_bridge` — норма, пунктуация, текст
- `physics_bridge` — механика, МКТ/термодинамика, электродинамика
- `english_bridge` — reading & use of English
- `biology_bridge` — клетка, наследственность, экология
- `chemistry_bridge` — строение атома, типы реакций, органика

Каждая тема использует явные строки `q/a/o/h/ex` и не опирается на generic `facts -> makeGen()` fallback.

Итого для grade10 bridge-layer добавлено:

- `6` тем
- `48` explicit rows

## Диагностический мост

Тот же chunk дополняет `QBANK` в `diagnostic.html`, чтобы переходный слой был доступен и в сквозной диагностике.

Добавлено минимум:

- `algebra` — `6` rows
- `geometry` — `2` rows
- `russian` — `8` rows
- `physics` — `8` rows
- `english` — `8` rows
- `biology` — `8` rows
- `chemistry` — `8` rows

После инъекции chunk пересобирает `QBANK.mathall`, если на странице уже есть `math/algebra/geometry`.

Все переходные diagnostic rows помечены `src: 'wave87m'`, чтобы их можно было проверять отдельным аудитом и не путать с legacy pool.

## Почему отдельный chunk, а не правка `grade10_data`

Это позволяет:

- не раздувать grade10 shell-файл
- не трогать существующий lazy split предметов 10 класса
- держать переход 10→11 как отдельный release-layer, который можно быстро расширять или откатить
- переиспользовать те же explicit rows в диагностике

## Новый аудит

### `tools/audit_transition_1011_wave87m.mjs`

Проверяет:

- наличие `bridge1011` на странице 10 класса
- ожидаемое название subject-а
- наличие всех 6 topic ids
- валидный sample от каждого topic generator (`question`, `answer`, 4 options, `ex`)
- минимум `8` rows в каждом банке
- наличие wave87m diagnostic rows в нужных `QBANK.*`

Запуск:

```bash
node tools/audit_transition_1011_wave87m.mjs
```

## Валидация

Минимальный набор для wave87m:

```bash
node tools/audit_transition_1011_wave87m.mjs
GRADE_FILTER=10 SAMPLE_PER_TOPIC=4 node tools/validate_questions.js
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```

Ожидаемый результат:

- audit transition — `ok: true`
- grade10 targeted validation — `failures: 0`
- full validation — `failures: 0`, `loadErrors: 0`
- cleanup check — no orphan assets
