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
- `chunk_grade_content_wave*_wave86t.*.js` — split runtime-injection контента по исходным wave-секциям. Grade-страницы подключают только нужные секции; 10 класс после wave86s обходится без общего content-бандла.
- `bundle_grade_runtime_core_wave87n.*.js` (~262 KB) — eager core runtime grade-страниц. Внутри: `chunk_roadmap_wave86q_accessibility_theme`, `bundle_grade_after`, `chunk_roadmap_wave86n_progress_tools`, `bundle_error_tracking`.
- `bundle_grade_runtime_features_wave87n.*.js` (~141 KB) — lazy features bundle: `chunk_roadmap_wave86r_theory_achievements`, `chunk_roadmap_wave86p_exam_challenge`, `chunk_roadmap_wave86v_pvp_link_battle`, `bundle_gamification_xp`, `bundle_gamification_meta`.
- `bundle_grade_runtime_services_wave87n.*.js` (~157 KB) — lazy services bundle: `bundle_sharing`, `bundle_profile_social`, `chunk_roadmap_wave86w_cloud_sync`.
- `window.wave87nRuntimeSplit` живёт в core bundle: он замеряет `interactive`, пишет perf-сэмплы в `localStorage.trainer_perf_samples_wave87n_<grade>`, на idle/timeout догружает features/services и умеет `hydrateForAction()` для раннего клика по profile/report/backup actions.
- Старый merged `bundle_grade_runtime_wave86z.*.js` удалён из live build. Standalone hashed outputs контекстных модулей по-прежнему могут существовать для других страниц (например, diagnostic), а контроль orphan build-artifacts остаётся в `tools/cleanup_build_artifacts.mjs --check`.
- `grade{1..11}_data.*.js` — внешние данные вопросов по классам. С wave86o классы 1–7 вынесены из inline HTML; с wave86s `grade10_data` стал лёгким shell, а тяжёлые банки 10 класса живут в `grade10_subject_*_wave86s.*.js` и подгружаются lazy-loader'ом.
- `SUBJ` определяется в grade-data файлах **до** `wave35_plans`/content-injection/`engine10`; порядок defer-скриптов важен.

### Runtime-injection контента

Аудит предметов нельзя делать только по inline `SUBJ` в `grade*_v2.html`: это только базовый слой. Реальная карта предметов собирается в рантайме из нескольких источников:

- `grade1_data.*.js` … `grade11_data.*.js`: базовый скелет `SUBJ` и генераторы вопросов;
- `chunk_grade_content_wave*_wave86t.*.js`: бывший монолит `bundle_grade_content`, разбитый по исходным wave-секциям; grade-страницы подключают только нужные секции с английским, литературой, окружающим миром и roadmap-контентом;
- `bundle_boosters.*.js`: расширение банков, особенно 10 класс;
- wave-чанки `chunk_subject_expansion_wave31/32/33/38/56/57/58/59/60/61/63.*.js`: дополнительные темы и предметы, которые добавляются после базового `SUBJ`.

Перед gap-анализом нужно загружать страницу класса в том же порядке, что браузер: grade-data → `wave35_plans` → нужные `chunk_grade_content_wave*_wave86t` → wave-чанки → `engine10` → `bundle_grade_runtime_core_wave87n` (после этого lazy features/services могут догрузиться сами, но на карту предметов они не влияют). Иначе аудит снова покажет ложные «пробелы».

Former standalone runtime-слои `bundle_grade_after`, `chunk_roadmap_wave86n_progress_tools`, `chunk_roadmap_wave86p_exam_challenge`, `chunk_roadmap_wave86r_theory_achievements`, `chunk_roadmap_wave86v_pvp_link_battle`, `chunk_roadmap_wave86w_cloud_sync` теперь распределены между `bundle_grade_runtime_core_wave87n`, `bundle_grade_runtime_features_wave87n` и `bundle_grade_runtime_services_wave87n`. Для content-аудита это по-прежнему non-content UX/runtime code.

## Service Worker — правила

**При каждом изменении статического ассета (JS/CSS/HTML/JSON в `ASSETS[]`) обязательно:**

1. Инкрементировать `CACHE_NAME` в `sw.js:1`. Формат строгий: `trainer-build-<wave>-<YYYY-MM-DD>`. Пример: `trainer-build-wave86j-2026-04-21` → следующий `trainer-build-wave86k-<today>` или `trainer-build-wave87a-<today>`. **Формат обязателен** — Settings-экран регекспом достаёт отсюда `<wave>` и `<date>` и показывает юзеру. Если формат нарушен, Settings покажет `?`.
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

С wave86u HTML-страницы работают со strict `script-src`, а с wave86x — и со strict style-side CSP:

