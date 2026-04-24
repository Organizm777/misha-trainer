# wave87n — runtime split и device-oriented perf pass

## Что изменилось

Бывший merged bundle `bundle_grade_runtime_wave86z.*.js` (~539 KB built) перестал грузиться на grade-страницах одним куском.

Вместо него добавлены 3 слоя:

- `bundle_grade_runtime_core_wave87n.*.js` — eager core (~262 KB):
  - `chunk_roadmap_wave86q_accessibility_theme`
  - `bundle_grade_after`
  - `chunk_roadmap_wave86n_progress_tools`
  - `bundle_error_tracking`
- `bundle_grade_runtime_features_wave87n.*.js` — lazy features (~141 KB):
  - `chunk_roadmap_wave86r_theory_achievements`
  - `chunk_roadmap_wave86p_exam_challenge`
  - `chunk_roadmap_wave86v_pvp_link_battle`
  - `bundle_gamification_xp`
  - `bundle_gamification_meta`
- `bundle_grade_runtime_services_wave87n.*.js` — lazy services (~157 KB):
  - `bundle_sharing`
  - `bundle_profile_social`
  - `chunk_roadmap_wave86w_cloud_sync`

## Как это работает

Grade-страницы теперь подключают только `core` bundle. Он поднимает `window.wave87nRuntimeSplit` и дальше:

- помечает `interactive` через `requestAnimationFrame`-poll после готовности базового grade UI;
- на idle / timeout догружает `features`, затем `services`;
- прогревает lazy bundles по `pointerdown` / `focusin` на static-actions (`show-profile`, `show-badges`, `generate-report`, `show-backup`, `share-report`);
- пишет локальные perf-сэмплы в `localStorage.trainer_perf_samples_wave87n_<grade>`.

Логика device-oriented deferral:

- low-end определяется по `navigator.connection.saveData`, `effectiveType`, `hardwareConcurrency`, `deviceMemory`;
- для low-end задержки выше (`features` ~1200 ms, `services` ~2600 ms);
- для нормального устройства — быстрее (`features` ~550 ms, `services` ~1300 ms).

## CSP bridge

`chunk_roadmap_wave86u_csp_bridge` получил `hydrateStaticAction()`.

Это значит: если пользователь первым действием нажал, например, `👑 Профиль` или `📊 Отчёт`, bridge сначала вызывает `wave87nRuntimeSplit.hydrateForAction(action)`, а уже потом исполняет static handler. Так не теряются enhanced overlays при быстром первом клике.

## Статический результат

После split:

- merged `bundle_grade_runtime_wave86z` удалён из live build;
- grade-страницы больше не держат в eager-цепочке все runtime-улучшения сразу;
- `tools/audit_performance_wave86z.mjs` показывает снижение max eager local JS bytes до `1,531,419`;
- core runtime chunk стал меньше бывшего merged runtime примерно на 277 KB.

## wave87r follow-up

The original wave87n implementation hydrated lazy bundles from the CSP bridge before dispatching static actions. Since wave87r, that responsibility moved into direct bindings inside `bundle_grade_runtime_core_wave87n`: `hydrateForAction(action)` still exists, but the bridge no longer dispatches static actions at all.
