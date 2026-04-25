# Tools

## Content draft generator

`generate_content_claude.mjs` creates reviewed JSON drafts for new question banks. It does not edit runtime chunks directly.

```bash
ANTHROPIC_API_KEY=... node tools/generate_content_claude.mjs \
  --grade 7 \
  --subject "Физика" \
  --topic "Давление" \
  --count 20 \
  --out tools/generated/grade7_physics_pressure.json
```

Every generated item is validated before writing: four distinct options, answer included in options, non-empty hint and explanation.

## Hash rebuild helper

```bash
node tools/rebuild_hashed_assets.mjs assets/_src/js/grade1_data.js
node tools/rebuild_hashed_assets.mjs assets/_src/js/grade2_data.js assets/_src/js/grade3_data.js
```

- `rebuild_hashed_assets.mjs` recalculates the content hash for one or more source JS/CSS assets under `assets/_src`, writes new built files under `assets/js` or `assets/css`, updates `asset-manifest.json`, rewrites runtime references in HTML/SW, and removes the superseded hashed asset files.

## Release audits

```bash
node tools/cleanup_build_artifacts.mjs --check
node tools/audit_offline_readiness_wave86y.mjs
node tools/audit_diagnostic_runtime_wave86y.js
node tools/audit_style_csp_wave87q.mjs
node tools/audit_runtime_style_shim_wave87p.mjs
node tools/audit_lighthouse_ci_wave87s.mjs
node tools/audit_fact_review_wave87t.mjs
node tools/audit_rich_content_wave87v.mjs
node tools/audit_interaction_formats_wave87w.mjs
node tools/audit_free_input_timing_wave87x.mjs
node tools/audit_free_input_banks_wave87y.mjs
node tools/audit_text_input_fuzzy_wave87z.mjs
node tools/audit_daily_question_wave88a.mjs
node tools/audit_multi_select_wave88b.mjs
node tools/audit_keyboard_shortcuts_wave88c.mjs
node tools/validate_questions.js
```

- `audit_offline_readiness_wave86y.mjs` checks local HTML dependencies, SW precache coverage, critical CSP bridge placement and diagnostic offline coverage.
- `cleanup_build_artifacts.mjs` detects hashed assets that survived a merge/rebundle but are no longer referenced by HTML/SW/runtime. It scans only runtime-bearing files and ignores documentation mentions. `--check` is CI-safe, `--apply` removes the orphan files and syncs `asset-manifest.json` + `healthz.json`.
- `audit_diagnostic_runtime_wave86y.js` executes all `diagnostic.html` scripts in an offline-stub VM.
- `audit_literature_live_banks_wave87a.mjs` — verifies the wave87a Literature 5–9 live banks and checks that old generic stems are not emitted.
- `audit_obzh_live_banks_wave87b.mjs` — verifies the wave87b ОБЖ 8–11 scenario banks and checks that old generic stems are not emitted.
- `audit_grade10_oly_split_wave87c.mjs` — verifies the nested split of grade10 Olympiad shell/topic chunks, SW/manifest coverage and sample generation.
- `audit_gap_balance_split_wave87d.mjs` — verifies the grade-specific split of the former wave86m gap-balance chunk and checks that each grade page references only its matching split asset.
- `audit_static_events_wave87e.mjs` — verifies that static HTML has no `data-wave86u-on-*` or legacy `data-wave87e-click` handlers, that passive `data-wave87r-action` markers remain on expected pages, and that direct listeners now live in the owning bundles instead of the CSP bridge.
- `audit_senior_social_live_banks_wave87f.mjs` — verifies the wave87f senior social-studies 10–11 scenario banks and checks that old generic stems are not emitted.
- `audit_grade11_balance_wave87g.mjs` — verifies the wave87g grade 11 balance pass: Art/Olympiad subjects, 8 live-bank topics, 120 rows, no generic facts stems, and synchronized hashed references.
- `audit_grade11_depth_wave87j.mjs` — verifies the wave87j B6 pass: 10 new grade 11 live-bank topics, no generic facts stems for them, grade10/grade11 topic parity and synchronized hashed references.
- `audit_gap_live_banks_wave87h.mjs` — verifies the remaining split gap-balance live banks for grade 4 ORKSE, grade 5 ODNKNR and grade 11 Probability/Statistics, and confirms no generic gap-balance topics remain.

