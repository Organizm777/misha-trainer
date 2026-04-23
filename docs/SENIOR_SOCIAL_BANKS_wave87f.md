# wave87f senior social live banks

wave87f continues the B5/A6/B6 roadmap pass after Literature and ОБЖ live-bank waves.

## Scope

The grade-specific wave86m gap-balance chunks for grades 10 and 11 now use live scenario banks for senior-school social studies topics instead of the generic `facts -> makeGen()` stems.

Covered topics:

- Grade 10: `socrel10_wave86m`, `culture10_wave86m`, `constitution10_wave86m`, `participation10_wave87f`, `media10_wave87f`.
- Grade 11: `civil11_wave86m`, `social11_wave86m`, `global_soc11_wave86m`, `democracy11_wave87f`, `labor11_wave87f`.

Each topic has 15 explicit `{scenario, answer, hint, explanation}` rows. The runtime generator keeps the standard `mkQ()` contract, shuffles options, and exposes `window.wave87fSeniorSocialBanks.auditSnapshot()`.

## Validation

Run:

```bash
node tools/audit_senior_social_live_banks_wave87f.mjs
GRADE_FILTER=10 SAMPLE_PER_TOPIC=5 node tools/validate_questions.js
GRADE_FILTER=11 SAMPLE_PER_TOPIC=5 node tools/validate_questions.js
```

The audit fails if a wave87f social topic has fewer than 15 rows, emits the old generic stems, lacks `q/a/o/h/ex`, or is missing from the grade chunk.
