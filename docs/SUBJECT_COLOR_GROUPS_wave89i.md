# wave89i — subject color groups

## Scope

Roadmap item `#42`: reduce the subject palette on grade pages to **5 stable color groups** (a compact set of **5 palette groups**) instead of a long tail of one-off subject colors.

## Implementation

The normalization now happens inside `assets/_src/js/chunk_subject_expansion_wave63_quality.js`, which already loads on every `grade*_v2.html` page **before** `engine10.js`.

That placement matters:

- no new eager script tag was introduced;
- subject shells are recolored **before the first main-screen render**;
- the same grouped colors automatically flow into:
  - main subject cards,
  - subject header chips,
  - topic dots,
  - daily-meter subject chips,
  - subject-mix buttons that reuse `cS.bg` / `cS.cl`.

Late topic injectors also inherit the grouped palette now: `chunk_subject_expansion_wave89b_inputs_interactions_banks.js` falls back to `subject.dot / subject.cl`, and `chunk_grade10_lazy_wave86s.js` does the same for on-demand grade 10 subjects.

## Palette

| Group | Label | Accent | Background | Subject ids |
|---|---|---|---|---|
| `logic` | Математика и технологии | `#2563eb` | `#dbeafe` | `math`, `alg`, `geo`, `prob`, `inf` |
| `nature` | Естественные науки | `#16a34a` | `#dcfce7` | `phy`, `chem`, `bio`, `world`, `okr`, `geo5`, `geo6`, `geog`, `obzh` |
| `language` | Языки и тексты | `#0d9488` | `#ccfbf1` | `rus`, `eng`, `lit`, `read` |
| `society` | История и общество | `#ca8a04` | `#fef3c7` | `his`, `soc`, `orkse`, `odnknr` |
| `creative` | Творчество и олимпиада | `#7c3aed` | `#ede9fe` | fallback, `art`, `oly`, `bridge1011` |

## Runtime surface

The chunk now exposes `window.__wave89iSubjectColorGroups` with:

- `version: 'wave89i'`
- `palette`
- `usage`
- `apply()`
- `groupOf(subject)`

Each subject receives `subject.wave89iColorGroup`, and each topic dot is normalized to the same group accent.

## Verification target

The release audit should confirm:

1. `chunk_subject_expansion_wave63_quality` contains the `wave89i` marker and API.
2. All grade pages still load the same logical quality chunk, only with a refreshed hash.
3. After runtime content assembly, the full grade-page subject surface resolves to **exactly 5 unique `cl/bg` pairs**.
