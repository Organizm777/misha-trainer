# wave87s — Lighthouse CI budget gate

wave87s closes roadmap `#41`: Lighthouse budget checks now run as a real pull-request gate instead of a minimal `autorun` wrapper.

## What changed

- `.lighthouserc.json` now uses `collect.staticDistDir: "./"` for this static GitHub Pages app instead of booting an ad-hoc `http-server`.
- Audited URLs stay focused on the most representative paths:
  - `index.html?choose`
  - `grade3_v2.html`
  - `grade10_v2.html`
- Collection now uses **2 runs** per URL with explicit Chromium flags:
  - `--headless=new`
  - `--no-sandbox`
  - `--disable-dev-shm-usage`
- Assertions are split into:
  - hard failures: accessibility, console errors, total byte weight
  - soft warnings: performance category, LCP, CLS, best-practices, SEO

## Workflow changes

`.github/workflows/lighthouse-budget.yml` now:

1. checks out with `fetch-depth: 20`
2. fetches the PR base branch so LHCI ancestry works in pull requests
3. resolves `CHROME_PATH`
4. runs repo preflight audits before Lighthouse:
   - `cleanup_build_artifacts --check`
   - `audit_performance_wave86z`
   - `audit_static_events_wave87e`
5. installs a pinned `@lhci/cli@0.15.1`
6. runs `lhci healthcheck`, `lhci collect`, `lhci assert`
7. uploads `.lighthouseci/` as a GitHub Actions artifact even when assertions fail

## Why this shape

- The project is a static site, so `staticDistDir` is a better fit than an extra server bootstrap.
- The PR workflow now keeps the Lighthouse results attached to the run via Actions artifacts instead of depending on temporary public storage.
- The hard-fail budgets focus on relatively stable facts (byte weight, console cleanliness, accessibility floor), while noisier UX metrics remain visible as warnings.

## Audit

```bash
node tools/audit_lighthouse_ci_wave87s.mjs
```

Expected invariants:

- no `lhci autorun` in workflow
- PR trigger + manual trigger
- multi-run Lighthouse collection
- pinned LHCI CLI
- `.lighthouseci` artifacts uploaded
