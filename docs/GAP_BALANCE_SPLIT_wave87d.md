# wave87d: grade-specific split for wave86m gap-balance

wave87d replaces the single `chunk_subject_expansion_wave86m_gap_balance.*.js` payload with one chunk per grade for classes 4–11.

Before wave87d, every grade page that needed the wave86m gap-balance layer downloaded the whole cross-grade payload, including Literature live banks for 5–9 and ОБЖ scenario banks for 8–11. After wave87d, each page downloads only its own grade data:

- `chunk_subject_expansion_wave86m_gap_balance_grade4_wave87d.*.js`
- `chunk_subject_expansion_wave86m_gap_balance_grade5_wave87d.*.js`
- `chunk_subject_expansion_wave86m_gap_balance_grade6_wave87d.*.js`
- `chunk_subject_expansion_wave86m_gap_balance_grade7_wave87d.*.js`
- `chunk_subject_expansion_wave86m_gap_balance_grade8_wave87d.*.js`
- `chunk_subject_expansion_wave86m_gap_balance_grade9_wave87d.*.js`
- `chunk_subject_expansion_wave86m_gap_balance_grade10_wave87d.*.js`
- `chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.*.js`

The runtime API remains compatible: `window.wave86mGapBalance`, `window.wave87aLiteratureBanks`, and `window.wave87bObzhBanks` are still published when the relevant grade has matching content.

Validate with:

```bash
node tools/audit_gap_balance_split_wave87d.mjs
node tools/audit_performance_wave86z.mjs
node tools/validate_questions.js
```
