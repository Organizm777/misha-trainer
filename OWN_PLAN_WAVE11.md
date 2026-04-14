# Собственный roadmap после wave 11

## Принцип
Я сознательно веду план не по механическому порядку из большого списка, а по зависимостям:
1. сначала стабильность ядра,
2. потом полнота и глубина контента,
3. затем UX/аналитика,
4. и только после этого тяжёлые платформенные и экспериментальные слои.

Wave 11 закрыла последнюю красную зону по coverage. Следующий шаг — не разбрасываться, а строить вертикали и предметную сетку поверх уже устойчивой базы.

---

## Что уже закрыто к концу wave 11

### Ядро и релизная стабильность
- `tests.html` вылечен от синтаксического падения
- service worker синхронизирован с `v2`
- `dashboard.html` переведён на актуальные `trainer_*_<GRADE_NUM>` ключи
- диагностический режим стабилизирован, `mathall` не падает
- resetProgress, backup export/import, browser back, beforeunload, toast, offline banner, theme toggle — работают
- есть runtime smoke, flow smoke, browser E2E, curriculum audit, coverage audit, единый validate script

### Контент и сетка
- все классы 1–11 сидят на едином `engine10.js`
- тонких subject blocks нет
- в `8–11` нет тем без теории
- диагностические банки доведены минимум до `30` на предмет
- coverage ниже `10` теперь нет вообще

---

## План на 12 следующих волн

### Wave 12 — English vertical, phase 1 (grade 11 core)
Фокус:
- `grade11` английский как полноценный блок уровня B2–C1
- темы: advanced tenses, conditionals, reported speech, passive, modal verbs, articles, gerund/infinitive
- отдельные `ENG_TH` и нормальные шпаргалки
- первые guard-проверки для English vertical

### Wave 13 — English vertical, phase 2 (grade 11 lexical + exam)
Фокус:
- phrasal verbs extended, word formation, collocations, connectors, confusing words, essay structure
- доведение `grade11` английского до полной ЕГЭ-логики
- integration с диагностикой для старших классов

### Wave 14 — English vertical, phase 3 (grades 8–10)
Фокус:
- `grade8` и `grade9` английский с базовыми и средними темами
- `grade10` расширение от текущих 6 тем к полноценной вертикали
- конфигурация сквозного теста по уровням A2/B1/B2

### Wave 15 — English vertical, phase 4 (grades 2–7)
Фокус:
- `2–4`: буквы, слова, простые фразы, числа и цвета
- `5–7`: to be, have got, present/past simple, базовая лексика, spelling/phonics
- общие шпаргалки: irregular verbs, articles, word formation, phrasal verbs

### Wave 16 — Теория и шпаргалки 5–7 с нуля
Фокус:
- закрыть блок `401–440`
- создать `_TH` для `grade5`, `grade6`, `grade7`
- отдельно проверить `grade3–4` и дополнить, где надо
- вывести теории в единый стиль

### Wave 17 — Subject mesh expansion для 8/9/11
Фокус:
- химия, биология, география, литература, вероятность, астрономия/ОБЗР по приоритету
- сначала темы и теория, потом генераторы, потом coverage guards
- не меньше 3–4 тем на новый предмето-класс

### Wave 18 — Subject mesh expansion для 5/6/7 и начальной школы
Фокус:
- литература `5–7`
- английский `5–7` как часть вертикали
- биология 7, география 7, информатика 7
- литературное чтение `1–4`

### Wave 19 — Progress UX
Фокус:
- номер вопроса и progress bar
- `повторить ошибки`
- `продолжить последнюю тему`
- `любимые темы`
- дневной вызов и readiness to diagnostic

### Wave 20 — Analytics / parent layer
Фокус:
- activity heatmap
- weekly/monthly summary
- сравнение `неделя назад vs сейчас`
- radar chart по предметам
- print-friendly и PNG-card отчёта

### Wave 21 — Accessibility foundation
Фокус:
- semantic HTML, role/aria, focus-visible, focus trap
- клавиатурная навигация
- skip link, live regions, reduce motion
- размеры tap-target 44x44
- базовый Lighthouse/axe guard

### Wave 22 — Mobile / tablet optimisation
Фокус:
- tablet breakpoints
- sticky/bottom nav для мобильных
- swipe between questions/topics
- safe-area insets, 16px inputs, touch-action, overscroll tuning
- lazy render / virtual scroll для тяжёлых экранов

### Wave 23 — Content quality and dedup
Фокус:
- ручная ревизия patch-слоёв
- вопросный lint: `answer in options`, `options >= 2`, `hint` not empty
- удаление дублей `grade10`
- нормализация формулировок вопросов и ответов
- подготовка к единому content pipeline

### Wave 24 — Platform hardening
Фокус:
- stale-while-revalidate + баннер новой версии
- manifest/icons/apple-touch-icon
- CSP base policy
- removeEventListener / clearTimeout cleanup
- перенос inline styles в CSS-классы
- DOM caching, debounce, performance budget
- единый `make check`

### Wave 25 — Sharing and transfer
Фокус:
- QR export/import поверх уже существующего transfer-кода
- CSV export/import
- HTML/URL report для родителя
- polish резервных копий без облака

### Wave 26 — Молния и облачный слой
Фокус:
- развязать приватность и рейтинг `Молнии`
- решить судьбу `RUSH_BIN_ID` по всем классам
- либо честный локальный-only режим, либо нормальный облачный backend/очередь/retry

### Wave 27 — Special subjects / psychology (поздний слой)
Фокус:
- отдельный блок спецпредметов
- психология как самостоятельная вертикаль по темам
- никакого смешивания с академическим прогрессом без явной маркировки
- любые нумерологические/натальные вещи, если вообще делать, только как отдельный экспериментальный self-reflection слой, а не как «точная диагностика»

---

## Почему именно так
1. Английский сейчас — самый большой пустой вертикальный пробел.
2. Шпаргалки `5–7` — самый большой теоретический долг.
3. После этого выгоднее расширять subject mesh, а не доукрашивать текущий UI.
4. Accessibility и mobile нельзя держать вечно в хвосте, но их лучше ставить после крупных предметных волн, чтобы не дважды перелопачивать интерфейс.
5. Спецпредметы и психология имеют смысл только после того, как закрыта базовая школьная сеть и стабилизирован core UX.
