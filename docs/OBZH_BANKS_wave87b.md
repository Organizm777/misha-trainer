# wave87b ОБЖ live scenario banks

wave87b replaces the wave86m ОБЖ `facts -> makeGen()` fallback for grades 8–11 with scenario-bank rows.

## Coverage

- Grade 8: household/street safety, emergencies, first aid.
- Grade 9: personal safety, civil defense, first aid.
- Grade 10: road safety, health culture, first aid/self-help.
- Grade 11: risk management, first-aid algorithm, public safety.

Each topic has 15 scenario rows. The runtime turns every row into a full `{q, a, o, h, ex}` item, keeps four distinct options, and exposes audit metadata through `window.wave87bObzhBanks.auditSnapshot()`.

## Validation

Run:

```bash
node tools/audit_obzh_live_banks_wave87b.mjs
node tools/validate_questions.js
```

The dedicated audit samples every ОБЖ topic, verifies the live-bank flags/counts, checks four distinct options, confirms the answer is present, and blocks the old generic stems.
