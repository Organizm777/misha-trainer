;(() => {
  // wave87d: grade-specific split of the former monolithic wave86m gap-balance chunk.
  var VERSION = 'wave86m-gap-balance-wave87d-grade-' + String(window.GRADE_NUM || '');
  if (typeof window === 'undefined' || typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  if (window.wave86mGapBalance) return;
  var grade = String(window.GRADE_NUM || '');
  var DATA = {"6":{"subjects":[{"id":"lit","after":"his","nm":"Литература","ic":"📚","cl":"#9333ea","bg":"#f3e8ff","tops":[{"id":"ballad6_wave86m","nm":"Баллада и легенда","dot":"#7c3aed","fm":"баллада · легенда · сюжет · тайна","summary":"Тема расширяет представление о жанрах с напряжённым сюжетом и необычным событием.","ex":"Баллада часто строится вокруг драматического события, тайны или испытания героя.","facts":[["баллада","лиро-эпическое произведение с напряжённым сюжетом"],["легенда","предание о необычном событии или герое"],["лиро-эпическое произведение","текст, где есть и сюжет, и эмоциональное переживание"],["завязка","событие, с которого начинается развитие конфликта"],["кульминация","момент наивысшего напряжения в сюжете"]]},{"id":"composition6_wave86m","nm":"Композиция произведения","dot":"#2563eb","fm":"завязка · развитие · кульминация · развязка","summary":"Тема помогает видеть порядок частей произведения и их роль в раскрытии смысла.","ex":"Композиция показывает, как автор располагает события, чтобы привести читателя к главной мысли.","facts":[["композиция","построение произведения и порядок его частей"],["экспозиция","начальная часть, где представлены место, время и герои"],["конфликт","столкновение героев, взглядов или обстоятельств"],["развязка","часть сюжета, где конфликт получает итог"],["эпизод","относительно самостоятельная часть действия"]]}]}]}};
  if (!DATA[grade]) return;

  var report = {
    version: VERSION,
    grade: grade,
    applied: false,
    addedSubjects: [],
    extendedSubjects: [],
    addedTopicIds: [],
    skippedTopicIds: [],
    questionTemplates: 0,
    subjectTopicCounts: {},
    flags: {
      a4OrkseOdnknr: false,
      a5Obzh: false,
      a6Society1011: false,
      a7Literature59: false,
      b5NewTopicsHave15Templates: true,
      b6Grade11Balance: false,
      b7TopicDedupe: false,
      f7CoverageSnapshot: true
    }
  };

  function clean(v){ return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
  function esc(v){ return clean(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function rand(arr){ return arr && arr.length ? arr[(Math.random() * arr.length) | 0] : null; }
  function shuffleLocal(arr){
    var out = (arr || []).slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function findSubject(id){ return SUBJ.find(function(s){ return s && s.id === id; }) || null; }
  function insertAfter(subject, afterId){
    var existing = findSubject(subject.id);
    if (existing) return existing;
    subject.tops = [];
    var idx = SUBJ.findIndex(function(s){ return s && s.id === afterId; });
    if (idx >= 0) SUBJ.splice(idx + 1, 0, subject); else SUBJ.push(subject);
    report.addedSubjects.push(subject.id);
    return subject;
  }
  function ensureSubject(def){
    var existing = findSubject(def.id);
    if (existing) {
      if (report.extendedSubjects.indexOf(def.id) === -1) report.extendedSubjects.push(def.id);
      return existing;
    }
    return insertAfter({ id:def.id, nm:def.nm, ic:def.ic, date:'', cl:def.cl, bg:def.bg, tops:[] }, def.after);
  }
  function makeTheory(topic){
    return '<h3>' + esc(topic.nm) + '</h3>' +
      '<div class="fm">' + esc(topic.fm) + '</div>' +
      '<p>' + esc(topic.summary) + '</p>' +
      '<div class="ex"><b>Разбор:</b> ' + esc(topic.ex) + '</div>';
  }
  function pickTerms(facts, correct){
    var pool = (facts || []).map(function(f){ return clean(f[0]); }).filter(function(v){ return v && v !== correct; });
    return shuffleLocal([correct].concat(shuffleLocal(pool).slice(0, 3)));
  }
  function pickDefs(facts, correct){
    var pool = (facts || []).map(function(f){ return clean(f[1]); }).filter(function(v){ return v && v !== correct; });
    return shuffleLocal([correct].concat(shuffleLocal(pool).slice(0, 3)));
  }
  function makeGen(topic, subject){
    return function(){
      var facts = topic.facts || [];
      var fact = rand(facts) || ['', ''];
      var term = clean(fact[0]);
      var def = clean(fact[1]);
      var mode = (Math.random() * 3) | 0;
      var q, answer, options, hint;
      if (mode === 0) {
        q = 'Выбери понятие: ' + def;
        answer = term;
        options = pickTerms(facts, term);
        hint = def;
      } else if (mode === 1) {
        q = 'Что означает «' + term + '»?';
        answer = def;
        options = pickDefs(facts, def);
        hint = term + ' — ' + def;
      } else {
        q = 'Какое понятие относится к теме «' + topic.nm + '» и подходит к описанию: ' + def;
        answer = term;
        options = pickTerms(facts, term);
        hint = 'Тема: ' + topic.nm + '. ' + term + ' — ' + def;
      }
      var ex = topic.ex + ' В этом вопросе ключ — «' + term + '»: ' + def + '.';
      if (typeof mkQ === 'function') return mkQ(q, answer, options, hint, topic.nm, subject.cl, subject.bg, null, false, ex);
      return { question:q, answer:answer, options:options, hint:hint, tag:topic.nm, color:subject.cl, bg:subject.bg, ex:ex };
    };
  }

  var WAVE87A_LIT_VERSION = 'wave87a-literature-live-banks';
  var WAVE87A_LIT_SPECS = {"6":{"ballad6_wave86m":{"prefix":"Баллада и легенда.","guide":"Баллада соединяет событие, напряжение и сильное чувство; легенда хранит память о необычном.","terms":[["баллада","сюжет напряжённый, есть тайна и переживание","Это лиро-эпический жанр."],["легенда","предание рассказывает о необычном герое или событии","Легенда соединяет память и вымысел."],["лиро-эпическое произведение","в тексте есть и событие, и чувство","Лирическое и эпическое начала соединены."],["завязка","событие запускает развитие конфликта","После завязки герой вынужден действовать."],["кульминация","напряжение достигает высшей точки","Это решающий момент сюжета."],["тайна","читатель ждёт объяснения странного события","Тайна удерживает внимание."],["романтический герой","персонаж проходит исключительное испытание","Такой герой часто одинок или необычен."],["динамичный сюжет","события быстро ведут к развязке","Баллада не задерживается на быте."],["конфликт","сталкиваются долг, страх, любовь или верность","Конфликт раскрывает выбор героя."],["предание","рассказ передаётся в народной памяти","Предание связывает частное событие с традицией."],["чудесное событие","происходит нечто выходящее за обычные рамки","Чудесное усиливает испытание."],["судьба героя","развязка меняет жизнь персонажа","В балладе итог часто окончателен."],["напряжённая атмосфера","детали создают ожидание опасности","Атмосфера поддерживает тайну."],["поэтический вымысел","история прошлого художественно преображена","Легенда не равна документу."],["развязка","становится ясно, чем закончился конфликт","Развязка подводит итог действию."]]},"composition6_wave86m":{"prefix":"Композиция произведения.","guide":"Композиция показывает, как автор располагает части текста, чтобы раскрыть конфликт и смысл.","terms":[["композиция","важен порядок частей произведения","Это строение текста."],["экспозиция","читатель узнаёт место, время и героев","Экспозиция задаёт исходную ситуацию."],["конфликт","сталкиваются герои, взгляды или обстоятельства","Конфликт двигает сюжет."],["развязка","конфликт получает итог","Развязка показывает результат."],["эпизод","отдельный фрагмент действия работает на общий смысл","Эпизод связан с целым произведением."],["завязка","происходит событие, запускающее действие","Завязка нарушает равновесие."],["кульминация","напряжение достигает вершины","После кульминации исход ближе."],["сюжетная линия","эпизоды связаны причинно","Так строится цепь событий."],["кольцевая композиция","начало и финал перекликаются","Кольцо подчёркивает главную мысль."],["обратная композиция","сначала показан итог, потом причины","Нарушенный порядок создаёт интерес."],["рассказ в рассказе","один рассказ помещён внутрь другого","Вставной рассказ расширяет взгляд."],["связка эпизодов","переход объясняет смену событий","Она удерживает целостность сюжета."],["лирическое отступление","автор временно отходит от действия","Так выражается отношение автора."],["развитие действия","после завязки напряжение растёт","Эта часть ведёт к кульминации."],["открытый финал","не все вопросы получают прямой ответ","Читатель сам додумывает последствия."]]}}};
  var WAVE87A_LIT_STEMS = [
    'В отрывке важна деталь: {desc}. Какой литературный термин точнее всего помогает это объяснить?',
    'Ученик делает вывод: {desc}. Какое понятие он должен назвать?',
    'Какой термин нужен для анализа ситуации: {desc}?',
    'В разборе темы встречается признак: {desc}. Что это?',
    'Выбери понятие, без которого нельзя точно объяснить пример: {desc}.',
    'Как называется явление, если в тексте работает такой признак: {desc}?'
  ];
  function litSpec(topicId){ return WAVE87A_LIT_SPECS[grade] && WAVE87A_LIT_SPECS[grade][topicId] ? WAVE87A_LIT_SPECS[grade][topicId] : null; }
  function buildWave87aOptions(spec, answer){
    var seen = Object.create(null);
    var out = [];
    function add(v){ v = clean(v); if (!v || seen[v]) return; seen[v] = true; out.push(v); }
    var correct = clean(answer);
    add(correct);
    shuffleLocal((spec.terms || []).map(function(row){ return row[0]; })).forEach(add);
    ['сюжет','композиция','конфликт','жанр','авторская позиция','образ героя','художественная деталь','идея произведения'].forEach(add);
    var distractors = out.filter(function(v){ return v !== correct; });
    return shuffleLocal([correct].concat(shuffleLocal(distractors).slice(0, 3)));
  }
  function buildWave87aLitBank(topicId){
    var spec = litSpec(topicId);
    if (!spec || !Array.isArray(spec.terms)) return null;
    return spec.terms.map(function(row, index){
      var answer = clean(row[0]);
      var desc = clean(row[1]);
      var hint = clean(row[2]);
      var stem = WAVE87A_LIT_STEMS[index % WAVE87A_LIT_STEMS.length].replace('{desc}', desc);
      return {
        q: clean(spec.prefix) + ' ' + stem,
        a: answer,
        o: buildWave87aOptions(spec, answer),
        h: hint,
        ex: clean(spec.guide) + ' В этом задании ключевой признак: ' + desc + '. Поэтому правильный ответ — «' + answer + '». ' + hint
      };
    });
  }
  function makeWave87aLitGen(topic, subject, bank){
    return function(){
      var item = rand(bank) || bank[0];
      if (typeof mkQ === 'function') return mkQ(item.q, item.a, item.o, item.h, topic.nm, subject.cl, subject.bg, null, false, item.ex);
      return { question:item.q, answer:item.a, options:item.o, hint:item.h, tag:topic.nm, color:subject.cl, bg:subject.bg, ex:item.ex };
    };
  }


  var WAVE87B_OBZH_VERSION = 'wave87b-obzh-live-banks';
  var WAVE87B_OBZH_SCENARIOS = {};
  var WAVE87B_OBZH_STEMS = [
    'Ситуация: {scene}. Какое действие или решение безопаснее?',
    'Разбери случай: {scene}. Что нужно выбрать?',
    'Что будет правильным поведением, если {scene}?',
    'Какой вариант лучше всего снижает риск в ситуации: {scene}?',
    'Ученик объясняет ОБЖ-ситуацию: {scene}. Какой ответ верный?'
  ];
  function buildWave87bObzhOptions(rows, answer){
    var seen = Object.create(null);
    var out = [];
    function add(v){ v = clean(v); if (!v || seen[v]) return; seen[v] = true; out.push(v); }
    var correct = clean(answer);
    add(correct);
    shuffleLocal((rows || []).map(function(row){ return row[0]; })).forEach(add);
    ['проверить официальный источник','сообщить ответственному взрослому','отойти на безопасное расстояние','сохранять спокойствие'].forEach(add);
    var distractors = out.filter(function(v){ return v !== correct; });
    return shuffleLocal([correct].concat(shuffleLocal(distractors).slice(0, 3)));
  }
  function buildWave87bObzhBank(topicId){
    var rows = WAVE87B_OBZH_SCENARIOS[grade] && WAVE87B_OBZH_SCENARIOS[grade][topicId] ? WAVE87B_OBZH_SCENARIOS[grade][topicId] : null;
    if (!Array.isArray(rows)) return null;
    return rows.map(function(row, index){
      var answer = clean(row[0]);
      var scene = clean(row[1]);
      var hint = clean(row[2]);
      var stem = WAVE87B_OBZH_STEMS[index % WAVE87B_OBZH_STEMS.length].replace('{scene}', scene);
      return {
        q: stem,
        a: answer,
        o: buildWave87bObzhOptions(rows, answer),
        h: hint,
        ex: hint + ' В этой ситуации безопасный выбор — «' + answer + '», потому что он уменьшает риск для человека и не мешает работе взрослых или служб.'
      };
    }).filter(function(item){ return item.q && item.a && item.o.length >= 4 && item.o.indexOf(item.a) !== -1 && item.ex; });
  }
  function makeWave87bObzhGen(topic, subject, bank){
    return function(){
      var item = rand(bank) || bank[0];
      var options = shuffleLocal((item.o || []).slice());
      if (typeof mkQ === 'function') return mkQ(item.q, item.a, options, item.h, topic.nm, subject.cl, subject.bg, null, false, item.ex);
      return { question:item.q, answer:item.a, options:options, hint:item.h, tag:topic.nm, color:subject.cl, bg:subject.bg, ex:item.ex };
    };
  }

  function buildTopic(topic, subject){
    var facts = Array.isArray(topic.facts) ? topic.facts : [];
    var litBank = subject && subject.id === 'lit' ? buildWave87aLitBank(topic.id) : null;
    var obzhBank = subject && subject.id === 'obzh' ? buildWave87bObzhBank(topic.id) : null;
    var liveBank = (obzhBank && obzhBank.length) ? obzhBank : litBank;
    var hasLiveBank = !!(liveBank && liveBank.length);
    var liveGen = obzhBank && obzhBank.length ? makeWave87bObzhGen(topic, subject, obzhBank) : (litBank && litBank.length ? makeWave87aLitGen(topic, subject, litBank) : null);
    var sources = [VERSION];
    if (litBank && litBank.length) sources.push(WAVE87A_LIT_VERSION);
    if (obzhBank && obzhBank.length) sources.push(WAVE87B_OBZH_VERSION);
    return {
      id: topic.id,
      nm: topic.nm,
      dot: topic.dot || subject.cl,
      th: makeTheory(topic),
      gen: hasLiveBank ? liveGen : makeGen(topic, subject),
      _coverageBoosted: true,
      _coverageExtraCount: hasLiveBank ? liveBank.length : facts.length * 3,
      _coverageSources: sources,
      _wave87aLiveBank: !!(litBank && litBank.length),
      _wave87aLiveBankCount: litBank && litBank.length ? litBank.length : 0,
      _wave87bObzhLiveBank: !!(obzhBank && obzhBank.length),
      _wave87bObzhLiveBankCount: obzhBank && obzhBank.length ? obzhBank.length : 0
    };
  }
  function appendTopic(subject, topicDef){
    subject.tops = Array.isArray(subject.tops) ? subject.tops : [];
    if (subject.tops.some(function(t){ return t && t.id === topicDef.id; })) {
      report.skippedTopicIds.push(subject.id + ':' + topicDef.id);
      return false;
    }
    var topic = buildTopic(topicDef, subject);
    subject.tops.push(topic);
    report.addedTopicIds.push(subject.id + ':' + topic.id);
    report.questionTemplates += topic._coverageExtraCount || 0;
    return true;
  }
  function dedupeTopics(){
    var changed = false;
    SUBJ.forEach(function(subject){
      if (!subject || !Array.isArray(subject.tops)) return;
      var seen = Object.create(null);
      var before = subject.tops.length;
      subject.tops = subject.tops.filter(function(topic){
        if (!topic || !topic.id) return true;
        if (seen[topic.id]) return false;
        seen[topic.id] = true;
        return true;
      });
      if (subject.tops.length !== before) changed = true;
    });
    report.flags.b7TopicDedupe = changed;
  }
  function refreshHeroMeta(){
    try {
      var meta = document.querySelector('#hero-meta') || document.querySelector('#s-main .fade p');
      if (!meta) return;
      var totalTopics = SUBJ.reduce(function(sum, subj){ return sum + (((subj && subj.tops) || []).length || 0); }, 0);
      meta.textContent = String(window.GRADE_NUM || grade) + ' класс · ' + SUBJ.length + ' предметов · ' + totalTopics + ' тем';
    } catch (_e) {}
  }
  function applyFlags(){
    report.flags.a4OrkseOdnknr = ['4','5'].indexOf(grade) !== -1 && !!(findSubject('orkse') || findSubject('odnknr'));
    report.flags.a5Obzh = ['8','9','10','11'].indexOf(grade) !== -1 && !!findSubject('obzh');
    report.flags.a6Society1011 = ['10','11'].indexOf(grade) !== -1 && report.addedTopicIds.some(function(id){ return id.indexOf('soc:') === 0; });
    report.flags.a7Literature59 = ['5','6','7','8','9'].indexOf(grade) !== -1 && report.addedTopicIds.some(function(id){ return id.indexOf('lit:') === 0; });
    report.flags.b6Grade11Balance = grade === '11' && (report.addedTopicIds.some(function(id){ return id.indexOf('prob:') === 0; }) || !!findSubject('obzh'));
    report.flags.b5NewTopicsHave15Templates = report.addedTopicIds.every(function(id){
      var parts = id.split(':');
      var subj = findSubject(parts[0]);
      var topic = subj && (subj.tops || []).find(function(t){ return t && t.id === parts[1]; });
      return !topic || (topic._coverageExtraCount || 0) >= 15;
    });
  }
  function snapshotCounts(){
    SUBJ.forEach(function(subject){ report.subjectTopicCounts[subject.id] = ((subject.tops || []).length || 0); });
  }
  function publish(){
    var prev = window.__wave86mRoadmap || { version:'wave86m', grade:grade, addedTopicIds:[], addedTopicCount:0, questionTemplates:0, flags:{} };
    prev.version = 'wave86m';
    prev.grade = grade;
    prev.addedTopicIds = (prev.addedTopicIds || []).concat(report.addedTopicIds);
    prev.addedTopicCount = prev.addedTopicIds.length;
    prev.questionTemplates = (prev.questionTemplates || 0) + report.questionTemplates;
    prev.flags = Object.assign({}, prev.flags || {}, report.flags);
    prev.subjectTopicCounts = Object.assign({}, report.subjectTopicCounts);
    window.__wave86mRoadmap = prev;
    window.wave87aLiteratureBanks = {
      version: WAVE87A_LIT_VERSION,
      auditSnapshot: function(){
        var out = { version: WAVE87A_LIT_VERSION, grade: grade, topics: {}, total: 0 };
        SUBJ.forEach(function(subject){
          if (!subject || subject.id !== 'lit' || !Array.isArray(subject.tops)) return;
          subject.tops.forEach(function(topic){
            if (topic && topic._wave87aLiveBank) {
              out.topics[topic.id] = topic._wave87aLiveBankCount || 0;
              out.total += topic._wave87aLiveBankCount || 0;
            }
          });
        });
        return out;
      }
    };

    window.wave87bObzhBanks = {
      version: WAVE87B_OBZH_VERSION,
      auditSnapshot: function(){
        var out = { version: WAVE87B_OBZH_VERSION, grade: grade, topics: {}, total: 0 };
        SUBJ.forEach(function(subject){
          if (!subject || subject.id !== 'obzh' || !Array.isArray(subject.tops)) return;
          subject.tops.forEach(function(topic){
            if (topic && topic._wave87bObzhLiveBank) {
              out.topics[topic.id] = topic._wave87bObzhLiveBankCount || 0;
              out.total += topic._wave87bObzhLiveBankCount || 0;
            }
          });
        });
        return out;
      }
    };

    window.wave86mGapBalance = {
      version: VERSION,
      report: report,
      auditSnapshot: function(){
        return {
          version: VERSION,
          grade: grade,
          applied: report.applied,
          addedSubjects: report.addedSubjects.slice(),
          extendedSubjects: report.extendedSubjects.slice(),
          addedTopicIds: report.addedTopicIds.slice(),
          skippedTopicIds: report.skippedTopicIds.slice(),
          questionTemplates: report.questionTemplates,
          subjectTopicCounts: Object.assign({}, report.subjectTopicCounts),
          flags: Object.assign({}, report.flags)
        };
      }
    };
  }

  (DATA[grade].subjects || []).forEach(function(subjectDef){
    var subject = ensureSubject(subjectDef);
    (subjectDef.tops || []).forEach(function(topicDef){ appendTopic(subject, topicDef); });
  });
  dedupeTopics();
  snapshotCounts();
  report.applied = report.addedTopicIds.length > 0 || report.addedSubjects.length > 0;
  applyFlags();
  refreshHeroMeta();
  publish();
})();
