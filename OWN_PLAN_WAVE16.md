# Собственный roadmap после wave 16

## Что уже закрыто

- Ядро `v2`: единый `engine10.js`, актуальный Service Worker, backup export/import, history/popstate, beforeunload, toast, offline banner, theme toggle.
- Curriculum base: нет thin blocks, нет тем без шпаргалок, нет coverage-красной зоны `<10`.
- English vertical: закрыт milestone `2–11`.
- Theory debt `5–7`: закрыт rich-theory guard для 48 целевых тем.
- Автоматические проверки: syntax, runtime smoke, flow smoke, browser E2E report, curriculum audit, topic coverage, English audit, theory debt audit.

## Что ещё остаётся по-крупному

- Lightning / privacy split и честная судьба `RUSH_BIN_ID`.
- `removeEventListener` / `clearTimeout` cleanup.
- `tests.html` как мёртвый файл и техдолг вокруг него.
- Дубликаты `grade10` и единый quality-lint контента.
- Расширение предметной сетки вне английского.
- Accessibility и mobile/tablet слой.
- Exam / diagnostic layer и журнал ошибок.

## План на 10+ волн вперёд

### Wave 17 — English infrastructure
- shared ENG-шпаргалки: неправильные глаголы, словообразование, артикли, фразовые глаголы;
- English в `diagnostic.html`;
- отдельная метрика `English level` в профиле;
- micro-diagnostic по английскому.

### Wave 18 — critical cleanup pack
- разделить приватность и рейтинг `Молнии`;
- решить судьбу `RUSH_BIN_ID` и локального рейтинга;
- `removeEventListener` / `clearTimeout` cleanup;
- удалить или окончательно перепрофилировать `tests.html`.

### Wave 19 — subject mesh для 8/9/11
- химия, биология, география, литература, вероятность;
- первые exam-oriented блоки для ОГЭ/ЕГЭ.

### Wave 20 — subject mesh для 5/6/7 и начальной школы
- литература `5–7`;
- биология/география/информатика `7`;
- литературное чтение `1–4`.

### Wave 21 — progress UX
- номер вопроса, progress bar, repeat errors, continue topic, favourites, random topic;
- дневной вызов и readiness to diagnostic.

### Wave 22 — dashboard / analytics 2.0
- heatmap, radar chart, weekly/monthly trend, breakdown по предметам и темам;
- PDF / PNG / CSV отчёты.

### Wave 23 — accessibility foundation
- semantic HTML, aria, focus management, keyboard navigation;
- prefers-reduced-motion, high contrast, touch targets 44×44.

### Wave 24 — mobile / tablet optimisation
- safe-area, sticky header, bottom nav, swipe, tablet breakpoints;
- lazy / virtual render для тяжёлых классов.

### Wave 25 — content quality cleanup
- grade10 duplicate sweep;
- question lint и unified wording;
- stronger explanations after answers.

### Wave 26 — diagnostics / exam layer
- subject configs for diagnostic;
- history of diagnostics;
- OGE/EGE trial blocks;
- recommendations after diagnostic.

### Wave 27 — journal of errors + spaced repetition
- persistent error log;
- review loops 1/3/7/14/30;
- “мои сложные вопросы”.

### Wave 28 — platform hardening
- stale-while-revalidate + update banner;
- manifest/icons/apple-touch-icon;
- CSP and sanitize sweep;
- unified `make check`.

### Wave 29 — report / transfer / sharing
- QR export/import;
- shareable parent report;
- PNG-card and print CSS.

### Wave 30 — Окружающий мир 1–4
- полноценная вертикаль по темам и depth-coverage.

### Wave 31 — gamification 2.0
- XP, levels, missions, combo, profile shelf, local leaderboards.

### Wave 32 — cloud / privacy hardening
- локальный и облачный контуры отдельно;
- безопасный fallback без npoint race-condition.

### Wave 33 — late layers
- special subjects;
- psychology;
- experimental adult / institute blocks.

## Следующий ход

Следующий рациональный шаг: **wave 17 = English infrastructure**. Это продолжает уже закрытую English vertical и совпадает с поздними пунктами плана про отдельные ENG-шпаргалки, English в диагностике и метрику уровня.
