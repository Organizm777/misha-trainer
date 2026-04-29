# WAVE91H Completion Report

Дата сборки: 2026-04-28

## Закрытые пункты плана

- G1 — Notification API: локальные напоминания с запросом разрешения и учётом тихого часа.
- G2 — Heat map знаний: карта тем по локальному прогрессу, ошибкам и тегам сложности.
- G3 — PDF-отчёт для родителей: print-ready HTML, сохраняемый через браузер как PDF.
- G4 — Прогресс-бар ФГОС: агрегированные предметные области и проценты освоения.
- G6 — Режим «Тихий час»: окно времени, баннер, приглушение уведомлений/сигналов.
- G7 — QR-коды для параграфов: локальный SVG QR для текущего класса/темы.
- G8 — «Задание дня» возвращено только как мини-баннер в карточках классов, без большого блока на главной.
- H1 — уровни «Новичок → Легенда».
- H2 — daily quiz в Wordle-стиле.
- H3 — сезонные events.
- H4 — локальный marathon leaderboard.
- J4 — Brotli pre-compression для критических HTML/JS/CSS ассетов.
- J7 — static eager JS budget: все grade pages <= 1500 KiB.
- J8 — modulepreload для core/extended runtime на страницах классов.

## Runtime

Новый слой встроен в существующий extended runtime, без нового eager feature-бандла:

```text
assets/js/bundle_grade_runtime_extended_wave89b.421a8bd8e8.js
```

Добавлен небольшой lazy-loader payload-чанков:

```text
assets/js/chunk_grade_lazy_payloads_wave91h.f1c9080079.js
```

## Performance

Самые тяжёлые payload-чанки переведены из initial script list в post-DOM lazy loading:

- grade 5: `chunk_subject_expansion_wave60...`, `chunk_grade_content_wave86l_content_balance...`
- grade 6: `chunk_subject_expansion_wave60...`
- grade 7: `chunk_subject_expansion_wave89c_secondary_stem_7_9...`, `chunk_subject_expansion_wave60...`
- grade 8: `chunk_subject_expansion_wave89c_secondary_stem_7_9...`, `chunk_subject_expansion_wave60...`, `chunk_subject_expansion_wave38...`
- grade 9: `chunk_subject_expansion_wave89c_secondary_stem_7_9...`
- grade 11: `chunk_subject_expansion_wave86m_gap_balance_grade11...`

Максимум eager JS после оптимизации:

```text
1498.7 KiB · grade6_v2.html
```

## Brotli

Сгенерированы `.br` файлы для критических статических ресурсов. Количество в `asset-manifest.json`:

```text
brotli_count: 117
brotli_wave: wave91h
```

## Проверки

```bash
node --check assets/_src/js/bundle_grade_runtime_extended_wave89b.js
node --check assets/js/bundle_grade_runtime_extended_wave89b.421a8bd8e8.js
node --check assets/_src/js/chunk_grade_lazy_payloads_wave91h.js
node --check assets/js/chunk_grade_lazy_payloads_wave91h.f1c9080079.js
node --check sw.js
node tools/audit_wave91h_ux_perf.mjs
node tools/precompress_brotli_wave91h.mjs --check
node tools/audit_visual_interactive_wave91g.mjs
node tools/audit_learning_formats_wave91f.mjs
node tools/audit_learning_formats_wave91e.mjs
node tools/audit_scripts_budget_wave89c.mjs
node tools/audit_hamburger_wave89f.mjs
node tools/audit_simple_mode_wave89d.mjs
node tools/update_index_stats.mjs --check
node tools/validate_questions.js
unzip -tq trainer3_wave91h_app.zip
```

## Примечания

- PDF-отчёт реализован как browser print-to-PDF, без серверного PDF-движка и без внешних CDN.
- Notification API работает только после разрешения пользователя и при поддержке браузером уведомлений.
- `assets/fonts/*` по-прежнему не входит в архив; при наложении сборки нужно сохранить production-каталог шрифтов.
