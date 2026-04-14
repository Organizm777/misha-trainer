# OWN PLAN — after wave 17

## Что закрыто к этому моменту
- ядро v2 стабилизировано;
- offline shell, theme toggle, toast, back/beforeunload, browser E2E живы;
- English vertical закрыт по классам `2–11`;
- theory debt `5–7` закрыт rich-theory слоем;
- English infrastructure добавлена: shared guides, English level, English in diagnostics.

## Что дальше логичнее всего

### Wave 18 — critical cleanup pack
- отделить приватность от рейтинга `Молнии`;
- решить судьбу `RUSH_BIN_ID` и кнопки рейтинга там, где облако не настроено;
- удалить или перепрофилировать `tests.html`;
- закрыть `removeEventListener / clearTimeout` долги;
- уменьшить inline-style debt в `engine10.js`.

### Wave 19 — subject mesh expansion (8/9/11)
- химия `8/9/11`;
- биология `8/9/11`;
- география `8/9/11`;
- литература `8/9/11`;
- вероятность `11`;
- exam-oriented темы для ОГЭ/ЕГЭ.

### Wave 20 — subject mesh expansion (5/6/7 + primary)
- литература `5/6/7`;
- биология `7`;
- география `7`;
- информатика `7`;
- литературное чтение `1–4`;
- усиление `Окружающего мира 1–4` как отдельной вертикали.

### Wave 21 — progress UX
- номер вопроса;
- progress bar;
- `повторить ошибки`;
- `продолжить последнюю тему`;
- `избранные темы`;
- `случайная тема`;
- глобальный поиск по всем классам.

### Wave 22 — analytics / dashboard 2.0
- heatmap;
- radar chart;
- weekly/monthly trend;
- breakdown до тем;
- PNG / PDF / CSV экспорт;
- отчёт по English level и readiness к диагностике.

### Wave 23 — accessibility foundation
- semantic HTML;
- `aria-*`, `role`, `tabindex`;
- focus management;
- `focus-visible`;
- `prefers-reduced-motion`;
- keyboard navigation;
- modal focus trap.

### Wave 24 — mobile / tablet optimisation
- safe-area;
- sticky header;
- bottom navigation;
- swipe между вопросами;
- tablet breakpoints;
- lazy / virtual rendering для тяжёлых классов.

### Wave 25 — diagnostics & exam layer
- subject configs для диагностики;
- история диагностик;
- рекомендации после результата;
- микро-диагностика;
- пробные ОГЭ / ЕГЭ слои.

### Wave 26 — content quality cleanup
- ревизия boosters / patches;
- детектор дублей `grade10`;
- question lint;
- единый стиль формулировок;
- диапазоны генераторов алгебры / физики;
- объяснения после ответа.

### Wave 27 — platform hardening
- stale-while-revalidate + баннер новой версии;
- manifest/icons/apple-touch-icon;
- CSP;
- DOM caching;
- listener / timeout cleanup;
- единый `make check`.

### Wave 28 — sharing / transfer / parent layer
- QR export/import;
- URL-report;
- PNG-card;
- print CSS;
- родительский отчёт с графиками;
- PIN / control mode / planning hooks.

### Wave 29 — error journal + spaced repetition
- журнал ошибок;
- sticky questions;
- repeat after 1/3/7/14/30 days;
- персональные рекомендации;
- my hard questions.

### Wave 30 — gamification 2.0
- XP / levels;
- combo multiplier;
- missions;
- витрина достижений;
- richer profile;
- local leaderboard.

### Wave 31+
- спецпредметы;
- психология;
- институтский слой;
- экспериментальные режимы.

## Сознательно отложено
Поздние слои вроде спецпредметов, психологии, продвинутой геймификации и натальных/нумерологических надстроек остаются позже. Сначала — школьное ядро, предметная сетка, диагностика, accessibility, mobile и quality guards.
