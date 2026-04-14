# My roadmap after wave 18

## Что уже реально закрыто
- единый `engine10.js` и `engine10.css`
- `v2`-маршруты и актуальный `sw.js`
- backup export/import через `.json` и код переноса
- browser back / beforeunload / toast / offline banner / theme toggle
- browser E2E + runtime/flow smoke + общий validate script
- закрыта красная зона coverage `<10`
- закрыта English vertical `2–11`
- закрыт theory debt `5–7`
- закрыт split cloud backup vs rush leaderboard
- локальный rush fallback теперь честно работает и честно объяснён

## Что дальше на 10+ волн

### Wave 19 — subject mesh expansion для 8/9/11
Химия, биология, география, литература, вероятность, exam-oriented блоки.
Это следующий самый ценный содержательный слой после английской вертикали и cleanup-а.

### Wave 20 — subject mesh expansion для 5/6/7 и начальной школы
Литература 5–7, биология/география/информатика 7, литературное чтение 1–4, усиление окружающего мира 1–4.

### Wave 21 — progress UX
Номер вопроса, progress bar, repeat errors, continue topic, favourites, random topic, global search across classes.

### Wave 22 — analytics / dashboard 2.0
Heatmap, radar chart, weekly/monthly trend, breakdown до тем, PNG/PDF/CSV export.

### Wave 23 — accessibility foundation
`aria-*`, semantic HTML, keyboard navigation, focus management, `focus-visible`, `prefers-reduced-motion`, contrast pass.

### Wave 24 — mobile / tablet optimisation
Safe-area, 16px inputs, sticky header, bottom nav, swipe, tablet breakpoints, lazy/virtual render.

### Wave 25 — diagnostics & exam layer
Subject configs, history of diagnostics, recommendations after diagnostics, micro-diagnostics, OGE/EGE trial layer.

### Wave 26 — content quality cleanup
Question lint, duplicate detector for `grade10`, unified question style, richer explanations after answer, revision of boosters and patches.

### Wave 27 — platform hardening
Stale-while-revalidate, new version banner, manifest/icons/apple-touch-icon, CSP, DOM caching, `make check` entrypoint.

### Wave 28 — journal of errors + spaced repetition
Sticky questions, spaced repetition buckets `1/3/7/14/30`, weak-topic planner, personal repetition queue.

### Wave 29 — sharing / parent layer polish
QR export/import, URL report, PNG card, print CSS, stronger parent report.

### Wave 30 — gamification 2.0
XP, levels, combo, daily/weekly missions, richer profile shelf, local leaderboard expansion.

### Wave 31 — full `Окружающий мир 1–4`
Не точечно, а отдельной вертикалью с реальным объёмом и визуальным контентом.

### Wave 32+
Special subjects, psychology, institute-level verticals, experimental layers.

## Что считаю устаревшим из старых планов
- пункт «удалить tests.html» уже неадекватен текущей базе: страница живая, linked из `index.html` и требует не удаления, а дальнейшего product polishing
- часть старых пунктов про English `8–11` и theory debt `5–7` уже закрыта и не должна снова попадать в high-priority backlog
