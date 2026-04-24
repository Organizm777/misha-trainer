# wave87q — style CSP без `blob:`

## Что изменено

`chunk_roadmap_wave86x_style_csp_bridge.*.js` больше не собирает runtime CSS в `Blob` + `URL.createObjectURL(...)`.

Вместо этого shim:

- находит уже подключённый same-origin stylesheet `wave86z_static_style_classes.*.css`;
- вставляет generated rules через `CSSStyleSheet.insertRule(...)`;
- переносит runtime `style="..."` в generated class только после того, как target sheet готов;
- переносит runtime `<style>...</style>` блоки в тот же stylesheet через top-level CSS rule split;
- сохраняет legacy-совместимость с `this.closest('div[style*=fixed]')` через `data-wave87p-fixed` + `data-wave86x-fixed`.

## Почему это позволяет снять `blob:`

До wave87q shim использовал blob stylesheet как безопасный контейнер для runtime CSS. Из-за этого HTML-страницы держали:

- `style-src 'self' blob: https://fonts.googleapis.com`
- `style-src-elem 'self' blob: https://fonts.googleapis.com`

Теперь runtime CSS живёт в уже загруженном same-origin stylesheet, поэтому HTML может использовать более строгий CSP:

- `style-src 'self' https://fonts.googleapis.com`
- `style-src-elem 'self' https://fonts.googleapis.com`
- `style-src-attr 'none'`

## Что не изменилось

Runtime style-tail ещё существует: `engine10.js`, `bundle_grade_runtime_core_wave87n.js`, `bundle_grade_after.js` и другие файлы всё ещё генерируют `style="..."`/`<style>` markup. wave87q не вычищает этот хвост из source, а делает его совместимым со strict style CSP без `blob:`.

## Проверка

```bash
node tools/audit_style_csp_wave87q.mjs
node tools/audit_offline_readiness_wave86y.mjs
node tools/cleanup_build_artifacts.mjs --check
node tools/validate_questions.js
```

`audit_style_csp_wave87q.mjs` проверяет:

- отсутствие `blob:` в `style-src` / `style-src-elem` у public HTML;
- отсутствие `Blob/createObjectURL/revokeObjectURL` в source/built style bridge;
- наличие `wave86z_static_style_classes.*.css` на всех HTML-страницах;
- подключение rebuilt style bridge на всех HTML-страницах.
