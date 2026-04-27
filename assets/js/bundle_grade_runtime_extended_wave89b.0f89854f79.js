/* wave89b: merge pass for grade runtime extensions (wave87w + wave87x + wave88c + wave88d) */
/* bundle_grade_runtime_interactions_wave87w */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave87wInteractiveFormats) return;

  var root = window;
  var grade = String(root.GRADE_NUM || root.GRADE_NO || '');
  if (!/^(8|9|10|11)$/.test(grade)) {
    root.__wave87wInteractiveFormats = { version:'wave88b', active:false, grade:grade };
    return;
  }

  var TYPES = Object.freeze({
    FIND_ERROR: 'find-error',
    SEQUENCE: 'sequence',
    MATCH: 'match',
    MULTI_SELECT: 'multi-select'
  });

  function asText(value){
    return String(value == null ? '' : value);
  }
  function unique(list){
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = asText(item).trim();
      if (!value) return;
      if (out.indexOf(value) === -1) out.push(value);
    });
    return out;
  }
  function clone(list){
    return Array.isArray(list) ? list.slice() : [];
  }
  function shuffleLite(list){
    var copy = clone(list);
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }
  function toast(msg){
    try {
      if (typeof root.toast === 'function') root.toast(msg);
    } catch (_err) {}
  }
  function currentQuestion(){
    var lexicalQuestion = lexicalValue(function(){ return prob; });
    if (lexicalQuestion && typeof lexicalQuestion === 'object') return lexicalQuestion;
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function isInteractiveQuestion(question){
    if (!question || typeof question !== 'object') return false;
    return question.interactionType === TYPES.FIND_ERROR ||
      question.interactionType === TYPES.SEQUENCE ||
      question.interactionType === TYPES.MATCH ||
      question.interactionType === TYPES.MULTI_SELECT;
  }
  function isComplexInteractive(question){
    return !!(question && (
      question.interactionType === TYPES.SEQUENCE ||
      question.interactionType === TYPES.MATCH ||
      question.interactionType === TYPES.MULTI_SELECT
    ));
  }
  function isEditableTarget(target){
    var tag = target && target.tagName ? String(target.tagName).toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || tag === 'select' || !!(target && target.isContentEditable);
  }
  function onPlayScreen(){
    var screen = document.getElementById('s-play');
    return !!(screen && screen.classList && screen.classList.contains('on'));
  }
  function shouldEnhance(question){
    question = question || currentQuestion();
    return !!(isInteractiveQuestion(question) && !root.rushMode && !root.diagMode && onPlayScreen());
  }
  function ensureArray(question, key){
    if (!Array.isArray(question[key])) question[key] = [];
    return question[key];
  }
  function ensureState(question){
    if (!question) return null;
    if (!question.__wave87wState || typeof question.__wave87wState !== 'object') {
      question.__wave87wState = {};
    }
    return question.__wave87wState;
  }
  function ensureSequenceState(question){
    var state = ensureState(question);
    if (!state) return null;
    var correct = clone(question.sequenceItems || []);
    if (!Array.isArray(state.picked)) state.picked = [];
    if (!Array.isArray(state.pool) || !state.pool.length) {
      var basePool = clone(question.sequencePool || []);
      if (!basePool.length) basePool = shuffleLite(correct);
      state.pool = basePool;
    }
    state.picked = state.picked.filter(function(item){ return correct.indexOf(item) !== -1; });
    state.pool = state.pool.filter(function(item){ return correct.indexOf(item) !== -1 && state.picked.indexOf(item) === -1; });
    correct.forEach(function(item){
      if (state.picked.indexOf(item) === -1 && state.pool.indexOf(item) === -1) state.pool.push(item);
    });
    return state;
  }
  function ensureMatchState(question){
    var state = ensureState(question);
    if (!state) return null;
    var pairs = Array.isArray(question.matchPairs) ? question.matchPairs : [];
    if (!Array.isArray(state.selection) || state.selection.length !== pairs.length) {
      state.selection = Array.from({ length: pairs.length }, function(){ return ''; });
    }
    if (!Array.isArray(question.matchOptions) || !question.matchOptions.length) {
      question.matchOptions = shuffleLite(unique(pairs.map(function(pair){ return Array.isArray(pair) ? pair[1] : ''; })));
    }
    return state;
  }
  function declaredMultiSelectOptions(question){
    return unique([].concat(
      Array.isArray(question && question.multiSelectOptions) ? question.multiSelectOptions : [],
      Array.isArray(question && question.multiSelectItems) ? question.multiSelectItems : [],
      Array.isArray(question && question.optionLabels) ? question.optionLabels : [],
      Array.isArray(question && question.optionsRaw) ? question.optionsRaw : []
    ));
  }
  function multiSelectCorrect(question){
    var direct = unique(question && question.multiSelectAnswers);
    var base = declaredMultiSelectOptions(question);
    if (direct.length) return base.length ? base.filter(function(item){ return direct.indexOf(item) !== -1; }) : direct;
    var parsed = [];
    var raw = asText(question && question.answer);
    if (raw) parsed = raw.split('|').map(function(item){ return asText(item).trim(); }).filter(Boolean);
    parsed = unique(parsed);
    return base.length ? base.filter(function(item){ return parsed.indexOf(item) !== -1; }) : parsed;
  }
  function multiSelectAllOptions(question){
    return unique([].concat(
      declaredMultiSelectOptions(question),
      multiSelectCorrect(question)
    ));
  }
  function multiSelectMin(question){
    var fallback = multiSelectCorrect(question).length || 2;
    var value = Number(question && question.multiSelectMin);
    if (!(value > 0)) value = fallback;
    var total = multiSelectAllOptions(question).length || value;
    return Math.max(1, Math.min(total, Math.round(value)));
  }
  function multiSelectMax(question){
    var min = multiSelectMin(question);
    var fallback = multiSelectCorrect(question).length || min;
    var value = Number(question && question.multiSelectMax);
    if (!(value > 0)) value = fallback;
    var total = multiSelectAllOptions(question).length || value;
    return Math.max(min, Math.min(total, Math.round(value)));
  }
  function selectionFromRaw(question, raw){
    var values = [];
    if (Array.isArray(raw)) values = raw;
    else {
      var text = asText(raw);
      if (!text) values = [];
      else values = text.split('|').map(function(item){ return asText(item).trim(); });
    }
    return normalizeMultiSelect(question, values);
  }
  function normalizeMultiSelect(question, values){
    var all = multiSelectAllOptions(question);
    var picked = unique(values).filter(Boolean);
    if (!all.length) return picked;
    return all.filter(function(item){ return picked.indexOf(item) !== -1; });
  }
  function serializeMultiSelect(question, values){
    return normalizeMultiSelect(question, values).join(' | ');
  }
  function displayMultiSelect(question, values){
    return normalizeMultiSelect(question, values).join(', ');
  }
  function ensureMultiSelectState(question){
    var state = ensureState(question);
    if (!state) return null;
    state.selected = normalizeMultiSelect(question, state.selected || []);
    return state;
  }
  function optionWord(count){
    var n = Math.abs(Number(count) || 0) % 100;
    var d = n % 10;
    if (n >= 11 && n <= 19) return 'вариантов';
    if (d === 1) return 'вариант';
    if (d >= 2 && d <= 4) return 'варианта';
    return 'вариантов';
  }
  function requirementText(question){
    var min = multiSelectMin(question);
    var max = multiSelectMax(question);
    if (min === max) return 'Нужно отметить ровно ' + min + ' ' + optionWord(min) + '.';
    return 'Нужно отметить от ' + min + ' до ' + max + ' ' + optionWord(max) + '.';
  }
  function countText(count){
    return count + ' ' + optionWord(count);
  }
  function toggleMultiSelect(question, value){
    if (!question || hasSelection()) return false;
    var state = ensureMultiSelectState(question);
    if (!state) return false;
    var item = asText(value).trim();
    if (!item) return false;
    var idx = state.selected.indexOf(item);
    if (idx !== -1) {
      state.selected.splice(idx, 1);
      state.selected = normalizeMultiSelect(question, state.selected);
      return true;
    }
    var max = multiSelectMax(question);
    if (max && state.selected.length >= max) {
      toast(max === multiSelectMin(question)
        ? 'Можно выбрать только ' + countText(max) + '.'
        : 'Нужно выбрать не больше ' + countText(max) + '.');
      return false;
    }
    state.selected.push(item);
    state.selected = normalizeMultiSelect(question, state.selected);
    return true;
  }
  function findErrorSteps(question){
    return clone(question.errorSteps || question.findErrorSteps || question.steps || []);
  }
  function serializeSequence(items){
    return clone(items).map(asText).filter(Boolean).join(' → ');
  }
  function serializePairs(pairs, selection){
    return (Array.isArray(pairs) ? pairs : []).map(function(pair, idx){
      var left = asText(Array.isArray(pair) ? pair[0] : '');
      var right = asText(selection && selection[idx] != null ? selection[idx] : (Array.isArray(pair) ? pair[1] : ''));
      return left + ' → ' + right;
    }).join(' | ');
  }
  function displayAnswer(question, raw){
    var value = asText(raw);
    if (!question) return value;
    if (question.interactionType === TYPES.SEQUENCE) return value || serializeSequence(question.sequenceItems || []);
    if (question.interactionType === TYPES.MATCH) return value || serializePairs(question.matchPairs || [], null);
    if (question.interactionType === TYPES.MULTI_SELECT) return displayMultiSelect(question, raw ? selectionFromRaw(question, raw) : multiSelectCorrect(question));
    return value;
  }
  function ensureOption(question, value){
    value = asText(value);
    var answer = asText(question && question.answer);
    var list = unique([answer].concat(Array.isArray(question && question.options) ? question.options : []).concat([value]));
    question.options = list;
    return list.indexOf(value);
  }
  function submitCustomValue(question, value){
    if (!question || hasSelection()) return false;
    var idx = ensureOption(question, value);
    if (idx < 0) return false;
    if (typeof baseAns === 'function') {
      baseAns.call(root, idx);
      return true;
    }
    return false;
  }
  function stepButton(label, text, className){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'opt';
    var key = document.createElement('span');
    key.className = 'k';
    key.textContent = asText(label);
    var body = document.createElement('span');
    body.textContent = asText(text);
    button.appendChild(key);
    button.appendChild(body);
    return button;
  }
  function card(title, text){
    var wrap = document.createElement('div');
    wrap.className = 'fb';
    if (title) {
      var head = document.createElement('div');
      head.className = 'fbr';
      head.textContent = title;
      wrap.appendChild(head);
    }
    if (text) {
      var body = document.createElement('div');
      body.className = 'fbh';
      body.textContent = text;
      wrap.appendChild(body);
    }
    return wrap;
  }
  function makePrimaryButton(text){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-p';
    button.textContent = text;
    return button;
  }
  function makeSecondaryButton(text){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-o';
    button.textContent = text;
    return button;
  }
  function appendExplanationBlock(rootEl, title, content){
    if (!content) return;
    var box = document.createElement('div');
    box.className = 'fbex';
    if (title) {
      var strong = document.createElement('b');
      strong.textContent = title + ': ';
      box.appendChild(strong);
    }
    box.appendChild(document.createTextNode(asText(content)));
    rootEl.appendChild(box);
  }
  function appendSequenceList(rootEl, items, prefix){
    clone(items).forEach(function(item, idx){
      var node = stepButton(prefix || (idx + 1), item, 'opt ok');
      node.disabled = true;
      rootEl.appendChild(node);
    });
  }
  function appendMatchRows(rootEl, pairs, selection, markUser){
    (Array.isArray(pairs) ? pairs : []).forEach(function(pair, idx){
      var left = asText(Array.isArray(pair) ? pair[0] : '');
      var right = asText(Array.isArray(pair) ? pair[1] : '');
      var chosen = asText(selection && selection[idx]);
      var row = document.createElement('div');
      row.className = 'fbex';
      var title = document.createElement('b');
      title.textContent = left + ' → ';
      row.appendChild(title);
      row.appendChild(document.createTextNode(right));
      if (markUser && chosen && chosen !== right) {
        row.appendChild(document.createElement('br'));
        var user = document.createElement('span');
        user.textContent = 'Ваш вариант: ' + chosen;
        row.appendChild(user);
      }
      rootEl.appendChild(row);
    });
  }
  function feedbackTitle(correct, withHelp, type){
    if (correct && withHelp) return '✓ Верно, но с подсказкой — не в зачёт серии';
    if (correct) return '✓ Верно!';
    if (type === TYPES.SEQUENCE) return '✗ Порядок шагов получился неверным';
    if (type === TYPES.MATCH) return '✗ Есть ошибки в сопоставлении';
    if (type === TYPES.MULTI_SELECT) return '✗ Есть ошибки в выборе вариантов';
    return '✗ Неверный шаг';
  }
  function renderInteractiveFeedback(question){
    if (!shouldEnhance(question)) return;
    var slot = document.getElementById('fba');
    if (!slot) return;
    if (!hasSelection()) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = '';
    var correct = asText(selectionValue()) === asText(question.answer);
    var wrap = document.createElement('div');
    wrap.className = 'fb';

    var head = document.createElement('div');
    head.className = 'fbr';
    head.textContent = feedbackTitle(correct, !!root.usedHelp, question.interactionType);
    wrap.appendChild(head);

    if (!correct && question.hint) {
      var hint = document.createElement('div');
      hint.className = 'fbh';
      hint.textContent = '💡 ' + asText(question.hint);
      wrap.appendChild(hint);
    }

    if (question.interactionType === TYPES.FIND_ERROR) {
      appendExplanationBlock(wrap, 'Первый неверный шаг', displayAnswer(question, question.answer));
      if (!correct) appendExplanationBlock(wrap, 'Ваш выбор', displayAnswer(question, root.sel));
    } else if (question.interactionType === TYPES.SEQUENCE) {
      appendExplanationBlock(wrap, 'Правильный порядок', displayAnswer(question, question.answer));
      if (!correct) appendExplanationBlock(wrap, 'Ваш порядок', displayAnswer(question, root.sel));
    } else if (question.interactionType === TYPES.MATCH) {
      var matchState = ensureMatchState(question);
      appendMatchRows(wrap, question.matchPairs || [], matchState && matchState.selection, !correct);
    } else if (question.interactionType === TYPES.MULTI_SELECT) {
      appendExplanationBlock(wrap, 'Правильный набор', displayAnswer(question, question.answer));
      if (!correct) appendExplanationBlock(wrap, 'Ваш выбор', displayAnswer(question, root.sel));
    }

    appendExplanationBlock(wrap, 'Разбор', question.ex || question.hint || '');

    var next = makePrimaryButton('Следующий →');
    next.addEventListener('click', function(){ if (typeof root.nextQ === 'function') root.nextQ(); });
    wrap.appendChild(next);
    slot.appendChild(wrap);
  }

  function renderFindError(question, opts){
    var steps = findErrorSteps(question);
    opts.innerHTML = '';
    opts.appendChild(card('Найди первый неверный шаг', 'Прочитай решение и нажми на строку, где впервые появилась ошибка.'));
    steps.forEach(function(step, idx){
      var className = 'opt';
      if (hasSelection()) {
        className += ' done';
        if (asText(step) === asText(question.answer)) className += ' ok';
        else if (asText(step) === asText(selectionValue())) className += ' no';
        else className += ' dim';
      }
      var button = stepButton(idx + 1, step, className);
      button.disabled = hasSelection();
      if (!hasSelection()) {
        button.addEventListener('click', function(){ submitCustomValue(question, step); });
      }
      opts.appendChild(button);
    });
  }

  function renderSequence(question, opts){
    var steps = clone(question.sequenceItems || []);
    var state = ensureSequenceState(question);
    opts.innerHTML = '';
    opts.appendChild(card('Расставь шаги по порядку', 'Сначала собери правильную последовательность, потом нажми «Проверить».'));

    if (hasSelection()) {
      appendSequenceList(opts, steps);
      return;
    }

    var chosenBox = card('Ваш порядок', state.picked.length ? 'Нажми на шаг, если хочешь убрать его из ответа.' : 'Пока пусто — начни собирать алгоритм снизу.');
    state.picked.forEach(function(item, idx){
      var button = stepButton(idx + 1, item, 'opt');
      button.addEventListener('click', function(){
        state.picked.splice(idx, 1);
        state.pool.push(item);
        if (typeof root.render === 'function') root.render();
      });
      chosenBox.appendChild(button);
    });
    opts.appendChild(chosenBox);

    var poolBox = card('Доступные шаги', 'Нажимай на шаги в том порядке, в котором их нужно выполнить.');
    state.pool.forEach(function(item, idx){
      var button = stepButton(String.fromCharCode(65 + idx), item, 'opt');
      button.addEventListener('click', function(){
        state.pool.splice(idx, 1);
        state.picked.push(item);
        if (typeof root.render === 'function') root.render();
      });
      poolBox.appendChild(button);
    });
    opts.appendChild(poolBox);

    var submit = makePrimaryButton('Проверить порядок');
    submit.addEventListener('click', function(){
      if (state.picked.length !== steps.length) return toast('Собери весь порядок до конца.');
      submitCustomValue(question, serializeSequence(state.picked));
    });
    opts.appendChild(submit);

    var reset = makeSecondaryButton('Сбросить порядок');
    reset.addEventListener('click', function(){
      state.picked = [];
      state.pool = clone(question.sequencePool || []);
      if (!state.pool.length) state.pool = shuffleLite(steps);
      if (typeof root.render === 'function') root.render();
    });
    opts.appendChild(reset);
  }

  function renderMatch(question, opts){
    var pairs = Array.isArray(question.matchPairs) ? question.matchPairs : [];
    var state = ensureMatchState(question);
    opts.innerHTML = '';
    opts.appendChild(card('Соедини пары', 'Для каждого элемента слева выбери соответствующий вариант справа.'));

    pairs.forEach(function(pair, idx){
      var row = document.createElement('div');
      row.className = 'fb';

      var head = document.createElement('div');
      head.className = 'fbr';
      head.textContent = asText(Array.isArray(pair) ? pair[0] : '');
      row.appendChild(head);

      var hint = document.createElement('div');
      hint.className = 'fbh';
      hint.textContent = !hasSelection() ? 'Выбери соответствие из списка.' : 'Правильная пара: ' + asText(Array.isArray(pair) ? pair[1] : '');
      row.appendChild(hint);

      var select = document.createElement('select');
      select.setAttribute('aria-label', 'Выбери пару для ' + asText(Array.isArray(pair) ? pair[0] : ''));
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Выбери соответствие';
      select.appendChild(placeholder);
      clone(question.matchOptions || []).forEach(function(option){
        var item = document.createElement('option');
        item.value = option;
        item.textContent = option;
        if (asText(state.selection[idx]) === asText(option)) item.selected = true;
        select.appendChild(item);
      });
      select.disabled = hasSelection();
      if (!hasSelection()) {
        select.addEventListener('change', function(){ state.selection[idx] = asText(select.value); });
      }
      row.appendChild(select);
      opts.appendChild(row);
    });

    if (hasSelection()) return;

    var submit = makePrimaryButton('Проверить пары');
    submit.addEventListener('click', function(){
      if (state.selection.some(function(item){ return !asText(item); })) return toast('Заполни все пары.');
      submitCustomValue(question, serializePairs(pairs, state.selection));
    });
    opts.appendChild(submit);

    var reset = makeSecondaryButton('Сбросить пары');
    reset.addEventListener('click', function(){
      state.selection = Array.from({ length: pairs.length }, function(){ return ''; });
      if (typeof root.render === 'function') root.render();
    });
    opts.appendChild(reset);
  }

  function renderMultiSelect(question, opts){
    var all = multiSelectAllOptions(question);
    var state = ensureMultiSelectState(question);
    var min = multiSelectMin(question);
    var max = multiSelectMax(question);
    var chosen = hasSelection() ? selectionFromRaw(question, root.sel) : state.selected;
    var correct = multiSelectCorrect(question);

    opts.innerHTML = '';
    opts.appendChild(card('Выбери несколько ответов', requirementText(question) + ' Затем нажми «Проверить».'));

    var summary = card('Текущий выбор', chosen.length
      ? 'Отмечено: ' + countText(chosen.length) + '. ' + requirementText(question)
      : 'Пока ничего не отмечено. ' + requirementText(question));
    if (chosen.length && !hasSelection()) {
      chosen.forEach(function(item){
        var chip = stepButton('✓', item, 'opt ok');
        chip.setAttribute('role', 'checkbox');
        chip.setAttribute('aria-checked', 'true');
        chip.addEventListener('click', function(){
          toggleMultiSelect(question, item);
          if (typeof root.render === 'function') root.render();
        });
        summary.appendChild(chip);
      });
    } else if (hasSelection()) {
      appendExplanationBlock(summary, 'Вы выбрали', displayMultiSelect(question, chosen) || 'ничего');
    }
    opts.appendChild(summary);

    var pool = card('Варианты', 'Можно отметить несколько пунктов. Номер на кнопке можно использовать с клавиатуры.');
    all.forEach(function(item, idx){
      var selected = chosen.indexOf(item) !== -1;
      var isCorrect = correct.indexOf(item) !== -1;
      var className = 'opt';
      if (hasSelection()) {
        className += ' done';
        if (isCorrect) className += ' ok';
        else if (selected) className += ' no';
        else className += ' dim';
      } else if (selected) {
        className += ' ok';
      }
      var button = stepButton(idx + 1, item, className);
      button.setAttribute('role', 'checkbox');
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
      button.setAttribute('aria-keyshortcuts', String(idx + 1));
      if (!hasSelection()) {
        button.addEventListener('click', function(){
          if (toggleMultiSelect(question, item) && typeof root.render === 'function') root.render();
        });
      } else {
        button.disabled = true;
      }
      pool.appendChild(button);
    });
    opts.appendChild(pool);

    if (hasSelection()) return;

    var submit = makePrimaryButton('Проверить варианты');
    submit.addEventListener('click', function(){
      if (state.selected.length < min || state.selected.length > max) return toast(requirementText(question));
      submitCustomValue(question, serializeMultiSelect(question, state.selected));
    });
    opts.appendChild(submit);

    var reset = makeSecondaryButton('Сбросить выбор');
    reset.addEventListener('click', function(){
      state.selected = [];
      if (typeof root.render === 'function') root.render();
    });
    opts.appendChild(reset);
  }

  function enhanceInteractiveQuestion(){
    var question = currentQuestion();
    if (!shouldEnhance(question)) return;
    var opts = document.getElementById('opts');
    if (!opts) return;
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-label', question.interactionType === TYPES.MULTI_SELECT ? 'Множественный выбор' : 'Интерактивное задание');
    if (question.interactionType === TYPES.FIND_ERROR) renderFindError(question, opts);
    else if (question.interactionType === TYPES.SEQUENCE) renderSequence(question, opts);
    else if (question.interactionType === TYPES.MATCH) renderMatch(question, opts);
    else if (question.interactionType === TYPES.MULTI_SELECT) renderMultiSelect(question, opts);
    renderInteractiveFeedback(question);
  }

  function bindInteractiveKeyboard(){
    document.addEventListener('keydown', function(event){
      var question = currentQuestion();
      if (!shouldEnhance(question) || !question || hasSelection()) return;
      if (question.interactionType !== TYPES.MULTI_SELECT) return;
      if (isEditableTarget(event.target)) return;
      var key = asText(event.key);
      if (/^[1-6]$/.test(key)) {
        var idx = Number(key) - 1;
        var all = multiSelectAllOptions(question);
        if (!all[idx]) return;
        event.preventDefault();
        event.stopPropagation();
        if (toggleMultiSelect(question, all[idx]) && typeof root.render === 'function') root.render();
        return;
      }
      if (key === 'Enter' || key === 'NumpadEnter') {
        var state = ensureMultiSelectState(question);
        var min = multiSelectMin(question);
        var max = multiSelectMax(question);
        event.preventDefault();
        event.stopPropagation();
        if (state.selected.length < min || state.selected.length > max) return toast(requirementText(question));
        submitCustomValue(question, serializeMultiSelect(question, state.selected));
      }
    }, true);
  }

  bindInteractiveKeyboard();

  var baseNextQ = typeof root.nextQ === 'function' ? root.nextQ : null;
  if (baseNextQ) {
    root.nextQ = function(){
      var result;
      var tries = 0;
      do {
        result = baseNextQ.apply(this, arguments);
        tries += 1;
        if (!(root.rushMode && isComplexInteractive(currentQuestion()))) break;
      } while (tries < 8);
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try { enhanceInteractiveQuestion(); } catch (_err) {}
      return result;
    };
  }

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(idx){
      var question = currentQuestion();
      if (!shouldEnhance(question)) return baseAns.apply(this, arguments);
      if (!isInteractiveQuestion(question)) return baseAns.apply(this, arguments);
      if (question.interactionType === TYPES.FIND_ERROR) return baseAns.apply(this, arguments);
      return null;
    };
  }

  root.__wave87wInteractiveFormats = {
    version: 'wave88b',
    active: true,
    grade: grade,
    types: Object.keys(TYPES).map(function(key){ return TYPES[key]; }),
    isInteractiveQuestion: isInteractiveQuestion,
    shouldEnhance: shouldEnhance,
    serializeSequence: serializeSequence,
    serializePairs: serializePairs,
    serializeMultiSelect: serializeMultiSelect,
    multiSelectOptions: multiSelectAllOptions,
    multiSelectCorrect: multiSelectCorrect
  };
})();


