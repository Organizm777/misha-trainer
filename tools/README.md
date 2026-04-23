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

## Release audits

```bash
node tools/audit_offline_readiness_wave86y.mjs
node tools/audit_diagnostic_runtime_wave86y.js
node tools/validate_questions.js
```

- `audit_offline_readiness_wave86y.mjs` checks local HTML dependencies, SW precache coverage, critical CSP bridge placement and diagnostic offline coverage.
- `audit_diagnostic_runtime_wave86y.js` executes all `diagnostic.html` scripts in an offline-stub VM.
- `validate_questions.js` samples topic generators across grade pages and validates question invariants. Use `GRADE_FILTER=10` or `GRADE_FILTER=10,11` for isolated heavy-grade runs.
- `audit_literature_live_banks_wave87a.mjs` — verifies the wave87a Literature 5–9 live banks and checks that old generic stems are not emitted.
- `audit_obzh_live_banks_wave87b.mjs` — verifies the wave87b ОБЖ 8–11 scenario banks and checks that old generic stems are not emitted.
- `audit_grade10_oly_split_wave87c.mjs` — verifies the nested split of grade10 Olympiad shell/topic chunks, SW/manifest coverage and sample generation.
- `audit_gap_balance_split_wave87d.mjs` — verifies the grade-specific split of the former wave86m gap-balance chunk and checks that each grade page references only its matching split asset.
- `audit_static_events_wave87e.mjs` — verifies that static HTML has no `data-wave86u-on-*` handlers and every `data-wave87e-click` action is whitelisted in the CSP bridge.
- `audit_senior_social_live_banks_wave87f.mjs` — verifies the wave87f senior social-studies 10–11 scenario banks and checks that old generic stems are not emitted.
- `audit_grade11_balance_wave87g.mjs` — verifies the wave87g grade 11 balance pass: Art/Olympiad subjects, 8 live-bank topics, 120 rows, no generic facts stems, and synchronized hashed references.
- `audit_grade11_depth_wave87j.mjs` — verifies the wave87j B6 pass: 10 new grade 11 live-bank topics, no generic facts stems for them, grade10/grade11 topic parity and synchronized hashed references.
- `audit_gap_live_banks_wave87h.mjs` — verifies the remaining split gap-balance live banks for grade 4 ORKSE, grade 5 ODNKNR and grade 11 Probability/Statistics, and confirms no generic gap-balance topics remain.

- `validate_questions.js` samples topic generators across grade pages and validates question invariants. Since wave87i it also reports immediate repeats, low-diversity live topics and quality-pass repeat metrics. Use `GRADE_FILTER=10` or `GRADE_FILTER=10,11` for isolated heavy-grade runs.
- `audit_question_repeat_guard_wave87i.mjs` — samples rich live-bank topics across grade pages and asserts that the wave87i repeat guard prevents immediate duplicate prompts in short runs.
