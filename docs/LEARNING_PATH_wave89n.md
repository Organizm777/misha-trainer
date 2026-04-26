# wave89n — learning path

`bundle_grade_runtime_extended_wave89b.*.js` now also carries a guided learning-path layer for topical grade sessions. The feature stays additive: no new eager asset is introduced, and the path reuses the existing `wave21` queue/snapshot mechanics plus the `wave89m` difficulty tags.

## What the route does

For a fresh topic (or one where the route has not yet been completed), the trainer now composes a short starter route:

- `📖 Теория` on the theory screen
- `🧪 Пример` on the same screen
- first scored questions: `🟢 лёгкое → 🟠 среднее → 🔴 сложное`

After those starter questions are consumed, the session does **not** end early. The route clears its queue and the topic falls back to the normal trainer flow, including the existing `wave89m` adaptive-difficulty layer.

In plain route terms, the scored starter ladder is **лёгкое → среднее → сложное** before the trainer switches back to the regular flow.

## Persistence

Per-grade route progress is stored in `trainer_learning_path_<grade>`. Each topic record tracks:

- theory/example exposure
- started/completed route runs
- per-stage attempts (`easy`, `medium`, `hard`)
- the last worked example and last route order

The progress screen now summarizes how many topics already started or completed the route.

## Integration notes

- only topical sessions seed the route; mix/global mix/rush/diagnostic/review modes are untouched
- the seeding decision uses both `trainer_progress_<grade>` and the route store, so experienced topics stop auto-seeding once the path was completed at least once
- the theory screen gets a `🧭 Маршрут темы` card with a worked example, while the play screen gets a compact route-status card during the guided start
- because it reuses the `wave21` queue, session snapshots / resume continue to work for the guided start as well

## Validation

Run:

```bash
node tools/audit_learning_path_wave89n.mjs
node tools/audit_adaptive_difficulty_wave89m.mjs
node tools/validate_questions.js
```