/* bundle_grade_runtime_inputs_timing_wave87x */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave87xInputTimingRuntime) return;

  var root = window;
  var STYLE_ID = 'wave87x-input-timing-style';
  var SAMPLE_LIMIT = 360;
  var TRAINING_SAMPLE_LIMIT = 120;
  var MAX_ELAPSED_MS = 20 * 60 * 1000;
  var timingState = { activeQuestion:null, activeId:'', shownAt:0, logged:false };
  var allowProgrammaticAns = false;

  function gradeKey(){
    return String(root.GRADE_NUM || root.GRADE_NO || '');
  }
  function storageKey(){
    return 'trainer_response_timing_' + gradeKey();
  }
  function asText(value){
    return String(value == null ? '' : value);
  }
  function unique(list){
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = asText(item);
      if (!value) return;
      if (out.indexOf(value) === -1) out.push(value);
    });
    return out;
  }
  function clone(list){
    return Array.isArray(list) ? list.slice() : [];
  }
  function toNumber(value){
    var n = Number(value);
    return isFinite(n) ? n : 0;
  }
  function safeJSONParse(raw, fallback){
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }
  function readStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem(storageKey());
      var data = safeJSONParse(raw, { version:'wave87x', grade:gradeKey(), samples:[] });
      if (!data || typeof data !== 'object') data = { version:'wave87x', grade:gradeKey(), samples:[] };
      if (!Array.isArray(data.samples)) data.samples = [];
      return data;
    } catch (_err) {
      return { version:'wave87x', grade:gradeKey(), samples:[] };
    }
  }
  function writeStore(data){
    try {
      if (!root.localStorage) return false;
      var rows = Array.isArray(data && data.samples) ? data.samples.filter(function(item){
        return item && isFinite(item.ms) && item.ms > 0;
      }).slice(-SAMPLE_LIMIT) : [];
      var next = {
        version: 'wave87x',
        grade: gradeKey(),
        updatedAt: Date.now(),
        samples: rows
      };
      root.localStorage.setItem(storageKey(), JSON.stringify(next));
      return true;
    } catch (_err) {
      return false;
    }
  }
  function lexicalValue(getter){
    try {
      var value = getter();
      return value === undefined ? undefined : value;
    } catch (_err) {
      return undefined;
    }
  }
  function currentQuestion(){
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function onPlayScreen(){
    var screen = document.getElementById('s-play');
    return !!(screen && screen.classList && screen.classList.contains('on'));
  }
  function isEditableTarget(target){
    if (!target || typeof target !== 'object') return false;
    var tag = String(target.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || !!target.isContentEditable;
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
    } catch (_err) {}
  }
  function normalizeBaseText(value){
    return asText(value)
      .replace(/\u00a0/g, ' ')
      .replace(/[‐‑‒–—−]/g, '-')
      .replace(/[“”«»]/g, '"')
      .replace(/[’`]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  function normalizeClozeText(value){
    return normalizeBaseText(value)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[.!?,;:]+$/g, '')
      .trim();
  }
  function normalizeTextAnswer(value){
    return normalizeBaseText(value)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[“”«»"]/g, ' ')
      .replace(/[’'`]/g, '')
      .replace(/\s*-\s*/g, '-')
      .replace(/[^a-zа-я0-9\- ]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function compactTextAnswer(value){
    return normalizeTextAnswer(value).replace(/[\s-]+/g, '');
  }
  function normalizeUnit(value){
    return normalizeBaseText(value)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/\s*([/%°])/g, '$1')
      .replace(/\s*\/\s*/g, '/')
      .replace(/\s*·\s*/g, '·')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function parseNumericValue(value){
    var raw = normalizeBaseText(value).replace(/,/g, '.');
    if (!raw) return null;
    if (/[=→]/.test(raw)) return null;
    var fraction = raw.match(/^([+-]?\d+)\s*\/\s*(\d+)(?:\s*(.*))?$/);
    if (fraction) {
      var denominator = Number(fraction[2]);
      var numerator = Number(fraction[1]);
      if (!isFinite(numerator) || !isFinite(denominator) || !denominator) return null;
      return {
        num: numerator / denominator,
        unit: normalizeUnit(fraction[3] || ''),
        raw: raw
      };
    }
    var match = raw.match(/^([+-]?\d+(?:\.\d+)?)(?:\s*(.*))?$/);
    if (!match) return null;
    var num = Number(match[1]);
    if (!isFinite(num)) return null;
    return {
      num: num,
      unit: normalizeUnit(match[2] || ''),
      raw: raw
    };
  }
  function isNumericLikeAnswer(answer){
    var raw = normalizeBaseText(answer);
    if (!raw) return false;
    if (/[=→]/.test(raw)) return false;
    if (/√|sqrt|sin|cos|tan|tg|ctg|log|ln|\^|\(|\)/i.test(raw)) return false;
    if (!/^[+-]?\d/.test(raw.replace(/,/g, '.'))) return false;
    return !!parseNumericValue(raw);
  }
  function hasBlankMarker(question){
    return /_{2,}/.test(asText(question && question.question));
  }
  function currentSubjectId(){
    var lexicalSubject = lexicalValue(function(){ return cS; });
    var subject = lexicalSubject && typeof lexicalSubject === 'object' ? lexicalSubject : (root.cS && typeof root.cS === 'object' ? root.cS : null);
    if (subject && subject.id) return String(subject.id);
    var mixed = lexicalValue(function(){ return globalMix; });
    return (mixed == null ? !!root.globalMix : !!mixed) ? 'mix' : '';
  }
  function selectionValue(){
    var lexicalSelection = lexicalValue(function(){ return sel; });
    if (lexicalSelection !== undefined) return lexicalSelection == null ? null : lexicalSelection;
    return root.sel == null ? null : root.sel;
  }
  function hasSelection(){
    return selectionValue() !== null;
  }
  function explicitInputMode(question){
    var mode = normalizeClozeText(question && question.inputMode);
    if (!mode) return '';
    if (mode === 'cloze' || mode === 'fill' || mode === 'blank') return 'cloze';
    if (mode === 'text' || mode === 'input' || mode === 'free-text' || mode === 'short-text' || mode === 'fuzzy-text') return 'text';
    if (mode === 'numeric' || mode === 'number' || mode === 'free-number') return 'numeric';
    return '';
  }
  function pageGrade(){
    var lexicalGrade = lexicalValue(function(){ return typeof GRADE_NUM !== 'undefined' ? GRADE_NUM : (typeof GRADE_NO !== 'undefined' ? GRADE_NO : undefined); });
    var page = toNumber(root.GRADE_NUM || root.GRADE_NO || lexicalGrade || 0);
    return page > 0 ? page : 0;
  }
  function autoInputEligible(question){
    var page = pageGrade();
    if (page) return page >= 8;
    var grade = toNumber(question && (question.grade != null ? question.grade : question.g != null ? question.g : 0));
    return grade >= 8;
  }
  function inputModeFor(question){
    if (!question || !onPlayScreen() || root.rushMode || root.diagMode) return '';
    if (question.interactionType) return '';
    var explicit = explicitInputMode(question);
    if (explicit) return explicit;
    if (!autoInputEligible(question)) return '';
    if (hasBlankMarker(question) && !question.code && !isNumericLikeAnswer(question.answer)) return 'cloze';
    var sid = currentSubjectId();
    var numericSubject = /^(alg|geo|phy|chem|prob)$/.test(sid);
    if (!question.code && isNumericLikeAnswer(question.answer) && (question.isMath || numericSubject)) return 'numeric';
    return '';
  }
  function ensureInputState(question){
    if (!question) return null;
    if (!question.__wave87xInputState || typeof question.__wave87xInputState !== 'object') {
      question.__wave87xInputState = {
        draft: '',
        lastValue: '',
        lastCanonical: '',
        mode: ''
      };
    }
    return question.__wave87xInputState;
  }
  function acceptedAnswers(question){
    return unique([question && question.answer].concat(Array.isArray(question && question.acceptedAnswers) ? question.acceptedAnswers : []).concat(Array.isArray(question && question.answers) ? question.answers : []));
  }
  function formatExampleNumber(value){
    if (!isFinite(value)) return '';
    var rounded = Math.round(value * 1000) / 1000;
    return asText(rounded).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1').replace(/\.$/, '').replace('.', ',');
  }
  function fractionExample(question){
    var answers = acceptedAnswers(question);
    for (var i = 0; i < answers.length; i++) {
      var raw = normalizeBaseText(answers[i]);
      var match = raw.replace(/,/g, '.').match(/^([+-]?\d+)\s*\/\s*(\d+)(?:\s*(.*))?$/);
      if (!match) continue;
      var numerator = Number(match[1]);
      var denominator = Number(match[2]);
      if (!isFinite(numerator) || !isFinite(denominator) || !denominator) continue;
      var unit = normalizeBaseText(match[3] || '');
      var fractionText = match[1] + '/' + match[2] + (unit ? ' ' + unit : '');
      var decimalText = formatExampleNumber(numerator / denominator) + (unit ? ' ' + unit : '');
      return { fraction:fractionText, decimal:decimalText };
    }
    return null;
  }
  function numbersClose(a, b){
    var tolerance = Math.max(1e-6, Math.abs(a) * 1e-6, Math.abs(b) * 1e-6);
    return Math.abs(a - b) <= tolerance;
  }
  function toInteger(value, fallback){
    var num = Number(value);
    return isFinite(num) ? Math.max(0, Math.floor(num)) : fallback;
  }
  function fuzzyMinLength(question){
    var raw = question && (question.fuzzyMinLength != null ? question.fuzzyMinLength : question.minFuzzyLength);
    return Math.max(3, toInteger(raw, 7));
  }
  function textTolerance(question, compactAnswer){
    var len = asText(compactAnswer).length;
    var derived = 0;
    if (len >= 7 && len <= 10) derived = 1;
    else if (len >= 11 && len <= 18) derived = 2;
    else if (len > 18) derived = 3;
    var explicit = question && (question.fuzzyMaxDistance != null ? question.fuzzyMaxDistance : question.maxTypos);
    if (explicit == null || explicit === '') return derived;
    return Math.max(0, Math.min(derived, toInteger(explicit, derived)));
  }
  function levenshteinDistance(a, b, maxDistance){
    a = asText(a);
    b = asText(b);
    if (a === b) return 0;
    var aLen = a.length;
    var bLen = b.length;
    if (!aLen) return bLen;
    if (!bLen) return aLen;
    if (typeof maxDistance === 'number' && Math.abs(aLen - bLen) > maxDistance) return maxDistance + 1;
    var prev = new Array(bLen + 1);
    var curr = new Array(bLen + 1);
    for (var j = 0; j <= bLen; j++) prev[j] = j;
    for (var i = 1; i <= aLen; i++) {
      curr[0] = i;
      var minRow = curr[0];
      var ch = a.charAt(i - 1);
      for (var k = 1; k <= bLen; k++) {
        var cost = ch === b.charAt(k - 1) ? 0 : 1;
        var value = Math.min(prev[k] + 1, curr[k - 1] + 1, prev[k - 1] + cost);
        curr[k] = value;
        if (value < minRow) minRow = value;
      }
      if (typeof maxDistance === 'number' && minRow > maxDistance) return maxDistance + 1;
      var swap = prev;
      prev = curr;
      curr = swap;
    }
    return prev[bLen];
  }
  function fuzzyRatio(a, b, distance){
    return 1 - toNumber(distance) / Math.max(asText(a).length, asText(b).length, 1);
  }
  function matchTextInput(question, entered, answers, primaryAnswer){
    var normalizedEntered = normalizeTextAnswer(entered);
    var compactEntered = compactTextAnswer(entered);
    if (!normalizedEntered) return { ok:false, canonical:primaryAnswer, entered:entered };

    for (var i = 0; i < answers.length; i++) {
      var exactCandidate = asText(answers[i]);
      if (!exactCandidate) continue;
      if (normalizedEntered === normalizeTextAnswer(exactCandidate)) {
        return { ok:true, canonical:primaryAnswer || exactCandidate, entered:entered, matched:exactCandidate, matchKind:'text-exact', distance:0 };
      }
      if (compactEntered && compactEntered === compactTextAnswer(exactCandidate)) {
        return { ok:true, canonical:primaryAnswer || exactCandidate, entered:entered, matched:exactCandidate, matchKind:'text-normalized', distance:0 };
      }
    }

    var minLen = fuzzyMinLength(question);
    for (var j = 0; j < answers.length; j++) {
      var fuzzyCandidate = asText(answers[j]);
      if (!fuzzyCandidate) continue;
      var compactCandidate = compactTextAnswer(fuzzyCandidate);
      var tolerance = textTolerance(question, compactCandidate);
      if (!compactEntered || !compactCandidate || tolerance <= 0) continue;
      if (compactEntered.length < minLen || compactCandidate.length < minLen) continue;
      if (Math.abs(compactEntered.length - compactCandidate.length) > tolerance) continue;
      var distance = levenshteinDistance(compactEntered, compactCandidate, tolerance);
      if (!isFinite(distance) || distance > tolerance) continue;
      var ratio = fuzzyRatio(compactEntered, compactCandidate, distance);
      var minRatio = compactCandidate.length >= 14 ? 0.72 : compactCandidate.length >= 10 ? 0.78 : 0.84;
      if (ratio < minRatio) continue;
      return { ok:true, canonical:primaryAnswer || fuzzyCandidate, entered:entered, matched:fuzzyCandidate, matchKind:'text-fuzzy', distance:distance };
    }

    return { ok:false, canonical:primaryAnswer, entered:entered };
  }
  function matchInput(question, rawValue, mode){
    var entered = normalizeBaseText(rawValue);
    var answers = acceptedAnswers(question);
    var primaryAnswer = asText(question && question.answer);
    if (!entered) return { ok:false, canonical:primaryAnswer, entered:'' };

    if (mode === 'numeric') {
      var parsedInput = parseNumericValue(entered);
      if (parsedInput) {
        for (var i = 0; i < answers.length; i++) {
          var candidate = asText(answers[i]);
          var parsedAnswer = parseNumericValue(candidate);
          if (!parsedAnswer) continue;
          if (!numbersClose(parsedInput.num, parsedAnswer.num)) continue;
          if (parsedInput.unit && parsedAnswer.unit && parsedInput.unit !== parsedAnswer.unit) continue;
          return { ok:true, canonical:primaryAnswer || candidate, entered:entered, matched:candidate, matchKind:'numeric', distance:0 };
        }
      }
      var plainInput = normalizeUnit(entered.replace(/,/g, '.'));
      for (var j = 0; j < answers.length; j++) {
        var candidateText = asText(answers[j]);
        if (plainInput && plainInput === normalizeUnit(candidateText.replace(/,/g, '.'))) {
          return { ok:true, canonical:primaryAnswer || candidateText, entered:entered, matched:candidateText, matchKind:'numeric', distance:0 };
        }
      }
      return { ok:false, canonical:primaryAnswer, entered:entered };
    }

    if (mode === 'text') return matchTextInput(question, entered, answers, primaryAnswer);

    var normalizedEntered = normalizeClozeText(entered);
    for (var k = 0; k < answers.length; k++) {
      var item = asText(answers[k]);
      if (normalizedEntered && normalizedEntered === normalizeClozeText(item)) {
        return { ok:true, canonical:primaryAnswer || item, entered:entered, matched:item, matchKind:'cloze', distance:0 };
      }
    }
    return { ok:false, canonical:primaryAnswer, entered:entered };
  }
  function questionFingerprint(question){
    var raw = [
      asText(question && question.question),
      asText(question && question.answer),
      asText(question && question.tag),
      asText(question && question.code)
    ].join('|');
    var hash = 0;
    for (var i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return 'q' + (hash >>> 0).toString(16);
  }
  function modeName(){
    if (root.rushMode) return 'rush';
    if (root.diagMode) return 'diag';
    return 'train';
  }
  function pushTimingSample(sample){
    var data = readStore();
    var list = Array.isArray(data.samples) ? data.samples.slice(-SAMPLE_LIMIT + 1) : [];
    list.push(sample);
    data.samples = list;
    writeStore(data);
  }
  function armTiming(question){
    if (!question || !onPlayScreen() || hasSelection()) return;
    if (timingState.activeQuestion === question && !timingState.logged) return;
    timingState.activeQuestion = question;
    timingState.activeId = questionFingerprint(question);
    timingState.shownAt = Date.now();
    timingState.logged = false;
  }
  function captureTiming(question){
    if (!question || !timingState.shownAt || timingState.logged) return null;
    if (timingState.activeQuestion !== question && timingState.activeId !== questionFingerprint(question)) return null;
    var elapsed = Date.now() - timingState.shownAt;
    if (!isFinite(elapsed) || elapsed <= 0 || elapsed > MAX_ELAPSED_MS) {
      timingState.logged = true;
      return null;
    }
    var state = ensureInputState(question);
    var sample = {
      ts: Date.now(),
      ms: Math.round(elapsed),
      qid: timingState.activeId || questionFingerprint(question),
      grade: gradeKey(),
      mode: modeName(),
      subject: currentSubjectId(),
      tag: asText(question.tag),
      correct: asText(selectionValue()) === asText(question.answer),
      usedHelp: !!root.usedHelp,
      inputMode: state && state.mode ? state.mode : (inputModeFor(question) || 'choice')
    };
    pushTimingSample(sample);
    if (!question.__wave87xTiming || typeof question.__wave87xTiming !== 'object') question.__wave87xTiming = {};
    question.__wave87xTiming.last = sample;
    timingState.logged = true;
    return sample;
  }
  function ensureOption(question, value){
    value = asText(value);
    var answer = asText(question && question.answer);
    question.options = unique([answer].concat(Array.isArray(question && question.options) ? question.options : []).concat([value]));
    return question.options.indexOf(value);
  }
  function submitCustomValue(question, value){
    if (!question || hasSelection() || typeof root.ans !== 'function') return false;
    var idx = ensureOption(question, value);
    if (idx < 0) return false;
    allowProgrammaticAns = true;
    try {
      root.ans(idx);
      return true;
    } finally {
      allowProgrammaticAns = false;
    }
  }
  function formatSeconds(ms){
    var sec = Math.max(0, toNumber(ms)) / 1000;
    var digits = sec < 10 ? 1 : 0;
    return sec.toFixed(digits).replace('.', ',') + ' с';
  }
  function injectStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave87x-input-card{display:flex;flex-direction:column;gap:10px}',
      '.wave87x-input-box{padding:14px 16px;border-radius:18px;border:1px solid rgba(107,107,126,.16);background:rgba(255,255,255,.6)}',
      '.wave87x-input-title{font-weight:800;font-size:14px;line-height:1.35}',
      '.wave87x-input-note{font-size:12px;color:var(--muted);line-height:1.45}',
      '.wave87x-input-row{display:flex;gap:8px;align-items:stretch}',
      '.wave87x-input{flex:1;min-width:0;padding:14px 16px;border-radius:14px;border:1px solid var(--border);background:var(--card);color:var(--text);font:600 16px/1.2 Golos Text,system-ui,sans-serif;box-shadow:inset 0 1px 0 rgba(255,255,255,.2)}',
      '.wave87x-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(96,165,250,.18)}',
      '.wave87x-chiprow{display:flex;flex-wrap:wrap;gap:8px}',
      '.wave87x-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(107,107,126,.12);font-size:12px;font-weight:700;line-height:1.2}',
      '.wave87x-chip.ok{background:rgba(34,197,94,.14);color:#15803d}',
      '.wave87x-chip.no{background:rgba(239,68,68,.14);color:#b91c1c}',
      '.wave87x-input-inline{font-size:13px;color:var(--text);line-height:1.45}',
      '.wave87x-progress-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}',
      '.wave87x-progress-stat{padding:12px;border-radius:16px;border:1px solid rgba(107,107,126,.12);background:rgba(255,255,255,.55)}',
      '.wave87x-progress-stat .v{display:block;font-size:22px;font-weight:800;line-height:1.1}',
      '.wave87x-progress-stat .l{display:block;font-size:12px;color:var(--muted);margin-top:4px}',
      '.wave87x-topic-list{margin:12px 0 0;padding-left:18px}',
      '.wave87x-topic-list li{margin:6px 0;font-size:13px;line-height:1.4}',
      '@media (max-width:560px){.wave87x-input-row{flex-direction:column}.wave87x-progress-grid{grid-template-columns:1fr}}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }
  function makeButton(text, className){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'btn btn-p';
    button.textContent = text;
    return button;
  }
  function inputPlaceholder(mode, question){
    var customPlaceholder = asText(question && question.inputPlaceholder).trim();
    if (customPlaceholder) return customPlaceholder;
    if (mode === 'numeric') {
      var fraction = fractionExample(question);
      if (fraction) return 'Например: ' + fraction.fraction + ' или ' + fraction.decimal;
      var parsed = parseNumericValue(question && question.answer);
      return parsed && parsed.unit ? 'Например: 12 или 0,5 ' + parsed.unit : 'Введите число';
    }
    if (mode === 'text') return 'Введите слово или короткую фразу';
    return 'Впиши пропущенное слово или форму';
  }
  function inputHelperText(mode, question){
    var customHelper = asText(question && (question.inputHelper || question.inputNote || question.inputHint)).trim();
    if (customHelper) return customHelper;
    if (mode === 'numeric') {
      var fraction = fractionExample(question);
      if (fraction) return 'Можно вводить дробь вроде ' + fraction.fraction + ' или десятичное число ' + fraction.decimal + '. Нажми Enter, чтобы проверить.';
      return parseNumericValue(question && question.answer) && parseNumericValue(question.answer).unit ? 'Можно вводить число с единицами или без них. Нажми Enter, чтобы проверить.' : 'Допускаются точка и запятая. Нажми Enter, чтобы проверить.';
    }
    if (mode === 'text') {
      return textTolerance(question, compactTextAnswer(question && question.answer)) > 0
        ? 'Регистр не важен. В длинных словах допускается небольшая опечатка. Нажми Enter, чтобы проверить.'
        : 'Регистр не важен. Введи слово или короткую фразу и нажми Enter.';
    }
    return 'Регистр не важен. Нажми Enter, чтобы проверить.';
  }
  function currentInputElement(){
    return document.getElementById('wave87x-free-answer');
  }
  function submitCurrentInput(question, mode){
    if (!question || hasSelection()) return false;
    var state = ensureInputState(question);
    var input = currentInputElement();
    var rawValue = input ? input.value : state.draft;
    state.draft = rawValue;
    if (!normalizeBaseText(rawValue)) {
      toast('Сначала введи ответ.');
      try { if (input) input.focus(); } catch (_err) {}
      return false;
    }
    var verdict = matchInput(question, rawValue, mode);
    state.mode = mode;
    state.lastValue = rawValue;
    state.lastCanonical = verdict.ok ? verdict.canonical : asText(question.answer);
    state.lastMatchKind = verdict.ok ? (verdict.matchKind || '') : '';
    state.lastDistance = verdict.ok && isFinite(verdict.distance) ? verdict.distance : 0;
    state.lastMatched = verdict.ok ? asText(verdict.matched || verdict.canonical) : '';
    return submitCustomValue(question, verdict.ok ? verdict.canonical : normalizeBaseText(rawValue));
  }
  function renderInputQuestion(){
    var question = currentQuestion();
    var mode = inputModeFor(question);
    if (!mode) return;

    injectStyles();
    var opts = document.getElementById('opts');
    if (!opts) return;

    var state = ensureInputState(question);
    state.mode = mode;

    var wrap = document.createElement('div');
    wrap.className = 'wave87x-input-card';

    var box = document.createElement('div');
    box.className = 'wave87x-input-box';

    var title = document.createElement('div');
    title.className = 'wave87x-input-title';
    title.textContent = mode === 'numeric' ? 'Введите числовой ответ' : mode === 'text' ? 'Введите короткий ответ' : 'Впишите пропущенный фрагмент';
    box.appendChild(title);

    var note = document.createElement('div');
    note.className = 'wave87x-input-note';
    note.textContent = inputHelperText(mode, question);
    box.appendChild(note);

    var row = document.createElement('div');
    row.className = 'wave87x-input-row';

    var input = document.createElement('input');
    input.id = 'wave87x-free-answer';
    input.className = 'wave87x-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.inputMode = mode === 'numeric' ? 'decimal' : 'text';
    input.placeholder = inputPlaceholder(mode, question);
    input.setAttribute('aria-label', title.textContent);
    input.value = hasSelection() ? (state.lastValue || state.draft || '') : (state.draft || '');
    input.disabled = hasSelection();
    if (!hasSelection()) {
      input.addEventListener('input', function(){ state.draft = input.value; });
      input.addEventListener('keydown', function(event){
        if (event.key === 'Enter' || event.key === 'NumpadEnter') {
          event.preventDefault();
          submitCurrentInput(question, mode);
        }
      });
    }
    row.appendChild(input);

    if (!hasSelection()) {
      var submit = makeButton('Проверить', 'btn btn-p');
      submit.addEventListener('click', function(){ submitCurrentInput(question, mode); });
      row.appendChild(submit);
    }
    box.appendChild(row);

    if (hasSelection()) {
      var info = document.createElement('div');
      info.className = 'wave87x-chiprow';

      var typed = document.createElement('span');
      typed.className = 'wave87x-chip ' + (asText(selectionValue()) === asText(question.answer) ? 'ok' : 'no');
      typed.textContent = 'Ввод: ' + (state.lastValue || '—');
      info.appendChild(typed);

      var timing = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
      if (timing) {
        var chip = document.createElement('span');
        chip.className = 'wave87x-chip';
        chip.textContent = '⏱ ' + formatSeconds(timing.ms);
        info.appendChild(chip);
      }
      if (state.lastMatchKind === 'text-fuzzy') {
        var fuzzyChip = document.createElement('span');
        fuzzyChip.className = 'wave87x-chip';
        fuzzyChip.textContent = '≈ опечатка зачтена';
        info.appendChild(fuzzyChip);
      }
      box.appendChild(info);

      if (state.lastCanonical && normalizeBaseText(state.lastCanonical) !== normalizeBaseText(state.lastValue || '')) {
        var canonical = document.createElement('div');
        canonical.className = 'wave87x-input-inline';
        canonical.textContent = 'Зачтено как: ' + state.lastCanonical;
        box.appendChild(canonical);
      }
    }

    wrap.appendChild(box);
    opts.innerHTML = '';
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-label', mode === 'numeric' ? 'Числовой ответ' : mode === 'text' ? 'Текстовый ответ' : 'Ответ с вводом');
    opts.appendChild(wrap);

    if (!hasSelection()) {
      setTimeout(function(){
        try {
          input.focus({ preventScroll:true });
          if (mode === 'numeric' && input.value) input.select();
        } catch (_err) {}
      }, 0);
    }
  }
  function appendTimingToFeedback(){
    var question = currentQuestion();
    if (!question || !hasSelection()) return;
    var sample = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
    if (!sample) return;
    var slot = document.getElementById('fba');
    if (!slot) return;
    var box = slot.querySelector('.fb');
    if (!box || box.querySelector('[data-wave87x-feedback-time]')) return;
    var info = document.createElement('div');
    info.className = 'fbh';
    info.setAttribute('data-wave87x-feedback-time', '1');
    info.textContent = '⏱ Время ответа: ' + formatSeconds(sample.ms);
    var nextButton = box.querySelector('button.btn');
    if (nextButton) box.insertBefore(info, nextButton);
    else box.appendChild(info);
  }
  function average(values){
    if (!values.length) return 0;
    var total = 0;
    values.forEach(function(item){ total += toNumber(item); });
    return total / values.length;
  }
  function median(values){
    if (!values.length) return 0;
    var copy = values.map(toNumber).sort(function(a, b){ return a - b; });
    var mid = Math.floor(copy.length / 2);
    return copy.length % 2 ? copy[mid] : (copy[mid - 1] + copy[mid]) / 2;
  }
  function buildTimingStats(){
    var data = readStore();
    var rows = Array.isArray(data.samples) ? data.samples.filter(function(item){
      return item && isFinite(item.ms) && item.ms > 0;
    }) : [];
    var byMode = { train:[], rush:[], diag:[] };
    rows.forEach(function(item){
      var key = item.mode === 'rush' ? 'rush' : item.mode === 'diag' ? 'diag' : 'train';
      byMode[key].push(item);
    });
    var train = byMode.train.slice(-TRAINING_SAMPLE_LIMIT);
    var msList = train.map(function(item){ return toNumber(item.ms); }).filter(function(item){ return item > 0; });
    if (!msList.length) {
      return {
        total: 0,
        counts: { train:byMode.train.length, rush:byMode.rush.length, diag:byMode.diag.length }
      };
    }

    var slowMap = {};
    train.forEach(function(item){
      var tag = asText(item.tag) || 'Без темы';
      if (!slowMap[tag]) slowMap[tag] = { tag:tag, count:0, total:0 };
      slowMap[tag].count += 1;
      slowMap[tag].total += toNumber(item.ms);
    });

    var slowTopics = Object.keys(slowMap).map(function(key){
      return {
        tag: key,
        count: slowMap[key].count,
        avgMs: slowMap[key].count ? slowMap[key].total / slowMap[key].count : 0
      };
    }).filter(function(item){ return item.count >= 2; }).sort(function(a, b){ return b.avgMs - a.avgMs; }).slice(0, 3);

    var fastCount = msList.filter(function(item){ return item <= 10000; }).length;
    var correctCount = train.filter(function(item){ return !!item.correct; }).length;
    return {
      total: train.length,
      counts: { train:byMode.train.length, rush:byMode.rush.length, diag:byMode.diag.length },
      avgMs: average(msList),
      medianMs: median(msList),
      recentMs: average(msList.slice(-10)),
      fastPct: train.length ? Math.round(fastCount / train.length * 100) : 0,
      correctPct: train.length ? Math.round(correctCount / train.length * 100) : 0,
      slowTopics: slowTopics
    };
  }
  function appendTimingProgress(){
    injectStyles();
    var host = document.getElementById('prog-content');
    if (!host) return;
    var old = host.querySelector('[data-wave87x-timing-card]');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var stats = buildTimingStats();
    if (!stats.total) return;

    var card = document.createElement('div');
    card.className = 'rcard';
    card.setAttribute('data-wave87x-timing-card', '1');

    var title = document.createElement('h3');
    title.textContent = '⏱ Скорость ответа';
    card.appendChild(title);

    var lead = document.createElement('div');
    lead.className = 'wave87x-input-note';
    lead.textContent = 'Считаются последние ' + stats.total + ' ответов в обычном тренажёре. Лог по скорости хранится отдельно для каждого класса.';
    card.appendChild(lead);

    var grid = document.createElement('div');
    grid.className = 'wave87x-progress-grid';
    [
      { value:formatSeconds(stats.avgMs), label:'среднее время' },
      { value:formatSeconds(stats.medianMs), label:'медиана' },
      { value:formatSeconds(stats.recentMs), label:'последние 10 ответов' },
      { value:String(stats.counts.train), label:'записей в журнале' }
    ].forEach(function(item){
      var cell = document.createElement('div');
      cell.className = 'wave87x-progress-stat';
      var value = document.createElement('span');
      value.className = 'v';
      value.textContent = item.value;
      var label = document.createElement('span');
      label.className = 'l';
      label.textContent = item.label;
      cell.appendChild(value);
      cell.appendChild(label);
      grid.appendChild(cell);
    });
    card.appendChild(grid);

    var chips = document.createElement('div');
    chips.className = 'wave87x-chiprow';
    [
      '≤10 с: ' + stats.fastPct + '%',
      'точность: ' + stats.correctPct + '%',
      '⚡ молния: ' + stats.counts.rush,
      '📝 диагностика: ' + stats.counts.diag
    ].forEach(function(text){
      var chip = document.createElement('span');
      chip.className = 'wave87x-chip';
      chip.textContent = text;
      chips.appendChild(chip);
    });
    card.appendChild(chips);

    if (stats.slowTopics && stats.slowTopics.length) {
      var slowTitle = document.createElement('div');
      slowTitle.className = 'wave87x-input-inline';
      slowTitle.style.marginTop = '12px';
      slowTitle.innerHTML = '<b>Где ответы идут медленнее всего:</b>';
      card.appendChild(slowTitle);

      var list = document.createElement('ol');
      list.className = 'wave87x-topic-list';
      stats.slowTopics.forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item.tag + ' — в среднем ' + formatSeconds(item.avgMs) + ' (' + item.count + ' ответ' + (item.count === 1 ? '' : item.count >= 2 && item.count <= 4 ? 'а' : 'ов') + ')';
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    var secondChild = host.children && host.children[1] ? host.children[1] : null;
    if (secondChild) host.insertBefore(card, secondChild);
    else host.appendChild(card);
  }
  function bindKeyboardGuard(){
    document.addEventListener('keydown', function(event){
      if (!onPlayScreen()) return;
      var question = currentQuestion();
      var mode = inputModeFor(question);
      if (!mode || hasSelection()) return;
      if (isEditableTarget(event.target)) return;
      var key = asText(event.key);
      if (/^[1-4a-dA-D]$/.test(key)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (key === 'Enter' || key === 'NumpadEnter') {
        var input = currentInputElement();
        if (!input) return;
        event.preventDefault();
        event.stopPropagation();
        submitCurrentInput(question, mode);
      }
    }, true);
  }

  bindKeyboardGuard();

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(idx){
      var question = currentQuestion();
      if (inputModeFor(question) && !allowProgrammaticAns) return null;
      var hadSelection = hasSelection();
      var result = baseAns.apply(this, arguments);
      try {
        if (!hadSelection && question && hasSelection()) captureTiming(question);
      } catch (_err) {}
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try {
        armTiming(currentQuestion());
        renderInputQuestion();
        appendTimingToFeedback();
      } catch (_err) {}
      return result;
    };
  }

  var baseRenderProg = typeof root.renderProg === 'function' ? root.renderProg : null;
  if (baseRenderProg) {
    root.renderProg = function(){
      var result = baseRenderProg.apply(this, arguments);
      try { appendTimingProgress(); } catch (_err) {}
      return result;
    };
  }

  root.__wave87xInputTimingRuntime = {
    version: 'wave87z',
    inputModeFor: inputModeFor,
    matchInput: matchInput,
    readStore: readStore,
    buildTimingStats: buildTimingStats,
    questionFingerprint: questionFingerprint,
    levenshteinDistance: levenshteinDistance,
    normalizeTextAnswer: normalizeTextAnswer,
    matchTextInput: matchTextInput,
    currentQuestion: currentQuestion,
    currentSubjectId: currentSubjectId,
    selectionValue: selectionValue,
    hasSelection: hasSelection,
    pageGrade: pageGrade
  };
})();


/* bundle_grade_runtime_keyboard_wave88c */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave88cKeyboardShortcuts) return;

  var root = window;
  var DIGIT_MAP = { '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, '9':8, '0':9 };
  var NUMPAD_MAP = { 'Numpad1':0, 'Numpad2':1, 'Numpad3':2, 'Numpad4':3, 'Numpad5':4, 'Numpad6':5, 'Numpad7':6, 'Numpad8':7, 'Numpad9':8, 'Numpad0':9 };
  var syncTimer = 0;
  var observer = null;

  function asText(value){
    return String(value == null ? '' : value);
  }
  function isArray(value){
    return Object.prototype.toString.call(value) === '[object Array]';
  }
  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function hasClass(node, className){
    return !!(isElement(node) && node.classList && node.classList.contains(className));
  }
  function isEditableTarget(target){
    if (!target || typeof target !== 'object') return false;
    var tag = asText(target.tagName).toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!target.isContentEditable;
  }
  function isVisible(node){
    if (!isElement(node)) return false;
    if (node.hidden) return false;
    if (node.disabled) return false;
    if (typeof node.getAttribute === 'function') {
      if (node.getAttribute('aria-hidden') === 'true') return false;
    }
    var style = node.style || {};
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  }
  function classListContainsAll(node, names){
    if (!isElement(node) || !node.classList) return false;
    for (var i = 0; i < names.length; i += 1) {
      if (!node.classList.contains(names[i])) return false;
    }
    return true;
  }
  function walk(node, visitor){
    if (!isElement(node)) return;
    visitor(node);
    var children = node.children || [];
    for (var i = 0; i < children.length; i += 1) walk(children[i], visitor);
  }
  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function activeScreenId(){
    var ids = ['s-main', 's-subj', 's-theory', 's-play', 's-result', 's-prog', 's-info'];
    for (var i = 0; i < ids.length; i += 1) {
      var node = getById(ids[i]);
      if (hasClass(node, 'on')) return ids[i];
    }
    return '';
  }
  function findActionButtons(action){
    var all = [];
    walk(document.body || document.documentElement, function(node){
      if (!isVisible(node) || typeof node.getAttribute !== 'function') return;
      if (node.getAttribute('data-wave87r-action') === action) all.push(node);
    });
    return all;
  }
  function findActionButton(action){
    var all = findActionButtons(action);
    return all.length ? all[0] : null;
  }
  function clickNode(node){
    if (!isVisible(node) || typeof node.click !== 'function') return false;
    node.click();
    return true;
  }
  function visibleChildrenWithClass(containerId, className){
    var host = getById(containerId);
    if (!host) return [];
    var out = [];
    walk(host, function(node){
      if (node === host) return;
      if (hasClass(node, className) && isVisible(node)) out.push(node);
    });
    return out;
  }
  function firstPrimaryButton(containerId){
    var host = getById(containerId);
    if (!host) return null;
    var match = null;
    walk(host, function(node){
      if (match || node === host) return;
      if (classListContainsAll(node, ['btn', 'btn-p']) && isVisible(node)) match = node;
    });
    return match;
  }
  function hasOpenDialog(){
    var found = false;
    walk(document.body || document.documentElement, function(node){
      if (found || !isVisible(node) || typeof node.getAttribute !== 'function') return;
      if (node.getAttribute('role') === 'dialog' && node.getAttribute('aria-modal') === 'true') found = true;
    });
    return found;
  }
  function mergeShortcuts(node, value){
    if (!isElement(node) || !value) return;
    var current = asText(node.getAttribute && node.getAttribute('aria-keyshortcuts'));
    var parts = {};
    current.split(/\s+/).forEach(function(item){
      item = asText(item).trim();
      if (item) parts[item] = true;
    });
    asText(value).split(/\s+/).forEach(function(item){
      item = asText(item).trim();
      if (item) parts[item] = true;
    });
    var out = Object.keys(parts).join(' ');
    if (out && typeof node.setAttribute === 'function') node.setAttribute('aria-keyshortcuts', out);
  }
  function syncDigitShortcuts(containerId, className){
    var keys = ['1','2','3','4','5','6','7','8','9','0'];
    var nodes = visibleChildrenWithClass(containerId, className);
    for (var i = 0; i < nodes.length && i < keys.length; i += 1) {
      mergeShortcuts(nodes[i], keys[i]);
    }
  }
  function syncActionShortcuts(){
    findActionButtons('start-normal-quiz').forEach(function(node){ mergeShortcuts(node, 'Enter'); });
    findActionButtons('back-after-result').forEach(function(node){ mergeShortcuts(node, 'Escape Enter'); });
    findActionButtons('end-session').forEach(function(node){ mergeShortcuts(node, 'Escape'); });
    findActionButtons('go-main').forEach(function(node){ mergeShortcuts(node, 'Escape'); });
    findActionButtons('go-subj').forEach(function(node){ mergeShortcuts(node, 'Escape'); });
  }
  function syncShortcuts(){
    syncDigitShortcuts('sg', 'scard');
    syncDigitShortcuts('tl', 'tbtn');
    syncActionShortcuts();
  }
  function scheduleSync(){
    if (syncTimer) root.clearTimeout(syncTimer);
    syncTimer = root.setTimeout(function(){
      syncTimer = 0;
      syncShortcuts();
    }, 60);
  }
  function digitIndexForKey(key){
    if (Object.prototype.hasOwnProperty.call(DIGIT_MAP, key)) return DIGIT_MAP[key];
    if (Object.prototype.hasOwnProperty.call(NUMPAD_MAP, key)) return NUMPAD_MAP[key];
    return -1;
  }
  function currentQuestion(){
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function isFreeInputActive(){
    return !!getById('wave87x-free-answer');
  }
  function isMultiSelectQuestion(question){
    return !!(question && question.interactionType === 'multi-select');
  }
  function hasResolvedSelection(){
    return hasSelection() && typeof root.sel !== 'undefined';
  }
  function handleDigitKey(key){
    var idx = digitIndexForKey(key);
    if (idx < 0) return false;
    var screen = activeScreenId();
    var items;
    if (screen === 's-main') {
      items = visibleChildrenWithClass('sg', 'scard');
      return !!(items[idx] && clickNode(items[idx]));
    }
    if (screen === 's-subj') {
      items = visibleChildrenWithClass('tl', 'tbtn');
      return !!(items[idx] && clickNode(items[idx]));
    }
    return false;
  }
  function handleEnterKey(){
    var screen = activeScreenId();
    if (screen === 's-theory') {
      return clickNode(findActionButton('start-normal-quiz'));
    }
    if (screen === 's-result') {
      return clickNode(findActionButton('back-after-result'));
    }
    if (screen !== 's-play') return false;
    if (hasResolvedSelection()) {
      return clickNode(firstPrimaryButton('fba'));
    }
    var question = currentQuestion();
    if (isFreeInputActive() || isMultiSelectQuestion(question)) return false;
    return clickNode(firstPrimaryButton('opts'));
  }
  function handleEscapeKey(){
    var screen = activeScreenId();
    if (screen === 's-subj') return clickNode(findActionButton('go-main'));
    if (screen === 's-theory') return clickNode(findActionButton('go-subj'));
    if (screen === 's-play') return clickNode(findActionButton('end-session'));
    if (screen === 's-result') return clickNode(findActionButton('back-after-result'));
    if (screen === 's-prog' || screen === 's-info') return clickNode(findActionButton('go-main'));
    return false;
  }
  function onKeydown(event){
    var key = asText(event && event.key);
    if (!key) return;
    if (hasOpenDialog()) return;
    if (isEditableTarget(event.target)) return;
    var acted = false;
    var isDigit = digitIndexForKey(key) >= 0;
    if (isDigit) acted = handleDigitKey(key);
    else if (key === 'Enter' || key === 'NumpadEnter') acted = handleEnterKey();
    else if (key === 'Escape') acted = handleEscapeKey();
    if (!acted) return;
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
  }
  function bind(){
    if (document.addEventListener) document.addEventListener('keydown', onKeydown, true);
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleSync);
      try {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style', 'aria-hidden', 'hidden']
        });
      } catch (_err) {}
    }
    scheduleSync();
  }

  bind();

  root.__wave88cKeyboardShortcuts = {
    version: 'wave88c',
    active: true,
    sync: scheduleSync,
    activeScreenId: activeScreenId,
    digitIndexForKey: digitIndexForKey,
    handleDigitKey: handleDigitKey,
    handleEnterKey: handleEnterKey,
    handleEscapeKey: handleEscapeKey,
    hasOpenDialog: hasOpenDialog
  };
})();


