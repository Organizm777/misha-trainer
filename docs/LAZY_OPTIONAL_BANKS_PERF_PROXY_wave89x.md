# wave89x — lazy optional senior banks + static performance proxy

## Что было не так

После wave89w прямой баг с неактивными input-полями уже был закрыт, но grade pages 8–11 всё ещё eagerly тянули дополнительный senior chunk `chunk_subject_expansion_wave89b_inputs_interactions_banks.*.js`. Из-за этого старый статический прокси-аудит `tools/audit_performance_wave86z.mjs` оставался красным: пиковая страница (`grade8_v2.html`) выходила за лимит 1.9 MB local eager JS.

## Что сделано

- удалён eager `<script>` с optional senior bank из `grade8_v2.html`, `grade9_v2.html`, `grade10_v2.html`, `grade11_v2.html`;
- merged runtime `bundle_grade_runtime_extended_wave89b` теперь сам lazy-load'ит этот chunk через `window.__wave89xOptionalInputBanks`;
- добавлен background-prime и intercept `openSubj(...)`, чтобы пользователь не попадал в пустой subject screen, если optional chunk ещё не догрузился;
- после загрузки runtime шлёт `wave89x-optional-input-banks-ready` и может переоткрыть текущий subject screen;
- добавлен аудит `tools/audit_optional_input_banks_wave89x.mjs`.

## Что это даёт

- static proxy `audit_performance_wave86z` снова зелёный;
- senior input/interactions content остался доступным, но перестал ухудшать initial eager payload;
- validate workflow теперь hard-gate'ит и lazy optional-bank wiring, и сам performance proxy.

## Честное ограничение

Это не финальное достижение roadmap-цели `#82 max 1500KB eager JS`. Wave89x возвращает в зелёную зону старый лимит **1.9 MB**, но до более жёсткого бюджета ещё нужен следующий разбор больших shared bundles.
