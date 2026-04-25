# wave88c keyboard shortcuts

## Roadmap anchor

- Item `#47`: `Keyboard shortcuts: 1–4 для вариантов, Enter для далее, Esc для назад`
- Status in this wave: extended from answer-only handling to grade-page navigation and screen actions.

## Runtime

- Logical source: `assets/_src/js/bundle_grade_runtime_keyboard_wave88c.js`
- Built asset: `assets/js/bundle_grade_runtime_keyboard_wave88c.07330ffbd7.js`
- Export: `window.__wave88cKeyboardShortcuts`

## Covered flows

- Main screen: `1–9` and `0` open the visible subject cards in `#sg`
- Subject screen: `1–9` and `0` open the visible topic buttons in `#tl`
- Theory screen: `Enter` triggers `data-wave87r-action="start-normal-quiz"`
- Play screen:
  - after an answer is already resolved, `Enter` clicks the primary next button in `#fba`
  - for sequence/match/find-error screens without a resolved answer, `Enter` clicks the primary submit button in `#opts`
  - free-input and multi-select questions keep ownership of `Enter` in their own runtimes
- Result screen: `Enter` and `Escape` trigger `data-wave87r-action="back-after-result"`
- Progress/info screens: `Escape` triggers `data-wave87r-action="go-main"`
- Subject/theory/play screens: `Escape` maps to back/end actions

## Guards

- shortcuts are ignored when the target is editable (`input`, `textarea`, `select`, `contenteditable`)
- shortcuts are ignored while a modal dialog with `role="dialog"` and `aria-modal="true"` is open
- subject/topic/action buttons receive `aria-keyshortcuts` annotations for accessibility

## Page scope

- included on `grade1_v2.html` … `grade11_v2.html`
- not included on `index.html`, `dashboard.html`, `diagnostic.html`, `tests.html`, `spec_subjects.html`
