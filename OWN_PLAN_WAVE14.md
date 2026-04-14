# Собственный roadmap после wave 14

## Что уже закрыто

- Ядро v2 стабилизировано: engine, SW, backup transfer, browser back, beforeunload, theme toggle, offline banner, toast, runtime/flow/browser smoke.
- Предметная сетка больше не имеет тонких блоков в уже заведённых предметах.
- Coverage red-zone закрыта: базовый guard сейчас держится на `>=10` уникальных формулировках по теме.
- English vertical milestone `5–11` закрыт.

## Что ещё остаётся реально важным

Открытые крупные долги, которые я держу в своём плане и не считаю закрытыми:
- A1 English для `2–4` классов.
- Theory debt `5–7` из блока `401–440`.
- Большие пробелы предметной сетки `8/9/11` и `5/6/7`.
- Progress UX и аналитика.
- Accessibility / keyboard / aria / contrast.
- Mobile/tablet optimisation.
- Content quality: дубляжи, единый стиль, ручная ревизия boosters.
- Platform hardening: SW update flow, manifest/icons, CSP, cleanup listeners/timeouts, tests.html removal or conversion.
- Diagnostic subject configs + exam layer.
- QR sharing / print / parent polish.

## Следующие 12 волн

### Wave 15 — English vertical 2–4
- Добавить A1-вертикаль для `grade2`, `grade3`, `grade4`.
- Минимум по 2 темы на класс, лучше сразу 4 shared-блока с детской подачей.
- После этого milestone `2–11` станет закрытым.

### Wave 16 — Theory debt 5–7
- Закрыть блок `401–440`.
- Создать полноценные `_TH` для `grade5`, `grade6`, `grade7` там, где теория ещё бедна или слишком кратка.
- Параллельно проверить `grade3–4` и добить «Организм человека».

### Wave 17 — Subject mesh 8/9/11
- Химия 8/9/11.
- Биология 8/9/11.
- География 8/9/11.
- Литература 8/9/11.
- Вероятность 11.

### Wave 18 — Subject mesh 5/6/7 + начальная школа
- Литература 5–7.
- Биология 7.
- География 7.
- Информатика 7.
- Литературное чтение 1–4.

### Wave 19 — Progress UX
- Номер вопроса.
- Progress bar.
- «Повторить ошибки».
- «Продолжить последнюю тему».
- Избранные темы.
- Глобальный поиск по всем классам.

### Wave 20 — Dashboard / analytics 2.0
- Activity heatmap.
- Radar chart по предметам.
- Weekly / monthly trends.
- Breakdown по предметам и темам.
- PDF / PNG / CSV export.

### Wave 21 — Accessibility foundation
- Semantic buttons instead of clickable divs.
- `aria-*`, `role`, `tabindex`, `aria-live`.
- `focus-visible`, focus management, focus trap.
- `lang="ru"` / `lang="en"`.
- reduce motion / high contrast.

### Wave 22 — Mobile / tablet optimisation
- 44×44 tap targets.
- 16px inputs.
- Safe-area insets.
- Sticky header / bottom nav.
- Tablet breakpoints.
- Lazy render / virtual render for heavy classes.

### Wave 23 — Content quality & cleanup
- Убрать 99 дублей в `grade10`.
- Единый стиль формулировок.
- Question lint.
- Ручная ревизия boosters / patches / олимпиады.
- Перенос части inline styles из engine в CSS.

### Wave 24 — Architecture / platform hardening
- `stale-while-revalidate` + баннер новой версии.
- Manifest/icons/apple-touch-icon.
- Preconnect/preload for fonts.
- `removeEventListener` / `clearTimeout` cleanup.
- DOM caching.
- `make check` as single entry point.

### Wave 25 — Diagnostics & exam layer
- Subject configs для диагностики.
- English/literature/chemistry/biology/geography banks.
- History of diagnostics.
- Recommendations after diagnostics.
- Mini OGE/EGE tracks.

### Wave 26 — Journal of errors + spaced repetition
- Полный local error journal.
- Sticky questions.
- Scheduled repeats 1/3/7/14/30.
- Explanation after wrong answer.
- Links back to theory.

### Wave 27 — Sharing / parent / transfer polish
- True QR export/import.
- URL report.
- PNG card.
- Better print CSS.
- Parent mini-report landing.

### Wave 28 — Lightning/cloud split
- Развязать приватность и рейтинг `Молнии`.
- Определиться с `RUSH_BIN_ID` по классам.
- Добавить честный local leaderboard.
- Сделать понятный cloud/local contract.

### Wave 29 — Окружающий мир 1–4
- Полноценная вертикаль `701–720`.
- Углубить grade4 beyond one narrow cluster.
- Завести больше визуальных и сезонных вопросов.

### Wave 30 — Late gamification & special subjects
- XP / levels / combo / missions.
- Special subjects and institute blocks.
- Psychology as separate late vertical.
- Не раньше закрытия core-school mesh и accessibility.
