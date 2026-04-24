> Историческая заметка: с wave87q roadmap `#5` уже закрыт, а `blob:` убран из `style-src`. Этот документ оставлен как снимок состояния wave87p; актуальная схема описана в `docs/STYLE_CSP_wave87q.md`.

# wave87p: runtime-only style shim

## Что изменилось

`chunk_roadmap_wave86x_style_csp_bridge.*.js` оставлен на legacy logical name ради минимального ref churn в HTML/SW/manifest, но с wave87p это уже **runtime-only shim**:

- он больше не содержит `data-wave86x-style` / `DATA_STYLE` migration logic;
- public HTML остаётся полностью чистым: `data-wave86x-style=0`, inline `style="..."` в HTML = `0`, inline `<style>` в HTML = `0`;
- shim обслуживает только legacy runtime markup, который всё ещё создаёт `style="..."` или `<style>...</style>` через строковые шаблоны/DOM API;
- для обратной совместимости с legacy handlers вида `this.closest('div[style*=fixed]')` shim помечает fixed overlays атрибутами `data-wave87p-fixed="1"` и `data-wave86x-fixed="1"`.

## Почему `blob:` пока не убран из CSP

Roadmap `#5` требует убрать `blob:` из `style-src` / `style-src-elem`, но на wave87p это всё ещё блокируется runtime style-tail. Статический аудит показывает:

- hotspot files: `29`
- `createElement('style')`: `67`
- `.style.cssText =`: `79`
- inline `style=` markup inside JS strings/templates: `1179`

Самый тяжёлый хвост сейчас в:

1. `assets/_src/js/engine10.js`
2. `assets/_src/js/bundle_grade_runtime_wave86z.js`
3. `assets/_src/js/bundle_grade_runtime_core_wave87n.js`
4. `assets/_src/js/bundle_grade_after.js`

То есть static HTML уже чистый, но runtime по-прежнему производит слишком много inline-style markup, чтобы безопасно снять `blob:` без отдельного refactor pass.

## Проверка

```bash
node tools/rebuild_hashed_assets.mjs assets/_src/js/chunk_roadmap_wave86x_style_csp_bridge.js
node tools/audit_runtime_style_shim_wave87p.mjs
```

Аудит валит сборку, если:

- public HTML снова получит `data-wave86x-style` или inline `style` / `<style>`;
- built/source bridge снова начнёт содержать `data-wave86x-style` migration logic;
- какая-то страница потеряет раннее подключение style shim.
