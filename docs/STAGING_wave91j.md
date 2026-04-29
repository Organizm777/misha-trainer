# STAGING wave91j

Статический staging-маршрут добавлен как `staging.html`.

Проверочный маршрут перед публикацией:

1. `content_depth.html` — открыть I1–I6 банки, проверить фильтр и экспорт JSON.
2. `teacher.html` — собрать назначение для класса и экспортировать JSON.
3. `embed.html?grade=7&subject=математика` — проверить компактный embed-виджет.
4. `dashboard.html` — проверить ссылки на новые разделы и локальный журнал ошибок.
5. Offline/PWA — убедиться, что `sw.js` precache содержит новые HTML, JS, CSS и JSON.

Playwright-конфигурация лежит в `playwright.config.mjs`, smoke-сценарии — в `tests/e2e/wave91j_content_depth.spec.mjs`. В CI они пока оформлены как инфраструктурная заготовка: запуск требует зависимости `@playwright/test`.
