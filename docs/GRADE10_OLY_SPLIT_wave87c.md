# wave87c: Grade10 Olympiad split

`grade10_subject_oly_wave86s` used to be the largest grade10 lazy subject chunk. wave87c keeps the public subject id `oly`, but turns the subject asset into a small shell. The real banks are now loaded by topic:

- `grade10_subject_oly_logic_wave87c.*.js` — логика и смекалка;
- `grade10_subject_oly_cross_wave87c.*.js` — межпредметные задачи;
- `grade10_subject_oly_traps_wave87c.*.js` — задачи-ловушки;
- `grade10_subject_oly_deep_wave87c.*.js` — углублённые задачи.

The shell exposes `window.wave87cOlyLazy` with `hydrateTopic(id)`, `hydrateAll()` and `auditSnapshot()`. The regular grade10 lazy loader still owns subject hydration. When a global mode needs all question banks, `chunk_grade10_lazy_wave86s` chains into `wave87cOlyLazy.hydrateAll()` after the subject shell is loaded. Topic chunks are also precached by `sw.js`, so the split remains offline-friendly after first successful service-worker install.

Validation:

```bash
node tools/audit_grade10_oly_split_wave87c.mjs
node tools/validate_questions.js
```
