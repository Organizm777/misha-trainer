# wave87k — build cleanup + CI guardrails

## Что изменено

- Удалены 6 orphan hashed JS-ассетов, которые уже были вмёржены в `bundle_grade_runtime_wave86z.*.js` и больше не подключались ни одной HTML-страницей.
- Добавлен `tools/cleanup_build_artifacts.mjs`:
  - `--check` падает, если в `asset-manifest.json` есть hashed assets без реальных ссылок из HTML / SW / runtime-кода (документация и markdown не считаются ссылками);
  - `--apply` удаляет orphan files, sidecar source maps, чистит `asset-manifest.json` и синхронизирует `healthz.json`.
- Добавлен GitHub Actions workflow `.github/workflows/validate-questions.yml`, который на каждом push/PR проверяет orphan assets и гоняет `tools/validate_questions.js`.
- На grade-страницах вход в журнал ошибок теперь обозначен явно как `🔁 Ошибки`, а runtime main-actions показывает CTA на повторение / журнал, если у ученика уже есть ошибки в spaced repetition.

## Какие файлы были orphan

- `assets/js/bundle_grade_after.c926100b23.js`
- `assets/js/chunk_roadmap_wave86n_progress_tools.5ea23f6884.js`
- `assets/js/chunk_roadmap_wave86p_exam_challenge.81248aa084.js`
- `assets/js/chunk_roadmap_wave86r_theory_achievements.0808ca8686.js`
- `assets/js/chunk_roadmap_wave86v_pvp_link_battle.d35f7278e6.js`
- `assets/js/chunk_roadmap_wave86w_cloud_sync.e8c4ea23ca.js`

Все эти модули оставались в репо только как старые standalone build outputs. Их код уже присутствует внутри merged runtime bundle.

## Проверка локально

```bash
node tools/cleanup_build_artifacts.mjs --check
node tools/validate_questions.js
```

Для разовой чистки после ручной rebuild-сессии:

```bash
node tools/cleanup_build_artifacts.mjs --apply
```
