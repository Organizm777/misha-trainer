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
    if (!question || root.sel !== null) return false;
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
    if (!question || root.sel !== null) return false;
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
    if (root.sel === null) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = '';
    var correct = asText(root.sel) === asText(question.answer);
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
      if (root.sel !== null) {
        className += ' done';
        if (asText(step) === asText(question.answer)) className += ' ok';
        else if (asText(step) === asText(root.sel)) className += ' no';
        else className += ' dim';
      }
      var button = stepButton(idx + 1, step, className);
      button.disabled = root.sel !== null;
      if (root.sel === null) {
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

    if (root.sel !== null) {
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
      hint.textContent = root.sel === null ? 'Выбери соответствие из списка.' : 'Правильная пара: ' + asText(Array.isArray(pair) ? pair[1] : '');
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
      select.disabled = root.sel !== null;
      if (root.sel === null) {
        select.addEventListener('change', function(){ state.selection[idx] = asText(select.value); });
      }
      row.appendChild(select);
      opts.appendChild(row);
    });

    if (root.sel !== null) return;

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
    var chosen = root.sel !== null ? selectionFromRaw(question, root.sel) : state.selected;
    var correct = multiSelectCorrect(question);

    opts.innerHTML = '';
    opts.appendChild(card('Выбери несколько ответов', requirementText(question) + ' Затем нажми «Проверить».'));

    var summary = card('Текущий выбор', chosen.length
      ? 'Отмечено: ' + countText(chosen.length) + '. ' + requirementText(question)
      : 'Пока ничего не отмечено. ' + requirementText(question));
    if (chosen.length && root.sel === null) {
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
    } else if (root.sel !== null) {
      appendExplanationBlock(summary, 'Вы выбрали', displayMultiSelect(question, chosen) || 'ничего');
    }
    opts.appendChild(summary);

    var pool = card('Варианты', 'Можно отметить несколько пунктов. Номер на кнопке можно использовать с клавиатуры.');
    all.forEach(function(item, idx){
      var selected = chosen.indexOf(item) !== -1;
      var isCorrect = correct.indexOf(item) !== -1;
      var className = 'opt';
      if (root.sel !== null) {
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
      if (root.sel === null) {
        button.addEventListener('click', function(){
          if (toggleMultiSelect(question, item) && typeof root.render === 'function') root.render();
        });
      } else {
        button.disabled = true;
      }
      pool.appendChild(button);
    });
    opts.appendChild(pool);

    if (root.sel !== null) return;

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
      if (!shouldEnhance(question) || !question || root.sel !== null) return;
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
    return root.cS && root.cS.id ? String(root.cS.id) : (root.globalMix ? 'mix' : '');
  }
  function explicitInputMode(question){
    var mode = normalizeClozeText(question && question.inputMode);
    if (!mode) return '';
    if (mode === 'cloze' || mode === 'fill' || mode === 'blank') return 'cloze';
    if (mode === 'text' || mode === 'input' || mode === 'free-text' || mode === 'short-text' || mode === 'fuzzy-text') return 'text';
    if (mode === 'numeric' || mode === 'number' || mode === 'free-number') return 'numeric';
    return '';
  }
  function inputModeFor(question){
    if (!question || !onPlayScreen() || root.rushMode || root.diagMode) return '';
    if (question.interactionType) return '';
    var explicit = explicitInputMode(question);
    if (explicit) return explicit;
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
    if (!question || !onPlayScreen() || root.sel !== null) return;
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
      correct: asText(root.sel) === asText(question.answer),
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
    if (!question || root.sel !== null || typeof root.ans !== 'function') return false;
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
    if (!question || root.sel !== null) return false;
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
    input.value = root.sel === null ? (state.draft || '') : (state.lastValue || state.draft || '');
    input.disabled = root.sel !== null;
    if (root.sel === null) {
      input.addEventListener('input', function(){ state.draft = input.value; });
      input.addEventListener('keydown', function(event){
        if (event.key === 'Enter' || event.key === 'NumpadEnter') {
          event.preventDefault();
          submitCurrentInput(question, mode);
        }
      });
    }
    row.appendChild(input);

    if (root.sel === null) {
      var submit = makeButton('Проверить', 'btn btn-p');
      submit.addEventListener('click', function(){ submitCurrentInput(question, mode); });
      row.appendChild(submit);
    }
    box.appendChild(row);

    if (root.sel !== null) {
      var info = document.createElement('div');
      info.className = 'wave87x-chiprow';

      var typed = document.createElement('span');
      typed.className = 'wave87x-chip ' + (asText(root.sel) === asText(question.answer) ? 'ok' : 'no');
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

    if (root.sel === null) {
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
    if (!question || root.sel === null) return;
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
      if (!mode || root.sel !== null) return;
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
      var hadSelection = root.sel !== null;
      var result = baseAns.apply(this, arguments);
      try {
        if (!hadSelection && question && root.sel !== null) captureTiming(question);
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
    matchTextInput: matchTextInput
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
    return root.sel !== null && typeof root.sel !== 'undefined';
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
    components: ['wave87w','wave87x','wave88c','wave88d']
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
    var aboutBtn = settingsButton('ℹ️ О проекте');
    aboutBtn.addEventListener('click', openLegacyAbout);
    var closeBtn = settingsButton('Закрыть');
    closeBtn.addEventListener('click', closeSettings);
    actions.appendChild(toggle);
    actions.appendChild(infoBtn);
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
