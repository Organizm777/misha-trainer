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
- `bundle_grade_after.*.js` (~200 KB) — **НЕ дубликат shell**. Экраны после ответа: фидбек, прогресс, daily meter, геймификация. Грузится defer.
- `bundle_grade_after` и `bundle_shell` — разные бандлы; не пытаться объединять.
- `grade{1..11}_data.*.js` — внешние данные вопросов по классам. С wave86o классы 1–7 вынесены из inline HTML; с wave86s `grade10_data` стал лёгким shell, а тяжёлые банки 10 класса живут в `grade10_subject_*_wave86s.*.js` и подгружаются lazy-loader'ом.
- `SUBJ` определяется в grade-data файлах **до** `wave35_plans`/content-injection/`engine10`; порядок defer-скриптов важен.

### Runtime-injection контента

Аудит предметов нельзя делать только по inline `SUBJ` в `grade*_v2.html`: это только базовый слой. Реальная карта предметов собирается в рантайме из нескольких источников:

- `grade1_data.*.js` … `grade11_data.*.js`: базовый скелет `SUBJ` и генераторы вопросов;
- `chunk_grade_content_wave*_wave86t.*.js`: бывший монолит `bundle_grade_content`, разбитый по исходным wave-секциям; grade-страницы подключают только нужные секции с английским, литературой, окружающим миром и roadmap-контентом;
- `bundle_boosters.*.js`: расширение банков, особенно 10 класс;
- wave-чанки `chunk_subject_expansion_wave31/32/33/38/56/57/58/59/60/61/63.*.js`: дополнительные темы и предметы, которые добавляются после базового `SUBJ`.

Перед gap-анализом нужно загружать страницу класса в том же порядке, что браузер: grade-data → `wave35_plans` → нужные `chunk_grade_content_wave*_wave86t` → wave-чанки → `engine10` → after/XP/social bundles. Иначе аудит снова покажет ложные «пробелы».

`chunk_roadmap_wave86n_progress_tools.*.js` — UX/runtime-слой поверх grade-страниц: звёзды по темам, прогресс-бары предметов, календарь серии и экспорт прогресса CSV/JSON. Он не добавляет контент в `SUBJ`, поэтому content-аудит должен учитывать его отдельно от subject-injection чанков.

`chunk_roadmap_wave86p_exam_challenge.*.js` — runtime-слой D2/E3/E4: добавляет на grade-страницы карточку «Экзамен и weekly challenge», строит фиксированный набор из генераторов текущего класса, сохраняет результаты в `trainer_wave86p_results_<grade>` и обновляет локальные рейтинги. Это не subject-injection: новых тем в `SUBJ` не добавляет.

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

С wave86u HTML-страницы работают со strict `script-src` без `'unsafe-inline'`:

```
script-src 'self' blob:;
```

- Inline `<script>` в HTML запрещены и должны выноситься во внешние hashed chunks.
- Static HTML `on*=` обработчики запрещены; использовать `addEventListener`. Старый runtime-generated markup обслуживает только compatibility bridge `chunk_roadmap_wave86u_csp_bridge.*.js`.
- **Без `unsafe-eval`** — не использовать `eval()` и `new Function()`.
- `style-src` пока оставлен с `'unsafe-inline'` до отдельного CSS extraction pass.
- Внешние домены: `fonts.googleapis.com`, `fonts.gstatic.com`, `api.npoint.io`.

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

### wave86q runtime/accessibility/tooling notes

`chunk_roadmap_wave86q_accessibility_theme.*.js` — non-content runtime enhancer. It does not mutate `SUBJ` or question banks. It owns the manual Light/Dark/System toggle, index-page search, result-share shortcuts, skip-link, ARIA live region and lightweight dialog/button annotations.

Theme state remains in `localStorage.trainer_theme` with values `system`, `light`, `dark`. The head bootstrap still sets `data-theme` early; the wave86q chunk injects explicit `[data-theme]` CSS overrides after load.

Lighthouse CI budget config lives in `.lighthouserc.json`; the workflow is `.github/workflows/lighthouse-budget.yml`.

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

C5 начинался в wave86u с `script-src`: CSP перестал содержать `'unsafe-inline'` в `script-src` на HTML-страницах. Начиная с wave86x, style-side тоже переведён на strict CSP: inline `<style>` вынесены во внешние hashed CSS assets, static `style="..."` заменены на `data-wave86x-style`, а `style-src` / `style-src-elem` / `style-src-attr` не содержат `'unsafe-inline'`.

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

`chunk_roadmap_wave86x_style_csp_bridge.*.js` подключается сразу после `chunk_roadmap_wave86u_csp_bridge.*.js` в `<head>` всех HTML-страниц. Его задача — закрыть style-side часть C5 без переписывания всех старых runtime-шаблонов за один проход.

Static HTML больше не содержит inline `<style>` и `style="..."`: крупные блоки вынесены в `assets/css/wave86x_inline_*.css`, а бывшие style-атрибуты стали `data-wave86x-style`. Bridge читает эти атрибуты, генерирует безопасные CSS classes в blob stylesheet и удаляет transitional data-атрибут. Runtime-generated legacy markup, который всё ещё создаёт `style="..."` или `<style>...</style>`, также мигрируется через `MutationObserver`.

CSP для HTML-страниц теперь использует `style-src 'self' blob: https://fonts.googleapis.com`, `style-src-elem 'self' blob: https://fonts.googleapis.com` и `style-src-attr 'none'`. Новая UI-разработка не должна добавлять inline styles в HTML; использовать CSS classes или external CSS. Bridge нужен как compatibility layer для старых строковых шаблонов. Для legacy handlers вида `this.closest('div[style*=fixed]')` bridge ставит `data-wave86x-fixed="1"` на бывшие fixed overlays и патчит `Element.closest()` для обратной совместимости.


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

Static HTML should not use `data-wave86u-on-*` anymore. wave87e replaced all static `data-wave86u-on-click="..."` attributes with compact `data-wave87e-click="action-id"` tokens. The early CSP bridge installs a delegated `addEventListener('click', ...)` and dispatches only known action ids through a `switch`; it does not parse expression text for static controls.

The legacy wave86u parser stays only for runtime-generated older markup that may still produce inline `onclick`/`oninput` attributes. New static UI must add a real listener or a `data-wave87e-click` action plus an explicit switch case, then run `node tools/audit_static_events_wave87e.mjs`.
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