```
script-src 'self' blob:;
style-src 'self' https://fonts.googleapis.com;
style-src-elem 'self' https://fonts.googleapis.com;
style-src-attr 'none';
```

- Inline `<script>` в HTML запрещены и должны выноситься во внешние hashed chunks.
- Static HTML `on*=` обработчики запрещены; новый код должен использовать `addEventListener`. Transitional runtime-generated markup обслуживает `chunk_roadmap_wave86u_csp_bridge.*.js`.
- Static HTML inline `style="..."` и `<style>` запрещены; public HTML больше не содержит transitional `data-wave86x-style`, а legacy runtime styles funnel'ятся через runtime-only shim `chunk_roadmap_wave86x_style_csp_bridge.*.js` в same-origin CSSOM sheet, поэтому `style-src` / `style-src-elem` больше не требуют `blob:`.
- **Без `unsafe-eval`** — не использовать `eval()` и `new Function()`.
- Внешние домены: `fonts.googleapis.com`, `fonts.gstatic.com`, `api.npoint.io`.

## Известные нерешённые проблемы

- **CLS 0.416 на мобиле** — 12px whole-viewport shift. Гипотеза про класс `wave24-tx` / mobile-shell — проверена, не помогла. Кандидаты на исправление:
  - `#player-badge`, `#main-search-slot`, `#daily-meter`, `#hb` (hbadge) — нет зарезервированной высоты в CSS; заполняются JS после hydration.
  - header `position:sticky` с динамически появляющимся `.hbadge`.
  Нужен DevTools CLS-timeline на реальном мобильном viewport для точной диагностики.

## Локальный Lighthouse / LHCI запуск

С wave87s CI больше не использует `lhci autorun` и не поднимает `http-server` вручную для статического сайта. Базовая локальная проверка теперь такая же, как в CI:

```bash
# 1. Убедиться, что Chromium/Chrome доступен
export CHROME_PATH="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"

# 2. Установить LHCI CLI локально (без package.json в репозитории)
npm install --no-save --no-audit --no-fund @lhci/cli@0.15.1

# 3. Repo preflight
node tools/cleanup_build_artifacts.mjs --check
node tools/audit_performance_wave86z.mjs
node tools/audit_static_events_wave87e.mjs

# 4. LHCI run
npx lhci healthcheck --fatal
npx lhci collect --config=.lighthouserc.json
npx lhci assert --config=.lighthouserc.json
```

`.lighthouserc.json` использует `collect.staticDistDir: "./"` и сам поднимает временный localhost для `index.html?choose`, `grade3_v2.html` и `grade10_v2.html`. Для release-аудита инфраструктуры есть `node tools/audit_lighthouse_ci_wave87s.mjs`.

## Deployment

GitHub Pages из ветки `main` (ветки `gh-pages` нет). Workflow генерирует `asset-manifest.json`, бампит SW, публикует. После push merge автоматический.

После merge/rebundle прогонять `node tools/cleanup_build_artifacts.mjs --check`; для локальной чистки старых hashed outputs использовать `--apply`. Этот же check теперь крутится в CI вместе с `tools/validate_questions.js`.

## Совместная работа с GPT Pro

Владелец использует GPT Pro как основного исполнителя и **периодически перезаливает репо целиком**. Поэтому:

- Мои (Claude) правки могут исчезнуть при следующей перезаливке. Не предполагать, что предыдущие изменения сохранились — всегда перечитывать файлы.
- Этот `CLAUDE.md` — стабильный контекст, он должен переживать перезаливки (если GPT его не удалит).
- `.claude/settings.json` и `.claude/settings.local.json` тоже стабильны, если не включены в чистку.
- Перед инвазивной правкой — показать владельцу план/diff, дождаться согласия.
- `git push` — **только по явной просьбе**.

## Стиль ответов

Терсе, на русском, без эмодзи. Перед нетривиальной правкой — план. Не объяснять очевидное в коде (комменты только там, где *почему* неочевидно).

### wave86q runtime/accessibility/tooling notes

`chunk_roadmap_wave86q_accessibility_theme.*.js` — non-content runtime enhancer. It does not mutate `SUBJ` or question banks. It owns the manual Light/Dark/System toggle, index-page search, result-share shortcuts, skip-link, ARIA live region and lightweight dialog/button annotations.

Theme state remains in `localStorage.trainer_theme` with values `system`, `light`, `dark`. The head bootstrap still sets `data-theme` early; the wave86q chunk injects explicit `[data-theme]` CSS overrides after load.

Lighthouse CI budget config lives in `.lighthouserc.json`; the workflow is `.github/workflows/lighthouse-budget.yml`.
Question-bank regression workflow lives in `.github/workflows/validate-questions.yml`; it runs `tools/cleanup_build_artifacts.mjs --check` and `tools/validate_questions.js`.

