# wave89p — self-host fonts + theory coverage CI gate

## Closed plan items

- `#4` — self-host UI fonts (`Unbounded`, `Golos Text`, `JetBrains Mono`)
- `#5` — turn `tools/audit_theory_coverage.mjs` into a hard CI gate

## What changed

### 1) Local font hosting

- Added `assets/fonts/` with the selected `.woff2` subsets for:
  - `Golos Text` (latin + cyrillic, weights 400/500/600/700)
  - `Unbounded` (latin + cyrillic, weights 400/600/700/800/900)
  - `JetBrains Mono` (latin + cyrillic variable subset)
- Added source stylesheet `assets/_src/css/wave89p_self_host_fonts.css`
- Rebuilt hashed stylesheet `assets/css/wave89p_self_host_fonts.*.css`
- Switched every public HTML page to the local stylesheet
- Removed `fonts.googleapis.com` / `fonts.gstatic.com` from HTML, CSP, and SW runtime handling

### 2) Offline precache for fonts

- `tools/sync_release_metadata.mjs` now scans `assets/fonts/`
- All selected font files are injected into the SW `ASSETS` precache list
- `sw.js` now stays same-origin only for runtime caching; no special-case Google Fonts path remains

### 3) Theory coverage gate

- `tools/audit_theory_coverage.mjs` now reports exact missing / fallback topic coordinates
- CI now fails if **any** assembled topic lacks theory text
- CI now also fails if a topic only survives through a fallback placeholder
- Both GitHub workflows run the theory audit before the heavier validation/Lighthouse steps

### 4) New font audit

- Added `tools/audit_self_host_fonts_wave89p.mjs`
- The audit verifies:
  - hashed local font CSS is present in the manifest
  - all public pages reference the local font CSS
  - Google Fonts hosts are gone from HTML/CSP/SW
  - `assets/fonts/` contains the expected `.woff2` files
  - release metadata precaches the local fonts offline

## Verification checklist

Run after a rebuild/release sync:

```bash
node tools/audit_self_host_fonts_wave89p.mjs
node tools/audit_theory_coverage.mjs
node tools/audit_lighthouse_ci_wave87s.mjs
node tools/cleanup_build_artifacts.mjs --check
```