/* bundle_grade_runtime_breadcrumbs_wave88d */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave88dBreadcrumbs) return;

  var root = window;
  var SCREEN_IDS = ['s-main', 's-subj', 's-theory', 's-play', 's-result', 's-prog', 's-info'];
  var renderTimer = 0;
  var observer = null;

  function asText(value){
    return String(value == null ? '' : value);
  }
  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function hasClass(node, className){
    return !!(isElement(node) && node.classList && node.classList.contains(className));
  }
  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function walk(node, visitor){
    if (!isElement(node)) return;
    visitor(node);
    var children = node.children || [];
    for (var i = 0; i < children.length; i += 1) walk(children[i], visitor);
  }
  function firstChildWithClass(node, className){
    if (!isElement(node)) return null;
    var children = node.children || [];
    for (var i = 0; i < children.length; i += 1) {
      if (hasClass(children[i], className)) return children[i];
    }
    return null;
  }
  function clearChildren(node){
    if (!isElement(node)) return;
    while (node.firstChild && typeof node.removeChild === 'function') node.removeChild(node.firstChild);
    if (node.children && !node.firstChild && node.children.length && !node.removeChild) node.children = [];
  }
  function activeScreenId(){
    for (var i = 0; i < SCREEN_IDS.length; i += 1) {
      var node = getById(SCREEN_IDS[i]);
      if (hasClass(node, 'on')) return SCREEN_IDS[i];
    }
    return '';
  }
  function currentSubject(){
    try { if (typeof cS !== 'undefined' && cS) return cS; } catch (_err) {}
    return root.cS && typeof root.cS === 'object' ? root.cS : null;
  }
  function currentTopic(){
    try { if (typeof cT !== 'undefined' && cT) return cT; } catch (_err) {}
    return root.cT && typeof root.cT === 'object' ? root.cT : null;
  }
  function globalFlag(name){
    try {
      if (typeof globalThis !== 'undefined' && Object.prototype.hasOwnProperty.call(globalThis, name)) return globalThis[name];
    } catch (_err) {}
    return root[name];
  }
  function isRushMode(){ return !!globalFlag('rushMode'); }
  function isDiagMode(){ return !!globalFlag('diagMode'); }
  function isGlobalMixMode(){ return !!globalFlag('globalMix'); }
  function isMixMode(){ return !!globalFlag('mix'); }
  function hasMixFilter(){
    var value = globalFlag('mixFilter');
    return !!(value && typeof value.length === 'number' && value.length > 0);
  }
  function gradeLabel(){
    var raw = asText(root.GRADE_TITLE);
    raw = raw.replace(/^[^0-9А-Яа-яA-Za-z]+/, '').trim();
    if (!raw) raw = asText(root.GRADE_NUM).trim();
    if (!raw) return 'Класс';
    if (!/класс/i.test(raw)) raw += ' класс';
    return raw;
  }
  function sessionItems(screenId){
    var subject = currentSubject();
    var topic = currentTopic();
    var items = [];
    if (isRushMode()) {
      items.push({ label:'Молния', current:true });
      return items;
    }
    if (isDiagMode()) {
      if (subject) items.push({ label:asText(subject.nm || subject.name || 'Предмет'), route:'subj' });
      items.push({ label:'Диагностика', current:true });
      return items;
    }
    if (isGlobalMixMode()) {
      items.push({ label:hasMixFilter() ? 'Сборная' : 'Всё вперемешку', current:true });
      return items;
    }
    if (isMixMode() && subject && !topic) {
      items.push({ label:asText(subject.nm || subject.name || 'Предмет'), route:'subj' });
      items.push({ label:'Всё вперемешку', current:true });
      return items;
    }
    if (subject && topic) {
      items.push({ label:asText(subject.nm || subject.name || 'Предмет'), route:'subj' });
      items.push({ label:asText(topic.nm || topic.name || 'Тема'), current:true });
      return items;
    }
    if (subject) {
      items.push({ label:asText(subject.nm || subject.name || 'Предмет'), current:true });
      return items;
    }
    items.push({ label:screenId === 's-result' ? 'Результат' : 'Тренажёр', current:true });
    return items;
  }
  function buildItems(screenId){
    var items = [{ label:'Главная', route:'home' }];
    var grade = gradeLabel();
    if (screenId === 's-main') {
      items.push({ label:grade, current:true });
      return items;
    }
    items.push({ label:grade, route:'main' });
    if (screenId === 's-subj') {
      var subject = currentSubject();
      if (subject) items.push({ label:asText(subject.nm || subject.name || 'Предмет'), current:true });
      return items;
    }
    if (screenId === 's-theory') {
      var subj = currentSubject();
      var topic = currentTopic();
      if (subj) items.push({ label:asText(subj.nm || subj.name || 'Предмет'), route:'subj' });
      if (topic) items.push({ label:asText(topic.nm || topic.name || 'Тема'), current:true });
      return items;
    }
    if (screenId === 's-play' || screenId === 's-result') {
      return items.concat(sessionItems(screenId));
    }
    if (screenId === 's-prog') {
      items.push({ label:'Прогресс', current:true });
      return items;
    }
    if (screenId === 's-info') {
      items.push({ label:'Справка', current:true });
      return items;
    }
    return items;
  }
  function compactTrail(items){
    if (!items || !items.length) return false;
    if (items.length > 3) return true;
    for (var i = 0; i < items.length; i += 1) {
      if (asText(items[i].label).length > 18) return true;
    }
    return false;
  }
  function screenHost(screenId){
    var screen = getById(screenId);
    if (!screen) return null;
    return firstChildWithClass(screen, 'w') || screen;
  }
  function ensureNav(screenId){
    var host = screenHost(screenId);
    if (!host) return null;
    if (isElement(host.__wave88dBreadcrumbNav)) return host.__wave88dBreadcrumbNav;
    var nav = document.createElement('nav');
    nav.className = 'wave88d-breadcrumbs';
    nav.setAttribute('aria-label', 'Навигация');
    nav.setAttribute('data-wave88d-screen', screenId);
    var list = document.createElement('ol');
    list.className = 'wave88d-breadcrumb-list';
    nav.appendChild(list);
    nav.__wave88dList = list;
    if (typeof host.insertBefore === 'function') host.insertBefore(nav, host.firstChild || null);
    else if (typeof host.appendChild === 'function') host.appendChild(nav);
    host.__wave88dBreadcrumbNav = nav;
    return nav;
  }
  function makeCrumbNode(item){
    var node;
    if (item.current) {
      node = document.createElement('span');
      node.className = 'wave88d-crumb wave88d-crumb-current';
      node.setAttribute('aria-current', 'page');
    } else if (item.route === 'home') {
      node = document.createElement('a');
      node.className = 'wave88d-crumb wave88d-crumb-link';
      node.setAttribute('href', 'index.html?choose');
      node.setAttribute('data-wave88d-route', 'home');
    } else {
      node = document.createElement('button');
      node.className = 'wave88d-crumb wave88d-crumb-link';
      node.setAttribute('type', 'button');
      node.setAttribute('data-wave88d-route', asText(item.route));
    }
    node.textContent = asText(item.label);
    return node;
  }
  function renderScreen(screenId){
    var nav = ensureNav(screenId);
    if (!nav) return;
    var list = nav.__wave88dList || firstChildWithClass(nav, 'wave88d-breadcrumb-list');
    if (!list) {
      list = document.createElement('ol');
      list.className = 'wave88d-breadcrumb-list';
      nav.appendChild(list);
      nav.__wave88dList = list;
    }
    var items = buildItems(screenId);
    nav.hidden = !items.length;
    nav.setAttribute('data-compact', compactTrail(items) ? '1' : '0');
    clearChildren(list);
    for (var i = 0; i < items.length; i += 1) {
      var li = document.createElement('li');
      li.className = 'wave88d-breadcrumb-item';
      li.appendChild(makeCrumbNode(items[i]));
      list.appendChild(li);
    }
  }
  function renderAll(){
    for (var i = 0; i < SCREEN_IDS.length; i += 1) renderScreen(SCREEN_IDS[i]);
  }
  function scheduleRender(){
    if (renderTimer && typeof root.clearTimeout === 'function') root.clearTimeout(renderTimer);
    renderTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      renderTimer = 0;
      renderAll();
    }, 40);
  }
  function routeNodeFromTarget(target){
    for (var node = target; node && node !== document; node = node.parentNode) {
      if (!isElement(node) || typeof node.getAttribute !== 'function') continue;
      var route = node.getAttribute('data-wave88d-route');
      if (route) return node;
    }
    return null;
  }
  function maybeLeavePlay(){
    if (activeScreenId() !== 's-play') return true;
    var ok = typeof root.confirm === 'function'
      ? root.confirm('Выйти из текущей сессии? Результат будет сохранён.')
      : true;
    if (!ok) return false;
    if (typeof root.endSession === 'function') root.endSession();
    return true;
  }
  function navigate(route){
    route = asText(route).trim();
    if (!route) return false;
    if (!maybeLeavePlay()) return false;
    if (route === 'home') {
      if (root.location && typeof root.location.assign === 'function') root.location.assign('index.html?choose');
      else if (root.location) root.location.href = 'index.html?choose';
      return true;
    }
    if (route === 'main') {
      if (typeof root.go === 'function') root.go('main');
      else return false;
      scheduleRender();
      return true;
    }
    if (route === 'subj') {
      var subject = currentSubject();
      if (subject && typeof root.openSubj === 'function') root.openSubj(subject.id);
      else if (typeof root.goSubj === 'function') root.goSubj();
      else return false;
      scheduleRender();
      return true;
    }
    return false;
  }
  function onClick(event){
    var node = routeNodeFromTarget(event && event.target);
    if (!node) return;
    if (event && event.preventDefault) event.preventDefault();
    if (event && event.stopPropagation) event.stopPropagation();
    navigate(node.getAttribute('data-wave88d-route') || '');
  }
  function wrap(name){
    var fn = root[name];
    if (typeof fn !== 'function' || fn.__wave88dWrapped) return;
    var wrapped = function(){
      var result = fn.apply(this, arguments);
      scheduleRender();
      return result;
    };
    wrapped.__wave88dWrapped = true;
    root[name] = wrapped;
  }
  function bind(){
    if (document.addEventListener) document.addEventListener('click', onClick, true);
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleRender);
      try {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'hidden', 'aria-hidden']
        });
      } catch (_err) {}
    }
    ['go', 'openSubj', 'goSubj', 'startQuiz', 'startDiag', 'startGlobalMix', 'startRush', 'endSession', 'wave21OpenTopic'].forEach(wrap);
    scheduleRender();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave88dBreadcrumbs = {
    version: 'wave88d',
    active: true,
    buildItems: buildItems,
    renderAll: renderAll,
    scheduleRender: scheduleRender,
    navigate: navigate,
    activeScreenId: activeScreenId,
    gradeLabel: gradeLabel
  };
})();


(function(){
  'use strict';
  if (typeof window === 'undefined') return;
  window.__wave89bMergedRuntime = {
    version: 'wave89b',
    components: ['wave87w','wave87x','wave88c','wave88d','wave89d','wave89e','wave89f','wave89g','wave89h','wave89k','wave89m','wave89n']
  };
})();