Content generation drafts are produced by `tools/generate_content_claude.mjs`. Generated JSON must be manually reviewed before copying into runtime content chunks.

### wave86r runtime/theory/achievements notes

`chunk_roadmap_wave86r_theory_achievements.*.js` — non-content runtime enhancer for D5/D10/E2. It does not add subjects or question banks. It normalizes missing `topic.th` at runtime with a generic theory fallback, inserts collapsed «📖 Теория по теме» blocks on subject topic lists, patches answer reaction to show lightweight feedback toasts, and extends the existing `BADGES` array with 12 progress-based achievements.

The chunk intentionally keeps all state in existing stores: `trainer_progress_<grade>`, `trainer_daily_<grade>`, `trainer_streak_<grade>`, plus read-only use of `trainer_wave86p_results_<grade>` for weekly achievement checks. It exposes `window.wave86rTheoryAchievements.auditSnapshot()` for smoke checks.

### wave86t grade content split

C4 закрыт как payload split без роста precache-дублей: монолитный `bundle_grade_content.*.js` удалён из браузерной цепочки и заменён на 11 hashed chunks, по одному на исходную wave-секцию:

- `chunk_grade_content_wave12_english_wave86t.*.js` — 11 класс;
- `chunk_grade_content_wave13_english_wave86t.*.js` — 8–9 классы;
- `chunk_grade_content_wave14_english_wave86t.*.js` — 5–7 классы;
- `chunk_grade_content_wave15_english_wave86t.*.js` — 2–4 классы;
- `chunk_grade_content_wave16_theory_wave86t.*.js` — теория 5–7;
- `chunk_grade_content_wave19_mesh_8911_wave86t.*.js` — mesh 8/9/11;
- `chunk_grade_content_wave20_mesh_567primary_wave86t.*.js` — mesh 1–7;
- `chunk_grade_content_wave34_world_wave86t.*.js` — окружающий мир 1–4;
- `chunk_grade_content_wave86k_roadmap_gaps_wave86t.*.js` — roadmap gaps 5–8;
- `chunk_grade_content_wave86l_informatics_56_wave86t.*.js` — информатика 5–6;
- `chunk_grade_content_wave86l_content_balance_wave86t.*.js` — баланс 4–7.

`grade10_v2.html` теперь не подключает content-injection chunk: после wave86s его банки живут в `grade10_data` shell + lazy subject chunks + профильных wave-чанках. При добавлении нового runtime-injection контента сначала определить диапазон классов и добавить отдельную секцию/chunk, а не возвращать общий бандл.

### wave86s grade10 lazy data split

`grade10_data.*.js` больше не содержит весь банк 10 класса. Он создаёт лёгкий `SUBJ` skeleton и карту hashed subject chunks. Реальные генераторы для предметов 10 класса лежат в `grade10_subject_<subject>_wave86s.*.js` и применяются через `window.__wave86sApplyGrade10Subject()`.

`chunk_grade10_lazy_wave86s.*.js` должен подключаться сразу после `engine10`: он патчит `openSubj`, `startGlobalMix`, `startRush`, `startDiag` и перехватывает exam/weekly challenge, чтобы нужные банки были загружены до генерации вопросов. Lazy chunks обязательно должны быть в `sw.js` precache, иначе офлайн-режим 10 класса потеряет предметы.

### wave86u strict script CSP bridge

C5 начинался в wave86u с `script-src`: CSP перестал содержать `'unsafe-inline'` в `script-src` на HTML-страницах. Начиная с wave86x, style-side тоже переведён на strict CSP: inline `<style>` вынесены во внешние hashed CSS assets, static HTML очищен от inline `style`, а к wave87p transitional `data-wave86x-style` полностью исчез из public HTML. `style-src` / `style-src-elem` / `style-src-attr` по-прежнему не содержат `'unsafe-inline'`.

`chunk_roadmap_wave86u_csp_bridge.*.js` подключается ранним blocking script в `<head>` всех HTML-страниц. Он делает две вещи: ранний bootstrap `data-theme` вместо прежнего inline `<script>` и compatibility layer для legacy inline handlers. Static HTML `on*=` обработчики переведены в `data-wave86u-on-*`. Runtime-generated legacy markup всё ещё может принести `onclick/oninput/onkeydown/onchange/onload/onerror`; compatibility layer через `MutationObserver` переносит такие атрибуты в `data-wave86u-on-*`, удаляет исходные `on*` атрибуты и обрабатывает события централизованными `addEventListener` listeners.

Bridge intentionally does not use `eval`, `new Function` or arbitrary script execution. It supports only whitelisted legacy patterns already used by the app: global function calls, dotted namespace calls like `wave25Diag.setMode(...)`, simple `this.closest(...).remove()`, guarded calls, `event.stopPropagation()`, `localStorage.setItem/removeItem`, Enter-key submit handlers and the known registration/import flows. New UI code should avoid `onclick="..."` entirely and use `addEventListener` directly; the bridge is a transition layer for old runtime-generated markup.

