# ARCHITECTURE.md — trainer3 static runtime

## Слои приложения

1. **HTML-оболочки** — `index.html`, `grade*_v2.html`, `diagnostic.html`, `dashboard.html`, `spec_subjects.html`.
   Они не содержат бизнес-логику и подключают только хешированные ассеты из `assets/js` и `assets/css`.

2. **Исходники ассетов** — `assets/_src/js` и `assets/_src/css`.
   Править нужно именно эти файлы. Production-копии в `assets/js` / `assets/css` пересобираются через `tools/rebuild_hashed_assets.mjs`.

3. **Core runtime** — `bundle_grade_runtime_core_wave87n`.
   Отвечает за базовый flow: предметы, темы, теория, тренировка, результат, прогресс.

4. **Extended runtime** — `bundle_grade_runtime_extended_wave89b`.
   Содержит UX-расширения, которые не должны увеличивать число eager-скриптов на страницах классов: learning formats wave91e, study formats wave91f, visual/interactive formats wave91g.

5. **Content chunks** — grade data, subject expansions, exam banks.
   Крупные банки должны подключаться lazy/shell-слоем, а не монолитным blocking script.

6. **Offline layer** — `sw.js`, `manifest.webmanifest`, `assets/asset-manifest.json`, `healthz.json`.
   После изменения ассетов нужно обновлять хеши, manifest, cache name и healthz.

## Правило изменения JS/CSS

```bash
node tools/rebuild_hashed_assets.mjs assets/_src/js/<file>.js
node tools/sync_release_metadata.mjs --wave waveXX --date YYYY-MM-DD
```

После этого проверяются:

```bash
node --check assets/_src/js/<file>.js
node --check assets/js/<rebuilt-file>.js
node tools/audit_scripts_budget_wave89c.mjs
node tools/update_index_stats.mjs --check
```

## Performance budget

Страницы классов должны оставаться в пределах `20` внешних скриптов. Новые функции предпочтительно мержить в существующий extended runtime или переводить в lazy chunk, который загружается по действию пользователя.

## CSP/offline

Приложение работает как статический PWA. Новые фичи не должны требовать внешних CDN, внешних шрифтов или сетевых API для базовой работы. Экспорт и печать выполняются браузерными средствами.