/* wave89d: simple mode / simplified UX gate */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89dSimpleMode) return;

  var root = window;
  var STORAGE_KEY = 'trainer_simple_mode_v1';
  var OVERLAY_ID = 'wave89d-settings-modal';
  var HIDE_ATTR = 'data-wave89d-hide-simple';
  var CLASS_NAME = 'simple-mode';
  var bindQueueTimer = 0;
  var syncTimer = 0;
  var observer = null;
  var originalAbout = typeof root.showAbout === 'function' ? root.showAbout : null;
  var state = { enabled: true };

  function safeReadMode(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      raw = String(raw == null ? '' : raw).trim().toLowerCase();
      return raw !== 'off';
    } catch (_err) {
      return true;
    }
  }
  function safeWriteMode(enabled){
    try { localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off'); } catch (_err) {}
  }
  function isEnabled(){
    return state.enabled;
  }
  function emitChange(){
    try {
      document.dispatchEvent(new CustomEvent('trainer:simplemodechange', { detail:{ enabled: state.enabled } }));
    } catch (_err) {}
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
  }
  function addClass(node, enabled){
    if (!node || !node.classList) return;
    node.classList[enabled ? 'add' : 'remove'](CLASS_NAME);
  }
  function applyModeClasses(){
    state.enabled = safeReadMode();
    addClass(document.documentElement, state.enabled);
    addClass(document.body, state.enabled);
    return state.enabled;
  }
  function clearSavedMixFilter(){
    try {
      mixFilter = null;
      if (typeof saveMixFilter === 'function') saveMixFilter();
    } catch (_err) {
      try {
        localStorage.removeItem('trainer_mix_filter_' + String(root.GRADE_NUM || root.GRADE_NO || '10'));
      } catch (_err2) {}
    }
  }
  function gradeKey(){
    return String(root.GRADE_NUM || root.GRADE_NO || '10');
  }
  function safeJSON(raw, fallback){
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }
  function readStore(key, fallback){
    try {
      return safeJSON(localStorage.getItem(key), fallback);
    } catch (_err) {
      return fallback;
    }
  }
  function reviewCounts(){
    var api = root.wave28Debug;
    var counts = { due:0, sticky:0, total:0 };
    try { counts.due = api && typeof api.dueCount === 'function' ? Number(api.dueCount()) || 0 : 0; } catch (_err) {}
    try { counts.sticky = api && typeof api.stickyCount === 'function' ? Number(api.stickyCount()) || 0 : 0; } catch (_err) {}
    try { counts.total = api && typeof api.totalCount === 'function' ? Number(api.totalCount()) || 0 : 0; } catch (_err) {}
    return counts;
  }
  function journalCount(){
    var rows = readStore('trainer_journal_' + gradeKey(), []);
    return Array.isArray(rows) ? rows.length : 0;
  }
  function savedSnapshot(){
    var snap = readStore('trainer_session_snapshot_' + gradeKey(), null);
    return snap && typeof snap === 'object' ? snap : null;
  }
  function savedLastTopic(){
    var last = readStore('trainer_last_topic_' + gradeKey(), null);
    return last && typeof last === 'object' ? last : null;
  }
  function totalSolvedOk(){
    var streak = readStore('trainer_streak_' + gradeKey(), {});
    return Number(streak && streak.totalOk) || 0;
  }
  function topicAttempts(progress, subjectId, topicId){
    var subj = progress && progress[subjectId];
    var row = subj && subj[topicId];
    return row ? (Number(row.ok) || 0) + (Number(row.err) || 0) : 0;
  }
  function unlockedSubject(subject){
    if (!subject || !subject.locked) return true;
    return totalSolvedOk() >= (Number(subject.unlockAt) || 0);
  }
  function findNewTopic(preferredSubjectId){
    var progress = readStore('trainer_progress_' + gradeKey(), {});
    var subjects = Array.isArray(root.SUBJ) ? root.SUBJ.slice() : [];
    if (!subjects.length) return null;
    if (preferredSubjectId) {
      subjects.sort(function(a, b){
        if (a && a.id === preferredSubjectId) return -1;
        if (b && b.id === preferredSubjectId) return 1;
        return 0;
      });
    }
    for (var i = 0; i < subjects.length; i += 1) {
      var subj = subjects[i];
      if (!unlockedSubject(subj)) continue;
      var topics = Array.isArray(subj && subj.tops) ? subj.tops : [];
      for (var j = 0; j < topics.length; j += 1) {
        var topic = topics[j];
        if (!topic) continue;
        if (topicAttempts(progress, subj.id, topic.id) === 0) return { subj:subj, topic:topic };
      }
    }
    return null;
  }
  function startFallbackMix(){
    if (typeof root.startGlobalMix === 'function') {
      root.startGlobalMix();
      return true;
    }
    if (typeof root.showMixFilter === 'function' && root.showMixFilter.__wave89dOriginal) {
      root.showMixFilter.__wave89dOriginal();
      return true;
    }
    if (typeof root.showMixFilter === 'function') {
      root.showMixFilter();
      return true;
    }
    return false;
  }
  function resolvePracticePlan(){
    var review = reviewCounts();
    if (review.due > 0 && typeof root.startDueReview === 'function') {
      return { kind:'due-review', message:'🔁 Сначала повторим ошибки за сегодня.' };
    }
    if (review.sticky > 0 && typeof root.startStickyReview === 'function') {
      return { kind:'sticky-review', message:'📌 Сначала повторим сложные ошибки.' };
    }
    if ((review.total > 0 || journalCount() > 0) && typeof root.startWeakTrainingByTopics === 'function') {
      return { kind:'weak-topics', message:'🎯 Начинаю со слабых тем.' };
    }
    var snap = savedSnapshot();
    if (snap && snap.prob && typeof root.wave21ResumeSession === 'function') {
      return { kind:'resume-session', message:'⏯ Продолжаю незавершённую сессию.' };
    }
    var last = savedLastTopic();
    if (last && last.subjId && last.topicId && typeof root.wave21ContinueLastTopic === 'function') {
      return { kind:'continue-last', message:'📚 Продолжаю последнюю тему.' };
    }
    var fresh = findNewTopic(last && last.subjId);
    if (fresh && typeof root.wave21OpenTopic === 'function') {
      return {
        kind: 'new-topic',
        subjectId: fresh.subj.id,
        topicId: fresh.topic.id,
        label: String(fresh.subj.nm || fresh.subj.id) + ' → ' + String(fresh.topic.nm || fresh.topic.id),
        message: '🆕 Новая тема: ' + String(fresh.subj.nm || fresh.subj.id) + ' → ' + String(fresh.topic.nm || fresh.topic.id) + '.'
      };
    }
    return { kind:'global-mix', message:'⚡ Запускаю обычную тренировку.' };
  }
  function runPracticePlan(plan){
    if (!plan || typeof plan !== 'object') return startFallbackMix();
    if (plan.message) toast(plan.message);
    if (plan.kind === 'due-review' && typeof root.startDueReview === 'function') {
      root.startDueReview();
      return true;
    }
    if (plan.kind === 'sticky-review' && typeof root.startStickyReview === 'function') {
      root.startStickyReview();
      return true;
    }
    if (plan.kind === 'weak-topics' && typeof root.startWeakTrainingByTopics === 'function') {
      root.startWeakTrainingByTopics();
      return true;
    }
    if (plan.kind === 'resume-session' && typeof root.wave21ResumeSession === 'function') {
      root.wave21ResumeSession();
      return true;
    }
    if (plan.kind === 'continue-last' && typeof root.wave21ContinueLastTopic === 'function') {
      root.wave21ContinueLastTopic();
      return true;
    }
    if (plan.kind === 'new-topic' && typeof root.wave21OpenTopic === 'function') {
      return !!root.wave21OpenTopic(plan.subjectId, plan.topicId, 'train');
    }
    return startFallbackMix();
  }
  function blockAdvanced(kind){
    var message = 'Эта функция скрыта в простом режиме.';
    if (kind === 'rush') message = '⚡ Молния скрыта в простом режиме.';
    else if (kind === 'rating') message = '🏆 Рейтинг скрыт в простом режиме.';
    else if (kind === 'exam') message = '📝 Экзамен и weekly challenge скрыты в простом режиме.';
    else if (kind === 'sync') message = '☁️ Синхронизация скрыта в простом режиме.';
    toast(message);
    return false;
  }
  function directPractice(){
    clearSavedMixFilter();
    state.lastPlan = resolvePracticePlan();
    return runPracticePlan(state.lastPlan);
  }
  function patchFunction(name, resolver){
    var fn = root[name];
    if (typeof fn !== 'function' || fn.__wave89dPatched) return false;
    var wrapped = function(){
      return resolver.call(this, fn, arguments);
    };
    wrapped.__wave89dPatched = true;
    wrapped.__wave89dOriginal = fn;
    root[name] = wrapped;
    return true;
  }
  function patchWaveObjects(){
    var examApi = root.wave86pChallenge;
    if (examApi && !examApi.__wave89dPatched) {
      ['startWeeklyChallenge', 'startExamPicker', 'showLeaderboards'].forEach(function(name){
        var fn = examApi[name];
        if (typeof fn !== 'function' || fn.__wave89dPatched) return;
        examApi[name] = function(){
          if (isEnabled()) return blockAdvanced(name === 'showLeaderboards' ? 'rating' : 'exam');
          return fn.apply(this, arguments);
        };
        examApi[name].__wave89dPatched = true;
      });
      examApi.__wave89dPatched = true;
    }
    var cloudApi = root.wave86wCloudSync;
    if (cloudApi && typeof cloudApi.open === 'function' && !cloudApi.open.__wave89dPatched) {
      var openSync = cloudApi.open;
      cloudApi.open = function(){
        if (isEnabled()) return blockAdvanced('sync');
        return openSync.apply(this, arguments);
      };
      cloudApi.open.__wave89dPatched = true;
    }
  }
  function ensureGlobalsPatched(){
    if (typeof root.showAbout === 'function' && !root.showAbout.__wave89dSettingsEntry) {
      if (!originalAbout || originalAbout.__wave89dSettingsEntry) originalAbout = root.showAbout;
      var wrappedAbout = function(){ return openSettings(); };
      wrappedAbout.__wave89dPatched = true;
      wrappedAbout.__wave89dSettingsEntry = true;
      wrappedAbout.__wave89dOriginal = originalAbout;
      root.showAbout = wrappedAbout;
    }
    patchFunction('showMixFilter', function(original){
      if (!isEnabled()) return original.apply(this, Array.prototype.slice.call(arguments[1] || []));
      return directPractice();
    });
    patchFunction('startRush', function(original, args){
      if (isEnabled()) return blockAdvanced('rush');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchFunction('showRushRecords', function(original, args){
      if (isEnabled()) return blockAdvanced('rating');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchFunction('showLeaderboard', function(original, args){
      if (isEnabled()) return blockAdvanced('rating');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchFunction('renderCloudModal', function(original, args){
      if (isEnabled()) return blockAdvanced('sync');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchWaveObjects();
  }
  function onOverlayKeydown(event){
    if (!event || event.key !== 'Escape') return;
    closeSettings();
  }
  function closeSettings(){
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (root.removeEventListener) root.removeEventListener('keydown', onOverlayKeydown, true);
  }
  function settingsButton(label, kind){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wave89d-settings-btn' + (kind === 'accent' ? ' accent' : '');
    btn.textContent = label;
    return btn;
  }
  function updateOverlay(){
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    var enabled = isEnabled();
    var pill = overlay.querySelector('[data-wave89d-pill]');
    var note = overlay.querySelector('[data-wave89d-note]');
    var action = overlay.querySelector('[data-wave89d-toggle]');
    if (pill) {
      pill.textContent = enabled ? 'ВКЛ' : 'ВЫКЛ';
      pill.classList.toggle('off', !enabled);
    }
    if (note) {
      note.textContent = enabled
        ? 'Скрыты: PvP, weekly/exam, синхронизация, рейтинги и фильтр «Сборная». Остаётся обычный тренажёр.'
        : 'Продвинутые режимы и синхронизация снова видны. Подходит, если нужны PvP, weekly/exam и рейтинги.';
    }
    if (action) action.textContent = enabled ? 'Выключить простой режим' : 'Включить простой режим';
  }
  function openLegacyAbout(){
    if (typeof originalAbout !== 'function') return;
    closeSettings();
    setTimeout(function(){
      try { originalAbout(); } catch (_err) {}
    }, 20);
  }
  function goInfoFromSettings(){
    closeSettings();
    setTimeout(function(){
      try {
        if (typeof root.go === 'function') root.go('info');
      } catch (_err) {}
      scheduleSync();
    }, 20);
  }
  function openTourFromSettings(){
    closeSettings();
    setTimeout(function(){
      try {
        if (root.__wave89eOnboarding && typeof root.__wave89eOnboarding.start === 'function') root.__wave89eOnboarding.start({ manual:true, source:'settings' });
        else if (typeof root.toast === 'function') root.toast('Тур пока не готов.');
      } catch (_err) {}
      scheduleSync();
    }, 20);
  }
  function buildSettingsOverlay(){
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89d-settings-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wave89d-settings-title');
    overlay.addEventListener('click', function(event){
      if (event.target === overlay) closeSettings();
    });

    var card = document.createElement('div');
    card.className = 'wave89d-settings-card';

    var header = document.createElement('div');
    header.className = 'wave89d-settings-head';
    var title = document.createElement('h3');
    title.id = 'wave89d-settings-title';
    title.className = 'wave89d-settings-title';
    title.textContent = '⚙️ Настройки';
    var subtitle = document.createElement('p');
    subtitle.className = 'wave89d-settings-sub';
    subtitle.textContent = 'Можно оставить только обычный тренажёр без продвинутых сценариев.';
    header.appendChild(title);
    header.appendChild(subtitle);

    var section = document.createElement('div');
    section.className = 'wave89d-settings-section';
    var row = document.createElement('div');
    row.className = 'wave89d-settings-row';
    var copy = document.createElement('div');
    copy.className = 'wave89d-settings-copy';
    var strong = document.createElement('strong');
    strong.textContent = 'Простой режим';
    var desc = document.createElement('p');
    desc.setAttribute('data-wave89d-note', '');
    copy.appendChild(strong);
    copy.appendChild(desc);
    var pill = document.createElement('span');
    pill.className = 'wave89d-settings-pill';
    pill.setAttribute('data-wave89d-pill', '');
    row.appendChild(copy);
    row.appendChild(pill);
    section.appendChild(row);

    var actions = document.createElement('div');
    actions.className = 'wave89d-settings-actions';
    var toggle = settingsButton('', 'accent');
    toggle.setAttribute('data-wave89d-toggle', '');
    toggle.addEventListener('click', function(){
      setEnabled(!isEnabled());
      updateOverlay();
    });
    var infoBtn = settingsButton('📖 Справка');
    infoBtn.addEventListener('click', goInfoFromSettings);
    var tourBtn = settingsButton('👋 Быстрый тур');
    tourBtn.addEventListener('click', openTourFromSettings);
    var aboutBtn = settingsButton('ℹ️ О проекте');
    aboutBtn.addEventListener('click', openLegacyAbout);
    var closeBtn = settingsButton('Закрыть');
    closeBtn.addEventListener('click', closeSettings);
    actions.appendChild(toggle);
    actions.appendChild(infoBtn);
    actions.appendChild(tourBtn);
    actions.appendChild(aboutBtn);
    actions.appendChild(closeBtn);

    card.appendChild(header);
    card.appendChild(section);
    card.appendChild(actions);
    overlay.appendChild(card);
    return overlay;
  }
  function openSettings(){
    closeSettings();
    var overlay = buildSettingsOverlay();
    document.body.appendChild(overlay);
    if (root.addEventListener) root.addEventListener('keydown', onOverlayKeydown, true);
    updateOverlay();
    return overlay;
  }
  function relabelAboutButtons(){
    Array.prototype.slice.call(document.querySelectorAll('[data-wave87r-action="show-about"]')).forEach(function(btn){
      if (!btn) return;
      btn.textContent = '⚙️ Настройки';
      btn.setAttribute('aria-label', 'Настройки');
      btn.setAttribute('title', 'Настройки');
      btn.setAttribute('data-wave89d-settings-entry', '1');
    });
  }
  function bindDynamicButton(button, role, extra){
    if (!button || button.__wave89dBoundRole === role) return;
    button.__wave89dBoundRole = role;
    try { button.removeAttribute('onclick'); } catch (_err) {}
    button.addEventListener('click', function(event){
      if (!button.isConnected) return;
      if (event && event.preventDefault) event.preventDefault();
      if (event && event.stopImmediatePropagation) event.stopImmediatePropagation();
      if (event && event.stopPropagation) event.stopPropagation();
      if (role === 'practice') {
        if (isEnabled()) directPractice();
        else if (typeof root.showMixFilter === 'function' && root.showMixFilter.__wave89dOriginal) root.showMixFilter.__wave89dOriginal();
        else if (typeof root.showMixFilter === 'function') root.showMixFilter();
        return;
      }
      if (role === 'rush') {
        if (isEnabled()) { blockAdvanced('rush'); return; }
        if (typeof root.startRush === 'function') root.startRush(Number(extra || 3) || 3);
        return;
      }
      if (role === 'rating') {
        if (isEnabled()) { blockAdvanced('rating'); return; }
        if (typeof root.showRushRecords === 'function') {
          if (root.showRushRecords.__wave89dOriginal) root.showRushRecords.__wave89dOriginal();
          else root.showRushRecords();
        }
      }
    }, true);
  }
  function syncDailyMeter(){
    var host = document.getElementById('daily-meter');
    if (!host) return;
    var practiceButton = host.querySelector('button[onclick*="showMixFilter"]');
    if (practiceButton) {
      practiceButton.textContent = isEnabled() ? '▶ Заниматься' : '⚡ Всё вперемешку';
      bindDynamicButton(practiceButton, 'practice', '');
    }
    Array.prototype.slice.call(host.querySelectorAll('button[onclick*="startRush("]')).forEach(function(btn){
      var raw = String(btn.getAttribute('onclick') || '');
      var match = raw.match(/startRush\((\d+)\)/);
      bindDynamicButton(btn, 'rush', match ? match[1] : '3');
      if (btn.parentElement) btn.parentElement.setAttribute(HIDE_ATTR, '1');
    });
    Array.prototype.slice.call(host.querySelectorAll('button[onclick*="showRushRecords"]')).forEach(function(btn){
      bindDynamicButton(btn, 'rating', '');
      if (btn.parentElement) btn.parentElement.setAttribute(HIDE_ATTR, '1');
    });
  }
  function updateOpenOverlayCopy(){
    updateOverlay();
  }
  function syncDynamic(){
    applyModeClasses();
    ensureGlobalsPatched();
    relabelAboutButtons();
    syncDailyMeter();
    updateOpenOverlayCopy();
  }
  function scheduleSync(){
    if (syncTimer && typeof root.clearTimeout === 'function') root.clearTimeout(syncTimer);
    syncTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      syncTimer = 0;
      syncDynamic();
    }, 40);
  }
  function scheduleBindQueue(){
    if (bindQueueTimer && typeof root.clearTimeout === 'function') root.clearTimeout(bindQueueTimer);
    bindQueueTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      bindQueueTimer = 0;
      ensureGlobalsPatched();
    }, 120);
  }
  function bind(){
    applyModeClasses();
    ensureGlobalsPatched();
    relabelAboutButtons();
    syncDailyMeter();
    if (document.addEventListener) {
      document.addEventListener('click', function(event){
        var target = event && event.target && event.target.closest ? event.target.closest('[data-wave87r-action="show-about"]') : null;
        if (!target) return;
        scheduleSync();
      }, true);
    }
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(function(){
        scheduleBindQueue();
        scheduleSync();
      });
      try { observer.observe(document.body, { childList:true, subtree:true }); } catch (_err) {}
    }
    scheduleSync();
  }
  function setEnabled(enabled, options){
    state.enabled = !!enabled;
    safeWriteMode(state.enabled);
    applyModeClasses();
    scheduleBindQueue();
    scheduleSync();
    try {
      if (typeof root.renderDailyMeter === 'function') root.renderDailyMeter();
    } catch (_err) {}
    if (!options || !options.silent) {
      toast(state.enabled ? '✅ Простой режим включён' : '✨ Продвинутые режимы снова доступны');
    }
    emitChange();
    return state.enabled;
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89dSimpleMode = {
    version: 'wave89d',
    storageKey: STORAGE_KEY,
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    openSettings: openSettings,
    closeSettings: closeSettings,
    sync: syncDynamic,
    resolvePracticePlan: resolvePracticePlan,
    runPracticePlan: runPracticePlan,
    directPractice: directPractice,
    getLastPlan: function(){ return state.lastPlan || null; },
    blockAdvanced: blockAdvanced,
    selectors: {
      examCard: '#wave86p-challenge-card',
      pvpCard: '#wave86v-pvp-card',
      cloudButtons: ['#wave86w-main-cloud-btn', '#wave86w-profile-cloud-btn', '#wave86w-backup-cloud-section', '#wave86w-remote-banner'],
      hallButtons: ['[data-wave68-action="leaders"]', '[data-wave68-action="sync"]', '#wave68-sync-now']
    }
  };
})();


/* wave89e: onboarding / first-visit tour */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89eOnboarding) return;

  var root = window;
  var STORAGE_KEY = 'trainer_onboarding_wave89e_v1';
  var OVERLAY_ID = 'wave89e-tour-overlay';
  var TARGET_ATTR = 'data-wave89e-tour-target';
  var BODY_CLASS = 'wave89e-tour-open';
  var KEYDOWN_BOUND = false;
  var stepTimer = 0;
  var state = {
    open: false,
    manual: false,
    stepIndex: 0,
    highlighted: null,
    tourTopic: null,
    stepCount: 3,
    completed: false,
    lastReason: ''
  };

  function safeRead(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw == null ? fallback : raw;
    } catch (_err) {
      return fallback;
    }
  }
  function safeReadJson(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }
  function safeWrite(key, value){
    try { localStorage.setItem(key, value); } catch (_err) {}
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
  }
  function gradeKey(){
    return String(root.GRADE_NUM || root.GRADE_NO || '10');
  }
  function totalSolvedOk(){
    var streak = safeReadJson('trainer_streak_' + gradeKey(), {});
    return Number(streak && streak.totalOk) || 0;
  }
  function hasMeaningfulProgress(){
    var progress = safeReadJson('trainer_progress_' + gradeKey(), {});
    if (progress && typeof progress === 'object') {
      var subjectIds = Object.keys(progress);
      for (var i = 0; i < subjectIds.length; i += 1) {
        var subj = progress[subjectIds[i]];
        if (!subj || typeof subj !== 'object') continue;
        var topicIds = Object.keys(subj);
        for (var j = 0; j < topicIds.length; j += 1) {
          var row = subj[topicIds[j]];
          if (!row || typeof row !== 'object') continue;
          if ((Number(row.ok) || 0) + (Number(row.err) || 0) > 0) return true;
        }
      }
    }
    var journal = safeReadJson('trainer_journal_' + gradeKey(), []);
    if (Array.isArray(journal) && journal.length) return true;
    var snap = safeReadJson('trainer_session_snapshot_' + gradeKey(), null);
    if (snap && typeof snap === 'object' && snap.prob) return true;
    var last = safeReadJson('trainer_last_topic_' + gradeKey(), null);
    if (last && typeof last === 'object' && last.subjId && last.topicId) return true;
    return totalSolvedOk() > 0;
  }
  function hasSeenTour(){
    var value = String(safeRead(STORAGE_KEY, '') || '').trim().toLowerCase();
    return value === 'done' || value === 'skipped';
  }
  function markSeen(kind){
    safeWrite(STORAGE_KEY, kind === 'skip' ? 'skipped' : 'done');
  }
  function activeScreenId(){
    var screen = document.querySelector('.scr.on');
    return screen && screen.id ? screen.id : '';
  }
  function clearStepTimer(){
    if (!stepTimer) return;
    try { (root.clearTimeout || clearTimeout)(stepTimer); } catch (_err) {}
    stepTimer = 0;
  }
  function addBodyClass(enabled){
    if (!document.body || !document.body.classList) return;
    document.body.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    if (document.documentElement && document.documentElement.classList) {
      document.documentElement.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    }
  }
  function clearHighlight(){
    if (state.highlighted && state.highlighted.removeAttribute) {
      try { state.highlighted.removeAttribute(TARGET_ATTR); } catch (_err) {}
    }
    state.highlighted = null;
  }
  function highlightTarget(node){
    clearHighlight();
    if (!node) return null;
    try { node.setAttribute(TARGET_ATTR, '1'); } catch (_err) {}
    state.highlighted = node;
    try {
      if (typeof node.scrollIntoView === 'function') node.scrollIntoView({ block:'center', inline:'nearest', behavior:'smooth' });
    } catch (_err2) {}
    return node;
  }
  function ensureMain(){
    try {
      if (typeof root.go === 'function') root.go('main');
    } catch (_err) {}
  }
  function subjectUnlocked(subject){
    if (!subject || !subject.locked) return true;
    return totalSolvedOk() >= (Number(subject.unlockAt) || 0);
  }
  function findTourTopic(){
    if (state.tourTopic) return state.tourTopic;
    var subjects = Array.isArray(root.SUBJ) ? root.SUBJ : [];
    for (var i = 0; i < subjects.length; i += 1) {
      var subj = subjects[i];
      if (!subjectUnlocked(subj)) continue;
      var topics = Array.isArray(subj && subj.tops) ? subj.tops : [];
      for (var j = 0; j < topics.length; j += 1) {
        var topic = topics[j];
        if (!topic) continue;
        state.tourTopic = { subj:subj, topic:topic };
        return state.tourTopic;
      }
    }
    return null;
  }
  function openTheoryStep(){
    var meta = findTourTopic();
    if (!meta) {
      ensureMain();
      return false;
    }
    try {
      if (typeof root.wave21OpenTopic === 'function') return !!root.wave21OpenTopic(meta.subj.id, meta.topic.id, 'theory');
    } catch (_err) {}
    ensureMain();
    return false;
  }
  function currentStep(){
    var idx = state.stepIndex;
    var step2Meta = findTourTopic();
    var topicLabel = step2Meta ? String(step2Meta.subj.nm || step2Meta.subj.id) + ' → ' + String(step2Meta.topic.nm || step2Meta.topic.id) : 'любая тема';
    var steps = [
      {
        id: 'pick-subject',
        title: '1. Начни с предмета',
        lead: 'Сначала выбери предмет на главном экране.',
        body: 'Карточки предметов — это вход в темы и теорию. В простом режиме здесь остаётся только самое нужное: обычный тренажёр без лишних сценариев.',
        selector: '#sg',
        prepare: ensureMain,
        cta: 'Дальше'
      },
      {
        id: 'read-theory',
        title: '2. Сначала теория, потом тренажёр',
        lead: 'Перед вопросами открой короткую шпаргалку по теме.',
        body: 'Я уже показал пример темы: ' + topicLabel + '. Прочитай теорию и запускай тренировку кнопкой «✏️ Начать тренажёр» — так вход в новую тему проще и спокойнее.',
        selector: '#s-theory .btn.btn-p[data-wave87r-action="start-normal-quiz"], #tc',
        prepare: openTheoryStep,
        cta: 'Дальше'
      },
      {
        id: 'smart-start',
        title: '3. Кнопка «▶ Заниматься» ведёт сама',
        lead: 'Когда не знаешь, с чего начать, жми одну кнопку.',
        body: 'На главном экране «▶ Заниматься» сама выберет следующий полезный шаг: ошибки, слабые темы, незавершённую или новую тему. В «⚙️ Настройки» можно в любой момент выключить простой режим и снова включить продвинутые сценарии.',
        selector: '#daily-meter',
        prepare: ensureMain,
        cta: 'Готово'
      }
    ];
    return steps[idx] || steps[0];
  }
  function queryTarget(selector){
    if (!selector) return null;
    var parts = String(selector).split(',');
    for (var i = 0; i < parts.length; i += 1) {
      var item = String(parts[i] || '').trim();
      if (!item) continue;
      var found = document.querySelector(item);
      if (found) return found;
    }
    return null;
  }
  function overlayButton(label, action, kind){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wave89e-tour-btn' + (kind ? ' ' + kind : '');
    btn.setAttribute('data-wave89e-action', action);
    btn.textContent = label;
    return btn;
  }
  function buildOverlay(){
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89e-tour-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wave89e-tour-title');

    var card = document.createElement('div');
    card.className = 'wave89e-tour-card';

    var badge = document.createElement('div');
    badge.className = 'wave89e-tour-badge';
    badge.textContent = '👋 Быстрый старт';

    var title = document.createElement('h3');
    title.id = 'wave89e-tour-title';
    title.className = 'wave89e-tour-title';

    var lead = document.createElement('p');
    lead.className = 'wave89e-tour-lead';
    lead.setAttribute('data-wave89e-tour', 'lead');

    var body = document.createElement('p');
    body.className = 'wave89e-tour-body';
    body.setAttribute('data-wave89e-tour', 'body');

    var progress = document.createElement('div');
    progress.className = 'wave89e-tour-progress';
    progress.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < state.stepCount; i += 1) {
      var dot = document.createElement('span');
      dot.className = 'wave89e-tour-dot';
      dot.setAttribute('data-wave89e-dot', String(i));
      progress.appendChild(dot);
    }

    var footer = document.createElement('div');
    footer.className = 'wave89e-tour-actions';
    footer.appendChild(overlayButton('Пропустить', 'skip', 'ghost'));
    footer.appendChild(overlayButton('Назад', 'prev', 'ghost'));
    footer.appendChild(overlayButton('Дальше', 'next', 'accent'));

    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(lead);
    card.appendChild(body);
    card.appendChild(progress);
    card.appendChild(footer);
    overlay.appendChild(card);

    overlay.addEventListener('click', function(event){
      var actionNode = event && event.target && event.target.closest ? event.target.closest('[data-wave89e-action]') : null;
      if (!actionNode) return;
      var action = actionNode.getAttribute('data-wave89e-action');
      if (action === 'skip') {
        close({ mark:'skip', reason:'skip' });
      } else if (action === 'prev') {
        prev();
      } else if (action === 'next') {
        next();
      }
    });
    return overlay;
  }
  function ensureOverlay(){
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;
    overlay = buildOverlay();
    document.body.appendChild(overlay);
    return overlay;
  }
  function onKeydown(event){
    if (!state.open || !event) return;
    if (event.key === 'Escape') {
      if (event.preventDefault) event.preventDefault();
      close({ mark: state.manual ? '' : 'skip', reason:'escape' });
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      if (event.preventDefault) event.preventDefault();
      next();
      return;
    }
    if (event.key === 'ArrowLeft') {
      if (event.preventDefault) event.preventDefault();
      prev();
    }
  }
  function bindKeydown(){
    if (KEYDOWN_BOUND || !root.addEventListener) return;
    root.addEventListener('keydown', onKeydown, true);
    KEYDOWN_BOUND = true;
  }
  function unbindKeydown(){
    if (!KEYDOWN_BOUND || !root.removeEventListener) return;
    root.removeEventListener('keydown', onKeydown, true);
    KEYDOWN_BOUND = false;
  }
  function updateOverlay(){
    if (!state.open) return;
    var step = currentStep();
    var overlay = ensureOverlay();
    var title = overlay.querySelector('#wave89e-tour-title');
    var lead = overlay.querySelector('[data-wave89e-tour="lead"]');
    var body = overlay.querySelector('[data-wave89e-tour="body"]');
    var prevBtn = overlay.querySelector('[data-wave89e-action="prev"]');
    var nextBtn = overlay.querySelector('[data-wave89e-action="next"]');
    if (title) title.textContent = step.title;
    if (lead) lead.textContent = step.lead;
    if (body) body.textContent = step.body;
    if (prevBtn) prevBtn.disabled = state.stepIndex === 0;
    if (nextBtn) nextBtn.textContent = step.cta || (state.stepIndex >= state.stepCount - 1 ? 'Готово' : 'Дальше');
    Array.prototype.slice.call(overlay.querySelectorAll('[data-wave89e-dot]')).forEach(function(dot){
      var idx = Number(dot.getAttribute('data-wave89e-dot')) || 0;
      dot.classList.toggle('active', idx === state.stepIndex);
    });
    clearStepTimer();
    stepTimer = (root.setTimeout || setTimeout)(function(){
      stepTimer = 0;
      highlightTarget(queryTarget(step.selector));
    }, 90);
  }
  function showStep(index){
    state.stepIndex = Math.max(0, Math.min(state.stepCount - 1, Number(index) || 0));
    var step = currentStep();
    try { if (step.prepare) step.prepare(); } catch (_err) {}
    updateOverlay();
  }
  function next(){
    if (!state.open) return false;
    if (state.stepIndex >= state.stepCount - 1) {
      close({ mark:'done', reason:'complete' });
      return true;
    }
    showStep(state.stepIndex + 1);
    return true;
  }
  function prev(){
    if (!state.open) return false;
    if (state.stepIndex <= 0) return false;
    showStep(state.stepIndex - 1);
    return true;
  }
  function isBusyScreen(){
    var screen = activeScreenId();
    return screen === 's-play' || screen === 's-result';
  }
  function shouldAutoOpen(){
    if (hasSeenTour()) return false;
    if (isBusyScreen()) return false;
    return !hasMeaningfulProgress();
  }
  function close(options){
    options = options || {};
    state.open = false;
    state.completed = options.mark === 'done';
    state.lastReason = options.reason || '';
    clearStepTimer();
    clearHighlight();
    addBodyClass(false);
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    unbindKeydown();
    if (options.mark) markSeen(options.mark === 'skip' ? 'skip' : 'done');
    if (typeof options.after === 'function') {
      try { options.after(); } catch (_err) {}
    }
    return true;
  }
  function start(options){
    options = options || {};
    if (!options.manual && !shouldAutoOpen()) return false;
    if (options.manual && isBusyScreen()) {
      toast('Заверши текущую сессию, чтобы открыть быстрый тур.');
      return false;
    }
    close({});
    state.open = true;
    state.manual = !!options.manual;
    state.completed = false;
    state.lastReason = 'open';
    state.tourTopic = null;
    addBodyClass(true);
    bindKeydown();
    showStep(0);
    return true;
  }
  function scheduleAutoOpen(){
    if (!shouldAutoOpen()) return false;
    clearStepTimer();
    stepTimer = (root.setTimeout || setTimeout)(function(){
      stepTimer = 0;
      start({ manual:false, auto:true });
    }, 260);
    return true;
  }
  function bind(){
    scheduleAutoOpen();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89eOnboarding = {
    version: 'wave89e',
    storageKey: STORAGE_KEY,
    start: start,
    next: next,
    prev: prev,
    close: close,
    shouldAutoOpen: shouldAutoOpen,
    scheduleAutoOpen: scheduleAutoOpen,
    activeScreenId: activeScreenId,
    findTourTopic: findTourTopic,
    isOpen: function(){ return !!state.open; },
    getState: function(){
      return {
        open: !!state.open,
        manual: !!state.manual,
        stepIndex: state.stepIndex,
        stepCount: state.stepCount,
        completed: !!state.completed,
        lastReason: state.lastReason,
        hasSeen: hasSeenTour()
      };
    }
  };
})();



