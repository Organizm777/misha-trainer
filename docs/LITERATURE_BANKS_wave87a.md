# wave87a Literature live banks

wave87a closes the first B5/N4 content-depth pass from the updated review roadmap: the additional Literature topics injected by wave86m for grades 5–9 no longer rely on the generic `facts -> makeGen()` quiz pattern.

## Scope

The implementation is intentionally small and does not add a new script tag after wave86z consolidation. It is embedded in the existing `chunk_subject_expansion_wave86m_gap_balance` asset and replaces only these Literature topics:

- Grade 5: `fable5_wave86m`, `landscape5_wave86m`
- Grade 6: `ballad6_wave86m`, `composition6_wave86m`
- Grade 7: `drama7_wave86m`, `satire7_wave86m`
- Grade 8: `gogol8_wave86m`, `prose8_wave86m`
- Grade 9: `onegin9_wave86m`, `psychprose9_wave86m`

Each topic now exposes 15 live-bank rows with stable `q/a/o/h/ex` fields at runtime, for 150 literature questions total. The old generic stems remain available for other non-literature wave86m subjects and can be handled in later B5 passes.

## Validation

Run:

```bash
node tools/audit_literature_live_banks_wave87a.mjs
```

The audit verifies that all 10 target topics are live-bank backed, have at least 15 rows, generate valid four-option questions, include the correct answer in options, provide hints and explanations, and no longer emit the old generic stems.
