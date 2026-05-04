;(() => {
  // wave87d: grade-specific split of the former monolithic wave86m gap-balance chunk.
  var VERSION = 'wave86m-gap-balance-wave87d-grade-' + String(window.GRADE_NUM || '');
  if (typeof window === 'undefined' || typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  if (window.wave86mGapBalance) return;
  var grade = String(window.GRADE_NUM || '');
  var DATA = {"5":{"subjects":[{"id":"odnknr","after":"his","nm":"ОДНКНР","ic":"🏛️","cl":"#92400e","bg":"#fef3c7","tops":[{"id":"odnknr_culture5","nm":"Культура народов России","dot":"#92400e","fm":"народ · язык · обычай · культурное наследие","summary":"Тема знакомит с культурным многообразием России и уважением к традициям разных народов.","ex":"Культурное наследие сохраняется через язык, памятники, обычаи, праздники, музыку и семейную память.","facts":[["культурное наследие","ценности, памятники и традиции, полученные от прошлых поколений"],["многонациональная страна","государство, где живут представители многих народов"],["родной язык","язык, который человек усваивает с детства в семье и ближайшем окружении"],["народный праздник","праздник, связанный с традициями и исторической памятью народа"],["уважение к культуре","бережное отношение к традициям, языку и вере другого народа"]]},{"id":"odnknr_values5","nm":"Нравственные основы жизни","dot":"#16a34a","fm":"достоинство · честь · долг · справедливость","summary":"Тема помогает объяснять поступки людей через нравственные категории и правила совместной жизни.","ex":"Нравственная оценка поступка зависит от мотива, последствий и отношения к другим людям.","facts":[["достоинство","внутренняя ценность человека, требующая уважения"],["честь","верность нравственным принципам и честному поведению"],["долг","обязанность, которую человек признаёт важной и выполняет"],["справедливость","стремление оценивать поступки и распределять блага честно"],["ответственный выбор","решение, при котором человек учитывает последствия для себя и других"]]},{"id":"odnknr_religions5","nm":"Религии и традиции","dot":"#2563eb","fm":"вера · храм · священный текст · уважение","summary":"Тема даёт нейтральное представление о религиозных традициях и правилах уважительного общения.","ex":"В вопросах этой темы важно не сравнивать веры как «лучше/хуже», а узнавать их культурные признаки и нормы уважения.","facts":[["религия","система верований, ценностей и обрядов, связанных с представлением о священном"],["храм","место, где верующие собираются для молитвы и обрядов"],["священный текст","текст, который имеет особое значение для верующих"],["обряд","установленное действие, имеющее религиозный или культурный смысл"],["межкультурный диалог","уважительное общение людей разных культур и традиций"]]}]},{"id":"lit","after":"his","nm":"Литература","ic":"📚","cl":"#9333ea","bg":"#f3e8ff","tops":[{"id":"fable5_wave86m","nm":"Басня и мораль","dot":"#dc2626","fm":"басня · мораль · аллегория · сатира","summary":"Тема усиливает понимание басни как короткого поучительного произведения.","ex":"В басне герои часто животные, но их поступки показывают человеческие качества. Мораль формулирует главный вывод.","facts":[["басня","короткое поучительное произведение, часто с героями-животными"],["мораль","главный нравственный вывод басни"],["аллегория","иносказательное изображение идеи через образ"],["сатира","осмеяние человеческих недостатков"],["Крылов","русский баснописец, автор многих известных басен"]]},{"id":"landscape5_wave86m","nm":"Пейзаж и настроение","dot":"#0d9488","fm":"пейзаж · настроение · эпитет · сравнение","summary":"Тема учит видеть, как описание природы помогает понять настроение произведения.","ex":"Пейзаж в тексте не просто украшение: он может отражать чувства героя или создавать ожидание события.","facts":[["пейзаж","описание природы в литературном произведении"],["настроение текста","общее эмоциональное звучание произведения или отрывка"],["эпитет","образное определение, делающее описание выразительным"],["сравнение","сопоставление предметов через сходство"],["художественная деталь","небольшая подробность, важная для понимания образа"]]}]}]}};
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
  var WAVE87A_LIT_SPECS = {"5":{"fable5_wave86m":{"prefix":"Басня и мораль.","guide":"В басне сюжет нужен для нравственного вывода, а образы часто работают иносказательно.","terms":[["басня","короткое поучительное произведение с героями-животными","Жанр соединяет маленький сюжет и урок."],["мораль","прямой нравственный вывод басни","Мораль формулирует, какой поступок осуждён или одобрен."],["аллегория","животные или предметы изображают человеческие качества","Образ говорит о людях не напрямую."],["сатира","смех используется для обличения порока","Сатира осуждает недостаток, а не просто развлекает."],["Крылов","автор басен о Вороне, Лисице, Стрекозе и Муравье","И. А. Крылов — главный русский баснописец."],["лесть","Лисица добивается сыра похвалой, а не искренностью","Лесть выглядит как похвала, но служит выгоде."],["тщеславие","Ворона верит похвале и теряет сыр","Тщеславный герой зависим от чужого восхищения."],["трудолюбие","Муравей заранее готовится к зиме","Трудолюбие противопоставлено беспечности Стрекозы."],["беспечность","герой не думает о последствиях и будущем","Беспечность в басне ведёт к наказанию."],["диалог","характеры раскрываются через короткий разговор героев","Реплики быстро показывают хитрость или доверчивость."],["иносказание","главный смысл скрыт за простым сюжетом","Иносказание делает мораль наглядной."],["концовка-мораль","финальная строка собирает урок басни","Финал часто звучит как пословица."],["афористичность","мысль звучит кратко и запоминается","Афоризм легко перенести на жизненную ситуацию."],["невежественная критика","герой уверенно судит о том, чего не понимает","Басня осуждает самоуверенное незнание."],["человеческие пороки","за звериными масками видны слабости людей","Басня говорит о людях через условные фигуры."]]},"landscape5_wave86m":{"prefix":"Пейзаж и настроение.","guide":"Описание природы помогает создать образ места и передать состояние героя или автора.","terms":[["пейзаж","описание природы создаёт место действия","Пейзаж — не справка о погоде, а часть образа."],["настроение текста","тёмные краски и резкий ветер делают эпизод тревожным","Настроение складывается из деталей."],["эпитет","слова вроде «сонный лес» или «серебристый иней» украшают образ","Эпитет — образное определение."],["сравнение","облака описаны как корабли","Сравнение сближает предметы по сходству."],["художественная деталь","мокрая тропинка или одинокий фонарь помогают понять сцену","Маленькая деталь может нести большой смысл."],["психологический пейзаж","дождь усиливает грусть героя","Природа отражает внутреннее состояние."],["олицетворение","лес дремлет, река сердится, солнце улыбается","Неживому приписаны человеческие действия."],["звуковая деталь","шорох листьев или капель создаёт слышимый образ","Звук делает картину живой."],["картина природы","цвет, звук и движение складываются в целостный образ","Картина природы объединяет детали."],["образное значение","«золотая осень» означает яркую красоту времени года","Слово работает переносно."],["умиротворение","тихий вечер и мягкий свет создают покой","Такое настроение спокойно и светло."],["тревога","тёмное небо и быстрые облака предвещают напряжение","Пейзаж может готовить конфликт."],["подготовка эпизода","описание природы стоит перед важным событием","Пейзаж настраивает читателя."],["кольцевая деталь","природная подробность повторяется в начале и финале","Повтор связывает части текста."],["выразительность","художественное описание отличается от сухой погоды","Важен образ и чувство."]]}}};
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

  var WAVE87H_VALUES_VERSION = 'wave87h-values-live-banks';
  var WAVE87H_VALUES_SCENARIOS = {
    odnknr_culture5: [
      ['культурное наследие', 'в городе восстанавливают старинный храм, музей и народный архив, чтобы сохранить память о прошлом', 'Культурное наследие — это ценности и памятники, пришедшие от прошлых поколений.'],
      ['многонациональная страна', 'в одном государстве живут люди разных народов, говорящие на разных языках и сохраняющие свои традиции', 'Так называют страну, где вместе живут представители многих народов.'],
      ['родной язык', 'ребёнок с детства общается дома на том языке, который первым услышал в семье', 'Родной язык усваивается в ближайшем окружении раньше других.'],
      ['народный праздник', 'в селе ежегодно проводят праздник с песнями, играми и костюмами, связанными с памятью предков', 'Народный праздник связан с традицией и исторической памятью народа.'],
      ['уважение к культуре', 'школьники знакомятся с обычаями соседнего народа без насмешек и стараются правильно произносить его имена', 'Уважение к культуре проявляется в бережном отношении к языку, обычаям и вере другого народа.'],
      ['культурное наследие', 'в семье хранят старые письма, фотографии и песни, которые помогают помнить историю рода', 'Наследием бывают не только здания, но и память, тексты, песни, обычаи.'],
      ['многонациональная страна', 'на карте показано государство, где рядом живут десятки народов со своими традициями', 'Признак здесь — сосуществование многих народов в одном государстве.'],
      ['родной язык', 'человек свободно говорит на языке, который первым услышал от родителей и близких', 'Это не просто изучаемый предмет, а язык раннего семейного общения.'],
      ['народный праздник', 'в программе праздника есть обрядовые песни, традиционные блюда и игры данного народа', 'Праздник связан именно с культурной традицией народа.'],
      ['уважение к культуре', 'в музее ученики не трогают священные предметы руками и слушают объяснение экскурсовода', 'Уважение к культуре требует бережного поведения и внимания к смыслу традиции.'],
      ['культурное наследие', 'реставраторы сохраняют фрески, рукописи и народные костюмы', 'Это работа по сохранению наследия прошлого.'],
      ['многонациональная страна', 'в учебнике говорится о едином государстве с множеством культур и языков', 'Ключевой признак — жизнь многих народов в одной стране.'],
      ['родной язык', 'на семейном празднике бабушка и внуки поют песню на языке, который звучит дома с раннего детства', 'Так описывается родной язык семьи.'],
      ['народный праздник', 'праздник урожая проводится по старому обычаю и объединяет жителей села', 'Народный праздник сохраняет традиции и память сообщества.'],
      ['уважение к культуре', 'человек не высмеивает чужой акцент и старается понять значение незнакомого обряда', 'Уважение к культуре исключает насмешку и требует внимательного отношения.']
    ],
    odnknr_values5: [
      ['достоинство', 'ученик не позволяет унижать одноклассника, потому что каждый человек заслуживает уважения', 'Достоинство связано с внутренней ценностью человека.'],
      ['честь', 'спортсмен отказывается от нечестной подсказки, даже если так было бы легче победить', 'Честь требует верности нравственным принципам и честному поведению.'],
      ['долг', 'старшая сестра обещала встретить младшего брата после кружка и не отказалась, хотя сама устала', 'Долг — это обязанность, которую человек признаёт важной и выполняет.'],
      ['справедливость', 'учитель оценивает работы по одинаковым критериям для всего класса', 'Справедливость требует честной оценки без любимчиков.'],
      ['ответственный выбор', 'подросток решает не публиковать чужое фото без разрешения, думая о последствиях для другого человека', 'Ответственный выбор учитывает последствия не только для себя, но и для других.'],
      ['достоинство', 'человека не оценивают по одежде или достатку, потому что ценность личности важнее внешних признаков', 'Так проявляется уважение к достоинству.'],
      ['честь', 'ученик признаёт свою ошибку на олимпиаде и не скрывает её ради медали', 'Честь несовместима с сознательным обманом.'],
      ['долг', 'волонтёр приходит в назначенное время, потому что на него рассчитывают люди', 'Долг связан с обязанностью и надёжностью.'],
      ['справедливость', 'в команде награду делят по общему результату, а не по личной симпатии', 'Справедливость означает честное отношение и равные основания.'],
      ['ответственный выбор', 'школьник заранее предупреждает команду, что не успевает выполнить часть проекта, и предлагает другой план', 'Ответственный выбор включает честность и учёт последствий.'],
      ['достоинство', 'человеку помогают защититься от насмешек, потому что унижение недопустимо', 'Достоинство требует уважения к личности.'],
      ['честь', 'капитан команды не приписывает себе чужую работу', 'Честь требует честного поведения и верности слову.'],
      ['долг', 'пожарный идёт на вызов, понимая важность своей обязанности', 'Когда человек признаёт обязанность и исполняет её, речь идёт о долге.'],
      ['справедливость', 'при выборе победителя учитывают одинаковые правила для всех участников', 'Общий критерий и честная оценка — признак справедливости.'],
      ['ответственный выбор', 'подросток отказывается от опасного развлечения, потому что понимает риск для друзей', 'Ответственный выбор соединяет свободу решения и понимание последствий.']
    ],
    odnknr_religions5: [
      ['религия', 'речь идёт о системе верований, ценностей и обрядов, через которые люди выражают отношение к священному', 'Религия объединяет верования, ценности и обряды.'],
      ['храм', 'люди собираются в особом месте для молитвы, богослужения и важных обрядов', 'Храм — место собрания верующих для молитвы и обряда.'],
      ['священный текст', 'в общине бережно читают книгу, которая имеет особое значение для верующих', 'Так называют текст, обладающий особой духовной значимостью.'],
      ['обряд', 'во время важного события совершают установленное действие с символическим смыслом', 'Обряд — это закреплённое действие с религиозным или культурным значением.'],
      ['межкультурный диалог', 'ученики разных традиций обсуждают праздники спокойно и стараются понять друг друга', 'Межкультурный диалог строится на уважительном общении людей разных культур.'],
      ['религия', 'в вопросе говорится не о науке или законе, а о вере, священном и связанных с этим нормах', 'Такой круг явлений относится к религии.'],
      ['храм', 'путешественники вошли в особое здание, где люди молятся и соблюдают правила поведения', 'Это описание храма как места молитвы и обряда.'],
      ['священный текст', 'книгу не просто читают как литературу, а почитают как источник важных духовных смыслов', 'Так описывается священный текст.'],
      ['обряд', 'действие повторяется по установленному правилу и важно для верующих', 'Если действие имеет закреплённый символический смысл, это обряд.'],
      ['межкультурный диалог', 'ребята не спорят, чья традиция лучше, а задают вопросы и слушают ответы', 'Это пример уважительного общения культур.'],
      ['религия', 'в центре темы — вера, нормы, праздники и отношения человека со священным', 'Так описывается религия как система взглядов и практик.'],
      ['храм', 'семья снимает головной убор и ведёт себя тихо в особом месте молитвы', 'Подсказка указывает именно на храм.'],
      ['священный текст', 'учитель объясняет, что эта книга значима для верующих не только как источник информации, но и как святыня', 'Так говорят о священном тексте.'],
      ['обряд', 'последовательность действий выполняют в определённом порядке и не меняют случайно', 'Установленный порядок действий — признак обряда.'],
      ['межкультурный диалог', 'в классе договариваются уважительно говорить о разных религиях и традициях', 'Межкультурный диалог помогает людям разных взглядов понимать друг друга.']
    ]
  };
  var WAVE87H_VALUES_STEMS = [
    'Ситуация: {scene}. Какое понятие лучше всего объясняет этот поступок, правило или культурный признак?',
    'Разбери пример: {scene}. Какое нравственное или культурное понятие здесь главное?',
    'Вопрос по теме: {scene}. Что точнее назвать ключевым понятием?',
    'Какой ответ лучше всего подходит к описанию: {scene}?',
    'Какое понятие помогает правильно понять ситуацию: {scene}?'
  ];
  function buildWave87hValuesOptions(rows, answer){
    var seen = Object.create(null);
    var out = [];
    function add(v){ v = clean(v); if (!v || seen[v]) return; seen[v] = true; out.push(v); }
    var correct = clean(answer);
    add(correct);
    shuffleLocal((rows || []).map(function(row){ return row[0]; })).forEach(add);
    ['достоинство','честь','долг','справедливость','ответственный выбор','культурное наследие','межкультурный диалог','религия','обряд','уважение к культуре'].forEach(add);
    var distractors = out.filter(function(v){ return v !== correct; });
    return shuffleLocal([correct].concat(shuffleLocal(distractors).slice(0, 3)));
  }
  function buildWave87hValuesBank(topicId){
    var rows = WAVE87H_VALUES_SCENARIOS[topicId];
    if (!Array.isArray(rows)) return null;
    return rows.map(function(row, index){
      var answer = clean(row[0]);
      var scene = clean(row[1]);
      var hint = clean(row[2]);
      var q = WAVE87H_VALUES_STEMS[index % WAVE87H_VALUES_STEMS.length].replace('{scene}', scene);
      return {
        q: q,
        a: answer,
        o: buildWave87hValuesOptions(rows, answer),
        h: hint,
        ex: hint + ' В этом примере ключевым понятием будет «' + answer + '», потому что оно точнее всего объясняет мотив, норму поведения или культурный признак.'
      };
    }).filter(function(item){ return item.q && item.a && item.o.length >= 4 && item.o.indexOf(item.a) !== -1 && item.ex; });
  }
  function makeWave87hValuesGen(topic, subject, bank){
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
    var valuesBank = subject && (subject.id === 'orkse' || subject.id === 'odnknr') ? buildWave87hValuesBank(topic.id) : null;
    var liveBank = (valuesBank && valuesBank.length) ? valuesBank : ((obzhBank && obzhBank.length) ? obzhBank : litBank);
    var hasLiveBank = !!(liveBank && liveBank.length);
    var liveGen = valuesBank && valuesBank.length ? makeWave87hValuesGen(topic, subject, valuesBank) : (obzhBank && obzhBank.length ? makeWave87bObzhGen(topic, subject, obzhBank) : (litBank && litBank.length ? makeWave87aLitGen(topic, subject, litBank) : null));
    var sources = [VERSION];
    if (litBank && litBank.length) sources.push(WAVE87A_LIT_VERSION);
    if (obzhBank && obzhBank.length) sources.push(WAVE87B_OBZH_VERSION);
    if (valuesBank && valuesBank.length) sources.push(WAVE87H_VALUES_VERSION);
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
      _wave87bObzhLiveBankCount: obzhBank && obzhBank.length ? obzhBank.length : 0,
      _wave87hValuesLiveBank: !!(valuesBank && valuesBank.length),
      _wave87hValuesLiveBankCount: valuesBank && valuesBank.length ? valuesBank.length : 0
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

    window.wave87hValuesBanks = {
      version: WAVE87H_VALUES_VERSION,
      auditSnapshot: function(){
        var out = { version: WAVE87H_VALUES_VERSION, grade: grade, topics: {}, total: 0 };
        SUBJ.forEach(function(subject){
          if (!subject || (subject.id !== 'orkse' && subject.id !== 'odnknr') || !Array.isArray(subject.tops)) return;
          subject.tops.forEach(function(topic){
            if (topic && topic._wave87hValuesLiveBank) {
              out.topics[subject.id + ':' + topic.id] = topic._wave87hValuesLiveBankCount || 0;
              out.total += topic._wave87hValuesLiveBankCount || 0;
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
