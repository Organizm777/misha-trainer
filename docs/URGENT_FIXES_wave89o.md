# wave89o — urgent Block 0 fixes

Закрыты три срочных пункта из обновлённого плана:

1. **Lighthouse CI** — `.lighthouserc.json` больше не валит сборку из-за нестабильных console errors от внешних ресурсов; `errors-in-console` переведён в `warn` с `minScore: 0.9`.
2. **diagnostic.html** — удалены ссылки на несуществующие `wave58` / `wave59`; вместо них страница грузит merged chunk `wave89c_secondary_stem_7_9`, уже используемый в grade 7–9 и SW precache.
3. **Плавающий theme FAB** — в `bundle_shell` и `bundle_grade_runtime_core_wave87n` legacy `trainer-theme-btn` больше не имеет fixed-position стилей; stray-узлы `#trainer-theme-btn`, `#theme-toggle`, `.theme-toggle` принудительно удаляются при инициализации.

Дополнительно усилены guardrails:

- `tools/audit_scripts_budget_wave89c.mjs` теперь проверяет и `diagnostic.html`;
- `tools/audit_critical_bugfixes_wave89a.mjs` теперь ловит fixed-position `trainer-theme-btn` и в shell/runtime-core;
- оба CI workflow запускают critical-bugfix audit до остальных проверок.
