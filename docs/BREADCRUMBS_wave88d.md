# wave88d breadcrumbs

## Roadmap anchor

- Item `#51`: `Навигация breadcrumb: Главная → Класс → Предмет → Тема`
- Status in this wave: added an additive grade-page breadcrumb runtime without rewriting `engine10`.

## Assets

- Logical source JS: `assets/_src/js/bundle_grade_runtime_breadcrumbs_wave88d.js`
- Logical source CSS: `assets/_src/css/wave88d_breadcrumbs.css`
- Export: `window.__wave88dBreadcrumbs`

## Covered screens

- `s-main`: `Главная → <класс>`
- `s-subj`: `Главная → <класс> → <предмет>`
- `s-theory`: `Главная → <класс> → <предмет> → <тема>`
- `s-play` / `s-result`:
  - normal topic session → `... → <предмет> → <тема>`
  - subject mix → `... → <предмет> → Всё вперемешку`
  - global mix → `... → Всё вперемешку` or `... → Сборная`
  - diagnostic → `... → <предмет> → Диагностика`
  - rush → `... → Молния`
- `s-prog`: `Главная → <класс> → Прогресс`
- `s-info`: `Главная → <класс> → Справка`

## Navigation rules

- `Главная` opens `index.html?choose`
- `<класс>` returns to `go('main')`
- `<предмет>` returns to `openSubj(cS.id)` / `goSubj()`
- leaving an active play session through a breadcrumb asks for confirmation and calls `endSession()` first
- the current crumb keeps `aria-current="page"`

## Scope

- included only on `grade1_v2.html` … `grade11_v2.html`
- not included on `index.html`, `dashboard.html`, `diagnostic.html`, `tests.html`, `spec_subjects.html`
- keeps strict CSP compatibility by rendering DOM nodes directly without inline handlers or injected HTML templates