### wave86v PvP link battle

`chunk_roadmap_wave86v_pvp_link_battle.*.js` — runtime layer for E5. It adds an asynchronous 1v1 PvP card to grade pages after the wave86p exam/weekly card. The host solves a deterministic 10-question deck, then shares a `?pvp=<payload>` link that contains only the deck seed, grade/subject metadata and the host result. The opponent receives the same generated deck and sees a win/loss/draw comparison by percent first, then time.

The chunk reuses `window.wave86pChallenge.buildDeck()` for deterministic question generation. For grade 10 it calls `wave86sGrade10Lazy.hydrateSubject()` / `hydrateAll()` before deck generation, so lazy subject chunks remain compatible with PvP. Results are local-only in `trainer_wave86v_duels_<grade>` and also update existing `trainer_progress_<grade>`, `trainer_daily_<grade>`, `trainer_activity_<grade>` and `trainer_streak_<grade>` stores.

### wave86w cloud sync

`chunk_roadmap_wave86w_cloud_sync.*.js` implements roadmap F2 as an optional static-client sync layer. It does not bundle Firebase/Supabase SDKs and does not ship secrets. The deploy owner or user supplies either Supabase REST config or Firebase Firestore REST config through the sync UI, `localStorage.trainer_wave86w_sync_config`, or `window.TRAINER_SYNC_CONFIG`.

The sync unit is the existing class backup snapshot: `getBackupSnapshot()` → cloud envelope → `applyBackupSnapshot()` after explicit confirmation. This keeps wave35 scoped storage, XP/meta/profile backup patches, PvP/exam/progress stores, and the existing import/export semantics aligned. Push is blocked in private mode; pull remains manual and confirmation-gated.

Supabase expected table:

```sql
create table if not exists trainer_sync_snapshots (
  id text primary key,
  sync_id text not null,
  grade text not null,
  updated_at timestamptz not null,
  checksum text,
  payload jsonb not null
);
```

For Firebase, the chunk writes one Firestore document per `{syncId}-grade-{grade}` in the configured collection. The payload is stored as `payloadJson` to avoid fragile nested REST field conversion. Grade pages extend `connect-src` for `https://*.supabase.co`, Firestore REST and Firebase auth endpoints; `script-src` remains strict without `'unsafe-inline'`.


### wave86x strict style CSP bridge

`chunk_roadmap_wave86x_style_csp_bridge.*.js` подключается сразу после `chunk_roadmap_wave86u_csp_bridge.*.js` в `<head>` всех HTML-страниц. Legacy logical asset name сохранён, но с wave87p это уже runtime-only shim: он больше не читает `data-wave86x-style` и не обслуживает static HTML migration.

Static HTML по-прежнему не содержит inline `<style>` и `style="..."`: крупные блоки вынесены в `assets/css/wave86x_inline_*.css`, а бывшие статические style-атрибуты уже преобразованы в обычные CSS classes (`wave86z_static_style_classes.*.css`). Shim нужен только для legacy runtime-markup, который всё ещё создаёт `style="..."` или `<style>...</style>` строками/DOM API.

С wave87q shim больше не создаёт blob stylesheet. Вместо этого он находит уже загруженный same-origin `wave86z_static_style_classes.*.css` и переносит runtime styles в этот stylesheet через CSSOM `insertRule(...)`, сохраняя `MutationObserver`-скраббер и compat для legacy `this.closest('div[style*=fixed]')` через `data-wave87p-fixed="1"` + `data-wave86x-fixed="1"`.

CSP для HTML-страниц теперь может быть строже: `style-src 'self' https://fonts.googleapis.com`, `style-src-elem 'self' https://fonts.googleapis.com`, `style-src-attr 'none'`. Новая UI-разработка всё равно не должна добавлять inline styles ни в HTML, ни в runtime-строки; использовать CSS classes или external CSS. Runtime hotspots ещё есть в source, но roadmap `#5` закрывается уже на уровне bridge/CSP. Для release-check использовать `node tools/audit_style_csp_wave87q.mjs`; старый `node tools/audit_runtime_style_shim_wave87p.mjs` остаётся как hotspot-report для дальнейшей чистки.


## wave86y offline/CSP resilience

- Service worker install now has a hard critical phase: `CRITICAL_ASSETS` contains both CSP bridges plus the complete diagnostic.html offline dependency set.
- Critical assets are cached before the optional precache queue. If any critical asset fails after retries, the SW install fails instead of activating an incomplete offline app.
- Use `node tools/audit_offline_readiness_wave86y.mjs` before release to verify HTML local dependencies, diagnostic offline coverage, bridge criticality and SW asset references.
- Use `node tools/audit_diagnostic_runtime_wave86y.js` before release to execute all diagnostic.html scripts in an offline-stub VM.
- Use `node tools/validate_questions.js` before release to run VM question-bank regression across grade pages and lazy grade10 subject chunks.
### wave87a: Literature live banks

