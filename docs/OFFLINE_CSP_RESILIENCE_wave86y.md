# wave86y: offline CSP resilience

## Цель

Актуализированное ревью отметило, что HTML теперь зависит от двух CSP bridge-файлов: script bridge для data-wave86u-on-* и style bridge для legacy runtime styles. Если эти файлы не доступны в offline/PWA режиме, часть UI становится неработоспособной.

## Решение

В service worker добавлены три явных набора:

- `CSP_BRIDGE_ASSETS` — оба критических bridge-файла.
- `DIAGNOSTIC_OFFLINE_ASSETS` — полный локальный dependency set для `diagnostic.html`.
- `CRITICAL_ASSETS` — shell + bridges + diagnostic offline set.

`precache()` сначала кеширует `CRITICAL_ASSETS` с retry. Если любой критический файл не удалось положить в cache, install завершается ошибкой и новый SW не активируется. Это лучше, чем активировать частично сломанный offline shell. Остальные assets остаются optional и кешируются после critical phase.

## Проверки

- `node tools/audit_offline_readiness_wave86y.mjs` — проверяет локальные ссылки HTML, SW ASSETS, CRITICAL_ASSETS и diagnostic offline set.
- `node tools/audit_diagnostic_runtime_wave86y.js` — исполняет все 24 скрипта diagnostic.html в offline-stub VM и проверяет наличие QBANK/SUBJECTS/startDiag/shareResult.
- `node tools/validate_questions.js` — прогоняет генераторы вопросов через VM и проверяет базовые инварианты: вопрос, ответ, 4 варианта, наличие ответа среди вариантов, отсутствие дублей.
