## wave87j — 2026-04-23

- B6: продолжен pass по глубине 11 класса без новых page-level scripts: в grade11 split gap-balance chunk добавлены 10 live-bank тем для English, History, Literature, Biology, Informatics, Russian и Geography.
- Content: все новые темы реализованы через явные `q/a/o/h/ex` банки (150 rows total), без fallback на generic `facts -> makeGen()` для этих тем.
- Balance: fully injected grade 11 доведён до 95 тем и сравнялся с fully injected grade 10.
- Tooling: добавлены `tools/audit_grade11_depth_wave87j.mjs` и `docs/GRADE11_DEPTH_wave87j.md`; обновлены content-hash, manifest, healthz и SW cache.

## wave87i — 2026-04-23

- B7: `chunk_subject_expansion_wave63_quality` now dedupes question banks more aggressively, blocking duplicate prompts with the same normalized stem and surfacing conflicting same-question/different-answer rows through explicit metrics.
- Runtime: wrapped topic generators keep a short recent-prompt queue and reroll a few times before accepting a repeat, reducing immediate duplicate questions during short practice bursts without changing page script count.
- Legacy-tail cleanup: diversified repeated generic stems in Russian OГЭ/ЕГЭ norm topics and English spelling/British-vs-American topics, and made the reroll guard pool-aware for small non-live banks so the global validator now reports zero immediate repeats.
- Tooling: `tools/validate_questions.js` now reports immediate repeats, low-diversity live topics and the wave87i quality metrics; added `tools/audit_question_repeat_guard_wave87i.mjs` plus `docs/QUESTION_REPEAT_GUARD_wave87i.md`.
- Build: rebuilt `chunk_subject_expansion_wave63_quality`, updated grade/diagnostic HTML refs, `asset-manifest.json`, `healthz.json` and SW cache name to wave87i.

## wave87h — 2026-04-23

- B5/A4 follow-up: ORKSE 4 and ODNKNR 5 no longer use generic `facts -> makeGen()` stems; the remaining grade4/grade5 split gap-balance topics now emit live-bank `q/a/o/h/ex` rows.
- B5/B6 follow-up: grade11 Probability/Statistics gap-balance topics (`diagprob11_wave86m`, `samples11_wave86m`) now use live-bank questions instead of generic facts stems.
- Added 120 explicit questions across 8 remaining split gap-balance topics without adding a new grade-page script tag; all grade4–11 split gap-balance topics are now live-bank backed.
- Added `tools/audit_gap_live_banks_wave87h.mjs` and `docs/GAP_LIVE_BANKS_wave87h.md`; rebuilt three gap-balance chunk hashes and synchronized HTML/SW/manifest/healthz to wave87h.

## wave87g — 2026-04-22

- B6: 11 класс выровнен ближе к 10-му по предметному составу: добавлены предметы «Искусство» и «Олимпиада».
- B5: новые темы 11 класса используют живые scenario-bank вопросы с `q/a/o/h/ex`, а не generic `facts -> makeGen()`.
- Контент: добавлено 8 тем и 120 live-bank вопросов: искусство XX века, русское искусство, дизайн/визуальная коммуникация, театр/кино, логика, межпредметные задачи, исследовательские задания и стратегии решения.
- Build: пересобран grade11 gap-balance chunk, обновлены content-hash, SW cache name, asset manifest и healthz.

## wave87f — 2026-04-22

- A6/B5/B6: senior-school social studies 10–11 now has scenario live banks instead of generic `facts -> makeGen()` stems for the wave86m social topics.
- Added two practical social studies topics per senior grade: grade 10 civic participation/media literacy and grade 11 democracy/labour choice.
- Added 150 explicit social-studies scenario questions across 10 topics without increasing grade-page script count.
- Added `tools/audit_senior_social_live_banks_wave87f.mjs`; `validate_questions.js` now supports `GRADE_FILTER=10,11` for isolated heavy-grade regressions.

## wave87e — 2026-04-22

