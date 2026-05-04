/* --- wave38_content_consolidation.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave38ContentConsolidation) return;

  var VERSION = 'wave38';
  var state = { report: null };

  function createReport(){
    return {
      version: VERSION,
      grade: Number(window.GRADE_NUM || 0) || 0,
      hasSubj: false,
      hasQBank: false,
      subjectsBefore: 0,
      subjectsAfter: 0,
      subjectDuplicatesRemoved: 0,
      topicsBefore: 0,
      topicsAfter: 0,
      topicDuplicatesRemoved: 0,
      generatorsWrapped: 0,
      rowsBefore: 0,
      rowsAfter: 0,
      rowDuplicatesRemoved: 0,
      rowInvalidRemoved: 0,
      rowSourceTagged: 0,
      mathAllBefore: 0,
      mathAllAfter: 0,
      rebuiltMathAll: false,
      lintFixes: {
        text: 0,
        options: 0,
        answerInjected: 0,
        hints: 0,
        tags: 0
      },
      bankTotals: {},
      issues: []
    };
  }
  function getReport(){
    if (!state.report) state.report = createReport();
    return state.report;
  }
  function copyReport(report){
    try { return JSON.parse(JSON.stringify(report)); } catch(_) { return report; }
  }
  function pushIssue(code, detail){
    var report = getReport();
    if (report.issues.length >= 60) return;
    report.issues.push({ code: code, detail: detail });
  }
  function cleanText(v){
    return String(v == null ? '' : v)
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function norm(v){
    return cleanText(v).toLowerCase().replace(/ё/g, 'е');
  }
  function slug(v){
    return norm(v)
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'na';
  }
  function buildSourceTag(prefix, grade, part1, part2){
    return [String(prefix || 'src'), String(grade || 'x'), slug(part1), slug(part2)].join(':');
  }
  function replaceArray(target, next){
    if (!Array.isArray(target)) return;
    target.splice(0, target.length);
    (next || []).forEach(function(item){ target.push(item); });
  }
  function sanitizeOptions(raw, answer){
    var report = getReport();
    var list = Array.isArray(raw) ? raw.slice() : [];
    var out = [];
    var seen = {};
    list.forEach(function(opt){
      var value = cleanText(opt);
      if (!value) return;
      var key = norm(value);
      if (seen[key]) {
        report.lintFixes.options += 1;
        return;
      }
      seen[key] = true;
      out.push(value);
    });
    var ans = cleanText(answer);
    if (ans) {
      var aKey = norm(ans);
      var exactIndex = out.indexOf(ans);
      if (exactIndex === -1 && seen[aKey]) {
        var normalizedIndex = out.findIndex(function(item){ return norm(item) === aKey; });
        if (normalizedIndex !== -1) {
          out[normalizedIndex] = ans;
          report.lintFixes.answerInjected += 1;
        }
      } else if (!seen[aKey]) {
        if (out.length >= 4) out = out.slice(0, 3);
        out.push(ans);
        seen[aKey] = true;
        report.lintFixes.answerInjected += 1;
      }
    }
    if (out.length > 4) {
      out = out.slice(0, 4);
      report.lintFixes.options += 1;
      if (ans) {
        var hasAnswer = out.some(function(item){ return norm(item) === norm(ans); });
        if (!hasAnswer) {
          out[out.length - 1] = ans;
          report.lintFixes.answerInjected += 1;
        }
      }
    }
    return out;
  }
  function questionKey(question, answer, topic, grade){
    return [String(grade || ''), norm(topic), norm(question), norm(answer)].join('|');
  }
  function ensureGradeQuestion(question, meta){
    if (!question || typeof question !== 'object') {
      pushIssue('bad-grade-question', meta.sourceTag);
      return question;
    }
    var report = getReport();
    var qText = cleanText(question.question != null ? question.question : question.q);
    var aText = cleanText(question.answer != null ? question.answer : question.a);
    var hint = cleanText(question.hint != null ? question.hint : question.h);
    var tag = cleanText(question.tag != null ? question.tag : meta.topicName);
    var options = sanitizeOptions(question.options != null ? question.options : question.opts, aText);

    if (!qText && tag) {
      qText = 'Выбери верный ответ по теме «' + tag + '»';
      report.lintFixes.text += 1;
    }
    if (!tag && meta.topicName) {
      tag = cleanText(meta.topicName);
      report.lintFixes.tags += 1;
    }
    if (!hint && tag) {
      hint = 'Тема: ' + tag;
      report.lintFixes.hints += 1;
    }
    if (options.length < 2 || !qText || !aText) {
      pushIssue('degraded-grade-question', meta.sourceTag + '|' + qText);
    }

    question.question = qText;
    question.answer = aText;
    question.options = options;
    question.hint = hint;
    question.tag = tag;
    question.subjectId = question.subjectId || meta.subjectId || '';
    question.topicId = question.topicId || meta.topicId || '';
    question.sourceTag = meta.sourceTag;
    question.grade = question.grade || meta.grade || report.grade || 0;
    question.__wave38 = {
      sourceTag: meta.sourceTag,
      key: questionKey(qText, aText, tag || meta.topicId || meta.subjectId, meta.grade || report.grade || 0),
      subjectId: meta.subjectId || '',
      topicId: meta.topicId || '',
      grade: meta.grade || report.grade || 0
    };
    if ('q' in question) question.q = qText;
    if ('a' in question) question.a = aText;
    if ('opts' in question) question.opts = options.slice();
    if ('h' in question) question.h = hint;
    return question;
  }
  function normalizeBankRow(row, bankKey){
    var report = getReport();
    if (!row || typeof row !== 'object') return null;
    var grade = Number(row.g != null ? row.g : (row.grade != null ? row.grade : row.cls));
    var question = cleanText(row.q != null ? row.q : row.question);
    var answer = cleanText(row.a != null ? row.a : row.answer);
    var topic = cleanText(row.topic != null ? row.topic : (row.tag != null ? row.tag : bankKey));
    var hint = cleanText(row.hint != null ? row.hint : row.h);
    var options = sanitizeOptions(row.opts != null ? row.opts : row.options, answer);
    if (!Number.isFinite(grade) || !question || !answer || options.length < 2) return null;

    var out = {};
    Object.keys(row).forEach(function(key){
      if (key === '__wave38') return;
      out[key] = row[key];
    });

    if (!hint && topic) {
      hint = 'Тема: ' + topic;
      report.lintFixes.hints += 1;
    }

    out.g = grade;
    out.q = question;
    out.a = answer;
    out.topic = topic || bankKey;
    out.opts = options;
    out.hint = hint;
    out.bankSource = bankKey;
    out.sourceTag = buildSourceTag('diag', grade, bankKey, topic || bankKey);
    out.__wave38 = {
      sourceTag: out.sourceTag,
      key: questionKey(question, answer, topic || bankKey, grade),
      bankKey: bankKey,
      grade: grade
    };
    report.rowSourceTagged += 1;
    return out;
  }
  function mergeSubjects(subjects){
    var report = getReport();
    var order = [];
    var seen = {};
    (subjects || []).forEach(function(subject){
      if (!subject || typeof subject !== 'object') return;
      report.subjectsBefore += 1;
      var key = subject.id ? 'id:' + norm(subject.id) : 'nm:' + norm(subject.nm || subject.name || '');
      if (!key || key === 'id:' || key === 'nm:') {
        order.push(subject);
        return;
      }
      if (!seen[key]) {
        seen[key] = subject;
        order.push(subject);
        return;
      }
      report.subjectDuplicatesRemoved += 1;
      var target = seen[key];
      if (!target.nm && subject.nm) target.nm = subject.nm;
      if (!target.name && subject.name) target.name = subject.name;
      ['ic','date','cl','bg','unlockAt','locked'].forEach(function(field){
        if ((target[field] == null || target[field] === '') && subject[field] != null && subject[field] !== '') {
          target[field] = subject[field];
        }
      });
      target.tops = (target.tops || []).concat(subject.tops || []);
    });
    report.subjectsAfter = order.length;
    return order;
  }
  function mergeTopicArrays(topicList, subjectId){
    var report = getReport();
    var order = [];
    var seen = {};
    (topicList || []).forEach(function(topic){
      if (!topic || typeof topic !== 'object') return;
      report.topicsBefore += 1;
      var key = topic.id ? 'id:' + norm(topic.id) : 'nm:' + norm(topic.nm || topic.name || '');
      if (!key || key === 'id:' || key === 'nm:') {
        order.push(topic);
        return;
      }
      if (!seen[key]) {
        seen[key] = topic;
        order.push(topic);
        return;
      }
      report.topicDuplicatesRemoved += 1;
      var base = seen[key];
      ['nm','name','th','dot','color','bg'].forEach(function(field){
        if ((base[field] == null || base[field] === '') && topic[field] != null && topic[field] !== '') {
          base[field] = topic[field];
        }
      });
      if (typeof base.gen !== 'function' && typeof topic.gen === 'function') base.gen = topic.gen;
      if (Array.isArray(topic.rows)) base.rows = (base.rows || []).concat(topic.rows);
      if (Array.isArray(topic.items)) base.items = (base.items || []).concat(topic.items);
    });
    report.topicsAfter += order.length;
    order.forEach(function(topic){ wrapTopicGenerator(topic, subjectId); });
    return order;
  }
  function wrapTopicGenerator(topic, subjectId){
    var report = getReport();
    if (!topic || typeof topic.gen !== 'function') return;
    if (topic.gen.__wave38Wrapped) return;
    var original = topic.gen;
    var sourceTag = buildSourceTag('grade', report.grade || 0, subjectId || 'subject', topic.id || topic.nm || topic.name || 'topic');
    topic.__wave38SourceTag = sourceTag;
    topic.gen = function(){
      var result = original.apply(this, arguments);
      return ensureGradeQuestion(result, {
        sourceTag: sourceTag,
        grade: report.grade || 0,
        subjectId: subjectId || '',
        topicId: topic.id || '',
        topicName: topic.nm || topic.name || topic.id || ''
      });
    };
    topic.gen.__wave38Wrapped = true;
    topic.gen.__wave38Orig = original;
    report.generatorsWrapped += 1;
  }
  function consolidateSubjects(){
    if (typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
    var report = getReport();
    report.hasSubj = true;
    var mergedSubjects = mergeSubjects(SUBJ);
    mergedSubjects.forEach(function(subject){
      var nextTopics = mergeTopicArrays(subject.tops || [], subject.id || subject.nm || 'subject');
      replaceArray(subject.tops || (subject.tops = []), nextTopics);
    });
    replaceArray(SUBJ, mergedSubjects);
    try { window.SUBJ = SUBJ; } catch(_) {}
  }
  function sanitizeBankList(rows, bankKey){
    var report = getReport();
    var seen = {};
    var out = [];
    report.rowsBefore += Array.isArray(rows) ? rows.length : 0;
    (rows || []).forEach(function(row){
      var next = normalizeBankRow(row, bankKey);
      if (!next) {
        report.rowInvalidRemoved += 1;
        return;
      }
      var key = next.__wave38.key;
      if (seen[key]) {
        report.rowDuplicatesRemoved += 1;
        return;
      }
      seen[key] = true;
      out.push(next);
    });
    report.rowsAfter += out.length;
    report.bankTotals[bankKey] = out.length;
    return out;
  }
  function consolidateBanks(){
    if (typeof QBANK === 'undefined' || !QBANK || typeof QBANK !== 'object') return;
    var report = getReport();
    report.hasQBank = true;
    var keys = Object.keys(QBANK).filter(function(key){ return key !== 'mathall'; });
    keys.forEach(function(key){
      if (!Array.isArray(QBANK[key])) return;
      QBANK[key] = sanitizeBankList(QBANK[key], key);
    });
    report.mathAllBefore = Array.isArray(QBANK.mathall) ? QBANK.mathall.length : 0;
    if (Array.isArray(QBANK.math) || Array.isArray(QBANK.algebra) || Array.isArray(QBANK.geometry)) {
      var combined = []
        .concat(Array.isArray(QBANK.math) ? QBANK.math : [])
        .concat(Array.isArray(QBANK.algebra) ? QBANK.algebra : [])
        .concat(Array.isArray(QBANK.geometry) ? QBANK.geometry : []);
      QBANK.mathall = sanitizeBankList(combined, 'mathall').filter(function(row){ return Number(row.g || 0) >= 3; });
      report.mathAllAfter = QBANK.mathall.length;
      report.rebuiltMathAll = true;
      report.bankTotals.mathall = QBANK.mathall.length;
    } else if (Array.isArray(QBANK.mathall)) {
      QBANK.mathall = sanitizeBankList(QBANK.mathall, 'mathall');
      report.mathAllAfter = QBANK.mathall.length;
      report.bankTotals.mathall = QBANK.mathall.length;
    }
  }
  function run(){
    state.report = createReport();
    consolidateSubjects();
    consolidateBanks();
    window.WAVE38_CONTENT_REPORT = copyReport(state.report);
    return state.report;
  }

  window.wave38ContentConsolidation = {
    version: VERSION,
    run: run,
    get report(){ return state.report || createReport(); },
    auditSnapshot: function(){ return copyReport(state.report || createReport()); },
    buildSourceTag: buildSourceTag,
    ensureGradeQuestion: ensureGradeQuestion,
    normalizeBankRow: normalizeBankRow
  };

  run();
})();
//# sourceMappingURL=chunk_subject_expansion_wave38_content_consolidation.c6477aad95.js.map