/* wave89f: hamburger menu / secondary actions */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89fHamburgerMenu) return;

  var root = window;
  var TRIGGER_ID = 'wave89f-menu-trigger';
  var OVERLAY_ID = 'wave89f-menu-overlay';
  var PANEL_ID = 'wave89f-menu-panel';
  var BODY_CLASS = 'wave89f-menu-open';
  var HIDE_ATTR = 'data-wave89f-relocated';
  var ROW_ATTR = 'data-wave89f-menu-row';
  var ROW_EMPTY_ATTR = 'data-wave89f-empty-row';
  var observer = null;
  var syncTimer = 0;
  var keydownBound = false;
  var state = { open:false };

  function asText(value){
    return String(value == null ? '' : value);
  }
  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function hasClass(node, className){
    return !!(isElement(node) && node.classList && node.classList.contains(className));
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
  }
  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function activeScreenId(){
    var ids = ['s-main', 's-subj', 's-theory', 's-play', 's-result', 's-prog', 's-info'];
    for (var i = 0; i < ids.length; i += 1) {
      var node = getById(ids[i]);
      if (hasClass(node, 'on')) return ids[i];
    }
    return '';
  }
  function addBodyClass(enabled){
    if (document.body && document.body.classList) document.body.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    if (document.documentElement && document.documentElement.classList) {
      document.documentElement.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    }
  }
  function applyTriggerState(open){
    var btn = getById(TRIGGER_ID);
    if (!btn) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('open', !!open);
  }
  function gradeLabel(){
    try {
      if (root.__wave88dBreadcrumbs && typeof root.__wave88dBreadcrumbs.gradeLabel === 'function') {
        return root.__wave88dBreadcrumbs.gradeLabel();
      }
    } catch (_err) {}
    var raw = asText(root.GRADE_TITLE || root.GRADE_NUM || root.GRADE_NO || '').trim();
    raw = raw.replace(/^[^0-9А-Яа-яA-Za-z]+/, '').trim();
    if (!raw) raw = 'Класс';
    if (!/класс/i.test(raw)) raw += ' класс';
    return raw;
  }
  function isSimpleMode(){
    return !!(root.__wave89dSimpleMode && typeof root.__wave89dSimpleMode.isEnabled === 'function' && root.__wave89dSimpleMode.isEnabled());
  }
  function blockAdvanced(kind){
    if (root.__wave89dSimpleMode && typeof root.__wave89dSimpleMode.blockAdvanced === 'function') {
      return root.__wave89dSimpleMode.blockAdvanced(kind);
    }
    toast('Эта функция скрыта в простом режиме.');
    return false;
  }
  function maybeLeavePlay(){
    if (activeScreenId() !== 's-play') return true;
    var ok = typeof root.confirm === 'function'
      ? root.confirm('Выйти из текущей сессии? Результат будет сохранён.')
      : true;
    if (!ok) return false;
    if (typeof root.endSession === 'function') root.endSession();
    return true;
  }
  function menuSections(){
    var simple = isSimpleMode();
    var sections = [
      {
        title: 'Учёба',
        items: [
          { id:'help', icon:'📖', label:'Справка', note:'Коротко вспомнить режимы и логику тренажёра' },
          { id:'journal', icon:'🔁', label:'Ошибки', note:'Открыть журнал ошибок и слабых тем' },
          { id:'badges', icon:'🏆', label:'Награды', note:'Посмотреть достижения, серии и бейджи' },
          { id:'dates', icon:'📅', label:'Даты диагностик', note:'Сместить фокус микса к ближайшим проверочным' }
        ]
      },
      {
        title: 'Аккаунт',
        items: [
          { id:'profile', icon:'👑', label:'Профиль', note:'Серия, статистика и код восстановления' },
          simple ? null : { id:'rating', icon:'🏆', label:'Рейтинг Молнии', note:'Локальный и общий рейтинг по режиму «Молния»' }
        ]
      },
      {
        title: 'Отчёты и экспорт',
        items: [
          { id:'report', icon:'📊', label:'Отчёт для родителя', note:'Открыть подробный снимок прогресса', accent:true },
          { id:'share-report', icon:'📤', label:'Поделиться прогрессом', note:'Создать ссылку-отчёт со снимком результатов' },
          { id:'export-csv', icon:'⬇️', label:'Экспорт CSV', note:'Скачать таблицу прогресса для родителя' },
          { id:'export-json', icon:'🧾', label:'Экспорт JSON', note:'Скачать JSON прогресса текущего класса' }
        ]
      },
      {
        title: 'Данные',
        items: [
          { id:'backup', icon:'💾', label:'Резервная копия', note:'Сохранить и восстановить данные текущего класса' },
          simple ? null : { id:'sync', icon:'☁️', label:'Синхронизация', note:'Облако между устройствами без лишних кнопок на главной' }
        ]
      },
      {
        title: 'Система',
        items: [
          { id:'settings', icon:'⚙️', label:'Настройки', note:'Простой режим, оформление и быстрый тур' },
          { id:'classes', icon:'🏫', label:'Другой класс', note:'Вернуться к выбору класса или открыть список классов' }
        ]
      }
    ];
    return sections.map(function(section){
      return {
        title: section.title,
        items: (Array.isArray(section.items) ? section.items : []).filter(Boolean)
      };
    }).filter(function(section){ return section.items.length > 0; });
  }
  function visibleItemIds(){
    return menuSections().reduce(function(acc, section){
      section.items.forEach(function(item){ acc.push(item.id); });
      return acc;
    }, []);
  }
  function getHydrator(){
    return root.wave87nRuntimeSplit && typeof root.wave87nRuntimeSplit.hydrateForAction === 'function'
      ? root.wave87nRuntimeSplit.hydrateForAction
      : null;
  }
  function hydrate(action, opts){
    var fn = getHydrator();
    if (typeof fn === 'function' && action) {
      try { return Promise.resolve(fn(action, opts || {})); } catch (_err) { return Promise.resolve(false); }
    }
    return Promise.resolve(false);
  }
  function loadServices(opts){
    var api = root.wave87nRuntimeSplit;
    if (api && typeof api.loadServices === 'function') {
      try { return Promise.resolve(api.loadServices(opts || {})); } catch (_err) { return Promise.resolve(false); }
    }
    return Promise.resolve(false);
  }
  function scheduleSync(){
    if (syncTimer && typeof root.clearTimeout === 'function') root.clearTimeout(syncTimer);
    syncTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      syncTimer = 0;
      sync();
    }, 50);
  }
  function closeMenu(){
    state.open = false;
    var overlay = getById(OVERLAY_ID);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    addBodyClass(false);
    applyTriggerState(false);
    if (keydownBound && root.removeEventListener) {
      root.removeEventListener('keydown', onKeydown, true);
      keydownBound = false;
    }
    return true;
  }
  function closeThen(run){
    closeMenu();
    (root.setTimeout || setTimeout)(function(){
      try { if (typeof run === 'function') run(); } catch (_err) {}
      scheduleSync();
    }, 20);
  }
  function runMenuAction(id){
    id = asText(id).trim();
    if (!id) return false;
    if (!maybeLeavePlay()) return false;
    if (id === 'help') {
      closeThen(function(){
        if (typeof root.go === 'function') root.go('info');
        else toast('Справка пока недоступна.');
      });
      return true;
    }
    if (id === 'journal') {
      closeThen(function(){
        if (typeof root.showJournal === 'function') root.showJournal();
        else toast('Журнал ошибок пока недоступен.');
      });
      return true;
    }
    if (id === 'badges') {
      closeThen(function(){
        hydrate('show-badges', { interactive:true, source:'menu-badges' }).then(function(){
          if (typeof root.showBadges === 'function') root.showBadges();
          else toast('Награды пока недоступны.');
        });
      });
      return true;
    }
    if (id === 'dates') {
      closeThen(function(){
        if (typeof root.showDateEditor === 'function') root.showDateEditor();
        else toast('Редактор дат пока недоступен.');
      });
      return true;
    }
    if (id === 'profile') {
      closeThen(function(){
        hydrate('show-profile', { interactive:true, source:'menu-profile' }).then(function(){
          if (typeof root.showHallOfFame === 'function') root.showHallOfFame();
        });
      });
      return true;
    }
    if (id === 'rating') {
      if (isSimpleMode()) return blockAdvanced('rating');
      closeThen(function(){
        if (typeof root.showRushRecords === 'function') root.showRushRecords();
        else toast('Рейтинг пока недоступен.');
      });
      return true;
    }
    if (id === 'report') {
      closeThen(function(){
        hydrate('generate-report', { interactive:true, source:'menu-report' }).then(function(){
          if (typeof root.generateReport === 'function') root.generateReport();
          else toast('Отчёт пока загружается.');
        });
      });
      return true;
    }
    if (id === 'share-report') {
      closeThen(function(){
        hydrate('share-report', { interactive:true, source:'menu-share-report' }).then(function(){
          if (typeof root.shareReport === 'function') root.shareReport();
          else toast('Поделиться прогрессом пока нельзя.');
        });
      });
      return true;
    }
    if (id === 'export-csv' || id === 'export-json') {
      closeThen(function(){
        var api = root.wave86nProgressTools;
        var format = id === 'export-csv' ? 'csv' : 'json';
        if (api && typeof api.exportParentProgress === 'function') api.exportParentProgress(format);
        else toast('Экспорт пока не готов.');
      });
      return true;
    }
    if (id === 'backup') {
      closeThen(function(){
        hydrate('show-backup', { interactive:true, source:'menu-backup' }).then(function(){
          if (typeof root.showBackupModal === 'function') root.showBackupModal();
          else toast('Резервная копия пока загружается.');
        });
      });
      return true;
    }
    if (id === 'sync') {
      if (isSimpleMode()) return blockAdvanced('sync');
      closeThen(function(){
        loadServices({ ui:{ scope:'runtime', kind:'services', action:'sync', title:'Подгружаю синхронизацию', label:'Загружаю облачные сервисы и резервное хранилище…' } }).then(function(){
          if (root.wave86wCloudSync && typeof root.wave86wCloudSync.open === 'function') root.wave86wCloudSync.open();
          else toast('Синхронизация ещё загружается.');
        });
      });
      return true;
    }
    if (id === 'settings') {
      closeThen(function(){
        if (root.__wave89dSimpleMode && typeof root.__wave89dSimpleMode.openSettings === 'function') root.__wave89dSimpleMode.openSettings();
        else if (typeof root.showAbout === 'function') root.showAbout();
      });
      return true;
    }
    if (id === 'classes') {
      closeThen(function(){
        if (typeof root.showClassSelect === 'function') root.showClassSelect();
        else if (root.location && typeof root.location.assign === 'function') root.location.assign('index.html?choose');
        else if (root.location) root.location.href = 'index.html?choose';
      });
      return true;
    }
    return false;
  }
  function menuActionButton(item){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wave89f-menu-item' + (item.accent ? ' accent' : '');
    btn.setAttribute('data-wave89f-item', item.id);

    var icon = document.createElement('span');
    icon.className = 'wave89f-menu-item-icon';
    icon.textContent = item.icon || '•';

    var copy = document.createElement('span');
    copy.className = 'wave89f-menu-item-copy';
    var strong = document.createElement('strong');
    strong.textContent = item.label;
    var note = document.createElement('span');
    note.textContent = item.note || '';
    copy.appendChild(strong);
    copy.appendChild(note);

    btn.appendChild(icon);
    btn.appendChild(copy);
    btn.addEventListener('click', function(){ runMenuAction(item.id); });
    return btn;
  }
  function buildMenuOverlay(){
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89f-menu-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wave89f-menu-title');
    overlay.addEventListener('click', function(event){
      if (event.target === overlay) closeMenu();
    });

    var panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'wave89f-menu-panel';

    var head = document.createElement('div');
    head.className = 'wave89f-menu-head';

    var meta = document.createElement('div');
    meta.className = 'wave89f-menu-meta';
    var badge = document.createElement('div');
    badge.className = 'wave89f-menu-badge';
    badge.textContent = '☰ Быстрое меню';
    var title = document.createElement('h3');
    title.id = 'wave89f-menu-title';
    title.className = 'wave89f-menu-title';
    title.textContent = gradeLabel();
    var sub = document.createElement('p');
    sub.className = 'wave89f-menu-sub';
    sub.textContent = isSimpleMode()
      ? 'В простом режиме вторичные функции собраны здесь, а главное остаётся на экране.'
      : 'Вторичные функции и данные собраны в одном месте без перегруза главного экрана.';
    meta.appendChild(badge);
    meta.appendChild(title);
    meta.appendChild(sub);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'wave89f-menu-close';
    close.setAttribute('aria-label', 'Закрыть меню');
    close.textContent = '✕';
    close.addEventListener('click', closeMenu);

    head.appendChild(meta);
    head.appendChild(close);
    panel.appendChild(head);

    var sections = menuSections();
    for (var i = 0; i < sections.length; i += 1) {
      var section = sections[i];
      var wrap = document.createElement('section');
      wrap.className = 'wave89f-menu-section';
      var heading = document.createElement('h4');
      heading.className = 'wave89f-menu-section-title';
      heading.textContent = section.title;
      var grid = document.createElement('div');
      grid.className = 'wave89f-menu-grid';
      section.items.forEach(function(item){ grid.appendChild(menuActionButton(item)); });
      wrap.appendChild(heading);
      wrap.appendChild(grid);
      panel.appendChild(wrap);
    }

    overlay.appendChild(panel);
    return overlay;
  }
  function openMenu(){
    closeMenu();
    var overlay = buildMenuOverlay();
    document.body.appendChild(overlay);
    state.open = true;
    addBodyClass(true);
    applyTriggerState(true);
    if (!keydownBound && root.addEventListener) {
      root.addEventListener('keydown', onKeydown, true);
      keydownBound = true;
    }
    var closeBtn = overlay.querySelector('.wave89f-menu-close');
    if (closeBtn && typeof closeBtn.focus === 'function') {
      try { closeBtn.focus({ preventScroll:true }); } catch (_err) { try { closeBtn.focus(); } catch (_err2) {} }
    }
    return overlay;
  }
  function toggleMenu(){
    return state.open ? closeMenu() : openMenu();
  }
  function onKeydown(event){
    if (!state.open || !event) return;
    if (event.key === 'Escape') {
      if (event.preventDefault) event.preventDefault();
      closeMenu();
    }
  }
  function ensureTrigger(){
    var header = document.querySelector('header');
    if (!header) return null;
    var button = getById(TRIGGER_ID);
    if (button && button.parentNode !== header) {
      try { button.parentNode.removeChild(button); } catch (_err) {}
      button = null;
    }
    if (!button) {
      button = document.createElement('button');
      button.id = TRIGGER_ID;
      button.type = 'button';
      button.className = 'wave89f-menu-trigger';
      button.textContent = '☰';
      button.setAttribute('aria-label', 'Открыть быстрое меню');
      button.setAttribute('title', 'Меню');
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', OVERLAY_ID);
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', function(event){
        if (event && event.preventDefault) event.preventDefault();
        toggleMenu();
      });
      header.appendChild(button);
    }
    return button;
  }
  function markRelocated(node){
    if (!isElement(node)) return;
    node.setAttribute(HIDE_ATTR, '1');
    if (node.parentElement) node.parentElement.setAttribute(ROW_ATTR, '1');
  }
  function syncRelocatedNodes(){
    Array.prototype.slice.call(document.querySelectorAll('[data-wave87r-action="show-profile"], [data-wave87r-action="generate-report"], [data-wave87r-action="show-backup"], [data-wave87r-action="share-report"]')).forEach(markRelocated);
    Array.prototype.slice.call(document.querySelectorAll('#wave86n-export-row, #wave86w-main-cloud-btn')).forEach(markRelocated);
    Array.prototype.slice.call(document.querySelectorAll('#daily-meter button[onclick*="showRushRecords"]')).forEach(markRelocated);
  }
  function isRelocated(node){
    return !!(isElement(node) && typeof node.getAttribute === 'function' && node.getAttribute(HIDE_ATTR) === '1');
  }
  function syncEmptyRows(){
    Array.prototype.slice.call(document.querySelectorAll('[' + ROW_ATTR + '="1"]')).forEach(function(row){
      var visible = 0;
      Array.prototype.slice.call(row.children || []).forEach(function(child){
        if (!isElement(child) || isRelocated(child)) return;
        if (child.hidden) return;
        if (child.style && (child.style.display === 'none' || child.style.visibility === 'hidden')) return;
        visible += 1;
      });
      row.setAttribute(ROW_EMPTY_ATTR, visible ? '0' : '1');
    });
  }
  function syncOpenOverlay(){
    if (!state.open) return;
    var overlay = getById(OVERLAY_ID);
    if (!overlay) {
      state.open = false;
      addBodyClass(false);
      applyTriggerState(false);
      return;
    }
    var panel = getById(PANEL_ID);
    if (!panel || overlay.parentNode !== document.body) {
      closeMenu();
      openMenu();
    }
  }
  function sync(){
    ensureTrigger();
    syncRelocatedNodes();
    syncEmptyRows();
    syncOpenOverlay();
  }
  function bind(){
    ensureTrigger();
    syncRelocatedNodes();
    syncEmptyRows();
    if (document.addEventListener) {
      document.addEventListener('trainer:simplemodechange', scheduleSync);
    }
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleSync);
      try {
        observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden', 'aria-hidden'] });
      } catch (_err) {}
    }
    scheduleSync();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89fHamburgerMenu = {
    version: 'wave89f',
    triggerId: TRIGGER_ID,
    overlayId: OVERLAY_ID,
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    sync: sync,
    menuSections: menuSections,
    visibleItemIds: visibleItemIds,
    runMenuAction: runMenuAction,
    activeScreenId: activeScreenId,
    maybeLeavePlay: maybeLeavePlay,
    isOpen: function(){ return !!state.open; },
    isSimpleMode: isSimpleMode
  };
})();

/* wave89g: minimal main footer / utility condensation */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89gMinimalFooter) return;

  var root = window;
  var FOOTER_ID = 'wave89g-main-footer';
  var FOOTER_HINT_ID = 'wave89g-main-footer-hint';
  var LEGACY_ATTR = 'data-wave89g-footer-legacy';
  var LEGACY_ACTIONS = ['go-info', 'show-journal', 'show-badges', 'show-class-select', 'go-prog', 'show-about', 'show-date-editor'];
  var syncTimer = 0;
  var observer = null;

  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function mainScreen(){
    return getById('s-main');
  }
  function mainWrap(){
    var screen = mainScreen();
    return screen && screen.querySelector ? screen.querySelector('.w') : null;
  }
  function inFooter(node){
    for (var current = node; current; current = current.parentElement) {
      if (current.id === FOOTER_ID) return true;
    }
    return false;
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
  }
  function runAction(action){
    if (action === 'go-prog') {
      if (typeof root.go === 'function') root.go('prog');
      else toast('Прогресс пока недоступен.');
      return true;
    }
    if (action === 'show-about') {
      if (typeof root.showAbout === 'function') root.showAbout();
      else toast('Настройки пока недоступны.');
      return true;
    }
    return false;
  }
  function footerButton(label, action, accent){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn ' + (accent ? 'btn-p' : 'btn-o') + ' wave89g-main-footer-btn';
    button.setAttribute('data-wave87r-action', action);
    button.setAttribute('data-wave89g-action', action);
    button.textContent = label;
    button.addEventListener('click', function(event){
      if (event && event.preventDefault) event.preventDefault();
      runAction(action);
    });
    return button;
  }
  function buildFooter(){
    var host = document.createElement('section');
    host.id = FOOTER_ID;
    host.className = 'wave89g-main-footer';
    host.setAttribute('aria-label', 'Быстрые действия');

    var hint = document.createElement('p');
    hint.id = FOOTER_HINT_ID;
    hint.className = 'wave89g-main-footer-hint';
    hint.textContent = 'Остальное — в меню ☰';

    var grid = document.createElement('div');
    grid.className = 'wave89g-main-footer-grid';
    grid.appendChild(footerButton('📈 Прогресс', 'go-prog', true));
    grid.appendChild(footerButton('⚙️ Настройки', 'show-about', false));

    host.appendChild(hint);
    host.appendChild(grid);
    return host;
  }
  function ensureFooter(){
    var wrap = mainWrap();
    if (!wrap) return null;
    var footer = getById(FOOTER_ID);
    if (!footer) {
      footer = buildFooter();
      var anchor = getById('daily-meter');
      if (anchor && anchor.parentElement === wrap) {
        if (anchor.nextSibling) wrap.insertBefore(footer, anchor.nextSibling);
        else wrap.appendChild(footer);
      } else {
        wrap.appendChild(footer);
      }
    }
    return footer;
  }
  function collectLegacyButtons(){
    var screen = mainScreen();
    if (!screen || !screen.querySelectorAll) return [];
    var out = [];
    LEGACY_ACTIONS.forEach(function(action){
      Array.prototype.slice.call(screen.querySelectorAll('[data-wave87r-action="' + action + '"]')).forEach(function(node){
        out.push(node);
      });
    });
    return out;
  }
  function hideLegacyRows(){
    collectLegacyButtons().forEach(function(node){
      if (!isElement(node) || inFooter(node)) return;
      var row = node.parentElement;
      if (row && isElement(row) && !inFooter(row)) row.setAttribute(LEGACY_ATTR, '1');
    });
  }
  function sync(){
    ensureFooter();
    hideLegacyRows();
  }
  function scheduleSync(){
    if (syncTimer && typeof root.clearTimeout === 'function') root.clearTimeout(syncTimer);
    syncTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      syncTimer = 0;
      sync();
    }, 40);
  }
  function bind(){
    sync();
    if (document.addEventListener) {
      document.addEventListener('trainer:simplemodechange', scheduleSync);
    }
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleSync);
      try {
        observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden', 'aria-hidden'] });
      } catch (_err) {}
    }
    scheduleSync();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89gMinimalFooter = {
    version: 'wave89g',
    footerId: FOOTER_ID,
    legacyAttr: LEGACY_ATTR,
    sync: sync,
    legacyActions: LEGACY_ACTIONS.slice(),
    visibleButtons: function(){
      var footer = getById(FOOTER_ID);
      if (!footer || !footer.querySelectorAll) return [];
      return Array.prototype.slice.call(footer.querySelectorAll('[data-wave89g-action]')).map(function(node){
        return node.getAttribute('data-wave89g-action') || '';
      }).filter(Boolean);
    },
    hiddenLegacyRows: function(){
      return document.querySelectorAll ? document.querySelectorAll('[' + LEGACY_ATTR + '="1"]').length : 0;
    }
  };
})();


