# wave87e: static event migration

wave87e closes the N12 pass for static HTML controls.

Before this wave, static pages still carried `data-wave86u-on-click="..."` attributes that were executed by the wave86u CSP compatibility parser. That kept the app CSP-safe, but static controls still depended on expression-like handler text.

Now static controls use small action identifiers:

```html
<button data-wave87e-click="show-backup">💾 Резервная копия</button>
```

The early `chunk_roadmap_wave86u_csp_bridge.*.js` installs one delegated `addEventListener('click', ...)` listener and dispatches only whitelisted action ids through a `switch`. It does not parse handler expressions for static controls and still avoids `eval` / `new Function`.

The old wave86u bridge remains for runtime-generated legacy markup because older UI strings can still create `onclick="..."` at runtime. Static HTML must not add new `data-wave86u-on-*` attributes.

Release check:

```bash
node tools/audit_static_events_wave87e.mjs
```

Expected invariants:

- `legacyAttrs: 0` in HTML
- `staticActionAttrs: 268`
- every action id is listed in the bridge `switch`
- every page with static actions loads the CSP bridge
