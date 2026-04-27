## wave89t — 2026-04-26

- desktop quiz interaction fix: grade play sessions now render answer buttons plus `Подсказка` / `Шпаргалка` / `Следующий` controls with explicit `data-wave89t-*` markers instead of legacy inline `onclick`, so strict-CSP desktop Chromium/Edge builds no longer depend on fragile dynamic handler scrubbing before an answer can be selected.
- runtime binding hardening: `engine10` now exports `window.wave89tPlayBinding` and installs a delegated document-level click bridge for those dynamic play controls while preserving the existing `ans(...)`, `nextQ()`, `wave86uToggleHint()`, and `wave86uToggleShp()` quiz APIs.
- CI/tooling: added `tools/audit_play_selection_wave89t.mjs`, wired it into both GitHub workflows, and refreshed the engine hashed asset / release metadata for the wave89t release.

## wave89s — 2026-04-26

- roadmap follow-up after `#6–#7`: expanded the first canonical math families under `assets/data/exam_bank/` from **3 to 5 variants** (`oge_math_2026_full`, `ege_profile_math_2026_part1`) by adding authored variants 4–5 on top of the earlier legacy-export foundation.
- generator/runtime scaling: `bundle_exam` no longer hard-codes a 3-variant ceiling for supported math families; the pack registry now reads variant numbers from the structured runtime payload when available and falls back to the new 5-variant baseline for OГЭ/ЕГЭ mathematics.
- audit hardening: `tools/audit_exam_bank_generator_wave89q.mjs` now checks every JSON-backed pack alias (not just the first one) and enforces the wider canonical family coverage, so new variants cannot silently exist in JSON without surfacing in `wave30Exam.buildPack(...)` and `auditSnapshot()`.

## wave89r — 2026-04-26

- roadmap `#6–#7` follow-up: extracted the first canonical exam-bank source files into `assets/data/exam_bank/*.json` (`catalog.json`, `oge_math_2026_foundation.json`, `ege_profile_math_2026_foundation.json`) so supported variants are no longer trapped only inside `bundle_exam` internals.
- runtime split: added `tools/build_exam_bank_runtime_wave89q.mjs`, generated the dedicated `chunk_exam_bank_wave89q.*.js` payload, taught `bundle_exam` to prefer `window.WAVE89Q_EXAM_BANK.families[*]` (`compiled_from: 'json_bank'`) and keep the previous legacy compile path only as a fallback for families not yet externalized.
- integration/offline/audits: `diagnostic.html` and `dashboard.html` now load the hashed exam-bank chunk before `bundle_exam`, release metadata precaches `assets/data/exam_bank/*.json` plus the new runtime chunk, and `tools/audit_exam_bank_generator_wave89q.mjs` now enforces JSON-runtime sync plus `generatedFromStructuredJson` coverage for the canonical families.

## wave89q — 2026-04-26

- roadmap `#6–#7`: `bundle_exam` now compiles supported OГЭ/ЕГЭ variant families into a **structured exam-bank schema** (`wave89q_exam_bank_v1`) with canonical row fields `{exam, subject, year, variant, task_num, type, max_score, q, a, o, h, ex, criteria, topic_tag}` instead of keeping exam content purely ad-hoc inside pack sections.
- generator layer: added `buildStructuredKim(...)` plus `window.wave30Exam.structured.*` helpers (`listFamilies`, `matchPackId`, `getFamily`, `getRows`, `getBlueprint`, `exportSnapshot`), so supported families can now rebuild a full KIM from explicit bank rows + blueprint task numbering.
- live app integration: `buildPack(packId)` now automatically routes the supported variant families through the structured bank-backed generator and falls back to the legacy pack builder only when no structured family is available, which keeps the existing exam UI stable while moving the runtime onto the new contract.
- tooling/docs: added `tools/audit_exam_bank_generator_wave89q.mjs`, `docs/EXAM_BANK_GENERATOR_wave89q.md`, wired the audit into both CI workflows, and refreshed release metadata for the wave89q release.

## wave89p — 2026-04-26

- roadmap Block 0 follow-up (`#4–#5`): the app now self-hosts its three UI font families (`Unbounded`, `Golos Text`, `JetBrains Mono`) from same-origin `assets/fonts` instead of depending on Google Fonts, and `tools/audit_theory_coverage.mjs` is now a hard CI gate that verifies theory coverage for every assembled topic.
- offline/CSP hardening: all public HTML pages now load the hashed `wave89p_self_host_fonts` stylesheet, Google Fonts hosts were removed from HTML + CSP + service-worker runtime logic, and `tools/sync_release_metadata.mjs` now precaches the local `.woff2` files so first-install offline mode keeps the intended typography.
- CI/tooling: added `tools/audit_self_host_fonts_wave89p.mjs`, upgraded the theory audit to report exact `{subjectId, topicId}` regressions and reject fallback placeholders, wired both audits into `validate-questions.yml` and `lighthouse-budget.yml`, and refreshed release metadata/docs for the wave89p release.

## wave89o — 2026-04-26

- roadmap Block 0 (`#1–#3`): closed the three urgent follow-ups from the updated 100-task plan — Lighthouse CI no longer hard-fails on flaky third-party console noise, `diagnostic.html` now loads the merged `wave89c` 7–9 STEM chunk instead of deleted `wave58`/`wave59` assets, and the legacy floating theme FAB is explicitly scrubbed / hidden from both shared shell and grade runtime paths.
- CI hardening: `tools/audit_scripts_budget_wave89c.mjs` now also verifies `diagnostic.html`, `tools/audit_critical_bugfixes_wave89a.mjs` now rejects fixed-position `trainer-theme-btn` styles in shell/core bundles, and both GitHub workflows run the critical bugfix audit before the heavier checks.
- release metadata: rebuilt the touched hashed runtime assets (`bundle_shell`, `bundle_grade_runtime_core_wave87n`) and resynchronized SW / health metadata for the wave89o release.

