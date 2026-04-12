# Wave 9 — UX / shell / resilience

## Что сделано

### 1) Ручная тема + тёмная тема без рассинхрона
- добавлен общий `wave9_ui.js`
- во все HTML-страницы добавлен ранний bootstrap темы из `localStorage`
- добавлен переключатель темы `system → light → dark`
- тема применяется через `data-theme` на `<html>`
- синхронизируется `meta[name="theme-color"]`
- добавлены CSS-overrides для проблемных hardcoded inline-цветов (`#fff`, `#f5f3ee`, `#1a1a2e`, `#6b6b7e`, `#374151`, `#ddd`)

### 2) Toast + оффлайн-индикатор
- добавлен `showToast()`
- короткие `alert()` теперь автоматически превращаются в toast-уведомления
- добавлен фиксированный индикатор `Работаете офлайн`
- добавлены `online/offline` listeners
- добавлены мягкие error-toasts для `error` и `unhandledrejection`

### 3) История экранов и защита от случайного выхода
- для SPA-экранов классов добавлен `history.pushState / popstate`
- браузерная кнопка «Назад» теперь возвращает по внутренним экранам, а не роняет SPA
- при попытке выйти во время активной сессии показывается подтверждение
- добавлен `beforeunload` guard на активную сессию

### 4) PWA / релизный слой
- `sw.js` обновлён до `trainer-v7`
- в precache добавлены `wave8_boosters.js` и `wave9_ui.js`
- `validate_release.py` обновлён: теперь проверяет подключение `wave9_ui.js` и ранний bootstrap темы
- `browser_e2e_smoke.py` расширен: theme toggle, browser back, back during session

## Файлы, которые изменены
- `index.html`
- `tests.html`
- `diagnostic.html`
- `dashboard.html`
- `grade1_v2.html` ... `grade11_v2.html`
- `sw.js`
- `browser_e2e_smoke.py`
- `validate_release.py`
- новый `wave9_ui.js`

## Проверки
- `node runtime_smoke_check.js` → OK
- `node flow_smoke_check.js` → OK
- `python browser_e2e_smoke.py` → OK
- `validate_release.main()` → OK
