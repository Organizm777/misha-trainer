# wave89a — critical bugfixes + theory coverage

Эта волна закрывает критический блок из обновлённого плана `wave89`: BUG-1, BUG-2, BUG-3, плюс отдельный аудит покрытия теории и безопасный fallback для тем без шпаргалки.

## Что исправлено

### BUG-1. `spec_subjects.html` снова открывает предметы под strict CSP

Источник проблемы: `bundle_special_subjects.js` рендерил карточки и кнопки с inline `onclick` / `oninput`, а страница живёт под CSP без inline-script.

Что сделано:
- все действия переведены на `data-spec-action` / `data-spec-input`;
- добавлен единый delegation-слой на `#spec-root`;
- экспортирован runtime-аудит `window.__wave89aSpecSubjects`;
- из HTML генерации убраны inline `style=` атрибуты, прогресс и цветовые состояния переведены на CSS-классы.

### BUG-2. `ENG_TH` для английского 10 класса больше не висит в воздухе

Источник проблемы: booster-слои ссылались на `ENG_TH.*`, но полагались на неявную глобаль.

Что сделано:
- оба booster-блока теперь поднимают `var ENG_TH = window.ENG_TH = window.ENG_TH || {};`;
- добавлен экспорт `window.__wave89aEnglishTheoryCoverage`;
- аудит требует 19 тем английского 10 класса и 19/19 непустых `th` без fallback-заглушек.

### BUG-3. Удалён плавающий FAB переключателя темы

Источник проблемы: `chunk_roadmap_wave86q_accessibility_theme` создавал fixed-кнопку `theme-toggle`, перекрывающую контент.

Что сделано:
- FAB полностью удалён из standalone chunk и из пересобранного `bundle_grade_runtime_core_wave87n`;
- тема продолжает синхронизироваться через настройки и системную тему;
- audit snapshot теперь явно сообщает `fabRemoved`.

## Теория: новый fallback и аудит покрытия

- `chunk_roadmap_wave86r_theory_achievements` теперь даёт явную карточку `📖 Теория в разработке`, а не скрывает кнопку;
- topics, получившие временную заглушку, маркируются `topic.__wave89aTheoryFallback = true`;
- `tools/audit_theory_coverage.mjs` прогружает grade-контент 1–11 классов, запускает runtime-нормализацию теории и требует:
  - `missingTheory === 0` после нормализации для каждого класса;
  - английский 10 класса: ровно 19 тем, 19/19 тем с теорией, `fallbackTopics === 0`.

## Release hygiene

Добавлен `tools/sync_release_metadata.mjs`, который синхронизирует:
- `assets/asset-manifest.json`
- `healthz.json`
- `sw.js` cache name и precache arrays

Это позволяет безопасно пересобирать hashed assets и runtime bundles без ручного редактирования release-метаданных.
