;(() => {
  // wave87d: grade-specific split of the former monolithic wave86m gap-balance chunk.
  var VERSION = 'wave86m-gap-balance-wave87d-grade-' + String(window.GRADE_NUM || '');
  if (typeof window === 'undefined' || typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  if (window.wave86mGapBalance) return;
  var grade = String(window.GRADE_NUM || '');
  var DATA = {"9":{"subjects":[{"id":"lit","after":"geog","nm":"Литература","ic":"📚","cl":"#9333ea","bg":"#f3e8ff","tops":[{"id":"onegin9_wave86m","nm":"Роман в стихах","dot":"#2563eb","fm":"роман · строфа · герой · автор","summary":"Тема добавляет опору по жанру романа в стихах и авторской позиции.","ex":"В романе в стихах есть развёрнутый сюжет, система героев и лирические отступления автора.","facts":[["роман в стихах","крупное произведение с романным сюжетом, написанное стихами"],["онегинская строфа","особая строфа, которой написан роман «Евгений Онегин»"],["лирическое отступление","авторское рассуждение, прерывающее ход сюжета"],["типический герой","образ, выражающий черты своего времени и среды"],["авторская позиция","отношение автора к героям и событиям"]]},{"id":"psychprose9_wave86m","nm":"Психологизм в прозе","dot":"#7c3aed","fm":"внутренний мир · деталь · монолог · подтекст","summary":"Тема учит видеть способы раскрытия внутреннего мира героя.","ex":"Психологизм проявляется через внутренний монолог, деталь, поступок, речь и реакцию героя.","facts":[["психологизм","изображение внутреннего мира и переживаний героя"],["внутренний монолог","передача мыслей героя как его внутренней речи"],["подтекст","скрытый смысл, не названный прямо"],["портретная деталь","часть описания внешности, раскрывающая характер"],["мотивировка поступка","объяснение причин действия героя"]]}]},{"id":"obzh","after":"inf","nm":"ОБЖ","ic":"🛟","cl":"#dc2626","bg":"#fee2e2","tops":[{"id":"personal9_wave86m","nm":"Личная безопасность","dot":"#dc2626","fm":"риск · границы · доверие · цифровая безопасность","summary":"Тема объединяет безопасность в городе, школе, интернете и общении с незнакомыми людьми.","ex":"Личная безопасность — это умение заранее видеть риск, сохранять границы и обращаться за помощью.","facts":[["личная безопасность","система правил, снижающих риск вреда человеку"],["опасный контакт","общение, при котором есть давление, угроза или обман"],["цифровая безопасность","защита личных данных и аккаунтов в интернете"],["пароль","секретная комбинация для доступа к аккаунту или устройству"],["доверенный взрослый","взрослый, к которому можно обратиться за помощью в опасной ситуации"]]},{"id":"civildef9_wave86m","nm":"Гражданская оборона и ЧС","dot":"#ea580c","fm":"ГО · оповещение · эвакуация · средства защиты","summary":"Тема объясняет базовые элементы гражданской обороны и поведения при угрозах.","ex":"При сигнале оповещения нужно получить официальную информацию и выполнить инструкцию по эвакуации или укрытию.","facts":[["гражданская оборона","система мероприятий по защите населения при опасностях"],["средства индивидуальной защиты","предметы, защищающие органы дыхания, кожу или зрение"],["пункт сбора","место, куда люди приходят при организованной эвакуации"],["памятка безопасности","краткая инструкция с правилами поведения при угрозе"],["официальная информация","сообщение от служб и органов, которым нужно доверять при ЧС"]]},{"id":"firstaid9_wave86m","nm":"Первая помощь: алгоритмы","dot":"#16a34a","fm":"112 · безопасность · состояние · помощь","summary":"Тема закрепляет универсальный порядок действий при оказании первой помощи.","ex":"Нельзя рисковать собой: помощь начинается с оценки места, вызова 112 и передачи информации взрослым или специалистам.","facts":[["номер 112","единый номер вызова экстренных служб"],["оценка состояния","проверка сознания, дыхания и видимых повреждений"],["иммобилизация","обездвиживание повреждённой части тела до помощи врача"],["переохлаждение","опасное снижение температуры тела"],["солнечный удар","перегрев организма под действием солнца"]]}]}]}};
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
  var WAVE87A_LIT_SPECS = {"9":{"onegin9_wave86m":{"prefix":"Евгений Онегин.","guide":"Роман Пушкина соединяет сюжет, лирические размышления и картину дворянской жизни.","terms":[["роман в стихах","жанр соединяет романную широту и поэтическую форму","Так Пушкин определил произведение."],["онегинская строфа","строфа из 14 строк организует текст романа","Форма названа по произведению."],["Евгений Онегин","главный герой вынесен в заглавие","Он показывает тип светского человека."],["Татьяна Ларина","героиня пишет знаменитое письмо","Её искренность раскрыта в письме."],["Ленский","поэт погибает на дуэли с Онегиным","Дуэль становится трагической точкой."],["лишний человек","умный герой не находит настоящего дела","Таков тип Онегина."],["нравственная твёрдость","Татьяна в финале выбирает долг и достоинство","Она остаётся верна себе."],["лирические отступления","автор прямо размышляет с читателем","Они расширяют смысл романа."],["энциклопедия русской жизни","роман показывает быт, нравы и эпоху","Это известная оценка произведения."],["внутренняя цельность","Татьяна сохраняет нравственное ядро","Это отличает героиню."],["дуэль","личное чувство сталкивается с общественным мнением","Герои подчиняются условности."],["хандра","Онегин скучает и чувствует внутреннюю пустоту","Это признак разочарования."],["антитеза","Онегин и Ленский противопоставлены","Скепсис и романтизм контрастируют."],["исповедальность","письмо Татьяны звучит открыто и лично","Героиня говорит искренне."],["автор-повествователь","голос комментирует события и говорит с читателем","Он не только рассказывает сюжет."]]},"psychprose9_wave86m":{"prefix":"Психологическая проза.","guide":"Психологизм раскрывает мотивы, внутренний конфликт и скрытые переживания героя.","terms":[["психологизм","изображаются внутренние переживания героя","В центре душевная жизнь."],["внутренний монолог","читатель видит ход мыслей персонажа","Герой словно говорит с собой."],["психологическая деталь","жест или пауза раскрывает состояние","Деталь заменяет объяснение."],["мотивировка поступка","важно понять, почему герой действует","Причина важнее события."],["внутренний конфликт","борьба происходит в душе героя","Герой спорит с собой."],["динамика характера","герой меняется на протяжении текста","Характер развивается."],["позиция рассказчика","события показаны через определённую точку зрения","Рассказчик влияет на оценку."],["подтекст","главное чувство не произнесено прямо","Смысл скрыт за словами."],["психологический пейзаж","природа совпадает или контрастирует с состоянием героя","Пейзаж передаёт настроение."],["лейтмотив","деталь повторяется и усиливает смысл","Повтор связывает эпизоды."],["самопознание","герой ясно понимает правду о себе","Это итог внутреннего пути."],["противоречие характера","слова и поступки героя расходятся","Образ становится сложнее."],["воспоминание","прошлое влияет на настоящее героя","Память объясняет чувства."],["внутренняя характеристика","важны мысли и чувства, а не только внешность","Она делает портрет глубоким."],["проблема выбора","герой решает главный нравственный вопрос","Выбор соединяет психологию и смысл."]]}}};
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
  var WAVE87B_OBZH_SCENARIOS = {"9":{"personal9_wave86m":[["не отправлять данные и спросить взрослого","в сообщении просят фото документа для конкурса","Документы и персональные данные нельзя передавать без проверки."],["не садиться и проверить через родителей","незнакомец говорит, что его попросили подвезти тебя","Любую неожиданную просьбу проверяют напрямую."],["использовать длинный уникальный пароль","нужно защитить школьный аккаунт","Простой пароль легко угадать или подобрать."],["никому не передавать код из SMS","друг просит код подтверждения для игры","Код подтверждения равен ключу к аккаунту."],["сохранить доказательства и обратиться за помощью","создан фейковый профиль с обидными сообщениями","При травле нужны фиксация и взрослые."],["распознать фишинг","ссылка обещает подарок за логин и пароль","Фишинг выманивает доступ под видом выгоды."],["не публиковать геолокацию открыто","профиль показывает, где ты бываешь каждый день","Геоданные раскрывают маршруты и привычки."],["отказаться от опасного челленджа","компания предлагает риск ради видео","Лайки не важнее здоровья."],["обратиться к доверенному взрослому","ситуация вызывает страх или давление","Помощь должна быть реальной и безопасной."],["не ставить неизвестное приложение","публичный Wi‑Fi требует скачать странный файл","Неизвестное приложение может быть вредоносным."],["не раскрывать адрес и постоянный маршрут","заполняешь открытый профиль в соцсети","Эти данные могут использовать посторонние."],["остановить общение при давлении и тайне","собеседник требует срочно перейти по ссылке и молчать","Опасные контакты торопят и изолируют."],["передать найденную карту взрослому или сотруднику","нашлась чужая банковская карта","Чужие платёжные данные нельзя использовать."],["не отвечать агрессией и сохранить скриншоты","тебя провоцируют в переписке","Ответная грубость усиливает конфликт."],["защищать аккаунты, данные и поведение в сети","объясняешь смысл цифровой безопасности","Цифровая безопасность шире одного пароля."]],"civildef9_wave86m":[["идти к пункту сбора для учёта","класс эвакуируют из здания","Пункт сбора помогает понять, все ли в безопасности."],["доверять официальным службам и администрации","появились разные сообщения о ЧС","Надёжный источник важнее слухов."],["использовать средства защиты по указанию","при угрозе загрязнения выдали СИЗ","СИЗ уменьшают воздействие опасного фактора."],["читать памятку как краткую инструкцию","на стенде размещён порядок действий при угрозе","Памятка помогает быстро вспомнить правила."],["уточнить у ответственного взрослого","сообщения о ЧС противоречат друг другу","Противоречия решают через проверенный источник."],["не пользоваться лифтом при эвакуации","во время тревоги лифт ещё работает","Лифт может остановиться или заполниться дымом."],["не возвращаться за вещами","при учебной тревоге забыта куртка","Вещи не важнее учёта и безопасности."],["понимать гражданскую оборону как защиту населения","нужно назвать задачу ГО","ГО включает оповещение, укрытие, эвакуацию и обучение."],["сообщить точное место неисправного выхода","замечен заблокированный пожарный выход","Конкретика помогает устранить нарушение."],["не распространять непроверенные угрозы","в чате пишут о взрыве без источника","Паника мешает службам и людям."],["выполнять указания старшего группы","при эвакуации назначен ответственный","Организованность снижает риск потери людей."],["держать заряженный телефон или пауэрбанк","собирается тревожный набор","Связь помогает получить инструкции и сообщить о себе."],["выбрать укрытие по типу опасности","службы говорят укрыться","Укрытие снижает воздействие опасного фактора."],["договориться о связи и месте встречи заранее","семья готовит план на случай ЧС","План помогает, когда связь перегружена."],["знать пути эвакуации заранее","часто бываешь в большом здании","При дыме искать выход впервые трудно."]],"firstaid9_wave86m":[["вызвать экстренные службы по 112","произошла авария с пострадавшими","112 направляет нужную службу."],["проверить сознание, дыхание и видимые повреждения","нужно оценить состояние человека","Эти признаки показывают срочность помощи."],["не двигать повреждённую конечность","есть подозрение на перелом руки","Лишнее движение усиливает боль и повреждение."],["распознать риск переохлаждения","человек долго был на холоде и дрожит","Холод и дрожь требуют согревания и помощи."],["распознать перегрев или солнечный удар","после солнца слабость и головная боль","Жара и солнце указывают на перегрев."],["сообщать диспетчеру факты, а не догадки","нужно передать данные о происшествии","Ошибочные детали могут задержать помощь."],["не давать пить при нарушении сознания","пострадавший сонный и плохо отвечает","Можно вызвать поперхивание."],["не выходить на дорогу без безопасности","человек травмирован рядом с проезжей частью","Дорога опасна и для помогающего."],["назвать место, событие, состояние и кто звонит","при вызове помощи задают вопросы","Короткое точное сообщение ускоряет реагирование."],["не отрывать прилипшую к ожогу ткань","ткань прилипла к повреждённой коже","Резкое снятие усилит повреждение."],["сохранять самообладание","вокруг паника после травмы","Спокойствие помогает действовать по алгоритму."],["срочно вызвать помощь при сильном кровотечении","кровь быстро пропитывает повязку","Быстрая потеря крови опасна."],["обездвижить повреждённую часть тела","объясняешь термин иммобилизация","Иммобилизация уменьшает риск дополнительного вреда."],["сразу позвать взрослого и вызвать 112","у человека боль в груди и сильная слабость","Такие симптомы нельзя игнорировать."],["не класть трубку без команды диспетчера","разговор с 112 ещё продолжается","Диспетчер может дать важные инструкции."]]}};
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
