;(() => {
  // wave87d: grade-specific split of the former monolithic wave86m gap-balance chunk.
  var VERSION = 'wave86m-gap-balance-wave87d-grade-' + String(window.GRADE_NUM || '');
  if (typeof window === 'undefined' || typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  if (window.wave86mGapBalance) return;
  var grade = String(window.GRADE_NUM || '');
  var DATA = {"8":{"subjects":[{"id":"lit","after":"geog","nm":"Литература","ic":"📚","cl":"#9333ea","bg":"#f3e8ff","tops":[{"id":"gogol8_wave86m","nm":"Гоголь и комедия","dot":"#dc2626","fm":"комедия · чиновники · сатира · конфликт","summary":"Тема добавляет опору по сатирическим произведениям Гоголя и жанру комедии.","ex":"В комедии Гоголя смешное часто раскрывает серьёзные общественные проблемы.","facts":[["комедия","драматическое произведение, где конфликт раскрывается через смешное"],["«Ревизор»","комедия Гоголя о страхе чиновников перед проверкой"],["Хлестаков","герой «Ревизора», которого принимают за важного чиновника"],["хлестаковщина","пустое хвастовство и желание казаться значительнее"],["сатира Гоголя","осмеяние пороков общества и чиновничества"]]},{"id":"prose8_wave86m","nm":"Нравственный выбор в прозе","dot":"#0d9488","fm":"герой · выбор · честь · ответственность","summary":"Тема учит анализировать поступок героя как нравственный выбор.","ex":"При разборе выбора героя важно учитывать ситуацию, мотив и последствия поступка.","facts":[["нравственный выбор","ситуация, когда герой выбирает между ценностями и последствиями"],["мотив поступка","причина, по которой герой действует именно так"],["характер героя","устойчивые качества, проявляющиеся в поступках"],["авторская оценка","отношение автора к герою или событию"],["деталь портрета","элемент внешности, помогающий понять образ героя"]]}]},{"id":"obzh","after":"inf","nm":"ОБЖ","ic":"🛟","cl":"#dc2626","bg":"#fee2e2","tops":[{"id":"home_street8_wave86m","nm":"Безопасность дома и на улице","dot":"#dc2626","fm":"риск · правило · сигнал · эвакуация","summary":"Тема формирует базовые правила личной безопасности в быту и городе.","ex":"В вопросах о безопасности сначала найди источник опасности, затем выбери действие, которое снижает риск и не создаёт новый.","facts":[["опасная ситуация","обстановка, в которой есть риск вреда для жизни или здоровья"],["эвакуация","организованный выход людей из опасного места"],["экстренный вызов","обращение в службу помощи при угрозе жизни, пожарах или авариях"],["безопасный маршрут","путь, где меньше риска ДТП, темноты, толпы или опасных объектов"],["пожарная безопасность","правила, которые помогают предотвратить пожар и действовать при нём"]]},{"id":"chs8_wave86m","nm":"ЧС природного и техногенного характера","dot":"#ea580c","fm":"ЧС · сигнал · укрытие · план действий","summary":"Тема объясняет, как распознавать чрезвычайную ситуацию и действовать по инструкции.","ex":"При ЧС важны спокойствие, проверенная информация, выполнение указаний взрослых и служб спасения.","facts":[["чрезвычайная ситуация","обстановка, нарушающая нормальную жизнь и угрожающая людям"],["техногенная авария","опасное происшествие, связанное с техникой, производством или транспортом"],["природная ЧС","опасное природное явление, например наводнение, ураган или землетрясение"],["сигнал оповещения","сообщение, предупреждающее людей об опасности"],["укрытие","место, где можно временно защититься от опасного воздействия"]]},{"id":"firstaid8_wave86m","nm":"Первая помощь","dot":"#16a34a","fm":"оценка состояния · вызов помощи · остановка крови","summary":"Тема даёт безопасный алгоритм первой помощи без рискованных действий.","ex":"Первая помощь начинается с безопасности места и вызова взрослых или экстренных служб, а не с необдуманных действий.","facts":[["первая помощь","простые срочные действия до прибытия врача или спасателей"],["безопасность места","проверка, не угрожает ли опасность самому помогающему"],["кровотечение","выход крови из повреждённого сосуда"],["ожог","повреждение тканей высокой температурой, химическим веществом или электричеством"],["алгоритм помощи","последовательность действий: оценить опасность, позвать помощь, действовать по ситуации"]]}]}]}};
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
  var WAVE87A_LIT_SPECS = {"8":{"gogol8_wave86m":{"prefix":"Гоголь и комедия.","guide":"В «Ревизоре» смешное раскрывает страх, ложь и пороки чиновничьего мира.","terms":[["комедия","жанр «Ревизора» построен на смешном сценическом конфликте","Произведение написано для сцены."],["Хлестаков","чиновники ошибочно принимают гостя за ревизора","Ошибка запускает конфликт."],["хлестаковщина","пустое хвастовство выглядит как значительность","Термин связан с героем."],["сатира Гоголя","смех разоблачает чиновничьи пороки","Сатира говорит о системе."],["страх разоблачения","городничий боится проверки","Ему есть что скрывать."],["мнимый ревизор","проверяющего нет, но все верят в него","Комедия строится на ошибке."],["немая сцена","финал показывает потрясение без слов","Молчание становится итогом."],["речевая характеристика","слова героя раскрывают характер","Речь у Гоголя очень выразительна."],["чинопочитание","люди боятся чина больше правды","Это зависимость от власти."],["круговая порука","чиновники прикрывают друг друга","Проблема становится общей."],["драматическая ирония","зритель понимает ошибку раньше героев","Зритель знает больше персонажей."],["пустота героя","Хлестаков говорит много, но внутренне ничтожен","Его важность создают окружающие."],["уездный город","город становится моделью чиновничьей России","Это обобщённый образ."],["саморазоблачение","герои сами показывают свои пороки","Комедия заставляет увидеть правду."],["обличение","смешное направлено на исправление порока","Смех имеет нравственную цель."]]},"prose8_wave86m":{"prefix":"Нравственный выбор в прозе.","guide":"Поступок героя раскрывает совесть, ответственность и цену выбора.","terms":[["нравственный выбор","герой решает, как поступить по совести","Выбор раскрывает ценности."],["совесть","внутренний нравственный суд оценивает поступок","Совесть связана с ответственностью."],["честь","герой держит слово и не предаёт принципов","Честь проверяется трудной ситуацией."],["ответственность","решение влияет на других людей","Герой отвечает за последствия."],["нравственный конфликт","сталкиваются разные ценности","Спор идёт о добре и долге."],["раскаяние","герой признаёт ошибку","Раскаяние показывает рост."],["сострадание","герой понимает боль другого","Сочувствие ведёт к поступку."],["осознанность","персонаж понимает, что делает","Это отличает выбор от порыва."],["внутреннее взросление","после испытания герой меняется","Герой становится зрелее."],["поступок","действие показывает характер лучше слов","Поступок раскрывает ценности."],["внутренний монолог","видны сомнения героя","Мы слышим мысли персонажа."],["испытание характера","выбор проверяет человека","Ситуация обнаруживает принципы."],["мотив поступка","важно понять, зачем герой действует","Мотив помогает оценить действие."],["психологическая деталь","жест или взгляд раскрывает состояние","Маленькая деталь показывает душу."],["идея произведения","итоговый смысл связан с выбором героя","Идея объединяет события."]]}}};
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
  var WAVE87B_OBZH_SCENARIOS = {"8":{"home_street8_wave86m":[["выйти из опасной зоны и вызвать 112","в подъезде пахнет дымом и слышны крики сверху","Сначала уходят из опасности, потом вызывают помощь."],["не открывать дверь и связаться со взрослыми","незнакомец просит открыть квартиру для проверки, взрослых нет","Проверки не проводят через ребёнка без взрослых."],["отойти, предупредить других и сообщить взрослым","на тротуаре после грозы лежит оборванный провод","К оборванным проводам не подходят и не прикасаются."],["спокойно идти по указанию учителя к выходу","в школе прозвучал сигнал эвакуации","При эвакуации важны порядок и команда ответственного взрослого."],["выбрать освещённый и людный маршрут","короткий путь домой проходит через тёмный пустырь","Безопасный маршрут не всегда самый короткий."],["позвать взрослого и отойти от огня","на кухне загорелось полотенце рядом с плитой","Ребёнок не тушит огонь рискованными способами."],["обратиться к охране или стойке информации","в торговом центре потерялись родители","Официальные сотрудники помогают найти взрослых безопасно."],["нажать кнопку связи и выйти на ближайшем этаже","в лифте появился запах гари","Штатная связь безопаснее попытки открыть двери силой."],["укрыться в капитальном здании","во время грозы рядом только открытая площадка и одинокое дерево","При грозе избегают открытых мест и одиночных деревьев."],["не трогать предмет и сообщить ответственным","на остановке лежит бесхозный рюкзак","Подозрительные вещи не перемещают."],["проверить сообщение у учителя или администрации","в чате пишут о срочной эвакуации без официального объявления","При угрозах ориентируются на проверенный источник."],["не трогать искрящий удлинитель и позвать взрослого","дома искрит удлинитель с несколькими приборами","Электричество опасно при касании и перегреве."],["отойти и сообщить взрослым или охране","во дворе началась драка и собирается толпа","Толпа и драка опасны для наблюдателя."],["двигаться к выходу по указателям","в задымлённом помещении видимость плохая","Указатели помогают выйти, а возврат за вещами увеличивает риск."],["охладить ожог прохладной водой и сообщить взрослому","на руку попал горячий чай","При бытовом ожоге помогают охлаждение и помощь взрослого."]],"chs8_wave86m":[["убрать незакреплённые предметы и оставаться дома","объявлено штормовое предупреждение","При сильном ветре опасны балконы, вывески и открытые места."],["включить официальные источники и ждать инструкций","в городе включили сирены оповещения","Сирена означает необходимость получить сообщение служб."],["закрыть окна и уплотнить щели","при аварии рекомендовано оставаться в помещении","Цель — уменьшить попадание опасного воздуха."],["не спускаться в затопленный подвал","после ливня вода быстро поднимается во дворе","Вода может скрывать ток, ямы и быстрый поток."],["отработать маршрут и порядок действий","в школе проводится учебная эвакуация","Тренировка снижает растерянность при реальной угрозе."],["отойти от аварии и вызвать помощь","на дороге авария с цистерной","Техногенная авария может быть токсичной или пожароопасной."],["держаться у внутренней стены или под прочным столом","при землетрясении нельзя сразу выйти из помещения","Нужно уменьшить риск от стекла и падающих предметов."],["идти к пункту сбора","при эвакуации объявлено место встречи жителей","Пункт сбора помогает учесть людей и дать дальнейшие указания."],["взять тревожный набор","службы просят подготовить документы, воду и лекарства","Набор помогает быстро покинуть опасную зону."],["использовать фонарь вместо свечей без присмотра","район остался без света после аварии","Открытый огонь рядом с тканью создаёт пожарный риск."],["проверить информацию на официальных каналах","в соцсети распространяют слух о токсичном облаке","Слухи могут вызвать панику и ошибки."],["готовиться к эвакуации по указанию служб","дым лесного пожара приближается к посёлку","Пожар меняет направление, маршрут выбирают службы."],["не трогать неизвестное вещество","в кабинете разлилась жидкость с резким запахом","Неизвестное вещество нельзя нюхать и вытирать руками."],["переместить человека в тень и позвать взрослых","в жару человеку стало плохо на солнце","Снижение перегрева начинается с тени и помощи."],["заранее изучить схему эвакуации","в здании висит план путей выхода","План помогает ориентироваться при дыме или шуме."]],"firstaid8_wave86m":[["проверить безопасность места","перед тобой пострадавший рядом с проезжей частью","Помогающий не должен стать вторым пострадавшим."],["позвать взрослого и прижать рану чистой салфеткой","у одноклассника небольшое кровотечение из раны","При кровотечении важны чистота и прямое давление."],["не заставлять идти через боль","после падения человек жалуется на сильную боль в ноге","Движение может усилить повреждение."],["говорить спокойно и сообщить взрослым","пострадавший в сознании, но сильно испуган","Спокойная поддержка снижает панику."],["не смазывать ожог маслом","после ожога предлагают домашние средства","Масло задерживает тепло и загрязняет ожог."],["позвать взрослых и вызвать 112","человек не отвечает на обращение","Потеря сознания — повод для срочной помощи."],["назвать адрес, событие и число пострадавших","ты звонишь в 112","Диспетчеру нужны факты для отправки помощи."],["посадить и наклонить голову немного вперёд","у ученика носовое кровотечение","Кровь не должна стекать в горло."],["не подходить к оголённому проводу","пострадавший лежит рядом с проводом","Пока источник тока опасен, приближаться нельзя."],["перейти в тень и прекратить нагрузку","после бега в жару у друга кружится голова","Жара и нагрузка усиливают риск перегрева."],["не давать лекарства без взрослого","пострадавший просит таблетку из чужой аптечки","Возможны аллергия и противопоказания."],["действовать по алгоритму первой помощи","ученик растерялся при происшествии","Алгоритм помогает не пропустить важные шаги."],["убрать толпу вокруг пострадавшего","около ссадины собрались дети с телефонами","Толпа мешает помощи и пугает."],["действовать только в безопасных пределах","кто-то предлагает рискованное геройство","Помощь не должна создавать новых пострадавших."],["следовать указаниям диспетчера или учителя","ты не уверен, как правильно помочь","Лучше уточнить действие, чем делать наугад."]]}};
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
