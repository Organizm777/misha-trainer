# Own roadmap after wave 22

## Что закрыто к этому моменту
- ядро v2 стабилизировано
- offline shell + theme + toast + back/beforeunload закрыты
- backup transfer закрыт
- English vertical `2–11` закрыт
- English infra + English diagnostics закрыты
- theory debt `5–7` закрыт
- subject mesh `8/9/11` и `1–7` закрыт
- progress UX закрыт
- dashboard / analytics 2.0 закрыт

## Следующие волны

### Wave 23 — accessibility foundation
- semantic HTML вместо части `div onclick`
- `aria-*`, `role`, `tabindex`
- `aria-live` для feedback
- `focus-visible`, focus management, focus trap
- `Escape` закрывает модалки
- reduce motion / contrast guards

### Wave 24 — mobile / tablet optimisation
- safe-area polish
- sticky header / bottom nav
- tablet breakpoints
- swipe-навигация
- 16px inputs и touch targets 44x44
- lazy / virtual render для тяжёлых экранов

### Wave 25 — diagnostics & exam layer
- history of diagnostics
- recommendations after diagnostics
- micro-diagnostics
- subject configs expansion
- trial OGE/EGE blocks
- dashboard integration for diagnostics

### Wave 26 — content quality cleanup
- duplicate detector
- question lint
- richer explanations after answer
- cleanup `grade10`
- audit boosters / patches by hand
- unify question style

### Wave 27 — platform hardening
- stale-while-revalidate
- update banner
- manifest/icons/apple-touch-icon
- CSP base layer
- DOM caching / cleanup listeners and timeouts
- single `make check`

### Wave 28 — journal of errors + spaced repetition
- sticky questions
- 1/3/7/14/30 day repeat logic
- weak-topic planner
- daily micro-tests from past errors

### Wave 29 — sharing / parent polish
- QR export/import
- URL-report
- stronger parent report
- print CSS refinement
- PNG cards for more report states

### Wave 30 — gamification 2.0
- XP / levels / combo
- missions
- richer profile shelf
- stronger local leaderboard layer

### Wave 31 — exam content expansion
- OGE/EGE blocks by subject
- score conversion
- exam timer and журнал пробных

### Wave 32 — Russian expansion
- ЕГЭ-русский layers
- school grammar expansion 5–11
- словарные слова vertical

### Wave 33 — Math expansion
- algebra / geometry / calculus / probability depth
- OGE/EGE math packs

### Wave 34 — natural sciences expansion
- physics / chemistry / biology / geography deep packs
- SVG/diagram question types where useful

### Wave 35 — Окружающий мир 1–4 full vertical
- полноценная вертикаль по темам и глубине
- сезонные банки
- визуальные задачи

### Wave 36+
- спецпредметы
- психология
- поздние экспериментальные профили
- институтские слои

## Приоритетная следующая волна
`Wave 23 = accessibility foundation`
