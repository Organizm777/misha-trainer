# wave89h skeleton loading

Roadmap item `#41`: skeleton loading for lazy chunks. The pass stays additive and keeps the `wave89c` script budget intact by reusing existing assets instead of introducing a new eager grade-page script.

## What changed

- `bundle_grade_runtime_core_wave87n` now emits `trainer:lazy-start` / `trainer:lazy-end` events for interactive lazy runtime hydration (`show-badges`, `show-profile`, `generate-report`, `show-backup`, `share-report`, `sync`).
- `bundle_grade_runtime_extended_wave89b` now owns the shared `wave89h` overlay controller exposed as `window.__wave89hLazySkeleton`.
- `chunk_grade10_lazy_wave86s` now emits the same lazy lifecycle events for grade-10 subject hydration and renders an inline skeleton card in `#tl` while the subject bank is being fetched.
- `wave88d_breadcrumbs.css` now also contains the overlay/card/shimmer styles for the shared lazy skeleton UI.

## UI contract

The runtime bridge emits small event payloads like:

```js
window.dispatchEvent(new CustomEvent('trainer:lazy-start', {
  detail: {
    id: 'wave89h-services-1',
    scope: 'runtime',
    kind: 'services',
    action: 'show-profile',
    title: 'Подгружаю профиль',
    label: 'Загружаю профиль, отчёты и облачные сервисы…'
  }
}));
```

and later:

```js
window.dispatchEvent(new CustomEvent('trainer:lazy-end', {
  detail: {
    id: 'wave89h-services-1',
    scope: 'runtime',
    kind: 'services',
    action: 'show-profile',
    status: 'ok'
  }
}));
```

The overlay waits ~120 ms before showing, so fast cached loads do not flash.

## Validation

Run:

```bash
node tools/audit_skeleton_loading_wave89h.mjs
node tools/audit_minimal_footer_wave89g.mjs
node tools/audit_hamburger_wave89f.mjs
node tools/audit_onboarding_wave89e.mjs
node tools/audit_simple_mode_wave89d.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_merge_pass_wave89b.mjs
node tools/validate_questions.js
node tools/cleanup_build_artifacts.mjs --check
```

The dedicated audit verifies:

- rebuilt core/runtime/css/grade10 lazy assets are present in the manifest and precached by `sw.js`;
- source and built assets contain the wave89h markers and skeleton classes;
- grade pages still load the shared runtime/CSS and grade 10 still loads the lazy subject chunk;
- the overlay controller opens and closes correctly in a VM harness when `trainer:lazy-start` / `trainer:lazy-end` events are dispatched.