- `validate_questions.js` samples topic generators across grade pages and validates question invariants. Since wave87i it also reports immediate repeats, low-diversity live topics and quality-pass repeat metrics. Use `GRADE_FILTER=10` or `GRADE_FILTER=10,11` for isolated heavy-grade runs.
- `audit_question_repeat_guard_wave87i.mjs` — samples rich live-bank topics across grade pages and asserts that the wave87i repeat guard prevents immediate duplicate prompts in short runs.
- `audit_primary_content_wave87l.mjs` — verifies the wave87l primary-school pass: minimum source sizes for grades 1–3, new topic injections, and removal of the flagged compact fact strings.
- `audit_transition_1011_wave87m.mjs` — verifies the wave87m 10→11 bridge: grade10 subject injection, 6 transition topics with valid `q/a/o/h/ex` samples, diagnostic QBANK enrichment, and synchronized hashed references.
- `audit_runtime_split_wave87n.mjs` — verifies the wave87n grade-runtime split: manifest entries for core/features/services, no live `bundle_grade_runtime_wave86z`, grade pages eagerly load only core, service worker precaches all three bundles, and the direct grade-runtime bindings still keep `hydrateForAction(...)` in core.
- `build_runtime_split_wave87n.mjs` — builds the new core/features/services runtime bundles, updates grade-page references, removes the old merged runtime entry from the manifest, and syncs SW/healthz metadata.
- `audit_style_csp_wave87q.mjs` — verifies the wave87q CSP/style follow-up: public HTML no longer carries `blob:` in `style-src` / `style-src-elem`, the rebuilt style bridge no longer uses Blob/object-URL APIs, and every page still mounts `wave86z_static_style_classes.*.css` as the CSSOM sink for runtime styles.
- `audit_runtime_style_shim_wave87p.mjs` — historical shim audit for the wave87p→wave87q migration: public HTML stays free of `data-wave86x-style`, the legacy logical bridge no longer migrates that attribute, and the script still reports the largest runtime inline-style hotspots for future cleanup passes.
- `audit_lighthouse_ci_wave87s.mjs` — verifies the wave87s Lighthouse CI gate: PR workflow triggers, fetch-depth/base-branch ancestry fix, pinned LHCI CLI install, multi-run staticDistDir collection, preflight audits, and `.lighthouseci` artifact upload.

- `audit_rich_content_wave87v.mjs` — verifies the wave87v rich-content pass: required formula/code topic ids exist across grades 8–11, chemistry rich topics are injected in the expected science chunks, and the source layer contains a minimum number of `code:` and `isMath:true` rows before rebuild.
- `audit_interaction_formats_wave87w.mjs` — verifies the wave87w interaction layer: the runtime bundle is present in grades 8–11 and SW precache, grades 1–7 stay clean, and the owning source bundles still contain enough `find-error` / `sequence` / `match` rows plus the metadata plumbing that preserves those fields through `bank(...)`. The build-wave guard now also allows wave88a/wave88b because later waves reuse the same logical runtime bundle.
- `audit_free_input_timing_wave87x.mjs` — verifies the wave87x free-input runtime and timing layer; the build-wave guard now stays open through wave88a/wave88b because later waves reuse the same logical runtime bundle.
- `audit_free_input_banks_wave87y.mjs` — verifies the wave87y explicit numeric-input content pass: grades 8–11 load the new subject-expansion chunk, pages 1–7 stay clean, the injected topic ids exist after runtime content assembly, and generated rows expose `inputMode: 'numeric'` plus `acceptedAnswers`.
- `audit_text_input_fuzzy_wave87z.mjs` — verifies the wave87z short-answer pass: the input runtime exposes explicit `text` mode + Levenshtein helpers, accepted variants resolve back to canonical answers, grades 8–11 load the new Russian/English text-bank chunk, and generated rows expose `inputMode: 'text'` with fuzzy-tolerance metadata.
- `audit_daily_question_wave88a.mjs` — verifies the wave88a homepage daily-question card: the index page references both the new JS chunk and CSS asset, SW precaches them, the source bundle still exposes a deterministic daily picker, and a stubbed VM render inserts the card into the homepage layout.
- `audit_multi_select_wave88b.mjs` — verifies the wave88b multi-select pass: grades 8–11 load the new explicit banks chunk, generated rows expose six options with 2–3 canonical correct answers, the interactions runtime canonicalizes multi-select answers, and SW/healthz stay synchronized.

- `audit_keyboard_shortcuts_wave88c.mjs` — verifies the wave88c trainer-wide keyboard-shortcuts pass: the new eager runtime is present only on grade pages, SW/manifest/healthz stay synchronized, `aria-keyshortcuts` are annotated, and main/subj/theory/play/result/prog flows respond to digits / Enter / Escape while respecting modal and editable-target guards.