- N12: static HTML controls no longer use `data-wave86u-on-click="..."` expression attributes.
- Added `data-wave87e-click` action ids and a delegated `addEventListener` whitelist inside the early CSP bridge; runtime-generated legacy handlers remain supported by the existing bridge path.
- Rehashed `chunk_roadmap_wave86u_csp_bridge`, updated all HTML/SW/manifest references, and added `tools/audit_static_events_wave87e.mjs` plus `docs/STATIC_EVENTS_wave87e.md`.

## wave87d — 2026-04-22

- N10/performance follow-up: the former monolithic `chunk_subject_expansion_wave86m_gap_balance.*.js` has been split into grade-specific chunks for grades 4–11.
- Grade pages now load only their own gap-balance data, preserving script count while reducing max grade JS payload from 1,909,161 bytes to 1,814,611 bytes.
- Literature live-bank and ОБЖ scenario-bank audits were updated to read the split sources.
- Added `tools/audit_gap_balance_split_wave87d.mjs` and `docs/GAP_BALANCE_SPLIT_wave87d.md`; bumped SW cache/manifest/healthz to wave87d.

## wave87c — 2026-04-22

- N5: тяжёлый lazy chunk `grade10_subject_oly_wave86s` заменён маленьким shell-файлом и четырьмя topic chunks для Олимпиады 10 класса: logic, cross, traps, deep.
- Grade10 lazy loader теперь при `hydrateAll()` догружает вложенный `wave87cOlyLazy`, чтобы сборная/Молния/exam не получали fallback-вопросы вместо реальных олимпиадных задач.
- `validate_questions.js` расширен: регрессия 10 класса загружает и shell, и topic chunks wave87c.
- Build: обновлены `grade10_data`, `chunk_grade10_lazy_wave86s`, `asset-manifest.json`, `healthz.json` и SW cache name.

## wave87b — OBZH live banks

- Replaced generic `facts -> makeGen()` output for wave86m ОБЖ topics in grades 8–11 with scenario-bank generated `q/a/o/h/ex` rows.
- Added 180 ОБЖ scenario questions across 12 topics without adding any new grade-page script tag.
- Added `tools/audit_obzh_live_banks_wave87b.mjs` and `docs/OBZH_BANKS_wave87b.md`; bumped SW cache/manifest/healthz to wave87b.

## wave87a — Literature live banks

- Replaced generic `facts -> makeGen()` output for the wave86m Literature 5–9 topics with live-bank generated `q/a/o/h/ex` rows.
- Added 150 Literature questions across 10 topics without adding a new grade-page script tag.
- Added `tools/audit_literature_live_banks_wave87a.mjs` and `docs/LITERATURE_BANKS_wave87a.md`.

# CHANGELOG
## wave86y — 2026-04-22

- N8: добавлены offline-readiness и VM runtime-аудиты для diagnostic.html: проверяются все локальные CSS/JS зависимости страницы, наличие файлов, precache в service worker и загрузка всех 24 диагностических скриптов из локального кешируемого набора.
- N1: service worker теперь сначала обязательно кеширует CSP bridge assets и полный diagnostic offline set; если критический asset не закеширован, install aborts вместо тихого warning.
- N9: добавлен tools/validate_questions.js для VM-регрессии банков вопросов по grade-страницам, включая lazy grade10 subject chunks.
- N6: DEFAULT_MODEL генератора контента обновлён до claude-sonnet-4-20250514.
- Build: обновлены cache name, healthz и asset-manifest до wave86y.

## wave86x — 2026-04-22

- C5: завершён CSP-hardening для styles: `style-src`/`style-src-elem`/`style-src-attr` больше не используют `'unsafe-inline'` на HTML-страницах.
- HTML: inline `<style>` блоки вынесены во внешние hashed CSS assets, а static `style="..."` атрибуты переведены в `data-wave86x-style`.
- Runtime: добавлен ранний `chunk_roadmap_wave86x_style_csp_bridge`, который превращает legacy static/runtime styles в generated CSS classes через blob stylesheet и сохраняет совместимость с `this.closest('div[style*=fixed]')`.
- Build: обновлены `asset-manifest.json`, `healthz.json` и SW cache name.