/* wave89h: skeleton loading / lazy chunks */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89hLazySkeleton) return;

  var root = window;
  var OVERLAY_ID = 'wave89h-lazy-overlay';
  var BODY_CLASS = 'wave89h-lazy-open';
  var pending = Object.create(null);
  var state = { open:false, timer:0 };

  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function body(){
    return document.body || document.documentElement || null;
  }
  function setBodyState(active){
    var node = body();
    if (!node || !node.classList) return;
    if (active) node.classList.add(BODY_CLASS);
    else node.classList.remove(BODY_CLASS);
  }
  function hasPending(){
    return Object.keys(pending).length > 0;
  }
  function latestPending(){
    var ids = Object.keys(pending);
    return ids.length ? pending[ids[ids.length - 1]] : null;
  }
  function resolveCopy(detail){
    detail = detail || {};
    var title = detail.title || 'Подгружаю модуль…';
    var label = detail.label || 'Нужный блок подгружается отдельным чанком и откроется автоматически.';
    if (detail.scope === 'subject') {
      title = detail.title || 'Подгружаю предмет 10 класса…';
      label = detail.label || 'Банк предмета загружается отдельным чанком и откроется сразу после загрузки.';
    }
    if (detail.scope === 'runtime' && detail.kind === 'services') {
      title = detail.title || 'Подгружаю сервисы…';
      label = detail.label || 'Загружаю дополнительные экраны и сервисные модули.';
    }
    if (detail.scope === 'runtime' && detail.kind === 'features') {
      title = detail.title || 'Подгружаю возможности…';
      label = detail.label || 'Загружаю дополнительный интерфейс для выбранного действия.';
    }
    return { title:title, label:label };
  }
  function line(widthClass){
    var span = document.createElement('span');
    span.className = 'wave89h-skeleton-line ' + widthClass;
    span.setAttribute('aria-hidden', 'true');
    return span;
  }
  function ensureOverlay(){
    var overlay = getById(OVERLAY_ID);
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89h-lazy-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var card = document.createElement('div');
    card.className = 'wave89h-lazy-card';
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');
    card.setAttribute('aria-atomic', 'true');

    var badge = document.createElement('div');
    badge.className = 'wave89h-lazy-badge';
    badge.textContent = 'Загрузка';

    var title = document.createElement('h3');
    title.className = 'wave89h-lazy-title';
    title.setAttribute('data-wave89h-title', '');

    var copy = document.createElement('p');
    copy.className = 'wave89h-lazy-copy';
    copy.setAttribute('data-wave89h-copy', '');

    var skeleton = document.createElement('div');
    skeleton.className = 'wave89h-skeleton';
    skeleton.appendChild(line('w92'));
    skeleton.appendChild(line('w76'));
    skeleton.appendChild(line('w58'));

    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(copy);
    card.appendChild(skeleton);
    overlay.appendChild(card);
    (body() || document.documentElement).appendChild(overlay);
    return overlay;
  }
  function syncCopy(){
    var overlay = ensureOverlay();
    var info = resolveCopy(latestPending());
    var title = overlay.querySelector ? overlay.querySelector('[data-wave89h-title]') : null;
    var copy = overlay.querySelector ? overlay.querySelector('[data-wave89h-copy]') : null;
    if (title) title.textContent = info.title;
    if (copy) copy.textContent = info.label;
  }
  function openOverlay(){
    if (state.open || !hasPending()) return false;
    state.open = true;
    var overlay = ensureOverlay();
    syncCopy();
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    setBodyState(true);
    return true;
  }
  function closeOverlay(){
    if (state.timer && typeof root.clearTimeout === 'function') {
      root.clearTimeout(state.timer);
      state.timer = 0;
    }
    if (hasPending()) return false;
    state.open = false;
    var overlay = getById(OVERLAY_ID);
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-visible');
    }
    setBodyState(false);
    return true;
  }
  function scheduleOpen(){
    if (state.open) {
      syncCopy();
      return;
    }
    if (state.timer) return;
    state.timer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      state.timer = 0;
      if (hasPending()) openOverlay();
    }, 120);
  }
  function onStart(event){
    var detail = event && event.detail ? event.detail : {};
    var id = String(detail.id || ('wave89h-fallback-' + Date.now()));
    pending[id] = Object.assign({ id:id }, detail || {});
    syncCopy();
    scheduleOpen();
  }
  function onEnd(event){
    var detail = event && event.detail ? event.detail : {};
    var id = String(detail.id || '');
    if (id && pending[id]) delete pending[id];
    if (state.timer && !hasPending() && typeof root.clearTimeout === 'function') {
      root.clearTimeout(state.timer);
      state.timer = 0;
    }
    if (hasPending()) syncCopy();
    closeOverlay();
  }
  function bind(){
    if (root.addEventListener) {
      root.addEventListener('trainer:lazy-start', onStart);
      root.addEventListener('trainer:lazy-end', onEnd);
      root.addEventListener('pagehide', function(){
        pending = Object.create(null);
        closeOverlay();
      }, { once:true });
    }
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89hLazySkeleton = {
    version: 'wave89h',
    overlayId: OVERLAY_ID,
    isOpen: function(){ return !!state.open; },
    pendingCount: function(){ return Object.keys(pending).length; },
    latest: function(){ return latestPending(); },
    syncCopy: syncCopy,
    close: function(){ pending = Object.create(null); return closeOverlay(); }
  };
})();

/* wave89k: weak-device adaptive UI / readability + tap targets */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89kAdaptiveUi) return;

  var root = window;
  var applyTimer = 0;
  var mediaBindings = [];
  var state = {
    enabled:false,
    coarse:false,
    compact:false,
    lowMemory:false,
    lowCpu:false,
    saveData:false,
    reducedMotion:false,
    viewportWidth:0,
    viewportHeight:0
  };
  var CLASSES = {
    enabled:'wave89k-weak-ui',
    coarse:'wave89k-coarse',
    compact:'wave89k-compact',
    reduced:'wave89k-reduced-motion'
  };

  function numberOf(value){
    var num = Number(value);
    return num > 0 ? num : 0;
  }
  function docEl(){
    return document.documentElement || null;
  }
  function body(){
    return document.body || null;
  }
  function navigatorInfo(){
    return root.navigator || {};
  }
  function viewport(){
    var html = docEl();
    var bodyNode = body();
    return {
      width: Math.max(numberOf(root.innerWidth), numberOf(html && html.clientWidth), numberOf(bodyNode && bodyNode.clientWidth)),
      height: Math.max(numberOf(root.innerHeight), numberOf(html && html.clientHeight), numberOf(bodyNode && bodyNode.clientHeight))
    };
  }
  function mediaMatches(query){
    try {
      return !!(root.matchMedia && root.matchMedia(query).matches);
    } catch (_err) {
      return false;
    }
  }
  function setClass(node, name, enabled){
    if (!node || !node.classList || !name) return;
    if (enabled) node.classList.add(name);
    else node.classList.remove(name);
  }
  function cloneState(source){
    return {
      enabled: !!(source && source.enabled),
      coarse: !!(source && source.coarse),
      compact: !!(source && source.compact),
      lowMemory: !!(source && source.lowMemory),
      lowCpu: !!(source && source.lowCpu),
      saveData: !!(source && source.saveData),
      reducedMotion: !!(source && source.reducedMotion),
      viewportWidth: numberOf(source && source.viewportWidth),
      viewportHeight: numberOf(source && source.viewportHeight)
    };
  }
  function sameState(a, b){
    return !!(a && b &&
      a.enabled === b.enabled &&
      a.coarse === b.coarse &&
      a.compact === b.compact &&
      a.lowMemory === b.lowMemory &&
      a.lowCpu === b.lowCpu &&
      a.saveData === b.saveData &&
      a.reducedMotion === b.reducedMotion &&
      a.viewportWidth === b.viewportWidth &&
      a.viewportHeight === b.viewportHeight);
  }
  function applyClasses(next){
    [docEl(), body()].forEach(function(node){
      setClass(node, CLASSES.enabled, next.enabled);
      setClass(node, CLASSES.coarse, next.coarse);
      setClass(node, CLASSES.compact, next.compact);
      setClass(node, CLASSES.reduced, next.reducedMotion);
    });
  }
  function evaluate(){
    var nav = navigatorInfo();
    var size = viewport();
    var coarse = mediaMatches('(pointer: coarse)') || mediaMatches('(any-pointer: coarse)') || numberOf(nav.maxTouchPoints) > 0 || ('ontouchstart' in root);
    var compact = !!((size.width && size.width <= 560) || (size.height && size.height <= 720));
    var lowMemory = !!(numberOf(nav.deviceMemory) && numberOf(nav.deviceMemory) <= 4);
    var lowCpu = !!(numberOf(nav.hardwareConcurrency) && numberOf(nav.hardwareConcurrency) <= 4);
    var saveData = !!(nav.connection && nav.connection.saveData);
    var reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');
    return {
      enabled: !!(coarse || compact || lowMemory || lowCpu || saveData || reducedMotion),
      coarse: coarse,
      compact: compact,
      lowMemory: lowMemory,
      lowCpu: lowCpu,
      saveData: saveData,
      reducedMotion: reducedMotion,
      viewportWidth: size.width,
      viewportHeight: size.height
    };
  }
  function emit(next){
    try {
      document.dispatchEvent(new CustomEvent('trainer:adaptivechange', { detail: cloneState(next) }));
    } catch (_err) {}
  }
  function apply(){
    var next = cloneState(evaluate());
    applyClasses(next);
    if (!sameState(state, next)) emit(next);
    state = next;
    return cloneState(state);
  }
  function scheduleApply(){
    if (applyTimer && typeof root.clearTimeout === 'function') root.clearTimeout(applyTimer);
    applyTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      applyTimer = 0;
      apply();
    }, 40);
  }
  function bindMedia(query){
    try {
      if (!root.matchMedia) return;
      var media = root.matchMedia(query);
      if (!media || mediaBindings.indexOf(media) !== -1) return;
      mediaBindings.push(media);
      if (typeof media.addEventListener === 'function') media.addEventListener('change', scheduleApply);
      else if (typeof media.addListener === 'function') media.addListener(scheduleApply);
    } catch (_err) {}
  }
  function bindConnection(){
    try {
      var connection = navigatorInfo().connection;
      if (!connection) return;
      if (typeof connection.addEventListener === 'function') connection.addEventListener('change', scheduleApply);
      else if (typeof connection.addListener === 'function') connection.addListener(scheduleApply);
    } catch (_err) {}
  }
  function bind(){
    apply();
    if (root.addEventListener) {
      root.addEventListener('resize', scheduleApply, { passive:true });
      root.addEventListener('orientationchange', scheduleApply, { passive:true });
      root.addEventListener('pageshow', scheduleApply);
    }
    if (document.addEventListener) {
      document.addEventListener('trainer:simplemodechange', scheduleApply);
    }
    bindConnection();
    bindMedia('(pointer: coarse)');
    bindMedia('(any-pointer: coarse)');
    bindMedia('(prefers-reduced-motion: reduce)');
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89kAdaptiveUi = {
    version: 'wave89k',
    classes: CLASSES,
    evaluate: evaluate,
    apply: apply,
    current: function(){ return cloneState(state); },
    isEnabled: function(){ return !!state.enabled; },
    scheduleApply: scheduleApply
  };
})();



