# wave87j — grade11 depth parity live banks

wave87j continues roadmap item **B6** after wave87g/wave87h. The goal is to close the remaining depth gap between grade 10 and grade 11 without adding new page-level scripts.

## What changed

The existing split chunk `assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.js` now injects ten additional grade 11 topics, all implemented as explicit live banks with `q/a/o/h/ex` rows:

- English: `reading11_wave87j`, `essay11_wave87j`
- History: `source11_wave87j`, `culture11_wave87j`
- Literature: `drama11_wave87j`, `warprose11_wave87j`
- Biology: `biotech11_wave87j`
- Informatics: `encode11_wave87j`
- Russian: `argument11_wave87j`
- Geography: `globalgeo11_wave87j`

This brings the fully injected grade 11 page from **85 topics** to **95 topics**, matching grade 10 after its lazy subject expansion.

## Why inside the split gap-balance chunk

The chunk was intentionally reused so the page keeps the same script count after wave86z runtime consolidation. Updating the existing asset means:

- no extra `<script>` tag on `grade11_v2.html`;
- the new topics still participate in the existing wave63 quality pass and repeat guard;
- the new banks stay covered by `sw.js` precache, `asset-manifest.json`, and `validate_questions.js`.

## Validation

Use:

```bash
node tools/audit_grade11_depth_wave87j.mjs
GRADE_FILTER=10,11 SAMPLE_PER_TOPIC=5 node tools/validate_questions.js
```

The dedicated audit checks:

- grade10/grade11 total-topic parity;
- presence of all ten wave87j topic ids;
- valid `q/a/o/h/ex` rows with no fallback generic `facts -> makeGen()` stems;
- synchronized hashed references in HTML, `sw.js`, and `asset-manifest.json`.
