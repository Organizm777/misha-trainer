# wave87h: finish split gap-balance live banks

wave87h completes the remaining generic `facts -> makeGen()` topics inside the split `chunk_subject_expansion_wave86m_gap_balance_grade*_wave87d` layer.

## Covered topics

- Grade 4 ORKSE:
  - `orkse_values4`
  - `orkse_family4`
  - `orkse_culture4`
- Grade 5 ODNKNR:
  - `odnknr_culture5`
  - `odnknr_values5`
  - `odnknr_religions5`
- Grade 11 Probability/Statistics:
  - `diagprob11_wave86m`
  - `samples11_wave86m`

Each topic now emits live-bank rows with explicit `q/a/o/h/ex` instead of the old generic stems:

- `Выбери понятие: ...`
- `Что означает «... »?`
- `Какое понятие относится к теме ...`

## Runtime markers

- Values topics use `_wave87hValuesLiveBank` and `_wave87hValuesLiveBankCount`.
- Probability topics use `_wave87hProbLiveBank` and `_wave87hProbLiveBankCount`.

## Audit

Run:

```bash
node tools/audit_gap_live_banks_wave87h.mjs
```

The audit verifies:

1. grade 4/5/11 wave87h topics exist and expose live-bank flags;
2. each topic has 15 rows;
3. generated questions contain valid `q/a/o/h/ex` and no old generic facts stems;
4. HTML, SW and `asset-manifest.json` reference the new hashed chunk names;
5. no generic topics remain in any split gap-balance chunk.
