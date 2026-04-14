# Wave 14 — English vertical 5–7

## Что сделано

- Добавлен новый слой `wave14_english.js`.
- В `grade5_v2.html`, `grade6_v2.html`, `grade7_v2.html` подключён новый English-слой.
- В `grade5` добавлен предмет **Английский** с 4 темами:
  - To Be & Have Got
  - Present Simple Basics
  - Basic Vocabulary
  - Alphabet & Phonics
- В `grade6` добавлен предмет **Английский** с 4 темами:
  - To Be & Have Got
  - Present Simple Basics
  - Basic Vocabulary
  - Alphabet & Reading Patterns
- В `grade7` добавлен предмет **Английский** с 6 темами:
  - Present Simple & Continuous
  - Past Simple
  - Can / Could / Must
  - There is / There are
  - Vocabulary A1–A2
  - Spelling A1–A2
- Для всех 14 новых тем добавлены шпаргалки и банки заданий.
- `index.html` синхронизирован с новой сеткой:
  - grade5 → 20 тем
  - grade6 → 20 тем
  - grade7 → 22 темы
- `sw.js` обновлён до `trainer-v12`, `wave14_english.js` добавлен в precache.
- `english_vertical_audit.js` обновлён: теперь отдельно фиксирует milestone `5–11` и `2–11`.
- `browser_e2e_smoke.py` расширен сценариями для `grade5`, `grade6`, `grade7` English vertical.
- `validate_release.py` усилен:
  - добавлен hook-check для `wave14_english.js`
  - added guards for grade5/6/7 English topic counts.

## Бонусный фикс в этой волне

- Закрыт старый хвост coverage-валидации: `grade2 / Окружающий мир / Животные` поднят до 15 уникальных формулировок через расширение booster-пула.

## Результат аудитов

- English vertical сейчас покрывает **7 классов**: `5, 6, 7, 8, 9, 10, 11`.
- Тем английского сейчас **48** из целевых **54**.
- Milestone **5–11 = closed**.
- По `5–7` все новые английские темы проходят coverage guard: минимум **12** уникальных формулировок на тему.
- Полный `validate_release.py` проходит без ошибок.
