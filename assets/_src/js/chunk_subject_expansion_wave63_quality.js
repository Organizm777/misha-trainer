;(() => {
  var VERSION = 'wave87i-quality-repeat-guard';
  var report = {
    version: VERSION,
    generatorsWrapped: 0,
    questionSanitized: 0,
    bankRowsSanitized: 0,
    hintsInjected: 0,
    answerInjected: 0,
    duplicateOptionsRemoved: 0,
    optionsFilled: 0,
    optionsTrimmed: 0,
    difficultyTagged: 0,
    bankDeduped: 0,
    bankQuestionDeduped: 0,
    bankQuestionConflicts: 0,
    repeatAttempts: 0,
    recentRepeatBlocked: 0,
    repeatAccepted: 0,
    issues: [],
    bankStats: {},
    topicStats: {}
  };
  function expose(){ window.WAVE63_QUALITY_RUNTIME = report; return report; }
  function pushIssue(code, detail){ if (report.issues.length < 100) report.issues.push({ code: code, detail: detail }); }
  function cleanText(v){ return String(v == null ? '' : v).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim(); }
  function norm(v){ return cleanText(v).toLowerCase().replace(/ё/g, 'е'); }
  function hasHint(v){ return cleanText(v).length >= 8; }
  function gradeValue(meta, q){ var g = Number((q && (q.grade || q.g)) || (meta && meta.grade) || window.GRADE_NUM || 0); return Number.isFinite(g) ? g : 0; }
  function defaultHint(q, meta){
    var tag = cleanText((q && (q.tag || q.topic || q.topicName)) || (meta && meta.topicName) || '');
    var question = cleanText((q && (q.question || q.q)) || '');
    if (/уравн|найд|реши|вычисл|сколько|площад|скорост|дроб|процент|корен|логарифм|производн|интеграл|функц|координат|вектор/i.test(question)) return 'Решай по шагам: определи правило, выполни вычисления и проверь ответ.';
    if (/english|grammar|passive|modal|conditional|article|preposition|vocabulary|phrasal/i.test(tag + ' ' + question)) return 'Определи грамматическую конструкцию и проверь, какое слово или форма подходит по смыслу.';
    if (/выбери|какой термин|что верно|какое утверждение|определи|соотнеси/i.test(question)) return tag ? ('Сначала вспомни ключевое правило или определение по теме «' + tag + '».') : 'Сначала вспомни ключевое правило или определение.';
    return tag ? ('Тема: ' + tag + '. Сначала выдели правило, затем сравни варианты.') : 'Сначала выдели правило или ключевой факт, затем сравни варианты ответа.';
  }
  function tryNumber(value){
    var raw = cleanText(value).replace(',', '.').replace(/\s+/g, '');
    if (!raw) return null;
    if (/^-?\d+(?:\.\d+)?%$/.test(raw)) { var p = Number(raw.slice(0, -1)); return Number.isFinite(p) ? { kind: 'percent', value: p } : null; }
    if (/^-?\d+\/\d+$/.test(raw)) { var parts = raw.split('/'); var a = Number(parts[0]); var b = Number(parts[1]); if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) return { kind: 'fraction', value: a / b, num: a, den: b }; return null; }
    if (/^-?\d+(?:\.\d+)?$/.test(raw)) { var n = Number(raw); return Number.isFinite(n) ? { kind: 'number', value: n } : null; }
    return null;
  }
  function formatNear(base, delta){ var value = base + delta; if (!Number.isFinite(value)) return null; if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value)); return String(Math.round(value * 100) / 100).replace(/\.0+$/, ''); }
  function synthesizeDistractors(answer, question, options){
    var out = []; var seen = {};
    (options || []).forEach(function(opt){ seen[norm(opt)] = true; }); seen[norm(answer)] = true;
    var num = tryNumber(answer);
    if (num) {
      if (num.kind === 'percent') {
        [1, -1, 5, -5, 10, -10].forEach(function(delta){ var next = formatNear(num.value, delta); if (next != null) next += '%'; if (next && !seen[norm(next)] && norm(next) !== norm(answer)) { seen[norm(next)] = true; out.push(next); } });
      } else if (num.kind === 'fraction' && Number.isFinite(num.num) && Number.isFinite(num.den)) {
        [String(num.num + 1) + '/' + String(num.den), String(Math.max(1, num.num - 1)) + '/' + String(num.den), String(num.num) + '/' + String(num.den + 1), String(num.den) + '/' + String(num.num || 1)].forEach(function(next){ if (next && !seen[norm(next)] && norm(next) !== norm(answer)) { seen[norm(next)] = true; out.push(next); } });
      } else {
        var step = Math.abs(num.value) >= 10 ? Math.max(1, Math.round(Math.abs(num.value) * 0.1)) : 1;
        [step, -step, step * 2, -step * 2, 0.5, -0.5].forEach(function(delta){ var next = formatNear(num.value, delta); if (next && !seen[norm(next)] && norm(next) !== norm(answer)) { seen[norm(next)] = true; out.push(next); } });
      }
    }
    if (out.length < 3) {
      var genericPool = [];
      if (/да|нет/i.test(answer)) genericPool = ['Да', 'Нет', 'Иногда', 'Только в частном случае'];
      else if (/верно|неверно|истина|ложь/i.test(answer)) genericPool = ['Верно', 'Неверно', 'Только в частном случае', 'Недостаточно данных'];
      else genericPool = ['Похожий термин', 'Смежная норма', 'Частный случай', 'Неточная формулировка'];
      genericPool.forEach(function(next){ if (next && !seen[norm(next)] && norm(next) !== norm(answer)) { seen[norm(next)] = true; out.push(next); } });
    }
    return out;
  }
  function sanitizeOptions(list, answer, question){
    var out = []; var seen = {};
    (Array.isArray(list) ? list : []).forEach(function(opt){ var value = cleanText(opt); if (!value) return; var key = value; if (seen[key]) { report.duplicateOptionsRemoved += 1; return; } seen[key] = true; out.push(value); });
    var ans = cleanText(answer);
    if (ans) {
      var answerKey = norm(ans); var exactIndex = out.indexOf(ans); var normalizedIndex = out.findIndex(function(item){ return norm(item) === answerKey; });
      if (exactIndex === -1 && normalizedIndex !== -1) { out[normalizedIndex] = ans; report.answerInjected += 1; }
      else if (exactIndex === -1 && normalizedIndex === -1) { out.unshift(ans); report.answerInjected += 1; }
    }
    if (out.length < 4 && ans) { synthesizeDistractors(ans, cleanText(question), out).forEach(function(next){ if (out.length >= 4) return; out.push(next); report.optionsFilled += 1; }); }
    if (out.length > 4) { var answerText = cleanText(answer); var trimmed = out.slice(0, 4); if (answerText && !trimmed.some(function(item){ return norm(item) === norm(answerText); })) trimmed[trimmed.length - 1] = answerText; out = trimmed; report.optionsTrimmed += 1; }
    return out;
  }
  function classifyDifficulty(q, meta){
    var question = cleanText(q.question || q.q); var answer = cleanText(q.answer || q.a); var tag = cleanText(q.tag || q.topic || (meta && meta.topicName) || ''); var grade = gradeValue(meta, q); var score = 0; var numbers = question.match(/-?\d+(?:[\.,]\d+)?/g) || [];
    if (question.length >= 90) score += 1; if (numbers.length >= 3) score += 1; if (/√|\^|≤|≥|\/|дроб|процент|скорост|уравнен|функц|координат|вектор|производн|интеграл|логарифм|тригоном|электростат|электромаг|биохим|органик|полит|социолог|право|эконом/i.test(question + ' ' + tag)) score += 1; if (/почему|объясни|сделай вывод|наиболее вероятно|какой вывод|сравни|определи по описанию|выбери утверждение/i.test(question)) score += 1; if (grade >= 9) score += 1; if (grade >= 11) score += 1; if (answer.length >= 24) score += 1;
    var bucket = score <= 1 ? 'easy' : (score <= 3 ? 'medium' : 'hard');
    if (q.difficulty !== bucket || q.diffBucket !== bucket) report.difficultyTagged += 1;
    q.difficulty = bucket; q.diffBucket = bucket; q.diffScore = score; return bucket;
  }
  function syncAliases(q){ if ('q' in q) q.q = q.question; if ('a' in q) q.a = q.answer; if ('opts' in q) q.opts = Array.isArray(q.options) ? q.options.slice() : []; if ('h' in q) q.h = q.hint; if ('topic' in q && !q.tag) q.tag = q.topic; }
  function sanitizeQuestion(raw, meta){
    if (!raw || typeof raw !== 'object') return raw;
    var q = raw;
    q.question = cleanText(q.question != null ? q.question : q.q); q.answer = cleanText(q.answer != null ? q.answer : q.a); q.tag = cleanText(q.tag != null ? q.tag : (q.topic != null ? q.topic : (meta && meta.topicName) || '')); q.hint = cleanText(q.hint != null ? q.hint : q.h); q.options = sanitizeOptions(q.options != null ? q.options : (q.opts != null ? q.opts : q.o), q.answer, q.question);
    if (!q.question) { q.question = q.tag ? ('Выбери верный ответ по теме «' + q.tag + '»') : 'Выбери верный ответ.'; pushIssue('empty-question-filled', (meta && meta.topicId) || q.tag || 'unknown'); }
    if (!q.answer) pushIssue('empty-answer', q.question.slice(0, 120));
    if (!hasHint(q.hint)) { q.hint = defaultHint(q, meta || {}); report.hintsInjected += 1; }
    if (!q.options.some(function(opt){ return norm(opt) === norm(q.answer); })) { q.options = sanitizeOptions(q.options.concat([q.answer]), q.answer, q.question); report.answerInjected += 1; }
    classifyDifficulty(q, meta || {}); syncAliases(q); report.questionSanitized += 1; return q;
  }
  function questionKey(question, answer, tag, grade){ return [grade || 0, norm(tag), norm(question), norm(answer)].join('|'); }
  function promptKey(question, tag, grade){ return [grade || 0, norm(tag), norm(question)].join('|'); }
  function liveBankCount(topic){
    var max = 0;
    Object.keys(topic || {}).forEach(function(key){
      if (!/^_wave(86|87).*(?:LiveBankCount|BankCount)$/.test(key)) return;
      var value = Number(topic[key]) || 0;
      if (value > max) max = value;
    });
    return max;
  }
  function poolCountForTopic(topic){
    var count = liveBankCount(topic);
    if (count > 0) return count;
    if (topic && Array.isArray(topic.rows) && topic.rows.length) return topic.rows.length;
    if (topic && Array.isArray(topic._questionPool) && topic._questionPool.length) return topic._questionPool.length;
    if (topic && Array.isArray(topic._questionBank) && topic._questionBank.length) return topic._questionBank.length;
    count = Number(topic && (topic._coverageExtraCount || topic._wave6ExtraCount || topic._wave10BankCount || topic._wave40BankCount || topic._wave42BankCount || topic._wave87gGrade11BalanceBankCount || topic._wave87hValuesLiveBankCount || topic._wave87hProbLiveBankCount)) || 0;
    return count > 0 ? count : 0;
  }
  function recentLimitForTopic(topic){
    var count = poolCountForTopic(topic);
    if (count >= 18) return 4;
    if (count >= 10) return 3;
    if (count >= 6) return 3;
    return 2;
  }
  function attemptLimitForTopic(topic){
    var count = poolCountForTopic(topic);
    if (count >= 18) return 8;
    if (count >= 10) return 7;
    if (count >= 6) return 6;
    if (count >= 4) return 6;
    return 5;
  }
  function sanitizeBankRows(){
    if (typeof QBANK === 'undefined' || !QBANK || typeof QBANK !== 'object') return;
    Object.keys(QBANK).forEach(function(bankKey){
      if (!Array.isArray(QBANK[bankKey])) return;
      var before = QBANK[bankKey].length; var seen = {}; var seenQuestion = {}; var out = [];
      QBANK[bankKey].forEach(function(row){
        if (!row || typeof row !== 'object') return;
        var meta = { grade: Number(row.g || row.grade || row.cls || window.GRADE_NUM || 0) || 0, topicName: cleanText(row.topic || row.tag || bankKey), topicId: cleanText(row.topic || row.tag || bankKey), subjectId: bankKey };
        var normalized = sanitizeQuestion({ question: row.q != null ? row.q : row.question, answer: row.a != null ? row.a : row.answer, options: row.opts != null ? row.opts : (row.options != null ? row.options : row.o), hint: row.h != null ? row.h : row.hint, tag: row.topic != null ? row.topic : (row.tag != null ? row.tag : bankKey), isMath: !!row.isMath, grade: meta.grade }, meta);
        if (!normalized.question || !normalized.answer || !Array.isArray(normalized.options) || normalized.options.length < 2) { pushIssue('bad-bank-row', bankKey + '|' + meta.topicName); return; }
        var key = questionKey(normalized.question, normalized.answer, normalized.tag, meta.grade);
        if (seen[key]) { report.bankDeduped += 1; return; }
        var stemKey = promptKey(normalized.question, normalized.tag, meta.grade);
        var answerKey = norm(normalized.answer);
        if (Object.prototype.hasOwnProperty.call(seenQuestion, stemKey)) {
          if (seenQuestion[stemKey] === answerKey) { report.bankQuestionDeduped += 1; return; }
          report.bankQuestionConflicts += 1;
          pushIssue('bank-question-conflict', bankKey + '|' + meta.topicName + '|' + normalized.question.slice(0, 120));
          return;
        }
        seen[key] = true;
        seenQuestion[stemKey] = answerKey;
        row.q = normalized.question; row.a = normalized.answer; row.opts = normalized.options.slice(); row.h = normalized.hint; row.topic = normalized.tag || bankKey; row.g = meta.grade; row.difficulty = normalized.difficulty; row.diffBucket = normalized.diffBucket; row.diffScore = normalized.diffScore; row.hint = normalized.hint; row.options = normalized.options.slice(); out.push(row); report.bankRowsSanitized += 1;
      });
      QBANK[bankKey] = out; report.bankStats[bankKey] = { before: before, after: out.length };
    });
    expose();
  }
  function wrapTopics(){
    if (typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
    var grade = Number(window.GRADE_NUM || 0) || 0;
    SUBJ.forEach(function(subject){
      if (!subject || !Array.isArray(subject.tops)) return;
      subject.tops.forEach(function(topic){
        if (!topic || typeof topic.gen !== 'function' || topic.gen.__wave63Wrapped) return;
        var orig = topic.gen;
        var topicName = cleanText(topic.nm || topic.name || topic.id || '');
        var bucketKey = [subject.id || subject.nm || 'subject', topic.id || topicName].join(':');
        var recent = [];
        var seenPrompts = {};
        var recentLimit = recentLimitForTopic(topic);
        var maxAttempts = attemptLimitForTopic(topic);
        topic.gen = function(){
          var meta = { grade: grade, subjectId: subject.id || '', topicId: topic.id || '', topicName: topicName };
          var attempts = 0;
          var blocked = 0;
          var result = null;
          var resultPrompt = '';
          while (attempts < maxAttempts) {
            attempts += 1;
            result = sanitizeQuestion(orig.apply(this, arguments), meta);
            if (!result || !result.question) { resultPrompt = ''; break; }
            resultPrompt = promptKey(result.question, result.tag || topicName, grade);
            if (recent.indexOf(resultPrompt) === -1) break;
            blocked += 1;
          }
          report.repeatAttempts += Math.max(0, attempts - 1);
          report.recentRepeatBlocked += blocked;
          if (resultPrompt && recent.indexOf(resultPrompt) !== -1 && blocked) report.repeatAccepted += 1;
          if (resultPrompt) {
            recent.push(resultPrompt);
            while (recent.length > recentLimit) recent.shift();
          }
          var stats = report.topicStats[bucketKey] || (report.topicStats[bucketKey] = {
            subjectId: subject.id || '',
            topicId: topic.id || '',
            topicName: topicName,
            generated: 0,
            liveBankCount: liveBankCount(topic),
            poolCount: poolCountForTopic(topic),
            uniquePromptCount: 0,
            recentRepeatBlocked: 0,
            repeatAccepted: 0,
            difficulty: { easy: 0, medium: 0, hard: 0 }
          });
          stats.generated += 1;
          stats.recentRepeatBlocked += blocked;
          if (resultPrompt && !seenPrompts[resultPrompt]) { seenPrompts[resultPrompt] = 1; stats.uniquePromptCount += 1; }
          if (resultPrompt && recent.indexOf(resultPrompt) !== -1 && blocked) stats.repeatAccepted += 1;
          if (result && result.difficulty) stats.difficulty[result.difficulty] = (stats.difficulty[result.difficulty] || 0) + 1;
          expose();
          return result;
        };
        topic.gen.__wave63Wrapped = true; topic.gen.__wave63Orig = orig; report.generatorsWrapped += 1;
      });
    });
    expose();
  }
  function patchMkQ(){
    if (typeof window.mkQ !== 'function' || window.mkQ.__wave63Wrapped) return false;
    var orig = window.mkQ;
    var wrapped = function(question, answer, options, hint, tag, color, bg, code, isMath){ var q = orig.apply(this, arguments); q.isMath = !!isMath; return sanitizeQuestion(q, { grade: Number(window.GRADE_NUM || 0) || 0, topicName: cleanText(tag) }); };
    wrapped.__wave63Wrapped = true; wrapped.__wave63Orig = orig; window.mkQ = wrapped; try { mkQ = wrapped; } catch (_) {} expose(); return true;
  }
  function snapshot(){ try { return JSON.parse(JSON.stringify(report)); } catch (_) { return report; } }
  function init(){ wrapTopics(); sanitizeBankRows(); patchMkQ(); expose(); window.wave87iQuality = { auditSnapshot: snapshot }; return report; }
  init();
  var retries = 0; (function latePatch(){ var ready = patchMkQ(); if (ready || retries > 12) { expose(); return; } retries += 1; setTimeout(latePatch, 50); })();
})();