## wave89n — 2026-04-26

- E48: добавлен guided learning path для тематических запусков: теория → пример → лёгкое → среднее → сложное, поверх существующего `wave21` queue и без нового eager asset.
- E48: на экране теории появилась карточка `🧭 Маршрут темы` с worked example; на экране тренировки и прогресса добавлена компактная индикация этапов маршрута.
- E48: после прохождения стартовой лестницы тренировка не завершается, а мягко переходит в обычный режим и продолжает использовать `wave89m` adaptive difficulty.
- Build: пересобраны merged grade runtime и shared grade CSS, добавлены документация `docs/LEARNING_PATH_wave89n.md` и аудит `tools/audit_learning_path_wave89n.mjs`.

## wave89m — 2026-04-26

- roadmap `#46`: added an **adaptive difficulty** layer on grade pages so the trainer now nudges the next question toward easy / medium / hard buckets per topic instead of always staying purely random inside the current generator.
- implementation stays additive: no new eager grade-page asset was introduced. The existing merged runtime `bundle_grade_runtime_extended_wave89b` now carries the `wave89m` selector, persists per-grade topic profiles under `trainer_adaptive_difficulty_<grade>`, and exposes `window.__wave89mAdaptiveDifficulty` for audits/debugging.
- session rules: **5 correct answers in a row** raise the session target by one step, **2 trouble answers** (errors / helped answers) lower it, and **3 slow answers** lower it too. The current session shift is then combined with the per-topic base level to choose the next candidate bucket.
- timing reuse: the adaptive layer now also consumes the historical `wave87x` answer-timing store so cold-start topics can already begin at `medium` when the learner has recent fast / accurate history on that topic instead of always restarting from `easy`.
- UI: the play screen now shows a compact `🎚 Адаптивная сложность` card, and the progress screen now summarizes how many topic profiles currently sit in easy / medium / hard buckets.
- tooling/docs: added `tools/audit_adaptive_difficulty_wave89m.mjs`, `docs/ADAPTIVE_DIFFICULTY_wave89m.md`, wired the audit into both CI workflows, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW release metadata for the wave89m release.

## wave89l — 2026-04-26

- roadmap `#45`: upgraded the grade-page mistake journal / review system from a fixed review ladder to a real **SM-2 spaced-repetition scheduler** so repeated cards now grow by ease factor instead of stalling on hard-coded intervals.
- implementation stays additive: no new eager grade-page asset was introduced. The existing core runtime `bundle_grade_runtime_core_wave87n` now owns the `wave89l` SM-2 layer, exports `startSpacedReview()` / `getReviewSummary()`, and migrates legacy `trainer_review_<grade>` data to `{ version: 2, algo: 'sm2' }` on load.
- scheduling behavior: a fresh lapse still goes to 1 day, the first confident success stays at 1 day, the second success moves to 6 days, and later repeats grow by EF; helped answers reset the card to a quick repeat with a gentler grade instead of inflating the schedule.
- review UX: the daily review card, progress card, result summary and journal are now labelled as **SM-2**, show weekly due counts + average EF, and display a next-interval preview inside the live review session.
- sticky-card fix: cards with 3+ lapses are still marked as difficult, but they are no longer sticky forever — two confident answers can release them again while keeping lapse history for ordering.
- tooling/docs: added `tools/audit_spaced_repetition_sm2_wave89l.mjs`, `docs/SPACED_REPETITION_SM2_wave89l.md`, wired the audit into both CI workflows, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW release metadata for the wave89l release.

## wave89k — 2026-04-26

