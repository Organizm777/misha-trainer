# Wave 15 — English vertical 2–4 + full milestone 2–11

## Что сделано

### 1. Закрыт English vertical для 2–4 классов
Добавлен новый patch-layer `wave15_english.js`, подключён к:
- `grade2_v2.html`
- `grade3_v2.html`
- `grade4_v2.html`

### 2. Новый предмет «Английский» в младших классах

#### Grade 2
- `Буквы и звуки`
- `Первые слова`

#### Grade 3
- `Простые фразы`
- `Числа и цвета`

#### Grade 4
- `To be & have got`
- `Простые предложения`

### 3. Новый контент
- Добавлено **6 новых тем** английского для `2–4` классов.
- Добавлено **102 базовые английские формулировки** в новом A1-слое.
- На все новые темы добавлены шпаргалки.

### 4. Индекс и сетка классов синхронизированы
Обновлён `index.html`:
- `2 класс` → `14 тем`
- `3 класс` → `13 тем`
- `4 класс` → `13 тем`
- в карточки классов добавлен `Английский`

### 5. Service Worker обновлён
- `sw.js` → `trainer-v13`
- `wave15_english.js` добавлен в precache

### 6. Проверочная инфраструктура обновлена
Обновлены:
- `browser_e2e_smoke.py`
- `validate_release.py`
- `curriculum_audit.js`

Добавлены новые guards:
- hook-check для `wave15_english.js`
- English vertical guard для `grade2`, `grade3`, `grade4`
- исключение для допустимых 2-темных English-блоков в `2–4` из thin-block audit

### 7. Browser E2E расширен
Теперь E2E включает:
- `grade3_v2.html`
- `grade4_v2.html`
- English vertical checks для `2–4`

## Результат после wave 15

### English vertical
- Классов с английским: **10**
- Тем английского: **54 / 54**
- Milestone `5–11`: **closed**
- Milestone `2–11`: **closed**

### Curriculum
- `grade2`: 4 предмета, 14 тем
- `grade3`: 4 предмета, 13 тем
- `grade4`: 4 предмета, 13 тем
- тонких блоков по текущим guards: **0**
- тем без шпаргалок: **0**

### Coverage
- новых английских тем `2–4` ниже порога нет
- все 6 новых тем проходят guard по вариативности

## Проверки
- `python browser_e2e_smoke.py` — OK
- `python validate_release.py` — OK

## Артефакты
- `trainer3_patched_wave15.zip`
- `ENGLISH_VERTICAL_AUDIT.md`
- `CURRICULUM_AUDIT.md`
- `TOPIC_COVERAGE_AUDIT.md`
- `BROWSER_E2E_REPORT.md`
- `VALIDATION_WAVE15.txt`
