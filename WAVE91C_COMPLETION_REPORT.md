# WAVE91C COMPLETION REPORT

Дата: 2026-04-28
База: wave91a / wave91b

## Закрыто по плану

### B1. Дизайн одежды и текстиля
- Добавлен lazy JSON-банк `assets/data/spec_subjects/fashion_design.json`.
- 10 тем, 150 вопросов: история моды, цветоведение, материаловедение, конструирование, моделирование, технология пошива, стили, бренды/индустрия, фэшн-иллюстрация, устойчивая мода.

### B2. Архитектура
- Добавлен отдельный lazy JSON-банк `assets/data/spec_subjects/architecture.json`.
- 10 тем, 150 вопросов.
- Архитектура отделена от существующего направления «Строительство».

### B3. Графический дизайн
- Добавлен lazy JSON-банк `assets/data/spec_subjects/graphic_design.json`.
- 8 тем, 80 вопросов.

### B4. Дизайн интерьера
- Добавлен lazy JSON-банк `assets/data/spec_subjects/interior_design.json`.
- 7 тем, 70 вопросов.

### B5. Вступительные (дизайн)
- Добавлен lazy JSON-банк `assets/data/spec_subjects/design_entrance.json`.
- 6 тем, 60 вопросов.

### B6. История искусств — расширение
- Расширен школьный предмет `История искусств` в grade 10.
- Добавлены темы: `Дизайн XX–XXI веков`, `Фэшн-иллюстрация`, `Костюм в искусстве`, `Плакат и графика`, `Промышленный дизайн`.
- Для новых тем добавлены теория и генераторы вопросов.

## Итог

- Новые спецпредметы: 5.
- Новые темы спецпредметов: 41.
- Новые вопросы спецпредметов: 510.
- Всего спецпредметов после обновления: 11 направлений, 93 темы, 3588 вопросов.
- Дополнительно расширена школьная история искусств: +5 тем.

## Runtime / UI / offline

- `bundle_special_subjects` обновлён до `wave91b` и поддерживает поле `ex`.
- После ответа в спецпредметах отображается подсказка и короткий разбор.
- Главная карточка «Спецпредметы» обновлена до `11 направлений · 93 темы`.
- Hero-счётчики главной обновлены до `40+` предметов и `15 000+` задач.
- `spec_subjects.html` meta description обновлён под новые счётчики.
- `sw.js`, `healthz.json` и `assets/asset-manifest.json` синхронизированы на `trainer-build-wave91c-2026-04-28`.

## Проверки

- `node --check sw.js`
- `node --check assets/_src/js/bundle_special_subjects.js`
- `node --check assets/js/bundle_special_subjects.f45ea13d73.js`
- `node --check tools/update_index_stats.mjs`
- `node --check tools/audit_special_subjects_wave91b.mjs`
- `node tools/audit_special_subjects_wave91b.mjs`
- `node tools/audit_daily_question_wave88a.mjs`
- `node tools/audit_critical_bugfixes_wave89a.mjs`
- `node tools/audit_art_history_wave91c.mjs`

## Оставлено дальше

- Следующий приоритетный блок: A1–A6 расширение ОГЭ/ЕГЭ до 50+ вариантов и C1 теория Английского.
