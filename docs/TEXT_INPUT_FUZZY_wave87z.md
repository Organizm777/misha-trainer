# TEXT_INPUT_FUZZY_wave87z

## Что добавлено

`wave87z` закрывает следующий пункт дорожной карты после `wave87x` и `wave87y`: **текстовый свободный ввод с нечётким сравнением** (`#29`).

Изменения состоят из двух слоёв:

1. Доработан существующий runtime `bundle_grade_runtime_inputs_timing_wave87x`.
2. Добавлен новый content chunk `assets/_src/js/chunk_subject_expansion_wave87z_text_input_banks.js`.

Итог: в 8–11 классах теперь есть не только numeric/cloze input, но и отдельный режим **short text answer** для русского и английского.

## Runtime-часть

`bundle_grade_runtime_inputs_timing_wave87x` теперь умеет три режима ввода:

- `numeric`
- `cloze`
- `text`

### Что именно появилось в `text`

- явный `inputMode: 'text'`;
- нормализация текста для русского и английского:
  - регистр не важен;
  - `ё/е` сводятся;
  - лишняя пунктуация, кавычки и вариации пробелов не мешают;
  - пробел/дефис внутри короткой фразы не ломают проверку;
- нечёткое сравнение через Levenshtein для длинных ответов;
- безопасные пороги допуска:
  - короткие слова остаются почти strict;
  - длинные слова допускают 1–2 опечатки;
  - далёкие по смыслу/форме ответы не проходят.

### Важный фикс поверх wave87x/y

В runtime дополнительно исправлено зачтение `acceptedAnswers`: теперь любая допустимая альтернатива приводит к **каноническому** `question.answer`, а не к случайной accepted-форме.

Это важно для уже существующих numeric-input кейсов вроде:

- `10` → засчитывается как `10%`
- `4` → засчитывается как `4 А`
- `organization` → засчитывается как `organisation`

Иначе базовый движок, который по-прежнему сравнивает `sel === answer`, мог бы ошибочно считать допустимый вариант неправильным.

## Новый content chunk

`chunk_subject_expansion_wave87z_text_input_banks` добавляет стартовые банки для 8–11 классов.

### Новый охват

На каждый класс добавлено по 2 темы:

- русский язык;
- английский язык.

Итого:

- **8 новых text-input тем**
- **40 explicit rows**

### Новые topic ids

#### Grade 8

- `textrus8w87z`
- `texteng8w87z`

#### Grade 9

- `textrus9w87z`
- `texteng9w87z`

#### Grade 10

- `textrus10w87z`
- `texteng10w87z`

#### Grade 11

- `textrus11w87z`
- `texteng11w87z`

## Типы заданий

### Русский

Формат ориентирован на:

- лингвистические термины;
- синтаксис;
- орфографию;
- текстоведение и выразительные средства.

Примеры ответов:

- `дополнение`
- `согласование`
- `интеллигенция`
- `аргументация`
- `олицетворение`

### Английский

Формат ориентирован на:

- word formation;
- spelling;
- точный перевод одного слова;
- exam-style vocabulary.

Примеры ответов:

- `environment`
- `responsibility`
- `organisation`
- `competition`
- `beneficial`

## UX-детали

Для text-input режима UI показывает:

- отдельный заголовок `Введите короткий ответ`;
- placeholder под слово/короткую фразу;
- helper о том, что регистр не важен;
- chip `≈ опечатка зачтена`, если ответ принят fuzzy-сравнением;
- обычную каноническую форму ответа в feedback, если введён accepted-variant.

## Архитектурные ограничения, которые не менялись

- scoring engine не переписывался;
- режим всё ещё использует существующий путь `ans(idx)`;
- в rush/diag этот формат намеренно не форсируется — как и numeric/cloze из `wave87x`, он работает в обычном тренажёре;
- grade 10 остаётся совместим с `wave86s` lazy-loading: chunk патчит `window.SUBJ` shell напрямую и не подменяет lazy hydration flags.

## Проверки

Минимальный release-набор после `wave87z`:

```bash
node tools/audit_text_input_fuzzy_wave87z.mjs
node tools/audit_free_input_timing_wave87x.mjs
node tools/audit_free_input_banks_wave87y.mjs
node tools/audit_interaction_formats_wave87w.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```

## Что intentionally не делалось

- не включался fuzzy-input по эвристике на все старые текстовые вопросы;
- не включался text-input в диагностику и молнию;
- не добавлялся полнотекстовый open-ended essay mode;
- не вводились более сложные NLP-эвристики вроде stemming/semantic matching.

`wave87z` — это контролируемый, безопасный short-answer слой поверх уже существующего free-input runtime.
