;(() => {
  // wave87d: grade-specific split of the former monolithic wave86m gap-balance chunk.
  var VERSION = 'wave86m-gap-balance-wave87d-grade-' + String(window.GRADE_NUM || '');
  if (typeof window === 'undefined' || typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  if (window.wave86mGapBalance) return;
  var grade = String(window.GRADE_NUM || '');
  var DATA = {"4":{"subjects":[{"id":"orkse","after":"okr","nm":"ОРКСЭ","ic":"🤝","cl":"#7c3aed","bg":"#f3e8ff","tops":[{"id":"orkse_values4","nm":"Нравственные ценности","dot":"#7c3aed","fm":"добро · уважение · совесть · ответственность","summary":"Тема помогает различать базовые нравственные понятия и применять их в школьных ситуациях.","ex":"В вопросах ОРКСЭ ищи не только действие, но и ценность, которая за ним стоит: добро, уважение, честность или ответственность.","facts":[["добро","поступок или отношение, которое помогает человеку и не причиняет вреда"],["совесть","внутреннее чувство ответственности за свои поступки"],["уважение","признание достоинства другого человека и внимательное отношение к нему"],["ответственность","готовность отвечать за свои решения и их последствия"],["милосердие","готовность помогать тому, кто нуждается в поддержке"]]},{"id":"orkse_family4","nm":"Семья и традиции","dot":"#0d9488","fm":"семья · забота · традиция · праздник","summary":"Тема связывает семейные отношения с заботой, взаимопомощью и передачей традиций.","ex":"Семейная традиция сохраняется, когда её повторяют, объясняют детям и связывают с уважением к близким.","facts":[["семья","близкие люди, связанные родством, заботой и общей жизнью"],["традиция","обычай или правило, которое передаётся от поколения к поколению"],["забота","внимательное отношение к нуждам другого человека"],["взаимопомощь","ситуация, когда люди помогают друг другу"],["уважение к старшим","бережное и внимательное отношение к людям старшего поколения"]]},{"id":"orkse_culture4","nm":"Культура народов России","dot":"#ea580c","fm":"народ · культура · обычай · символ","summary":"Тема даёт базовое представление о многообразии культур и уважительном отношении к традициям народов России.","ex":"Культура народа проявляется в языке, праздниках, одежде, музыке, сказках и правилах поведения.","facts":[["культура","всё созданное людьми: традиции, язык, искусство, знания и правила жизни"],["обычай","привычный способ поступать в определённой ситуации"],["народ","исторически сложившаяся общность людей с культурой и традициями"],["символ","знак или образ, который выражает важную идею"],["толерантность","уважительное отношение к людям другой культуры или взглядов"]]}]}]}};
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
  var WAVE87A_LIT_SPECS = {};
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
    orkse_values4: [
      ['уважение', 'новый ученик волнуется у доски, а класс даёт ему спокойно договорить и не перебивает', 'Уважение видно в признании достоинства другого человека и внимании к его словам.'],
      ['ответственность', 'школьник забыл тетрадь, честно сказал об этом и сам придумал, как догнать задание к следующему уроку', 'Ответственность проявляется, когда человек признаёт последствия своего решения и исправляет ситуацию.'],
      ['совесть', 'после обидной шутки ребёнку стало неловко, и он первым подошёл извиниться', 'Совесть подсказывает, что поступок был неправильным и его нужно исправить.'],
      ['добро', 'девочка заметила, что одноклассник уронил учебники, и помогла всё собрать без просьбы', 'Добро связано с реальной помощью другому человеку без вреда для него.'],
      ['милосердие', 'ребята собрали открытки и тёплые вещи для детей, которые долго болеют и не могут ходить в школу', 'Милосердие означает готовность поддержать того, кто особенно нуждается в помощи.'],
      ['уважение', 'в споре дети не кричат друг на друга, а выслушивают разные мнения до конца', 'Уважение не требует согласия во всём, но требует бережного отношения к собеседнику.'],
      ['ответственность', 'дежурный по классу не ушёл домой, пока не проверил, выключен ли свет и закрыты ли окна', 'Ответственность выражается в готовности довести порученное дело до конца.'],
      ['совесть', 'мальчик понял, что списал чужую идею для проекта, и решил честно рассказать об этом учителю', 'Совесть помогает человеку самому увидеть свою неправоту.'],
      ['добро', 'соседи вместе расчистили снег у подъезда для пожилой женщины', 'Добро направлено на реальную пользу и облегчение жизни другого человека.'],
      ['милосердие', 'школьный отряд помощи регулярно навещает приют для животных и заботится о слабых питомцах', 'Милосердие связано с сочувствием и готовностью помочь беззащитному.'],
      ['уважение', 'на празднике класса ребята аккуратно относятся к традициям семьи каждого ученика и не высмеивают отличия', 'Уважение требует признать ценность другого человека и его мира.'],
      ['ответственность', 'спортсмен соблюдает режим подготовки, хотя никто не контролирует его дома', 'Ответственность бывает и внутренней, когда человек сам держит слово.'],
      ['совесть', 'девочка случайно сломала чужую вещь и не стала скрывать это, потому что чувствовала внутреннюю обязанность признаться', 'Совесть побуждает поступить честно даже без внешнего давления.'],
      ['добро', 'старшие школьники проводят для первоклассников игру, чтобы тем было легче привыкнуть к школе', 'Добро проявляется в заботливом действии, которое делает другому легче и спокойнее.'],
      ['милосердие', 'класс решил помочь семье, у которой сгорела часть вещей, и собрал нужные предметы', 'Милосердие особенно заметно там, где человек переживает беду и нуждается в поддержке.']
    ],
    orkse_family4: [
      ['семья', 'ребёнок говорит о людях, которые живут вместе, заботятся друг о друге и чувствуют общую ответственность', 'Семья объединяет близких людей не только родством, но и ежедневной заботой.'],
      ['традиция', 'каждый год дома вместе пекут пирог на один и тот же праздник и передают рецепт младшим', 'Традиция — это повторяющийся обычай, который сохраняется из поколения в поколение.'],
      ['забота', 'бабушка заболела, и внук сам напомнил ей вовремя принять лекарство', 'Забота — внимательное отношение к нуждам другого человека.'],
      ['взаимопомощь', 'в семье один готовит ужин, другой накрывает на стол, а третий убирает после еды', 'Взаимопомощь означает, что люди поддерживают друг друга общим делом.'],
      ['уважение к старшим', 'внуки не перебивают дедушку, когда он рассказывает семейную историю, и благодарят его за советы', 'Уважение к старшим проявляется во внимании, вежливости и признании жизненного опыта.'],
      ['семья', 'в трудной ситуации люди остаются рядом, делят обязанности и поддерживают друг друга', 'Так действует семья как круг близких и ответственных друг за друга людей.'],
      ['традиция', 'перед Новым годом дома каждый пишет пожелание для младших и читает его вслух всей семье', 'Если обычай повторяется и передаётся детям, это семейная традиция.'],
      ['забота', 'старшая сестра заранее положила брату форму для кружка, чтобы он ничего не забыл', 'Забота часто выражается в небольших, но важных действиях.'],
      ['взаимопомощь', 'родные вместе готовятся к приезду гостей, потому что одному человеку было бы тяжело всё сделать', 'Взаимопомощь помогает справиться с делом сообща.'],
      ['уважение к старшим', 'дети уступают место бабушке и внимательно слушают её просьбу', 'Уважение к старшим связано с признанием их достоинства и опыта.'],
      ['семья', 'люди радуются успехам друг друга и поддерживают, когда что-то не получается', 'Семья даёт человеку чувство опоры и принадлежности.'],
      ['традиция', 'в семейном альбоме хранят фотографии и каждый год вспоминают историю рода', 'Традиция сохраняет память и связь поколений.'],
      ['забота', 'мама заметила усталость ребёнка и помогла ему правильно распределить отдых и уроки', 'Забота направлена на благополучие и силы другого человека.'],
      ['взаимопомощь', 'во время переезда все члены семьи поделили дела, чтобы никто не остался один с тяжёлой работой', 'Когда люди помогают друг другу, это взаимопомощь.'],
      ['уважение к старшим', 'подросток вежливо спорит с родителями, но не переходит на грубость и слушает их доводы', 'Уважение не отменяет своего мнения, но требует бережной формы общения.']
    ],
    orkse_culture4: [
      ['культура', 'в описании говорится о языке, музыке, праздниках, сказках и правилах поведения народа', 'Культура включает созданные людьми традиции, знания, искусство и образ жизни.'],
      ['обычай', 'в деревне принято встречать гостей особым приветствием, и так поступают много лет', 'Обычай — привычный способ действовать в определённой ситуации.'],
      ['народ', 'речь идёт об исторически сложившейся общности людей с общими традициями и памятью', 'Народ объединяют история, культура и чувство общности.'],
      ['символ', 'на празднике используют особый знак, который напоминает людям об общей истории и ценностях', 'Символ выражает важную идею через образ или знак.'],
      ['толерантность', 'ученики из разных семей обсуждают разные традиции спокойно и без насмешек', 'Толерантность означает уважительное отношение к отличию взглядов и культур.'],
      ['культура', 'музей, народный костюм и старая песня помогают узнать образ жизни людей', 'Все эти элементы относятся к культуре народа.'],
      ['обычай', 'в школе решили поддержать народную игру, которая проводится в этой местности каждый год', 'Повторяющееся правило или действие в жизни сообщества — это обычай.'],
      ['народ', 'людей объединяют общий исторический путь, язык и представления о своей культуре', 'Так описывается народ как общность.'],
      ['символ', 'узор на полотенце и орнамент на посуде напоминают о важных смыслах и традициях', 'Символ может быть знаком, цветом, узором или предметом.'],
      ['толерантность', 'класс знакомится с традициями соседнего народа и старается понять их, а не оценивать с насмешкой', 'Толерантность помогает людям жить рядом без вражды.'],
      ['культура', 'в рассказе перечислены песни, праздники, ремёсла и семейные правила', 'Это целый мир культуры, а не один предмет.'],
      ['обычай', 'в одной местности принято приносить особое блюдо на общий праздник', 'Такое устойчивое правило поведения называют обычаем.'],
      ['народ', 'речь идёт о людях, которые сохраняют общее культурное наследие и память предков', 'Это описание народа, а не просто группы знакомых.'],
      ['символ', 'белый журавль на памятном мероприятии выбран как знак памяти и мира', 'Символ помогает передать смысл без длинного объяснения.'],
      ['толерантность', 'ребёнок спокойно относится к тому, что у соседа по парте другая семейная традиция праздника', 'Толерантность выражается в уважении, а не в насмешке или отвержении.']
    ]
  };
  var WAVE87H_VALUES_STEMS = [
    'Ситуация: {scene}. Какое понятие лучше всего объясняет этот поступок или правило?',
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
    ['традиция','уважение','ответственность','культура','обычай','семья','милосердие','справедливость','культурное наследие','межкультурный диалог'].forEach(add);
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
        ex: hint + ' В этой ситуации главное понятие — «' + answer + '», потому что именно оно объясняет мотив поступка, культурный признак или правило поведения.'
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
