# MERGE_PASS_wave89b

## Что сделано

Волна `wave89b` закрывает техдолг из плана: вместо россыпи мелких post-wave87w runtime/content-ассетов grade-страницы теперь используют два укрупнённых live-бандла.

### Новый merged runtime

`assets/_src/js/bundle_grade_runtime_extended_wave89b.js`

Внутри объединены:
- `bundle_grade_runtime_interactions_wave87w`
- `bundle_grade_runtime_inputs_timing_wave87x`
- `bundle_grade_runtime_keyboard_wave88c`
- `bundle_grade_runtime_breadcrumbs_wave88d`

Поведение не меняется: это буквальный merge-pass поверх уже рабочих слоёв. Для grades 1–7 интерактивные режимы по-прежнему не активируются, потому что guard на grade живёт внутри самого runtime.

### Новый merged senior content chunk

`assets/_src/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.js`

Внутри объединены:
- `chunk_subject_expansion_wave87y_free_input_banks`
- `chunk_subject_expansion_wave87z_text_input_banks`
- `chunk_subject_expansion_wave88b_multi_select_banks`

Chunk по-прежнему подключается только на `grade8_v2` … `grade11_v2`.

## Эффект по количеству script-тегов

- `grade8_v2.html`: `25 → 20`
- `grade9_v2.html`: `23 → 18`
- `grade10_v2.html`: `23 → 18`
- `grade11_v2.html`: `23 → 18`

Младшие/средние классы тоже сокращают число запросов, потому что три runtime-слоя (`inputs_timing`, `keyboard`, `breadcrumbs`) теперь идут одним файлом.

## Дополнительная чистка

- удалён deprecated source `assets/_src/js/bundle_grade_runtime_wave86z.js`
- после `cleanup_build_artifacts --apply` старые hashed live-ассеты wave87w/wave87x/wave88c/wave88d и wave87y/wave87z/wave88b убраны из `asset-manifest.json` и SW precache

## Проверка

Основная проверка: `node tools/audit_merge_pass_wave89b.mjs`
