# wave87l — начальная школа + фактологический pass

## Что закрыто

Этот проход продолжает приоритетный блок актуализированного плана:

- `#9` — расширение `grade1_data`
- `#10` — расширение `grade2_data` и `grade3_data`
- `#17` — выборочный фактологический pass по вопросам и theory-блокам

## Изменения по классам

### 1 класс

Размер `assets/_src/js/grade1_data.js` вырос с `17,406` до `32,480` байт.

Добавлены темы:

- `math.patterns` — числовые цепочки
- `math.wordproblems` — простые задачи
- `rus.sentence` — слова и предложения
- `world.animals1` — животные рядом с нами
- `world.weather1` — погода и безопасность

Каждая тема использует явные банки `q/a/o/h/ex`, без fallback на generic facts.

### 2 класс

Размер `assets/_src/js/grade2_data.js` вырос с `16,690` до `36,904` байт.

Добавлены темы:

- `math.division2` — деление поровну
- `math.geometry2` — фигуры и периметр
- `rus.alphabet2` — алфавит и словарный порядок
- `rus.sentence2` — предложение и текст
- `world.weather2` — погода и явления природы
- `world.safety2` — безопасность в городе

Также исправлен генератор времени:

- exact-hour phrases now use correct Russian forms (`1 час`, `2 часа`, `5 часов`)
- half-hour phrases now use explicit forms like `половина второго`, `половина первого`

### 3 класс

Размер `assets/_src/js/grade3_data.js` вырос с `27,053` до `45,492` байт.

Добавлены темы:

- `math.fractions3` — доли и дроби
- `math.perimeter3` — периметр фигур
- `rus.text3` — текст, тема и главная мысль
- `okr.earth3` — Земля и космос
- `okr.health3` — здоровье и безопасность

## Фактологические правки

В этом проходе убраны несколько спорных или устаревших формулировок из начальной школы:

- `grade2_data`: theory-блок `country` больше не утверждает, что Байкал — «самое большое озеро»; формулировка заменена на `Самое глубокое озеро — Байкал`.
- `grade3_data`: вопрос по океанам нормализован на современный школьный вариант с `5` океанами, включая Южный.
- `grade3_data`: из compact bank убрана жёсткая «норма пульса 60–100» как лишне спорная для младшей школы; остался безопасный факт о том, что пульс — это удары сердца в минуту.
- `grade1_data`: исправлена типографическая ошибка `ШКО-LA` → `ШКО-ЛА`.

## Новые/обновлённые инструменты

### `tools/audit_primary_content_wave87l.mjs`

Проверяет:

- минимальный размер `grade1/2/3` source-файлов
- наличие новых тем wave87l
- отсутствие старых спорных токенов и опечаток

Запуск:

```bash
node tools/audit_primary_content_wave87l.mjs
```

### `tools/rebuild_hashed_assets.mjs`

Небольшой helper для локального rebuild-а hashed JS/CSS assets после редактирования source-файлов в `assets/_src`.

Пример:

```bash
node tools/rebuild_hashed_assets.mjs \
  assets/_src/js/grade1_data.js \
  assets/_src/js/grade2_data.js \
  assets/_src/js/grade3_data.js
```

Скрипт:

- пересчитывает content hash
- создаёт новый built asset в `assets/js` / `assets/css`
- обновляет `assets/asset-manifest.json`
- меняет ссылки в `grade*.html` и `sw.js`
- удаляет старый hashed asset и sidecar `.map`, если он есть

## Валидация

Обязательный минимальный набор после изменений:

```bash
node tools/audit_primary_content_wave87l.mjs
GRADE_FILTER=1,2,3 SAMPLE_PER_TOPIC=6 node tools/validate_questions.js
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```

Ожидаемый результат для wave87l:

- audit primary content — `ok: true`
- targeted validation 1–3 — `failures: 0`, `immediateRepeats: 0`
- full validation — `failures: 0`, `loadErrors: 0`
- cleanup check — no orphan assets
