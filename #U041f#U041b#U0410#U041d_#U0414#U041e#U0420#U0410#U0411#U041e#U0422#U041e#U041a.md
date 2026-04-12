# Тренажёр: финальный план доработок v5 (ФИНАЛ)

Источники: DeepSeek (16 п.), Gemini (6 п.), GPT (9 п.), Claude (50+ категорий)

---

## ✅ ИСПРАВЛЕНО — 53 пункта

Все замечания из трёх рецензий (DeepSeek, Gemini, GPT) закрыты.

### Критические баги (19)
- grade1/2: заголовок/манифест «3 класс», localStorage m3_, отсутствующий движок, genBody→genNature, genPlants→genAnimals
- grade4-7: shareSession «3 класс»
- grade8-11: localStorage без суффикса, fetchWithTimeout SyntaxError, хардкод 2026, приватность opt-out→opt-in, XSS через имя
- grade3-11: isCurrent хардкод grade10, showClassSelect без 1-2 класса
- diagnostic: esc() баг, алгоритм не менял класс (GPT§1), adaptNext не расширял последовательность, Math.max(3→1), «undefined кл», дубликат «пере/пере-»
- tests.html: countDoneTests ReferenceError

### Безопасность (5)
- Приватность по умолчанию, XSS escName, npoint.io timeout+fallback, AudioContext resume
- Код игрока: 4→8 символов (32^8 ≈ 1.1 трлн комбинаций)

### Контент (7)
- index.html: «3-11»→«1-11», счётчики тем, описания предметов
- diagnostic QBANK: 185→306 вопросов по 12 предметам
- Дневная норма по возрасту

### Инфраструктура (10)
- Service Worker, тёмная тема, CSS var backgrounds, viewport, Escape, font fallback, ARIA, theme-color, BADGES единая сигнатура, diagnostic fallback

### Продуктовые правки (4)
- tests.html: IQ→«Логическое мышление» + дисклеймер
- tests.html: «визуал/аудиал/кинестетик»→«стили восприятия»
- tests.html: updatePortraitCTA после refreshMenu
- diagnostic: кнопки «Тренировать» в результатах

### Архитектура (8)
- Родительская панель (dashboard.html)
- engine10.js + engine10.css — единый движок grade10
- Все 11 классов на едином движке (grade1-11_v2.html)
- Параметризация: GRADE_NUM, GRADE_TITLE, RUSH_BIN_ID, DAILY_NORM
- Все ссылки обновлены на v2-файлы (index, dashboard, engine10 showClassSelect, diagnostic)
- focus-visible стили для клавиатурной навигации
- type="button" на всех кнопках
- −506 КБ (1829→1323 КБ, −28%)

---

## ❌ ЛОЖНЫЕ СРАБАТЫВАНИЯ (2)
- genOlyF 'deep' (DS§1): генераторы возвращают массив, код верен
- grade6 genNegative скобки (DS§8): синтаксически корректно

---

## 🟡 ОСТАЛОСЬ — мелочи

1. **npoint.io race condition** (GPT§5) — last-write-wins при одновременной работе. Решение требует серверной части. Некритично при текущем масштабе.

2. **Расширение QBANK** — алгебра (20) и геометрия (19) — самые тонкие предметы. Можно добавить ещё по 5-10 вопросов.

3. **Старые standalone-файлы** — grade1-11.html остались в outputs/ для совместимости. Можно удалить после проверки v2.

---

## 📦 ФАЙЛЫ ДЛЯ ДЕПЛОЯ

```
Основные (обязательные):
  index.html              — главная страница
  grade1_v2.html          — 1 класс (25 КБ)
  grade2_v2.html          — 2 класс (24 КБ)
  grade3_v2.html          — 3 класс (31 КБ)
  grade4_v2.html          — 4 класс (39 КБ)
  grade5_v2.html          — 5 класс (43 КБ)
  grade6_v2.html          — 6 класс (45 КБ)
  grade7_v2.html          — 7 класс (30 КБ)
  grade8_v2.html          — 8 класс (90 КБ)
  grade9_v2.html          — 9 класс (89 КБ)
  grade10_v2.html         — 10 класс (720 КБ)
  grade11_v2.html         — 11 класс (89 КБ)
  engine10.js             — общий движок (84 КБ)
  engine10.css            — общие стили (11 КБ)
  diagnostic.html         — сквозная диагностика
  tests.html              — портрет ученика
  dashboard.html          — родительская панель
  sw.js                   — Service Worker

Можно удалить (старые standalone):
  grade1-11.html          — заменены на _v2
  engine.js, engine.css   — заменены на engine10.*
  grade5_refactored.html  — промежуточный пилот
```
