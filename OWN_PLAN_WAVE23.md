# Own plan after wave 23

Текущее состояние:

- Закрыты core stability, English vertical 2–11, theory debt 5–7, subject mesh 1–11, progress UX, analytics 2.0 и accessibility foundation.
- Полный валидатор проходит: syntax + SW + runtime/flow/browser smoke + curriculum + coverage + English + theory + rush + wave hooks.

Следующие 12+ волн:

## Wave 24 — mobile / tablet optimisation
- safe-area insets
- sticky header / bottom navigation
- touch target polish
- swipe navigation where it реально полезно
- input/font-size 16px consistency
- tablet breakpoints / двухколоночные layout’ы
- lazy / virtual render для тяжёлых списков

## Wave 25 — diagnostics & exam layer
- subject configs для diagnostics
- history of diagnostics
- recommendations after diagnostics
- micro-diagnostics
- пробные ОГЭ / ЕГЭ блоки
- integration of diagnostics into dashboard readiness

## Wave 26 — content quality cleanup
- duplicate detector for grade10
- question lint / validator
- manual review queue for boosters / patches
- единый стиль формулировок
- richer explanations after answers
- stronger math / physics generator ranges

## Wave 27 — platform hardening
- stale-while-revalidate SW strategy
- update banner when a new version is available
- manifest/icons/apple-touch-icon
- CSP baseline
- DOM caching where it really helps
- `make check` wrapper over all validation scripts

## Wave 28 — journal of errors + spaced repetition
- persistent error journal
- sticky questions
- 1/3/7/14/30 day repetition scheduler
- weak-topic planner
- daily review queue from mistakes

## Wave 29 — parent/report/sharing polish
- QR export/import
- URL report
- stronger PNG card
- print CSS for reports and theory
- richer parent layer around plans, weak zones and weekly summary

## Wave 30 — gamification 2.0
- XP / levels / combo
- richer profile shelf
- daily / weekly missions
- better local leaderboard layer

## Wave 31 — exam content expansion
- OGE blocks by subjects
- EGE blocks by subjects
- timed exam sessions
- exam-oriented scoring summaries

## Wave 32 — Russian vertical expansion
- grade5–11 Russian expansion
- EGE task-layer for 11
- richer theory + decomposition by rules

## Wave 33 — Math vertical expansion
- grade1–11 math expansion
- OGE/EGE math formats
- SVG / visual generators where worthwhile

## Wave 34 — natural sciences expansion
- physics / chemistry / biology / geography depth
- richer diagrams and visual questions
- exam-oriented layers for 8/9/11

## Wave 35 — full Окружающий мир 1–4 vertical
- grade1–4 expanded topics
- richer visuals for younger students
- stronger ecology / map / human body coverage

## Wave 36 — architecture cleanup
- inline style debt reduction
- shared content source normalisation
- source-of-truth cleanup for boosters / patches / IIFE layers
- optional build pipeline simplification

## Wave 37+ — late layers
- special subjects
- psychology
- higher-ed / institute topics
- experimental profile layers

Что сознательно не поднимается раньше:
- спецпредметы
- психология
- поздняя «вау»-геймификация
- тяжёлая серверная миграция

Причина: после wave 23 объективно важнее mobile, diagnostics/exam, quality, platform and repetition layer.