The wave86m Literature 5–9 topics are backed by live-bank rows rather than the generic `facts -> makeGen()` stems. Since wave87d, these rows live in grade-specific `chunk_subject_expansion_wave86m_gap_balance_grade*_wave87d` chunks rather than one monolith. Validate with `node tools/audit_literature_live_banks_wave87a.mjs`.

### wave87b: OBZH scenario banks

The wave86m ОБЖ 8–11 topics use scenario-bank rows instead of generic facts. Since wave87d, these rows live in grade-specific `chunk_subject_expansion_wave86m_gap_balance_grade*_wave87d` chunks so pages avoid downloading unrelated grade banks. Validate with `node tools/audit_obzh_live_banks_wave87b.mjs` and then run the full `node tools/validate_questions.js` regression.

### wave87c grade10 Olympiad nested split

The grade10 subject `oly` is now a nested lazy subject. `grade10_subject_oly_wave86s.*.js` is intentionally only a small shell that registers the four topics and exposes `window.wave87cOlyLazy`. The heavy question rows live in four topic chunks: `grade10_subject_oly_logic_wave87c.*.js`, `grade10_subject_oly_cross_wave87c.*.js`, `grade10_subject_oly_traps_wave87c.*.js`, and `grade10_subject_oly_deep_wave87c.*.js`.

When changing Olympiad content, update the topic source files under `assets/_src/js/grade10_subject_oly_*_wave87c.js`, rebuild the content hashes, update the shell topic asset map, update `grade10_data`, and keep all topic chunks in `sw.js` and `asset-manifest.json`. The full regression must include `node tools/audit_grade10_oly_split_wave87c.mjs` plus `node tools/validate_questions.js`.

### wave87d wave86m gap-balance grade split

The former monolithic `chunk_subject_expansion_wave86m_gap_balance.*.js` is deprecated and removed from both `assets/_src/js` and `assets/js`. Grade pages 4–11 now reference one matching split chunk: `chunk_subject_expansion_wave86m_gap_balance_grade<grade>_wave87d.*.js`. This keeps the wave86m/A4-A7/A5/A6 injections, wave87a Literature live banks and wave87b ОБЖ scenario banks compatible while reducing each page's initial JS payload.

When editing this layer, update the relevant grade-specific source under `assets/_src/js`, rebuild its content hash, update the matching grade HTML, `asset-manifest.json` and `sw.js`. Validate with `node tools/audit_gap_balance_split_wave87d.mjs`, the Literature/ОБЖ audits and the full `node tools/validate_questions.js` regression.

### wave87e static event actions

Historical note: wave87e introduced compact static action ids to replace `data-wave86u-on-click="..."` markup. That bridge-based dispatch path is no longer the current pattern, but the audit name is kept for continuity.

### wave87r direct static bindings

Static HTML must not use `data-wave86u-on-*` or legacy `data-wave87e-click` anymore. Public pages now keep only passive `data-wave87r-action` markers, and the owning bundles (`bundle_grade_runtime_core_wave87n`, `inline_dashboard_1_wave86u`, `inline_diagnostic_1_wave86u`, `inline_tests_3_wave86u`) attach direct listeners with `addEventListener(...)`.

`chunk_roadmap_wave86u_csp_bridge` still strips and executes legacy runtime-generated inline handlers, but it no longer dispatches static page actions. Grade-runtime direct handlers must continue to call `wave87nRuntimeSplit.hydrateForAction()` before opening lazy features like badges, profile, reports or backup.

When changing static UI controls, bind them in the page/runtime bundle that owns the screen, keep `data-wave87r-action` only as a selector marker if needed, and re-run `node tools/audit_static_events_wave87e.mjs`, `node tools/audit_runtime_split_wave87n.mjs`, `node tools/cleanup_build_artifacts.mjs --check`, and `node tools/validate_questions.js`.

### wave87s Lighthouse CI gate