- roadmap `#44`: added an **adaptive weak-device UI layer** on grade pages so the trainer automatically becomes easier to read and tap on compact touch devices and lower-capability hardware.
- no new eager grade-page asset was introduced. The existing merged runtime `bundle_grade_runtime_extended_wave89b` now detects weak-device signals (coarse pointer, compact viewport, low memory / CPU, Save-Data, reduced-motion) and toggles `wave89k-*` classes on the page, while the shared `wave88d_breadcrumbs` stylesheet now also contains the wave89k readability / tap-target rules.
- ergonomics pass: core controls now expand to **48px+ tap targets**, core copy / inputs rise to **16px**, subject cards and search controls grow, and the shared overlays (`settings`, onboarding, hamburger, lazy skeleton`) also receive the same larger-tap treatment instead of staying tuned for denser layouts.
- weak-device polish: blur-heavy overlay surfaces are disabled in wave89k mode, reduced-motion users lose extra animation/transition overhead, and the adaptive layer stays limited to grade pages so dashboard/index/spec/diagnostic remain unchanged.
- tooling/docs: added `tools/audit_weak_device_adaptive_wave89k.mjs`, `docs/WEAK_DEVICE_ADAPTIVE_wave89k.md`, wired the audit into both CI workflows, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW release metadata for the wave89k release.

## wave89j — 2026-04-26

- roadmap `#43`: added an **optimized parent dashboard mode** on `dashboard.html` so the page now opens in a compact, parent-first summary instead of immediately dropping the user into dense analytics.
- new parent surface: `dashboard.html` now mounts `#wave89j-parent-toolbar` + `#wave89j-parent-summary`, offers persisted `Коротко / Подробно` modes, and lets the parent filter the dashboard by a single class or all classes.
- filtered active state: the dashboard now composes a view-level state per selected class and routes hero/stats, activity, weak topics, analytics, and TXT/CSV/PNG exports through `window.__dashboardActiveState`, while class cards themselves stay visible as navigation shortcuts.
- compact-mode behavior: advanced analytics blocks (`insights`, `heatmap`, `radar`, `trend`, `subject breakdown`) are tagged with `data-wave89j-advanced="1"` and hidden only through dashboard CSS when parent mode is active, so the full analytics surface remains one tap away instead of being removed.
- tooling/docs: added `tools/audit_parent_dashboard_wave89j.mjs`, `docs/PARENT_DASHBOARD_wave89j.md`, wired the audit into both CI workflows, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW release metadata for the wave89j release.

## wave89i — 2026-04-26

- roadmap `#42`: normalized **subject colors into 5 stable groups** across grade pages so the app no longer feels like every discipline has its own one-off palette. The grouped scheme now keeps subjects visually predictable: math/tech, natural science, languages, humanities, creative/special.
- implementation stays zero-cost on the network: no new eager grade-page asset was introduced. The existing `chunk_subject_expansion_wave63_quality` chunk now also applies `wave89i` color normalization before `engine10.js`, so the grouped palette is present on the very first render. Follow-up injectors (`wave89b` topic banks and the grade10 lazy helper) now inherit the grouped palette instead of reintroducing one-off topic colors.
- coverage: the recoloring is data-driven and affects the fully assembled runtime subject surface, not just the base grade-data shells. That means injected subjects such as `read`, `eng`, `orkse`, `odnknr`, `obzh`, `art`, `oly`, and the `bridge1011` transition shell are normalized too.
- UI effect: the same grouped colors now flow automatically into main subject cards, subject headers, topic dots, mix-entry buttons, and daily-meter subject chips because those surfaces already consume `SUBJ.cl/bg` and `topic.dot`.
- tooling/docs: added `tools/audit_subject_color_groups_wave89i.mjs`, `docs/SUBJECT_COLOR_GROUPS_wave89i.md`, wired the audit into both CI workflows, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW release metadata for the wave89i release.

## wave89h — 2026-04-26

- roadmap `#41`: added **skeleton loading for lazy chunks** so deferred runtime bundles and grade-10 lazy subject banks now show a compact loading surface instead of switching abruptly from click to content.
- no new eager grade-page asset was introduced. The existing `bundle_grade_runtime_core_wave87n` now emits `trainer:lazy-start` / `trainer:lazy-end` lifecycle events for interactive lazy hydration, the merged `bundle_grade_runtime_extended_wave89b` now owns the shared `wave89h` overlay controller, and the shared `wave88d_breadcrumbs` stylesheet now also styles the shimmer overlay / inline skeleton cards.
- grade 10 follow-up: `chunk_grade10_lazy_wave86s` now renders an inline skeleton card in `#tl` while subject chunks are loading and emits the same lazy lifecycle events, so opening a deferred subject or starting global mix / exam / rush no longer feels like a silent stall.
- menu/runtime integration: `☰` actions that depend on lazy features/services (`Награды`, `Профиль`, `Отчёт`, `Поделиться`, `Резервная копия`, `Синхронизация`) now request interactive hydration, which lets the shared overlay describe what is loading instead of falling back to a blank wait.
- tooling/docs: added `tools/audit_skeleton_loading_wave89h.mjs`, `docs/SKELETON_LOADING_wave89h.md`, wired the new audit into both CI workflows, refreshed legacy wave89 audits to stay valid on `wave89h`, and resynced `CLAUDE.md`, `tools/README.md`, `healthz.json`, `asset-manifest.json`, and SW release metadata.

## wave89g — 2026-04-25

- roadmap `#40`: simplified the **grade-page main utility footer** down to **2 visible quick actions** — `📈 Прогресс` and `⚙️ Настройки` — while pushing the remaining utility surface behind the existing `☰` menu.
- implementation stays additive: no new eager JS/CSS files were introduced. The existing merged runtime `bundle_grade_runtime_extended_wave89b` now also carries the `wave89g` footer condensing logic, and the shared `wave88d_breadcrumbs` stylesheet now also contains the compact footer card styles plus the legacy-row hiding rule.
- UX follow-up to wave89f: the hamburger menu now also exposes `📖 Справка`, `🔁 Ошибки`, `🏆 Награды`, and `📅 Даты диагностик`, so the decluttering pass reduces visible noise without deleting workflows.
- runtime behavior: the old scattered main-screen utility rows are hidden additively through `data-wave89g-footer-legacy="1"`, the new footer is inserted right after `#daily-meter`, and the two visible buttons call the existing `go('prog')` / `showAbout()` entry points.
- tooling/docs: added `tools/audit_minimal_footer_wave89g.mjs`, `docs/MINIMAL_FOOTER_wave89g.md`, wired the audit into both CI workflows, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW metadata for the wave89g release.

## wave89f — 2026-04-25

- roadmap `#39`: added a compact **hamburger menu `☰`** on every grade page so secondary actions move out of the primary learning surface. The menu consolidates `profile/rating/backup/sync/export` flows without adding another eager runtime.
- runtime/UI: the existing merged add-on runtime `bundle_grade_runtime_extended_wave89b` now also carries the `wave89f` menu controller, while the shared `wave88d_breadcrumbs` stylesheet now also styles the trigger, side-sheet overlay, and relocated-action hiding rules.
- decluttering pass: the old visible `👑 Профиль`, `📊 Отчёт для родителя`, `💾 Резервная копия`, progress-share/export affordances, the main cloud-sync button, and the rush-rating shortcut are now marked as relocated and hidden from the main surface; empty legacy rows collapse automatically.
- behavior: menu actions confirm before leaving an active play session, keep using the existing APIs (`showHallOfFame`, `showRushRecords`, `generateReport`, `shareReport`, `wave86nProgressTools.exportParentProgress`, `wave86wCloudSync.open`), and remain consistent with simple mode by hiding rating/sync there as well.
- tooling/docs: added `tools/audit_hamburger_wave89f.mjs`, `docs/HAMBURGER_MENU_wave89f.md`, wired the audit into both CI workflows, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW metadata for the wave89f release.

## wave89e — 2026-04-25

- roadmap `#38`: added a **3-step onboarding overlay** on grade pages so first-time learners get an explicit happy path through the trainer: choose a subject → read theory → use the smart-start `▶ Заниматься` CTA. The implementation stays additive and continues the simplified UX track from the updated 100-improvements plan.
- no new eager grade-page asset was introduced. Instead, the existing merged runtime `bundle_grade_runtime_extended_wave89b` now also carries the `wave89e` tour controller, while the shared `wave88d_breadcrumbs` stylesheet now also includes the onboarding overlay / target-highlight layer.
- first-visit behavior: the tour auto-opens only for fresh learners without meaningful local progress, persists completion under `trainer_onboarding_wave89e_v1`, and opens a real topic in theory mode during step 2 so the user sees the actual `✏️ Начать тренажёр` flow instead of a static mock.
- manual reopen: the `⚙️ Настройки` modal now includes `👋 Быстрый тур`, while active play/result flows remain protected from accidental tour launches.
- tooling/docs: added `tools/audit_onboarding_wave89e.mjs`, `docs/ONBOARDING_wave89e.md`, wired the audit into both CI workflows, and refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW metadata for the wave89e release.

## wave89d — 2026-04-25

- roadmap `#36` + `#37`: added **Простой режим** for grade pages, defaulting to ON for fresh installs, and turned the main practice CTA into a smart-start flow. The mode intentionally hides advanced scenarios (PvP, weekly/exam, cloud sync, leaderboards and filtered global mix) while keeping the normal trainer path front-and-center.
- implementation stays additive: no new eager JS/CSS files were introduced. Instead, the existing merged grade-page runtime `bundle_grade_runtime_extended_wave89b` now carries a `wave89d` simple-mode gate, and the existing `wave88d_breadcrumbs` CSS asset now also styles the settings modal and `.simple-mode` visibility rules.
- UX adjustments: the former `ℹ️ О проекте` entry now opens `⚙️ Настройки`, where the user can toggle simple mode, open the help screen, or still reach the original about dialog. The main `⚡ Всё вперемешку` affordance is simplified into a direct `▶ Заниматься` flow, and smart-start now routes that CTA through this order: due errors → sticky errors → weak topics → resume session → continue last topic → untouched topic → global mix.
- runtime guards: simple mode blocks `showMixFilter`, rush/rating entrypoints, weekly/exam actions, leaderboards and cloud sync through wrappers instead of only hiding buttons, so advanced flows stay unavailable even if a stale button or old local UI state survives.
- tooling/docs: added `tools/audit_simple_mode_wave89d.mjs`, `docs/SIMPLE_MODE_wave89d.md`, refreshed the script-budget / merge-pass audits for a `wave89d` build, extended the wave89d audit with smart-start VM coverage, and wired the audit into CI workflows.

## wave89c — 2026-04-25

- roadmap follow-up (`#72` after `#71`): enforced a hard script-budget ceiling of **20 external scripts per grade page**. The remaining over-budget page (`grade7_v2.html`) now drops from 21 to 20 scripts, while grades 8 and 9 also shrink further because their 7–9 STEM expansion layers were merged.
- new merged content asset: `assets/_src/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.js` combines the former `chunk_subject_expansion_wave58_secondary_math_7_9` and `chunk_subject_expansion_wave59_physics_chemistry_7_9` live chunks into one shared 7–9 STEM payload for algebra/geometry/physics/chemistry.
- page impact: `grade7_v2.html` `21 → 20`, `grade8_v2.html` `20 → 19`, `grade9_v2.html` `18 → 17`; all grade pages `1–11` now stay at or below the new CI budget.
- release metadata / SW cleanup: legacy wave58/wave59 built assets were removed from `asset-manifest.json` and from the service-worker precache set, while the new merged wave89c STEM chunk is precached and loaded only where needed.
- CI/tooling/docs: added `tools/build_scripts_budget_wave89c.mjs`, `tools/audit_scripts_budget_wave89c.mjs`, wired the new budget audit into `.github/workflows/validate-questions.yml` and `.github/workflows/lighthouse-budget.yml`, refreshed legacy audits to accept a `wave89c` build, and documented the pass in `docs/SCRIPTS_BUDGET_wave89c.md`.

## wave89b — 2026-04-25

- tech-debt roadmap `#71`: merged the post-wave87w add-on runtime layers into one live grade-page asset, `bundle_grade_runtime_extended_wave89b`, so the former standalone `bundle_grade_runtime_interactions_wave87w`, `bundle_grade_runtime_inputs_timing_wave87x`, `bundle_grade_runtime_keyboard_wave88c`, and `bundle_grade_runtime_breadcrumbs_wave88d` hashes no longer ship on grade pages.
- senior content merge: combined `chunk_subject_expansion_wave87y_free_input_banks`, `chunk_subject_expansion_wave87z_text_input_banks`, and `chunk_subject_expansion_wave88b_multi_select_banks` into one senior-only live chunk, `chunk_subject_expansion_wave89b_inputs_interactions_banks`, still limited to grades 8–11.
- script-count impact on grade pages: grade9/10/11 drop from 23 to 18 scripts, grade8 drops from 25 to 20, and grades 1–7 each lose two eager runtime requests because keyboard/input/breadcrumb layers now travel together.
- repo cleanup: removed deprecated source `assets/_src/js/bundle_grade_runtime_wave86z.js`; the old split wave87w/wave87x/wave88c/wave88d and wave87y/wave87z/wave88b hashed outputs are now orphan-cleaned from the manifest and SW precache.
- tooling/docs: added `tools/audit_merge_pass_wave89b.mjs`, `docs/MERGE_PASS_wave89b.md`, refreshed `tools/README.md`, `CLAUDE.md`, `healthz.json`, `asset-manifest.json`, and SW release metadata for the merged live build.

## wave89a — 2026-04-25

- critical roadmap bugs: `spec_subjects.html` no longer depends on inline `onclick` / `oninput`; `bundle_special_subjects` now renders only `data-spec-*` markers and handles actions through a single delegated listener on `#spec-root`, which restores clicks under the current strict CSP.
- special-subjects UI hardening: inline `style=` generation was removed from the rendered markup, score/progress accents moved to reusable CSS classes, and the page now exposes `window.__wave89aSpecSubjects` for runtime auditing.
- English theory fix: `bundle_boosters.js` now declares `var ENG_TH = window.ENG_TH = window.ENG_TH || {};` in both grade-10 English booster sections and exports `window.__wave89aEnglishTheoryCoverage`; the release requires 19/19 English topics in grade 10 to carry theory without fallback stubs.
- UX cleanup: removed the floating `theme-toggle` FAB from `chunk_roadmap_wave86q_accessibility_theme` and from the rebuilt `bundle_grade_runtime_core_wave87n`, leaving theme switching only in the settings flow / system sync path.
- theory coverage: fallback theory now renders an explicit `📖 Теория в разработке` stub instead of hiding the theory action, topics patched by the stub are tagged with `__wave89aTheoryFallback`, and `tools/audit_theory_coverage.mjs` verifies post-normalization theory coverage across grades 1–11.
- release tooling: added `tools/audit_critical_bugfixes_wave89a.mjs`, `tools/sync_release_metadata.mjs`, `docs/CRITICAL_BUGFIXES_wave89a.md`, refreshed older audits for a `wave89a` build, and resynchronized `asset-manifest.json`, `healthz.json`, `sw.js` cache metadata plus hashed asset references.

## wave88d — 2026-04-25

- roadmap `#51`: added breadcrumb navigation for grade pages as a separate eager runtime (`bundle_grade_runtime_breadcrumbs_wave88d`) plus a tiny dedicated CSS asset, so `engine10` stays untouched.
- breadcrumbs now render across `s-main`, `s-subj`, `s-theory`, `s-play`, `s-result`, `s-prog` and `s-info`, covering normal topic sessions, subject/global mix, diagnostics and rush mode with context-aware labels.
- navigation behavior: `Главная` returns to class selection, intermediate crumbs route back to the class or subject screen, and leaving an active play session through a breadcrumb confirms first and finalizes the session cleanly via `endSession()`.
- synced `grade1_v2` … `grade11_v2`, `sw.js`, `healthz.json`, `asset-manifest.json`, docs and audit tooling for wave88d.

## wave88c — 2026-04-25

- roadmap `#47`: added global keyboard-shortcuts runtime for grade pages
- new eager asset `bundle_grade_runtime_keyboard_wave88c` extends shortcut coverage beyond answer options:
  - `1–9` / `0` for subject and topic cards
  - `Enter` for theory start, result back, and generic interactive submits / next
  - `Escape` for back / end-session navigation on trainer screens
- added `aria-keyshortcuts` annotations for subject cards, topic buttons, and key navigation buttons
- guards: shortcuts ignore editable targets and pause while modal dialogs are open
- synced `grade1_v2` … `grade11_v2`, `sw.js`, `healthz.json`, `asset-manifest.json`, docs and audit tooling

## wave88b — 2026-04-25

- C8 follow-up (`#28`): extended `bundle_grade_runtime_interactions_wave87w` with a fourth interaction type — `multi-select` — so grades 8–11 can now run questions with 2–3 correct answers out of 6 without rewriting `engine10`. The runtime keeps canonical answer serialization, custom checkbox-like rendering, keyboard shortcuts `1–6` + `Enter`, and routes the final answer back through the existing scoring pipeline.
- Content: added `chunk_subject_expansion_wave88b_multi_select_banks` with 8 explicit topics / 48 explicit rows across Biology, History, Chemistry, Social Studies, Informatics and Russian. Every row keeps both the new `multiSelect*` metadata and fallback `question/answer/options/hint/ex` fields for validator and non-enhanced modes.
- Tooling/docs: added `tools/audit_multi_select_wave88b.mjs` and `docs/MULTI_SELECT_wave88b.md`; refreshed the earlier wave87w/wave87x/wave87y/wave87z audits so they accept a wave88b build; synchronized `CLAUDE.md`, `tools/README.md`, `healthz.json`, `asset-manifest.json` metadata and SW cache name for wave88b.

## wave88a — 2026-04-25

- E12 follow-up (`#52`): added a lightweight homepage card `Задание дня` on `index.html` without touching the main grade runtime. A dedicated JS chunk (`chunk_roadmap_wave88a_daily_question`) chooses one curated question per local calendar day, stores the answer in `localStorage`, and shows an immediate explanation plus a CTA into the matching grade page.
- Styling: the homepage card ships in its own hashed CSS asset (`wave88a_daily_question.css`) so the static index page stays free of inline styles while keeping the existing strict CSP rules.
- Tooling/docs: added `tools/audit_daily_question_wave88a.mjs` and `docs/DAILY_QUESTION_wave88a.md`, plus synchronized HTML/SW/manifest references as part of the wave88b release train.

## wave87z — 2026-04-25

- B4 follow-up (`#29`): extended the existing free-input runtime with an explicit `text` mode for short open answers. `bundle_grade_runtime_inputs_timing_wave87x` now normalizes Russian/English text, supports fuzzy matching via Levenshtein for long answers, keeps strict-ish behavior for short words, and shows a small “≈ опечатка зачтена” hint when a typo-tolerant match was accepted.
- Accepted-answer correctness fix: free-input matching now always resolves any allowed variant back to the canonical `question.answer`, which closes a subtle scoring bug for alternate numeric/text forms like `10` vs `10%`, `4` vs `4 А`, and British/American spelling pairs.
- Content: added `chunk_subject_expansion_wave87z_text_input_banks` with 8 starter short-answer topics for grades 8–11 (Russian + English in every grade, 40 explicit rows total). Grade10 keeps lazy-subject compatibility by patching the shell topics directly without touching `wave86s` loaded flags.
- Tooling/docs: added `tools/audit_text_input_fuzzy_wave87z.mjs` and `docs/TEXT_INPUT_FUZZY_wave87z.md`; refreshed the older wave87w/wave87x/wave87y audits so they accept a wave87z build; updated `CLAUDE.md`, `tools/README.md`, `healthz.json`, `asset-manifest.json` metadata and SW cache name for wave87z.

## wave87y — 2026-04-25

- B4 follow-up (`#21/#22`): added a dedicated free-input content layer for grades 8–11 through `chunk_subject_expansion_wave87y_free_input_banks`. The new chunk injects 15 explicit numeric-input topics (76 explicit rows total) across algebra, probability, physics and chemistry, so the free-answer renderer from wave87x now has purpose-built banks rather than relying mostly on heuristics.
- Numeric UX follow-up: `bundle_grade_runtime_inputs_timing_wave87x` now parses simple fractions as real numeric answers (`1/2`, `1/4`, `2/5`, etc.) and upgrades the helper/placeholder text for fraction-friendly tasks. This makes probability inputs accept both fractional and decimal forms cleanly.
- Grade10 lazy compatibility: the new free-input chunk patches the grade10 `SUBJ` shell directly instead of calling `__wave86sApplyGrade10Subject(...)` too early, so the wave86s lazy subject loader still hydrates the main 10th-grade banks without false "already loaded" state.
- Tooling/docs: added `tools/audit_free_input_banks_wave87y.mjs` and `docs/FREE_INPUT_BANKS_wave87y.md`; refreshed the older free-input/interactions audits so they still pass on a wave87y build; updated `CLAUDE.md`, `tools/README.md`, `healthz.json`, `asset-manifest.json` metadata and SW cache name for wave87y.

## wave87x — 2026-04-24

- B4/B9 follow-up (`#21/#22/#38/#75`): added `bundle_grade_runtime_inputs_timing_wave87x`, an eager runtime patch that introduces free-text/cloze input plus numeric-answer input without rewriting `engine10`. The patch detects explicit `inputMode` rows and existing `___` cloze prompts, reuses the old scoring path via `ans(idx)`, and keeps hints, streaks, explanations and the error journal intact.
- Response-time logging: each answered question now records compact timing samples in `localStorage.trainer_response_timing_<grade>` with mode/subject/tag/correct/help metadata; the progress screen gains a new `⏱ Скорость ответа` card with average, median, recent pace, log size and slowest topics.
- Content: Russian starter cloze topics were added for grades 8, 9 and 11 directly in grade data bundles plus a lazy grade10 topic in `grade10_subject_rus_wave86s`; existing English banks already contain hundreds of `___` prompts, so they automatically benefit from the new renderer.
- Tooling/docs: added `tools/audit_free_input_timing_wave87x.mjs` and `docs/FREE_INPUT_TIMING_wave87x.md`; updated `healthz.json`, `asset-manifest.json` metadata and SW cache name for wave87x.

## wave87w — 2026-04-24

- B2/B5 roadmap `#14`: added the first non-trivial interaction formats for grades 8–11 without rewriting `engine10`. A new eager runtime patch (`bundle_grade_runtime_interactions_wave87w`) enhances only rows that opt into `interactionType`, while the existing renderer still owns scoring, streaks, explanations and the error journal.
- Content: rich algebra / physics / informatics topics from wave87v now include `find-error`, `sequence` and `match` rows; grade 10 keeps those rows inside its lazy subject chunks, and grade 11 now gains the previously missing interaction coverage.
- Runtime behavior: complex interaction types reroll in rush mode so fast sessions stay lightweight; normal mode renders custom UIs for error-step selection, ordered algorithms and pair matching.
- Validation follow-up: the grade10 English `reading_strategies` booster bank now keeps a tiny recent-row guard, so the seeded validator stays at `0` immediate repeats after the extra wave87w topics changed RNG consumption.
- Tooling/docs: added `tools/audit_interaction_formats_wave87w.mjs` and `docs/INTERACTION_FORMATS_wave87w.md`; updated `CLAUDE.md`, `tools/README.md`, `healthz.json`, `asset-manifest.json` metadata and SW cache name for wave87w.

## wave87v — 2026-04-24

- B2/B5 roadmap `#12/#13`: added a first rich-content layer for grades 8–11 on top of the existing renderer, without adding new page-level scripts. The runtime already supported `prob.code` and `prob.isMath`, so the pass focuses on actual content rather than a new widget system.
- Content: new explicit-bank topics now cover formula-heavy math/algebra, physics and chemistry plus code-tracing informatics. Added topic ids include `formula8/9/10/11w87v`, `calc8/9/10/11w87v`, `code8/9/10/11w87v`, `chemcalc8/9/10/11w87v`.
- Grade integration: grades 8, 9 and 11 are patched directly in their grade data bundles; grade 10 keeps lazy subject loading through the existing `grade10_subject_*_wave86s` chunks; chemistry for grades 8/9 and 11 is injected through the existing science/senior expansion chunks.
- Tooling/docs: added `tools/audit_rich_content_wave87v.mjs` and `docs/RICH_CONTENT_wave87v.md`; updated `CLAUDE.md`, `tools/README.md`, `healthz.json`, `asset-manifest.json` metadata and SW cache name for wave87v.

## wave87t — 2026-04-24

- B2/#17: completed the next fact-review pass with targeted content fixes across live banks and compact generators. Confirmed fixes include: grade 1 phonetics wording for Е/Ё/Ю/Я only in word-initial position, grade 4 speed generators now staying on clean integer-friendly pairs, refined Roman Republic / Senate wording in grade 5 + booster history, corrected the grade 6 water-cycle term answer, and fully localized the grade 11 history-source bank from English labels into Russian terms.
- Tooling/docs: added `tools/audit_fact_review_wave87t.mjs` and `docs/FACT_REVIEW_wave87t.md`; the audit samples 50 prompts per grade, checks for Latin-only answer labels outside English/Informatics, descriptive answers to `Как называется ...`, long decimal outputs in primary grades, and keeps targeted guards for the fixed grade4/grade6/grade11 topics. It also syncs the older `tools/audit_grade11_depth_wave87j.mjs` parity assumption with the later wave87m 10→11 bridge, so the historical depth audit no longer fails on the now-expected 6-topic grade10 lead.
- Build: rebuilt the touched hashed content bundles (`grade1_data`, `grade4_data`, `grade5_data`, `bundle_boosters`, `chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d`) and prepared SW/healthz sync for wave87t.

## wave87s — Lighthouse CI budget gate

- F6/F7: upgraded `.github/workflows/lighthouse-budget.yml` from a minimal `lhci autorun` wrapper to an explicit Lighthouse CI gate for pull requests and manual runs.
- CI now checks out with deeper git history, fetches the PR base branch for LHCI ancestry, resolves `CHROME_PATH`, runs static preflight audits, installs a pinned `@lhci/cli@0.15.1`, and stores `.lighthouseci` as an Actions artifact.
- `.lighthouserc.json` now uses `collect.staticDistDir: "./"` for this static app, multi-run collection, explicit Chrome flags, and separates hard-fail budgets (a11y, console errors, byte weight) from warning-only metrics (performance category, LCP, CLS).
- Added `tools/audit_lighthouse_ci_wave87s.mjs` and `docs/LIGHTHOUSE_CI_wave87s.md`.

## wave87r — 2026-04-24

- A4/#4 closed: static public pages no longer rely on `data-wave87e-click`; the remaining grade/dashboard/diagnostic/tests controls now use direct `addEventListener(...)` bindings in their owning JS bundles, while `data-wave87r-action` stays only as a passive selector marker.
- CSP bridge cleanup: `chunk_roadmap_wave86u_csp_bridge` no longer dispatches static actions through a central switch. It remains only for legacy runtime-generated inline handlers, so the last static click shim is gone from the critical bridge path.
- Runtime split compat: grade-page direct actions still go through `hydrateForAction()` before invoking lazy profile/badges/report/backup flows, so wave87n deferred bundles keep the same first-click behavior.
- Tooling/docs: updated `tools/audit_static_events_wave87e.mjs`, `tools/README.md`, `CLAUDE.md`, added `docs/DIRECT_STATIC_BINDINGS_wave87r.md`, and prepared hashed asset rebuild + SW/healthz sync for the new bridge/runtime/dashboard/diagnostic/tests artifacts.

## wave87q — 2026-04-24

- A5/#5 closed: HTML CSP больше не использует `blob:` в `style-src` / `style-src-elem`; public pages теперь держат `style-src 'self' https://fonts.googleapis.com`, `style-src-elem 'self' https://fonts.googleapis.com`, `style-src-attr 'none'`.
- Runtime/CSP bridge: `chunk_roadmap_wave86x_style_csp_bridge` больше не создаёт blob stylesheet. Вместо этого shim находит уже подключённый same-origin `wave86z_static_style_classes.*.css` и вносит runtime rules через CSSOM `insertRule(...)`, сохраняя поддержку legacy runtime `style=...`, `<style>...</style>` и fixed-overlay compat markers.
- Tooling/docs: добавлены `tools/audit_style_csp_wave87q.mjs` и `docs/STYLE_CSP_wave87q.md`; обновлены `CLAUDE.md`, `tools/README.md`, `healthz.json`, `sw.js` и hashed bridge refs.
- Follow-up: runtime style hotspots всё ещё существуют в source (`engine10.js`, `bundle_grade_runtime_core_wave87n.js`, `bundle_grade_after.js` и др.), но они больше не блокируют roadmap `#5`, потому что funnel идут в same-origin stylesheet вместо blob URL.

## wave87p — 2026-04-23

- A2/#3 partial: `chunk_roadmap_wave86x_style_csp_bridge` оставлен на legacy logical name, но упрощён до runtime-only shim — из него удалена migration-логика для `data-wave86x-style`; public HTML уже не использует этот transitional атрибут.
- CSP/style guardrails: shim по-прежнему переносит только runtime-created `style="..."` и `<style>...</style>` в blob stylesheet и сохраняет совместимость с legacy `this.closest('div[style*=fixed]')` через `data-wave87p-fixed` + legacy marker `data-wave86x-fixed`.
- Tooling/docs: добавлены `tools/audit_runtime_style_shim_wave87p.mjs` и `docs/RUNTIME_STYLE_SHIM_wave87p.md`; обновлены `CLAUDE.md`, `tools/README.md` и `docs/OFFLINE_CSP_RESILIENCE_wave86y.md`.
- Offline follow-up: `sw.js` critical diagnostic precache синхронизирован с текущим `diagnostic.html` и теперь включает `chunk_grade_content_wave87m_transition_1011.*.js`, так что `audit_offline_readiness_wave86y.mjs` снова проходит без пропусков.
- Audit result: static HTML по-прежнему clean (`data-wave86x-style=0`, inline `style=0`, inline `<style>=0`), но roadmap `#5` ещё открыт — remaining runtime style hotspots сосредоточены в `engine10.js`, `bundle_grade_runtime_wave86z.js`, `bundle_grade_runtime_core_wave87n.js` и `bundle_grade_after.js`, поэтому `blob:` пока остаётся в `style-src`.

## wave87n — 2026-04-23

- C2/N25: `bundle_grade_runtime_wave86z` разрезан на 3 слоя: eager `bundle_grade_runtime_core_wave87n` (~262 KB), lazy `bundle_grade_runtime_features_wave87n` (~141 KB) и lazy `bundle_grade_runtime_services_wave87n` (~157 KB).
- Grade-страницы теперь грузят только core runtime; features/services догружаются после `interactive`, по idle timeout и по раннему user intent для profile/report/backup actions.
- Runtime: добавлен `window.wave87nRuntimeSplit` с perf-сэмплами в `localStorage.trainer_perf_samples_wave87n_<grade>` и device-aware deferral для low-end устройств.
- CSP bridge (`chunk_roadmap_wave86u_csp_bridge`) теперь умеет гидратировать lazy bundles до исполнения static actions, чтобы быстрый первый клик не терял enhanced UI.
- Tooling: добавлены `tools/build_runtime_split_wave87n.mjs`, `tools/audit_runtime_split_wave87n.mjs` и `docs/RUNTIME_SPLIT_wave87n.md`; обновлены `CLAUDE.md`, `tools/README.md`, `healthz.json`, `asset-manifest.json` и SW cache до wave87n.

## wave87m — 2026-04-23

- B11/#19: для grade 10 добавлен отдельный переходный subject `bridge1011` (`Переход 10→11`) с 6 explicit-bank темами: математика, русский, физика, английский, биология и химия. Блок рассчитан на мост между текущим тренажёром 10 класса и диагностическим входом в 11 класс.
- Diagnostic alignment: `diagnostic.html` теперь получает дополнительные wave87m rows по `algebra`, `geometry`, `russian`, `physics`, `english`, `biology`, `chemistry`, чтобы сквозная диагностика ловила те же переходные опоры, что и новый grade10 subject.
- Tooling: добавлены `tools/audit_transition_1011_wave87m.mjs` и `docs/TRANSITION_1011_wave87m.md`; обновлены `CLAUDE.md`, `tools/README.md`, `sw.js`, `healthz.json` и live asset references.

## wave87l — 2026-04-23

- B1/B2 follow-up (#9/#10): расширены банки начальной школы без новых page-level scripts — `grade1_data`, `grade2_data`, `grade3_data` заметно выросли и получили 16 новых explicit-topic банков с `q/a/o/h/ex`.
- B7/#17 partial: выборочно исправлены спорные формулировки в младших классах — нормализованы фразы времени во 2 классе, теория про Байкал больше не утверждает, что это самое большое озеро, а вопрос про океаны в 3 классе использует вариант с 5 океанами.
- Tooling: добавлены `tools/audit_primary_content_wave87l.mjs`, `tools/rebuild_hashed_assets.mjs` и `docs/PRIMARY_CONTENT_wave87l.md`; обновлены `CLAUDE.md` и `tools/README.md`.
- Build: пересобраны hashed data-бандлы 1–3 классов, обновлены `grade1_v2.html`, `grade2_v2.html`, `grade3_v2.html`, `asset-manifest.json`, `healthz.json` и SW cache name на wave87l.

## wave87k — 2026-04-23

- A1: удалены 6 orphan hashed JS-ассетов, оставшихся после merge в `bundle_grade_runtime_wave86z`; `asset-manifest.json` сокращён с 100 до 94 live assets.
- A7/F1: добавлен `tools/cleanup_build_artifacts.mjs` с режимами `--check` и `--apply`; в CI появился новый workflow `.github/workflows/validate-questions.yml`, который валидирует отсутствие orphan assets и запускает `tools/validate_questions.js` на каждый push/PR.
- D6: режим повторения ошибок стал заметнее на grade-страницах — верхняя кнопка переименована в `🔁 Ошибки`, а main-actions теперь показывают CTA на spaced repetition / журнал, если у ученика уже накоплены ошибки.
- Docs: обновлены `CLAUDE.md`, `tools/README.md`, добавлен `docs/BUILD_CLEANUP_CI_wave87k.md`; SW cache/healthz/asset-manifest синхронизированы на wave87k.

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