## wave86w — 2026-04-22

- F2: добавлена опциональная синхронизация прогресса текущего класса между устройствами через Supabase REST или Firebase Firestore REST без внешних SDK.
- Runtime: новый chunk `chunk_roadmap_wave86w_cloud_sync` строит backup snapshot через существующий `getBackupSnapshot()`, сохраняет envelope в облако, загружает remote snapshot и восстанавливает его через `applyBackupSnapshot()` после подтверждения.
- UX: на grade-страницах добавлена кнопка «☁️ Синхронизация», sync-секция в модалке резервной копии, ручные push/pull/status, copy sync-code и опциональный auto-push после тренировки.
- CSP: `connect-src` на grade-страницах расширен для `https://*.supabase.co`, Firestore REST и Firebase auth endpoints; `script-src` остаётся strict без `'unsafe-inline'`.
- Build: обновлены content-hash, `asset-manifest.json`, `healthz.json` и SW cache.

## wave86v — 2026-04-22

- E5: добавлена асинхронная PvP-битва 1v1 по ссылке на grade-страницах: один seed, 10 вопросов, таймер 7 минут, сравнение процентов и времени.
- Flow: создатель сначала проходит набор, получает ссылку с seed и своим результатом; соперник открывает ссылку, решает тот же набор и видит победу/ничью/поражение.
- Runtime: результаты PvP сохраняются локально в `trainer_wave86v_duels_<grade>` и обновляют существующие progress/daily/streak stores.
- Build: добавлен `chunk_roadmap_wave86v_pvp_link_battle`, обновлены manifest, healthz и SW cache.

## wave86u — 2026-04-22

- C5: `script-src` переведён на strict mode без `'unsafe-inline'`; inline `<script>` блоки вынесены в hashed external chunks.
- Runtime: добавлен ранний `chunk_roadmap_wave86u_csp_bridge`, который переносит legacy `onclick/oninput/onkeydown/onchange` в data-атрибуты и исполняет только whitelisted обработчики через `addEventListener` без `eval`/`Function`.
- HTML: inline theme bootstrap заменён внешним ранним CSP bridge; static `on*=` обработчики переведены в `data-wave86u-on-*`; preload-font `onload` заменён на обычное stylesheet-подключение.
- Build: обновлены `asset-manifest.json`, `healthz.json` и SW cache name.

## wave86t — 2026-04-22

- C4: монолитный `bundle_grade_content` разделён на 11 section-specific chunks по исходным wave-секциям; grade-страницы подключают только нужные части.
- Grade10: удалено подключение no-op content bundle; 10 класс остаётся на лёгком `grade10_data` shell и lazy subject chunks из wave86s.
- Build: обновлены content-hash, `asset-manifest.json`, `healthz.json` и SW cache name.

## wave86s — 2026-04-22

- C2: `grade10_data` разделён на лёгкий shell и 14 предметных lazy chunks; тяжёлые банки 10 класса подгружаются при открытии предмета или перед сборной/экзаменом.
- Runtime: добавлен `chunk_grade10_lazy_wave86s`, который гидратирует предметы, сохраняет совместимость с booster-wrapper'ами и precache-ит lazy chunks для офлайна.
- Build: обновлены content-hash, `asset-manifest.json`, `healthz.json` и SW cache name.

## wave86r — 2026-04-22

- D5: добавлен runtime-слой теории по каждой теме: отсутствующие `topic.th` получают безопасный fallback, а на экране тем появляется свернутый блок «📖 Теория по теме».
- D10: усилена обратная связь ответа: toast-реакции на верный/ошибочный ответ, микро-celebration на серии из 5 верных без нарушения `prefers-reduced-motion`.
- E2: добавлены 12 дополнительных достижений на основе прогресса по темам, звёзд, предметов, дневного рывка и weekly challenge.
- Build: добавлен runtime-chunk `chunk_roadmap_wave86r_theory_achievements`, обновлены manifest, healthz и SW cache.