- Roadmap `#41` is now enforced with an explicit LHCI workflow instead of a bare `autorun`: see `.github/workflows/lighthouse-budget.yml`, `.lighthouserc.json`, `docs/LIGHTHOUSE_CI_wave87s.md`, `tools/audit_lighthouse_ci_wave87s.mjs`.
- Because this repo is a static GitHub Pages app, the preferred LHCI shape is `collect.staticDistDir: "./"` with explicit localhost URLs, not `startServerCommand: http-server`.
- Keep PR ancestry fixes in place: `actions/checkout` with `fetch-depth: 20` and the extra `git fetch ... github.base_ref ...` step. Removing them can reintroduce the known LHCI ancestor-hash failure on pull requests.
- Hard-fail assertions are intentionally limited to more stable facts (`categories:accessibility`, `errors-in-console`, `total-byte-weight`); `categories:performance`, `largest-contentful-paint`, and `cumulative-layout-shift` stay warn-only because the project still has known mobile variance / unresolved CLS hotspots.
- The workflow should keep uploading `.lighthouseci/` as a GitHub Actions artifact even on failed assertions, so regression triage does not depend on temporary public storage.

### wave87f senior social live banks

The grade10/grade11 wave86m gap-balance split chunks include senior social-studies scenario banks. Do not add a separate page script for these banks; edit `assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade10_wave87d.js` or grade11, rebuild the content hash, and update the matching HTML/SW/manifest references.

Validate with `node tools/audit_senior_social_live_banks_wave87f.mjs`. For heavy grade regression use `GRADE_FILTER=10 SAMPLE_PER_TOPIC=5 node tools/validate_questions.js` and the same for grade 11; full all-grade validation remains available without `GRADE_FILTER`.
### wave87g grade11 balance live banks

B6 continues in the grade11 split gap-balance chunk. Grade 11 now receives two additional subjects, `art` and `oly`, with 4 live-bank topics each. These banks live inside `assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.js` so no extra page script is added.

The new topics must remain scenario-bank based (`q/a/o/h/ex`) and must not fall back to generic `facts -> makeGen()` stems. Validate with `node tools/audit_grade11_balance_wave87g.mjs`, then run `GRADE_FILTER=11 SAMPLE_PER_TOPIC=5 node tools/validate_questions.js`. When editing, rebuild the grade11 chunk hash and update `grade11_v2.html`, `sw.js`, `asset-manifest.json`, and `healthz.json`.

### wave87h complete split gap live banks

The remaining generic `facts -> makeGen()` topics inside the grade-specific wave86m gap-balance layer are gone. Grade 4 ORKSE, grade 5 ODNKNR and grade 11 Probability/Statistics now use explicit live-bank rows with `q/a/o/h/ex` inside their existing split chunks, so no extra page script is introduced.

Use `node tools/audit_gap_live_banks_wave87h.mjs` to verify three things at once: the wave87h topics expose live-bank flags, the generated questions never fall back to the old generic stems, and no generic topics remain anywhere in the split gap-balance chunk family. When editing this layer, rebuild the content hash for the touched grade-specific chunk and update the matching grade HTML, `sw.js`, `asset-manifest.json`, and `healthz.json`.

### wave87i question repeat guard

`chunk_subject_expansion_wave63_quality.*.js` now does more than option sanitization. It also performs question-bank stem dedupe and a short recent-prompt guard at runtime. Bank rows are normalized by question stem plus answer; exact duplicates are dropped, same-stem/same-answer rows count toward `bankQuestionDeduped`, and same-stem/different-answer rows are treated as conflicts and skipped so broken banks do not leak contradictory prompts into runtime.

For wrapped `topic.gen()` functions the quality pass keeps a short recent queue (2–4 prompts depending on detected live-bank size) and rerolls a few times before accepting a repeat. This is intentionally lightweight: it reduces back-to-back duplicate prompts in short drills and audit runs without adding new page scripts or changing the question data format. Release validation for this layer is `node tools/audit_question_repeat_guard_wave87i.mjs` plus `node tools/validate_questions.js`.

### wave87j grade11 depth parity live banks

wave87j continues B6 inside the existing grade11 split gap-balance chunk. The asset `assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.js` now injects ten additional grade 11 topics across `eng`, `his`, `lit`, `bio`, `inf`, `rus`, and `geog`, all backed by explicit live banks rather than generic `facts -> makeGen()` stems.

Do not add a new page script for this layer. Keep the changes inside the existing grade11 split chunk, rebuild its content hash, update `grade11_v2.html`, `sw.js`, `asset-manifest.json`, and `healthz.json`, then validate with `node tools/audit_grade11_depth_wave87j.mjs` plus `GRADE_FILTER=10,11 SAMPLE_PER_TOPIC=5 node tools/validate_questions.js`.

### wave87k build cleanup + CI guardrails

wave87k closes the low-risk tech-debt slice from the roadmap: the live build no longer ships the former standalone runtime outputs `bundle_grade_after.*.js`, `chunk_roadmap_wave86n_progress_tools.*.js`, `chunk_roadmap_wave86p_exam_challenge.*.js`, `chunk_roadmap_wave86r_theory_achievements.*.js`, `chunk_roadmap_wave86v_pvp_link_battle.*.js`, and `chunk_roadmap_wave86w_cloud_sync.*.js`. Their code already lives inside `bundle_grade_runtime_wave86z.*.js`, so keeping the old hashed files only bloated the repo and SW metadata.

