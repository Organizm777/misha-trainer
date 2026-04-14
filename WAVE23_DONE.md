# Wave 23 — accessibility foundation

Что сделано:

- Добавлен общий слой `wave23_accessibility.js` и подключён ко всем HTML-страницам:
  - `index.html`
  - `tests.html`
  - `diagnostic.html`
  - `dashboard.html`
  - `grade1_v2.html … grade11_v2.html`
- Добавлен skip-link `Перейти к содержимому`.
- Добавлен скрытый live-region `aria-live` для screen-reader feedback.
- Добавлены landmark-ролии:
  - `role="banner"` для header
  - `role="main"` для главного контейнера
  - `role="region"` для экранов `.scr`
- Добавлен базовый keyboard-proxy для несемантических кликабельных элементов.
- Для answer-group добавлены роли `radiogroup` / `radio` и `aria-checked`.
- Для feedback-блоков добавлены `role="status"` и `aria-live`.
- Добавлен focus-management при смене экранов.
- Добавлен focus-trap в модальных окнах.
- Escape теперь закрывает верхний диалог.
- Для English-контекста добавляется `lang="en"` на question/theory blocks.
- Добавлены стили для:
  - `:focus-visible`
  - `prefers-reduced-motion`
  - `prefers-contrast: more`
  - минимальных target-сайзов 44×44
  - skip-link
- `sw.js` обновлён до `trainer-v20`, новый слой добавлен в precache.

Проверки и инфраструктура:

- Добавлен `wave23_accessibility_audit.js`.
- Сгенерированы артефакты:
  - `WAVE23_ACCESSIBILITY_AUDIT.md`
  - `WAVE23_ACCESSIBILITY_AUDIT.json`
- Расширен `browser_e2e_smoke.py`:
  - accessibility shell
  - accessibility dialog
  - English `lang=en` checks
- Расширен `validate_release.py` под wave 23 hooks / audit / guards.

Итог:

- browser E2E — OK
- runtime smoke — OK
- flow smoke — OK
- validate_release — OK
