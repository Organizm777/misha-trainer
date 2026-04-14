(function(){
  if (typeof window === 'undefined') return;
  if (typeof QBANK === 'undefined' || typeof SUBJECTS === 'undefined') return;

  window.ENGLISH_DIAG_CONFIGS = {
    junior: { grades:[2,3,4], level:'A1', focus:'letters, sounds, first words, simple phrases' },
    basic: { grades:[5,6,7], level:'A2', focus:'to be, Present/Past Simple, modal verbs, everyday vocabulary' },
    middle: { grades:[8,9], level:'B1', focus:'all main tenses, passive, conditionals 0–2, word formation' },
    senior: { grades:[10,11], level:'B2-C1', focus:'mixed tenses, advanced grammar, articles, phrasal verbs, collocations' }
  };

  var EXTRA = [
    {g:2, topic:'A1', q:'Какая буква идёт после C?', opts:['D','B','E','F'], a:'D', hint:'A, B, C, D.'},
    {g:2, topic:'A1', q:'Выбери правильное: “What colour is the sun?”', opts:['yellow','purple','brown','grey'], a:'yellow', hint:'Sun = yellow in basic A1 vocabulary.'},
    {g:3, topic:'A1', q:'“I ___ eight years old.”', opts:['am','is','are','be'], a:'am', hint:'With I we use am.'},
    {g:3, topic:'A1', q:'Закончи фразу: “My name ___ Kate.”', opts:['is','am','are','be'], a:'is', hint:'My name is ...'},
    {g:4, topic:'A1', q:'Выбери правильное: “She ___ got a doll.”', opts:['has','have','is','are'], a:'has', hint:'She/he/it + has got.'},
    {g:4, topic:'A1', q:'Выбери правильный ответ: “Can you swim?”', opts:['Yes, I can.','Yes, I am.','Yes, I do.','Yes, I have.'], a:'Yes, I can.', hint:'Answer to can-question.'},
    {g:5, topic:'A2', q:'Выбери правильное: “They ___ in the park every Sunday.”', opts:['play','plays','are play','played'], a:'play', hint:'They + Present Simple base form.'},
    {g:5, topic:'A2', q:'Как правильно: “We ___ got two cats.”', opts:['have','has','are','is'], a:'have', hint:'We/you/they + have got.'},
    {g:6, topic:'A2', q:'Выбери Future form: “Look at the clouds! It ___ rain.”', opts:['is going to','will','does','has'], a:'is going to', hint:'Visible evidence → going to.'},
    {g:6, topic:'A2', q:'Выбери правильную степень сравнения: “This bag is ___ than that one.”', opts:['bigger','more big','biggest','the bigger'], a:'bigger', hint:'Short adjective → bigger.'},
    {g:7, topic:'A2', q:'Выбери правильное: “There ___ some milk in the fridge.”', opts:['is','are','am','be'], a:'is', hint:'Milk is uncountable → there is.'},
    {g:7, topic:'A2', q:'Выбери модальный глагол: “You ___ be polite to your teacher.”', opts:['must','can','would','did'], a:'must', hint:'Must = strong obligation.'},
    {g:8, topic:'B1', q:'Выбери правильное: “I ___ TV when you called.”', opts:['was watching','watched','have watched','am watching'], a:'was watching', hint:'Interrupted action in the past → Past Continuous.'},
    {g:8, topic:'B1', q:'Выбери артикль: “She wants to become ___ doctor.”', opts:['a','an','the','—'], a:'a', hint:'Doctor starts with a consonant sound.'},
    {g:9, topic:'B1', q:'Выбери условное: “If I ___ more time, I would learn Spanish.”', opts:['had','have','will have','had had'], a:'had', hint:'Second conditional → If + Past Simple.'},
    {g:9, topic:'B1', q:'Passive voice: “The homework ___ tomorrow.”', opts:['will be checked','will check','is checking','checked'], a:'will be checked', hint:'Future passive = will be + V3.'},
    {g:10, topic:'B2', q:'Выбери правильное: “This time tomorrow, I ___ on the train.”', opts:['will be travelling','travel','will travel','have travelled'], a:'will be travelling', hint:'Action in progress at a future moment.'},
    {g:10, topic:'B2', q:'Выбери dependent preposition: “She is interested ___ science.”', opts:['in','on','at','for'], a:'in', hint:'Interested in.'},
    {g:11, topic:'C1', q:'Выбери reported speech: “She said she ___ tired.”', opts:['was','is','has been','will be'], a:'was', hint:'Backshift in reported speech.'},
    {g:11, topic:'C1', q:'Выбери правильное: “Had I known, I ___ earlier.”', opts:['would have left','would leave','left','had left'], a:'would have left', hint:'Conditional inversion → third conditional meaning.'}
  ];

  var existing = Array.isArray(QBANK.english) ? QBANK.english.slice() : [];
  var seen = new Set(existing.map(function(q){ return q.q; }));
  EXTRA.forEach(function(item){ if (!seen.has(item.q)) { existing.push(item); seen.add(item.q); } });
  QBANK.english = existing;

  var subj = (SUBJECTS || []).find(function(s){ return s.id === 'english'; });
  if (subj) {
    subj.sub = '2–11 классы';
    subj.desc = 'A1 → C1: лексика, времена, grammar, exam-style English';
  }

  function mapEngLevel(result){
    var tested = ((result && result.tested) || []).map(function(pair){
      return { grade:+pair[0], ok:+((pair[1]||{}).ok||0), total:+((pair[1]||{}).total||0) };
    }).filter(function(row){ return row.total > 0; });
    if (!tested.length) return { level:'Starter', note:'Пока слишком мало данных для оценки.' };

    var mastered = tested.filter(function(row){ return row.total >= 1 && row.ok / row.total >= 0.6; }).map(function(row){ return row.grade; });
    var highest = mastered.length ? Math.max.apply(Math, mastered) : Math.max.apply(Math, tested.map(function(row){ return row.grade; }));
    var level = highest <= 4 ? 'A1' : highest <= 7 ? 'A2' : highest <= 9 ? 'B1' : highest <= 10 ? 'B2' : 'C1';
    if ((result.pct || 0) < 45) {
      if (level === 'C1') level = 'B2';
      else if (level === 'B2') level = 'B1';
      else if (level === 'B1') level = 'A2';
      else if (level === 'A2') level = 'A1';
    }
    var noteMap = {
      A1: 'База: первые слова, короткие фразы, very basic grammar.',
      A2: 'Школьный фундамент: to be, Present/Past Simple, модальные, everyday vocabulary.',
      B1: 'Уверенный школьный уровень: времена, passive, conditionals 0–2, word formation.',
      B2: 'Сильный уровень: mixed tenses, essay grammar, phrasal verbs, collocations.',
      C1: 'Продвинутый школьный уровень: advanced grammar и уверенный exam-style English.'
    };
    return { level: level, note: noteMap[level] || 'Оценивай прогресс по карте знаний и слабым темам.' };
  }

  var _origShowResult = typeof window.showResult === 'function' ? window.showResult : null;
  if (_origShowResult) {
    window.showResult = function(){
      var out = _origShowResult.apply(this, arguments);
      try {
        if (!window._diagResult || !window._diagResult.subj || window._diagResult.subj.id !== 'english') return out;
        var info = mapEngLevel(window._diagResult);
        var old = document.getElementById('eng-level-block');
        if (old) old.remove();
        var hero = document.querySelector('#s-result .res-hero');
        if (!hero || !hero.parentNode) return out;
        var block = document.createElement('div');
        block.className = 'ins-block';
        block.id = 'eng-level-block';
        block.innerHTML = '<h3>🇬🇧 English level</h3>' +
          '<div style="font-size:26px;font-weight:900;color:#2563eb;margin-bottom:6px">'+ info.level +'</div>' +
          '<p style="font-size:13px;line-height:1.6;color:var(--text);margin-bottom:8px">'+ info.note +'</p>' +
          '<p style="font-size:12px;color:var(--muted)">Уровень оценивается по самым сильным классам, которые ты прошёл в диагностике, и затем слегка корректируется общей точностью. Это не международный сертификат, а полезный ориентир внутри тренажёра.</p>';
        hero.parentNode.insertBefore(block, hero.nextSibling);
        window._diagResult.englishLevel = info.level;
      } catch(_){}
      return out;
    };
  }

  window.__engDiagMeta = {
    count: QBANK.english.length,
    minGrade: Math.min.apply(Math, QBANK.english.map(function(q){ return q.g; })),
    maxGrade: Math.max.apply(Math, QBANK.english.map(function(q){ return q.g; })),
    configs: Object.keys(window.ENGLISH_DIAG_CONFIGS || {})
  };
})();