`tools/cleanup_build_artifacts.mjs` is now the guardrail for this class of regression. `--check` is CI-safe and fails when `asset-manifest.json` contains hashed CSS/JS assets with no real runtime references; `--apply` deletes the orphan files, removes matching manifest entries, deletes sidecar source maps and synchronizes `healthz.json.hashed_asset_count`. The scanner intentionally trusts only runtime-bearing files (HTML, `sw.js`, `manifest.webmanifest`, `assets/_src/**`, built `assets/js/**`, built `assets/css/**`) and ignores docs/markdown mentions so documentation cannot keep an orphan asset artificially alive.

Question-bank CI now lives in `.github/workflows/validate-questions.yml` and runs two release gates on every push/PR: `node tools/cleanup_build_artifacts.mjs --check` and `node tools/validate_questions.js`. Use this workflow as the minimum regression baseline before any rebuild or content wave.

UX note: grade main screens should expose the error-review path more clearly. Static CTA text is now `🔁 Ошибки`, and `bundle_grade_runtime_wave86z.*.js` prepends a main-actions card for due spaced-repetition items (`Повторить ошибки`) or, when there are no due cards yet, a lighter `Журнал ошибок` entry point. This is still backed by the existing wave21 journal/review data model rather than a new storage format.


### wave87l primary-content expansion + fact review

wave87l continues the roadmap pass for primary school data depth. `assets/_src/js/grade1_data.js`, `grade2_data.js`, and `grade3_data.js` now contain additional explicit `q/a/o/h/ex` banks so the thin 1–3 grade layer is less dependent on short generic generators. When editing this layer, keep new topics inside the existing grade data files rather than adding new page-level script tags.

The release also fixes a few content-level correctness issues in the compact primary banks: Russian half-hour clock phrasing is normalized in grade 2, the Байкал theory string no longer calls it the largest lake, and grade 3 uses the 5-ocean school variant including the Southern Ocean. Preserve these corrections when regenerating or compacting the primary data sources.

Use `node tools/audit_primary_content_wave87l.mjs` for a focused source audit of the wave87l primary layer, then run `GRADE_FILTER=1,2,3 SAMPLE_PER_TOPIC=6 node tools/validate_questions.js` and the full `node tools/validate_questions.js` regression. For local rebuilds of touched source files, `node tools/rebuild_hashed_assets.mjs <assets/_src/...>` updates the built hashed asset, manifest and runtime references without hand-editing HTML/SW links.

### wave87t fact-review pass

Roadmap `#17` now has a deterministic first-pass audit: `node tools/audit_fact_review_wave87t.mjs`. The script samples 50 prompts per grade, then flags three lightweight classes of suspicious content: Latin-only answer labels outside English/Informatics, descriptive/list-like answers to `Как называется ...`, and long decimal outputs in primary-school topics. It also keeps direct source guards for the corrected grade1 phonetics stem, Roman history wording, water-cycle term answer, and the grade11 `source11_wave87j` localization.

The fixed content constraints are now part of project memory: keep the Е/Ё/Ю/Я phonetics question scoped to the beginning of the word; keep Roman Republic wording centered on the Senate and elected magistrates rather than calling the Senate a generic elective organ; keep the grade6 water-cycle prompt answered by the term itself; keep grade11 history-source answer labels localized in Russian; and avoid elementary-speed generators that emit long repeating decimals in the visible answer.

When editing these files (`grade1_data`, `grade4_data`, `grade5_data`, `bundle_boosters`, `chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d`), rebuild the touched hashes and rerun `node tools/audit_fact_review_wave87t.mjs`, then the full `node tools/validate_questions.js`, plus `node tools/cleanup_build_artifacts.mjs --check`.

### wave87m grade10 → 11 transition banks

wave87m starts roadmap item `#19` without widening the page shell: grade 10 now mounts a dedicated transition subject `bridge1011` (`Переход 10→11`) from `assets/_src/js/chunk_grade_content_wave87m_transition_1011.js`. The chunk injects six explicit-bank topics (`math_bridge`, `russian_bridge`, `physics_bridge`, `english_bridge`, `biology_bridge`, `chemistry_bridge`) after the English subject, so the bridge lives inside the existing grade10 runtime flow instead of adding a separate screen or data format.

The same chunk also patches `diagnostic.html` by appending wave87m rows to `QBANK.algebra`, `geometry`, `russian`, `physics`, `english`, `biology`, and `chemistry`, then recomputes `QBANK.mathall`. Keep those rows tagged with `src: 'wave87m'` so focused audits can distinguish them from the older diagnostic pool.

