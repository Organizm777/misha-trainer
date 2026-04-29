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
      try { root.localStorage.setItem(storageKey(), JSON.stringify(next)); } catch(_) {}
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
    var lexicalQuestion = lexicalValue(function(){ return prob; });
    if (lexicalQuestion && typeof lexicalQuestion === 'object') return lexicalQuestion;
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
