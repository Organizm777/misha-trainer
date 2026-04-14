# Мой roadmap после wave 12

## Что уже закрыто как база
- Единый движок и единая схема localStorage
- Service Worker и offline shell
- backup export/import без обязательного облака
- browser back / beforeunload / toast / offline banner / theme toggle
- coverage guard: нет тем ниже 10 уникальных формулировок
- diagnosis banks: минимум 30 usable-вопросов на предмет
- English vertical phase 1: grade11 = 12 тем, grade10 = 6 тем

## Что НЕ тяну раньше времени
Я сознательно не уводил эту волну в:
- спецпредметы и психологию
- геймификацию уровней/XP
- новую большую облачную инфраструктуру
- «ещё 200 функций» поверх не до конца закрытой школьной сетки

Сначала — English vertical, предметный mesh, доступность, mobile, analytics и качество контента.

## План на 10+ следующих волн

### Wave 13 — English vertical, phase 2 (grades 8–9)
Цель:
- добавить `Английский` в `grade8_v2` и `grade9_v2`
- довести оба класса до **8 тем** каждый
- покрыть A2–B1/B1: tenses, passive, conditionals 0–2, modals, vocabulary, spelling
- встроить в audit отдельные guards по 8/9 классам

### Wave 14 — English vertical, phase 3 (grades 5–7)
Цель:
- `grade5/6`: по **4** темам
- `grade7`: **6** тем
- A1–A2/A2-B1 вертикаль с простыми ENG_TH и генераторами
- сохранить junior-friendly формулировки

### Wave 15 — English vertical, phase 4 (grades 2–4)
Цель:
- letters & sounds, first words, simple phrases, numbers & colours
- лёгкая теория, крупный UI, без перегруза младших
- отдельный guard на начальную English vertical

### Wave 16 — subject mesh, phase 1 (8/9/11)
Цель:
- химия, биология, география, литература, вероятность, дополнительные exam-блоки
- приоритет по планам: ОГЭ/ЕГЭ-классы
- не менее 3–4 тем на новый предмет, сразу со шпаргалками

### Wave 17 — subject mesh, phase 2 (5/6/7 + начальная школа)
Цель:
- литература 5–7
- биология/география/информатика 7
- литературное чтение 1–4
- добить тонкие предметы до нормальной сетки

### Wave 18 — progress UX
Цель:
- номер вопроса
- progress bar
- повтор ошибок
- продолжить последнюю тему
- избранные темы
- readiness to diagnostic на главном экране

### Wave 19 — analytics/dashboard
Цель:
- heatmap активности
- radar chart по предметам
- weekly/monthly trend
- breakdown по предметам и темам
- PDF/PNG-экспорт отчёта для родителя

### Wave 20 — accessibility foundation
Цель:
- aria / role / tabindex
- semantic HTML вместо части `div onclick`
- focus-visible
- keyboard nav
- live regions для feedback
- reduce motion / contrast guards

### Wave 21 — mobile & tablet optimisation
Цель:
- 16px inputs
- safe-area / notch handling
- sticky header
- bottom navigation
- swipe gestures
- lazy render / virtual render для тяжёлых экранов

### Wave 22 — content quality & revision
Цель:
- ревизия boosters и patches
- детектор дублей
- unified wording style
- better hints / explanations
- автотест answer∈options и hint non-empty

### Wave 23 — generators 2.0
Цель:
- вставь пропуск
- найди ошибку
- сопоставь
- верно/неверно
- выбери все правильные
- контекстные подсказки

### Wave 24 — exam layer
Цель:
- ОГЭ/ЕГЭ-блоки по приоритетным предметам
- пробные мини-диагностики
- история диагностик
- рекомендации после диагностики

### Wave 25 — error journal & spaced repetition
Цель:
- хранить конкретные ошибки
- план повторения 1/3/7/14/30 дней
- “мои сложные вопросы”
- микро-тесты из прошлых ошибок

### Wave 26 — parent & planning layer
Цель:
- weekly parent report
- study plan by dates
- reverse countdown to diagnostics
- recommended schedule
- progress against plan

### Wave 27 — platform hardening
Цель:
- stale-while-revalidate
- баннер новой версии
- manifest file + PWA icons + apple-touch-icon
- CSP
- removeEventListener / clearTimeout cleanup
- DOM caching
- единый `make check`

### Wave 28 — sharing & transfer polish
Цель:
- QR export/import
- CSV export
- URL report
- print-friendly styles
- share card / PNG result

### Wave 29 — gamification system
Цель:
- XP / levels / combo / profile card
- daily missions
- richer badges
- local leaderboard without cloud dependency

### Wave 30 — late extensions
Цель:
- спецпредметы
- психология как отдельная вертикаль
- экспериментальные взрослые слои

## Принцип приоритизации
1. Сначала закрываю школьное ядро и English vertical.
2. Потом subject mesh + UX + analytics.
3. Затем accessibility/mobile/platform.
4. И только после этого — поздние расширения и экспериментальные режимы.
