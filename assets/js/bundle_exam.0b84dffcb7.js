/* --- wave30_exam.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave30Exam) return;

  var VERSION = 'wave30';
  var EXAM_HISTORY_KEY = 'trainer_exam_history_v1';
  var EXAM_HASH_KEY = 'exam';
  var STYLE_ID = 'wave30-exam-style';
  var MAX_HISTORY = 80;
  var EXAM_ACTION_ATTR = 'data-wave89u-exam-action';
  var EXAM_PACK_ATTR = 'data-wave89u-pack-id';
  var EXAM_TASK_ATTR = 'data-wave90b-task-index';
  var EXAM_REVIEW_ID = 'wave30-exam-review';

  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total > 0 ? Math.round(ok / total * 100) : 0; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function hasFn(fn){ return typeof fn === 'function'; }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(list){
    var out = (list || []).slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function hashSeed(seed){
    var str = String(seed == null ? '' : seed);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededRandomFactory(seed){
    var state = hashSeed(seed) || 123456789;
    return function(){
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  function stableShuffle(list, seed){
    var out = (list || []).slice();
    var rnd = seededRandomFactory(seed);
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function safeJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) {
      return fallback;
    }
  }
  function saveJSON(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {}
  }
  function fmtTime(sec){
    sec = Math.max(0, toNum(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
  function fmtDate(ts){
    try { return new Date(ts).toLocaleDateString('ru-RU', { day:'numeric', month:'short' }).replace('.', ''); } catch(_) { return '—'; }
  }
  function readHashParam(key){
    try {
      var hash = String(location.hash || '').replace(/^#/, '');
      if (!hash) return '';
      var parts = hash.split('&');
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split('=');
        if (pair[0] === key) return decodeURIComponent(pair.slice(1).join('='));
      }
    } catch(_) {}
    return '';
  }
  function setHashParam(key, value){
    try {
      var hash = String(location.hash || '').replace(/^#/, '');
      var pairs = hash ? hash.split('&').filter(Boolean) : [];
      var next = [];
      var found = false;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair[0] === key) {
          if (value) next.push(key + '=' + encodeURIComponent(value));
          found = true;
        } else {
          next.push(pairs[i]);
        }
      }
      if (!found && value) next.push(key + '=' + encodeURIComponent(value));
      var hashValue = next.join('&');
      if (history && history.replaceState) history.replaceState(null, '', hashValue ? ('#' + hashValue) : location.pathname + location.search);
    } catch(_) {}
  }
  function dedupeQuestions(rows){
    var seen = new Set();
    var out = [];
    (rows || []).forEach(function(row){
      if (!row || !row.q || !Array.isArray(row.opts) || !row.a) return;
      var key = String(row.q) + '|' + String(row.a);
      if (seen.has(key)) return;
      seen.add(key);
      out.push(row);
    });
    return out;
  }
  function cloneQuestion(row, meta){
    var out = {
      g: toNum(row.g) || 9,
      topic: row.topic || 'Экзамен',
      q: row.q,
      opts: (row.opts || []).slice(),
      a: row.a,
      hint: row.hint || 'Разбор — после результата.',
      ex: row.ex || row.explanation || '',
      criteria: Array.isArray(row.criteria) ? row.criteria.slice() : (row.criteria || ''),
      code: row.code || '',
      isMath: !!row.isMath,
      inputMode: row.inputMode || '',
      interactionType: row.interactionType || row.type || '',
      acceptedAnswers: Array.isArray(row.acceptedAnswers) ? row.acceptedAnswers.slice() : [],
      answers: Array.isArray(row.answers) ? row.answers.slice() : [],
      correctAnswers: Array.isArray(row.correctAnswers) ? row.correctAnswers.slice() : [],
      sequenceItems: Array.isArray(row.sequenceItems) ? row.sequenceItems.slice() : [],
      sequencePool: Array.isArray(row.sequencePool) ? row.sequencePool.slice() : [],
      matchPairs: Array.isArray(row.matchPairs) ? row.matchPairs.map(function(pair){ return Array.isArray(pair) ? pair.slice() : pair; }) : [],
      matchOptions: Array.isArray(row.matchOptions) ? row.matchOptions.slice() : [],
      sourceTag: row.sourceTag || row.wave38Source || '',
      bankSource: row.bankSource || '',
      __wave38: row.__wave38 || null
    };
    if (meta) {
      Object.keys(meta).forEach(function(key){ out[key] = meta[key]; });
    }
    return out;
  }
  function questionKey(row){ return String((row && row.q) || '') + '|' + String((row && row.a) || ''); }
  function topicMatch(row, patterns){
    if (!patterns || !patterns.length) return true;
    var text = String((row && row.topic) || '').toLowerCase();
    var qText = String((row && row.q) || '').toLowerCase();
    for (var i = 0; i < patterns.length; i++) {
      var token = String(patterns[i] || '').toLowerCase();
      if (!token) continue;
      if (text.indexOf(token) !== -1 || qText.indexOf(token) !== -1) return true;
    }
    return false;
  }
  function subjectRows(subjectId){
    if (typeof QBANK === 'undefined') return [];
    return Array.isArray(QBANK[subjectId]) ? QBANK[subjectId].slice() : [];
  }
  function collectRows(source){
    var out = [];
    var ids = source.subjects || (source.subject ? [source.subject] : []);
    ids.forEach(function(id){ out = out.concat(subjectRows(id)); });
    if (Array.isArray(source.boosters)) out = out.concat(source.boosters);
    out = dedupeQuestions(out).filter(function(row){
      var grade = toNum(row.g);
      if (source.minG && grade < source.minG) return false;
      if (source.maxG && grade > source.maxG) return false;
      if (source.topics && source.topics.length && !topicMatch(row, source.topics)) return false;
      if (source.excludeTopics && source.excludeTopics.length && topicMatch(row, source.excludeTopics)) return false;
      return true;
    });
    return out;
  }
  function fallbackPool(pack){
    var rows = [];
    (pack.fallbackSubjects || [pack.subjectId]).forEach(function(id){ rows = rows.concat(subjectRows(id)); });
    rows = dedupeQuestions(rows).filter(function(row){
      var g = toNum(row.g);
      return g >= toNum(pack.minG || 1) && g <= toNum(pack.maxG || 11);
    });
    return rows;
  }
  function pickUnique(rows, used, count, seed){
    var out = [];
    var shuffled = seed ? stableShuffle(rows, seed) : shuffle(rows);
    for (var i = 0; i < shuffled.length && out.length < count; i++) {
      var key = questionKey(shuffled[i]);
      if (used.has(key)) continue;
      used.add(key);
      out.push(shuffled[i]);
    }
    return out;
  }
  function lastByPack(history){
    var map = {};
    (history || []).forEach(function(row){
      if (row && row.packId && !map[row.packId]) map[row.packId] = row;
    });
    return map;
  }
  function loadHistory(){
    var rows = safeJSON(EXAM_HISTORY_KEY, []);
    if (!Array.isArray(rows)) rows = [];
    rows.sort(function(a, b){ return toNum(b.ts) - toNum(a.ts); });
    return rows;
  }
  function saveExamEntry(entry){
    var rows = loadHistory();
    rows.unshift(entry);
    saveJSON(EXAM_HISTORY_KEY, rows.slice(0, MAX_HISTORY));
  }
  function colorForPct(value){
    value = toNum(value);
    if (value >= 80) return 'var(--green)';
    if (value >= 60) return 'var(--accent)';
    if (value >= 45) return 'var(--orange)';
    return 'var(--red)';
  }
  function hexToRgba(hex, alpha){
    try {
      var raw = String(hex || '').replace('#','').trim();
      if (raw.length === 3) raw = raw.split('').map(function(ch){ return ch + ch; }).join('');
      if (raw.length !== 6) return 'rgba(37,99,235,' + alpha + ')';
      var r = parseInt(raw.slice(0,2), 16);
      var g = parseInt(raw.slice(2,4), 16);
      var b = parseInt(raw.slice(4,6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    } catch(_) { return 'rgba(37,99,235,' + alpha + ')'; }
  }

  function scoreColorHex(value){
    value = toNum(value);
    if (value >= 80) return '#16a34a';
    if (value >= 60) return '#2563eb';
    if (value >= 45) return '#f59e0b';
    return '#dc2626';
  }
  function scoreValue(row){
    if (!row) return 0;
    return toNum(row.score100 != null ? row.score100 : row.pct);
  }
  function examSubjectLabel(subjectId, packLabel){
    var map = {
      mathall: 'Математика',
      algebra: 'Математика',
      geometry: 'Геометрия',
      russian: 'Русский язык',
      english: 'Английский язык',
      physics: 'Физика',
      social: 'Обществознание',
      informatics: 'Информатика'
    };
    if (map[subjectId]) return map[subjectId];
    var label = String(packLabel || '').replace(/^ОГЭ\s*·\s*/, '').replace(/^ЕГЭ\s*·\s*/, '');
    if (!label) return 'Предмет';
    return label.split(' · ')[0];
  }
  function renderTrendBars(series, accent){
    series = Array.isArray(series) ? series.slice(-6) : [];
    return '<div style="display:flex;align-items:flex-end;gap:4px;height:38px;margin-top:8px">' + series.map(function(v){
      var h = Math.max(6, Math.round(toNum(v) * 0.36));
      return '<span style="flex:1;min-width:0;height:' + h + 'px;background:' + esc(hexToRgba(accent, 0.78)) + ';border:1px solid ' + esc(hexToRgba(accent, 0.98)) + ';border-radius:6px 6px 2px 2px;display:block"></span>';
    }).join('') + '</div>';
  }
  function buildExamTrendBlock(history){
    history = Array.isArray(history) ? history.slice() : [];
    if (!history.length) return '';
    var groups = {};
    history.forEach(function(row){
      if (!row || !row.packLabel) return;
      var key = String(row.exam || 'Экзамен') + '|' + examSubjectLabel(row.subjectId, row.packLabel);
      if (!groups[key]) groups[key] = {
        exam: String(row.exam || 'Экзамен'),
        subject: examSubjectLabel(row.subjectId, row.packLabel),
        latest: row,
        series: []
      };
      if (groups[key].series.length < 6) groups[key].series.unshift(scoreValue(row));
    });
    var cards = Object.keys(groups).map(function(key){ return groups[key]; }).sort(function(a, b){ return scoreValue(b.latest) - scoreValue(a.latest); }).slice(0, 4);
    if (!cards.length) return '';
    return '<div class="wave30-dash-card" style="margin-top:8px"><div class="wave30-dash-k">Динамика по предметам</div><div class="wave30-dash-sub">Последние попытки по экзаменационным предметам</div><div class="wave30-dash-grid" style="margin-top:10px">' + cards.map(function(card){
      var latestScore = scoreValue(card.latest);
      var accent = scoreColorHex(latestScore);
      return '<div class="wave30-dash-card" style="padding:12px"><div class="wave30-dash-k">' + esc(card.exam) + '</div><div class="wave30-dash-name">' + esc(card.subject) + '</div><div class="wave30-dash-sub">Последний ориентир: ' + esc(card.latest.bandLabel || '—') + ' · ' + esc(String(latestScore)) + (card.latest.score100 != null ? '/100' : '%') + '</div>' + renderTrendBars(card.series, accent) + '</div>';
    }).join('') + '</div></div>';
  }
  function setDiagShellState(mode){
    try {
      if (!document.body) return;
      document.body.setAttribute('data-trainer-screen', mode === 'immersive' ? 'immersive' : 'browse');
    } catch(_) {}
  }

  var CURATED = {
    oge_math: [
      {g:9, topic:'Практика', q:'Курс стоил 2400 ₽. Дали скидку 15%. Сколько нужно заплатить?', opts:['2040 ₽','2160 ₽','1800 ₽','2250 ₽'], a:'2040 ₽', hint:'15% от 2400 = 360, значит 2400 − 360 = 2040.'},
      {g:9, topic:'Вероятность', q:'В мешке 5 белых и 3 чёрных шара. Какова вероятность вынуть белый шар?', opts:['5/8','3/8','1/2','5/3'], a:'5/8', hint:'Благоприятных исходов 5, всего 8.'},
      {g:9, topic:'Геометрия', q:'Сумма двух углов треугольника 110°. Третий угол равен:', opts:['70°','60°','80°','90°'], a:'70°', hint:'Сумма углов треугольника равна 180°.'},
      {g:9, topic:'Графики', q:'Если y = 3x − 2, то значение y при x = 4 равно:', opts:['10','12','8','14'], a:'10', hint:'3·4 − 2 = 10.'}
    ],
    oge_russian: [
      {g:9, topic:'Орфография', q:'В каком слове пишется НН?', opts:['жареННый','ткаНый','ветреНый','румяНый'], a:'жареННый', hint:'В страдательных причастиях часто пишется НН.'},
      {g:9, topic:'Орфография', q:'Выбери слово с приставкой ПРИ-.', opts:['пр..ехать в город','пр..красный день','пр..одолеть страх','пр..увеличить'], a:'пр..ехать в город', hint:'При- обычно означает приближение.'},
      {g:9, topic:'Пунктуация', q:'Где нужна запятая? «Когда стемнело ___ мы вернулись домой».', opts:['после слова «стемнело»','запятая не нужна','после слова «мы»','перед словом «домой»'], a:'после слова «стемнело»', hint:'Придаточное времени отделяется запятой.'},
      {g:9, topic:'Пунктуация', q:'Укажи предложение с вводным словом.', opts:['К счастью, поезд успел вовремя.','Поезд успел вовремя и все сели.','Поезд приехал вовремя потому что не было пробок.','Поезд успел вовремя но мы всё равно волновались.'], a:'К счастью, поезд успел вовремя.', hint:'«К счастью» — вводное сочетание.'},
      {g:9, topic:'Языковые нормы', q:'Выбери речевую норму без ошибки.', opts:['более точный ответ','самый оптимальный путь','одеть пальто на брата','вернуться обратно назад'], a:'более точный ответ', hint:'Остальные варианты содержат речевую избыточность или лексическую ошибку.'},
      {g:9, topic:'Текст', q:'Как чаще всего связываются соседние предложения в тексте?', opts:['местоимением или лексическим повтором','только тире','только двоеточием','только союзом «и»'], a:'местоимением или лексическим повтором', hint:'Это типичные средства связи предложений.'}
    ],
    oge_informatics: [
      {g:9, topic:'Системы счисления', q:'Чему равно двоичное число 1010₂ в десятичной записи?', opts:['10','8','12','14'], a:'10', hint:'8 + 2 = 10.'},
      {g:9, topic:'Логика', q:'Какое значение выражения ИСТИНА И ЛОЖЬ?', opts:['ЛОЖЬ','ИСТИНА','1','Невозможно определить'], a:'ЛОЖЬ', hint:'Конъюнкция истинна только если оба операнда истинны.'},
      {g:9, topic:'Программирование', q:'Сколько раз выполнится цикл for i in range(4)?', opts:['4','3','5','2'], a:'4', hint:'range(4) даёт 0,1,2,3.'},
      {g:9, topic:'Файлы', q:'Файл объёмом 2048 байт — это примерно:', opts:['2 КБ','20 КБ','0.2 КБ','200 КБ'], a:'2 КБ', hint:'1 КБ = 1024 байта.'}
    ],
    oge_physics: [
      {g:9, topic:'Кинематика', q:'Тело прошло 120 м за 20 с. Скорость равна:', opts:['6 м/с','5 м/с','4 м/с','8 м/с'], a:'6 м/с', hint:'v = s / t = 120 / 20.'},
      {g:9, topic:'Ток', q:'При напряжении 12 В и сопротивлении 4 Ом сила тока равна:', opts:['3 А','4 А','2 А','48 А'], a:'3 А', hint:'I = U / R.'},
      {g:9, topic:'Работа', q:'Работа силы 20 Н на пути 5 м равна:', opts:['100 Дж','25 Дж','4 Дж','400 Дж'], a:'100 Дж', hint:'A = F·s.'},
      {g:9, topic:'Тепло', q:'Какой процесс сопровождается поглощением теплоты?', opts:['плавление льда','замерзание воды','конденсация пара','охлаждение тела'], a:'плавление льда', hint:'При плавлении вещество получает теплоту.'}
    ],
    ege_base_math: [
      {g:11, topic:'Вероятность', q:'Игральный кубик бросили один раз. Вероятность выпадения числа больше 4 равна:', opts:['1/3','1/2','1/6','2/3'], a:'1/3', hint:'Подходят 5 и 6: 2 исхода из 6.'},
      {g:11, topic:'Практика', q:'Поездка заняла 3 часа 20 минут. Сколько это минут?', opts:['200','180','210','220'], a:'200', hint:'3·60 + 20 = 200.'},
      {g:11, topic:'Планиметрия', q:'Площадь прямоугольника со сторонами 7 и 9 равна:', opts:['63','32','16','56'], a:'63', hint:'S = a·b.'},
      {g:11, topic:'Функции', q:'Если y = 2x + 1, то y при x = −3 равно:', opts:['−5','−7','7','5'], a:'−5', hint:'2·(−3) + 1 = −5.'}
    ],
    ege_profile_math: [
      {g:11, topic:'Логарифмы', q:'log₂8 =', opts:['3','4','2','8'], a:'3', hint:'2³ = 8.'},
      {g:11, topic:'Производная', q:'Производная функции y = 5x² равна:', opts:['10x','5x','10x²','2x'], a:'10x', hint:'(ax²)ʼ = 2ax.'},
      {g:11, topic:'Вероятность', q:'В группе 10 студентов, из них 4 девушки. Вероятность случайно выбрать девушку равна:', opts:['0.4','0.6','0.25','0.5'], a:'0.4', hint:'4 / 10 = 0.4.'},
      {g:11, topic:'Стереометрия', q:'Сколько рёбер у куба?', opts:['12','8','6','10'], a:'12', hint:'У куба 12 рёбер.'}
    ],
    ege_russian: [
      {g:11, topic:'Орфография', q:'Выбери слово, где пропущена буква И.', opts:['расст..лать','заж..гать','соб..рать','зам..реть'], a:'соб..рать', hint:'Собирать — корень с чередованием И/Е.'},
      {g:11, topic:'Пунктуация', q:'Нужна ли запятая: «Он знал что поезд задержится».', opts:['да, после слова «знал»','нет, не нужна','да, после слова «поезд»','да, перед словом «поезд»'], a:'да, после слова «знал»', hint:'СПП: перед союзом «что» ставится запятая.'},
      {g:11, topic:'Речь', q:'В каком варианте нет речевой ошибки?', opts:['оказать влияние на ситуацию','играть большое значение','самый лучший вариант из возможных','подняться вверх наверх'], a:'оказать влияние на ситуацию', hint:'Остальные варианты содержат речевую ошибку или избыточность.'},
      {g:11, topic:'Текст', q:'Какое средство выразительности используется в сочетании «золотые руки»?', opts:['эпитет','метафора','анафора','градация'], a:'метафора', hint:'Переносное значение по сходству.'},
      {g:11, topic:'Синтаксис', q:'Укажи сложноподчинённое предложение.', opts:['Я понял, что ответ найден.','Ответ найден, и все обрадовались.','Ответ найден: задача решена.','Ответ найден — задача решена.'], a:'Я понял, что ответ найден.', hint:'Есть главное и придаточное предложение с союзом «что».'}
    ],
    ege_english: [
      {g:11, topic:'Grammar', q:'Choose the correct form: By next June, she ___ the course.', opts:['will have finished','finishes','has finished','finished'], a:'will have finished', hint:'Future Perfect for an action completed by a future moment.'},
      {g:11, topic:'Word formation', q:'Complete the sentence: Her answer was very ___. (CARE)', opts:['careful','careless','carefully','care'], a:'careful', hint:'A noun phrase needs an adjective.'},
      {g:11, topic:'Linkers', q:'Choose the linker: ___ he was tired, he finished the task.', opts:['Although','Because of','Despite of','Since of'], a:'Although', hint:'Although + clause.'},
      {g:11, topic:'Vocabulary', q:'Choose the best option: We need to ___ attention to the details.', opts:['pay','do','make','take'], a:'pay', hint:'The fixed phrase is pay attention.'}
    ]
  };

  var EXAM_PACKS = {
    oge_math: {
      id: 'oge_math',
      exam: 'ОГЭ',
      label: 'ОГЭ · Математика',
      subjectId: 'mathall',
      fallbackSubjects: ['mathall', 'algebra', 'geometry'],
      accent: '#2563eb',
      grades: '8–9',
      minG: 7,
      maxG: 9,
      maxQ: 15,
      timeLimit: 25 * 60,
      scoreKind: 'grade',
      summary: 'числа, алгебра, геометрия, вероятность',
      bands: [
        { min: 0, label: '2', note: 'ниже базового уровня' },
        { min: 6, label: '3', note: 'базовый уровень' },
        { min: 10, label: '4', note: 'уверенный уровень' },
        { min: 13, label: '5', note: 'высокий уровень' }
      ],
      sections: [
        { label:'Числа и вычисления', count:4, points:1, sources:[{ subjects:['mathall'], minG:7, maxG:9, topics:['арифмет','дроб','процент','нод','нок','пропорц','отрицат'] }] },
        { label:'Алгебра', count:5, points:1, sources:[{ subject:'algebra', minG:7, maxG:9 }] },
        { label:'Геометрия', count:4, points:1, sources:[{ subject:'geometry', minG:7, maxG:9 }] },
        { label:'Практика и вероятность', count:2, points:2, sources:[{ subjects:['mathall'], minG:8, maxG:9, topics:['вероятн','статист','задач','геометр'] }, { boosters: CURATED.oge_math }] }
      ]
    },
    oge_russian: {
      id: 'oge_russian',
      exam: 'ОГЭ',
      label: 'ОГЭ · Русский язык',
      subjectId: 'russian',
      fallbackSubjects: ['russian'],
      accent: '#16a34a',
      grades: '8–9',
      minG: 8,
      maxG: 9,
      maxQ: 12,
      timeLimit: 25 * 60,
      scoreKind: 'grade',
      summary: 'орфография, пунктуация, нормы, текст',
      bands: [
        { min: 0, label: '2', note: 'нужно добрать базовые баллы' },
        { min: 5, label: '3', note: 'базовый зачёт' },
        { min: 8, label: '4', note: 'хороший темп' },
        { min: 11, label: '5', note: 'сильная предметная база' }
      ],
      sections: [
        { label:'Орфография', count:4, points:1, sources:[{ subject:'russian', minG:8, maxG:9, topics:['н и нн','пре','при'] }, { boosters: CURATED.oge_russian.slice(0,2) }] },
        { label:'Пунктуация', count:4, points:1, sources:[{ subject:'russian', minG:8, maxG:9, topics:['спп','бсп','однород','вводн'] }, { boosters: CURATED.oge_russian.slice(2,4) }] },
        { label:'Языковые нормы', count:2, points:2, sources:[{ boosters: CURATED.oge_russian.slice(4,5) }, { subject:'russian', minG:8, maxG:9 }] },
        { label:'Анализ текста', count:2, points:1, sources:[{ boosters: CURATED.oge_russian.slice(5) }, { subject:'russian', minG:8, maxG:9 }] }
      ]
    },
    oge_informatics: {
      id: 'oge_informatics',
      exam: 'ОГЭ',
      label: 'ОГЭ · Информатика',
      subjectId: 'informatics',
      fallbackSubjects: ['informatics'],
      accent: '#1a1a2e',
      grades: '8–9',
      minG: 8,
      maxG: 9,
      maxQ: 12,
      timeLimit: 25 * 60,
      scoreKind: 'grade',
      summary: 'логика, кодирование, Python, файлы',
      bands: [
        { min: 0, label: '2', note: 'ниже порога' },
        { min: 5, label: '3', note: 'базовый уровень' },
        { min: 8, label: '4', note: 'уверенный уровень' },
        { min: 10, label: '5', note: 'сильный exam-core' }
      ],
      sections: [
        { label:'Логика и кодирование', count:4, points:1, sources:[{ subject:'informatics', minG:8, maxG:9, topics:['логик','кодир'] }, { boosters: CURATED.oge_informatics.slice(0,2) }] },
        { label:'Программирование', count:4, points:1, sources:[{ subject:'informatics', minG:8, maxG:9, topics:['python','программ'] }, { boosters: CURATED.oge_informatics.slice(2,3) }] },
        { label:'Системы счисления', count:2, points:1, sources:[{ subject:'informatics', minG:8, maxG:9, topics:['системы счисления'] }, { boosters: CURATED.oge_informatics.slice(0,1) }] },
        { label:'Файлы и данные', count:2, points:2, sources:[{ subject:'informatics', minG:8, maxG:9, topics:['файлы'] }, { boosters: CURATED.oge_informatics.slice(3) }] }
      ]
    },
    oge_physics: {
      id: 'oge_physics',
      exam: 'ОГЭ',
      label: 'ОГЭ · Физика',
      subjectId: 'physics',
      fallbackSubjects: ['physics'],
      accent: '#dc2626',
      grades: '8–9',
      minG: 8,
      maxG: 9,
      maxQ: 12,
      timeLimit: 25 * 60,
      scoreKind: 'grade',
      summary: 'механика, тепло, ток, практические расчёты',
      bands: [
        { min: 0, label: '2', note: 'ниже базового уровня' },
        { min: 5, label: '3', note: 'базовый уровень' },
        { min: 8, label: '4', note: 'хорошая база' },
        { min: 11, label: '5', note: 'сильная физика' }
      ],
      sections: [
        { label:'Механика', count:3, points:1, sources:[{ subject:'physics', minG:8, maxG:9, topics:['кинемат','динам','импульс'] }, { boosters: CURATED.oge_physics.slice(0,1) }] },
        { label:'Тепловые явления', count:3, points:1, sources:[{ subject:'physics', minG:8, maxG:9, topics:['тепло','теплов'] }, { boosters: CURATED.oge_physics.slice(3) }] },
        { label:'Электричество', count:3, points:1, sources:[{ subject:'physics', minG:8, maxG:9, topics:['ток','электр'] }, { boosters: CURATED.oge_physics.slice(1,2) }] },
        { label:'Практические расчёты', count:3, points:2, sources:[{ subject:'physics', minG:8, maxG:9 }, { boosters: CURATED.oge_physics.slice(2,3) }] }
      ]
    },
    ege_base_math: {
      id: 'ege_base_math',
      exam: 'ЕГЭ',
      label: 'ЕГЭ база · Математика',
      subjectId: 'mathall',
      fallbackSubjects: ['mathall'],
      accent: '#0d9488',
      grades: '10–11',
      minG: 10,
      maxG: 11,
      maxQ: 12,
      timeLimit: 20 * 60,
      scoreKind: 'grade',
      summary: 'арифметика, графики, вероятность, практика',
      bands: [
        { min: 0, label: '2', note: 'пока ниже зачёта' },
        { min: 4, label: '3', note: 'минимум закрыт' },
        { min: 7, label: '4', note: 'уверенно для базы' },
        { min: 10, label: '5', note: 'сильный базовый результат' }
      ],
      sections: [
        { label:'Практические вычисления', count:4, points:1, sources:[{ subject:'mathall', minG:10, maxG:11, topics:['вероятн','интеграл','логариф','тригоном','функц'] }, { boosters: CURATED.ege_base_math.slice(1,2) }] },
        { label:'Графики и функции', count:3, points:1, sources:[{ subject:'mathall', minG:10, maxG:11, topics:['функц','тригоном'] }, { boosters: CURATED.ege_base_math.slice(3) }] },
        { label:'Планиметрия и стереометрия', count:3, points:1, sources:[{ subjects:['mathall'], minG:10, maxG:11, topics:['стерео','план','геометр'] }, { boosters: CURATED.ege_base_math.slice(2,3) }] },
        { label:'Вероятность и практика', count:2, points:2, sources:[{ subject:'mathall', minG:10, maxG:11, topics:['вероятн'] }, { boosters: CURATED.ege_base_math.slice(0,1) }] }
      ]
    },
    ege_profile_math: {
      id: 'ege_profile_math',
      exam: 'ЕГЭ',
      label: 'ЕГЭ профиль · Математика',
      subjectId: 'algebra',
      fallbackSubjects: ['algebra', 'geometry', 'mathall'],
      accent: '#7c3aed',
      grades: '10–11',
      minG: 10,
      maxG: 11,
      maxQ: 14,
      timeLimit: 30 * 60,
      scoreKind: 'ege100',
      summary: 'логарифмы, производная, вероятность, стереометрия',
      bands: [
        { min: 0, label: 'ниже порога', note: 'нужно добрать базовые баллы' },
        { min: 7, label: 'порог пройден', note: 'минимум закрыт' },
        { min: 10, label: '60+ / уверенно', note: 'хороший уровень для многих направлений' },
        { min: 12, label: '80+ / сильный', note: 'сильный профильный фундамент' }
      ],
      sections: [
        { label:'Алгебра и функции', count:5, points:1, sources:[{ subject:'algebra', minG:10, maxG:11, topics:['логариф','показат','тригоном'] }, { boosters: CURATED.ege_profile_math.slice(0,1) }] },
        { label:'Производная и интеграл', count:3, points:2, sources:[{ subject:'algebra', minG:10, maxG:11, topics:['производ','интеграл'] }, { boosters: CURATED.ege_profile_math.slice(1,2) }] },
        { label:'Вероятность', count:2, points:1, sources:[{ subjects:['algebra', 'mathall'], minG:10, maxG:11, topics:['вероятн'] }, { boosters: CURATED.ege_profile_math.slice(2,3) }] },
        { label:'Геометрия и 3D', count:4, points:2, sources:[{ subject:'geometry', minG:10, maxG:11 }, { boosters: CURATED.ege_profile_math.slice(3) }] }
      ]
    },
    ege_russian: {
      id: 'ege_russian',
      exam: 'ЕГЭ',
      label: 'ЕГЭ · Русский язык',
      subjectId: 'russian',
      fallbackSubjects: ['russian'],
      accent: '#16a34a',
      grades: '10–11',
      minG: 10,
      maxG: 11,
      maxQ: 12,
      timeLimit: 25 * 60,
      scoreKind: 'ege100',
      summary: 'орфография, пунктуация, речь, анализ текста',
      bands: [
        { min: 0, label: 'ниже порога', note: 'стоит вернуться к базовым правилам' },
        { min: 5, label: 'порог пройден', note: 'минимум взят' },
        { min: 8, label: '65+ / уверенно', note: 'хорошая читательская и языковая база' },
        { min: 10, label: '80+ / сильный', note: 'сильный результат по русскому' }
      ],
      sections: [
        { label:'Орфография', count:3, points:1, sources:[{ subject:'russian', minG:10, maxG:11, topics:['орфограф'] }, { boosters: CURATED.ege_russian.slice(0,1) }] },
        { label:'Пунктуация и синтаксис', count:3, points:1, sources:[{ subject:'russian', minG:10, maxG:11, topics:['пунктуац','синтакс'] }, { boosters: CURATED.ege_russian.slice(1,2) }] },
        { label:'Речь и нормы', count:3, points:2, sources:[{ subject:'russian', minG:10, maxG:11, topics:['выразит'] }, { boosters: CURATED.ege_russian.slice(2,3) }] },
        { label:'Анализ текста', count:3, points:1, sources:[{ subject:'russian', minG:10, maxG:11 }, { boosters: CURATED.ege_russian.slice(3) }] }
      ]
    },
    ege_english: {
      id: 'ege_english',
      exam: 'ЕГЭ',
      label: 'ЕГЭ · Английский',
      subjectId: 'english',
      fallbackSubjects: ['english'],
      accent: '#2563eb',
      grades: '9–11',
      minG: 9,
      maxG: 11,
      maxQ: 12,
      timeLimit: 25 * 60,
      scoreKind: 'ege100',
      summary: 'grammar, vocabulary, word formation, reading links',
      bands: [
        { min: 0, label: 'ниже порога', note: 'нужно укрепить grammar & vocabulary' },
        { min: 5, label: 'порог пройден', note: 'база закрыта' },
        { min: 8, label: '65+ / уверенно', note: 'хороший школьный уровень' },
        { min: 10, label: '80+ / сильный', note: 'strong exam-style English' }
      ],
      sections: [
        { label:'Grammar', count:4, points:1, sources:[{ subject:'english', minG:9, maxG:11, topics:['grammar','граммат','условн','пассив'] }, { boosters: CURATED.ege_english.slice(0,1) }] },
        { label:'Vocabulary', count:3, points:1, sources:[{ subject:'english', minG:9, maxG:11, topics:['лексик','vocabulary'] }, { boosters: CURATED.ege_english.slice(3) }] },
        { label:'Word formation', count:2, points:2, sources:[{ subject:'english', minG:9, maxG:11, topics:['словообраз'] }, { boosters: CURATED.ege_english.slice(1,2) }] },
        { label:'Reading & linkers', count:3, points:1, sources:[{ subject:'english', minG:9, maxG:11, topics:['linkers'] }, { boosters: CURATED.ege_english.slice(2,3) }, { subject:'english', minG:9, maxG:11 }] }
      ]
    }

  };

  var WAVE69_CURATED = {
    oge_russian_text: [
      {g:9, topic:'Текст и изложение', q:'Какую формулировку лучше взять в качестве основной мысли текста о добровольчестве?', opts:['Добровольчество помогает обществу и развивает самого человека.','Добровольцы всегда работают бесплатно и без пользы.','Добровольчество нужно только школьникам.','Участие в проектах не влияет на человека.'], a:'Добровольчество помогает обществу и развивает самого человека.', hint:'Основная мысль обобщает смысл текста, а не повторяет одну деталь.'},
      {g:9, topic:'Текст и изложение', q:'Для сжатого изложения что нужно сделать в первую очередь?', opts:['Выделить микротемы и опорные слова.','Переписать текст дословно.','Добавить как можно больше примеров.','Сразу придумать вывод без анализа текста.'], a:'Выделить микротемы и опорные слова.', hint:'Сжатое изложение начинается с деления текста на микротемы.'},
      {g:9, topic:'Текст и изложение', q:'Какой заголовок точнее подойдёт к тексту о бережном отношении к слову?', opts:['Ответственность за сказанное','Новые гаджеты в школе','Как выбрать профессию','История одного путешествия'], a:'Ответственность за сказанное', hint:'Заголовок должен отражать тему и авторскую позицию.'},
      {g:9, topic:'Текст и изложение', q:'Какой приём допустим при сжатии текста?', opts:['Обобщение однородных фактов','Искажение авторской позиции','Удаление ключевой мысли','Подмена темы текста другой'], a:'Обобщение однородных фактов', hint:'При сжатии используют исключение, обобщение и упрощение.'}
    ],
    oge_russian_literacy: [
      {g:9, topic:'Грамотность и редактура', q:'В каком варианте предложение оформлено без речевой ошибки?', opts:['Благодаря тренировке результат стал лучше.','Благодаря тому что я заранее предвидел наперёд, я успел.','Самый оптимальный маршрут оказался длиннее.','Он вернулся обратно назад вечером.'], a:'Благодаря тренировке результат стал лучше.', hint:'Остальные варианты содержат речевую избыточность.'},
      {g:9, topic:'Грамотность и редактура', q:'Укажи предложение, где нет грамматической ошибки.', opts:['Прочитав текст, я записал ключевые мысли.','Прочитав текст, у меня появилась идея.','Вернувшись домой, мне стало спокойнее.','Слушая доклад, у ребят возникла улыбка.'], a:'Прочитав текст, я записал ключевые мысли.', hint:'Деепричастный оборот должен относиться к действующему лицу.'},
      {g:9, topic:'Грамотность и редактура', q:'Какой вариант редактирования корректен?', opts:['Автор поднимает проблему выбора и ответственности.','Автор затрагивает проблему, которая поднимается.','Автор касается о проблеме выбора.','Автор раскрывает о проблеме ответственности.'], a:'Автор поднимает проблему выбора и ответственности.', hint:'После «касается» предлог «о» не нужен.'},
      {g:9, topic:'Грамотность и редактура', q:'В каком предложении нет орфографической ошибки?', opts:['На рассвете мы увидели необыкновенно тихий лес.','На расвете мы увидели необыкновенно тихий лес.','На рассвете мы увидели не обыкновенно тихий лес.','На рассвете мы увидели необыкновено тихий лес.'], a:'На рассвете мы увидели необыкновенно тихий лес.', hint:'Проверь написание приставки и суффикса -енн-.'}
    ],
    oge_russian_essay: [
      {g:9, topic:'Сочинение: алгоритм', q:'Что логичнее сделать в начале сочинения-рассуждения?', opts:['Сформулировать тезис и определить проблему.','Сразу перечислить все примеры без связи.','Переписать текст полностью.','Начать с биографии автора.'], a:'Сформулировать тезис и определить проблему.', hint:'Вступление должно обозначить тему и направление рассуждения.'},
      {g:9, topic:'Сочинение: алгоритм', q:'Как лучше оформить комментарий к проблеме?', opts:['Показать, как проблема раскрывается в двух связанных примерах текста.','Ограничиться одной цитатой без пояснения.','Пересказать текст без отбора деталей.','Заменить комментарий личной историей, не связанной с текстом.'], a:'Показать, как проблема раскрывается в двух связанных примерах текста.', hint:'Комментарий строится на двух примерах с пояснением связи.'},
      {g:9, topic:'Сочинение: алгоритм', q:'Что обязательно нужно сделать перед выводом?', opts:['Сформулировать позицию автора и своё отношение к ней.','Снова переписать тему из задания.','Перечислить все части речи из текста.','Отказаться от аргументации.'], a:'Сформулировать позицию автора и своё отношение к ней.', hint:'Позиция автора и позиция ученика — ключ к завершению сочинения.'},
      {g:9, topic:'Сочинение: алгоритм', q:'Какой вывод в сочинении считается удачным?', opts:['Он подводит итог рассуждению и связан с тезисом.','Он повторяет первое предложение слово в слово.','Он не связан с примерами из текста.','Он состоит только из вопроса без ответа.'], a:'Он подводит итог рассуждению и связан с тезисом.', hint:'Вывод должен завершать логическую цепочку рассуждения.'}
    ],
    oge_english_reading: [
      {g:9, topic:'Reading', q:'Read the heading: "A City That Never Sleeps". What is the text most likely about?', opts:['Life in a very busy city','How to sleep longer','A village holiday','A biology lesson about sleep'], a:'Life in a very busy city', hint:'The key clue is “never sleeps”, which metaphorically describes a busy city.'},
      {g:9, topic:'Reading', q:'Choose the best heading for a text about teenagers who volunteer at animal shelters.', opts:['Helping animals after school','The most dangerous pets','How to become a vet in one day','Wild animals in the jungle'], a:'Helping animals after school', hint:'A heading should match the main idea, not a minor detail.'},
      {g:9, topic:'Reading', q:'What should you do first in a matching-headings task?', opts:['Skim the text for the general idea of each paragraph.','Translate every word in detail.','Write an essay immediately.','Ignore the headings and choose randomly.'], a:'Skim the text for the general idea of each paragraph.', hint:'Skimming helps match each paragraph with its main idea.'},
      {g:9, topic:'Reading', q:'If a paragraph mentions "cheap tickets, live music and open-air cinema", what is its topic?', opts:['A summer festival','A school exam','A weather forecast','A job interview'], a:'A summer festival', hint:'The clues describe an entertainment event.'},
      {g:9, topic:'Reading', q:'Which strategy is safest if you see an unfamiliar word in a reading task?', opts:['Use the surrounding context to guess the meaning.','Stop and leave the whole task blank.','Translate the word through a different language.','Always choose the longest option.'], a:'Use the surrounding context to guess the meaning.', hint:'Context often gives enough information for the correct answer.'},
      {g:9, topic:'Reading', q:'The phrase "The museum is within walking distance" means that the museum is...', opts:['near enough to walk to','closed for visitors','very expensive','outside the city'], a:'near enough to walk to', hint:'“Within walking distance” means you can get there on foot.'}
    ],
    oge_english_listening: [
      {g:9, topic:'Listening & communication', q:'You hear: "I can\'t join you after school — I\'m seeing the dentist at five." Why can\'t the speaker meet friends?', opts:['Because of a dentist appointment','Because of a football match','Because of bad weather','Because the school is closed'], a:'Because of a dentist appointment', hint:'Pick the reason stated directly in the sentence.'},
      {g:9, topic:'Listening & communication', q:'In a dialogue the girl says, "Let\'s meet half an hour earlier so we won\'t miss the bus." What is she worried about?', opts:['Missing the bus','Forgetting her homework','Buying a new ticket','Calling her parents'], a:'Missing the bus', hint:'The final clause explains the reason for meeting earlier.'},
      {g:9, topic:'Listening & communication', q:'You hear: "The blue T-shirt looked nice online, but the size was too small." What problem did the speaker have?', opts:['The size was wrong','The colour was wrong','The delivery was late','The price was too high'], a:'The size was wrong', hint:'The key phrase is “too small”.'},
      {g:9, topic:'Listening & communication', q:'In short dialogues, what helps most when you hear numbers and dates?', opts:['Writing down key figures immediately','Ignoring all numbers','Listening only to the first sentence','Choosing the answer with the biggest number'], a:'Writing down key figures immediately', hint:'Numbers are easy to confuse, so note them at once.'},
      {g:9, topic:'Listening & communication', q:'You hear: "Could you email me the slides? I didn\'t catch everything during the presentation." What does the speaker need?', opts:['The presentation slides by email','A new laptop','A train ticket','A different classroom'], a:'The presentation slides by email', hint:'The request is stated directly in the first sentence.'},
      {g:9, topic:'Listening & communication', q:'If a speaker says "I\'m not against the idea, but we need more time", their attitude is best described as...', opts:['Cautiously positive','Completely negative','Totally indifferent','Very angry'], a:'Cautiously positive', hint:'The phrase shows partial agreement with reservation.'}
    ],
    oge_english_speaking: [
      {g:9, topic:'Speaking strategy', q:'In a picture description task, what is the safest way to begin?', opts:['State where the action is happening and who is in the picture.','Read the task number aloud and stop.','Translate the whole task into Russian.','Start with the conclusion only.'], a:'State where the action is happening and who is in the picture.', hint:'A clear opening helps structure the rest of the answer.'},
      {g:9, topic:'Speaking strategy', q:'What should you include when comparing two photos?', opts:['At least one similarity and one difference','Only the colours you can see','A list of random adjectives','Your full school timetable'], a:'At least one similarity and one difference', hint:'Comparison tasks require both common and contrasting features.'},
      {g:9, topic:'Speaking strategy', q:'If you forget a word during an oral answer, the best strategy is to...', opts:['Paraphrase it with simpler words and continue.','Switch off the microphone.','End the answer immediately.','Repeat “I don\'t know” several times.'], a:'Paraphrase it with simpler words and continue.', hint:'Communication is valued more than perfect vocabulary recall.'},
      {g:9, topic:'Speaking strategy', q:'Which phrase sounds natural when you express preference?', opts:['I\'d prefer the first option because it feels more practical.','I liking first picture because yes.','The best variant is all variants at once.','I choose nothing because it is impossible.'], a:'I\'d prefer the first option because it feels more practical.', hint:'Give a choice and one clear reason.'},
      {g:9, topic:'Speaking strategy', q:'Why is it useful to mention your opinion at the end of an oral monologue?', opts:['It creates a clear conclusion.','It replaces the need to answer the task.','It avoids speaking in English.','It makes the answer shorter than one sentence.'], a:'It creates a clear conclusion.', hint:'A short personal opinion is a natural closing move.'},
      {g:9, topic:'Speaking strategy', q:'What pace is best for the OGE oral response?', opts:['Steady and clear, without racing','As fast as possible','Very slow with long pauses after each word','Silent, with gestures only'], a:'Steady and clear, without racing', hint:'Examiners need a coherent and understandable answer.'}
    ],
    oge_social_relations: [
      {g:9, topic:'Социальные отношения', q:'Социальная роль ученика включает прежде всего...', opts:['выполнение обязанностей, связанных с обучением','получение прибыли на рынке','участие в выборах как депутат','ведение семейного бюджета государства'], a:'выполнение обязанностей, связанных с обучением', hint:'Социальная роль связана с ожидаемым обществом поведением.'},
      {g:9, topic:'Социальные отношения', q:'Вертикальная социальная мобильность — это...', opts:['переход человека на более высокий или низкий социальный статус','переезд в другой район города без смены статуса','изменение расписания уроков','смена времени года'], a:'переход человека на более высокий или низкий социальный статус', hint:'Вертикальная мобильность означает движение по социальной лестнице.'},
      {g:9, topic:'Социальные отношения', q:'Малой социальной группой является...', opts:['школьный класс','население страны','человечество','избирательный корпус государства'], a:'школьный класс', hint:'Малые группы предполагают непосредственное общение участников.'},
      {g:9, topic:'Социальные отношения', q:'Семья как социальный институт выполняет прежде всего функцию...', opts:['социализации детей','эмиссии денег','законотворчества','судебного контроля'], a:'социализации детей', hint:'Семья передаёт нормы и ценности новым поколениям.'},
      {g:9, topic:'Социальные отношения', q:'Социальный конфликт — это...', opts:['столкновение интересов сторон','любая школьная перемена','обязательное нарушение закона','только вооружённое противостояние'], a:'столкновение интересов сторон', hint:'Конфликт может быть мирным, но всегда связан с противоречием интересов.'}
    ],
    oge_social_case: [
      {g:9, topic:'Анализ ситуации', q:'Семья купила бытовую технику, но товар оказался неисправным в день покупки. Какое право потребителя можно реализовать сразу?', opts:['Потребовать замену или возврат товара ненадлежащего качества','Только ждать окончания гарантии','Обратиться только в полицию','Ничего нельзя сделать без решения суда'], a:'Потребовать замену или возврат товара ненадлежащего качества', hint:'Закон о защите прав потребителей позволяет требовать замену или возврат.'},
      {g:9, topic:'Анализ ситуации', q:'Гражданину исполнилось 18 лет, и он впервые участвует в выборах. Какое политическое право он реализует?', opts:['Активное избирательное право','Право законодательной инициативы','Право на помилование','Право на судебную власть'], a:'Активное избирательное право', hint:'Активное право — это право избирать.'},
      {g:9, topic:'Анализ ситуации', q:'Работодатель не выдал подростку трудовой договор в письменной форме. Какую сферу общественных отношений затрагивает ситуация?', opts:['Право','Религия','Искусство','Наука'], a:'Право', hint:'Трудовые отношения регулируются нормами права.'},
      {g:9, topic:'Анализ ситуации', q:'В стране вырос общий уровень цен, а на ту же сумму денег теперь можно купить меньше товаров. Какое экономическое явление описано?', opts:['Инфляция','Дефицит бюджета','Конкуренция','Приватизация'], a:'Инфляция', hint:'Инфляция снижает покупательную способность денег.'},
      {g:9, topic:'Анализ ситуации', q:'Гражданин обращается в суд, чтобы защитить нарушенное право собственности. Какая функция государства проявляется в этой ситуации?', opts:['Правоохранительная','Культурная','Социальная реклама','Внешнеполитическая'], a:'Правоохранительная', hint:'Государство защищает права и обеспечивает правопорядок.'},
      {g:9, topic:'Анализ ситуации', q:'Подросток публикует оскорбления в адрес одноклассника в школьном чате. Какая норма нарушается в первую очередь?', opts:['Норма морали и правила уважительного общения','Только математическая формула','Обычай праздничного поздравления','Географическая карта мира'], a:'Норма морали и правила уважительного общения', hint:'Ситуация прежде всего связана с этикой общения.'}
    ]
  };

  function cloneSections(list){ return (list || []).map(function(section){ return JSON.parse(JSON.stringify(section)); }); }
  function packSeed(id, sectionLabel){ return String(id) + '|' + String(sectionLabel || 'section'); }
  function structuredVariantNosHint(familyId, fallbackCount){
    var seen = {};
    try {
      var payload = window.WAVE89Q_EXAM_BANK;
      var family = payload && payload.families && payload.families[familyId];
      if (family && Array.isArray(family.variants) && family.variants.length) {
        return family.variants.map(function(value){ return toNum(value); }).filter(function(value){
          if (!(value > 0) || seen[value]) return false;
          seen[value] = 1;
          return true;
        }).sort(function(a, b){ return a - b; });
      }
    } catch(_) {}
    var out = [];
    var total = Math.max(1, toNum(fallbackCount) || 1);
    for (var i = 1; i <= total; i++) out.push(i);
    return out;
  }
  function makeWave69MathVariant(idx){
    return {
      id: 'oge_math_var' + idx,
      exam: 'ОГЭ',
      label: 'ОГЭ · Математика · Вариант ' + idx,
      subjectId: 'mathall',
      fallbackSubjects: ['mathall', 'algebra', 'geometry'],
      accent: '#2563eb',
      grades: '9 класс',
      minG: 7,
      maxG: 9,
      maxQ: 25,
      timeLimit: 235 * 60,
      scoreKind: 'grade',
      scoreModel: 'oge_math_2026',
      geometrySections: ['Геометрия: базовые задачи','Геометрия: развернутые'],
      seed: 'oge_math_var' + idx,
      order: 10 + idx,
      summary: 'полный вариант · 25 заданий · алгебра, геометрия, практика',
      bands: [
        { min: 0, label: '2', note: 'ниже базового порога' },
        { min: 8, label: '3', note: 'порог ОГЭ пройден' },
        { min: 15, label: '4', note: 'хороший результат' },
        { min: 22, label: '5', note: 'сильный результат' }
      ],
      sections: [
        { label:'Числа и вычисления', count:7, points:1, sources:[{ subjects:['mathall'], minG:7, maxG:9, topics:['арифмет','дроб','процент','нод','нок','отрицат','пропорц'] }, { boosters: CURATED.oge_math || [] }] },
        { label:'Алгебра', count:7, points:1, sources:[{ subject:'algebra', minG:7, maxG:9, topics:['линей','квадрат','неравен','прогресс','функц','степен','многочлен','систем'] }] },
        { label:'Геометрия: базовые задачи', count:7, points:1, sources:[{ subject:'geometry', minG:7, maxG:9, topics:['треуголь','углы','параллель','четыр','окруж','пифагора','подоб'] }] },
        { label:'Практика и вероятность', count:2, points:2, sources:[{ subjects:['mathall'], minG:7, maxG:9, topics:['вероятн','статист','процент','задач','практик'] }, { boosters: CURATED.oge_math || [] }] },
        { label:'Геометрия: развернутые', count:2, points:3, sources:[{ subject:'geometry', minG:8, maxG:9, topics:['координат','вектор','теорема косинусов','площад','окруж','подоб'] }, { subject:'geometry', minG:7, maxG:9 }] }
      ]
    };
  }
  function makeWave69RussianVariant(idx){
    return {
      id: 'oge_russian_var' + idx,
      exam: 'ОГЭ',
      label: 'ОГЭ · Русский язык · Вариант ' + idx,
      subjectId: 'russian',
      fallbackSubjects: ['russian'],
      accent: '#16a34a',
      grades: '9 класс',
      minG: 8,
      maxG: 11,
      maxQ: 9,
      timeLimit: 235 * 60,
      scoreKind: 'grade',
      scoreModel: 'oge_russian_2026',
      literacySections: ['Пунктуация и синтаксис','Грамотность и редактура'],
      seed: 'oge_russian_var' + idx,
      order: 20 + idx,
      summary: '9 заданий · тест + алгоритм сочинения · шкала ФИПИ 2026',
      bands: [
        { min: 0, label: '2', note: 'ниже порога' },
        { min: 15, label: '3', note: 'зачётный минимум выполнен' },
        { min: 26, label: '4', note: 'хороший уровень' },
        { min: 33, label: '5', note: 'сильный результат' }
      ],
      sections: [
        { label:'Текст и сжатое изложение', count:2, points:4, sources:[{ subject:'russian', minG:8, maxG:11, topics:['текст','речь','выразит'] }, { boosters: WAVE69_CURATED.oge_russian_text }] },
        { label:'Орфография', count:2, points:4, sources:[{ subject:'russian', minG:8, maxG:11, topics:['орфограф','н и нн','пре','при'] }, { boosters: CURATED.oge_russian.slice(0,2) }] },
        { label:'Пунктуация и синтаксис', count:2, points:3, sources:[{ subject:'russian', minG:8, maxG:11, topics:['пунктуац','синтакс','спп','бсп','однород','вводн'] }, { boosters: CURATED.oge_russian.slice(2,4) }] },
        { label:'Анализ текста', count:1, points:3, sources:[{ subject:'russian', minG:8, maxG:11, topics:['текст','выразит','речь'] }, { boosters: CURATED.oge_russian.slice(4) }, { boosters: WAVE69_CURATED.oge_russian_text }] },
        { label:'Грамотность и редактура', count:1, points:5, sources:[{ boosters: WAVE69_CURATED.oge_russian_literacy }] },
        { label:'Сочинение: алгоритм', count:1, points:7, sources:[{ boosters: WAVE69_CURATED.oge_russian_essay }] }
      ]
    };
  }
  function makeWave69EnglishVariant(idx){
    return {
      id: 'oge_english_var' + idx,
      exam: 'ОГЭ',
      label: 'ОГЭ · Английский · Вариант ' + idx,
      subjectId: 'english',
      fallbackSubjects: ['english'],
      accent: '#2563eb',
      grades: '9 класс',
      minG: 7,
      maxG: 11,
      maxQ: 20,
      timeLimit: 135 * 60,
      scoreKind: 'grade',
      scoreModel: 'oge_english_2026',
      seed: 'oge_english_var' + idx,
      order: 30 + idx,
      summary: '20 заданий · reading, grammar, speaking strategy · полный стиль',
      bands: [
        { min: 0, label: '2', note: 'ниже порога' },
        { min: 29, label: '3', note: 'базовый уровень ОГЭ' },
        { min: 46, label: '4', note: 'уверенный результат' },
        { min: 58, label: '5', note: 'сильный результат' }
      ],
      sections: [
        { label:'Reading', count:5, points:2, sources:[{ boosters: WAVE69_CURATED.oge_english_reading }, { subject:'english', minG:7, maxG:11, topics:['лексик','reading','linker','времен'] }] },
        { label:'Grammar', count:5, points:2, sources:[{ subject:'english', minG:7, maxG:11, topics:['граммат','времен','услов','пассив','reported'] }] },
        { label:'Vocabulary & word formation', count:4, points:3, sources:[{ subject:'english', minG:7, maxG:11, topics:['лексик','словообраз','vocabulary'] }] },
        { label:'Listening & communication', count:3, points:4, sources:[{ boosters: WAVE69_CURATED.oge_english_listening }, { subject:'english', minG:7, maxG:11 }] },
        { label:'Speaking strategy', count:3, points:8, sources:[{ boosters: WAVE69_CURATED.oge_english_speaking }] }
      ]
    };
  }
  function makeWave69SocialVariant(idx){
    return {
      id: 'oge_social_var' + idx,
      exam: 'ОГЭ',
      label: 'ОГЭ · Обществознание · Вариант ' + idx,
      subjectId: 'social',
      fallbackSubjects: ['social'],
      accent: '#7c3aed',
      grades: '9 класс',
      minG: 8,
      maxG: 11,
      maxQ: 24,
      timeLimit: 180 * 60,
      scoreKind: 'grade',
      scoreModel: 'oge_social_2026',
      seed: 'oge_social_var' + idx,
      order: 40 + idx,
      summary: '24 задания · человек, экономика, право, кейсы',
      bands: [
        { min: 0, label: '2', note: 'ниже порога' },
        { min: 14, label: '3', note: 'порог ОГЭ пройден' },
        { min: 24, label: '4', note: 'хороший уровень' },
        { min: 32, label: '5', note: 'сильный результат' }
      ],
      sections: [
        { label:'Человек и общество', count:5, points:1, sources:[{ subject:'social', minG:8, maxG:11, topics:['обществ','философ'] }] },
        { label:'Экономика', count:4, points:1, sources:[{ subject:'social', minG:8, maxG:11, topics:['эконом'] }] },
        { label:'Социальные отношения', count:4, points:1, sources:[{ boosters: WAVE69_CURATED.oge_social_relations }, { subject:'social', minG:8, maxG:11, topics:['социал','обществ'] }] },
        { label:'Политика', count:4, points:1, sources:[{ subject:'social', minG:8, maxG:11, topics:['полит'] }] },
        { label:'Право', count:4, points:2, sources:[{ subject:'social', minG:8, maxG:11, topics:['право'] }] },
        { label:'Анализ ситуаций и документов', count:3, points:4, sources:[{ boosters: WAVE69_CURATED.oge_social_case }, { subject:'social', minG:8, maxG:11 }] }
      ]
    };
  }
  function attachWave69OgePacks(){
    ['oge_math','oge_russian','oge_informatics','oge_physics'].forEach(function(id){ if (EXAM_PACKS[id]) EXAM_PACKS[id].hidden = true; });
    structuredVariantNosHint('oge_math_2026_full', 50).forEach(function(i){ EXAM_PACKS['oge_math_var' + i] = makeWave69MathVariant(i); });
    structuredVariantNosHint('oge_russian_2026_full', 50).forEach(function(i){ EXAM_PACKS['oge_russian_var' + i] = makeWave69RussianVariant(i); });
    structuredVariantNosHint('oge_english_2026_full', 30).forEach(function(i){ EXAM_PACKS['oge_english_var' + i] = makeWave69EnglishVariant(i); });
    structuredVariantNosHint('oge_social_2026_full', 30).forEach(function(i){ EXAM_PACKS['oge_social_var' + i] = makeWave69SocialVariant(i); });
  }
  attachWave69OgePacks();

  var WAVE70_CURATED = {
    ege_base_math: [
      {g:11, topic:'Практические расчёты', q:'Товар подорожал с 800 до 920 рублей. На сколько процентов выросла цена?', opts:['15%','12%','20%','18%'], a:'15%', hint:'Рост составил 120 рублей. 120 / 800 = 0.15 = 15%.'},
      {g:11, topic:'Графики и функции', q:'По графику линейной функции видно, что при x = 0 значение y равно 4. Как называется это значение?', opts:['Ордината точки пересечения с осью Oy','Абсцисса вершины параболы','Корень функции','Угол наклона прямой'], a:'Ордината точки пересечения с осью Oy', hint:'При x = 0 читают значение функции на оси Oy.'},
      {g:11, topic:'Планиметрия', q:'В прямоугольном треугольнике катеты равны 6 и 8. Чему равна гипотенуза?', opts:['10','12','14','9'], a:'10', hint:'По теореме Пифагора: √(36 + 64) = 10.'},
      {g:11, topic:'Вероятность', q:'В коробке 4 красных и 6 синих ручек. Какова вероятность случайно взять красную?', opts:['0,4','0,6','0,5','0,25'], a:'0,4', hint:'Благоприятных исходов 4 из 10, то есть 0,4.'},
      {g:11, topic:'Практические расчёты', q:'На карте расстояние между городами 3 см, масштаб 1:2000000. Каково реальное расстояние?', opts:['60 км','6 км','600 км','30 км'], a:'60 км', hint:'1 см соответствует 20 км, значит 3 см — 60 км.'},
      {g:11, topic:'Стереометрия', q:'Объём прямоугольного параллелепипеда со сторонами 2, 3 и 5 равен...', opts:['30','10','15','60'], a:'30', hint:'V = abc = 2·3·5.'},
      {g:11, topic:'Алгебра', q:'Решите уравнение 3x − 7 = 11.', opts:['6','5','4','7'], a:'6', hint:'3x = 18, значит x = 6.'},
      {g:11, topic:'Текстовая задача', q:'Автомобиль ехал 2 часа со скоростью 75 км/ч. Какой путь он прошёл?', opts:['150 км','37,5 км','77 км','175 км'], a:'150 км', hint:'s = vt = 75·2.'}
    ],
    ege_profile_math: [
      {g:11, topic:'Алгебра и преобразования', q:'Решите уравнение 2^(x+1) = 16.', opts:['3','4','2','5'], a:'3', hint:'16 = 2^4, значит x + 1 = 4.'},
      {g:11, topic:'Логарифмы', q:'Найдите значение log_3 81.', opts:['4','3','2','9'], a:'4', hint:'81 = 3^4.'},
      {g:11, topic:'Тригонометрия', q:'sin(π/6) равен...', opts:['1/2','√3/2','1','0'], a:'1/2', hint:'Стандартное значение синуса 30°.'},
      {g:11, topic:'Производная', q:'Если f(x) = x^2 − 4x, то f\'(x) = ...', opts:['2x − 4','x − 4','2x^2 − 4','2x + 4'], a:'2x − 4', hint:'Производная x^2 — 2x, производная −4x — −4.'},
      {g:11, topic:'Неравенства', q:'Какое из чисел удовлетворяет неравенству x^2 < 9?', opts:['2','4','−4','3,5'], a:'2', hint:'Подходят только числа из интервала (−3; 3).'},
      {g:11, topic:'Вероятность', q:'Монету бросают два раза. Вероятность получить ровно один орёл равна...', opts:['1/2','1/4','3/4','1'], a:'1/2', hint:'Подходят исходы ОР и РО: 2 из 4.'},
      {g:11, topic:'Планиметрия', q:'Сумма внутренних углов выпуклого пятиугольника равна...', opts:['540°','360°','720°','450°'], a:'540°', hint:'Сумма углов n-угольника равна (n − 2)·180°.'},
      {g:11, topic:'Координаты и векторы', q:'Расстояние между точками A(0;0) и B(3;4) равно...', opts:['5','7','6','4'], a:'5', hint:'Используйте теорему Пифагора: √(3² + 4²).'}
    ],
    ege_russian: [
      {g:11, topic:'Орфоэпия и нормы', q:'В каком слове ударение поставлено верно?', opts:['красИвее','тОрты','звОнит','жалюзИ'], a:'жалюзИ', hint:'В слове «жалюзи» ударение падает на последний слог.'},
      {g:11, topic:'Орфоэпия и нормы', q:'Выберите грамматически верную форму.', opts:['пятьюстами страницами','пятьюстами страница','пятьсотами страницами','пятистами страницами'], a:'пятьюстами страницами', hint:'Форма творительного падежа числительного — «пятьюстами».'},
      {g:11, topic:'Лексика и паронимы', q:'Укажите правильное употребление паронима.', opts:['эффективный метод','эффектный метод','эффективное платье','эффектная польза'], a:'эффективный метод', hint:'«Эффективный» = дающий результат; «эффектный» = производящий впечатление.'},
      {g:11, topic:'Лексика и паронимы', q:'В каком варианте слово употреблено без речевой ошибки?', opts:['надеть пальто','одеть пальто','оказать впечатление','играть значение'], a:'надеть пальто', hint:'Надевают вещь на себя, а одевают кого-то.'},
      {g:11, topic:'Орфография', q:'В каком слове на месте пропуска пишется буква Е?', opts:['зам..рать от страха','зап..реть дверь','соб..рать вещи','расст..лать скатерть'], a:'зап..реть дверь', hint:'В корнях с чередованием пишется Е без суффикса -а-: запереть.'},
      {g:11, topic:'Орфография', q:'В каком слове пишется НН?', opts:['организоваННый','ветреНый','кожаНый','рваНый'], a:'организоваННый', hint:'Полное страдательное причастие прошедшего времени обычно требует НН.'},
      {g:11, topic:'Пунктуация и синтаксис', q:'Где нужна запятая? «Когда дождь закончился ___ мы вышли на улицу».', opts:['после слова «закончился»','запятая не нужна','после слова «мы»','перед словом «улицу»'], a:'после слова «закончился»', hint:'Придаточное предложение отделяется запятой.'},
      {g:11, topic:'Пунктуация и синтаксис', q:'Укажите предложение с грамматической ошибкой.', opts:['Прочитав статью, у меня возникли вопросы.','Прочитав статью, я сделал выписки.','Когда статья была прочитана, вопросы снялись.','Статья, прочитанная вечером, помогла понять тему.'], a:'Прочитав статью, у меня возникли вопросы.', hint:'Деепричастный оборот должен относиться к действующему лицу.'},
      {g:11, topic:'Текст и выразительность', q:'Какое средство выразительности использовано в сочетании «стальное терпение»?', opts:['метафора','градация','риторический вопрос','анафора'], a:'метафора', hint:'Переносное значение основано на сходстве свойств.'},
      {g:11, topic:'Текст и выразительность', q:'Какое предложение должно идти после фразы «Язык меняется вместе с обществом»?', opts:['Поэтому новые слова появляются вместе с новыми явлениями жизни.','Сначала нужно решить уравнение, а потом проверить ответ.','Автор подробно описывает маршрут экспедиции по горам.','Вечером температура воздуха резко упала.'], a:'Поэтому новые слова появляются вместе с новыми явлениями жизни.', hint:'Нужно продолжить ту же мысль о развитии языка.'},
      {g:11, topic:'Текст и выразительность', q:'Какой вариант лучше передаёт основную мысль текста о чтении?', opts:['Чтение развивает мышление и расширяет опыт человека.','Читать полезно только перед экзаменом.','Все книги одинаково интересны всем людям.','Чтение нужно лишь филологам.'], a:'Чтение развивает мышление и расширяет опыт человека.', hint:'Основная мысль обобщает позицию автора, а не частную деталь.'},
      {g:11, topic:'Орфоэпия и нормы', q:'В каком предложении нет речевой избыточности?', opts:['Автор подробно описал проблему.','Он поднялся вверх наверх.','Мы заранее предвидели это событие.','Это был самый оптимальный маршрут.'], a:'Автор подробно описал проблему.', hint:'Остальные варианты содержат плеоназм.'}
    ]
  };

  function mapModelScore(raw, table){
    table = Array.isArray(table) ? table : [];
    if (!table.length) return null;
    raw = Math.max(0, Math.min(toNum(raw), table.length - 1));
    return toNum(table[raw]);
  }

  function makeWave70EgeBaseMathVariant(idx){
    return {
      id: 'ege_base_math_var' + idx,
      exam: 'ЕГЭ',
      label: 'ЕГЭ база · Математика · Вариант ' + idx,
      subjectId: 'mathall',
      fallbackSubjects: ['mathall', 'algebra', 'geometry'],
      accent: '#2563eb',
      grades: '11 класс',
      minG: 10,
      maxG: 11,
      maxQ: 21,
      timeLimit: 180 * 60,
      scoreKind: 'grade',
      scoreModel: 'ege_base_math_2026',
      seed: 'ege_base_math_var' + idx,
      order: 51 + idx,
      summary: '21 задание · базовый уровень · тренажёр полного варианта',
      bands: [
        { min: 0, label: '2', note: 'ниже порога базовой математики' },
        { min: 7, label: '3', note: 'удовлетворительно' },
        { min: 12, label: '4', note: 'хорошо' },
        { min: 17, label: '5', note: 'отлично' }
      ],
      sections: [
        { label:'Практические расчёты', count:5, points:1, sources:[{ subjects:['mathall','algebra'], minG:10, maxG:11, topics:['процент','арифмет','дроб','задач','скорост','расстоя','объём'] }, { boosters: WAVE70_CURATED.ege_base_math.slice(0,3) }] },
        { label:'Уравнения и вычисления', count:4, points:1, sources:[{ subjects:['mathall','algebra'], minG:10, maxG:11, topics:['уравн','выраж','степен','логариф'] }, { boosters: WAVE70_CURATED.ege_base_math.slice(6,8) }] },
        { label:'Графики и функции', count:4, points:1, sources:[{ subjects:['mathall','algebra'], minG:10, maxG:11, topics:['функц','график','тригоном','линей'] }, { boosters: WAVE70_CURATED.ege_base_math.slice(1,2) }] },
        { label:'Планиметрия и стереометрия', count:4, points:1, sources:[{ subjects:['geometry','mathall'], minG:10, maxG:11, topics:['геометр','план','стерео','треуголь','площад','объём'] }, { boosters: WAVE70_CURATED.ege_base_math.slice(2,6) }] },
        { label:'Вероятность и статистика', count:2, points:1, sources:[{ subjects:['mathall','algebra'], minG:10, maxG:11, topics:['вероятн','статист'] }, { boosters: WAVE70_CURATED.ege_base_math.slice(3,4) }] },
        { label:'Текстовые модели', count:2, points:1, sources:[{ subjects:['mathall','algebra'], minG:10, maxG:11, topics:['задач','прогресс','процент','движен','работ'] }, { boosters: WAVE70_CURATED.ege_base_math.slice(7,8) }] }
      ]
    };
  }
  function makeWave70EgeProfileMathVariant(idx){
    return {
      id: 'ege_profile_math_var' + idx,
      exam: 'ЕГЭ',
      label: 'ЕГЭ профиль · Математика · Вариант ' + idx,
      subjectId: 'algebra',
      fallbackSubjects: ['algebra', 'geometry', 'mathall'],
      accent: '#7c3aed',
      grades: '11 класс',
      minG: 10,
      maxG: 11,
      maxQ: 12,
      timeLimit: 235 * 60,
      scoreKind: 'ege100',
      scoreModel: 'ege_profile_math_part1_2026',
      seed: 'ege_profile_math_var' + idx,
      order: 61 + idx,
      summary: 'часть 1 · 12 заданий · профильный уровень',
      bands: [
        { min: 0, label: 'ниже порога', note: 'нужно добрать базовые баллы' },
        { min: 4, label: '27+ / порог', note: 'тренажёрная модель опирается на вузовский минимум 27' },
        { min: 6, label: '50+ / рабочий', note: 'уверенная часть 1' },
        { min: 8, label: '70+ / сильный', note: 'сильный профильный результат' },
        { min: 10, label: '85+ / высокий', note: 'очень сильная часть 1' }
      ],
      sections: [
        { label:'Алгебра и преобразования', count:3, points:1, sources:[{ subject:'algebra', minG:10, maxG:11, topics:['логариф','показат','степен','выраж'] }, { boosters: WAVE70_CURATED.ege_profile_math.slice(0,2) }] },
        { label:'Функции, графики, производная', count:3, points:1, sources:[{ subject:'algebra', minG:10, maxG:11, topics:['функц','график','производ','интеграл','тригоном'] }, { boosters: WAVE70_CURATED.ege_profile_math.slice(2,4) }] },
        { label:'Уравнения и неравенства', count:2, points:1, sources:[{ subject:'algebra', minG:10, maxG:11, topics:['уравн','неравен','систем'] }, { boosters: WAVE70_CURATED.ege_profile_math.slice(4,5) }] },
        { label:'Вероятность и текстовые модели', count:2, points:1, sources:[{ subjects:['algebra','mathall'], minG:10, maxG:11, topics:['вероятн','процент','прогресс','задач'] }, { boosters: WAVE70_CURATED.ege_profile_math.slice(5,6) }] },
        { label:'Геометрия и координаты', count:2, points:1, sources:[{ subject:'geometry', minG:10, maxG:11, topics:['план','стерео','вектор','координ','окруж','треуголь'] }, { boosters: WAVE70_CURATED.ege_profile_math.slice(6,8) }] }
      ]
    };
  }
  function makeWave70EgeRussianVariant(idx){
    return {
      id: 'ege_russian_var' + idx,
      exam: 'ЕГЭ',
      label: 'ЕГЭ · Русский язык · Вариант ' + idx,
      subjectId: 'russian',
      fallbackSubjects: ['russian'],
      accent: '#16a34a',
      grades: '11 класс',
      minG: 10,
      maxG: 11,
      maxQ: 26,
      timeLimit: 210 * 60,
      scoreKind: 'ege100',
      scoreModel: 'ege_russian_part1_2026',
      seed: 'ege_russian_var' + idx,
      order: 71 + idx,
      summary: 'часть 1 · 26 заданий · без сочинения · 2026',
      bands: [
        { min: 0, label: 'ниже порога', note: 'нужно добрать базовые баллы по тестовой части' },
        { min: 7, label: '36+ / порог', note: 'минимум для вуза поддержан моделью тренажёра' },
        { min: 14, label: '60+ / уверенно', note: 'хорошая тестовая база' },
        { min: 20, label: '80+ / сильный', note: 'сильная часть 1' },
        { min: 24, label: '90+ / высокий', note: 'очень сильный результат по тестовой части' }
      ],
      sections: [
        { label:'Орфоэпия и нормы', count:4, points:1, sources:[{ boosters: WAVE70_CURATED.ege_russian.slice(0,2) }, { subject:'russian', minG:10, maxG:11, topics:['норм','речь'] }] },
        { label:'Лексика и паронимы', count:4, points:1, sources:[{ boosters: WAVE70_CURATED.ege_russian.slice(2,4) }, { subject:'russian', minG:10, maxG:11, topics:['лексик','речь','норм'] }] },
        { label:'Орфография', count:6, points:1, sources:[{ subject:'russian', minG:10, maxG:11, topics:['орфограф','н и нн','пристав','слит','раздель'] }, { boosters: WAVE70_CURATED.ege_russian.slice(4,6) }] },
        { label:'Пунктуация и синтаксис', count:6, points:1, sources:[{ subject:'russian', minG:10, maxG:11, topics:['пунктуац','синтакс','спп','бсп','однород','вводн'] }, { boosters: WAVE70_CURATED.ege_russian.slice(6,8) }] },
        { label:'Текст и выразительность', count:6, points:1, sources:[{ subject:'russian', minG:10, maxG:11, topics:['текст','выразит','речь','стиль'] }, { boosters: WAVE70_CURATED.ege_russian.slice(8) }] }
      ]
    };
  }
  function attachWave70EgePacks(){
    ['ege_base_math','ege_profile_math','ege_russian'].forEach(function(id){ if (EXAM_PACKS[id]) EXAM_PACKS[id].hidden = true; });
    if (EXAM_PACKS.ege_english) EXAM_PACKS.ege_english.order = 99;
    structuredVariantNosHint('ege_base_math_2026_full', 30).forEach(function(i){ EXAM_PACKS['ege_base_math_var' + i] = makeWave70EgeBaseMathVariant(i); });
    structuredVariantNosHint('ege_profile_math_2026_part1', 50).forEach(function(i){ EXAM_PACKS['ege_profile_math_var' + i] = makeWave70EgeProfileMathVariant(i); });
    structuredVariantNosHint('ege_russian_2026_part1', 50).forEach(function(i){ EXAM_PACKS['ege_russian_var' + i] = makeWave70EgeRussianVariant(i); });
  }
  attachWave70EgePacks();


  var WAVE71_CURATED = {
    ege_social: [
      {g:11, topic:'Человек и общество', q:'Какое из понятий относится к духовной культуре общества?', opts:['мораль','налог','бюджет','монополия'], a:'мораль', hint:'К духовной культуре относят ценности, нормы и формы общественного сознания.'},
      {g:11, topic:'Экономика', q:'Что в рыночной экономике обычно вызывает рост цены при прочих равных условиях?', opts:['увеличение спроса','снижение спроса','рост предложения','снижение издержек'], a:'увеличение спроса', hint:'При росте спроса равновесная цена обычно повышается.'},
      {g:11, topic:'Социальная сфера', q:'Социальная мобильность, при которой человек меняет профессию, но остаётся на том же статусном уровне, называется...', opts:['горизонтальной','вертикальной','межпоколенной','обратной'], a:'горизонтальной', hint:'Горизонтальная мобильность не меняет уровень статуса.'},
      {g:11, topic:'Политика', q:'К признакам государства относится...', opts:['наличие публичной власти','обязательное членство в партии','родственные связи граждан','единая профессия населения'], a:'наличие публичной власти', hint:'Государство обладает публичной властью и суверенитетом.'},
      {g:11, topic:'Право', q:'Нормы Конституции РФ имеют...', opts:['высшую юридическую силу','силу подзаконного акта','силу обычая','только рекомендательный характер'], a:'высшую юридическую силу', hint:'Конституция имеет верховенство в системе нормативных актов.'},
      {g:11, topic:'Человек и общество', q:'Деятельность в отличие от поведения всегда предполагает...', opts:['наличие цели и осознанного результата','биологическую потребность','наследственный рефлекс','обязательное участие группы'], a:'наличие цели и осознанного результата', hint:'Деятельность — осознанная, целенаправленная активность.'},
      {g:11, topic:'Экономика', q:'Что из перечисленного является примером косвенного налога?', opts:['НДС','налог на прибыль организаций','НДФЛ','налог на имущество физических лиц'], a:'НДС', hint:'НДС включается в цену товара и относится к косвенным налогам.'},
      {g:11, topic:'Политика', q:'Какой институт обеспечивает представительство интересов граждан в законодательном процессе?', opts:['парламент','прокуратура','армия','центральный банк'], a:'парламент', hint:'Парламент принимает законы и представляет интересы населения.'},
      {g:11, topic:'Право', q:'Если продавец отказывается возвращать деньги за бракованный товар, потребитель прежде всего может обратиться...', opts:['с претензией к продавцу','в военкомат','в орган ЗАГС','в нотариальную палату'], a:'с претензией к продавцу', hint:'Защита права потребителя обычно начинается с обращения к продавцу.'}
    ],
    ege_english: [
      {g:11, topic:'Reading', q:'Choose the sentence that best completes the gap: “The new course was demanding, ___ most students said it was worth the effort.”', opts:['but','because','unless','so that'], a:'but', hint:'The sentence contrasts difficulty with positive evaluation.'},
      {g:11, topic:'Grammar', q:'If she ___ earlier, she would have caught the train.', opts:['had left','left','has left','would leave'], a:'had left', hint:'Third conditional uses Past Perfect in the if-clause.'},
      {g:11, topic:'Word formation', q:'Complete the sentence with the correct form: “The documentary was both informative and highly ___.”', opts:['entertaining','entertainment','entertain','entertained'], a:'entertaining', hint:'After “highly” we need an adjective.'},
      {g:11, topic:'Vocabulary', q:'Choose the best word: “The committee reached a ___ after two hours of debate.”', opts:['decision','device','division','design'], a:'decision', hint:'Only “decision” collocates naturally with “reached”.'},
      {g:11, topic:'Grammar', q:'By the time we arrived, the lecture ___ .', opts:['had already started','already started','has already started','was already starting'], a:'had already started', hint:'Past Perfect marks an action completed before another past action.'},
      {g:11, topic:'Reading', q:'What does the phrase “a turning point” mean in context?', opts:['a moment of important change','a place to turn around','a small detail','a repeated mistake'], a:'a moment of important change', hint:'A turning point marks a major shift in a process or story.'},
      {g:11, topic:'Vocabulary', q:'Choose the correct option: “Students are encouraged to ___ on reliable sources when preparing reports.”', opts:['rely','relate','remove','remain'], a:'rely', hint:'The correct collocation is “rely on”.'},
      {g:11, topic:'Word formation', q:'Complete the sentence: “His explanation was clear and completely ___.”', opts:['convincing','convince','conviction','convinced'], a:'convincing', hint:'We need an adjective describing the explanation.'},
      {g:11, topic:'Grammar', q:'Neither the teacher nor the students ___ ready to leave the classroom.', opts:['were','was','is','be'], a:'were', hint:'With “neither...nor”, the verb agrees with the noun closest to it.'}
    ],
    ege_physics: [
      {g:11, topic:'Механика', q:'Тело движется равномерно со скоростью 6 м/с. Какой путь оно пройдёт за 4 с?', opts:['24 м','10 м','12 м','2,5 м'], a:'24 м', hint:'При равномерном движении s = vt = 6·4.'},
      {g:11, topic:'Механика', q:'Если на тело массой 2 кг действует сила 8 Н, то ускорение равно...', opts:['4 м/с²','16 м/с²','6 м/с²','2 м/с²'], a:'4 м/с²', hint:'По второму закону Ньютона a = F / m.'},
      {g:11, topic:'МКТ и термодинамика', q:'Как изменится давление идеального газа при неизменном объёме, если абсолютная температура увеличится в 2 раза?', opts:['увеличится в 2 раза','уменьшится в 2 раза','не изменится','увеличится в 4 раза'], a:'увеличится в 2 раза', hint:'При постоянном объёме p прямо пропорционально T.'},
      {g:11, topic:'Электродинамика', q:'Сила тока в цепи равна 2 А, сопротивление 6 Ом. Напряжение на участке цепи равно...', opts:['12 В','3 В','8 В','18 В'], a:'12 В', hint:'По закону Ома U = IR.'},
      {g:11, topic:'Оптика', q:'Угол падения светового луча на плоское зеркало равен 35°. Чему равен угол отражения?', opts:['35°','70°','55°','17,5°'], a:'35°', hint:'Угол отражения равен углу падения.'},
      {g:11, topic:'Квантовая физика', q:'Какая частица имеет отрицательный электрический заряд?', opts:['электрон','нейтрон','фотон','нейтрино'], a:'электрон', hint:'Электрон несёт элементарный отрицательный заряд.'},
      {g:11, topic:'Механика', q:'Импульс тела массой 3 кг, движущегося со скоростью 4 м/с, равен...', opts:['12 кг·м/с','7 кг·м/с','1,3 кг·м/с','24 кг·м/с'], a:'12 кг·м/с', hint:'Импульс p = mv.'},
      {g:11, topic:'Эксперимент и графики', q:'На графике зависимости координаты от времени прямая линия с постоянным наклоном означает...', opts:['равномерное движение','покой и затем разгон','ускоренное движение','хаотическое движение'], a:'равномерное движение', hint:'Постоянный наклон графика x(t) соответствует постоянной скорости.'},
      {g:11, topic:'Электродинамика', q:'Как соединяются резисторы, если сила тока в каждом из них одинакова?', opts:['последовательно','параллельно','смешанно и только так','это невозможно'], a:'последовательно', hint:'При последовательном соединении ток одинаков во всех элементах.'}
    ]
  };

  function makeWave71EgeSocialVariant(idx){
    return {
      id: 'ege_social_var' + idx,
      exam: 'ЕГЭ',
      label: 'ЕГЭ · Обществознание · Вариант ' + idx,
      subjectId: 'social',
      fallbackSubjects: ['social'],
      accent: '#7c3aed',
      grades: '11 класс',
      minG: 10,
      maxG: 11,
      maxQ: 20,
      timeLimit: 210 * 60,
      scoreKind: 'ege100',
      scoreModel: 'ege_social_part1_2026',
      seed: 'ege_social_var' + idx,
      order: 81 + idx,
      summary: '20 заданий · часть 1 · тренажёр варианта',
      bands: [
        { min: 0, label: 'ниже порога', note: 'часть 1 тренажёра · ниже пороговой зоны' },
        { min: 8, label: '42+ / порог', note: 'часть 1 тренажёра · вузовский минимум' },
        { min: 12, label: '55+ / рабочий', note: 'часть 1 тренажёра · рабочий уровень' },
        { min: 15, label: '70+ / сильный', note: 'часть 1 тренажёра · сильный результат' },
        { min: 18, label: '85+ / высокий', note: 'часть 1 тренажёра · высокий уровень' }
      ],
      sections: [
        { label:'Человек и общество', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_social.slice(0,2) }, { subject:'social', minG:10, maxG:11, topics:['обществ','духов','культур','философ','деятельн'] }] },
        { label:'Экономика', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_social.slice(1,3) }, { subject:'social', minG:10, maxG:11, topics:['эконом','рынок','налог','бюджет','финанс'] }] },
        { label:'Социальная сфера', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_social.slice(2,4) }, { subject:'social', minG:10, maxG:11, topics:['социал','семь','мобиль','стратиф','групп'] }] },
        { label:'Политика', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_social.slice(3,8) }, { subject:'social', minG:10, maxG:11, topics:['полит','государ','власть','парт','выбор'] }] },
        { label:'Право и кейсы', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_social.slice(4) }, { subject:'social', minG:10, maxG:11, topics:['право','конституц','суд','граждан','потребител'] }] }
      ]
    };
  }

  function makeWave71EgeEnglishVariant(idx){
    return {
      id: 'ege_english_var' + idx,
      exam: 'ЕГЭ',
      label: 'ЕГЭ · Английский язык · Вариант ' + idx,
      subjectId: 'english',
      fallbackSubjects: ['english'],
      accent: '#0f766e',
      grades: '10–11 класс',
      minG: 9,
      maxG: 11,
      maxQ: 20,
      timeLimit: 190 * 60,
      scoreKind: 'ege100',
      scoreModel: 'ege_english_part1_2026',
      seed: 'ege_english_var' + idx,
      order: 91 + idx,
      summary: '20 заданий · grammar / vocabulary / reading · письменная часть',
      bands: [
        { min: 0, label: 'ниже порога', note: 'grammar/reading trainer · ниже порога' },
        { min: 5, label: '22+ / порог', note: 'grammar/reading trainer · достигнут минимум' },
        { min: 10, label: '50+ / рабочий', note: 'grammar/reading trainer · рабочий уровень' },
        { min: 15, label: '70+ / сильный', note: 'grammar/reading trainer · сильный результат' },
        { min: 18, label: '85+ / высокий', note: 'grammar/reading trainer · высокий уровень' }
      ],
      sections: [
        { label:'Reading', count:5, points:1, sources:[{ boosters: WAVE71_CURATED.ege_english.slice(0,2) }, { subject:'english', minG:9, maxG:11, topics:['reading','linker','текст','лексик'] }] },
        { label:'Grammar', count:5, points:1, sources:[{ boosters: WAVE71_CURATED.ege_english.slice(1,5) }, { subject:'english', minG:9, maxG:11, topics:['grammar','граммат','времен','услов','пассив','reported'] }] },
        { label:'Word formation', count:5, points:1, sources:[{ boosters: WAVE71_CURATED.ege_english.slice(2,8) }, { subject:'english', minG:9, maxG:11, topics:['словообраз','word formation','articles','prepositions','quantifiers'] }] },
        { label:'Vocabulary & use of English', count:5, points:1, sources:[{ boosters: WAVE71_CURATED.ege_english.slice(3) }, { subject:'english', minG:9, maxG:11, topics:['лексик','vocabulary','phrasal','collocation','advanced'] }] }
      ]
    };
  }

  function makeWave71EgePhysicsVariant(idx){
    return {
      id: 'ege_physics_var' + idx,
      exam: 'ЕГЭ',
      label: 'ЕГЭ · Физика · Вариант ' + idx,
      subjectId: 'physics',
      fallbackSubjects: ['physics'],
      accent: '#1d4ed8',
      grades: '10–11 класс',
      minG: 9,
      maxG: 11,
      maxQ: 20,
      timeLimit: 235 * 60,
      scoreKind: 'ege100',
      scoreModel: 'ege_physics_part1_2026',
      seed: 'ege_physics_var' + idx,
      order: 101 + idx,
      summary: '20 заданий · часть 1 · механика / МКТ / электричество / оптика',
      bands: [
        { min: 0, label: 'ниже порога', note: 'часть 1 тренажёра · ниже порога' },
        { min: 7, label: '36+ / порог', note: 'часть 1 тренажёра · достигнут минимум' },
        { min: 11, label: '55+ / рабочий', note: 'часть 1 тренажёра · рабочий уровень' },
        { min: 15, label: '70+ / сильный', note: 'часть 1 тренажёра · сильный результат' },
        { min: 18, label: '85+ / высокий', note: 'часть 1 тренажёра · высокий уровень' }
      ],
      sections: [
        { label:'Механика', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_physics.slice(0,2) }, { subject:'physics', minG:9, maxG:11, topics:['механ','кинемат','динам','импульс','энерг'] }] },
        { label:'МКТ и термодинамика', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_physics.slice(2,4) }, { subject:'physics', minG:9, maxG:11, topics:['молекуляр','термо','газ','тепл','внутрен'] }] },
        { label:'Электродинамика', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_physics.slice(3,5) }, { subject:'physics', minG:9, maxG:11, topics:['электр','магнит','электростат','ток','закон ома'] }] },
        { label:'Оптика и квантовая физика', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_physics.slice(4,7) }, { subject:'physics', minG:9, maxG:11, topics:['оптик','квант','атом','фото','свет'] }] },
        { label:'Графики, эксперименты, формулы', count:4, points:1, sources:[{ boosters: WAVE71_CURATED.ege_physics.slice(7) }, { subject:'physics', minG:9, maxG:11 }] }
      ]
    };
  }

  function attachWave71EgePacks(){
    if (EXAM_PACKS.ege_english) EXAM_PACKS.ege_english.hidden = true;
    structuredVariantNosHint('ege_social_2026_part1', 50).forEach(function(i){
      EXAM_PACKS['ege_social_var' + i] = makeWave71EgeSocialVariant(i);
    });
    structuredVariantNosHint('ege_english_2026_part1', 30).forEach(function(i){
      EXAM_PACKS['ege_english_var' + i] = makeWave71EgeEnglishVariant(i);
    });
    structuredVariantNosHint('ege_physics_2026_part1', 30).forEach(function(i){
      EXAM_PACKS['ege_physics_var' + i] = makeWave71EgePhysicsVariant(i);
    });
  }
  attachWave71EgePacks();

  /* wave89q: structured exam bank + KIM generator */
  var STRUCTURED_SCHEMA_VERSION = 'wave89q_exam_bank_v1';
  var STRUCTURED_FAMILY_CACHE = {};
  var STRUCTURED_FAMILY_LOAD_FAILED = {};
  var STRUCTURED_FAMILY_SPECS = {
    oge_math_2026_full: { pattern: /^oge_math_var(\d+)$/, exam:'ОГЭ', subject:'math', year:2026, mode:'full' },
    oge_russian_2026_full: { pattern: /^oge_russian_var(\d+)$/, exam:'ОГЭ', subject:'russian', year:2026, mode:'full' },
    oge_english_2026_full: { pattern: /^oge_english_var(\d+)$/, exam:'ОГЭ', subject:'english', year:2026, mode:'full' },
    oge_social_2026_full: { pattern: /^oge_social_var(\d+)$/, exam:'ОГЭ', subject:'social', year:2026, mode:'full' },
    ege_base_math_2026_full: { pattern: /^ege_base_math_var(\d+)$/, exam:'ЕГЭ', subject:'base_math', year:2026, mode:'full' },
    ege_profile_math_2026_part1: { pattern: /^ege_profile_math_var(\d+)$/, exam:'ЕГЭ', subject:'profile_math', year:2026, mode:'part1' },
    ege_russian_2026_part1: { pattern: /^ege_russian_var(\d+)$/, exam:'ЕГЭ', subject:'russian', year:2026, mode:'part1' },
    ege_social_2026_part1: { pattern: /^ege_social_var(\d+)$/, exam:'ЕГЭ', subject:'social', year:2026, mode:'part1' },
    ege_english_2026_part1: { pattern: /^ege_english_var(\d+)$/, exam:'ЕГЭ', subject:'english', year:2026, mode:'part1' },
    ege_physics_2026_part1: { pattern: /^ege_physics_var(\d+)$/, exam:'ЕГЭ', subject:'physics', year:2026, mode:'part1' }
  };

  function clonePlain(value){
    try { return JSON.parse(JSON.stringify(value)); } catch(_) { return value; }
  }
  function structuredRuntimePayload(){
    try { return window.WAVE89Q_EXAM_BANK || null; } catch(_) { return null; }
  }
  function structuredRuntimeFamily(familyId){
    var payload = structuredRuntimePayload();
    var family = payload && payload.families && payload.families[familyId];
    return family ? clonePlain(family) : null;
  }
  function isStructuredFamilyLoaded(familyId){
    var payload = structuredRuntimePayload();
    return !!(payload && payload.families && payload.families[familyId]);
  }
  function loadStructuredFamily(familyId, callback){
    familyId = String(familyId || '');
    if (!familyId) { if (callback) callback(null, false, new Error('empty family id')); return null; }
    if (isStructuredFamilyLoaded(familyId)) {
      var loaded = structuredRuntimeFamily(familyId);
      if (callback) setTimeout(function(){ callback(loaded, true, null); }, 0);
      return Promise.resolve(loaded);
    }
    var payload = structuredRuntimePayload();
    if (!payload || typeof payload.ensureFamily !== 'function') {
      if (callback) setTimeout(function(){ callback(null, false, new Error('lazy exam bank loader is unavailable')); }, 0);
      return null;
    }
    var promise = payload.ensureFamily(familyId, function(family, ok, error){
      if (ok && family) {
        delete STRUCTURED_FAMILY_LOAD_FAILED[familyId];
        delete STRUCTURED_FAMILY_CACHE[familyId];
        if (callback) callback(clonePlain(family), true, null);
      } else {
        STRUCTURED_FAMILY_LOAD_FAILED[familyId] = true;
        if (callback) callback(null, false, error || new Error('failed to load ' + familyId));
      }
    });
    return promise || null;
  }
  function notifyStructuredBankLoading(packId){
    try {
      var pack = EXAM_PACKS[packId];
      var label = pack && pack.label ? pack.label : 'экзаменный банк';
      if (typeof window.toast === 'function') window.toast('Загружаю ' + label + '…');
      var btns = document.querySelectorAll('[' + EXAM_PACK_ATTR + '="' + String(packId).replace(/"/g, '\"') + '"]');
      Array.prototype.slice.call(btns).forEach(function(btn){
        if (!btn) return;
        if (!btn.dataset.wave91OriginalText) btn.dataset.wave91OriginalText = btn.textContent || '';
        btn.textContent = 'Загружаю банк…';
        btn.disabled = true;
      });
    } catch(_err) {}
  }
  function clearStructuredBankLoading(packId){
    try {
      var btns = document.querySelectorAll('[' + EXAM_PACK_ATTR + '="' + String(packId).replace(/"/g, '\"') + '"]');
      Array.prototype.slice.call(btns).forEach(function(btn){
        if (!btn) return;
        btn.disabled = false;
        if (btn.dataset.wave91OriginalText) btn.textContent = btn.dataset.wave91OriginalText;
      });
    } catch(_err) {}
  }
  function listStructuredFamilies(){ return Object.keys(STRUCTURED_FAMILY_SPECS); }
  function matchStructuredPackId(packId){
    packId = String(packId || '');
    var keys = listStructuredFamilies();
    for (var i = 0; i < keys.length; i++) {
      var familyId = keys[i];
      var spec = STRUCTURED_FAMILY_SPECS[familyId];
      var match = packId.match(spec.pattern);
      if (match) return { familyId: familyId, variantNo: toNum(match[1]) || 1, spec: spec };
    }
    return null;
  }
  function structuredPackIds(familyId){
    var match = familyId ? STRUCTURED_FAMILY_SPECS[familyId] : null;
    if (!match) return [];
    return Object.keys(EXAM_PACKS).filter(function(id){ return match.pattern.test(id); }).sort(function(a, b){ return a.localeCompare(b, 'ru'); });
  }
  function structuredYearForPack(pack, fallback){
    var raw = String((pack && pack.scoreModel) || '') + ' ' + String((pack && pack.label) || '') + ' ' + String((pack && pack.summary) || '');
    var match = raw.match(/20\d{2}/);
    return match ? toNum(match[0]) : toNum(fallback || 2026);
  }
  function structuredSubjectForPack(pack, spec){
    if (spec && spec.subject) return spec.subject;
    var id = String((pack && pack.subjectId) || '');
    if (id === 'algebra' && /^ege_profile_math/.test(String(pack && pack.id || ''))) return 'profile_math';
    if (id === 'mathall' && /^ege_base_math/.test(String(pack && pack.id || ''))) return 'base_math';
    if (id === 'mathall' && /^oge_math/.test(String(pack && pack.id || ''))) return 'math';
    return id || 'subject';
  }
  function structuredTypeFromQuestion(question){
    if (!question) return 'single';
    if (question.inputMode === 'text') return 'short_text';
    if (question.inputMode === 'numeric') return 'short_numeric';
    if (question.interactionType === 'match') return 'match';
    if (question.interactionType === 'sequence') return 'sequence';
    if (question.interactionType === 'find-error') return 'find_error';
    if (question.interactionType === 'multi-select' || Array.isArray(question.correctAnswers)) return 'multiple';
    return 'single';
  }
  function structuredTopicTag(value){
    return String(value || '').toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'exam_topic';
  }
  function structuredCriteriaForQuestion(question, points, type){
    if (Array.isArray(question && question.criteria) && question.criteria.length) return question.criteria.slice();
    if (type === 'short_text' || type === 'short_numeric') return ['1 балл за точный ответ без лишних символов.'];
    if (type === 'multiple') return ['1 балл только при выборе всех верных вариантов.'];
    if (points > 1) return [String(points) + ' балла за полный и верный ответ.', 'Проверьте ход решения и итоговый результат.'];
    return ['1 балл за верный ответ.'];
  }
  function structuredBlueprintFromBuilt(pack, built, familyId, spec){
    var tasks = (built.questions || []).map(function(question){
      return {
        task_num: toNum(question.taskNo),
        section: question.section || question.topic || 'Раздел',
        type: structuredTypeFromQuestion(question),
        max_score: toNum(question.points || 1),
        topic_tag: structuredTopicTag(question.section || question.topic),
        part: question.part || (toNum(question.points || 1) > 1 ? 'B' : 'A')
      };
    });
    return {
      schema: STRUCTURED_SCHEMA_VERSION,
      family_id: familyId,
      exam: built.exam,
      subject: structuredSubjectForPack(pack, spec),
      year: structuredYearForPack(pack, spec && spec.year),
      mode: spec && spec.mode ? spec.mode : 'variant',
      task_count: tasks.length,
      time_limit_sec: toNum(built.timeLimit),
      summary: built.summary || '',
      score_kind: built.scoreKind || '',
      score_model: built.scoreModel || '',
      accent: built.accent || '',
      grades: built.grades || '',
      tasks: tasks
    };
  }
  function structuredRowFromQuestion(pack, built, question, variantNo, spec){
    var type = structuredTypeFromQuestion(question);
    return {
      exam: built.exam,
      subject: structuredSubjectForPack(pack, spec),
      year: structuredYearForPack(pack, spec && spec.year),
      variant: toNum(variantNo) || 1,
      task_num: toNum(question.taskNo),
      type: type,
      max_score: toNum(question.points || 1),
      q: question.q,
      a: question.a,
      o: (question.opts || []).slice(),
      h: question.hint || '',
      ex: question.ex || '',
      criteria: structuredCriteriaForQuestion(question, toNum(question.points || 1), type),
      topic_tag: structuredTopicTag(question.section || question.topic),
      section: question.section || '',
      topic: question.topic || '',
      grades: built.grades || '',
      source_pack: pack.id,
      source_tag: question.sourceTag || question.bankSource || '',
      score_kind: built.scoreKind || '',
      score_model: built.scoreModel || '',
      part: question.part || (toNum(question.points || 1) > 1 ? 'B' : 'A')
    };
  }
  function compileStructuredFamily(familyId){
    if (STRUCTURED_FAMILY_CACHE[familyId]) return STRUCTURED_FAMILY_CACHE[familyId];
    var runtimeFamily = structuredRuntimeFamily(familyId);
    if (runtimeFamily && runtimeFamily.rows && runtimeFamily.rows.length && runtimeFamily.blueprint) {
      STRUCTURED_FAMILY_CACHE[familyId] = runtimeFamily;
      return runtimeFamily;
    }
    var spec = STRUCTURED_FAMILY_SPECS[familyId];
    if (!spec) return null;
    var packIds = structuredPackIds(familyId);
    var rows = [];
    var variants = [];
    var blueprint = null;
    var firstBuilt = null;
    var firstPack = null;
    packIds.forEach(function(packId){
      var match = matchStructuredPackId(packId);
      var pack = EXAM_PACKS[packId];
      var built = pack ? buildLegacyPack(packId) : null;
      if (!match || !pack || !built || !built.questions || !built.questions.length) return;
      firstBuilt = firstBuilt || built;
      firstPack = firstPack || pack;
      if (!blueprint) blueprint = structuredBlueprintFromBuilt(pack, built, familyId, spec);
      variants.push(match.variantNo);
      (built.questions || []).forEach(function(question){
        rows.push(structuredRowFromQuestion(pack, built, question, match.variantNo, spec));
      });
    });
    if (!firstBuilt || !rows.length || !blueprint) return null;
    blueprint.variant_count = variants.length;
    var snapshot = {
      schema: STRUCTURED_SCHEMA_VERSION,
      family_id: familyId,
      exam: firstBuilt.exam,
      subject: structuredSubjectForPack(firstPack, spec),
      year: structuredYearForPack(firstPack, spec && spec.year),
      variants: variants.slice().sort(function(a, b){ return a - b; }),
      blueprint: blueprint,
      rows: rows,
      row_count: rows.length,
      pack_ids: packIds.slice(),
      compiled_from: 'legacy_runtime'
    };
    STRUCTURED_FAMILY_CACHE[familyId] = snapshot;
    return snapshot;
  }
  function getStructuredFamily(familyId){
    var family = compileStructuredFamily(familyId);
    return family ? clonePlain(family) : null;
  }
  function getStructuredBlueprint(familyId){
    var family = compileStructuredFamily(familyId);
    return family ? clonePlain(family.blueprint) : null;
  }
  function getStructuredRows(familyId){
    var family = compileStructuredFamily(familyId);
    return family ? clonePlain(family.rows) : [];
  }
  function buildStructuredKim(familyId, variantNo){
    if (familyId && typeof familyId === 'object') {
      variantNo = familyId.variant || familyId.variantNo || familyId.variant_index;
      familyId = familyId.familyId || familyId.id || familyId.family_id;
    }
    familyId = String(familyId || '');
    var family = compileStructuredFamily(familyId);
    if (!family) return null;
    variantNo = Math.max(1, toNum(variantNo) || toNum((family.variants || [1])[0]));
    var packId = '';
    Object.keys(EXAM_PACKS).some(function(id){
      var match = matchStructuredPackId(id);
      if (match && match.familyId === familyId && toNum(match.variantNo) === variantNo) { packId = id; return true; }
      return false;
    });
    var pack = packId && EXAM_PACKS[packId] ? EXAM_PACKS[packId] : null;
    var tasks = (family.blueprint && family.blueprint.tasks ? family.blueprint.tasks.slice() : []).sort(function(a, b){ return toNum(a.task_num) - toNum(b.task_num); });
    var pickedRows = [];
    tasks.forEach(function(task){
      var rows = family.rows.filter(function(row){ return toNum(row.variant) === variantNo && toNum(row.task_num) === toNum(task.task_num); });
      if (!rows.length) rows = family.rows.filter(function(row){ return toNum(row.task_num) === toNum(task.task_num); });
      if (!rows.length) return;
      var chosen = stableShuffle(rows, familyId + '|v' + variantNo + '|t' + toNum(task.task_num))[0];
      if (chosen) pickedRows.push(chosen);
    });
    if (!pickedRows.length) return null;
    pickedRows.sort(function(a, b){ return toNum(a.task_num) - toNum(b.task_num); });
    var questions = pickedRows.map(function(row){
      var meta = {
        examPackId: pack ? pack.id : (familyId + '_v' + variantNo),
        examLabel: pack ? pack.label : (family.exam + ' · ' + family.subject + ' · Вариант ' + variantNo),
        exam: family.exam,
        section: row.section || row.topic || 'Раздел',
        points: toNum(row.max_score || 1),
        part: row.part || (toNum(row.max_score || 1) > 1 ? 'B' : 'A'),
        taskNo: toNum(row.task_num),
        scoreKind: pack ? pack.scoreKind : family.blueprint.score_kind,
        ex: row.ex || '',
        criteria: Array.isArray(row.criteria) ? row.criteria.slice() : [],
        sourceTag: 'structured-bank',
        bankSource: familyId,
        structuredBankRow: clonePlain(row),
        structuredFamilySource: family.compiled_from || 'legacy_runtime',
        topicTag: row.topic_tag
      };
      return cloneQuestion({
        g: pack ? toNum(pack.maxG || pack.minG || 9) : 11,
        topic: row.section || row.topic || 'Экзамен',
        q: row.q,
        opts: (row.o || []).slice(),
        a: row.a,
        hint: row.h || 'Разбор — после результата.'
      }, meta);
    });
    var maxPoints = questions.reduce(function(sum, row){ return sum + toNum(row.points || 1); }, 0);
    return {
      id: pack ? pack.id : (familyId + '_v' + variantNo),
      label: pack ? pack.label : (family.exam + ' · ' + family.subject + ' · Вариант ' + variantNo),
      exam: family.exam,
      subjectId: pack ? pack.subjectId : family.subject,
      summary: pack ? pack.summary : (family.blueprint && family.blueprint.summary) || '',
      maxQ: questions.length,
      timeLimit: pack ? pack.timeLimit : toNum(family.blueprint && family.blueprint.time_limit_sec),
      scoreKind: pack ? pack.scoreKind : (family.blueprint && family.blueprint.score_kind) || '',
      scoreModel: pack ? (pack.scoreModel || '') : (family.blueprint && family.blueprint.score_model) || '',
      geometrySections: pack ? (pack.geometrySections || []).slice() : [],
      literacySections: pack ? (pack.literacySections || []).slice() : [],
      bands: pack ? pack.bands : [],
      accent: pack ? pack.accent : (family.blueprint && family.blueprint.accent) || '',
      grades: pack ? pack.grades : (family.blueprint && family.blueprint.grades) || '',
      questions: questions,
      bankCount: toNum(family.row_count),
      maxPoints: maxPoints,
      structuredFamilyId: familyId,
      structuredVariant: variantNo,
      structuredSchema: STRUCTURED_SCHEMA_VERSION,
      structuredFamilySource: family.compiled_from || 'legacy_runtime',
      generatedFromStructuredBank: true,
      generatedFromStructuredJson: family.compiled_from === 'json_bank',
      structuredBlueprint: clonePlain(family.blueprint)
    };
  }
  function exportStructuredBankSnapshot(){
    var out = {};
    listStructuredFamilies().forEach(function(familyId){
      var family = compileStructuredFamily(familyId);
      if (family) out[familyId] = clonePlain(family);
    });
    return { schema: STRUCTURED_SCHEMA_VERSION, families: out };
  }
  function buildPack(packId){
    var match = matchStructuredPackId(packId);
    if (match) {
      var structured = buildStructuredKim(match.familyId, match.variantNo);
      if (structured && structured.questions && structured.questions.length) return structured;
    }
    return buildLegacyPack(packId);
  }

  function buildLegacyPack(packId){
    var pack = EXAM_PACKS[packId];
    if (!pack) return null;
    var questions = [];
    var used = new Set();
    var packPool = [];
    var taskNo = 1;
    (pack.sections || []).forEach(function(section){
      var sectionPool = [];
      (section.sources || []).forEach(function(source){ sectionPool = sectionPool.concat(collectRows(source)); });
      sectionPool = dedupeQuestions(sectionPool);
      packPool = packPool.concat(sectionPool);
      var sectionSeed = packSeed(pack.seed || pack.id || packId, section.label || 'section');
      var selected = pickUnique(sectionPool, used, toNum(section.count), sectionSeed);
      if (selected.length < toNum(section.count)) {
        var needed = toNum(section.count) - selected.length;
        selected = selected.concat(pickUnique(fallbackPool(pack), used, needed, sectionSeed + '|fallback'));
      }
      selected.forEach(function(row){
        questions.push(cloneQuestion(row, {
          examPackId: pack.id,
          examLabel: pack.label,
          exam: pack.exam,
          section: section.label,
          points: toNum(section.points) || 1,
          part: toNum(section.points) > 1 ? 'B' : 'A',
          taskNo: taskNo++,
          scoreKind: pack.scoreKind
        }));
      });
    });
    questions = questions.slice(0, pack.maxQ);
    var maxPoints = questions.reduce(function(sum, q){ return sum + toNum(q.points || 1); }, 0);
    return {
      id: pack.id,
      label: pack.label,
      exam: pack.exam,
      subjectId: pack.subjectId,
      summary: pack.summary,
      maxQ: questions.length,
      timeLimit: pack.timeLimit,
      scoreKind: pack.scoreKind,
      scoreModel: pack.scoreModel || '',
      geometrySections: (pack.geometrySections || []).slice(),
      literacySections: (pack.literacySections || []).slice(),
      bands: pack.bands,
      accent: pack.accent,
      grades: pack.grades,
      questions: questions,
      bankCount: dedupeQuestions(packPool).length,
      maxPoints: maxPoints
    };
  }

  function resolveBand(pack, raw){
    var bands = (pack && pack.bands) || [];
    var active = bands.length ? bands[0] : { label:'—', note:'—' };
    for (var i = 0; i < bands.length; i++) {
      if (raw >= toNum(bands[i].min)) active = bands[i];
    }
    return active;
  }
  function sectionScore(sections, names){
    var total = 0;
    (names || []).forEach(function(name){ if (sections[name]) total += toNum(sections[name].raw); });
    return total;
  }
  function resolveOgeScoreModel(pack, raw, sections){
    var scoreModel = String((pack && pack.scoreModel) || '');
    if (!scoreModel) return null;
    if (scoreModel === 'oge_math_2026') {
      var geometryRaw = sectionScore(sections, pack.geometrySections || []);
      if (raw >= 22 && geometryRaw >= 2) return { label:'5', note:'по шкале ФИПИ 2026 · минимум по геометрии выполнен' };
      if (raw >= 15 && geometryRaw >= 2) return { label:'4', note:'по шкале ФИПИ 2026 · уверенный уровень' };
      if (raw >= 8 && geometryRaw >= 2) return { label:'3', note:'по шкале ФИПИ 2026 · порог пройден' };
      if (raw >= 8 && geometryRaw < 2) return { label:'2', note:'не выполнен обязательный минимум по геометрии (2 балла)' };
      return { label:'2', note:'ниже минимального порога ОГЭ' };
    }
    if (scoreModel === 'oge_russian_2026') {
      var literacy = sectionScore(sections, pack.literacySections || []);
      if (raw >= 33) {
        if (literacy >= 9) return { label:'5', note:'по шкале ФИПИ 2026 · грамотность на высоком уровне' };
        return { label:'4', note:'до «5» не хватило прокси-грамотности (ориентир по модели)' };
      }
      if (raw >= 26) {
        if (literacy >= 6) return { label:'4', note:'по шкале ФИПИ 2026 · уровень «4»' };
        return { label:'3', note:'баллов хватило, но прокси-грамотность ниже порога для «4»' };
      }
      if (raw >= 15) return { label:'3', note:'по шкале ФИПИ 2026 · зачётный минимум' };
      return { label:'2', note:'ниже порога ОГЭ' };
    }
    if (scoreModel === 'oge_social_2026') {
      if (raw >= 32) return { label:'5', note:'по шкале ФИПИ 2026 · сильный вариант' };
      if (raw >= 24) return { label:'4', note:'по шкале ФИПИ 2026 · хороший результат' };
      if (raw >= 14) return { label:'3', note:'по шкале ФИПИ 2026 · порог пройден' };
      return { label:'2', note:'ниже порога ОГЭ' };
    }
    if (scoreModel === 'oge_english_2026') {
      if (raw >= 58) return { label:'5', note:'по шкале ФИПИ 2026 · full-style English' };
      if (raw >= 46) return { label:'4', note:'по шкале ФИПИ 2026 · уверенный результат' };
      if (raw >= 29) return { label:'3', note:'по шкале ФИПИ 2026 · базовый уровень' };
      return { label:'2', note:'ниже порога ОГЭ' };
    }
    if (scoreModel === 'ege_base_math_2026') {
      if (raw >= 17) return { label:'5', note:'традиционная шкала базовой математики · сильный результат' };
      if (raw >= 12) return { label:'4', note:'традиционная шкала базовой математики · хороший результат' };
      if (raw >= 7) return { label:'3', note:'традиционная шкала базовой математики · минимум пройден' };
      return { label:'2', note:'ниже порога базовой математики' };
    }
    if (scoreModel === 'ege_profile_math_part1_2026') {
      var profile100 = mapModelScore(raw, [0,8,14,20,27,34,41,49,57,66,76,87,100]);
      if (profile100 >= 85) return { label:'85+ / высокий', note:'часть 1 тренажёра · модель привязана к публичному минимуму 27', score100: profile100 };
      if (profile100 >= 70) return { label:'70+ / сильный', note:'часть 1 тренажёра · устойчивый профильный результат', score100: profile100 };
      if (profile100 >= 50) return { label:'50+ / рабочий', note:'часть 1 тренажёра · рабочий уровень для продолжения подготовки', score100: profile100 };
      if (profile100 >= 27) return { label:'27+ / порог', note:'часть 1 тренажёра · достигнут вузовский минимум', score100: profile100 };
      return { label:'ниже порога', note:'часть 1 тренажёра · ниже публичного минимума 27', score100: profile100 };
    }
    if (scoreModel === 'ege_russian_part1_2026') {
      var rus100 = mapModelScore(raw, [0,5,10,15,20,25,31,36,40,43,46,49,52,55,58,61,64,67,70,73,76,80,84,88,92,96,100]);
      if (rus100 >= 90) return { label:'90+ / высокий', note:'часть 1 без сочинения · сильный результат по тестовой части', score100: rus100 };
      if (rus100 >= 80) return { label:'80+ / сильный', note:'часть 1 без сочинения · сильная тестовая база', score100: rus100 };
      if (rus100 >= 60) return { label:'60+ / уверенно', note:'часть 1 без сочинения · уверенный рабочий уровень', score100: rus100 };
      if (rus100 >= 36) return { label:'36+ / порог', note:'часть 1 без сочинения · модель опирается на вузовский минимум 36', score100: rus100 };
      return { label:'ниже порога', note:'часть 1 без сочинения · ниже пороговой зоны', score100: rus100 };
    }

    if (scoreModel === 'ege_social_part1_2026') {
      var social100 = mapModelScore(raw, [0,5,10,16,22,28,35,39,42,46,50,54,58,62,66,70,76,82,88,94,100]);
      if (social100 >= 85) return { label:'85+ / высокий', note:'часть 1 тренажёра · сильный уровень по обществознанию', score100: social100 };
      if (social100 >= 70) return { label:'70+ / сильный', note:'часть 1 тренажёра · уверенный результат по обществознанию', score100: social100 };
      if (social100 >= 55) return { label:'55+ / рабочий', note:'часть 1 тренажёра · рабочий уровень для дальнейшей подготовки', score100: social100 };
      if (social100 >= 42) return { label:'42+ / порог', note:'часть 1 тренажёра · достигнут вузовский минимум 42', score100: social100 };
      return { label:'ниже порога', note:'часть 1 тренажёра · ниже публичного минимума 42', score100: social100 };
    }
    if (scoreModel === 'ege_physics_part1_2026') {
      var physics100 = mapModelScore(raw, [0,5,11,16,22,28,32,36,40,44,48,52,56,60,64,69,74,80,86,93,100]);
      if (physics100 >= 85) return { label:'85+ / высокий', note:'часть 1 тренажёра · сильный уровень по физике', score100: physics100 };
      if (physics100 >= 70) return { label:'70+ / сильный', note:'часть 1 тренажёра · уверенный результат по физике', score100: physics100 };
      if (physics100 >= 55) return { label:'55+ / рабочий', note:'часть 1 тренажёра · рабочий уровень по физике', score100: physics100 };
      if (physics100 >= 36) return { label:'36+ / порог', note:'часть 1 тренажёра · достигнут вузовский минимум 36', score100: physics100 };
      return { label:'ниже порога', note:'часть 1 тренажёра · ниже публичного минимума 36', score100: physics100 };
    }
    if (scoreModel === 'ege_english_part1_2026') {
      var eng100 = mapModelScore(raw, [0,4,8,12,17,22,27,32,37,42,47,52,57,62,68,74,80,86,92,96,100]);
      if (eng100 >= 85) return { label:'85+ / высокий', note:'grammar/reading trainer · сильная письменная база', score100: eng100 };
      if (eng100 >= 70) return { label:'70+ / сильный', note:'grammar/reading trainer · уверенный результат', score100: eng100 };
      if (eng100 >= 50) return { label:'50+ / рабочий', note:'grammar/reading trainer · рабочий уровень', score100: eng100 };
      if (eng100 >= 22) return { label:'22+ / порог', note:'grammar/reading trainer · достигнут вузовский минимум 22', score100: eng100 };
      return { label:'ниже порога', note:'grammar/reading trainer · ниже публичного минимума 22', score100: eng100 };
    }
    return null;
  }

  function getActivePack(){ return window.__wave30ActivePack || null; }
  function resetPackState(){
    window.__wave30ActivePack = null;
    window.__wave30LastExamResult = null;
    window.__wave30ExamPending = null;
    window.__wave30ExamUiState = null;
    closeExamReview(true);
  }

  function examUiState(){
    var pack = getActivePack();
    if (!pack) return null;
    var state = window.__wave30ExamUiState;
    if (!state || state.packId !== pack.id) {
      state = { packId: pack.id, flags: {}, visited: {} };
      window.__wave30ExamUiState = state;
    }
    if (!state.flags || typeof state.flags !== 'object') state.flags = {};
    if (!state.visited || typeof state.visited !== 'object') state.visited = {};
    return state;
  }

  function answerEntries(){
    return typeof answers !== 'undefined' && Array.isArray(answers) ? answers : [];
  }

  function answerMap(){
    var map = {};
    answerEntries().forEach(function(row){
      if (!row || typeof row.qi === 'undefined' || row.qi === null) return;
      map[String(row.qi)] = row;
    });
    return map;
  }

  function answerEntry(index){
    var map = answerMap();
    var key = String(index);
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
  }

  function upsertExamAnswer(entry){
    if (!entry || typeof entry.qi === 'undefined') return;
    if (typeof answers === 'undefined' || !Array.isArray(answers)) return;
    var key = String(entry.qi);
    for (var i = answers.length - 1; i >= 0; i--) {
      if (answers[i] && String(answers[i].qi) === key) {
        answers[i] = entry;
        return;
      }
    }
    answers.push(entry);
  }

  function packQuestionCount(pack){
    pack = pack || getActivePack();
    if (pack && pack.maxQ) return toNum(pack.maxQ);
    return typeof questions !== 'undefined' && Array.isArray(questions) ? questions.length : 0;
  }

  function answeredCount(pack){
    pack = pack || getActivePack();
    var total = packQuestionCount(pack);
    var map = answerMap();
    var count = 0;
    for (var i = 0; i < total; i++) {
      if (map[String(i)]) count += 1;
    }
    return count;
  }

  function unansweredCount(pack){
    pack = pack || getActivePack();
    return Math.max(0, packQuestionCount(pack) - answeredCount(pack));
  }

  function flaggedCount(pack){
    pack = pack || getActivePack();
    var state = examUiState();
    if (!state || !state.flags) return 0;
    var total = packQuestionCount(pack);
    var count = 0;
    for (var i = 0; i < total; i++) {
      if (state.flags[String(i)]) count += 1;
    }
    return count;
  }

  function isFlagged(index){
    var state = examUiState();
    return !!(state && state.flags && state.flags[String(index)]);
  }

  function setFlag(index, flagged){
    var state = examUiState();
    if (!state) return;
    var key = String(index);
    if (flagged) state.flags[key] = true;
    else delete state.flags[key];
  }

  function toggleFlag(index){
    setFlag(index, !isFlagged(index));
    updateQuizMeta();
  }

  function currentRemainingText(){
    var session = window.__wave25DiagSession || null;
    if (!session || !session.timeLimit) return '';
    var remaining = typeof session.remaining === 'number' ? session.remaining : session.timeLimit;
    return fmtTime(remaining);
  }

  function buildTaskButton(index, currentIndex){
    var classes = 'wave30-task-btn';
    if (index === currentIndex) classes += ' current';
    if (answerEntry(index)) classes += ' answered';
    else classes += ' pending';
    if (isFlagged(index)) classes += ' flagged';
    return '<button class="' + classes + '" type="button" ' + EXAM_ACTION_ATTR + '="jump-task" ' + EXAM_TASK_ATTR + '="' + index + '">' + (index + 1) + '</button>';
  }

  function closeExamReview(silent){
    var overlay = document.getElementById(EXAM_REVIEW_ID);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (!silent) updateQuizMeta();
  }

  function goToExamTask(index){
    if (typeof questions === 'undefined' || !Array.isArray(questions)) return false;
    index = toNum(index);
    if (index < 0 || index >= questions.length) return false;
    closeExamReview(true);
    if (typeof qIndex !== 'undefined') qIndex = index;
    if (typeof window.renderQ === 'function') window.renderQ();
    return true;
  }

  function nextExamIndex(fromIndex, unansweredOnly){
    if (typeof questions === 'undefined' || !Array.isArray(questions) || !questions.length) return -1;
    var total = questions.length;
    var start = toNum(fromIndex);
    for (var step = 1; step <= total; step++) {
      var idx = (start + step) % total;
      if (!unansweredOnly || !answerEntry(idx)) return idx;
    }
    return -1;
  }

  function rebuildExamGradeStats(){
    var pack = getActivePack();
    if (!pack || typeof questions === 'undefined' || !Array.isArray(questions)) return;
    if (typeof gradeStats === 'undefined') return;
    gradeStats = {};
    questions.forEach(function(q, idx){
      var grade = toNum(q && (q.g != null ? q.g : q.grade));
      if (!grade) grade = toNum(pack.minG || pack.maxG || 9);
      if (!gradeStats[grade]) gradeStats[grade] = { ok:0, total:0, topics:[] };
      gradeStats[grade].total += 1;
      var entry = answerEntry(idx);
      if (entry && entry.correct) gradeStats[grade].ok += 1;
      else if (q && q.topic && gradeStats[grade].topics.indexOf(q.topic) === -1) gradeStats[grade].topics.push(q.topic);
    });
  }

  function syncExamQuestionUi(){
    var pack = getActivePack();
    if (!pack || typeof questions === 'undefined' || !Array.isArray(questions) || !questions[qIndex]) return;
    var strip = document.getElementById('adapt-strip');
    if (strip) strip.style.display = 'none';
    var skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
      skipBtn.style.display = 'block';
      skipBtn.textContent = qIndex >= questions.length - 1 ? 'К финальной проверке →' : 'Дальше без ответа →';
    }
    var nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.textContent = qIndex >= questions.length - 1 ? 'Финальная проверка →' : 'Следующее →';
    var hintBox = document.getElementById('hint-box');
    if (hintBox) {
      hintBox.textContent = '';
      hintBox.className = 'hint-box';
    }
    var entry = answerEntry(qIndex);
    var buttons = Array.prototype.slice.call(document.querySelectorAll('#opts .opt'));
    if (!buttons.length) return;
    buttons.forEach(function(btn){
      btn.disabled = false;
      btn.classList.remove('ok');
      btn.classList.remove('no');
      btn.classList.remove('dim');
      btn.classList.remove('selected');
      if (entry && entry.chosenText && String(btn.textContent || '').trim() === String(entry.chosenText).trim()) {
        btn.classList.add('selected');
      }
    });
    if (nextBtn) nextBtn.className = entry ? 'next-btn show' : 'next-btn';
  }

  function openExamReview(){
    var pack = getActivePack();
    if (!pack) return false;
    ensureStyle();
    closeExamReview(true);
    var total = packQuestionCount(pack);
    var answered = answeredCount(pack);
    var flagged = flaggedCount(pack);
    var unanswered = Math.max(0, total - answered);
    var currentIndex = typeof qIndex !== 'undefined' ? qIndex : 0;
    var buttons = '';
    for (var i = 0; i < total; i++) buttons += buildTaskButton(i, currentIndex);
    var overlay = document.createElement('div');
    overlay.id = EXAM_REVIEW_ID;
    overlay.className = 'wave30-review';
    overlay.innerHTML = '' +
      '<div class="wave30-review-card" role="dialog" aria-modal="true" aria-labelledby="wave30-review-title">' +
        '<div class="wave30-review-title" id="wave30-review-title">Финальная проверка</div>' +
        '<div class="wave30-review-sub">Проверь, все ли задания отмечены. Можно вернуться к любому номеру до завершения варианта.</div>' +
        '<div class="wave30-review-stats">' +
          '<div class="wave30-review-stat"><b>' + answered + '/' + total + '</b><span>отвечено</span></div>' +
          '<div class="wave30-review-stat"><b>' + unanswered + '</b><span>без ответа</span></div>' +
          '<div class="wave30-review-stat"><b>' + flagged + '</b><span>отмечено «вернусь»</span></div>' +
          '<div class="wave30-review-stat"><b>' + esc(currentRemainingText() || '—') + '</b><span>времени осталось</span></div>' +
        '</div>' +
        '<div class="wave30-review-task-grid">' + buttons + '</div>' +
        '<div class="wave30-review-actions">' +
          '<button class="wave30-review-btn secondary" type="button" ' + EXAM_ACTION_ATTR + '="close-review">Вернуться к варианту</button>' +
          '<button class="wave30-review-btn primary" type="button" ' + EXAM_ACTION_ATTR + '="finish-pack">Завершить и показать результат' + (unanswered ? ' (' + unanswered + ' без ответа)' : '') + '</button>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('click', function(event){
      if (event.target === overlay) closeExamReview();
    });
    document.body.appendChild(overlay);
    return true;
  }

  function finishExamPack(){
    rebuildExamGradeStats();
    closeExamReview(true);
    if (typeof window.showResult === 'function') window.showResult();
  }

  function ensureStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      '.wave30-pack-host{margin:14px 0 18px}.wave30-pack-title{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:800;margin-bottom:10px}.wave30-pack-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.wave30-pack-card{background:var(--card);border:1.25px solid var(--border);border-radius:14px;padding:13px 13px 11px}.wave30-pack-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.wave30-pack-name{font-size:12px;font-weight:800;line-height:1.35}.wave30-pack-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:var(--bg);border:1px solid var(--border);font-size:10px;font-weight:700;color:var(--muted)}.wave30-pack-meta{font-size:10px;color:var(--muted);margin-top:8px;line-height:1.45}.wave30-pack-last{font-size:10px;color:var(--muted);margin-top:8px;line-height:1.4}.wave30-pack-btn{margin-top:10px;width:100%;padding:9px 11px;border:1.25px solid var(--pack-accent,var(--ink,var(--text)));border-radius:11px;background:var(--pack-bg,rgba(37,99,235,.06));color:var(--pack-accent,var(--ink,var(--text)));font-size:11.5px;font-weight:800;cursor:pointer;box-shadow:none;letter-spacing:.01em}' +
      '.wave30-quiz-meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.wave30-quiz-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:10px;font-weight:700;color:var(--muted)}.wave30-quiz-chip b{color:var(--text)}' +
      '.wave30-exam-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}.wave30-exam-stat{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:10px 8px;text-align:center}.wave30-exam-stat b{display:block;font-family:Unbounded,system-ui,sans-serif;font-size:16px}.wave30-exam-stat span{display:block;font-size:10px;color:var(--muted);margin-top:4px}.wave30-sec-list{display:flex;flex-direction:column;gap:8px}.wave30-sec-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px dashed var(--border)}.wave30-sec-row:first-child{border-top:none;padding-top:0}.wave30-sec-name{font-size:12px;font-weight:700}.wave30-sec-meta{font-size:10px;color:var(--muted);margin-top:3px}.wave30-sec-score{font-family:JetBrains Mono,monospace;font-size:13px;font-weight:800}.wave30-sec-band{margin-top:10px;font-size:12px;line-height:1.45;color:var(--text)}' +
      '.wave30-dash-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:8px}.wave30-dash-card{background:var(--card);border:1px solid var(--border);border-radius:var(--R,16px);padding:14px}.wave30-dash-k{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:700}.wave30-dash-v{font-family:Unbounded,system-ui,sans-serif;font-size:17px;font-weight:900;margin-top:6px}.wave30-dash-sub{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.4}.wave30-dash-list{display:flex;flex-direction:column;gap:8px}.wave30-dash-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--R,16px)}.wave30-dash-name{font-size:13px;font-weight:800}.wave30-dash-meta{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.45}.wave30-dash-score{font-family:JetBrains Mono,monospace;font-size:14px;font-weight:800}.wave30-dash-link{display:inline-flex;align-items:center;gap:6px;padding:7px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--border);font-size:10px;color:var(--muted);text-decoration:none;margin-top:8px}' +
      '@media (max-width:560px){.wave30-pack-grid,.wave30-exam-grid,.wave30-dash-grid{grid-template-columns:1fr}.wave30-pack-card,.wave30-dash-card,.wave30-dash-row{padding:12px}}';
    style.textContent += '' +
      '.wave30-quiz-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:-2px 0 10px}.wave30-quiz-action{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:10.5px;font-weight:800;cursor:pointer}.wave30-quiz-action.flagged{border-color:rgba(245,158,11,.45);background:rgba(245,158,11,.12);color:#b45309}.wave30-quiz-counter{font-size:10.5px;color:var(--muted);font-weight:700}.wave30-quiz-note{font-size:10px;color:var(--muted);font-weight:700}' +
      '.wave30-task-grid{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:6px;margin-bottom:10px}.wave30-task-btn{min-width:0;padding:8px 0;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--muted);font-size:10.5px;font-weight:800;cursor:pointer}.wave30-task-btn.current{border-color:rgba(37,99,235,.35);background:rgba(37,99,235,.1);color:var(--text)}.wave30-task-btn.answered{color:var(--green);border-color:rgba(22,163,74,.28)}.wave30-task-btn.flagged{box-shadow:inset 0 0 0 1px rgba(245,158,11,.45);color:#b45309}.wave30-task-btn.pending{color:var(--muted)}' +
      '.wave30-review{position:fixed;inset:0;z-index:10030;display:flex;align-items:flex-end;justify-content:center;padding:16px;background:rgba(15,23,42,.38)}.wave30-review-card{width:min(720px,100%);max-height:88vh;overflow:auto;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:16px}.wave30-review-title{font-size:16px;font-weight:900;font-family:Unbounded,system-ui,sans-serif}.wave30-review-sub{font-size:12px;color:var(--muted);margin-top:6px;line-height:1.5}.wave30-review-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.wave30-review-stat{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px;text-align:center}.wave30-review-stat b{display:block;font-family:Unbounded,system-ui,sans-serif;font-size:16px}.wave30-review-stat span{display:block;font-size:10px;color:var(--muted);margin-top:4px}.wave30-review-task-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:14px}.wave30-review-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.wave30-review-btn{flex:1 1 180px;padding:11px 14px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12px;font-weight:800;cursor:pointer}.wave30-review-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}.wave30-review-btn.secondary{background:var(--card)}' +
      '.opt.selected{border-color:var(--accent);background:rgba(37,99,235,.08);color:var(--text)}' +
      '@media (max-width:560px){.wave30-task-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.wave30-review{padding:10px}.wave30-review-card{padding:14px}.wave30-review-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.wave30-review-task-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}';
    document.head.appendChild(style);
  }

  function isDiagnosticPage(){ return !!document.getElementById('subj-grid') && typeof window.startDiag === 'function'; }
  function isDashboardPage(){ return !!document.getElementById('grades') && !!document.getElementById('activity'); }

  function renderPackHub(){
    if (!isDiagnosticPage()) return;
    ensureStyle();
    var intro = document.querySelector('.subj-intro');
    if (!intro) return;
    var history = lastByPack(loadHistory());
    var host = document.getElementById('wave30-pack-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'wave30-pack-host';
      host.className = 'wave30-pack-host';
      intro.appendChild(host);
    }
    var groups = { 'ОГЭ': [], 'ЕГЭ': [] };
    Object.keys(EXAM_PACKS).forEach(function(id){
      var pack = EXAM_PACKS[id];
      if (!pack || pack.hidden) return;
      if (!groups[pack.exam]) groups[pack.exam] = [];
      groups[pack.exam].push(pack);
    });
    Object.keys(groups).forEach(function(group){
      groups[group].sort(function(a, b){
        var ao = toNum(a.order || 0);
        var bo = toNum(b.order || 0);
        if (ao !== bo) return ao - bo;
        return String(a.label || '').localeCompare(String(b.label || ''), 'ru');
      });
    });
    setDiagShellState('browse');
    host.innerHTML = ['ОГЭ', 'ЕГЭ'].map(function(group){
      return '<div style="margin-top:12px">' +
        '<div class="wave30-pack-title">' + group + ' · ЭКЗАМЕНЫ</div>' +
        '<div class="wave30-pack-grid">' + groups[group].map(function(pack){
          var latest = history[pack.id];
          return '<div class="wave30-pack-card" style="--ink:' + esc(pack.accent) + '">' +
            '<div class="wave30-pack-head"><div class="wave30-pack-name">' + esc(pack.label) + '</div><span class="wave30-pack-badge">' + esc(pack.grades) + '</span></div>' +
            '<div class="wave30-pack-meta">' + esc(pack.summary) + '<br>' + pack.maxQ + ' заданий · ' + fmtTime(pack.timeLimit) + '</div>' +
            '<div class="wave30-pack-last">' + (latest ? ('Последний: <b style="color:' + esc(colorForPct(latest.pct)) + '">' + esc(String(latest.rawPoints) + '/' + String(latest.maxPoints)) + '</b> · ' + esc(latest.bandLabel) + ' · ' + esc(fmtDate(latest.ts))) : 'Пока без попыток') + '</div>' +
            '<button class="wave30-pack-btn" type="button" style="--pack-accent:' + esc(pack.accent) + ';--pack-bg:' + esc(hexToRgba(pack.accent, 0.10)) + '" ' + EXAM_ACTION_ATTR + '="start-pack" ' + EXAM_PACK_ATTR + '="' + esc(pack.id) + '">▶ Начать тест</button>' +
          '</div>';
        }).join('') + '</div></div>';
    }).join('');
  }

  function findExamActionNode(node){
    for (var el = node; el && el !== document; el = el.parentElement) {
      if (el.nodeType === 1 && el.hasAttribute && el.hasAttribute(EXAM_ACTION_ATTR)) return el;
    }
    return null;
  }

  function runExamAction(el, event){
    if (!el || el.disabled) return;
    var action = el.getAttribute(EXAM_ACTION_ATTR) || '';
    if (!action) return;
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (action === 'start-pack') {
      startPack(el.getAttribute(EXAM_PACK_ATTR) || '');
      return;
    }
    if (action === 'jump-task') {
      goToExamTask(el.getAttribute(EXAM_TASK_ATTR));
      return;
    }
    if (action === 'toggle-flag') {
      toggleFlag(typeof qIndex !== 'undefined' ? qIndex : 0);
      return;
    }
    if (action === 'review-pack') {
      openExamReview();
      return;
    }
    if (action === 'close-review') {
      closeExamReview();
      return;
    }
    if (action === 'finish-pack') {
      finishExamPack();
    }
  }

  function bindExamActions(){
    if (document.__wave89uExamBindingsBound) return;
    document.__wave89uExamBindingsBound = true;
    document.addEventListener('click', function(event){
      var el = findExamActionNode(event.target);
      if (!el) return;
      runExamAction(el, event);
    }, true);
  }

  window.wave89uExamBinding = {
    actionAttr: EXAM_ACTION_ATTR,
    packAttr: EXAM_PACK_ATTR,
    handle: runExamAction,
    isBound: function(){ return !!document.__wave89uExamBindingsBound; }
  };

  function updateQuizMeta(){
    if (!isDiagnosticPage()) return;
    ensureStyle();
    var holder = document.getElementById('wave30-quiz-meta');
    var qhdr = document.querySelector('#s-quiz .qhdr');
    if (qhdr && !holder) {
      holder = document.createElement('div');
      holder.id = 'wave30-quiz-meta';
      holder.className = 'wave30-quiz-meta';
      qhdr.parentNode.insertBefore(holder, qhdr.nextSibling);
    }
    if (!holder) return;
    var strip = document.getElementById('adapt-strip');
    var pack = getActivePack();
    if (!pack || typeof questions === 'undefined' || !Array.isArray(questions) || !questions[qIndex]) {
      holder.innerHTML = '';
      if (strip) strip.style.display = '';
      return;
    }
    if (strip) strip.style.display = 'none';
    var q = questions[qIndex];
    var total = packQuestionCount(pack);
    var answered = answeredCount(pack);
    var flagged = flaggedCount(pack);
    var taskButtons = '';
    for (var i = 0; i < total; i++) taskButtons += buildTaskButton(i, qIndex);
    var pill = document.getElementById('grade-pill');
    if (pill) pill.textContent = 'Задание ' + q.taskNo;
    var topic = document.getElementById('q-topic');
    if (topic) topic.textContent = q.section + ' · ' + q.topic;
    var timerHint = document.getElementById('wave25-timer-pill');
    if (timerHint && window.__wave25DiagSession && window.__wave25DiagSession.timeLimit) {
      timerHint.textContent = currentRemainingText();
    }
    holder.innerHTML = '' +
      '<span class="wave30-quiz-chip"><b>' + esc(pack.exam) + '</b> ' + esc(pack.label.replace(pack.exam + ' · ', '').replace('ЕГЭ база · ', '').replace('ЕГЭ профиль · ', '')) + '</span>' +
      '<span class="wave30-quiz-chip"><b>Задание</b> ' + esc(String(q.taskNo)) + '/' + esc(String(pack.maxQ)) + '</span>' +
      '<span class="wave30-quiz-chip"><b>' + esc(q.section) + '</b> · ' + esc(String(q.points)) + ' б.</span>' +
      '<div class="wave30-quiz-toolbar">' +
        '<button class="wave30-quiz-action' + (isFlagged(qIndex) ? ' flagged' : '') + '" type="button" ' + EXAM_ACTION_ATTR + '="toggle-flag">' + (isFlagged(qIndex) ? '🚩 Вернусь к этому' : '📌 Отметить «вернусь»') + '</button>' +
        '<button class="wave30-quiz-action" type="button" ' + EXAM_ACTION_ATTR + '="review-pack">📋 Финальная проверка</button>' +
        '<span class="wave30-quiz-counter">Отвечено ' + answered + '/' + total + (flagged ? (' · отмечено ' + flagged) : '') + (currentRemainingText() ? (' · осталось ' + esc(currentRemainingText())) : '') + '</span>' +
      '</div>' +
      '<div class="wave30-task-grid">' + taskButtons + '</div>' +
      '<div class="wave30-quiz-note">В экзаменном режиме можно переходить между заданиями. Проверка ответов — в конце.</div>';
    syncExamQuestionUi();
  }

  function calcExamResult(pack){
    if (!pack || typeof questions === 'undefined' || !Array.isArray(questions)) return null;
    var byQi = {};
    (answers || []).forEach(function(ans){ if (ans && typeof ans.qi !== 'undefined') byQi[ans.qi] = ans; });
    var sections = {};
    var raw = 0, max = 0;
    questions.forEach(function(q, idx){
      var pts = toNum(q.points || 1);
      var label = q.section || 'Раздел';
      if (!sections[label]) sections[label] = { label: label, raw: 0, max: 0, tasks: 0, wrong: 0 };
      max += pts;
      sections[label].max += pts;
      sections[label].tasks += 1;
      var hit = byQi[idx];
      if (hit && hit.correct) {
        raw += pts;
        sections[label].raw += pts;
      } else {
        sections[label].wrong += 1;
      }
    });
    var modelBand = resolveOgeScoreModel(pack, raw, sections);
    var band = modelBand || resolveBand(pack, raw);
    var score100 = null;
    if (modelBand && modelBand.score100 != null) score100 = toNum(modelBand.score100);
    else if (pack.scoreKind === 'ege100') score100 = Math.round(raw / Math.max(1, max) * 100);
    var sectionList = Object.keys(sections).map(function(key){ return sections[key]; }).sort(function(a, b){ return a.raw / Math.max(1, a.max) - b.raw / Math.max(1, b.max); });
    return {
      packId: pack.id,
      packLabel: pack.label,
      exam: pack.exam,
      subjectId: pack.subjectId,
      structuredFamilyId: pack.structuredFamilyId || '',
      structuredVariant: toNum(pack.structuredVariant || 0),
      structuredSchema: pack.structuredSchema || '',
      rawPoints: raw,
      maxPoints: max,
      pct: pct(raw, max),
      score100: score100,
      bandLabel: band.label,
      bandNote: band.note,
      sections: sectionList,
      weakSections: sectionList.filter(function(row){ return row.raw / Math.max(1, row.max) < 0.6; }).map(function(row){ return row.label; })
    };
  }

  function ensureExamResultBlock(){
    var anchor = document.getElementById('rec-block') || document.getElementById('strong-block') || document.getElementById('gaps-block');
    if (!anchor || !anchor.parentNode) return null;
    var block = document.getElementById('wave30-exam-block');
    if (!block) {
      block = document.createElement('div');
      block.id = 'wave30-exam-block';
      block.className = 'ins-block';
      block.innerHTML = '<h3>🧪 Экзаменный разбор</h3><div id="wave30-exam-body"></div>';
      anchor.parentNode.insertBefore(block, anchor);
    }
    return document.getElementById('wave30-exam-body');
  }

  function patchLastDiagHistory(result){
    try {
      var rows = safeJSON('trainer_diag_history_v2', []);
      if (!Array.isArray(rows) || !rows.length) return;
      rows[0].examPackId = result.packId;
      rows[0].examPackLabel = result.packLabel;
      rows[0].rawPoints = result.rawPoints;
      rows[0].maxPoints = result.maxPoints;
      rows[0].examBand = result.bandLabel;
      rows[0].score100 = result.score100;
      saveJSON('trainer_diag_history_v2', rows);
    } catch(_) {}
  }

  function renderExamResult(result){
    var root = ensureExamResultBlock();
    if (!root || !result) return;
    root.innerHTML = '' +
      '<div class="wave30-exam-grid">' +
        '<div class="wave30-exam-stat"><b>' + esc(String(result.rawPoints) + '/' + String(result.maxPoints)) + '</b><span>сырые баллы</span></div>' +
        '<div class="wave30-exam-stat"><b>' + esc(result.bandLabel) + '</b><span>ориентир</span></div>' +
        '<div class="wave30-exam-stat"><b>' + (result.score100 == null ? esc(String(result.pct) + '%') : esc(String(result.score100))) + '</b><span>' + (result.score100 == null ? 'точность варианта' : 'модельные баллы / 100') + '</span></div>' +
      '</div>' +
      '<div class="wave30-sec-list">' + result.sections.map(function(row){
        var rowPct = pct(row.raw, row.max);
        return '<div class="wave30-sec-row">' +
          '<div><div class="wave30-sec-name">' + esc(row.label) + '</div><div class="wave30-sec-meta">' + row.tasks + ' заданий · слабых: ' + row.wrong + '</div></div>' +
          '<div class="wave30-sec-score" style="color:' + esc(colorForPct(rowPct)) + '">' + esc(String(row.raw) + '/' + String(row.max)) + '</div>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="wave30-sec-band"><b>Итог:</b> ' + esc(result.bandLabel) + '. ' + esc(result.bandNote || '') + (result.weakSections.length ? ('<br><b>Повторить:</b> ' + esc(result.weakSections.slice(0, 3).join(', ')) + '.') : '<br><b>Слабых разделов почти нет.</b>') + '</div>';
    var sub = document.getElementById('res-sub');
    if (sub) sub.textContent = (sub.textContent || '') + ' Экзаменный ориентир: ' + result.bandLabel + '.';
  }

  function examShareText(result){
    var lines = [];
    lines.push('🧪 ' + result.packLabel);
    lines.push('Сырые баллы: ' + result.rawPoints + '/' + result.maxPoints + ' (' + result.pct + '%)');
    if (result.score100 != null) lines.push('Модельные баллы: ' + result.score100 + ' / 100');
    lines.push('Ориентир: ' + result.bandLabel + ' — ' + result.bandNote);
    if (result.weakSections.length) lines.push('Повторить: ' + result.weakSections.slice(0, 3).join(', '));
    return lines.join('\n');
  }

  function saveExamResult(result){
    var session = window.__wave25DiagSession || {};
    var entry = {
      ts: Date.now(),
      date: new Date().toISOString(),
      packId: result.packId,
      packLabel: result.packLabel,
      exam: result.exam,
      subjectId: result.subjectId,
      structuredFamilyId: result.structuredFamilyId || '',
      structuredVariant: toNum(result.structuredVariant || 0),
      structuredSchema: result.structuredSchema || '',
      rawPoints: result.rawPoints,
      maxPoints: result.maxPoints,
      pct: result.pct,
      score100: result.score100,
      bandLabel: result.bandLabel,
      bandNote: result.bandNote,
      weakSections: result.weakSections.slice(0, 4),
      elapsedSec: session.startedAt ? Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)) : null,
      timeLimit: toNum(session.timeLimit),
      timedOut: !!session.timedOut
    };
    saveExamEntry(entry);
    window.__wave30LastExamResult = entry;
    patchLastDiagHistory(entry);
    try { window.dispatchEvent(new CustomEvent('wave30-exam-saved', { detail: entry })); } catch(_) {}
  }

  function updateHashAutoStart(){
    var id = readHashParam(EXAM_HASH_KEY);
    if (!id || !EXAM_PACKS[id]) return;
    setTimeout(function(){ if (!getActivePack()) startPack(id); }, 40);
  }

  function startPack(packId){
    if (!EXAM_PACKS[packId] || typeof window.startDiag !== 'function') return false;
    var match = matchStructuredPackId(packId);
    if (match && !isStructuredFamilyLoaded(match.familyId) && !STRUCTURED_FAMILY_LOAD_FAILED[match.familyId]) {
      if (window.__wave91ExamBankLoadingPack === packId) return true;
      window.__wave91ExamBankLoadingPack = packId;
      notifyStructuredBankLoading(packId);
      loadStructuredFamily(match.familyId, function(_family, ok, error){
        clearStructuredBankLoading(packId);
        window.__wave91ExamBankLoadingPack = '';
        if (!ok) {
          try { console.warn('Exam bank lazy load failed; using legacy fallback', match.familyId, error); } catch(_err) {}
          STRUCTURED_FAMILY_LOAD_FAILED[match.familyId] = true;
        }
        startPack(packId);
      });
      return true;
    }
    window.__wave30ExamPending = packId;
    window.__wave30LastExamResult = null;
    try { if (window.wave25Diag && typeof wave25Diag.setMode === 'function') wave25Diag.setMode('exam'); } catch(_) {}
    setHashParam(EXAM_HASH_KEY, packId);
    setDiagShellState('immersive');
    window.startDiag(EXAM_PACKS[packId].subjectId);
    return true;
  }

  function patchStart(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedStart || typeof window.startDiag !== 'function') return;
    var original = window.startDiag;
    window.startDiag = function(subjId){
      var pending = window.__wave30ExamPending;
      if (!pending || !EXAM_PACKS[pending]) {
        resetPackState();
        setHashParam(EXAM_HASH_KEY, '');
        return original.apply(this, arguments);
      }
      var packRuntime = buildPack(pending);
      window.__wave30ExamPending = null;
      if (!packRuntime) return original.apply(this, arguments);
      var out = original.apply(this, arguments);
      if (typeof questions !== 'undefined') questions = packRuntime.questions.slice();
      if (typeof qIndex !== 'undefined') qIndex = 0;
      if (typeof answers !== 'undefined' && Array.isArray(answers)) answers = [];
      if (typeof correctStreak !== 'undefined') correctStreak = 0;
      if (typeof wrongStreak !== 'undefined') wrongStreak = 0;
      window.__wave30ActivePack = packRuntime;
      window.__wave30ExamUiState = { packId: packRuntime.id, flags: {}, visited: {} };
      closeExamReview(true);
      if (window.__wave25DiagSession) {
        window.__wave25DiagSession.modeId = 'exam';
        window.__wave25DiagSession.maxQ = packRuntime.maxQ;
        window.__wave25DiagSession.timeLimit = packRuntime.timeLimit;
        window.__wave25DiagSession.allowSkip = false;
        window.__wave25DiagSession.wave30Exam = true;
        window.__wave25DiagSession.packId = packRuntime.id;
        window.__wave25DiagSession.packLabel = packRuntime.label;
        window.__wave25DiagSession.remaining = packRuntime.timeLimit;
      }
      var quizName = document.getElementById('quiz-subj-name');
      if (quizName) quizName.textContent = packRuntime.label;
      var quizSub = document.getElementById('quiz-subj-sub');
      if (quizSub) quizSub.textContent = packRuntime.summary + ' · ' + fmtTime(packRuntime.timeLimit);
      if (typeof window.renderQ === 'function') window.renderQ();
      updateQuizMeta();
      return out;
    };
    window.__wave30ExamPatchedStart = true;
  }

  function patchRender(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedRender || typeof window.renderQ !== 'function') return;
    var original = window.renderQ;
    window.renderQ = function(){
      var out = original.apply(this, arguments);
      updateQuizMeta();
      return out;
    };
    window.__wave30ExamPatchedRender = true;
  }

  function patchSelect(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedSelect || typeof window.selectOpt !== 'function') return;
    var original = window.selectOpt;
    window.selectOpt = function(btn, chosen, correct, hint){
      var pack = getActivePack();
      if (!pack) return original.apply(this, arguments);
      if (typeof questions === 'undefined' || !Array.isArray(questions) || !questions[qIndex]) return original.apply(this, arguments);
      var q = questions[qIndex];
      upsertExamAnswer({
        qi: qIndex,
        grade: q.g,
        topic: q.topic,
        correct: chosen === correct,
        chosen: chosen,
        chosenText: chosen,
        correctAnswer: correct,
        taskNo: q.taskNo,
        section: q.section || ''
      });
      var buttons = Array.prototype.slice.call(document.querySelectorAll('#opts .opt'));
      buttons.forEach(function(node){
        node.disabled = false;
        node.classList.remove('ok');
        node.classList.remove('no');
        node.classList.remove('dim');
        node.classList.remove('selected');
      });
      if (btn && btn.classList) btn.classList.add('selected');
      var hintBox = document.getElementById('hint-box');
      if (hintBox) {
        hintBox.textContent = '';
        hintBox.className = 'hint-box';
      }
      var nextBtn = document.getElementById('next-btn');
      if (nextBtn) {
        nextBtn.className = 'next-btn show';
        nextBtn.textContent = qIndex >= questions.length - 1 ? 'Финальная проверка →' : 'Следующее →';
      }
      var skipBtn = document.getElementById('skip-btn');
      if (skipBtn) {
        skipBtn.style.display = 'block';
        skipBtn.textContent = qIndex >= questions.length - 1 ? 'К финальной проверке →' : 'Дальше без ответа →';
      }
      updateQuizMeta();
      return;
    };
    window.__wave30ExamPatchedSelect = true;
  }

  function patchNext(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedNext || typeof window.nextQ !== 'function') return;
    var original = window.nextQ;
    window.nextQ = function(){
      var pack = getActivePack();
      if (!pack) return original.apply(this, arguments);
      var total = packQuestionCount(pack);
      if (!total) return original.apply(this, arguments);
      if (qIndex >= total - 1) return openExamReview();
      return goToExamTask(qIndex + 1);
    };
    window.__wave30ExamPatchedNext = true;
  }

  function patchSkip(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedSkip || typeof window.skipQ !== 'function') return;
    var original = window.skipQ;
    window.skipQ = function(){
      var pack = getActivePack();
      if (!pack) return original.apply(this, arguments);
      var total = packQuestionCount(pack);
      if (!total) return original.apply(this, arguments);
      if (qIndex >= total - 1) return openExamReview();
      var next = nextExamIndex(qIndex, true);
      if (next < 0 || next === qIndex) next = nextExamIndex(qIndex, false);
      if (next < 0 || next === qIndex) return openExamReview();
      return goToExamTask(next);
    };
    window.__wave30ExamPatchedSkip = true;
  }

  function patchShowResult(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedResult || typeof window.showResult !== 'function') return;
    var original = window.showResult;
    window.showResult = function(){
      var pack = getActivePack();
      if (pack) rebuildExamGradeStats();
      closeExamReview(true);
      var out = original.apply(this, arguments);
      if (pack) {
        var result = calcExamResult(pack);
        if (result) {
          renderExamResult(result);
          saveExamResult(result);
        }
      }
      return out;
    };
    window.__wave30ExamPatchedResult = true;
  }

  function patchShare(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedShare || typeof window.shareResult !== 'function') return;
    var original = window.shareResult;
    window.shareResult = function(){
      if (window.__wave30LastExamResult && window.__wave30LastExamResult.packId) {
        var text = examShareText(window.__wave30LastExamResult);
        if (navigator.share) return navigator.share({ title: window.__wave30LastExamResult.packLabel, text: text }).catch(function(){ return navigator.clipboard && navigator.clipboard.writeText(text); });
        return navigator.clipboard && navigator.clipboard.writeText(text);
      }
      return original.apply(this, arguments);
    };
    window.__wave30ExamPatchedShare = true;
  }

  function patchGo(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedGo || typeof window.go !== 'function') return;
    var original = window.go;
    window.go = function(id){
      if (id === 'select' || id === 'result') closeExamReview(true);
      if (id === 'select') {
        resetPackState();
        setHashParam(EXAM_HASH_KEY, '');
        var holder = document.getElementById('wave30-quiz-meta');
        if (holder) holder.innerHTML = '';
        var strip = document.getElementById('adapt-strip');
        if (strip) strip.style.display = '';
        setDiagShellState('browse');
      }
      return original.apply(this, arguments);
    };
    window.__wave30ExamPatchedGo = true;
  }

  function ensureDashboardRoot(){
    if (!isDashboardPage()) return null;
    ensureStyle();
    var anchor = document.getElementById('wave25-diag-root') || document.querySelector('.dash-actions');
    if (!anchor || !anchor.parentNode) return null;
    if (!document.getElementById('wave30-exam-title')) {
      var title = document.createElement('div');
      title.className = 'section';
      title.id = 'wave30-exam-title';
      title.textContent = 'ЭКЗАМЕНЫ';
      anchor.parentNode.insertBefore(title, anchor);
    }
    if (!document.getElementById('wave30-exam-dashboard')) {
      var root = document.createElement('div');
      root.id = 'wave30-exam-dashboard';
      anchor.parentNode.insertBefore(root, anchor);
    }
    return document.getElementById('wave30-exam-dashboard');
  }

  function renderDashboardExam(){ try { document.body && document.body.setAttribute('data-trainer-screen','browse'); } catch(_) {}
    if (!isDashboardPage()) return;
    var root = ensureDashboardRoot();
    if (!root) return;
    var history = loadHistory();
    if (!history.length) {
      root.innerHTML = '<div class="wave30-dash-card"><div class="wave30-dash-sub">Экзаменные попытки пока не запускались. Открой «Сквозную диагностику» и выбери любой ОГЭ/ЕГЭ вариант — здесь появится ориентир по сырым баллам и разделам.</div></div>';
      return;
    }
    var latest = lastByPack(history);
    var rows = Object.keys(latest).map(function(key){ return latest[key]; }).sort(function(a, b){ return toNum(b.ts) - toNum(a.ts); });
    var attempts = history.length;
    var passed = rows.filter(function(row){ return row.bandLabel !== '2' && row.bandLabel !== 'ниже порога'; }).length;
    var best = rows.slice().sort(function(a, b){ return toNum(b.score100 != null ? b.score100 : b.pct) - toNum(a.score100 != null ? a.score100 : a.pct); })[0];
    var weakest = rows.slice().sort(function(a, b){ return toNum(a.score100 != null ? a.score100 : a.pct) - toNum(b.score100 != null ? b.score100 : b.pct); })[0];
    root.innerHTML = '' +
      '<div class="wave30-dash-grid">' +
        '<div class="wave30-dash-card"><div class="wave30-dash-k">Попытки</div><div class="wave30-dash-v">' + attempts + '</div><div class="wave30-dash-sub">в exam-history</div></div>' +
        '<div class="wave30-dash-card"><div class="wave30-dash-k">Порог / зачёт</div><div class="wave30-dash-v">' + passed + '/' + rows.length + '</div><div class="wave30-dash-sub">по последним попыткам</div></div>' +
        '<div class="wave30-dash-card"><div class="wave30-dash-k">Лучший вариант</div><div class="wave30-dash-v">' + esc(best.bandLabel) + '</div><div class="wave30-dash-sub">' + esc(best.packLabel) + '</div></div>' +
      '</div>' +
      '<div class="wave30-dash-card" style="margin-bottom:8px"><div class="wave30-dash-sub"><b>Сильный вариант:</b> ' + esc(best.packLabel) + ' · ' + esc(String(best.rawPoints) + '/' + String(best.maxPoints)) + (best.score100 != null ? (' · ' + esc(String(best.score100)) + '/100') : '') + '<br><b>Зона роста:</b> ' + esc(weakest.packLabel) + ' · ' + esc(weakest.weakSections && weakest.weakSections.length ? weakest.weakSections.slice(0,2).join(', ') : weakest.bandLabel) + '</div></div>' +
      '<div class="wave30-dash-list">' + rows.slice(0, 6).map(function(row){
        var scoreText = row.score100 != null ? (row.score100 + '/100') : (row.rawPoints + '/' + row.maxPoints);
        return '<div class="wave30-dash-row">' +
          '<div><div class="wave30-dash-name">' + esc(row.packLabel) + '</div><div class="wave30-dash-meta">' + esc(fmtDate(row.ts)) + ' · ' + esc(row.bandLabel) + (row.weakSections && row.weakSections.length ? (' · повторить: ' + esc(row.weakSections.slice(0, 2).join(', '))) : '') + '<br><a class="wave30-dash-link" href="diagnostic.html#exam=' + encodeURIComponent(row.packId) + '">▶ Повторить вариант</a></div></div>' +
          '<div class="wave30-dash-score" style="color:' + esc(colorForPct(row.score100 != null ? row.score100 : row.pct)) + '">' + esc(scoreText) + '</div>' +
        '</div>';
      }).join('') + '</div>' + buildExamTrendBlock(history);

    try {
      if (window._dashboardState) {
        window._dashboardState.wave30Exam = {
          attempts: attempts,
          latestCount: rows.length,
          best: best,
          weakest: weakest,
          passed: passed
        };
      }
    } catch(_) {}
  }

  function patchDashboardReport(){
    if (!isDashboardPage() || window.__wave30ExamPatchedReport || typeof window.buildDashboardReport !== 'function') return;
    var original = window.buildDashboardReport;
    window.buildDashboardReport = function(state){
      var text = original(state);
      var history = loadHistory();
      if (!history.length) return text;
      var latest = lastByPack(history);
      var rows = Object.keys(latest).map(function(key){ return latest[key]; }).sort(function(a, b){ return toNum(b.ts) - toNum(a.ts); });
      if (!rows.length) return text;
      var best = rows.slice().sort(function(a, b){ return toNum(b.score100 != null ? b.score100 : b.pct) - toNum(a.score100 != null ? a.score100 : a.pct); })[0];
      text += '\n━━━━━━━━━━━━━━━\nЭкзамены:';
      text += '\nПоследний вариант: ' + rows[0].packLabel + ' · ' + rows[0].bandLabel + ' · ' + rows[0].rawPoints + '/' + rows[0].maxPoints;
      text += '\nЛучший вариант: ' + best.packLabel + ' · ' + (best.score100 != null ? (best.score100 + '/100') : (best.rawPoints + '/' + best.maxPoints));
      if (rows[0].weakSections && rows[0].weakSections.length) text += '\nПовторить: ' + rows[0].weakSections.slice(0, 3).join(', ');
      return text;
    };
    window.__wave30ExamPatchedReport = true;
  }

  function auditSnapshot(){
    var summaries = {};
    var structuredRows = 0;
    listStructuredFamilies().forEach(function(familyId){
      var family = null;
      try { family = compileStructuredFamily(familyId); } catch(_) { family = null; }
      if (family && family.row_count) structuredRows += toNum(family.row_count);
    });
    Object.keys(EXAM_PACKS).forEach(function(id){
      var built = null;
      try { built = buildPack(id); } catch(_) { built = null; }
      summaries[id] = built ? {
        label: built.label,
        exam: built.exam,
        questionCount: built.maxQ,
        bankCount: built.bankCount,
        maxPoints: built.maxPoints,
        timeLimit: built.timeLimit,
        scoreKind: built.scoreKind,
        generatedFromStructuredBank: !!built.generatedFromStructuredBank,
        generatedFromStructuredJson: !!built.generatedFromStructuredJson,
        structuredFamilyId: built.structuredFamilyId || '',
        structuredFamilySource: built.structuredFamilySource || ''
      } : {
        label: EXAM_PACKS[id].label,
        exam: EXAM_PACKS[id].exam,
        questionCount: 0,
        bankCount: 0,
        maxPoints: 0,
        timeLimit: EXAM_PACKS[id].timeLimit,
        scoreKind: EXAM_PACKS[id].scoreKind,
        generatedFromStructuredBank: false,
        generatedFromStructuredJson: false,
        structuredFamilyId: '',
        structuredFamilySource: ''
      };
    });
    return {
      version: VERSION,
      structuredSchema: STRUCTURED_SCHEMA_VERSION,
      packCount: Object.keys(EXAM_PACKS).length,
      historyKey: EXAM_HISTORY_KEY,
      features: {
        hasPackHub: !!document.getElementById('wave30-pack-host') || isDiagnosticPage(),
        hasHashAutoStart: true,
        hasStartPack: typeof startPack === 'function',
        hasQuizMeta: !!document.getElementById('wave30-quiz-meta') || isDiagnosticPage(),
        hasExamResultBlock: !!document.getElementById('wave30-exam-block') || isDiagnosticPage(),
        hasDashboardSection: !!document.getElementById('wave30-exam-dashboard') || isDashboardPage(),
        hasDashboardReportPatch: !!window.__wave30ExamPatchedReport || isDashboardPage(),
        hasStructuredBank: listStructuredFamilies().length > 0,
        hasWave89ExamBankAlias: typeof window.wave89ExamBank === 'object',
        hasStructuredJsonRuntime: !!(structuredRuntimePayload() && structuredRuntimePayload().families),
        structuredFamilyCount: listStructuredFamilies().length,
        structuredRowCount: structuredRows,
        swHasWave30Asset: false,
        swCacheV27: false
      },
      packs: summaries
    };
  }

  var diagBooted = false;
  var dashBooted = false;

  function initDiagnostic(){
    bindExamActions();
    renderPackHub();
    setTimeout(renderPackHub, 40);
    setDiagShellState('browse');
    if (diagBooted) return;
    diagBooted = true;
    patchStart();
    patchRender();
    patchSelect();
    patchNext();
    patchSkip();
    patchShowResult();
    patchShare();
    patchGo();
    updateHashAutoStart();
    window.addEventListener('hashchange', function(){ updateHashAutoStart(); });
  }

  function initDashboard(){
    ensureDashboardRoot();
    renderDashboardExam();
    if (dashBooted) return;
    dashBooted = true;
    patchDashboardReport();
    renderDashboardExam();
    window.addEventListener('dashboard-state-ready', function(){ renderDashboardExam(); });
    window.addEventListener('wave30-exam-saved', function(){ renderDashboardExam(); });
  }

  window.wave30Exam = {
    version: VERSION,
    historyKey: EXAM_HISTORY_KEY,
    structuredSchema: STRUCTURED_SCHEMA_VERSION,
    packIds: function(){ return Object.keys(EXAM_PACKS); },
    packs: EXAM_PACKS,
    buildPack: buildPack,
    buildLegacyPack: buildLegacyPack,
    buildStructuredKim: buildStructuredKim,
    startPack: startPack,
    calcExamResult: calcExamResult,
    getHistory: loadHistory,
    getActivePack: getActivePack,
    openReview: openExamReview,
    finishPack: finishExamPack,
    goToTask: goToExamTask,
    dashboardSummaryPresent: function(){ return !!document.getElementById('wave30-exam-dashboard'); },
    structured: {
      schema: STRUCTURED_SCHEMA_VERSION,
      listFamilies: listStructuredFamilies,
      matchPackId: matchStructuredPackId,
      getFamily: getStructuredFamily,
      getRows: getStructuredRows,
      getBlueprint: getStructuredBlueprint,
      loadFamily: loadStructuredFamily,
      buildKim: buildStructuredKim,
      exportSnapshot: exportStructuredBankSnapshot,
      buildKimForPack: function(packId){
        var match = matchStructuredPackId(packId);
        return match ? buildStructuredKim(match.familyId, match.variantNo) : null;
      }
    },
    auditSnapshot: auditSnapshot
  };

  window.wave89ExamBank = {
    version: 'wave90d',
    schema: STRUCTURED_SCHEMA_VERSION,
    listFamilies: listStructuredFamilies,
    matchPackId: matchStructuredPackId,
    getFamily: getStructuredFamily,
    getRows: getStructuredRows,
    getBlueprint: getStructuredBlueprint,
    loadFamily: loadStructuredFamily,
    buildKim: buildStructuredKim,
    buildKimForPack: function(packId){
      var match = matchStructuredPackId(packId);
      return match ? buildStructuredKim(match.familyId, match.variantNo) : null;
    },
    exportSnapshot: exportStructuredBankSnapshot
  };

  var initRetries = 0;
  function init(){
    ensureStyle();
    var didInit = false;
    if (isDiagnosticPage()) { initDiagnostic(); didInit = true; }
    if (isDashboardPage()) { initDashboard(); didInit = true; }
    if (!didInit && initRetries < 12) {
      initRetries += 1;
      setTimeout(init, 25 * initRetries);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
  window.addEventListener('load', init, { once:true });
  setTimeout(init, 0);
  setTimeout(init, 60);
})();

