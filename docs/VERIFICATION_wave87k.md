# wave87k — verification snapshot

## Commands

```bash
node tools/cleanup_build_artifacts.mjs --check
node tools/audit_static_events_wave87e.mjs
node tools/validate_questions.js
```

## Results

### cleanup_build_artifacts

- Result: `No orphan manifest assets found.`
- Live hashed asset count after cleanup: `94`

### audit_static_events_wave87e

- `ok: true`
- `pages: 16`
- `legacyAttrs: 0`
- `staticActionAttrs: 268`
- `uniqueActions: 40`
- `unknownActions: []`
- `pagesMissingBridge: []`

### validate_questions

- `ok: true`
- `scripts: 144`
- `subjects: 110`
- `topics: 561`
- `generators: 561`
- `samples: 2805`
- `missingGenerators: 0`
- `immediateRepeats: 0`
- `lowDiversityLiveTopics: 0`
- `qualityRepeatBlocked: 371`
- `qualityRepeatAccepted: 0`
- `bankQuestionConflicts: 0`
- `failures: 0`

## Notes

- `missingEx` remains non-zero in the validator output and was not addressed in wave87k; this batch targeted tech-debt, CI guardrails and review-mode discoverability.
- Cleanup detection intentionally ignores documentation mentions, so markdown files cannot keep orphan hashed assets artificially alive.
