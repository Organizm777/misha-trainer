/* --- wave32_math.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave32Math) return;

  var VERSION = 'wave32';
  var gradeInfo = {
    hooked: false,
    grade: Number(window.GRADE_NUM || 0) || 0,
    subjectsHooked: [],
    addedTopicIds: [],
    totalMathTopics: 0
  };
  var diagnosticInfo = {
    hooked: false,
    addedRows: 0,
    totalRows: 0,
    grades: [],
    subjectTotals: { math:0, algebra:0, geometry:0, mathall:0 }
  };

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function uniqBy(list, keyFn){
    var seen = new Set();
    return (list || []).filter(function(item){
      var key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function makeQuestion(row, topic, subj){
    if (typeof mkQ === 'function') {
      return mkQ(
        row.q,
        row.a,
        Array.isArray(row.o) ? row.o.slice() : [row.a],
        row.h || '',
        topic.nm,
        row.color || subj.cl || '#2563eb',
        row.bg || subj.bg || '#dbeafe',
        row.code || null,
        !!row.isMath
      );
    }
    return {
      question: row.q,
      answer: row.a,
      options: Array.isArray(row.o) ? row.o.slice() : [row.a],
      hint: row.h || '',
      tag: topic.nm,
      color: row.color || subj.cl || '#2563eb',
      bg: row.bg || subj.bg || '#dbeafe',
      code: row.code || null,
      isMath: !!row.isMath
    };
  }
  function topicGen(rows, topic, subj){
    return function(){ return makeQuestion(pick(rows), topic, subj); };
  }
  function findSubject(ids){
    if (typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return null;
    var list = Array.isArray(ids) ? ids : [ids];
    for (var i = 0; i < list.length; i++) {
      var subj = SUBJ.find(function(s){ return s && s.id === list[i]; });
      if (subj) return subj;
    }
    return null;
  }
  function ensureTopic(subj, def){
    if (!subj || !def) return false;
    subj.tops = Array.isArray(subj.tops) ? subj.tops : [];
    if (subj.tops.some(function(t){ return t && t.id === def.id; })) return false;
    var topic = {
      id: def.id,
      nm: def.nm,
      gen: function(){ return { question:'', answer:'', options:[] }; },
      th: def.th,
      dot: def.dot || subj.cl || '#2563eb'
    };
    topic.gen = topicGen(def.rows, topic, subj);
    subj.tops.push(topic);
    if (gradeInfo.addedTopicIds.indexOf(def.id) === -1) gradeInfo.addedTopicIds.push(def.id);
    return true;
  }
  function normalizeDiagRows(rows){
    return uniqBy((rows || []).map(function(row){
      return {
        g: Number(row.g || 0) || 0,
        topic: row.topic || 'Математика',
        q: row.q,
        opts: Array.isArray(row.opts) ? row.opts.slice() : [row.a],
        a: row.a,
        hint: row.hint || 'Разбери правило и посчитай аккуратно.',
        src: row.src || VERSION
      };
    }).filter(function(row){ return row.g && row.q && row.a && Array.isArray(row.opts) && row.opts.length; }), function(row){
      return String(row.g) + '|' + String(row.topic) + '|' + String(row.q) + '|' + String(row.a);
    });
  }
  function mergeBank(subjectId, rows){
    if (typeof QBANK === 'undefined' || !QBANK) return 0;
    var base = Array.isArray(QBANK[subjectId]) ? QBANK[subjectId].slice() : [];
    var before = base.length;
    QBANK[subjectId] = normalizeDiagRows(base.concat(rows || []));
    return Math.max(0, QBANK[subjectId].length - before);
  }
  function recomputeMathAll(){
    if (typeof QBANK === 'undefined' || !QBANK) return;
    var rows = []
      .concat(Array.isArray(QBANK.math) ? QBANK.math : [])
      .concat(Array.isArray(QBANK.algebra) ? QBANK.algebra : [])
      .concat(Array.isArray(QBANK.geometry) ? QBANK.geometry : []);
    rows = normalizeDiagRows(rows).filter(function(row){ return (Number(row.g || 0) || 0) >= 3; });
    if (typeof sanitizePool === 'function') {
      try { rows = sanitizePool(rows); } catch(_) {}
    }
    QBANK.mathall = rows;
  }
  function allDefs(){
    var out = [];
    Object.keys(BANKS).forEach(function(key){
      (BANKS[key] || []).forEach(function(def){ out.push(def); });
    });
    return out;
  }
  function gradeDefs(grade){ return BANKS[grade] || []; }

  var BANKS = {
    5: [
      {
        subject: ['math'],
        diag: 'math',
        id: 'mix5',
        nm: 'Смешанные вычисления',
        dot: '#2563eb',
        th: '<h3>Смешанные вычисления</h3><div class="fm">1) Сначала действия в скобках<br>2) Потом умножение и деление<br>3) Затем сложение и вычитание</div><p>Проверяй порядок действий и не теряй единицы измерения.</p>',
        rows: [
          {q:'25 + 3 · 4 = ?', a:'37', o:['37','112','28','100'], h:'Сначала 3·4 = 12, потом 25 + 12.'},
          {q:'(18 − 6) · 2 = ?', a:'24', o:['24','12','30','18'], h:'Сначала скобки: 18 − 6 = 12.'},
          {q:'84 : 7 + 9 = ?', a:'21', o:['21','3','12','16'], h:'84 : 7 = 12, затем 12 + 9.'},
          {q:'1.5 + 0.7 = ?', a:'2.2', o:['2.2','1.12','2.12','1.8'], h:'Складывай по разрядам.'},
          {q:'3/5 от 20 = ?', a:'12', o:['12','15','8','10'], h:'20 : 5 = 4, затем 4 · 3.'},
          {q:'2 м 30 см = ... см', a:'230', o:['230','203','23','300'], h:'2 м = 200 см.'},
          {q:'40 · (5 − 3) = ?', a:'80', o:['80','160','37','42'], h:'Сначала скобки: 5 − 3 = 2.'},
          {q:'120 : 10 : 3 = ?', a:'4', o:['4','36','40','12'], h:'Слева направо: 120 : 10 = 12, потом 12 : 3.'}
        ]
      },
      {
        subject: ['math'],
        diag: 'math',
        id: 'text5',
        nm: 'Текстовые задачи',
        dot: '#16a34a',
        th: '<h3>Текстовые задачи</h3><div class="fm">Цена · количество = стоимость<br>Скорость · время = путь<br>Чтобы найти часть, дели и умножай по смыслу</div><p>Выписывай, что известно, и следи за единицами.</p>',
        rows: [
          {q:'Карандаш стоит 12 ₽. Сколько стоят 4 карандаша?', a:'48 ₽', o:['48 ₽','36 ₽','16 ₽','52 ₽'], h:'12 · 4 = 48.'},
          {q:'Автобус ехал 3 часа со скоростью 60 км/ч. Какой путь он прошёл?', a:'180 км', o:['180 км','20 км','63 км','200 км'], h:'Путь = скорость · время.'},
          {q:'Из 36 яблок 1/3 отдали. Сколько яблок отдали?', a:'12', o:['12','24','9','18'], h:'36 : 3 = 12.'},
          {q:'В коробке 5 рядов по 8 конфет. Сколько всего конфет?', a:'40', o:['40','13','45','48'], h:'5 · 8 = 40.'},
          {q:'Лента длиной 2 м 40 см разрезана на 3 одинаковые части. Длина одной части?', a:'80 см', o:['80 см','70 см','8 см','90 см'], h:'240 см : 3 = 80 см.'},
          {q:'Книгу читают по 15 страниц в день. За 4 дня прочитают ...', a:'60 страниц', o:['60 страниц','45 страниц','19 страниц','75 страниц'], h:'15 · 4 = 60.'},
          {q:'На складе было 90 кг крупы. Продали 25 кг. Сколько осталось?', a:'65 кг', o:['65 кг','75 кг','55 кг','115 кг'], h:'90 − 25 = 65.'},
          {q:'Один билет стоит 35 ₽. Сколько нужно заплатить за 3 билета?', a:'105 ₽', o:['105 ₽','95 ₽','115 ₽','70 ₽'], h:'35 · 3 = 105.'}
        ]
      }
    ],
    6: [
      {
        subject: ['math'],
        diag: 'math',
        id: 'eq6',
        nm: 'Уравнения и выражения',
        dot: '#7c3aed',
        th: '<h3>Уравнения и выражения</h3><div class="fm">Чтобы найти неизвестное слагаемое — вычитай<br>Неизвестный множитель — дели произведение на известный множитель<br>Следи за знаком перед скобками</div><p>После решения подставь ответ обратно для проверки.</p>',
        rows: [
          {q:'x + 17 = 45. x = ?', a:'28', o:['28','62','17','35'], h:'45 − 17 = 28.'},
          {q:'63 − x = 18. x = ?', a:'45', o:['45','81','35','18'], h:'63 − 18 = 45.'},
          {q:'7x = 56. x = ?', a:'8', o:['8','7','49','63'], h:'56 : 7 = 8.'},
          {q:'3(4 + 2) = ?', a:'18', o:['18','14','9','24'], h:'Сначала скобки: 4 + 2 = 6.'},
          {q:'2a + 5 при a = 7 равно ...', a:'19', o:['19','14','24','9'], h:'2 · 7 + 5 = 19.'},
          {q:'5(x − 1) при x = 6 равно ...', a:'25', o:['25','30','5','20'], h:'Сначала 6 − 1 = 5.'},
          {q:'24 : (3 · 2) = ?', a:'4', o:['4','16','6','8'], h:'В скобках 3 · 2 = 6.'},
          {q:'x/4 = 9. x = ?', a:'36', o:['36','13','5','45'], h:'9 · 4 = 36.'}
        ]
      },
      {
        subject: ['math'],
        diag: 'math',
        id: 'pct6',
        nm: 'Проценты и задачи',
        dot: '#ea580c',
        th: '<h3>Проценты и задачи</h3><div class="fm">1% = одна сотая часть<br>10% = десятая часть<br>25% = четверть, 50% = половина</div><p>Чтобы найти p% от числа, умножь число на p и раздели на 100.</p>',
        rows: [
          {q:'20% от 80 = ?', a:'16', o:['16','20','8','24'], h:'80 · 20 : 100 = 16.'},
          {q:'50% от 34 = ?', a:'17', o:['17','34','12','19'], h:'50% — это половина.'},
          {q:'25% от 200 = ?', a:'50', o:['50','25','75','100'], h:'25% — это четверть.'},
          {q:'Цена 300 ₽ выросла на 10%. Новая цена = ?', a:'330 ₽', o:['330 ₽','310 ₽','270 ₽','350 ₽'], h:'10% от 300 = 30.'},
          {q:'Из 40 учеников 30 написали работу. Это ... % класса.', a:'75%', o:['75%','70%','60%','80%'], h:'30/40 = 3/4 = 75%.'},
          {q:'После скидки 20% товар за 500 ₽ стоит ...', a:'400 ₽', o:['400 ₽','450 ₽','480 ₽','300 ₽'], h:'20% от 500 = 100.'},
          {q:'5% от 600 = ?', a:'30', o:['30','12','60','120'], h:'1% от 600 = 6, значит 5% = 30.'},
          {q:'Какой процент составляет 15 от 60?', a:'25%', o:['25%','15%','20%','40%'], h:'15/60 = 1/4 = 25%.'}
        ]
      }
    ],
    7: [
      {
        subject: ['alg'],
        diag: 'algebra',
        id: 'sys7',
        nm: 'Системы уравнений',
        dot: '#2563eb',
        th: '<h3>Системы уравнений</h3><div class="fm">Способ подстановки: вырази одну переменную и подставь<br>Способ сложения: сложи или вычти уравнения, чтобы убрать одну переменную</div><p>Пара (x; y) должна подходить к обоим уравнениям.</p>',
        rows: [
          {q:'Реши систему: x + y = 9, x = 4. Чему равно y?', a:'5', o:['5','13','4','9'], h:'Подставь x = 4 в первое уравнение.'},
          {q:'Реши систему: x − y = 3, y = 2. x = ?', a:'5', o:['5','1','6','3'], h:'x = 3 + 2.'},
          {q:'Если x + y = 10 и x = 7, то y = ?', a:'3', o:['3','17','7','10'], h:'10 − 7 = 3.'},
          {q:'Пара (2; 5) является решением уравнения x + y = 7?', a:'да', o:['да','нет','только если x = 5','только если y = 2'], h:'2 + 5 = 7.'},
          {q:'Реши систему: x + y = 11, x − y = 1. x = ?', a:'6', o:['6','5','10','1'], h:'Сложи уравнения: 2x = 12.'},
          {q:'Для системы x + y = 8, y = 3 значение x равно ...', a:'5', o:['5','11','3','8'], h:'8 − 3 = 5.'},
          {q:'Реши систему: y = 2x, x = 3. y = ?', a:'6', o:['6','5','9','2'], h:'Подставь x = 3 в y = 2x.'},
          {q:'Если x + y = 12 и y = 4, то x = ?', a:'8', o:['8','16','3','12'], h:'12 − 4 = 8.'}
        ]
      },
      {
        subject: ['geo'],
        diag: 'geometry',
        id: 'area7',
        nm: 'Площади фигур',
        dot: '#16a34a',
        th: '<h3>Площади фигур</h3><div class="fm">Прямоугольник: S = a·b<br>Треугольник: S = a·h / 2<br>Параллелограмм: S = a·h</div><p>Высота должна быть проведена к выбранному основанию.</p>',
        rows: [
          {q:'Площадь прямоугольника со сторонами 6 и 9 равна ...', a:'54', o:['54','30','15','108'], h:'6 · 9 = 54.'},
          {q:'Площадь треугольника: a = 10, h = 6. S = ?', a:'30', o:['30','60','16','20'], h:'10 · 6 : 2 = 30.'},
          {q:'Площадь параллелограмма: a = 8, h = 5. S = ?', a:'40', o:['40','20','13','64'], h:'8 · 5 = 40.'},
          {q:'Площадь квадрата со стороной 7 равна ...', a:'49', o:['49','28','14','56'], h:'7² = 49.'},
          {q:'Если площадь прямоугольника 36, а одна сторона 4, то другая сторона = ?', a:'9', o:['9','8','12','32'], h:'36 : 4 = 9.'},
          {q:'Площадь треугольника с основанием 12 и высотой 5 равна ...', a:'30', o:['30','60','17','24'], h:'12 · 5 : 2 = 30.'},
          {q:'Площадь ромба вычисляют по формуле ...', a:'S = a·h', o:['S = a·h','S = a + b','S = 2(a+b)','S = a² + b²'], h:'Как параллелограмма, если известны сторона и высота.'},
          {q:'Периметр квадрата со стороной 5 равен ...', a:'20', o:['20','25','10','15'], h:'4 · 5 = 20.'}
        ]
      }
    ],
    8: [
      {
        subject: ['alg'],
        diag: 'algebra',
        id: 'fsu8',
        nm: 'ФСУ и преобразования',
        dot: '#dc2626',
        th: '<h3>Формулы сокращённого умножения</h3><div class="fm">(a+b)² = a² + 2ab + b²<br>(a−b)² = a² − 2ab + b²<br>a² − b² = (a−b)(a+b)</div><p>Сначала распознавай шаблон, затем раскрывай скобки или выноси общий множитель.</p>',
        rows: [
          {q:'(x + 3)² = ...', a:'x² + 6x + 9', o:['x² + 6x + 9','x² + 9','x² + 3x + 9','x² − 6x + 9'], h:'По формуле квадрата суммы.'},
          {q:'(a − 5)² = ...', a:'a² − 10a + 25', o:['a² − 10a + 25','a² − 25','a² + 10a + 25','a² − 5a + 25'], h:'По формуле квадрата разности.'},
          {q:'x² − 16 = ...', a:'(x − 4)(x + 4)', o:['(x − 4)(x + 4)','(x − 8)(x + 2)','(x − 16)(x + 1)','(x − 4)²'], h:'Разность квадратов.'},
          {q:'2x + 2y = ...', a:'2(x + y)', o:['2(x + y)','(2x)(2y)','x + y + 2','2xy'], h:'Вынеси общий множитель 2.'},
          {q:'(m + n)(m − n) = ...', a:'m² − n²', o:['m² − n²','m² + n²','2mn','m² − 2mn + n²'], h:'Формула разности квадратов.'},
          {q:'(2x)² = ...', a:'4x²', o:['4x²','2x²','4x','x²'], h:'Возводится и коэффициент, и буква.'},
          {q:'x² + 10x + 25 = ...', a:'(x + 5)²', o:['(x + 5)²','(x − 5)²','(x + 25)²','x(x + 25)'], h:'Полный квадрат.'},
          {q:'3a − 6 = ...', a:'3(a − 2)', o:['3(a − 2)','6(a − 1)','3a(1 − 2)','a(3 − 6)'], h:'Вынеси 3 за скобки.'}
        ]
      },
      {
        subject: ['geo'],
        diag: 'geometry',
        id: 'circle8',
        nm: 'Окружность',
        dot: '#0d9488',
        th: '<h3>Окружность</h3><div class="fm">Диаметр = 2r<br>Длина окружности: C = 2πr<br>Площадь круга: S = πr²</div><p>Радиус — от центра до окружности, диаметр проходит через центр.</p>',
        rows: [
          {q:'Если радиус круга 5, то диаметр равен ...', a:'10', o:['10','5','15','25'], h:'Диаметр = 2r.'},
          {q:'Длина окружности при r = 3 и π ≈ 3.14 равна ...', a:'18.84', o:['18.84','9.42','28.26','6.28'], h:'C = 2πr.'},
          {q:'Площадь круга при r = 4 выражается как ...', a:'16π', o:['16π','8π','4π','32π'], h:'S = πr².'},
          {q:'Если диаметр равен 14, то радиус = ...', a:'7', o:['7','14','28','6'], h:'Радиус — половина диаметра.'},
          {q:'Хорда — это ...', a:'отрезок, соединяющий две точки окружности', o:['отрезок, соединяющий две точки окружности','луч из центра','касательная к окружности','любой радиус'], h:'Диаметр — частный случай хорды.'},
          {q:'Касательная к окружности имеет с радиусом угол ...', a:'90°', o:['90°','45°','60°','180°'], h:'Касательная перпендикулярна радиусу.'},
          {q:'Центральный угол 120°. Какая часть полного круга это составляет?', a:'1/3', o:['1/3','1/2','2/3','1/4'], h:'120° из 360°.'},
          {q:'Если C = 31.4, то при π ≈ 3.14 радиус равен ...', a:'5', o:['5','10','4','6'], h:'31.4 = 2 · 3.14 · r.'}
        ]
      }
    ],
    9: [
      {
        subject: ['alg'],
        diag: 'algebra',
        id: 'oge9',
        nm: 'ОГЭ: алгебра core',
        dot: '#2563eb',
        th: '<h3>ОГЭ: алгебра core</h3><div class="fm">Часто встречаются проценты, графики, вероятности, прогрессии, квадратные уравнения</div><p>Ищи быстрый ход решения и всегда делай прикидку ответа.</p>',
        rows: [
          {q:'После скидки 15% товар за 800 ₽ стоит ...', a:'680 ₽', o:['680 ₽','720 ₽','760 ₽','600 ₽'], h:'15% от 800 = 120.'},
          {q:'Для функции y = 2x + 3 значение при x = 4 равно ...', a:'11', o:['11','8','5','14'], h:'2 · 4 + 3 = 11.'},
          {q:'Корни уравнения x² − 5x + 6 = 0:', a:'2 и 3', o:['2 и 3','1 и 6','-2 и -3','3 и 6'], h:'Подбери по Виету.'},
          {q:'Арифметическая прогрессия: 7, 10, 13, ... Следующий член = ?', a:'16', o:['16','15','17','20'], h:'Разность равна 3.'},
          {q:'Вероятность вытащить красный шар из 2 красных и 3 синих равна ...', a:'2/5', o:['2/5','3/5','1/2','2/3'], h:'Благоприятных исходов 2 из 5.'},
          {q:'Если 3x = 27, то x = ...', a:'9', o:['9','8','24','30'], h:'27 : 3 = 9.'},
          {q:'График y = -x идёт через точку ...', a:'(2; -2)', o:['(2; -2)','(2; 2)','(-2; -1)','(0; 3)'], h:'Подставь x в формулу y = -x.'},
          {q:'Чему равно 0.25 от 40?', a:'10', o:['10','4','25','8'], h:'0.25 = 1/4.'}
        ]
      },
      {
        subject: ['geo'],
        diag: 'geometry',
        id: 'geooge9',
        nm: 'ОГЭ: геометрия core',
        dot: '#ea580c',
        th: '<h3>ОГЭ: геометрия core</h3><div class="fm">Сумма углов треугольника = 180°<br>Пифагор: c² = a² + b²<br>S треугольника = a·h/2</div><p>Делай рисунок даже для короткой задачи.</p>',
        rows: [
          {q:'В треугольнике два угла равны 50° и 60°. Третий угол = ?', a:'70°', o:['70°','80°','90°','60°'], h:'180° − 110° = 70°.'},
          {q:'Катеты прямоугольного треугольника 6 и 8. Гипотенуза = ?', a:'10', o:['10','12','14','9'], h:'6² + 8² = 36 + 64 = 100.'},
          {q:'Площадь прямоугольного треугольника с катетами 6 и 4 равна ...', a:'12', o:['12','24','10','20'], h:'6 · 4 : 2 = 12.'},
          {q:'Диаметр окружности 12. Радиус = ?', a:'6', o:['6','12','24','3'], h:'Половина диаметра.'},
          {q:'Сумма смежных углов равна ...', a:'180°', o:['180°','90°','360°','120°'], h:'Они образуют развёрнутый угол.'},
          {q:'Если стороны прямоугольника 5 и 9, его площадь = ?', a:'45', o:['45','14','28','81'], h:'5 · 9 = 45.'},
          {q:'В равнобедренном треугольнике углы при основании ...', a:'равны', o:['равны','в сумме 90°','всегда тупые','не связаны'], h:'Базовое свойство.'},
          {q:'Если хорда проходит через центр окружности, это ...', a:'диаметр', o:['диаметр','касательная','радиус','сектор'], h:'Диаметр — хорда через центр.'}
        ]
      }
    ],
    10: [
      {
        subject: ['alg'],
        diag: 'algebra',
        id: 'log10',
        nm: 'Логарифмы',
        dot: '#7c3aed',
        th: '<h3>Логарифмы</h3><div class="fm">logₐ b = c ⇔ aᶜ = b<br>logₐ(aⁿ) = n<br>logₐ 1 = 0<br>logₐ(ab) = logₐa + logₐb</div><p>Всегда мысленно переходи к степени: «во что нужно возвести основание?»</p>',
        rows: [
          {q:'log₂8 = ?', a:'3', o:['3','4','2','8'], h:'2³ = 8.'},
          {q:'log₁₀100 = ?', a:'2', o:['2','10','1','100'], h:'10² = 100.'},
          {q:'log₃1 = ?', a:'0', o:['0','1','3','-1'], h:'Любое основание в нулевой степени даёт 1.'},
          {q:'Если log₅x = 2, то x = ?', a:'25', o:['25','10','7','3'], h:'x = 5².'},
          {q:'log₂32 = ?', a:'5', o:['5','4','6','16'], h:'2⁵ = 32.'},
          {q:'log₄4 = ?', a:'1', o:['1','0','4','2'], h:'4¹ = 4.'},
          {q:'log₃9 = ?', a:'2', o:['2','3','1','6'], h:'3² = 9.'},
          {q:'log₂(2·8) = ?', a:'4', o:['4','3','5','16'], h:'2·8 = 16, а log₂16 = 4.'}
        ]
      },
      {
        subject: ['prob','alg'],
        diag: 'algebra',
        id: 'prob10',
        nm: 'Вероятность и комбинаторика',
        dot: '#16a34a',
        th: '<h3>Вероятность и комбинаторика</h3><div class="fm">P = число благоприятных исходов / число всех исходов<br>Перестановки, размещения и сочетания считают варианты</div><p>Сначала пойми, различается ли порядок и возможны ли повторы.</p>',
        rows: [
          {q:'Кубик бросили один раз. Вероятность выпадения чётного числа = ?', a:'1/2', o:['1/2','1/3','2/3','1/6'], h:'Чётные: 2, 4, 6 — 3 исхода из 6.'},
          {q:'Сколькими способами можно выбрать 1 книгу из 7?', a:'7', o:['7','6','8','14'], h:'Каждая книга — отдельный выбор.'},
          {q:'В урне 4 белых и 1 чёрный шар. Вероятность белого = ?', a:'4/5', o:['4/5','1/5','1/4','5/4'], h:'4 благоприятных из 5.'},
          {q:'Сколько двузначных чисел можно составить из цифр 1 и 2 без повторов?', a:'2', o:['2','4','1','6'], h:'12 и 21.'},
          {q:'Из 10 учеников случайно выбирают одного. Вероятность выбрать отличника, если их 3, равна ...', a:'3/10', o:['3/10','7/10','1/3','1/10'], h:'3 благоприятных исхода из 10.'},
          {q:'Сумма вероятностей всех несовместимых исходов полного набора равна ...', a:'1', o:['1','0','100','2'], h:'Это свойство полной группы событий.'},
          {q:'Сколькими способами можно поставить на первое место одного из 5 участников?', a:'5', o:['5','25','4','10'], h:'Выбор первого места — 5 вариантов.'},
          {q:'Вероятность невозможного события равна ...', a:'0', o:['0','1','1/2','-1'], h:'Невозможное событие не происходит.'}
        ]
      }
    ],
    11: [
      {
        subject: ['alg'],
        diag: 'algebra',
        id: 'deriv11',
        nm: 'Применение производной',
        dot: '#dc2626',
        th: '<h3>Применение производной</h3><div class="fm">(xⁿ)′ = nxⁿ⁻¹<br>(sin x)′ = cos x<br>(cos x)′ = -sin x<br>Если f′(x) > 0, функция возрастает</div><p>Производная помогает находить скорость изменения, экстремумы и касательные.</p>',
        rows: [
          {q:'Производная функции y = x² равна ...', a:'2x', o:['2x','x','x²','2'], h:'По формуле степени.'},
          {q:'Производная y = 5x³ равна ...', a:'15x²', o:['15x²','5x²','15x³','3x²'], h:'(ax³)′ = 3ax².'},
          {q:'Если f′(x) > 0 на промежутке, то функция на нём ...', a:'возрастает', o:['возрастает','убывает','постоянна','не определена'], h:'Знак производной определяет монотонность.'},
          {q:'Производная y = sin x равна ...', a:'cos x', o:['cos x','-cos x','sin x','-sin x'], h:'Базовая формула.'},
          {q:'Производная y = 7x равна ...', a:'7', o:['7','x','0','14x'], h:'Производная линейной функции ax — это a.'},
          {q:'Если y = x³, то y′(2) = ...', a:'12', o:['12','8','6','4'], h:'y′ = 3x², при x = 2 получаем 12.'},
          {q:'В точке экстремума гладкой функции производная часто равна ...', a:'0', o:['0','1','-1','не существует всегда'], h:'Это необходимый признак внутреннего экстремума.'},
          {q:'Если f′(x) < 0 на промежутке, то функция ...', a:'убывает', o:['убывает','возрастает','периодична','положительна'], h:'Отрицательная производная — убывание.'}
        ]
      },
      {
        subject: ['alg'],
        diag: 'algebra',
        id: 'integ11',
        nm: 'Интеграл и площадь',
        dot: '#0d9488',
        th: '<h3>Интеграл и площадь</h3><div class="fm">∫xⁿ dx = xⁿ⁺¹/(n+1) + C<br>∫k dx = kx + C<br>Площадь под графиком можно находить определённым интегралом</div><p>Первообразная — обратная операция к производной.</p>',
        rows: [
          {q:'∫x dx = ...', a:'x²/2 + C', o:['x²/2 + C','x + C','2x + C','x² + C'], h:'Повышаем степень на 1 и делим.'},
          {q:'∫5 dx = ...', a:'5x + C', o:['5x + C','5 + C','x⁵ + C','x + C'], h:'Интеграл константы.'},
          {q:'∫x² dx = ...', a:'x³/3 + C', o:['x³/3 + C','2x + C','x²/2 + C','x³ + C'], h:'Степень 2 переходит в 3, делим на 3.'},
          {q:'Площадь прямоугольника под графиком y = 4 на отрезке [0; 3] равна ...', a:'12', o:['12','7','4','3'], h:'Высота 4, ширина 3.'},
          {q:'∫1 dx = ...', a:'x + C', o:['x + C','1 + C','x² + C','C'], h:'Интеграл единицы.'},
          {q:'Если F′(x) = f(x), то F называют ...', a:'первообразной', o:['первообразной','касательной','асимптотой','обратной функцией'], h:'Определение первообразной.'},
          {q:'∫0 dx = ...', a:'C', o:['C','0','x','1'], h:'Производная константы равна нулю.'},
          {q:'Площадь под графиком y = 2 на отрезке длины 5 равна ...', a:'10', o:['10','7','5','25'], h:'2 · 5 = 10.'}
        ]
      },
      {
        subject: ['alg'],
        diag: 'algebra',
        id: 'ege11',
        nm: 'ЕГЭ профиль: algebra core',
        dot: '#2563eb',
        th: '<h3>ЕГЭ профиль: algebra core</h3><div class="fm">Нужно быстро узнавать стандартные шаблоны: логарифмы, показательные уравнения, производная, вероятность</div><p>Сначала сделай прикидку, потом выбирай самый короткий алгоритм.</p>',
        rows: [
          {q:'2ˣ = 16. x = ?', a:'4', o:['4','8','2','16'], h:'16 = 2⁴.'},
          {q:'log₃27 = ?', a:'3', o:['3','9','2','1'], h:'3³ = 27.'},
          {q:'Вероятность выбрать 1 красный шар из 5 красных и 5 синих равна ...', a:'1/2', o:['1/2','1/5','2/5','5/10²'], h:'5 из 10 — это 1/2.'},
          {q:'Производная y = eˣ равна ...', a:'eˣ', o:['eˣ','xeˣ','1','ln x'], h:'Экспонента сохраняется.'},
          {q:'Если y = 3x + 2, то y(5) = ...', a:'17', o:['17','15','13','7'], h:'3 · 5 + 2 = 17.'},
          {q:'sin²x + cos²x = ...', a:'1', o:['1','0','sin x','cos x'], h:'Основное тригонометрическое тождество.'},
          {q:'x² = 49. Положительный корень = ?', a:'7', o:['7','-7','14','49'], h:'Положительный корень из 49.'},
          {q:'Если арифметическая прогрессия начинается так: 4, 9, 14, ... то её разность равна ...', a:'5', o:['5','4','9','14'], h:'Каждый раз прибавляют 5.'}
        ]
      }
    ]
  };

  function buildDiagRowsBySubject(){
    var buckets = { math: [], algebra: [], geometry: [] };
    Object.keys(BANKS).forEach(function(key){
      var grade = Number(key);
      gradeDefs(grade).forEach(function(topic){
        var subjectId = topic.diag || 'math';
        topic.rows.forEach(function(row){
          buckets[subjectId].push({
            g: grade,
            topic: topic.nm,
            q: row.q,
            opts: Array.isArray(row.o) ? row.o.slice() : [row.a],
            a: row.a,
            hint: row.h || 'Разбери порядок действий или правило и реши задачу пошагово.',
            src: VERSION
          });
        });
      });
    });
    return buckets;
  }

  function patchGrade(){
    var grade = Number(window.GRADE_NUM || 0) || 0;
    var defs = gradeDefs(grade);
    if (!defs.length) return;
    gradeInfo.hooked = true;
    var touched = new Set();
    defs.forEach(function(def){
      var subj = findSubject(def.subject);
      if (!subj) return;
      touched.add(subj.id);
      ensureTopic(subj, def);
    });
    gradeInfo.subjectsHooked = Array.from(touched);
    gradeInfo.totalMathTopics = gradeInfo.subjectsHooked.reduce(function(sum, subjId){
      var subj = findSubject(subjId);
      return sum + (subj && Array.isArray(subj.tops) ? subj.tops.length : 0);
    }, 0);
  }

  function patchDiagnostic(){
    if (typeof QBANK === 'undefined') return;
    diagnosticInfo.hooked = true;
    var buckets = buildDiagRowsBySubject();
    diagnosticInfo.addedRows += mergeBank('math', buckets.math);
    diagnosticInfo.addedRows += mergeBank('algebra', buckets.algebra);
    diagnosticInfo.addedRows += mergeBank('geometry', buckets.geometry);
    recomputeMathAll();
    diagnosticInfo.subjectTotals.math = Array.isArray(QBANK.math) ? QBANK.math.length : 0;
    diagnosticInfo.subjectTotals.algebra = Array.isArray(QBANK.algebra) ? QBANK.algebra.length : 0;
    diagnosticInfo.subjectTotals.geometry = Array.isArray(QBANK.geometry) ? QBANK.geometry.length : 0;
    diagnosticInfo.subjectTotals.mathall = Array.isArray(QBANK.mathall) ? QBANK.mathall.length : 0;
    diagnosticInfo.totalRows = diagnosticInfo.subjectTotals.math + diagnosticInfo.subjectTotals.algebra + diagnosticInfo.subjectTotals.geometry;
    diagnosticInfo.grades = Array.from(new Set([].concat(
      (QBANK.math || []).map(function(row){ return Number(row.g || 0) || 0; }),
      (QBANK.algebra || []).map(function(row){ return Number(row.g || 0) || 0; }),
      (QBANK.geometry || []).map(function(row){ return Number(row.g || 0) || 0; })
    ).filter(Boolean))).sort(function(a,b){ return a-b; });
  }

  function init(){
    try { patchGrade(); } catch(_) {}
    try { patchDiagnostic(); } catch(_) {}
  }

  window.wave32Math = {
    version: VERSION,
    banks: BANKS,
    gradeInfo: gradeInfo,
    diagnosticInfo: diagnosticInfo,
    auditSnapshot: function(){
      return {
        version: VERSION,
        grade: gradeInfo.grade,
        gradeHooked: gradeInfo.hooked,
        subjectsHooked: gradeInfo.subjectsHooked.slice(),
        addedTopicIds: gradeInfo.addedTopicIds.slice(),
        totalMathTopics: gradeInfo.totalMathTopics,
        diagnosticHooked: diagnosticInfo.hooked,
        diagnosticAdded: diagnosticInfo.addedRows,
        diagnosticTotal: diagnosticInfo.totalRows,
        diagnosticGrades: diagnosticInfo.grades.slice(),
        diagnosticSubjectTotals: {
          math: diagnosticInfo.subjectTotals.math,
          algebra: diagnosticInfo.subjectTotals.algebra,
          geometry: diagnosticInfo.subjectTotals.geometry,
          mathall: diagnosticInfo.subjectTotals.mathall
        },
        bankGrades: Object.keys(BANKS).map(function(v){ return Number(v); }).sort(function(a,b){ return a-b; })
      };
    }
  };

  init();
  if (typeof document !== 'undefined' && document && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  }
  setTimeout(init, 0);
})();

;
