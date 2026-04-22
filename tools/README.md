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
- `validate_questions.js` samples topic generators across grade pages and validates question invariants.
- `audit_literature_live_banks_wave87a.mjs` — verifies the wave87a Literature 5–9 live banks and checks that old generic stems are not emitted.
- `audit_obzh_live_banks_wave87b.mjs` — verifies the wave87b ОБЖ 8–11 scenario banks and checks that old generic stems are not emitted.
