/* --- wave88a: daily question on index page --- */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave88aDailyQuestion) return;

  var root = window;
  var STORAGE_PREFIX = 'trainer_wave88a_daily_question_';
  var SECTION_ID = 'wave88a-daily-question';
  var POOL = [
    {
      id:'w88a_alg_001',
      grade:8,
      subject:'Алгебра',
      topic:'Степени',
      href:'grade8_v2.html',
      question:'Чему равно <strong>2⁵</strong>?',
      options:['32','16','25','64'],
      answer:'32',
      hint:'Степень показывает, сколько раз число умножают само на себя.',
      explanation:'2⁵ = 2·2·2·2·2 = 32.'
    },
    {
      id:'w88a_rus_002',
      grade:8,
      subject:'Русский язык',
      topic:'Части речи',
      href:'grade8_v2.html',
      question:'Как называется часть речи, которая обозначает признак предмета?',
      options:['прилагательное','существительное','глагол','местоимение'],
      answer:'прилагательное',
      hint:'Она отвечает на вопросы «какой? какая? какое?».',
      explanation:'Имя прилагательное обозначает признак предмета: высокий, яркая, тёплое.'
    },
    {
      id:'w88a_phy_003',
      grade:9,
      subject:'Физика',
      topic:'Скорость',
      href:'grade9_v2.html',
      question:'Тело прошло <strong>100 м</strong> за <strong>20 с</strong>. Чему равна скорость?',
      options:['5 м/с','2 м/с','20 м/с','120 м/с'],
      answer:'5 м/с',
      hint:'Используй формулу v = s / t.',
      explanation:'v = 100 / 20 = 5 м/с.'
    },
    {
      id:'w88a_chem_004',
      grade:9,
      subject:'Химия',
      topic:'Кислоты',
      href:'grade9_v2.html',
      question:'Какая из формул соответствует <strong>серной кислоте</strong>?',
      options:['H₂SO₄','HCl','NaOH','CO₂'],
      answer:'H₂SO₄',
      hint:'В названии есть корень «сера».',
      explanation:'Серная кислота имеет формулу H₂SO₄.'
    },
    {
      id:'w88a_inf_005',
      grade:10,
      subject:'Информатика',
      topic:'Системы счисления',
      href:'grade10_v2.html',
      question:'Какое двоичное число соответствует десятичному <strong>5</strong>?',
      options:['101','111','100','110'],
      answer:'101',
      hint:'5 = 4 + 1.',
      explanation:'В двоичной записи 5 = 1·2² + 0·2¹ + 1·2⁰, то есть 101₂.'
    },
    {
      id:'w88a_hist_006',
      grade:10,
      subject:'История',
      topic:'Реформы',
      href:'grade10_v2.html',
      question:'Кто отменил крепостное право в России в <strong>1861 году</strong>?',
      options:['Александр II','Николай I','Пётр I','Александр I'],
      answer:'Александр II',
      hint:'Его называют царём-освободителем.',
      explanation:'Отмена крепостного права связана с реформой Александра II в 1861 году.'
    },
    {
      id:'w88a_eng_007',
      grade:8,
      subject:'Английский язык',
      topic:'Лексика',
      href:'grade8_v2.html',
      question:'Как переводится слово <strong>environment</strong>?',
      options:['окружающая среда','правительство','соглашение','оборудование'],
      answer:'окружающая среда',
      hint:'Это слово часто встречается в темах про ecology.',
      explanation:'Environment — это окружающая среда.'
    },
    {
      id:'w88a_geo_008',
      grade:8,
      subject:'Геометрия',
      topic:'Углы',
      href:'grade8_v2.html',
      question:'Сумма смежных углов равна…',
      options:['180°','90°','270°','360°'],
      answer:'180°',
      hint:'Они образуют развернутый угол.',
      explanation:'Смежные углы вместе дают развернутый угол, то есть 180°.'
    },
    {
      id:'w88a_bio_009',
      grade:9,
      subject:'Биология',
      topic:'Клетка',
      href:'grade9_v2.html',
      question:'Какой органоид отвечает за клеточное дыхание?',
      options:['митохондрия','рибосома','хлоропласт','ядрышко'],
      answer:'митохондрия',
      hint:'Её часто называют энергетической станцией клетки.',
      explanation:'Митохондрии обеспечивают клеточное дыхание и синтез АТФ.'
    },
    {
      id:'w88a_prob_010',
      grade:10,
      subject:'Вероятность',
      topic:'Вероятность события',
      href:'grade10_v2.html',
      question:'У честной монеты вероятность орла при одном броске равна…',
      options:['1/2','1/3','1/4','2/3'],
      answer:'1/2',
      hint:'У монеты два равновозможных исхода.',
      explanation:'Из двух равновозможных исходов один благоприятный, значит P = 1/2.'
    },
    {
      id:'w88a_lit_011',
      grade:11,
      subject:'Литература',
      topic:'Теория литературы',
      href:'grade11_v2.html',
      question:'Как называется перенос признаков живого на неживой предмет?',
      options:['олицетворение','метонимия','гипербола','литота'],
      answer:'олицетворение',
      hint:'Предмет как будто «оживает».',
      explanation:'Олицетворение — это перенос признаков живого на неживой предмет или явление.'
    },
    {
      id:'w88a_alg_012',
      grade:11,
      subject:'Алгебра',
      topic:'Логарифмы',
      href:'grade11_v2.html',
      question:'Чему равен <strong>log₂8</strong>?',
      options:['3','2','4','8'],
      answer:'3',
      hint:'Нужно понять, в какую степень надо возвести 2, чтобы получить 8.',
      explanation:'2³ = 8, следовательно log₂8 = 3.'
    },
    {
      id:'w88a_soc_013',
      grade:9,
      subject:'Обществознание',
      topic:'Правовое государство',
      href:'grade9_v2.html',
      question:'Какой принцип обязателен для правового государства?',
      options:['верховенство закона','отсутствие суда','полная власть одного лица','запрет выборов'],
      answer:'верховенство закона',
      hint:'Закон стоит выше воли отдельных чиновников.',
      explanation:'В правовом государстве действует верховенство закона и гарантируются права человека.'
    },
    {
      id:'w88a_chem_014',
      grade:10,
      subject:'Химия',
      topic:'Количество вещества',
      href:'grade10_v2.html',
      question:'Сколько молей содержится в <strong>44 г CO₂</strong>?',
      options:['1 моль','2 моль','0,5 моль','44 моль'],
      answer:'1 моль',
      hint:'Молярная масса CO₂ равна 44 г/моль.',
      explanation:'n = m / M = 44 / 44 = 1 моль.'
    },
    {
      id:'w88a_eng_015',
      grade:11,
      subject:'Английский язык',
      topic:'Word formation',
      href:'grade11_v2.html',
      question:'Какое существительное образуется от <strong>conclude</strong>?',
      options:['conclusion','conclusive','concluding','concluder'],
      answer:'conclusion',
      hint:'Нужна именно noun-form, а не adjective.',
      explanation:'Существительное от conclude — conclusion.'
    },
    {
      id:'w88a_geo_016',
      grade:11,
      subject:'География',
      topic:'Демография',
      href:'grade11_v2.html',
      question:'Как называется перемещение населения с одной территории на другую?',
      options:['миграция','урбанизация','агломерация','депопуляция'],
      answer:'миграция',
      hint:'Это понятие описывает сам факт переселения.',
      explanation:'Миграция — это перемещение населения между территориями или государствами.'
    }
  ];

  function asText(value){ return String(value == null ? '' : value); }
  function storageKey(dateKey){ return STORAGE_PREFIX + dateKey; }
  function todayKey(){
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  function hash(text){
    var value = 0;
    var raw = asText(text);
    for (var i = 0; i < raw.length; i++) value = ((value << 5) - value + raw.charCodeAt(i)) | 0;
    return Math.abs(value);
  }
  function pickForDate(dateKey){
    return POOL[hash(dateKey) % POOL.length];
  }
  function loadState(dateKey){
    try {
      var raw = root.localStorage && root.localStorage.getItem(storageKey(dateKey));
      return raw ? JSON.parse(raw) : null;
    } catch (_err) {
      return null;
    }
  }
  function saveState(dateKey, state){
    try {
      if (root.localStorage) root.localStorage.setItem(storageKey(dateKey), JSON.stringify(state));
    } catch (_err) {}
  }
  function formatDate(dateKey){
    try {
      var parts = asText(dateKey).split('-').map(function(item){ return Number(item); });
      var date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
      return new Intl.DateTimeFormat('ru-RU', { day:'numeric', month:'long' }).format(date);
    } catch (_err) {
      return dateKey;
    }
  }
  function make(tag, className, text){
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = asText(text);
    return node;
  }
  function clear(node){
    if (!node) return;
    node.innerHTML = '';
  }
  function findAnchor(){
    return document.querySelector('.section-label') || document.querySelector('.grid') || document.querySelector('.header') || null;
  }
  function buttonLabel(idx){ return ['A', 'B', 'C', 'D'][idx] || String(idx + 1); }
  function stateMessage(question, state){
    if (!state) return '';
    if (state.correct) return 'Верно. ' + asText(question.explanation || question.hint || '');
    return 'Пока мимо. Верный ответ — «' + asText(question.answer) + '». ' + asText(question.explanation || question.hint || '');
  }
  function render(){
    var anchor = findAnchor();
    if (!anchor || !anchor.parentNode) return false;
    var dateKey = todayKey();
    var question = pickForDate(dateKey);
    if (!question) return false;
    var state = loadState(dateKey);

    var existing = document.getElementById(SECTION_ID);
    var section = existing || make('section', 'w88a-daily');
    section.id = SECTION_ID;
    clear(section);

    var head = make('div', 'w88a-daily__head');
    head.appendChild(make('div', 'w88a-daily__badge', 'Задание дня'));
    head.appendChild(make('div', 'w88a-daily__meta', formatDate(dateKey) + ' · ' + question.grade + ' класс · ' + question.subject));
    section.appendChild(head);

    section.appendChild(make('h2', 'w88a-daily__title', 'Один вопрос перед тренировкой'));

    var q = make('div', 'w88a-daily__question');
    q.innerHTML = '<strong>' + asText(question.subject) + '.</strong> ' + question.question;
    section.appendChild(q);

    var grid = make('div', 'w88a-daily__grid');
    question.options.forEach(function(option, idx){
      var btn = make('button', 'w88a-daily__opt');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Ответ ' + buttonLabel(idx) + ': ' + asText(option));
      btn.setAttribute('aria-keyshortcuts', buttonLabel(idx));
      if (state) {
        btn.disabled = true;
        if (asText(option) === asText(question.answer)) btn.className += ' is-correct';
        if (!state.correct && asText(option) === asText(state.answer) && asText(option) !== asText(question.answer)) btn.className += ' is-wrong';
        if (asText(option) === asText(state.answer)) btn.className += ' is-selected';
      }
      var key = make('span', 'w88a-daily__key', buttonLabel(idx));
      var label = make('span', 'w88a-daily__label', option);
      btn.appendChild(key);
      btn.appendChild(label);
      if (!state) {
        btn.addEventListener('click', function(){
          var nextState = {
            id: question.id,
            answer: asText(option),
            correct: asText(option) === asText(question.answer),
            ts: new Date().toISOString()
          };
          saveState(dateKey, nextState);
          render();
        });
      }
      grid.appendChild(btn);
    });
    section.appendChild(grid);

    var status = make('div', 'w88a-daily__status');
    if (!state) {
      status.innerHTML = '<strong>Подсказка:</strong> ' + asText(question.hint || 'Выбери один ответ и сразу получи разбор.') + ' Ответ сохраняется до конца дня.';
    } else {
      status.className += state.correct ? ' ok' : ' no';
      status.innerHTML = '<strong>' + (state.correct ? '✓ Засчитано.' : '✗ Не засчитано.') + '</strong> ' + stateMessage(question, state);
    }
    section.appendChild(status);

    var actions = make('div', 'w88a-daily__actions');
    var link = make('a', 'w88a-daily__link', 'Открыть ' + question.grade + ' класс');
    link.href = question.href;
    actions.appendChild(link);
    if (state) {
      var repeat = make('button', 'w88a-daily__again', 'Показать заново');
      repeat.type = 'button';
      repeat.addEventListener('click', function(){ render(); });
      actions.appendChild(repeat);
    }
    section.appendChild(actions);

    section.appendChild(make('div', 'w88a-daily__note', 'Новый вопрос появляется каждый календарный день на главной странице и не требует входа в тренажёр.'));

    if (!existing) anchor.parentNode.insertBefore(section, anchor);

    root.__wave88aDailyQuestion = {
      version:'wave88a',
      poolSize: POOL.length,
      dateKey: dateKey,
      currentId: question.id,
      answered: !!state,
      correct: !!(state && state.correct),
      pickForDate: pickForDate,
      render: render,
      storageKey: storageKey
    };
    return true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once:true });
  else render();

  if (!root.__wave88aDailyQuestion) {
    root.__wave88aDailyQuestion = {
      version:'wave88a',
      poolSize: POOL.length,
      dateKey: todayKey(),
      currentId: (pickForDate(todayKey()) || {}).id || '',
      answered: !!loadState(todayKey()),
      correct: !!(loadState(todayKey()) && loadState(todayKey()).correct),
      pickForDate: pickForDate,
      render: render,
      storageKey: storageKey
    };
  }
})();