Use `node tools/audit_transition_1011_wave87m.mjs` for the dedicated audit, then run `GRADE_FILTER=10 SAMPLE_PER_TOPIC=4 node tools/validate_questions.js`, the full `node tools/validate_questions.js` regression, and `node tools/cleanup_build_artifacts.mjs --check`. When rebuilding this chunk, update `grade10_v2.html`, `diagnostic.html`, `sw.js`, `asset-manifest.json`, and `healthz.json` together.

### wave87n runtime split / perf notes

`tools/build_runtime_split_wave87n.mjs` — не просто hash-rebuild helper, а orchestration script: он собирает 3 runtime bundles (`core`/`features`/`services`), обновляет grade-page references, вычищает old merged runtime entry из manifest и синхронизирует SW/healthz. При следующей правке этих трёх бандлов лучше использовать именно его, а не ручной `rebuild_hashed_assets.mjs`.

`chunk_roadmap_wave86u_csp_bridge.*.js` начиная с wave87n умеет вызывать `window.wave87nRuntimeSplit.hydrateForAction(action)` перед static click actions. Это важно для кнопок `show-profile`, `show-badges`, `generate-report`, `show-backup`, `share-report`: без этого быстрый первый клик мог открыть базовую engine-версию UI до lazy-патчей.


### wave87q style CSP without blob

wave87q закрывает roadmap `#5`: public HTML больше не держит `blob:` в `style-src` / `style-src-elem`. Runtime style shim (`chunk_roadmap_wave86x_style_csp_bridge.*.js`) теперь использует как CSSOM sink уже подключённый `wave86z_static_style_classes.*.css`, поэтому динамические `style=...` и `<style>...</style>` остаются совместимыми со strict CSP без object-URL stylesheet.

Это не значит, что runtime style-tail вычищен из source. `engine10.js`, `bundle_grade_runtime_core_wave87n.js`, `bundle_grade_after.js` и другие файлы по-прежнему эмитят inline-style markup. Но этот хвост больше не блокирует CSP tightening: bridge принимает его, нормализует и вставляет rules в same-origin stylesheet. Проверка релиза для этого слоя: `node tools/audit_style_csp_wave87q.mjs`, затем `node tools/audit_offline_readiness_wave86y.mjs`, `node tools/cleanup_build_artifacts.mjs --check` и общий `node tools/validate_questions.js`.

### wave87v rich formulas + code

Roadmap items `#12` and `#13` now have an initial implementation without any new renderer work. The runtime already knows how to show `prob.code` inside `.qcode` and switch the main prompt to `.qmath` when `isMath` is truthy, so content work should prefer explicit-bank rows that actually use these fields.

Current wave87v coverage:
- grades 8, 9, 10, 11 now have rich algebra/math topics (`formula*w87v`)
- grades 8, 9, 10, 11 now have rich physics topics (`calc*w87v`)
- grades 8, 9, 10, 11 now have code-tracing informatics topics (`code*w87v`)
- chemistry formulas/calculations now exist across 8–11 via `chemcalc*w87v` (grade10 lazy chunk, grade8/9 + grade11 expansion chunks)

When extending this layer, prefer adding explicit `{q,a,o,h,ex,code,isMath}` rows near the owning subject bundle and re-run `node tools/audit_rich_content_wave87v.mjs`, the targeted `GRADE_FILTER=8,9,10,11 SAMPLE_PER_TOPIC=6 node tools/validate_questions.js`, then the full validator and `node tools/cleanup_build_artifacts.mjs --check`.

### wave87w interactive formats

Roadmap item `#14` now has a first renderer-aware implementation without rewriting `engine10`. Grades 8–11 mount an extra eager runtime patch (`bundle_grade_runtime_interactions_wave87w.*.js`) after `bundle_grade_runtime_core_wave87n.*.js`. The patch wraps `render()`, `nextQ()` and `ans()` only for rows that declare `interactionType`, so normal multiple-choice topics keep their existing behavior.

Supported interactive row fields:
- `interactionType: 'find-error' | 'sequence' | 'match'`
- `errorSteps`
- `sequenceItems` + optional `sequencePool`
- `matchPairs` + optional `matchOptions`

Content should keep living next to the owning subject bundle: grades 8/9/11 inside `grade*_data.js`, grade 10 inside the existing lazy `grade10_subject_*_wave86s.js` chunks. Because the base validator only checks `question/answer/options`, these rows still need normal `a/o` distractors even when the custom UI ignores the old button layout.

Release check for this layer: `node tools/audit_interaction_formats_wave87w.mjs`, then `GRADE_FILTER=8,9,10,11 SAMPLE_PER_TOPIC=6 node tools/validate_questions.js`, the full `node tools/validate_questions.js`, and `node tools/cleanup_build_artifacts.mjs --check`.

