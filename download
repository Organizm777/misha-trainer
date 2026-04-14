/* --- wave30_exam.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave30Exam) return;

  var VERSION = 'wave30';
  var EXAM_HISTORY_KEY = 'trainer_exam_history_v1';
  var EXAM_HASH_KEY = 'exam';
  var STYLE_ID = 'wave30-exam-style';
  var MAX_HISTORY = 80;

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
      hint: row.hint || 'Разбор — после результата.'
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
  function pickUnique(rows, used, count){
    var out = [];
    var shuffled = shuffle(rows);
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

  function buildPack(packId){
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
      var selected = pickUnique(sectionPool, used, toNum(section.count));
      if (selected.length < toNum(section.count)) {
        var needed = toNum(section.count) - selected.length;
        selected = selected.concat(pickUnique(fallbackPool(pack), used, needed));
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

  function getActivePack(){ return window.__wave30ActivePack || null; }
  function resetPackState(){
    window.__wave30ActivePack = null;
    window.__wave30LastExamResult = null;
    window.__wave30ExamPending = null;
  }

  function ensureStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      '.wave30-pack-host{margin:14px 0 18px}.wave30-pack-title{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:800;margin-bottom:10px}.wave30-pack-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.wave30-pack-card{background:var(--card);border:1.5px solid var(--border);border-radius:14px;padding:14px 14px 12px}.wave30-pack-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.wave30-pack-name{font-size:12px;font-weight:800;line-height:1.35}.wave30-pack-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:var(--bg);border:1px solid var(--border);font-size:10px;font-weight:700;color:var(--muted)}.wave30-pack-meta{font-size:10px;color:var(--muted);margin-top:8px;line-height:1.45}.wave30-pack-last{font-size:10px;color:var(--muted);margin-top:8px;line-height:1.4}.wave30-pack-btn{margin-top:10px;width:100%;padding:10px 12px;border:none;border-radius:10px;background:var(--ink,var(--text));color:var(--bg,#fff);font-size:12px;font-weight:700;cursor:pointer}' +
      '.wave30-quiz-meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.wave30-quiz-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:10px;font-weight:700;color:var(--muted)}.wave30-quiz-chip b{color:var(--text)}' +
      '.wave30-exam-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}.wave30-exam-stat{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:10px 8px;text-align:center}.wave30-exam-stat b{display:block;font-family:Unbounded,system-ui,sans-serif;font-size:16px}.wave30-exam-stat span{display:block;font-size:10px;color:var(--muted);margin-top:4px}.wave30-sec-list{display:flex;flex-direction:column;gap:8px}.wave30-sec-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px dashed var(--border)}.wave30-sec-row:first-child{border-top:none;padding-top:0}.wave30-sec-name{font-size:12px;font-weight:700}.wave30-sec-meta{font-size:10px;color:var(--muted);margin-top:3px}.wave30-sec-score{font-family:JetBrains Mono,monospace;font-size:13px;font-weight:800}.wave30-sec-band{margin-top:10px;font-size:12px;line-height:1.45;color:var(--text)}' +
      '.wave30-dash-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:8px}.wave30-dash-card{background:var(--card);border:1px solid var(--border);border-radius:var(--R,16px);padding:14px}.wave30-dash-k{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:700}.wave30-dash-v{font-family:Unbounded,system-ui,sans-serif;font-size:17px;font-weight:900;margin-top:6px}.wave30-dash-sub{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.4}.wave30-dash-list{display:flex;flex-direction:column;gap:8px}.wave30-dash-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--R,16px)}.wave30-dash-name{font-size:13px;font-weight:800}.wave30-dash-meta{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.45}.wave30-dash-score{font-family:JetBrains Mono,monospace;font-size:14px;font-weight:800}.wave30-dash-link{display:inline-flex;align-items:center;gap:6px;padding:7px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--border);font-size:10px;color:var(--muted);text-decoration:none;margin-top:8px}' +
      '@media (max-width:560px){.wave30-pack-grid,.wave30-exam-grid,.wave30-dash-grid{grid-template-columns:1fr}.wave30-pack-card,.wave30-dash-card,.wave30-dash-row{padding:12px}}';
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
    Object.keys(EXAM_PACKS).forEach(function(id){ groups[EXAM_PACKS[id].exam].push(EXAM_PACKS[id]); });
    host.innerHTML = ['ОГЭ', 'ЕГЭ'].map(function(group){
      return '<div style="margin-top:12px">' +
        '<div class="wave30-pack-title">' + group + ' · exam packs</div>' +
        '<div class="wave30-pack-grid">' + groups[group].map(function(pack){
          var latest = history[pack.id];
          return '<div class="wave30-pack-card" style="--ink:' + esc(pack.accent) + '">' +
            '<div class="wave30-pack-head"><div class="wave30-pack-name">' + esc(pack.label) + '</div><span class="wave30-pack-badge">' + esc(pack.grades) + '</span></div>' +
            '<div class="wave30-pack-meta">' + esc(pack.summary) + '<br>' + pack.maxQ + ' заданий · ' + fmtTime(pack.timeLimit) + '</div>' +
            '<div class="wave30-pack-last">' + (latest ? ('Последний: <b style="color:' + esc(colorForPct(latest.pct)) + '">' + esc(String(latest.rawPoints) + '/' + String(latest.maxPoints)) + '</b> · ' + esc(latest.bandLabel) + ' · ' + esc(fmtDate(latest.ts))) : 'Пока без попыток') + '</div>' +
            '<button class="wave30-pack-btn" style="background:' + esc(pack.accent) + '" onclick="wave30Exam.startPack(\'' + pack.id + '\')">▶ Старт pack</button>' +
          '</div>';
        }).join('') + '</div></div>';
    }).join('');
  }

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
    var pack = getActivePack();
    if (!pack || typeof questions === 'undefined' || !Array.isArray(questions) || !questions[qIndex]) {
      holder.innerHTML = '';
      return;
    }
    var q = questions[qIndex];
    var pill = document.getElementById('grade-pill');
    if (pill) pill.textContent = 'Задание ' + q.taskNo;
    var topic = document.getElementById('q-topic');
    if (topic) topic.textContent = q.section + ' · ' + q.topic;
    var timerHint = document.getElementById('wave25-timer-pill');
    if (timerHint && window.__wave25DiagSession && window.__wave25DiagSession.timeLimit) {
      timerHint.textContent = fmtTime(window.__wave25DiagSession.remaining || window.__wave25DiagSession.timeLimit);
    }
    holder.innerHTML = '' +
      '<span class="wave30-quiz-chip"><b>' + esc(pack.exam) + '</b> ' + esc(pack.label.replace(pack.exam + ' · ', '').replace('ЕГЭ база · ', '').replace('ЕГЭ профиль · ', '')) + '</span>' +
      '<span class="wave30-quiz-chip"><b>Task</b> ' + esc(String(q.taskNo)) + '/' + esc(String(pack.maxQ)) + '</span>' +
      '<span class="wave30-quiz-chip"><b>' + esc(q.section) + '</b> · ' + esc(String(q.points)) + ' б.</span>';
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
    var band = resolveBand(pack, raw);
    var score100 = pack.scoreKind === 'ege100' ? Math.round(raw / Math.max(1, max) * 100) : null;
    var sectionList = Object.keys(sections).map(function(key){ return sections[key]; }).sort(function(a, b){ return a.raw / Math.max(1, a.max) - b.raw / Math.max(1, b.max); });
    return {
      packId: pack.id,
      packLabel: pack.label,
      exam: pack.exam,
      subjectId: pack.subjectId,
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
        '<div class="wave30-exam-stat"><b>' + (result.score100 == null ? esc(String(result.pct) + '%') : esc(String(result.score100))) + '</b><span>' + (result.score100 == null ? 'точность pack-а' : 'model score / 100') + '</span></div>' +
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
    if (result.score100 != null) lines.push('Model score: ' + result.score100 + ' / 100');
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
    window.__wave30ExamPending = packId;
    window.__wave30LastExamResult = null;
    try { if (window.wave25Diag && typeof wave25Diag.setMode === 'function') wave25Diag.setMode('exam'); } catch(_) {}
    setHashParam(EXAM_HASH_KEY, packId);
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

  function patchShowResult(){
    if (!isDiagnosticPage() || window.__wave30ExamPatchedResult || typeof window.showResult !== 'function') return;
    var original = window.showResult;
    window.showResult = function(){
      var pack = getActivePack();
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
      if (id === 'select') {
        resetPackState();
        setHashParam(EXAM_HASH_KEY, '');
        var holder = document.getElementById('wave30-quiz-meta');
        if (holder) holder.innerHTML = '';
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
      title.textContent = 'Экзаменные pack-и';
      anchor.parentNode.insertBefore(title, anchor);
    }
    if (!document.getElementById('wave30-exam-dashboard')) {
      var root = document.createElement('div');
      root.id = 'wave30-exam-dashboard';
      anchor.parentNode.insertBefore(root, anchor);
    }
    return document.getElementById('wave30-exam-dashboard');
  }

  function renderDashboardExam(){
    if (!isDashboardPage()) return;
    var root = ensureDashboardRoot();
    if (!root) return;
    var history = loadHistory();
    if (!history.length) {
      root.innerHTML = '<div class="wave30-dash-card"><div class="wave30-dash-sub">Экзаменные попытки пока не запускались. Открой «Сквозную диагностику» и выбери любой ОГЭ/ЕГЭ pack — здесь появится exam-readiness по сырым баллам и разделам.</div></div>';
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
        '<div class="wave30-dash-card"><div class="wave30-dash-k">Порог / зачёт</div><div class="wave30-dash-v">' + passed + '/' + rows.length + '</div><div class="wave30-dash-sub">по последним попыткам pack-ов</div></div>' +
        '<div class="wave30-dash-card"><div class="wave30-dash-k">Лучший pack</div><div class="wave30-dash-v">' + esc(best.bandLabel) + '</div><div class="wave30-dash-sub">' + esc(best.packLabel) + '</div></div>' +
      '</div>' +
      '<div class="wave30-dash-card" style="margin-bottom:8px"><div class="wave30-dash-sub"><b>Сильный pack:</b> ' + esc(best.packLabel) + ' · ' + esc(String(best.rawPoints) + '/' + String(best.maxPoints)) + (best.score100 != null ? (' · ' + esc(String(best.score100)) + '/100') : '') + '<br><b>Зона роста:</b> ' + esc(weakest.packLabel) + ' · ' + esc(weakest.weakSections && weakest.weakSections.length ? weakest.weakSections.slice(0,2).join(', ') : weakest.bandLabel) + '</div></div>' +
      '<div class="wave30-dash-list">' + rows.slice(0, 6).map(function(row){
        var scoreText = row.score100 != null ? (row.score100 + '/100') : (row.rawPoints + '/' + row.maxPoints);
        return '<div class="wave30-dash-row">' +
          '<div><div class="wave30-dash-name">' + esc(row.packLabel) + '</div><div class="wave30-dash-meta">' + esc(fmtDate(row.ts)) + ' · ' + esc(row.bandLabel) + (row.weakSections && row.weakSections.length ? (' · повторить: ' + esc(row.weakSections.slice(0, 2).join(', '))) : '') + '<br><a class="wave30-dash-link" href="diagnostic.html#exam=' + encodeURIComponent(row.packId) + '">▶ Повторить pack</a></div></div>' +
          '<div class="wave30-dash-score" style="color:' + esc(colorForPct(row.score100 != null ? row.score100 : row.pct)) + '">' + esc(scoreText) + '</div>' +
        '</div>';
      }).join('') + '</div>';

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
      text += '\n━━━━━━━━━━━━━━━\nExam packs:';
      text += '\nПоследний pack: ' + rows[0].packLabel + ' · ' + rows[0].bandLabel + ' · ' + rows[0].rawPoints + '/' + rows[0].maxPoints;
      text += '\nЛучший pack: ' + best.packLabel + ' · ' + (best.score100 != null ? (best.score100 + '/100') : (best.rawPoints + '/' + best.maxPoints));
      if (rows[0].weakSections && rows[0].weakSections.length) text += '\nПовторить: ' + rows[0].weakSections.slice(0, 3).join(', ');
      return text;
    };
    window.__wave30ExamPatchedReport = true;
  }

  function auditSnapshot(){
    var summaries = {};
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
        scoreKind: built.scoreKind
      } : {
        label: EXAM_PACKS[id].label,
        exam: EXAM_PACKS[id].exam,
        questionCount: 0,
        bankCount: 0,
        maxPoints: 0,
        timeLimit: EXAM_PACKS[id].timeLimit,
        scoreKind: EXAM_PACKS[id].scoreKind
      };
    });
    return {
      version: VERSION,
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
        swHasWave30Asset: false,
        swCacheV27: false
      },
      packs: summaries
    };
  }

  var diagBooted = false;
  var dashBooted = false;

  function initDiagnostic(){
    renderPackHub();
    setTimeout(renderPackHub, 40);
    if (diagBooted) return;
    diagBooted = true;
    patchStart();
    patchRender();
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
    packIds: function(){ return Object.keys(EXAM_PACKS); },
    packs: EXAM_PACKS,
    buildPack: buildPack,
    startPack: startPack,
    getHistory: loadHistory,
    getActivePack: getActivePack,
    dashboardSummaryPresent: function(){ return !!document.getElementById('wave30-exam-dashboard'); },
    auditSnapshot: auditSnapshot
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