/* wave89m: adaptive difficulty */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89mAdaptiveDifficulty) return;

  var root = window;
  var SESSION_STREAK_TRIGGER = 5;
  var SESSION_TROUBLE_TRIGGER = 2;
  var SESSION_SLOW_TRIGGER = 3;
  var SESSION_SHIFT_MIN = -1;
  var SESSION_SHIFT_MAX = 1;
  var STORAGE_PREFIX = 'trainer_adaptive_difficulty_';
  var PROGRESS_ATTR = 'data-wave89m-progress-card';
  var PLAY_ATTR = 'data-wave89m-play-card';
  var CANDIDATE_COUNT = 14;
  var LEVELS = ['easy', 'medium', 'hard'];
  var RU_LABELS = {
    easy: 'лёгкий',
    medium: 'средний',
    hard: 'сложный'
  };
  var state = {
    active: false,
    shift: 0,
    correctRun: 0,
    troubleRun: 0,
    slowRun: 0,
    answers: 0,
    lastReason: '',
    lastChange: 0,
    lastTarget: 'easy',
    lastBucket: 'easy',
    sessionMode: ''
  };
  var timingCache = { key:'', rows:[] };

  function gradeKey(){ return String(root.GRADE_NUM || root.GRADE_NO || ''); }
  function storageKey(){ return STORAGE_PREFIX + gradeKey(); }
  function asText(value){ return String(value == null ? '' : value); }
  function num(value){ var out = Number(value); return isFinite(out) ? out : 0; }
  function int(value){ return Math.max(0, Math.floor(num(value))); }
  function clamp(value, min, max){ return Math.min(max, Math.max(min, num(value))); }
  function clone(value){
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_err) { return value; }
  }
  function safeJSON(raw, fallback){
    try { return raw ? JSON.parse(raw) : fallback; }
    catch (_err) { return fallback; }
  }
  function normalizeText(value){
    return asText(value).toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  }
  function safeReadStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem(storageKey());
      var data = safeJSON(raw, { version:'wave89m', grade:gradeKey(), topics:{} });
      if (!data || typeof data !== 'object') data = { version:'wave89m', grade:gradeKey(), topics:{} };
      if (!data.topics || typeof data.topics !== 'object') data.topics = {};
      return data;
    } catch (_err) {
      return { version:'wave89m', grade:gradeKey(), topics:{} };
    }
  }
  function safeWriteStore(data){
    try {
      if (!root.localStorage) return false;
      var topics = data && data.topics && typeof data.topics === 'object' ? data.topics : {};
      root.localStorage.setItem(storageKey(), JSON.stringify({
        version: 'wave89m',
        grade: gradeKey(),
        updatedAt: Date.now(),
        topics: topics
      }));
      return true;
    } catch (_err) {
      return false;
    }
  }
  function bucketName(value){
    var raw = normalizeText(value);
    if (raw === 'hard' || raw === '3' || raw === 'сложный') return 'hard';
    if (raw === 'medium' || raw === '2' || raw === 'средний') return 'medium';
    if (raw === 'easy' || raw === '1' || raw === 'легкий' || raw === 'лёгкий') return 'easy';
    return 'medium';
  }
  function bucketLevel(bucket){ return LEVELS.indexOf(bucketName(bucket)); }
  function levelBucket(level){ return LEVELS[Math.max(0, Math.min(2, Math.round(num(level))))] || 'medium'; }
  function levelNumber(value){
    if (typeof value === 'number') {
      var direct = Math.round(num(value));
      if (direct >= 1 && direct <= 3) return direct;
      if (direct < 0) direct = 0;
      if (direct > 2) direct = 2;
      return direct + 1;
    }
    var level = bucketLevel(value);
    if (level < 0) level = 1;
    if (level > 2) level = 2;
    return level + 1;
  }
  function levelLabel(value){
    var bucket;
    if (typeof value === 'number') {
      var direct = Math.round(num(value));
      bucket = direct >= 1 && direct <= 3 ? levelBucket(direct - 1) : levelBucket(direct);
    } else {
      bucket = bucketName(value);
    }
    return RU_LABELS[bucket] || RU_LABELS.medium;
  }
  function inferDifficulty(question){
    if (!question || typeof question !== 'object') return 'medium';
    var questionText = asText(question.question || question.q);
    var answerText = asText(question.answer || question.a);
    var tag = asText(question.tag || question.topic || question.topicName);
    var grade = num(question.grade || question.g || root.GRADE_NUM || root.GRADE_NO || 0);
    var score = 0;
    var numbers = questionText.match(/-?\d+(?:[\.,]\d+)?/g) || [];
    if (questionText.length >= 90) score += 1;
    if (numbers.length >= 3) score += 1;
    if (/√|\^|≤|≥|\/|дроб|процент|скорост|уравнен|функц|координат|вектор|производн|интеграл|логарифм|тригоном|электростат|электромаг|биохим|органик|polit|sozio|socio|право|эконом|grammar|article|modal|conditional/i.test(questionText + ' ' + tag)) score += 1;
    if (/почему|объясни|сделай вывод|наиболее вероятно|какой вывод|сравни|определи по описанию|выбери утверждение|justify|explain/i.test(questionText)) score += 1;
    if (grade >= 9) score += 1;
    if (grade >= 11) score += 1;
    if (answerText.length >= 24) score += 1;
    return score <= 1 ? 'easy' : (score <= 3 ? 'medium' : 'hard');
  }
  function difficultyOf(question){
    if (!question || typeof question !== 'object') return 'medium';
    if (question.diffBucket || question.difficulty) return bucketName(question.diffBucket || question.difficulty);
    var explicitLevel = int(question.difficultyLevel || question.level || 0);
    if (explicitLevel >= 1 && explicitLevel <= 3) return levelBucket(explicitLevel - 1);
    var score = num(question.diffScore);
    if (score >= 4) return 'hard';
    if (score >= 2) return 'medium';
    return inferDifficulty(question);
  }
  function getCurrentQuestion(){
    try { if (typeof prob !== 'undefined' && prob && typeof prob === 'object') return prob; } catch (_err) {}
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function setCurrentQuestion(question){
    try { prob = question; } catch (_err) {}
    root.prob = question;
  }
  function getSelection(){
    try { if (typeof sel !== 'undefined') return sel; } catch (_err) {}
    return root.sel;
  }
  function setSelection(value){
    try { sel = value; } catch (_err) {}
    root.sel = value;
  }
  function setHintState(value){
    try { hintOn = !!value; } catch (_err) {}
    root.hintOn = !!value;
  }
  function setTheoryState(value){
    try { shpOn = !!value; } catch (_err) {}
    root.shpOn = !!value;
  }
  function setHelpState(value){
    try { usedHelp = !!value; } catch (_err) {}
    root.usedHelp = !!value;
  }
  function getUsedHelp(){
    try { if (typeof usedHelp !== 'undefined') return !!usedHelp; } catch (_err) {}
    return !!root.usedHelp;
  }
  function getCurrentSubject(){
    try { if (typeof cS !== 'undefined') return cS; } catch (_err) {}
    return root.cS || null;
  }
  function setCurrentSubject(subject){
    try { cS = subject; } catch (_err) {}
    root.cS = subject || null;
  }
  function getCurrentTopic(){
    try { if (typeof cT !== 'undefined') return cT; } catch (_err) {}
    return root.cT || null;
  }
  function setCurrentTopic(topic){
    try { cT = topic; } catch (_err) {}
    root.cT = topic || null;
  }
  function getCurrentTheory(){
    try { if (typeof curTheory !== 'undefined') return curTheory; } catch (_err) {}
    return root.curTheory || null;
  }
  function setCurrentTheory(theory){
    try { curTheory = theory; } catch (_err) {}
    root.curTheory = theory || null;
  }
  function getSeenMap(){
    try { if (typeof seenQs !== 'undefined' && seenQs && typeof seenQs === 'object') return seenQs; } catch (_err) {}
    return root.seenQs && typeof root.seenQs === 'object' ? root.seenQs : null;
  }
  function getStats(){
    try { if (typeof st !== 'undefined' && st && typeof st === 'object') return st; } catch (_err) {}
    return root.st && typeof root.st === 'object' ? root.st : null;
  }
  function getMixStreak(){
    try { if (typeof mixStreak !== 'undefined') return mixStreak; } catch (_err) {}
    return root.mixStreak || null;
  }
  function setMixStreak(next){
    try { mixStreak = next; } catch (_err) {}
    root.mixStreak = next;
  }
  function isRushMode(){
    try { if (typeof rushMode !== 'undefined') return !!rushMode; } catch (_err) {}
    return !!root.rushMode;
  }
  function isDiagMode(){
    try { if (typeof diagMode !== 'undefined') return !!diagMode; } catch (_err) {}
    return !!root.diagMode;
  }
  function isGlobalMixMode(){
    try { if (typeof globalMix !== 'undefined') return !!globalMix; } catch (_err) {}
    return !!root.globalMix;
  }
  function isMixMode(){
    try { if (typeof mix !== 'undefined') return !!mix; } catch (_err) {}
    return !!root.mix;
  }
  function timingRuntime(){
    return root.__wave87xInputTimingRuntime && typeof root.__wave87xInputTimingRuntime.readStore === 'function'
      ? root.__wave87xInputTimingRuntime
      : null;
  }
  function timingRows(){
    var rt = timingRuntime();
    if (!rt) return [];
    if (timingCache.key === gradeKey() && timingCache.rows.length) return timingCache.rows.slice();
    var data = rt.readStore();
    var rows = Array.isArray(data && data.samples) ? data.samples.filter(function(item){
      return item && item.mode === 'train';
    }) : [];
    timingCache.key = gradeKey();
    timingCache.rows = rows.slice();
    return rows.slice();
  }
  function invalidateTimingCache(){ timingCache.key = ''; timingCache.rows = []; }
  function emptyBucketStats(){ return { asked:0, correct:0, totalMs:0 }; }
  function contextKey(subjectId, topicId, topicName){
    var sid = asText(subjectId || 'global') || 'global';
    var tid = asText(topicId || ('tag:' + normalizeText(topicName || 'misc')));
    return sid + '::' + tid;
  }
  function normalizeProfile(profile, context){
    var ctx = context || {};
    var out = profile && typeof profile === 'object' ? clone(profile) : {};
    out.subjectId = asText(out.subjectId || ctx.subjectId);
    out.topicId = asText(out.topicId || ctx.topicId);
    out.subjectName = asText(out.subjectName || ctx.subjectName);
    out.topicName = asText(out.topicName || ctx.topicName);
    out.key = asText(out.key || ctx.key || contextKey(out.subjectId, out.topicId, out.topicName));
    out.asked = int(out.asked);
    out.correct = int(out.correct);
    out.wrong = int(out.wrong);
    out.helped = int(out.helped);
    out.totalMs = int(out.totalMs);
    out.lastMs = int(out.lastMs);
    out.lastTarget = bucketName(out.lastTarget || 'easy');
    out.lastBucket = bucketName(out.lastBucket || 'easy');
    out.level = clamp(out.level, 0, 2);
    out.updatedAt = int(out.updatedAt);
    out.recent = Array.isArray(out.recent) ? out.recent.map(function(item){ return item ? 1 : 0; }).slice(-12) : [];
    out.buckets = out.buckets && typeof out.buckets === 'object' ? out.buckets : {};
    LEVELS.forEach(function(bucket){
      var row = out.buckets[bucket] && typeof out.buckets[bucket] === 'object' ? out.buckets[bucket] : {};
      out.buckets[bucket] = {
        asked: int(row.asked),
        correct: int(row.correct),
        totalMs: int(row.totalMs)
      };
    });
    return out;
  }
  function safeFindTopicMeta(subjectId, topicTag){
    var normalizedTag = normalizeText(topicTag);
    var wantedSubject = normalizeText(subjectId);
    if (!normalizedTag) return null;
    if (typeof findTopicMeta === 'function') {
      try {
        var direct = findTopicMeta(subjectId, topicTag);
        if (direct && direct.topic) return direct;
      } catch (_err) {}
      try {
        var loose = findTopicMeta(topicTag);
        if (loose && loose.topic) {
          if (!wantedSubject || normalizeText(loose.subj && loose.subj.id) === wantedSubject) return loose;
        }
      } catch (_err2) {}
    }
    var allSubjects = Array.isArray(root.SUBJ) ? root.SUBJ : [];
    var fallback = null;
    for (var s = 0; s < allSubjects.length; s++) {
      var subject = allSubjects[s];
      if (!subject || !Array.isArray(subject.tops)) continue;
      if (wantedSubject && normalizeText(subject.id) !== wantedSubject) continue;
      for (var t = 0; t < subject.tops.length; t++) {
        var topic = subject.tops[t];
        if (!topic) continue;
        var name = normalizeText(topic.nm || topic.name || topic.id);
        var id = normalizeText(topic.id);
        if (name === normalizedTag || id === normalizedTag) return { subj:subject, topic:topic };
        if (!fallback && (name.indexOf(normalizedTag) >= 0 || normalizedTag.indexOf(name) >= 0 || id === normalizedTag)) {
          fallback = { subj:subject, topic:topic };
        }
      }
    }
    return fallback;
  }
  function inferContext(question, subjectRef, topicRef){
    var subject = subjectRef || getCurrentSubject();
    var topic = topicRef || getCurrentTopic();
    var tag = asText(question && (question.tag || question.topic || question.topicName));
    if ((!topic || !topic.id) && tag) {
      var meta = safeFindTopicMeta(subject && subject.id, tag);
      if (meta && meta.topic) {
        if (!subject) subject = meta.subj || subject;
        topic = meta.topic;
      }
    }
    if (!subject && topic && Array.isArray(root.SUBJ)) {
      root.SUBJ.some(function(candidate){
        if (!candidate || !Array.isArray(candidate.tops)) return false;
        var found = candidate.tops.some(function(row){ return row === topic; });
        if (found) subject = candidate;
        return found;
      });
    }
    var subjectId = asText(subject && subject.id);
    var topicId = asText(topic && topic.id);
    var topicName = asText(topic && topic.nm) || tag || 'Тема';
    return {
      subjectId: subjectId,
      subjectName: asText(subject && subject.nm),
      topicId: topicId || ('tag:' + normalizeText(topicName)),
      topicName: topicName,
      key: contextKey(subjectId, topicId, topicName)
    };
  }
  function readProfile(context){
    var ctx = context || {};
    var store = safeReadStore();
    return normalizeProfile(store.topics[ctx.key], ctx);
  }
  function writeProfile(profile, context){
    var ctx = context || profile || {};
    var store = safeReadStore();
    var next = normalizeProfile(profile, ctx);
    store.topics[next.key] = next;
    safeWriteStore(store);
    return next;
  }
  function recentAccuracy(profile, size){
    var rows = Array.isArray(profile && profile.recent) ? profile.recent.slice(-Math.max(1, int(size) || 6)) : [];
    if (!rows.length) return profile && profile.asked ? profile.correct / Math.max(1, profile.asked) : 0;
    var ok = rows.filter(Boolean).length;
    return ok / rows.length;
  }
  function averageMs(profile){
    return profile && profile.asked ? profile.totalMs / Math.max(1, profile.asked) : 0;
  }
  function timingSummary(context){
    var ctx = context || {};
    var rows = timingRows();
    var subjectId = normalizeText(ctx.subjectId);
    var topicName = normalizeText(ctx.topicName);
    var filtered = rows.filter(function(item){
      if (!item) return false;
      if (subjectId && normalizeText(item.subject) !== subjectId) return false;
      if (topicName && normalizeText(item.tag) !== topicName) return false;
      return true;
    }).slice(-12);
    var totalMs = 0;
    var ok = 0;
    filtered.forEach(function(item){ totalMs += num(item.ms); if (item.correct) ok += 1; });
    return {
      count: filtered.length,
      avgMs: filtered.length ? totalMs / filtered.length : 0,
      correctPct: filtered.length ? Math.round(ok / filtered.length * 100) : 0
    };
  }
  function recommendBaseLevel(profile, context){
    var p = normalizeProfile(profile, context);
    var timing = timingSummary(context || p);
    if (!p.asked) {
      if (timing.count >= 10 && timing.correctPct >= 84 && (!timing.avgMs || timing.avgMs <= 17000)) return 1;
      if (timing.count >= 6 && timing.correctPct >= 74 && (!timing.avgMs || timing.avgMs <= 22000)) return 1;
      return 0;
    }
    var recent6 = recentAccuracy(p, 6);
    var recent8 = recentAccuracy(p, 8);
    var avgMsValue = timing.count ? timing.avgMs : averageMs(p);
    var mediumAcc = p.buckets.medium.asked ? p.buckets.medium.correct / Math.max(1, p.buckets.medium.asked) : recent6;
    var hardAcc = p.buckets.hard.asked ? p.buckets.hard.correct / Math.max(1, p.buckets.hard.asked) : recent8;
    var level = 0;
    if (p.asked >= 7 && recent6 >= 0.72 && (!avgMsValue || avgMsValue <= 22000)) level = 1;
    if (timing.count >= 8 && timing.correctPct >= 82 && (!timing.avgMs || timing.avgMs <= 18000)) level = Math.max(level, 1);
    if (p.asked >= 18 && recent8 >= 0.82 && mediumAcc >= 0.72 && (!avgMsValue || avgMsValue <= 17000)) level = 2;
    if (p.buckets.hard.asked >= 5 && hardAcc < 0.55) level = Math.min(level, 1);
    if (p.asked >= 4 && recent6 <= 0.45) level = 0;
    if (timing.count >= 8 && timing.correctPct <= 55 && timing.avgMs >= 26000) level = 0;
    if (avgMsValue >= 30000 && recent6 < 0.65) level = Math.max(0, level - 1);
    return clamp(level, 0, 2);
  }
  function effectiveTargetLevel(profile, context){
    var baseLevel = recommendBaseLevel(profile, context);
    return clamp(baseLevel + state.shift, 0, 2);
  }
  function effectiveTargetBucket(profile, context){ return levelBucket(effectiveTargetLevel(profile, context)); }
  function questionSeenCount(question){
    var seen = getSeenMap();
    if (!seen) return 0;
    var key = asText(question && question.question) + asText(question && question.answer);
    return int(seen[key]);
  }
  function slowThreshold(bucket){
    if (bucket === 'hard') return 30000;
    if (bucket === 'medium') return 22000;
    return 16000;
  }
  function applyOutcome(profile, context, outcome){
    var previous = normalizeProfile(profile, context);
    var previousTarget = effectiveTargetLevel(previous, context);
    var p = normalizeProfile(profile, context);
    var bucket = bucketName(outcome && outcome.bucket);
    var correct = !!(outcome && outcome.correct);
    var helped = !!(outcome && outcome.usedHelp);
    var ms = Math.max(0, int(outcome && outcome.ms));
    var slow = !!(ms && ms > slowThreshold(bucket));

    p.asked += 1;
    p.correct += correct ? 1 : 0;
    p.wrong += correct ? 0 : 1;
    p.helped += helped ? 1 : 0;
    p.totalMs += ms;
    p.lastMs = ms;
    p.lastTarget = bucketName(outcome && outcome.target);
    p.lastBucket = bucket;
    p.updatedAt = Date.now();
    p.recent.push(correct ? 1 : 0);
    if (p.recent.length > 12) p.recent = p.recent.slice(-12);
    p.buckets[bucket].asked += 1;
    p.buckets[bucket].correct += correct ? 1 : 0;
    p.buckets[bucket].totalMs += ms;

    state.answers += 1;
    if (correct && !helped) {
      state.correctRun += 1;
      state.troubleRun = 0;
    } else {
      state.correctRun = 0;
      state.troubleRun += 1;
    }
    state.slowRun = slow ? state.slowRun + 1 : 0;
    state.lastChange = 0;
    state.lastReason = '';

    var nextBaseLevel = recommendBaseLevel(p, context);
    if (state.correctRun >= SESSION_STREAK_TRIGGER && previousTarget < 2) {
      state.shift = clamp((previousTarget + 1) - nextBaseLevel, SESSION_SHIFT_MIN, SESSION_SHIFT_MAX);
      state.correctRun = 0;
      state.troubleRun = 0;
      state.slowRun = 0;
      state.lastChange = 1;
      state.lastReason = '5 верных подряд — повышаем сложность на один шаг';
    } else if ((state.troubleRun >= SESSION_TROUBLE_TRIGGER || helped) && previousTarget > 0) {
      state.shift = clamp((previousTarget - 1) - nextBaseLevel, SESSION_SHIFT_MIN, SESSION_SHIFT_MAX);
      state.troubleRun = 0;
      state.slowRun = 0;
      state.lastChange = -1;
      state.lastReason = 'серия ошибок или помощь — временно упрощаем на один шаг';
    } else if (state.slowRun >= SESSION_SLOW_TRIGGER && previousTarget > 0) {
      state.shift = clamp((previousTarget - 1) - nextBaseLevel, SESSION_SHIFT_MIN, SESSION_SHIFT_MAX);
      state.slowRun = 0;
      state.lastChange = -1;
      state.lastReason = 'ответы идут слишком медленно — снижаем нагрузку на один шаг';
    }

    p.level = nextBaseLevel;
    state.lastTarget = levelBucket(clamp(nextBaseLevel + state.shift, 0, 2));
    state.lastBucket = bucket;
    return normalizeProfile(p, context);
  }
  function levelCountSummary(){
    var store = safeReadStore();
    var counts = { easy:0, medium:0, hard:0 };
    Object.keys(store.topics || {}).forEach(function(key){
      var profile = normalizeProfile(store.topics[key], store.topics[key]);
      profile.level = recommendBaseLevel(profile, profile);
      counts[levelBucket(profile.level)] += 1;
    });
    return counts;
  }
  function buildSummary(){
    var store = safeReadStore();
    var profiles = Object.keys(store.topics || {}).map(function(key){
      var profile = normalizeProfile(store.topics[key], store.topics[key]);
      profile.level = recommendBaseLevel(profile, profile);
      return profile;
    }).filter(function(profile){ return profile.asked > 0; });
    profiles.sort(function(a, b){ return int(b.updatedAt) - int(a.updatedAt); });
    return {
      totalTopics: profiles.length,
      counts: levelCountSummary(),
      latest: profiles.slice(0, 5)
    };
  }
  function randomItem(list){
    var rows = Array.isArray(list) ? list : [];
    return rows.length ? rows[Math.floor(Math.random() * rows.length)] : null;
  }
  function finalizeQuestion(raw){
    var question = raw;
    try {
      if (typeof prepareQuestion === 'function') question = prepareQuestion(raw);
      else if (typeof root.prepareQuestion === 'function') question = root.prepareQuestion(raw);
    } catch (_err) {}
    if (question && typeof question === 'object') {
      var bucket = difficultyOf(question);
      question.difficulty = bucket;
      question.diffBucket = bucket;
      question.difficultyLevel = levelNumber(bucket);
      question.difficultyLabel = bucket;
    }
    return question;
  }
  function candidateScore(candidate, seenMap, forcedTargetLevel){
    var context = candidate && candidate.context ? candidate.context : inferContext(candidate && candidate.raw, candidate && candidate.subject, candidate && candidate.topic);
    var profile = readProfile(context);
    var targetLevel = forcedTargetLevel == null ? effectiveTargetLevel(profile, context) : clamp(forcedTargetLevel, 0, 2);
    var bucket = difficultyOf(candidate && candidate.raw);
    var questionLevel = bucketLevel(bucket);
    var key = asText(candidate && candidate.raw && candidate.raw.question) + asText(candidate && candidate.raw && candidate.raw.answer);
    var seenCount = seenMap && typeof seenMap === 'object' ? int(seenMap[key]) : questionSeenCount(candidate && candidate.raw);
    var score = 12 - Math.abs(questionLevel - targetLevel) * 5;
    if (seenCount === 0) score += 3;
    else if (seenCount === 1) score += 1;
    else score -= Math.min(6, seenCount * 2);
    if (profile.asked < 4 && questionLevel === 0) score += 1;
    if (profile.asked >= 12 && targetLevel === 2 && questionLevel === 2) score += 1;
    if (profile.asked >= 8 && targetLevel === 1 && questionLevel === 1) score += 1;
    return {
      score: score,
      seenCount: seenCount,
      targetLevel: targetLevel,
      targetBucket: levelBucket(targetLevel),
      bucket: bucket,
      context: context,
      profile: profile
    };
  }
  function selectCandidateFromPool(pool, seenMap, forcedTargetLevel){
    var list = Array.isArray(pool) ? pool.filter(function(item){ return item && item.raw; }) : [];
    if (!list.length) return null;
    var best = null;
    list.forEach(function(candidate, index){
      var scored = candidateScore(candidate, seenMap, forcedTargetLevel);
      var scoredCandidate = Object.assign({ index:index }, candidate, scored);
      if (!best || scoredCandidate.score > best.score || (scoredCandidate.score === best.score && scoredCandidate.seenCount < best.seenCount)) {
        best = scoredCandidate;
      }
    });
    return best;
  }
  function snapshotGlobalMix(){
    return {
      subject: getCurrentSubject(),
      topic: getCurrentTopic(),
      theory: getCurrentTheory(),
      mixStreak: clone(getMixStreak())
    };
  }
  function restoreGlobalMix(snapshot){
    if (!snapshot) return;
    setCurrentSubject(snapshot.subject || null);
    setCurrentTopic(snapshot.topic || null);
    setCurrentTheory(snapshot.theory || null);
    setMixStreak(snapshot.mixStreak || null);
  }
  function generateTopicCandidates(subject, topic, limit){
    var out = [];
    if (!topic || typeof topic.gen !== 'function') return out;
    for (var i = 0; i < limit; i++) {
      try {
        var raw = topic.gen();
        if (!raw || typeof raw !== 'object') continue;
        out.push({ raw:raw, subject:subject, topic:topic, context: inferContext(raw, subject, topic) });
      } catch (_err) {}
    }
    return out;
  }
  function generateMixedCandidates(subject, limit){
    var out = [];
    var topics = subject && Array.isArray(subject.tops) ? subject.tops.filter(function(topic){ return topic && typeof topic.gen === 'function'; }) : [];
    for (var i = 0; i < limit; i++) {
      var topic = randomItem(topics);
      if (!topic) break;
      try {
        var raw = topic.gen();
        if (!raw || typeof raw !== 'object') continue;
        out.push({ raw:raw, subject:subject, topic:topic, context: inferContext(raw, subject, topic) });
      } catch (_err) {}
    }
    return out;
  }
  function generateGlobalMixCandidates(limit){
    var out = [];
    if (typeof genGlobalMix !== 'function' && typeof root.genGlobalMix !== 'function') return out;
    var picker = typeof genGlobalMix === 'function' ? genGlobalMix : root.genGlobalMix;
    for (var i = 0; i < limit; i++) {
      var snapshot = snapshotGlobalMix();
      try {
        var raw = picker();
        var subject = getCurrentSubject();
        var topic = null;
        var tag = asText(raw && (raw.tag || raw.topic || raw.topicName));
        if (subject && tag) {
          topic = safeFindTopicMeta(subject.id, tag);
          topic = topic && topic.topic ? topic.topic : null;
        }
        var theoryAfter = getCurrentTheory();
        var mixStateAfter = clone(getMixStreak());
        restoreGlobalMix(snapshot);
        if (!raw || typeof raw !== 'object') continue;
        out.push({
          raw: raw,
          subject: subject,
          topic: topic,
          theoryAfter: theoryAfter,
          mixStateAfter: mixStateAfter,
          context: inferContext(raw, subject, topic)
        });
      } catch (_err) {
        restoreGlobalMix(snapshot);
      }
    }
    return out;
  }
  function gatherCandidates(limit){
    var count = Math.max(6, int(limit) || CANDIDATE_COUNT);
    if (isGlobalMixMode()) return generateGlobalMixCandidates(count);
    var subject = getCurrentSubject();
    if (isMixMode()) return generateMixedCandidates(subject, count);
    var topic = getCurrentTopic();
    if (topic && typeof topic.gen === 'function') return generateTopicCandidates(subject, topic, count);
    return [];
  }
  function shouldDelegateNextQ(){
    if (isRushMode() || isDiagMode()) return true;
    if (Array.isArray(root.__wave21QuestionQueue)) return true;
    if (root.__wave28CurrentReviewKey) return true;
    if (root.__wave21SessionMode === 'error-review') return true;
    if (root.wave28Debug && typeof root.wave28Debug.isReviewMode === 'function' && root.wave28Debug.isReviewMode()) return true;
    return false;
  }
  function noteText(){
    if (state.lastReason) return state.lastReason;
    if (state.lastChange > 0) return 'Серия идёт уверенно — поднимаем сложность на один шаг.';
    if (state.lastChange < 0) return 'Ошибки или медленные ответы — временно снижаем сложность на один шаг.';
    return 'Движок учитывает точность по теме и время ответа, включая накопленные тайминг-сэмплы: вопросы уже тегированы по уровням 1–3, после 5 уверенных верных подряд сложность растёт на один шаг, после серии ошибок или медленных ответов временно снижается.';
  }
  function onPlayScreen(){
    var screen = document.getElementById('s-play');
    return !!(screen && screen.classList && screen.classList.contains('on'));
  }
  function percentage(ok, total){
    return total ? Math.round(num(ok) / Math.max(1, num(total)) * 100) : 0;
  }
  function formatSeconds(ms){
    if (!ms) return '—';
    var sec = Math.max(0, num(ms)) / 1000;
    var digits = sec < 10 ? 1 : 0;
    return sec.toFixed(digits).replace('.', ',') + ' с';
  }
  function removePlayCard(){
    var existing = document.querySelector ? document.querySelector('[' + PLAY_ATTR + ']') : null;
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }
  function renderPlayCard(){
    if (!onPlayScreen() || shouldDelegateNextQ()) { removePlayCard(); return; }
    var question = getCurrentQuestion();
    if (!question) { removePlayCard(); return; }
    var context = inferContext(question);
    var profile = readProfile(context);
    var target = effectiveTargetBucket(profile, context);
    var bucket = difficultyOf(question);
    state.lastTarget = target;
    state.lastBucket = bucket;

    var qcard = document.getElementById('qc');
    var host = qcard && qcard.parentNode ? qcard.parentNode : document.getElementById('pa');
    if (!host) return;
    var card = host.querySelector ? host.querySelector('[' + PLAY_ATTR + ']') : null;
    if (!card) {
      card = document.createElement('div');
      card.className = 'wave89m-adaptive-card';
      card.setAttribute(PLAY_ATTR, '1');
      if (qcard && host.insertBefore) host.insertBefore(card, qcard);
      else host.appendChild(card);
    }
    card.innerHTML = '';

    var title = document.createElement('div');
    title.className = 'wave89m-adaptive-title';
    title.textContent = '🎚 Адаптивная сложность';
    card.appendChild(title);

    var chips = document.createElement('div');
    chips.className = 'wave89m-adaptive-chips';
    [
      'цель: ' + levelNumber(target) + '/3 · ' + levelLabel(target),
      'вопрос: ' + levelNumber(bucket) + '/3 · ' + levelLabel(bucket),
      'серия: ' + state.correctRun,
      'ответов: ' + profile.asked
    ].forEach(function(text){
      var chip = document.createElement('span');
      chip.className = 'wave89m-adaptive-chip';
      chip.textContent = text;
      chips.appendChild(chip);
    });
    if (state.lastChange > 0 || state.lastChange < 0) {
      var deltaChip = document.createElement('span');
      deltaChip.className = 'wave89m-adaptive-chip';
      deltaChip.textContent = state.lastChange > 0 ? '↑ усложняем' : '↓ упрощаем';
      chips.appendChild(deltaChip);
    }
    card.appendChild(chips);

    var note = document.createElement('div');
    note.className = 'wave89m-adaptive-note';
    note.textContent = noteText();
    card.appendChild(note);
  }
  function appendProgressCard(){
    var host = document.getElementById('prog-content');
    if (!host) return;
    var old = host.querySelector ? host.querySelector('[' + PROGRESS_ATTR + ']') : null;
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var summary = buildSummary();
    if (!summary.totalTopics) return;

    var card = document.createElement('div');
    card.className = 'rcard wave89m-adaptive-card';
    card.setAttribute(PROGRESS_ATTR, '1');

    var title = document.createElement('h3');
    title.className = 'wave89m-adaptive-title';
    title.textContent = '🎚 Адаптивная сложность';
    card.appendChild(title);

    var note = document.createElement('div');
    note.className = 'wave89m-adaptive-note';
    note.textContent = 'Движок подстраивает сложность по теме по точности и времени ответа. После 5 уверенных верных подряд целевой уровень повышается на один шаг; после серии ошибок, подсказок или медленных ответов временно снижается.';
    card.appendChild(note);

    var chips = document.createElement('div');
    chips.className = 'wave89m-adaptive-chips';
    [
      'уровень 1: ' + summary.counts.easy,
      'уровень 2: ' + summary.counts.medium,
      'уровень 3: ' + summary.counts.hard,
      'профилей: ' + summary.totalTopics
    ].forEach(function(text){
      var chip = document.createElement('span');
      chip.className = 'wave89m-adaptive-chip';
      chip.textContent = text;
      chips.appendChild(chip);
    });
    card.appendChild(chips);

    if (summary.latest && summary.latest.length) {
      var list = document.createElement('ol');
      list.className = 'wave89m-adaptive-list';
      summary.latest.forEach(function(profile){
        var li = document.createElement('li');
        var avg = averageMs(profile);
        li.textContent = (profile.subjectName || 'Предмет') + ' → ' + (profile.topicName || 'Тема')
          + ' — ур. ' + levelNumber(profile.level) + ' · ' + levelLabel(profile.level)
          + ' · ' + percentage(profile.correct, profile.asked) + '%'
          + (avg ? ' · ' + formatSeconds(avg) : '');
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    var secondChild = host.children && host.children[1] ? host.children[1] : null;
    if (secondChild) host.insertBefore(card, secondChild);
    else host.appendChild(card);
  }
  function resetState(){
    state.active = !isRushMode() && !isDiagMode();
    state.shift = 0;
    state.correctRun = 0;
    state.troubleRun = 0;
    state.slowRun = 0;
    state.answers = 0;
    state.lastReason = '';
    state.lastChange = 0;
    state.lastTarget = 'easy';
    state.lastBucket = 'easy';
    state.sessionMode = isGlobalMixMode() ? 'global-mix' : (isMixMode() ? 'subject-mix' : (getCurrentTopic() ? 'topic' : 'idle'));
  }
  function setSeen(question){
    var seen = getSeenMap();
    if (!seen || !question) return;
    var key = asText(question.question) + asText(question.answer);
    seen[key] = int(seen[key]) + 1;
  }
  function applyCandidate(candidate){
    if (!candidate || !candidate.raw) return false;
    var question = finalizeQuestion(candidate.raw);
    if (!question) return false;

    if (isGlobalMixMode()) {
      if (candidate.subject) setCurrentSubject(candidate.subject);
      setCurrentTopic(null);
      if (candidate.topic) setCurrentTheory(candidate.topic.th || candidate.theoryAfter || null);
      else setCurrentTheory(candidate.theoryAfter || null);
      if (candidate.mixStateAfter) setMixStreak(candidate.mixStateAfter);
    } else if (isMixMode()) {
      if (candidate.subject) setCurrentSubject(candidate.subject);
      setCurrentTopic(null);
      if (candidate.topic && candidate.topic.th) setCurrentTheory(candidate.topic.th);
    } else {
      if (candidate.subject) setCurrentSubject(candidate.subject);
      if (candidate.topic) {
        setCurrentTopic(candidate.topic);
        if (candidate.topic.th) setCurrentTheory(candidate.topic.th);
      }
    }

    setCurrentQuestion(question);
    setSeen(question);
    setSelection(null);
    setHintState(false);
    setTheoryState(false);
    setHelpState(false);
    state.active = true;
    state.lastTarget = candidate.targetBucket || difficultyOf(question);
    state.lastBucket = difficultyOf(question);
    if (typeof render === 'function') render();
    try { root.scrollTo({ top:0, behavior:'smooth' }); } catch (_err) {}
    return true;
  }
  function recordOutcome(contextOrQuestion, outcome){
    var context = null;
    if (contextOrQuestion && contextOrQuestion.key) context = contextOrQuestion;
    else if (contextOrQuestion && contextOrQuestion.raw) context = contextOrQuestion.context || inferContext(contextOrQuestion.raw, contextOrQuestion.subject, contextOrQuestion.topic);
    else context = inferContext(contextOrQuestion || getCurrentQuestion());
    var profile = applyOutcome(readProfile(context), context, outcome || {});
    writeProfile(profile, context);
    invalidateTimingCache();
    return {
      profile: profile,
      state: clone(state),
      summary: buildSummary()
    };
  }

  var baseStartQuiz = typeof root.startQuiz === 'function' ? root.startQuiz : null;
  if (baseStartQuiz) {
    root.startQuiz = function(){
      resetState();
      return baseStartQuiz.apply(this, arguments);
    };
  }

  var baseNextQ = typeof root.nextQ === 'function' ? root.nextQ : null;
  if (baseNextQ) {
    root.nextQ = function(){
      if (shouldDelegateNextQ()) return baseNextQ.apply(this, arguments);
      var candidates = gatherCandidates(CANDIDATE_COUNT);
      var chosen = selectCandidateFromPool(candidates, getSeenMap(), null);
      if (!chosen || !applyCandidate(chosen)) return baseNextQ.apply(this, arguments);
      return true;
    };
  }

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(){
      var question = getCurrentQuestion();
      var hadSelection = getSelection() != null;
      var result = baseAns.apply(this, arguments);
      try {
        if (!question || hadSelection || shouldDelegateNextQ()) return result;
        if (getSelection() == null) return result;
        var sample = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
        recordOutcome(question, {
          correct: asText(getSelection()) === asText(question.answer),
          usedHelp: getUsedHelp(),
          ms: sample && sample.ms ? num(sample.ms) : 0,
          bucket: difficultyOf(question),
          target: state.lastTarget || difficultyOf(question)
        });
      } catch (_err) {}
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try { renderPlayCard(); } catch (_err) {}
      return result;
    };
  }

  var baseRenderProg = typeof root.renderProg === 'function' ? root.renderProg : null;
  if (baseRenderProg) {
    root.renderProg = function(){
      var result = baseRenderProg.apply(this, arguments);
      try { appendProgressCard(); } catch (_err) {}
      return result;
    };
  }

  var baseEndSession = typeof root.endSession === 'function' ? root.endSession : null;
  if (baseEndSession) {
    root.endSession = function(){
      state.active = false;
      return baseEndSession.apply(this, arguments);
    };
  }

  root.__wave89mAdaptiveDifficulty = {
    version: 'wave89m',
    storageKey: storageKey,
    readStore: safeReadStore,
    writeStore: safeWriteStore,
    readProfile: readProfile,
    writeProfile: writeProfile,
    inferContext: inferContext,
    difficultyOf: difficultyOf,
    bucketLevel: bucketLevel,
    levelBucket: levelBucket,
    levelNumber: levelNumber,
    levelLabel: levelLabel,
    timingSummary: timingSummary,
    invalidateTimingCache: invalidateTimingCache,
    recommendBaseLevel: recommendBaseLevel,
    effectiveTargetBucket: effectiveTargetBucket,
    selectCandidateFromPool: selectCandidateFromPool,
    candidateScore: candidateScore,
    applyOutcome: applyOutcome,
    recordOutcome: recordOutcome,
    buildSummary: buildSummary,
    resetSession: resetState,
    clear: function(){ try { if (root.localStorage) root.localStorage.removeItem(storageKey()); } catch (_err) {} resetState(); invalidateTimingCache(); },
    currentState: function(){ return clone(state); },
    noteText: noteText
  };
})();


/* wave89n: guided learning path */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89nLearningPath) return;

  var root = window;
  var STORAGE_PREFIX = 'trainer_learning_path_';
  var THEORY_ATTR = 'data-wave89n-theory-card';
  var PLAY_ATTR = 'data-wave89n-play-card';
  var PROGRESS_ATTR = 'data-wave89n-progress-card';
  var STAGE_ORDER = ['theory', 'example', 'easy', 'medium', 'hard'];
  var STAGE_LABELS = {
    theory: 'Теория',
    example: 'Пример',
    easy: 'Лёгкое',
    medium: 'Среднее',
    hard: 'Сложное'
  };
  var STAGE_ICONS = {
    theory: '📖',
    example: '🧪',
    easy: '🟢',
    medium: '🟠',
    hard: '🔴'
  };
  var state = {
    active: false,
    phase: 'idle',
    topicKey: '',
    subjectId: '',
    topicId: '',
    currentStage: '',
    stageResults: {},
    example: null,
    lastCompletedTopicKey: '',
    completionCounted: false,
    lastPlanStages: []
  };
  var cache = {};

  function asText(value){ return String(value == null ? '' : value); }
  function cleanText(value){ return asText(value).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim(); }
  function norm(value){ return cleanText(value).toLowerCase().replace(/ё/g, 'е'); }
  function num(value){ var out = Number(value); return isFinite(out) ? out : 0; }
  function clone(value){ try { return JSON.parse(JSON.stringify(value)); } catch (_err) { return value; } }
  function esc(value){ return asText(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function safeJSON(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch (_err) { return fallback; } }
  function uniqText(list){
    var seen = {};
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = cleanText(item);
      if (!value) return;
      var key = norm(value);
      if (seen[key]) return;
      seen[key] = true;
      out.push(value);
    });
    return out;
  }
  function gradeKey(){ return String(root.GRADE_NUM || root.GRADE_NO || ''); }
  function storageKey(){ return STORAGE_PREFIX + gradeKey(); }
  function currentSubject(){ try { if (typeof cS !== 'undefined') return cS; } catch (_err) {} return root.cS || null; }
  function currentTopic(){ try { if (typeof cT !== 'undefined') return cT; } catch (_err) {} return root.cT || null; }
  function currentQuestion(){ try { if (typeof prob !== 'undefined') return prob; } catch (_err) {} return root.prob || null; }
  function currentSelection(){ try { if (typeof sel !== 'undefined') return sel; } catch (_err) {} return root.sel; }
  function usedHelpState(){ try { if (typeof usedHelp !== 'undefined') return !!usedHelp; } catch (_err) {} return !!root.usedHelp; }
  function activeScreen(screenId){
    var node = root.document && root.document.getElementById ? root.document.getElementById(screenId) : null;
    var cls = cleanText(node && node.className);
    return !!node && /(^|\s)on($|\s)/.test(cls);
  }
  function removeByAttr(attr){
    if (!root.document || !root.document.querySelectorAll) return;
    Array.prototype.slice.call(root.document.querySelectorAll('[' + attr + ']')).forEach(function(node){
      if (node && typeof node.remove === 'function') node.remove();
      else if (node && node.parentNode && typeof node.parentNode.removeChild === 'function') node.parentNode.removeChild(node);
    });
  }
  function readStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem(storageKey());
      var data = safeJSON(raw, { version:'wave89n', grade:gradeKey(), topics:{} });
      if (!data || typeof data !== 'object') data = { version:'wave89n', grade:gradeKey(), topics:{} };
      if (!data.topics || typeof data.topics !== 'object') data.topics = {};
      return data;
    } catch (_err) {
      return { version:'wave89n', grade:gradeKey(), topics:{} };
    }
  }
  function writeStore(data){
    try {
      if (!root.localStorage) return false;
      root.localStorage.setItem(storageKey(), JSON.stringify({
        version: 'wave89n',
        grade: gradeKey(),
        updatedAt: Date.now(),
        topics: data && data.topics && typeof data.topics === 'object' ? data.topics : {}
      }));
      return true;
    } catch (_err) {
      return false;
    }
  }
  function progressStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem('trainer_progress_' + gradeKey());
      var data = safeJSON(raw, {});
      return data && typeof data === 'object' ? data : {};
    } catch (_err) {
      return {};
    }
  }
  function topicAttempts(subjectId, topicId){
    var progress = progressStore();
    var subj = progress && progress[subjectId];
    var row = subj && subj[topicId];
    return row ? (num(row.ok) + num(row.err)) : 0;
  }
  function topicKey(subject, topic){
    var sid = cleanText(subject && subject.id);
    var tid = cleanText(topic && topic.id);
    return sid + '::' + tid;
  }
  function defaultRecord(subject, topic){
    return {
      subjectId: cleanText(subject && subject.id),
      topicId: cleanText(topic && topic.id),
      subjectName: cleanText(subject && subject.nm),
      topicName: cleanText(topic && topic.nm),
      startedRuns: 0,
      completedRuns: 0,
      stageStats: {},
      lastStage: '',
      lastPath: [],
      lastRunAt: 0,
      theorySeenAt: 0,
      exampleSeenAt: 0,
      lastExample: null
    };
  }
  function updateRecord(subject, topic, mutator){
    if (!subject || !topic) return null;
    var store = readStore();
    var key = topicKey(subject, topic);
    var record = store.topics[key] && typeof store.topics[key] === 'object' ? store.topics[key] : defaultRecord(subject, topic);
    if (typeof mutator === 'function') mutator(record);
    record.subjectId = cleanText(subject.id);
    record.topicId = cleanText(topic.id);
    record.subjectName = cleanText(subject.nm);
    record.topicName = cleanText(topic.nm);
    record.updatedAt = Date.now();
    store.topics[key] = record;
    writeStore(store);
    return clone(record);
  }
  function readRecord(subject, topic){
    if (!subject || !topic) return null;
    var store = readStore();
    var key = topicKey(subject, topic);
    var record = store.topics[key] && typeof store.topics[key] === 'object' ? store.topics[key] : defaultRecord(subject, topic);
    store.topics[key] = record;
    return clone(record);
  }
  function difficultyApi(){
    return root.__wave89mAdaptiveDifficulty && typeof root.__wave89mAdaptiveDifficulty.difficultyOf === 'function'
      ? root.__wave89mAdaptiveDifficulty
      : null;
  }
  function difficultyOf(question){
    var api = difficultyApi();
    if (api) return api.difficultyOf(question);
    var raw = norm(question && (question.diffBucket || question.difficulty || question.difficultyLabel || question.level || 'medium'));
    if (raw === 'hard' || raw === '3') return 'hard';
    if (raw === 'easy' || raw === '1') return 'easy';
    return 'medium';
  }
  function questionKey(question){
    return norm(question && question.question) + '||' + norm(question && question.answer);
  }
  function finalizeQuestion(raw, subject, topic){
    if (!raw || typeof raw !== 'object') return null;
    var question = clone(raw) || {};
    if (question.question == null && question.q != null) question.question = question.q;
    if (question.answer == null && question.a != null) question.answer = question.a;
    if (question.options == null) question.options = question.opts != null ? question.opts : question.o;
    if (question.hint == null && question.h != null) question.hint = question.h;
    if (question.tag == null && question.topic != null) question.tag = question.topic;
    if (!question.tag && topic && topic.nm) question.tag = topic.nm;
    if (!question.color && subject && subject.cl) question.color = subject.cl;
    if (!question.bg && subject && subject.bg) question.bg = subject.bg;
    if (typeof root.prepareQuestion === 'function') {
      try { question = root.prepareQuestion(question) || question; } catch (_err) {}
    }
    if (question.answer == null) question.answer = '';
    question.answer = asText(question.answer);
    if (!Array.isArray(question.options) || !question.options.length) question.options = uniqText([question.answer, 'Вариант 2', 'Вариант 3', 'Вариант 4']).slice(0, 4);
    question.__subjectId = subject && subject.id ? subject.id : null;
    question.__topicId = topic && topic.id ? topic.id : null;
    return question;
  }
  function chooseExample(pool){
    var ordered = [];
    if (pool && pool.buckets) {
      ordered = ordered.concat(pool.buckets.easy || [], pool.buckets.medium || [], pool.buckets.hard || []);
    }
    var best = null;
    for (var i = 0; i < ordered.length; i += 1) {
      var item = ordered[i];
      if (!item) continue;
      if (!item.interactionType && !item.inputMode) return clone(item);
      if (!best) best = item;
    }
    return best ? clone(best) : null;
  }
  function sampleTopic(subject, topic){
    if (!subject || !topic || typeof topic.gen !== 'function') return null;
    var key = topicKey(subject, topic);
    if (cache[key] && cache[key].total >= 1) return clone(cache[key]);
    var buckets = { easy:[], medium:[], hard:[] };
    var all = [];
    var seen = {};
    var attempts = 0;
    while (attempts < 36 && all.length < 18) {
      attempts += 1;
      var raw = null;
      try { raw = topic.gen(); } catch (_err) { raw = null; }
      var question = finalizeQuestion(raw, subject, topic);
      if (!question || !cleanText(question.question) || !cleanText(question.answer)) continue;
      var keyQuestion = questionKey(question);
      if (seen[keyQuestion]) continue;
      seen[keyQuestion] = true;
      var bucket = difficultyOf(question);
      question.__wave89nStage = bucket;
      all.push(question);
      if (!buckets[bucket]) buckets[bucket] = [];
      buckets[bucket].push(question);
    }
    var pool = {
      key: key,
      sampledAt: Date.now(),
      total: all.length,
      buckets: {
        easy: clone(buckets.easy),
        medium: clone(buckets.medium),
        hard: clone(buckets.hard)
      },
      example: chooseExample({ buckets:buckets })
    };
    cache[key] = clone(pool);
    return clone(pool);
  }
  function buildGuidedPlan(subject, topic){
    var pool = sampleTopic(subject, topic);
    if (!pool) return null;
    var queue = new root.Array();
    var used = {};
    ['easy', 'medium', 'hard'].forEach(function(bucket){
      var list = pool.buckets && Array.isArray(pool.buckets[bucket]) ? pool.buckets[bucket] : [];
      for (var i = 0; i < list.length; i += 1) {
        var candidate = list[i];
        var keyQuestion = questionKey(candidate);
        if (used[keyQuestion]) continue;
        used[keyQuestion] = true;
        candidate = clone(candidate);
        candidate.__wave89nStage = bucket;
        queue.push(candidate);
        break;
      }
    });
    if (!queue.length && pool.example) {
      var fallback = clone(pool.example);
      fallback.__wave89nStage = difficultyOf(fallback);
      queue.push(fallback);
    }
    return {
      key: topicKey(subject, topic),
      example: pool.example ? clone(pool.example) : null,
      queue: queue,
      buckets: pool.buckets ? clone(pool.buckets) : { easy:[], medium:[], hard:[] },
      total: pool.total || queue.length,
      stageOrder: (function(){
        var stageOrder = new root.Array();
        queue.forEach(function(item){ stageOrder.push(item && item.__wave89nStage ? item.__wave89nStage : difficultyOf(item)); });
        return stageOrder;
      })()
    };
  }
  function shouldSeedForTopic(subject, topic){
    if (!subject || !topic) return false;
    if (root.mix || root.globalMix || root.rushMode || root.diagMode) return false;
    if (Array.isArray(root.__wave21QuestionQueue) && root.__wave21QuestionQueue.length) return false;
    if (root.__wave21SessionMode === 'error-review') return false;
    if (root.__wave28CurrentReviewKey) return false;
    var record = readRecord(subject, topic);
    if ((num(record.completedRuns) || 0) > 0) return false;
    return topicAttempts(subject.id, topic.id) === 0 || num(record.startedRuns) === 0;
  }
  function markTheory(subject, topic){
    return updateRecord(subject, topic, function(record){
      if (!record.theorySeenAt) record.theorySeenAt = Date.now();
    });
  }
  function markExample(subject, topic, example){
    return updateRecord(subject, topic, function(record){
      if (!record.exampleSeenAt) record.exampleSeenAt = Date.now();
      if (example) {
        record.lastExample = {
          question: cleanText(example.question).slice(0, 220),
          answer: cleanText(example.answer),
          bucket: difficultyOf(example)
        };
      }
    });
  }
  function recordStage(subject, topic, stage, outcome, question){
    if (!subject || !topic || !stage) return null;
    return updateRecord(subject, topic, function(record){
      record.stageStats = record.stageStats && typeof record.stageStats === 'object' ? record.stageStats : {};
      var row = record.stageStats[stage] && typeof record.stageStats[stage] === 'object'
        ? record.stageStats[stage]
        : { attempts:0, correct:0, wrong:0, helped:0, lastMs:0 };
      row.attempts += 1;
      if (outcome && outcome.correct) row.correct += 1;
      else row.wrong += 1;
      if (outcome && outcome.usedHelp) row.helped += 1;
      if (outcome && outcome.ms) row.lastMs = Math.round(num(outcome.ms));
      if (question && question.question) row.lastQuestion = cleanText(question.question).slice(0, 180);
      record.stageStats[stage] = row;
      record.lastStage = stage;
      record.lastRunAt = Date.now();
      if (stage === 'hard' && !state.completionCounted) {
        record.completedRuns = num(record.completedRuns) + 1;
        state.completionCounted = true;
      }
    });
  }
  function seedGuidedPath(subject, topic){
    var plan = buildGuidedPlan(subject, topic);
    if (!plan || !plan.queue || !plan.queue.length) return false;
    updateRecord(subject, topic, function(record){
      record.startedRuns = num(record.startedRuns) + 1;
      record.lastPath = plan.stageOrder.slice();
      record.lastRunAt = Date.now();
    });
    if (plan.example) markExample(subject, topic, plan.example);
    root.__wave21QuestionQueue = plan.queue.map(function(item){ return clone(item); });
    root.__wave21QuestionQueueTotal = plan.queue.length;
    root.__wave21SessionMode = 'learning-path';
    state.active = true;
    state.phase = 'guided';
    state.topicKey = topicKey(subject, topic);
    state.subjectId = cleanText(subject.id);
    state.topicId = cleanText(topic.id);
    state.currentStage = plan.queue[0] && plan.queue[0].__wave89nStage ? plan.queue[0].__wave89nStage : '';
    state.stageResults = {};
    state.example = plan.example ? {
      question: cleanText(plan.example.question),
      answer: cleanText(plan.example.answer),
      hint: cleanText(plan.example.hint || plan.example.h),
      ex: cleanText(plan.example.ex),
      bucket: difficultyOf(plan.example)
    } : null;
    state.lastPlanStages = plan.stageOrder.slice();
    state.completionCounted = false;
    return true;
  }
  function syncStateFromContext(){
    var subject = currentSubject();
    var topic = currentTopic();
    var question = currentQuestion();
    if (!subject || !topic) return false;
    var key = topicKey(subject, topic);
    if (root.__wave21SessionMode === 'learning-path' || (question && question.__wave89nStage)) {
      state.active = true;
      state.topicKey = key;
      state.subjectId = cleanText(subject.id);
      state.topicId = cleanText(topic.id);
      state.phase = root.__wave21SessionMode === 'learning-path' ? 'guided' : (state.phase === 'regular' ? 'regular' : 'guided');
      if (question && question.__wave89nStage) state.currentStage = question.__wave89nStage;
      return true;
    }
    return false;
  }
  function finishGuidedPhase(){
    if (!state.active) return false;
    state.phase = 'regular';
    state.currentStage = '';
    state.lastCompletedTopicKey = state.topicKey;
    root.__wave21QuestionQueue = null;
    root.__wave21QuestionQueueTotal = 0;
    if (root.__wave21SessionMode === 'learning-path') root.__wave21SessionMode = null;
    try {
      if (typeof root.showToast === 'function') root.showToast('🧭 Маршрут темы пройден — дальше обычная тренировка.', 'success', 2200);
    } catch (_err) {}
    return true;
  }
  function supportsAutoSeed(){
    return typeof root.wave21OpenTopic === 'function'
      || typeof root.wave21ResumeSession === 'function'
      || typeof root.wave21ForceSnapshot === 'function';
  }
  function stageStatus(record, stage, currentStage){
    if (stage === 'theory') return record && record.theorySeenAt ? 'done' : 'idle';
    if (stage === 'example') return (record && (record.exampleSeenAt || record.lastExample)) || state.example ? 'done' : 'idle';
    if (currentStage === stage) return 'active';
    if (state.stageResults && state.stageResults[stage] && state.stageResults[stage].attempted) {
      return state.stageResults[stage].correct ? 'done' : 'warn';
    }
    if (state.phase === 'regular' && state.lastCompletedTopicKey && state.lastCompletedTopicKey === state.topicKey) return 'done';
    var row = record && record.stageStats && record.stageStats[stage];
    if (row && row.attempts) return row.correct > 0 ? 'done' : 'warn';
    return 'idle';
  }
  function stageChip(stage, status){
    return '<span class="wave89n-step ' + esc(status || 'idle') + '"><span class="ico">' + esc(STAGE_ICONS[stage] || '•') + '</span><span>' + esc(STAGE_LABELS[stage] || stage) + '</span></span>';
  }
  function renderTheoryCard(){
    if (!activeScreen('s-theory')) { removeByAttr(THEORY_ATTR); return; }
    var subject = currentSubject();
    var topic = currentTopic();
    var host = root.document && root.document.getElementById ? root.document.getElementById('tc') : null;
    if (!host || !subject || !topic) { removeByAttr(THEORY_ATTR); return; }
    var plan = buildGuidedPlan(subject, topic);
    if (!plan) { removeByAttr(THEORY_ATTR); return; }
    var record = markTheory(subject, topic) || readRecord(subject, topic);
    if (plan.example) record = markExample(subject, topic, plan.example) || record;
    removeByAttr(THEORY_ATTR);
    var card = root.document.createElement('div');
    card.className = 'tcard wave89n-path-card';
    card.setAttribute(THEORY_ATTR, '');
    var example = plan.example;
    var exampleHtml = example
      ? '<div class="wave89n-example"><div class="wave89n-example-q"><b>Пример:</b> ' + esc(example.question) + '</div><div class="wave89n-example-a">Ответ: <b>' + esc(example.answer) + '</b></div>' + ((example.ex || example.hint) ? '<div class="wave89n-note">' + esc(example.ex || example.hint) + '</div>' : '') + '</div>'
      : '<div class="wave89n-note">Для этой темы пока не удалось собрать отдельный пример, но стартовая лестница сложности всё равно сработает при запуске тренажёра.</div>';
    card.innerHTML = '<div class="wave89n-path-head"><div><div class="wave89n-path-title">🧭 Маршрут темы</div><div class="wave89n-path-sub">Сначала теория и пример, затем 3 стартовых шага: лёгкое → среднее → сложное.</div></div>'
      + (num(record.completedRuns) > 0 ? '<span class="wave89n-badge done">Пройдено</span>' : '<span class="wave89n-badge">Новый маршрут</span>')
      + '</div><div class="wave89n-steps">'
      + STAGE_ORDER.map(function(stage){ return stageChip(stage, stageStatus(record, stage, '')); }).join('')
      + '</div>' + exampleHtml
      + '<div class="wave89n-note">После стартовой лестницы тренировка перейдёт в обычный режим и подхватит уже существующую адаптивную сложность.</div>';
    host.appendChild(card);
  }
  function renderPlayCard(){
    if (!activeScreen('s-play')) { removeByAttr(PLAY_ATTR); return; }
    var subject = currentSubject();
    var topic = currentTopic();
    var host = root.document && root.document.getElementById ? root.document.getElementById('pa') : null;
    if (!host || !subject || !topic) { removeByAttr(PLAY_ATTR); return; }
    syncStateFromContext();
    var key = topicKey(subject, topic);
    if (!(root.__wave21SessionMode === 'learning-path' || (state.active && state.topicKey === key))) { removeByAttr(PLAY_ATTR); return; }
    var record = readRecord(subject, topic) || defaultRecord(subject, topic);
    var question = currentQuestion();
    var currentStage = question && question.__wave89nStage ? question.__wave89nStage : '';
    removeByAttr(PLAY_ATTR);
    var card = root.document.createElement('div');
    card.className = 'wave89n-path-card wave89n-play-card';
    card.setAttribute(PLAY_ATTR, '');
    var note = currentStage
      ? 'Сейчас идёт шаг «' + (STAGE_LABELS[currentStage] || currentStage) + '». После стартовых вопросов тренировка продолжится в обычном режиме.'
      : 'Стартовая лестница сложности уже пройдена — дальше идёт обычная тренировка по теме.';
    var exampleHtml = state.example && state.phase === 'guided'
      ? '<div class="wave89n-note">Короткий пример перед стартом: <b>' + esc(state.example.answer) + '</b> — ' + esc(state.example.question) + '.</div>'
      : '';
    card.innerHTML = '<div class="wave89n-path-head"><div><div class="wave89n-path-title">🧭 Маршрут темы</div><div class="wave89n-path-sub">' + esc(topic.nm || '') + '</div></div>'
      + '<span class="wave89n-badge ' + esc(state.phase === 'regular' ? 'done' : '') + '">' + esc(state.phase === 'regular' ? 'Обычный режим' : 'Стартовый путь') + '</span></div>'
      + '<div class="wave89n-steps">' + STAGE_ORDER.map(function(stage){ return stageChip(stage, stageStatus(record, stage, currentStage)); }).join('') + '</div>'
      + exampleHtml + '<div class="wave89n-note">' + esc(note) + '</div>';
    host.appendChild(card);
  }
  function summarizeStore(){
    var store = readStore();
    var totalTopics = 0;
    if (Array.isArray(root.SUBJ)) {
      root.SUBJ.forEach(function(subject){ totalTopics += Array.isArray(subject && subject.tops) ? subject.tops.length : 0; });
    }
    var started = 0;
    var completed = 0;
    var theorySeen = 0;
    var exampleReady = 0;
    var lastTopic = null;
    Object.keys(store.topics || {}).forEach(function(key){
      var record = store.topics[key];
      if (!record || typeof record !== 'object') return;
      started += 1;
      if (num(record.completedRuns) > 0) completed += 1;
      if (record.theorySeenAt) theorySeen += 1;
      if (record.lastExample) exampleReady += 1;
      if (!lastTopic || num(record.lastRunAt) > num(lastTopic.lastRunAt)) lastTopic = record;
    });
    return {
      totalTopics: totalTopics,
      started: started,
      completed: completed,
      theorySeen: theorySeen,
      exampleReady: exampleReady,
      lastTopic: lastTopic ? clone(lastTopic) : null
    };
  }
  function appendProgressCard(){
    var host = root.document && root.document.getElementById ? root.document.getElementById('prog-content') : null;
    if (!host) { removeByAttr(PROGRESS_ATTR); return; }
    var summary = summarizeStore();
    removeByAttr(PROGRESS_ATTR);
    var card = root.document.createElement('div');
    card.className = 'rcard wave89n-path-card';
    card.setAttribute(PROGRESS_ATTR, '');
    var completedPct = summary.totalTopics ? Math.round(summary.completed / summary.totalTopics * 100) : 0;
    var lastHtml = summary.lastTopic
      ? '<li><b>Последняя тема:</b> ' + esc(summary.lastTopic.subjectName) + ' → ' + esc(summary.lastTopic.topicName) + '</li>'
      : '<li><b>Последняя тема:</b> пока нет запусков маршрута</li>';
    card.innerHTML = '<div class="wave89n-path-head"><div><div class="wave89n-path-title">🧭 Learning path</div><div class="wave89n-path-sub">Маршрут по темам: теория → пример → лёгкое → среднее → сложное.</div></div>'
      + '<span class="wave89n-badge">' + esc(completedPct + '%') + '</span></div>'
      + '<div class="wave89n-steps">'
      + '<span class="wave89n-step done"><span class="ico">📚</span><span>Тем начато: ' + esc(summary.started) + '</span></span>'
      + '<span class="wave89n-step ' + (summary.completed ? 'done' : 'idle') + '"><span class="ico">✅</span><span>Пройдено: ' + esc(summary.completed) + '</span></span>'
      + '<span class="wave89n-step ' + (summary.theorySeen ? 'done' : 'idle') + '"><span class="ico">📖</span><span>Теория открыта: ' + esc(summary.theorySeen) + '</span></span>'
      + '<span class="wave89n-step ' + (summary.exampleReady ? 'done' : 'idle') + '"><span class="ico">🧪</span><span>Примеры готовы: ' + esc(summary.exampleReady) + '</span></span>'
      + '</div><ul class="wave89n-note-list">' + lastHtml + '<li><b>Всего тем в классе:</b> ' + esc(summary.totalTopics) + '</li></ul>';
    host.appendChild(card);
  }
  function resetState(){
    state.active = false;
    state.phase = 'idle';
    state.topicKey = '';
    state.subjectId = '';
    state.topicId = '';
    state.currentStage = '';
    state.stageResults = {};
    state.example = null;
    state.completionCounted = false;
    state.lastPlanStages = [];
  }

  var baseStartQuiz = typeof root.startQuiz === 'function' ? root.startQuiz : null;
  if (baseStartQuiz) {
    root.startQuiz = function(){
      var subject = currentSubject();
      var topic = currentTopic();
      if (supportsAutoSeed() && shouldSeedForTopic(subject, topic)) seedGuidedPath(subject, topic);
      else syncStateFromContext();
      return baseStartQuiz.apply(this, arguments);
    };
  }

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(){
      var question = currentQuestion();
      var stage = question && question.__wave89nStage ? question.__wave89nStage : '';
      var subject = currentSubject();
      var topic = currentTopic();
      var hadSelection = currentSelection() != null;
      var result = baseAns.apply(this, arguments);
      try {
        if (!stage || hadSelection || currentSelection() == null) return result;
        var sample = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
        state.stageResults[stage] = {
          attempted: true,
          correct: norm(currentSelection()) === norm(question.answer),
          usedHelp: usedHelpState(),
          ms: sample && sample.ms ? Math.round(num(sample.ms)) : 0
        };
        recordStage(subject, topic, stage, state.stageResults[stage], question);
        try {
          var adaptive = root.__wave89mAdaptiveDifficulty;
          if (adaptive && typeof adaptive.recordOutcome === 'function') {
            var adaptiveState = adaptive.currentState && typeof adaptive.currentState === 'function' ? adaptive.currentState() : null;
            adaptive.recordOutcome(question, {
              correct: !!state.stageResults[stage].correct,
              usedHelp: !!state.stageResults[stage].usedHelp,
              ms: state.stageResults[stage].ms || 0,
              bucket: difficultyOf(question),
              target: adaptiveState && adaptiveState.lastTarget ? adaptiveState.lastTarget : difficultyOf(question)
            });
          }
        } catch (_err) {}
        state.currentStage = stage;
        state.active = true;
        state.topicKey = topicKey(subject, topic);
        state.subjectId = cleanText(subject && subject.id);
        state.topicId = cleanText(topic && topic.id);
      } catch (_err) {}
      return result;
    };
  }

  var baseNextQ = typeof root.nextQ === 'function' ? root.nextQ : null;
  if (baseNextQ) {
    root.nextQ = function(){
      if (state.active && root.__wave21SessionMode === 'learning-path' && Array.isArray(root.__wave21QuestionQueue) && root.__wave21QuestionQueue.length === 0) finishGuidedPhase();
      var result = baseNextQ.apply(this, arguments);
      try { renderPlayCard(); } catch (_err) {}
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try { renderPlayCard(); } catch (_err) {}
      return result;
    };
  }

  var baseRenderProg = typeof root.renderProg === 'function' ? root.renderProg : null;
  if (baseRenderProg) {
    root.renderProg = function(){
      var result = baseRenderProg.apply(this, arguments);
      try { appendProgressCard(); } catch (_err) {}
      return result;
    };
  }

  var baseGo = typeof root.go === 'function' ? root.go : null;
  if (baseGo) {
    root.go = function(screen){
      var result = baseGo.apply(this, arguments);
      try {
        if (screen === 'theory') renderTheoryCard();
        else removeByAttr(THEORY_ATTR);
        if (screen === 'play') renderPlayCard();
        else removeByAttr(PLAY_ATTR);
        if (screen === 'prog') appendProgressCard();
        else removeByAttr(PROGRESS_ATTR);
      } catch (_err) {}
      return result;
    };
  }

  var baseEndSession = typeof root.endSession === 'function' ? root.endSession : null;
  if (baseEndSession) {
    root.endSession = function(){
      var result = baseEndSession.apply(this, arguments);
      resetState();
      removeByAttr(PLAY_ATTR);
      return result;
    };
  }

  function init(){
    try {
      if (activeScreen('s-theory')) renderTheoryCard();
      if (activeScreen('s-play')) renderPlayCard();
      if (activeScreen('s-prog')) appendProgressCard();
    } catch (_err) {}
  }
  if (root.document && root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  root.__wave89nLearningPath = {
    version: 'wave89n',
    storageKey: storageKey,
    readStore: readStore,
    writeStore: writeStore,
    readRecord: readRecord,
    updateRecord: updateRecord,
    topicAttempts: topicAttempts,
    buildGuidedPlan: buildGuidedPlan,
    seedGuidedPath: seedGuidedPath,
    shouldSeedForTopic: shouldSeedForTopic,
    markTheory: markTheory,
    markExample: markExample,
    recordStage: recordStage,
    finishGuidedPhase: finishGuidedPhase,
    renderTheoryCard: renderTheoryCard,
    renderPlayCard: renderPlayCard,
    appendProgressCard: appendProgressCard,
    summarizeStore: summarizeStore,
    currentState: function(){ return clone(state); },
    clear: function(){ try { if (root.localStorage) root.localStorage.removeItem(storageKey()); } catch (_err) {} resetState(); cache = {}; }
  };
})();

