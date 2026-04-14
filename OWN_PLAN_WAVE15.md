# Мой roadmap после wave 15

## Что закрыто к текущему моменту

### Ядро и стабильность
- единый `engine10.js` на всех 11 классах
- рабочий `sw.js` с актуальными ассетами
- backup export/import без облака
- browser back / beforeunload / offline banner / toast / theme toggle
- runtime / flow / browser E2E / curriculum / coverage / English audit / validate pipeline

### Контентная база
- нет красной зоны `<10` по coverage
- нет thin blocks по текущим guards
- нет тем без шпаргалок
- English vertical по классам `2–11` закрыт полностью

## Следующий порядок — мой, а не механически по номеру плана

### Wave 16 — theory debt 5–7
Сделать полноценные `_TH` для `grade5`, `grade6`, `grade7` по блоку `401–440`:
- математика
- русский
- история
- биология
- география
- физика / алгебра / геометрия 7

Почему сейчас: это один из самых жёстких Claude/plan-хвостов после English vertical.

### Wave 17 — English infrastructure
После закрытия вертикали по классам:
- shared ENG-шпаргалки (`irregular verbs`, `articles`, `word formation`, `phrasal verbs`)
- English в `diagnostic.html`
- метрика `English level` в профиле
- subject configs для English

### Wave 18 — subject mesh 8/9/11
Добавить/расширить:
- химия
- биология
- география
- литература
- вероятность 11
- exam-driven блоки ОГЭ/ЕГЭ

### Wave 19 — subject mesh 5/6/7 + начальная школа
Добавить/расширить:
- литература 5–7
- биология / география / информатика 7
- литературное чтение 1–4
- тонкие предметы до 3–4 тем

### Wave 20 — progress UX 1.0
Сделать UX-слой из плана `311–340` и `99–120`:
- номер вопроса
- progress bar
- repeat errors
- continue last topic
- favourites
- random topic
- confirm on exit
- autosave snapshots

### Wave 21 — dashboard / analytics 2.0
Развить родительскую панель:
- heatmap
- radar chart
- weekly/monthly trend
- subject/topic breakdown
- CSV / PDF / PNG export
- readiness to diagnostic

### Wave 22 — accessibility foundation
Закрыть большой блок `471–505`:
- semantic HTML
- aria-label / aria-live / aria-expanded / aria-selected
- focus management
- focus-visible
- keyboard nav
- reduce motion / high contrast
- focus trap в модалках

### Wave 23 — mobile / tablet optimisation
Закрыть `506–535`:
- safe area
- 16px inputs
- sticky header / bottom nav
- swipe
- lazy/virtual render
- tablet breakpoints
- print / responsive shell

### Wave 24 — content quality cleanup
Собрать Claude-хвосты и ручную ревизию:
- 99 дублей `grade10`
- единый стиль вопросов
- question lint
- более подробные объяснения после ответа
- ревизия boosters / patches / olympiad
- расширение диапазонов алгебры и физики

### Wave 25 — diagnostics & exam layer
Развить диагностику и экзаменный слой:
- отдельные subject configs
- history of diagnostics
- recommendations after diagnostic
- micro-diagnostic
- trial OGE/EGE blocks

### Wave 26 — journal of errors + spaced repetition
- журнал ошибок
- sticky questions
- daily error micro-tests
- интервальное повторение 1/3/7/14/30
- персональные рекомендации по слабым местам

### Wave 27 — platform hardening
Закрыть архитектурный долг из Claude-плана:
- inline styles → CSS classes
- stale-while-revalidate + update banner
- manifest/icons/apple-touch-icon
- CSP baseline
- removeEventListener / clearTimeout cleanup
- DOM caching
- единый `make check`
- удалить dev-утилиты из SW precache

### Wave 28 — cloud / lightning / privacy split
Отдельно разобрать хвосты, которые план помечает как открытые:
- рекорд `Молнии` и приватность не должны блокировать друг друга
- `RUSH_BIN_ID` / общий рейтинг
- local leaderboard как честный fallback
- rate limit + retry/backoff для облака

### Wave 29 — sharing / transfer / reports
- настоящий QR export/import
- URL report
- PNG result card
- print CSS
- parent mini-report by link / QR

### Wave 30 — окружающий мир 1–4 как полная вертикаль
Не просто текущие 2–4 темы, а полноценная линия:
- природа
- человек
- безопасность
- страна
- экология
- история / государство в 4 классе

### Wave 31 — gamification 2.0
Только после ядра:
- XP
- levels
- combo
- missions
- richer profile
- achievements shelf
- daily bonus

### Wave 32 — late layers
И только потом:
- спецпредметы
- психология
- экспериментальные взрослые слои
- персонализированные long-term profiles

## Что сознательно остаётся позже

Я не тяну вперёд раньше времени:
- спецпредметы
- психологию
- натальные / нумерологические идеи
- тяжёлую геймификацию

Причина простая: сейчас важнее довести школьное ядро, теорию `5–7`, предметный mesh, диагностику, доступность и mobile shell.