## wave86q — 2026-04-21

- D7: добавлен ручной переключатель темы Light/Dark/System поверх существующего `trainer_theme`.
- D8: добавлены skip-link, ARIA live-region, роли для основных экранов/модалок и `aria-keyshortcuts` для вариантов ответа.
- D3: на `index.html` добавлен поиск класса/предмета; поиск внутри класса оставлен на уже встроенной логике `main-search-slot` / `topic-search-slot`.
- D4: добавлены быстрые кнопки Telegram/WhatsApp/Share API на экране результата тренировки.
- F3: добавлены Lighthouse CI budget workflow и `.lighthouserc.json`.
- F4: добавлен `tools/generate_content_claude.mjs` для генерации и локальной валидации черновиков вопросов через Claude API.
- Build: добавлен runtime-chunk `chunk_roadmap_wave86q_accessibility_theme`, обновлены manifest, healthz и SW cache.

## wave86p — 2026-04-21

- D2: добавлен режим «Экзамен 20» на grade-страницах: фиксированный набор из 20 вопросов, таймер 10 минут, финальная оценка 2–5 и разбор ошибок.
- E3: добавлен weekly challenge: еженедельный набор из 20 вопросов по текущему классу с сохранением лучшего результата недели.
- E4: добавлены локальные рейтинги по классу и предметам для результатов экзамена/weekly challenge.
- Build: добавлен runtime-chunk `chunk_roadmap_wave86p_exam_challenge`, обновлены content-hash, manifest, healthz и SW cache.


## wave86o — 2026-04-21

- C1: данные 1–7 классов вынесены из inline `<script>` в отдельные `grade1_data`–`grade7_data` JS-файлы.
- Build: для новых data-файлов рассчитаны content-hash, подключение перенесено в `defer`-цепочку до `wave35_plans`.
- SW/manifest: cache name обновлён до `trainer-build-wave86o-2026-04-21`; в precache добавлены новые grade-data ассеты и ранее пропущенный `chunk_subject_expansion_wave86m_gap_balance`.

## wave86n — 2026-04-21

- E1: добавлены звёзды за тему 0–3 на основе объёма решений и точности.
- D6: добавлен календарь серии за последние 42 дня с отметками активности и выполненной дневной нормы.
- D9: на карточках предметов добавлен компактный прогресс-бар и сводка звёзд по темам.
- F1: добавлен экспорт прогресса текущего класса в CSV и JSON для родителей.
- Build: добавлен runtime-chunk `chunk_roadmap_wave86n_progress_tools`, обновлены content-hash, manifest, healthz и SW cache.

## wave86l — 2026-04-21

- D1: добавлен вывод подробного блока «Разбор» после ответа, если вопрос содержит `ex`.
- D1: `bundle_grade_content` теперь прокидывает `topic.ex` в генерируемые вопросы; журнал ошибок сохраняет и показывает `ex` вместе с подсказкой.
- B4: добавлен отдельный runtime-чанк `chunk_subject_expansion_wave86l_grade3_balance` для 3 класса: 4 темы и 40 шаблонов вопросов.
- A3: английский 4 класса расширен темами Past Simple, Vocabulary и Reading.
- A8/A9/A10: добавлены расширения для биологии 7, географии 5–6 и физики 7.
- Gap-analysis: добавлены базовые темы информатики для 5–6 классов.
- Build: обновлены content-hash ассеты и cache name service worker.

## wave86k — 2026-04-21

- Закрыты B1/B2/B3/C3/A1/A2/F8 из дорожной карты приоритетов.
- Добавлено перемешивание и нормализация вариантов, обществознание 5–7, вероятность и статистика 7–8, CLS-резервы и документация injection-архитектуры.

## wave86c

Автогенерация из commit messages недоступна в локальном sandbox, поэтому добавлен fallback-summary для wave86c.

- Build pipeline: hash → dist → source maps → asset manifest.
- GitHub Pages workflow: build, validate, upload-pages-artifact, deploy-pages.
- Автоверсия service worker и release metadata.
