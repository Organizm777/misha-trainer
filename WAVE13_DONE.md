# Wave 13 — English vertical for grades 8–9

## Что сделано

### 1. Добавлен новый слой `wave13_english.js`
- новый предмет **Английский** для `grade8_v2.html`
- новый предмет **Английский** для `grade9_v2.html`
- подключение сделано как patch-layer поверх текущей архитектуры `v2`
- слой активируется только для `GRADE_NUM = 8` и `GRADE_NUM = 9`

### 2. Закрыт English vertical для 8 и 9 классов

#### Grade 8 — 8 тем
- Present Tenses
- Past Simple
- Future Forms
- Comparisons
- Articles a/an/the
- Prepositions of Time & Place
- Vocabulary A2
- Spelling A2

#### Grade 9 — 8 тем
- Present Perfect vs Past Simple
- Past Tenses Mix
- Conditionals 0–2
- Passive Voice Basics
- Modal Basics
- Word Formation ОГЭ
- Vocabulary A2–B1
- Spelling B1

### 3. Добавлены шпаргалки по всем новым темам
- отдельные `ENG_TH` для всех 16 новых тем
- все новые темы проходят аудит без missing theory

### 4. Объём нового English-контента
- `BANK8`: 96 базовых формулировок
- `BANK9`: 96 базовых формулировок
- всего в wave 13 добавлено **192** базовых английских вопроса

### 5. Пересчитана предметная сетка
После добавления английского:
- `grade8`: 8 предметов, 34 темы
- `grade9`: 8 предметов, 34 темы
- `index.html` синхронизирован с новыми числами тем

### 6. Обновлён PWA-слой
- `sw.js` поднят до `trainer-v11`
- `wave13_english.js` добавлен в precache

### 7. Обновлены проверки
- `english_vertical_audit.js` теперь считает текущий milestone как:
  - grade8 = 8 тем
  - grade9 = 8 тем
  - grade10 = 6 тем
  - grade11 = 12 тем
- `validate_release.py` получил:
  - `check_wave13_hooks()`
  - новые English guards для 8/9/10/11
  - фиксацию drift-а в hook-проверке wave 12
- `browser_e2e_smoke.py` расширен сценариями для `grade8` и `grade9`

## Результат аудитов

### English vertical
- классов с английским: **4** (`8, 9, 10, 11`)
- тем английского сейчас: **34** из milestone-цели **54**
- полностью готовы по текущему milestone: **8, 9, 10, 11**

### Coverage
Все новые английские темы в `grade8` и `grade9` проходят guard по вариативности:
- каждая тема даёт **12** уникальных формулировок в coverage-аудите
- тем ниже `10` по всей сборке: **0**

### Browser E2E
Новые сценарии проходят:
- `grade8_v2.html: english vertical` ✅
- `grade9_v2.html: english vertical` ✅

### Общая валидация
`validate_release.py` проходит полностью.

## Что осталось после wave 13
- English vertical для `grades 5–7`
- English vertical для `grades 2–4`
- shared ENG-шпаргалки (irregular verbs / articles / word formation / phrasal verbs)
- большой subject mesh блок из планов 200/400/1000
- theory debt grades 5–7
- accessibility / mobile / parent analytics / diagnostics expansion
