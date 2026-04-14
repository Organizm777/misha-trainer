# Wave 12 — English vertical, phase 1 (grade 11)

## Что сделано

### 1. Полноценный English vertical для `grade11`
Добавлен новый слой `wave12_english.js`, подключённый к `grade11_v2.html` до `engine10.js`.

Внутри добавлен новый предмет `Английский` (`eng`) с **12 темами**:
- Advanced Tenses
- Conditionals
- Reported Speech
- Advanced Passive
- Modal Verbs
- Articles & Zero Article
- Gerund vs Infinitive
- Phrasal Verbs
- Word Formation
- Confusing Words
- Collocations
- Linking Words & Essay

### 2. Теория по каждой теме
Для всех 12 тем добавлены шпаргалки (`ENG_TH`) с краткими правилами и примерами.

### 3. Генераторы вопросов
Для новых английских тем добавлены новые генераторы и банки формулировок.

Текущее наполнение grade11 English:
- **12 тем**
- **154 базовые проверочные формулировки**
- coverage-аудит по всем 12 темам: **12–14** уникальных формулировок на тему при сэмплировании

### 4. Сетка и хаб
Обновлены:
- `grade11_v2.html` — теперь English реально присутствует в классе
- `index.html` — карточка 11 класса синхронизирована: **38 тем**
- `sw.js` — версия поднята до `trainer-v10`, `wave12_english.js` добавлен в precache

### 5. Аудиты и валидация
Исправлен `curriculum_audit.js`: теперь он учитывает **внешние script src**, а не только inline-скрипты.
Без этого новые patch-слои не попадали в аудит структуры.

Добавлен новый аудит:
- `english_vertical_audit.js`
- артефакты: `ENGLISH_VERTICAL_AUDIT.md`, `ENGLISH_VERTICAL.json`

Расширен `validate_release.py`:
- hook-check для `wave12_english.js`
- English vertical audit
- guard: `grade11` должен иметь минимум **12** тем английского, `grade10` — минимум **4**

### 6. Browser E2E
`browser_e2e_smoke.py` расширен:
- добавлен сценарий для `grade11_v2.html`
- отдельная проверка, что English vertical реально появился и содержит 12 тем

## Новое состояние после wave 12

### Curriculum audit
- `grade11`: **8 предметов**, **38 тем**, **0** тем без шпаргалки
- `grade10`: **15 предметов**, **62 темы**, **0** тем без шпаргалки

### English vertical audit
Сейчас English есть в:
- `grade10`: **6 тем**
- `grade11`: **12 тем**

Суммарно по текущей вертикали:
- **18 тем английского**
- **2 класса** с реальным English-слоем

## Проверки
- `node --check` — OK
- `curriculum_audit.js` — OK
- `topic_coverage_audit.js` — OK
- `english_vertical_audit.js` — OK
- `browser_e2e_smoke.py` — OK
- `validate_release.py` — OK
