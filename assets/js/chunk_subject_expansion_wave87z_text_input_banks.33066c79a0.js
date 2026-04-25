/* --- wave87z: explicit fuzzy text-input banks for grades 8-11 --- */
(function(){
  'use strict';
  var grade = String(window.GRADE_NUM || '');
  if (!/^(8|9|10|11)$/.test(grade) || !Array.isArray(window.SUBJ)) return;

  var STYLES = {
    rus: { color:'#0d9488', bg:'#ccfbf1' },
    eng: { color:'#2563eb', bg:'#dbeafe' }
  };
  var THEORY = {
    rus: '<h3>Краткий текстовый ответ</h3><p>В этих заданиях нужно ввести <b>одно слово</b> или <b>короткую фразу</b>. Сначала определи правило или термин, затем набери ответ без лишних слов.</p><div class="fm">термин → точное название\nорфография → нормативное написание\nсвязь в тексте → цепная / параллельная</div><div class="ex">Регистр не важен. Для длинных слов небольшая опечатка засчитывается, но смысл ответа должен оставаться тем же.</div>',
    eng: '<h3>Short free-text answer</h3><p>Type <b>one word</b> or a <b>short phrase</b>. Most tasks are about word formation, spelling or exact translation.</p><div class="fm">decide → decision\ndanger → dangerous\norganise → organisation / organization</div><div class="ex">Capital letters are not important. Small typos in longer words are tolerated, but the required form must stay correct.</div>'
  };

  function asText(value){
    return String(value == null ? '' : value);
  }
  function uniq(list){
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = asText(item).trim();
      if (!value || out.indexOf(value) !== -1) return;
      out.push(value);
    });
    return out;
  }
  function pickOne(list){
    return list[Math.floor(Math.random() * list.length)];
  }
  function findSubject(id){
    var list = Array.isArray(window.SUBJ) ? window.SUBJ : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }
  function ensureTopic(subjectId, topic){
    var subject = findSubject(subjectId);
    if (!subject || !topic || !topic.id || typeof topic.gen !== 'function') return false;
    subject.tops = Array.isArray(subject.tops) ? subject.tops : [];
    var existing = null;
    for (var i = 0; i < subject.tops.length; i++) {
      if (subject.tops[i] && subject.tops[i].id === topic.id) {
        existing = subject.tops[i];
        break;
      }
    }
    if (!existing) {
      existing = { id: topic.id };
      subject.tops.push(existing);
    }
    existing.nm = topic.nm || existing.nm || topic.id;
    existing.dot = topic.dot || existing.dot || (STYLES[subjectId] && STYLES[subjectId].color) || subject.cl || '#2563eb';
    existing.th = topic.th || existing.th || '';
    existing.gen = topic.gen;
    return true;
  }
  function defaultOptions(answer, distractors){
    var list = uniq([answer].concat(Array.isArray(distractors) ? distractors : []));
    var fillers = ['другое слово', 'вариант 2', 'вариант 3', 'вариант 4'];
    for (var i = 0; list.length < 4 && i < fillers.length; i++) {
      if (list.indexOf(fillers[i]) === -1) list.push(fillers[i]);
    }
    while (list.length < 4) list.push('вариант ' + (list.length + 1));
    return list.slice(0, 4);
  }
  function buildTextQuestion(meta, row){
    var style = STYLES[meta.subject] || { color:'#2563eb', bg:'#dbeafe' };
    var options = defaultOptions(row.a, row.o);
    var question = typeof mkQ === 'function'
      ? mkQ(row.q, row.a, options, row.h, meta.tag, style.color, style.bg, null, false, row.ex)
      : { question:row.q, answer:asText(row.a), options:options, hint:row.h, tag:meta.tag, color:style.color, bg:style.bg, ex:row.ex };
    question.inputMode = 'text';
    question.acceptedAnswers = uniq([row.a].concat(Array.isArray(row.accepted) ? row.accepted : []));
    question.fuzzyMaxDistance = row.fuzzyMaxDistance != null ? row.fuzzyMaxDistance : 2;
    question.fuzzyMinLength = row.fuzzyMinLength != null ? row.fuzzyMinLength : 7;
    question.inputPlaceholder = row.placeholder || 'Введите слово или короткую фразу';
    if (row.inputHelper) question.inputHelper = row.inputHelper;
    return question;
  }
  function topic(meta){
    return {
      id: meta.id,
      nm: meta.nm,
      dot: (STYLES[meta.subject] && STYLES[meta.subject].color) || '#2563eb',
      th: meta.th,
      gen: function(){ return buildTextQuestion(meta, pickOne(meta.rows)); }
    };
  }

  var TOPICS = {
    '8': [
      {
        subject:'rus',
        id:'textrus8w87z',
        nm:'Краткий ответ: термины и орфография',
        tag:'Краткий ответ: термины и орфография',
        th: THEORY.rus,
        rows: [
          { q:'Как называется раздел науки о языке, который изучает звуки речи?', a:'фонетика', o:['лексика', 'морфемика', 'синтаксис'], h:'Этот раздел связан со звуками, ударением и слогами.', ex:'Фонетика изучает звуки речи, ударение, слоги и фонетические процессы.' },
          { q:'Как называется часть речи, обозначающая признак действия?', a:'наречие', o:['прилагательное', 'числительное', 'местоимение'], h:'Она отвечает, например, на вопросы «как? где? когда?»', ex:'Наречие обозначает признак действия и обычно относится к глаголу.' },
          { q:'Как называется второстепенный член предложения, отвечающий на вопросы косвенных падежей?', a:'дополнение', o:['обстоятельство', 'определение', 'подлежащее'], h:'Он обозначает объект действия.', ex:'Дополнение отвечает на вопросы косвенных падежей и обозначает объект действия.' },
          { q:'Напиши правильно словарное слово: прив...легия.', a:'привилегия', o:['превилегия', 'привелегия', 'привеллигия'], h:'В корне пишется буква И.', ex:'Нормативное написание — «привилегия».' },
          { q:'Как называется способ связи слов в словосочетании, когда зависимое слово ставится в нужную падежную форму?', a:'управление', o:['согласование', 'примыкание', 'сопоставление'], h:'Главное слово требует определённого падежа зависимого.', ex:'При управлении главное слово требует от зависимого определённой падежной формы.' }
        ]
      },
      {
        subject:'eng',
        id:'texteng8w87z',
        nm:'Short answer: vocabulary & word building',
        tag:'Short answer: vocabulary & word building',
        th: THEORY.eng,
        rows: [
          { q:'Write the noun from collect.', a:'collection', o:['collector', 'collective', 'collecting'], h:'You need the noun that names the result or process.', ex:'The noun from collect is collection.' },
          { q:'Translate into English: окружающая среда.', a:'environment', o:['equipment', 'government', 'movement'], h:'This word is common in ecology topics.', ex:'The correct translation is environment.' },
          { q:'Write the adjective from danger.', a:'dangerous', o:['dangerly', 'endangered', 'danger'], h:'Use the common adjective suffix for quality.', ex:'The adjective from danger is dangerous.' },
          { q:'Write the noun from decide.', a:'decision', o:['decisive', 'deciding', 'decider'], h:'The noun changes the root spelling slightly.', ex:'The noun from decide is decision.' },
          { q:'Write the noun from organise. British spelling is expected, American is also accepted.', a:'organisation', accepted:['organization'], o:['organiser', 'organising', 'organise'], h:'Look for the noun naming a system or event.', ex:'The noun is organisation; organization is also acceptable.' }
        ]
      }
    ],
    '9': [
      {
        subject:'rus',
        id:'textrus9w87z',
        nm:'Краткий ответ: синтаксис и орфография',
        tag:'Краткий ответ: синтаксис и орфография',
        th: THEORY.rus,
        rows: [
          { q:'Как называется сложное предложение без союзов?', a:'бессоюзное', accepted:['бессоюзное предложение', 'бессоюзное сложное предложение', 'бсп'], o:['сложносочинённое', 'сложноподчинённое', 'простое'], h:'Части связываются интонацией и знаками препинания.', ex:'Такое предложение называется бессоюзным; полная форма — бессоюзное сложное предложение.' },
          { q:'Как называется способ связи, при котором зависимое слово повторяет род, число и падеж главного?', a:'согласование', o:['управление', 'примыкание', 'сопоставление'], h:'Зависимое слово подстраивается под форму главного.', ex:'При согласовании зависимое слово согласуется с главным в роде, числе и падеже.' },
          { q:'Напиши правильно слово: к...мпаньон.', a:'компаньон', o:['кампаньон', 'компоньон', 'компаньён'], h:'Проверь первую безударную гласную.', ex:'Правильное написание — «компаньон».' },
          { q:'Как называется знак препинания в конце вопросительного предложения?', a:'вопросительный знак', o:['восклицательный знак', 'двоеточие', 'тире'], h:'Он ставится, когда предложение содержит вопрос.', ex:'В конце вопросительного предложения ставится вопросительный знак.' },
          { q:'Как называется часть слова, которая стоит после корня и служит для образования новых слов?', a:'суффикс', o:['приставка', 'окончание', 'основа'], h:'Она находится между корнем и окончанием.', ex:'Суффикс стоит после корня и часто помогает образовать новое слово.' }
        ]
      },
      {
        subject:'eng',
        id:'texteng9w87z',
        nm:'Short answer: word formation & vocabulary',
        tag:'Short answer: word formation & vocabulary',
        th: THEORY.eng,
        rows: [
          { q:'Write the adjective from success.', a:'successful', o:['successfully', 'successive', 'success'], h:'You need an adjective, not an adverb.', ex:'The adjective from success is successful.' },
          { q:'Write the noun from possible.', a:'possibility', o:['possible', 'possibly', 'impossible'], h:'The final y is important.', ex:'The noun from possible is possibility.' },
          { q:'Translate into English: преимущество.', a:'advantage', o:['adventure', 'agreement', 'attention'], h:'Think of the common collocation “have an ...”.', ex:'The correct translation is advantage.' },
          { q:'Write the adjective from comfort.', a:'comfortable', o:['comfortably', 'comforting', 'comfort'], h:'Watch the spelling in the middle of the word.', ex:'The adjective from comfort is comfortable.' },
          { q:'Write the noun from responsible.', a:'responsibility', o:['responsible', 'response', 'responsibly'], h:'The spelling changes before the suffix.', ex:'The noun from responsible is responsibility.' }
        ]
      }
    ],
    '10': [
      {
        subject:'rus',
        id:'textrus10w87z',
        nm:'Краткий ответ: анализ текста и синтаксис',
        tag:'Краткий ответ: анализ текста и синтаксис',
        th: THEORY.rus,
        rows: [
          { q:'Как называется тип речи, в котором тезис подтверждается аргументами и выводом?', a:'рассуждение', o:['описание', 'повествование', 'диалог'], h:'Такой текст строится как доказательство.', ex:'Текст с тезисом, аргументами и выводом относится к рассуждению.' },
          { q:'Как называется предложение, грамматическая основа которого состоит из подлежащего и сказуемого?', a:'двусоставное', accepted:['двусоставное предложение'], o:['односоставное', 'неполное', 'сложное'], h:'В основе есть оба главных члена.', ex:'Такое предложение называется двусоставным.' },
          { q:'Как называется слово или сочетание слов, выражающее отношение говорящего к сообщению?', a:'вводное слово', accepted:['вводная конструкция', 'вводное сочетание'], o:['обращение', 'сказуемое', 'уточнение'], h:'Оно не является членом предложения и часто выделяется запятыми.', ex:'Эту функцию выполняет вводное слово или вводная конструкция.' },
          { q:'Напиши правильно слово: интел...генция.', a:'интеллигенция', o:['интелегенция', 'интелигенция', 'интиллигенция'], h:'В слове две буквы Л.', ex:'Нормативное написание — «интеллигенция».' },
          { q:'Как называется связь предложений в тексте, когда каждое следующее предложение опирается на предыдущее?', a:'цепная связь', accepted:['цепная'], o:['параллельная связь', 'абзацная связь', 'сквозная тема'], h:'Информация как бы передаётся по цепочке.', ex:'Когда каждое новое предложение опирается на предыдущее, это цепная связь.' }
        ]
      },
      {
        subject:'eng',
        id:'texteng10w87z',
        nm:'Short answer: exam vocabulary & word formation',
        tag:'Short answer: exam vocabulary & word formation',
        th: THEORY.eng,
        rows: [
          { q:'Write the noun from interpret.', a:'interpretation', o:['interpreter', 'interpreting', 'interpretative'], h:'You need the abstract noun.', ex:'The noun from interpret is interpretation.' },
          { q:'Write the noun from achieve.', a:'achievement', o:['achiever', 'achieving', 'achievable'], h:'Think of something you can be proud of.', ex:'The noun from achieve is achievement.' },
          { q:'Write the noun from compete.', a:'competition', o:['competitor', 'competitive', 'competing'], h:'This noun names an event or rivalry.', ex:'The noun from compete is competition.' },
          { q:'Write the adjective from tradition.', a:'traditional', o:['tradition', 'traditionally', 'traditive'], h:'Add the common adjective suffix.', ex:'The adjective from tradition is traditional.' },
          { q:'Write the noun from apply.', a:'application', o:['applicant', 'appliance', 'applying'], h:'This noun can mean a request or the use of something.', ex:'The noun from apply is application.' }
        ]
      }
    ],
    '11': [
      {
        subject:'rus',
        id:'textrus11w87z',
        nm:'Краткий ответ: анализ текста и выразительность',
        tag:'Краткий ответ: анализ текста и выразительность',
        th: THEORY.rus,
        rows: [
          { q:'Как называется синтаксический приём одинакового построения соседних конструкций?', a:'параллелизм', o:['повтор', 'инверсия', 'градация'], h:'Этот приём делает фразы ритмически похожими.', ex:'Одинаковое построение соседних конструкций называется параллелизмом.' },
          { q:'Как называется средство выразительности, при котором неодушевлённому предмету приписываются свойства живого?', a:'олицетворение', o:['эпитет', 'сравнение', 'метонимия'], h:'Предмет или явление как будто «оживает».', ex:'Такой перенос свойств живого на неживое называется олицетворением.' },
          { q:'Как называется пояснение проблемы текста в сочинении ЕГЭ после формулировки проблемы?', a:'комментарий', o:['аргумент', 'тезис', 'вывод'], h:'Это часть сочинения между проблемой и позицией автора.', ex:'После формулировки проблемы в сочинении даётся комментарий к ней.' },
          { q:'Как называется повторение одинакового начала строк, предложений или синтаксических отрезков?', a:'анафора', o:['эпифора', 'градация', 'риторика'], h:'Повтор стоит именно в начале.', ex:'Повтор начала строк или фраз называется анафорой.' },
          { q:'Как называется логичное доказательство собственной позиции в сочинении?', a:'аргументация', o:['компрессия', 'интерпретация', 'иллюстрация'], h:'Здесь нужны доводы, а не просто мнение.', ex:'Доказательство собственной позиции называется аргументацией.' }
        ]
      },
      {
        subject:'eng',
        id:'texteng11w87z',
        nm:'Short answer: advanced word formation',
        tag:'Short answer: advanced word formation',
        th: THEORY.eng,
        rows: [
          { q:'Write the noun from interpret.', a:'interpretation', o:['interpreter', 'interpretive', 'interpreting'], h:'You need the abstract noun.', ex:'The noun from interpret is interpretation.' },
          { q:'Write the noun from conclude.', a:'conclusion', o:['concluding', 'conclusive', 'concluder'], h:'The ending changes to -sion.', ex:'The noun from conclude is conclusion.' },
          { q:'Write the noun from explain.', a:'explanation', o:['explainer', 'explaining', 'explicit'], h:'Add the noun suffix and keep the base meaning.', ex:'The noun from explain is explanation.' },
          { q:'Write the adjective from emotion.', a:'emotional', o:['emotionally', 'emotion', 'emotive'], h:'You need an adjective, not an adverb.', ex:'The adjective from emotion is emotional.' },
          { q:'Write the adjective from benefit.', a:'beneficial', o:['benefit', 'beneficiary', 'benefiting'], h:'This adjective means “useful, helpful”.', ex:'The adjective from benefit is beneficial.' }
        ]
      }
    ]
  };

  var injected = [];
  (TOPICS[grade] || []).forEach(function(def){
    var built = topic(def);
    if (ensureTopic(def.subject, built)) injected.push(def.id);
  });

  window.__wave87zTextInputBanks = {
    version: 'wave87z',
    grade: grade,
    topicCount: injected.length,
    rowCount: (TOPICS[grade] || []).reduce(function(sum, item){ return sum + ((item.rows && item.rows.length) || 0); }, 0),
    topicIds: injected.slice()
  };
})();
