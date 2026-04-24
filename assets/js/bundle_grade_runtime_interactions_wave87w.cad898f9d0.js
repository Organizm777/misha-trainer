/* bundle_grade_runtime_interactions_wave87w */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave87wInteractiveFormats) return;

  var root = window;
  var grade = String(root.GRADE_NUM || root.GRADE_NO || '');
  if (!/^(8|9|10|11)$/.test(grade)) {
    root.__wave87wInteractiveFormats = { version:'wave87w', active:false, grade:grade };
    return;
  }

  var TYPES = Object.freeze({
    FIND_ERROR: 'find-error',
    SEQUENCE: 'sequence',
    MATCH: 'match'
  });

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
    return question.interactionType === TYPES.FIND_ERROR || question.interactionType === TYPES.SEQUENCE || question.interactionType === TYPES.MATCH;
  }
  function isComplexInteractive(question){
    return !!(question && (question.interactionType === TYPES.SEQUENCE || question.interactionType === TYPES.MATCH));
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
      var state = ensureMatchState(question);
      appendMatchRows(wrap, question.matchPairs || [], state && state.selection, !correct);
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
        select.addEventListener('change', function(){
          state.selection[idx] = asText(select.value);
        });
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

  function enhanceInteractiveQuestion(){
    var question = currentQuestion();
    if (!shouldEnhance(question)) return;
    var opts = document.getElementById('opts');
    if (!opts) return;
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-label', 'Интерактивное задание');
    if (question.interactionType === TYPES.FIND_ERROR) renderFindError(question, opts);
    else if (question.interactionType === TYPES.SEQUENCE) renderSequence(question, opts);
    else if (question.interactionType === TYPES.MATCH) renderMatch(question, opts);
    renderInteractiveFeedback(question);
  }

  var baseNextQ = typeof root.nextQ === 'function' ? root.nextQ : null;
  if (baseNextQ) {
    root.nextQ = function(){
      var result;
      var tries = 0;
      do {
        result = baseNextQ.apply(this, arguments);
        tries += 1;
        if (!(root.rushMode && isComplexInteractive(currentQuestion()))) break;
      } while (tries < 6);
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
    version: 'wave87w',
    active: true,
    grade: grade,
    types: Object.keys(TYPES).map(function(key){ return TYPES[key]; }),
    isInteractiveQuestion: isInteractiveQuestion,
    shouldEnhance: shouldEnhance,
    serializeSequence: serializeSequence,
    serializePairs: serializePairs
  };
})();
