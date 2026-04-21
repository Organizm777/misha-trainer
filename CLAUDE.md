# CLAUDE.md

Этот файл — ориентир для Claude Code (и любого другого ИИ-ассистента), чтобы не приходилось реконструировать архитектуру с нуля в каждой сессии.

## Что это за проект

Статический PWA-тренажёр для школьников 1–11 классов. Чистый HTML/CSS/JS без сборщика. Хостится на GitHub Pages. Service Worker кеширует всё для офлайн-режима.

## Структура

```
/
├── index.html              # выбор класса
├── grade{1..11}_v2.html    # страница класса — тренировка + теория
├── dashboard.html          # родительская панель
├── diagnostic.html         # диагностический тест
├── tests.html, spec_subjects.html
├── sw.js                   # Service Worker с CACHE_NAME
├── manifest.webmanifest    # PWA-манифест
├── healthz.json            # build info (читается Settings)
├── CHANGELOG.md
└── assets/
    ├── _src/               # ИСХОДНИКИ (CSS/JS до хэширования)
    │   ├── css/engine10.css
    │   └── js/bundle_*.js, engine10.js, chunk_*, grade*_data.js
    ├── css/                # собранные с хэшем: engine10.{hash}.css
    ├── js/                 # собранные с хэшем: bundle_*.{hash}.js
    ├── data/spec_subjects/*.json
    └── icons/
```

## Bundle-архитектура — ключевые факты

- `bundle_shell.*.js` — обёртка: header, навигация, хэш-роутинг, wave36_perf (кеш DOM-запросов). Preload с `fetchpriority=high`.
- `bundle_grade_content.*.js` (~282 KB) — движок тренировки (вопросы, варианты, подсказки).
- `bundle_grade_after.*.js` (~200 KB) — **НЕ дубликат shell**. Экраны после ответа: фидбек, прогресс, daily meter, геймификация. Грузится defer.
- `bundle_grade_after` и `bundle_shell` — разные бандлы; не пытаться объединять.
- `grade{8,9,10,11}_data.*.js` — внешние данные вопросов для старших классов. **`grade10_data` = ~735 KB** — кандидат на разбиение по темам.
- grade1–7: данные **всё ещё inline** в `<script>` самих `grade*_v2.html`. Вынести во внешние файлы — в планах.
- `SUBJ` (переменная предмета) определяется inline в HTML **до** defer-скриптов — порядок важен.

## Service Worker — правила

**При каждом изменении статического ассета (JS/CSS/HTML/JSON в `ASSETS[]`) обязательно:**

1. Инкрементировать `CACHE_NAME` в `sw.js:1`. Формат строгий: `trainer-build-<wave>-<YYYY-MM-DD>`. Пример: `trainer-build-wave86j-2026-04-21` → следующий `wave86k-<today>` или `wave87a-<today>`. **Формат обязателен** — Settings-экран регекспом достаёт отсюда `<wave>` и `<date>` и показывает юзеру. Если формат нарушен, Settings покажет `?`.
2. Если добавлен новый файл — добавить его путь в массив `ASSETS` в `sw.js`.
3. Если у файла сменился хэш — обновить имя в `ASSETS` (строки 26–65).
4. (Опц., косметика) `healthz.json` — поля `wave`/`version`/`build_id` дублируют то же. UI их не читает, но для ручной проверки и внешнего мониторинга полезно держать в синхроне.

**Settings-экран читает билд динамически** из `caches.keys()` (fallback — fetch `./sw.js`). Хардкод `BUILD_WAVE`/`BUILD_DATE` в `bundle_shell.js` **убран**. Менять надо только `CACHE_NAME` в `sw.js`.

**Auto-bump правило для ИИ-ассистента:** при любой правке файла из `ASSETS[]` (top-level HTML, `assets/js/*`, `assets/css/*`, `manifest.webmanifest`, `healthz.json`, `assets/data/**`, `assets/icons/*`) **в том же коммите** обновить:
- `sw.js:1` `CACHE_NAME` — инкремент wave-буквы (`wave86j → wave86k`, на `z` — следующая волна с `a`), дата — сегодняшняя.
- `healthz.json` — поля `wave`, `version`, `build_id` синхронно.

Не бампить при правках `.claude/`, `CHANGELOG.md`, `CLAUDE.md`, файлов вне `ASSETS[]`. Не спрашивать разрешения — рутина.

Стратегия: stale-while-revalidate. Fonts (Google) — в RUNTIME_CACHE, остальное — STATIC_CACHE. Fallback для `navigate` → `./index.html`.

`updateViaCache:none` в регистрации — SW всегда проверяется свежим.

## CSP

`script-src 'self' 'unsafe-inline' blob:` — **inline разрешён** (у нас есть inline `onclick` и inline `<script>` для `SUBJ`).

- **Без `unsafe-eval`** — не использовать `eval()`, `new Function()` без крайней нужды.
- `blob:` разрешён — для Web Workers / dynamic imports в будущем.
- Внешние домены: `fonts.googleapis.com`, `fonts.gstatic.com`, `api.npoint.io`.

Если будем убирать `unsafe-inline` — это полноценная миграция: все `onclick=` в `addEventListener`. Отдельный проект.

## Известные нерешённые проблемы

- **CLS 0.416 на мобиле** — 12px whole-viewport shift. Гипотеза про класс `wave24-tx` / mobile-shell — проверена, не помогла. Кандидаты на исправление:
  - `#player-badge`, `#main-search-slot`, `#daily-meter`, `#hb` (hbadge) — нет зарезервированной высоты в CSS; заполняются JS после hydration.
  - header `position:sticky` с динамически появляющимся `.hbadge`.
  Нужен DevTools CLS-timeline на реальном мобильном viewport для точной диагностики.

## Локальный Lighthouse-запуск

```bash
# 1. Поднять сервер (http-server с no-cache)
npx --yes http-server -p 8765 -c-1 --silent &

# 2. 3 прогона Lighthouse (headless Chrome)
for i in 1 2 3; do
  npx --yes lighthouse http://127.0.0.1:8765/index.html \
    --only-categories=performance \
    --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
    --output=json --output-path=./run-$i.json --quiet
done

# 3. Извлечь медиану метрик — см. commit history для готовых node -e сниппетов.

# 4. Остановить сервер
taskkill //F //IM node.exe //FI "COMMANDLINE eq *http-server*"
```

## Deployment

GitHub Pages из ветки `main` (ветки `gh-pages` нет). Workflow генерирует `asset-manifest.json`, бампит SW, публикует. После push merge автоматический.

## Совместная работа с GPT Pro

Владелец использует GPT Pro как основного исполнителя и **периодически перезаливает репо целиком**. Поэтому:

- Мои (Claude) правки могут исчезнуть при следующей перезаливке. Не предполагать, что предыдущие изменения сохранились — всегда перечитывать файлы.
- Этот `CLAUDE.md` — стабильный контекст, он должен переживать перезаливки (если GPT его не удалит).
- `.claude/settings.json` и `.claude/settings.local.json` тоже стабильны, если не включены в чистку.
- Перед инвазивной правкой — показать владельцу план/diff, дождаться согласия.
- `git push` — **только по явной просьбе**.

## Стиль ответов

Терсе, на русском, без эмодзи. Перед нетривиальной правкой — план. Не объяснять очевидное в коде (комменты только там, где *почему* неочевидно).
