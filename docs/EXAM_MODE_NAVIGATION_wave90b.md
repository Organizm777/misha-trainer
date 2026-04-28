# wave90b — answer-click runtime fix + exam navigation/final review

## Что исправлено

### 1. Выбор ответа на grade-страницах

В первом прологе `assets/_src/js/bundle_grade_runtime_extended_wave89b.js` `currentQuestion()` раньше пытался вызвать `lexicalValue(...)` до того, как этот helper был объявлен в другом IIFE. В результате на клике по варианту ответа мог возникать `ReferenceError`, а в браузере это выглядело как «кнопка ответа не нажимается».

Исправление:
- `currentQuestion()` теперь сначала безопасно читает lexical `prob` через `typeof prob !== 'undefined'`,
- затем использует fallback на `window.prob`,
- старый небезопасный вызов из первого пролога убран.

## 2. Экзаменный режим по roadmap `#8`

`assets/_src/js/bundle_exam.js` теперь даёт полноценную экзаменную навигацию внутри активного structured-pack:

- палитра номеров заданий;
- явный переход к любому номеру;
- действие `📌 Отметить «вернусь»`;
- модальное окно `Финальная проверка` перед завершением варианта;
- отдельные действия `Вернуться к варианту` / `Завершить и показать результат`;
- отложенная проверка: ответ не раскрывается сразу, а финальный разбор строится после завершения pack;
- повторный заход в уже отвеченное задание сохраняет и показывает выбранный вариант;
- `gradeStats` пересчитывается из отложенной карты ответов перед `showResult()`.

## 3. CI / workflow hardening

Добавлены новые аудиты:

- `tools/audit_answer_click_runtime_wave90a.mjs`
- `tools/audit_exam_mode_navigation_wave90b.mjs`

Оба аудита подключены:
- как hard gate в `validate-questions.yml`;
- как advisory check в `lighthouse-budget.yml`.

Дополнительно `tools/audit_workflow_parity_wave89y.mjs` расширен, чтобы эти новые аудиты не исчезли из Lighthouse workflow при следующих правках.

## 4. Совместимость release metadata

После перехода на build-id `wave90b` были обобщены старые проверки, которые жёстко ожидали только `wave89*`:

- `tools/audit_scripts_budget_wave89c.mjs`
- `tools/audit_critical_bugfixes_wave89a.mjs`
- `tools/audit_simple_mode_wave89d.mjs`

Теперь они проверяют минимум версии через `waveRank(...)`, а не через статичный regex на `wave89`.
