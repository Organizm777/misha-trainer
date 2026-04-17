/* --- wave33_science.js --- */

(function(){
  if (typeof window === 'undefined') return;
  if (window.wave33Science) return;

  var VERSION = 'wave33';
  var BANKS = {"5":[{"subject":["bio"],"diag":"biology","id":"ecosys5","nm":"Экосистемы и цепи питания","dot":"#16a34a","fm":"Экосистема · производитель · потребитель · цепь питания","summary":"Тема учит видеть связь растений, животных и среды обитания в простых природных сообществах.","ex":"Растения создают органические вещества, травоядные ими питаются, а хищники стоят дальше в цепи питания.","facts":[["экосистема","сообщество живых организмов и среды, в которой они живут"],["производитель","организм, который сам создаёт питательные вещества, обычно растение"],["потребитель","организм, который получает готовую пищу от других организмов"],["цепь питания","последовательность, показывающая кто кем питается в природе"]]},{"subject":["geo5","geog"],"diag":"geography","id":"weather5","nm":"Погода и климат","dot":"#0284c7","fm":"Погода · климат · осадки · термометр","summary":"Тема вводит различие между текущей погодой и климатом местности.","ex":"Погода меняется каждый день, а климат описывает средние условия за долгий период.","facts":[["погода","состояние воздуха и неба в данном месте в данный момент"],["климат","многолетний режим погоды данной территории"],["осадки","вода, выпадающая из облаков в виде дождя, снега или града"],["термометр","прибор для измерения температуры воздуха"]]}],"6":[{"subject":["bio"],"diag":"biology","id":"human6","nm":"Органы человека и здоровье","dot":"#dc2626","fm":"Пищеварение · дыхание · кровообращение · гигиена","summary":"Тема помогает связать строение организма человека с правилами здорового образа жизни.","ex":"Лёгкие обеспечивают дыхание, сердце гонит кровь, а гигиена помогает защититься от болезней.","facts":[["пищеварительная система","система органов, которая перерабатывает пищу и усваивает питательные вещества"],["дыхательная система","система органов, обеспечивающая поступление кислорода и удаление углекислого газа"],["кровообращение","движение крови по сосудам и через сердце"],["гигиена","правила ухода за телом и средой для сохранения здоровья"]]},{"subject":["geo6","geog"],"diag":"geography","id":"atm6","nm":"Атмосфера и ветер","dot":"#0d9488","fm":"Атмосфера · ветер · давление · влажность","summary":"Тема знакомит с воздушной оболочкой Земли и причинами движения воздуха.","ex":"Ветер появляется из-за разницы атмосферного давления, а влажность показывает количество водяного пара в воздухе.","facts":[["атмосфера","воздушная оболочка Земли"],["ветер","движение воздуха из области высокого давления в область низкого давления"],["атмосферное давление","давление воздуха на поверхность Земли и предметы"],["влажность воздуха","содержание водяного пара в воздухе"]]}],"7":[{"subject":["phy"],"diag":"physics","id":"pressure7","nm":"Давление и плотность","dot":"#2563eb","fm":"Давление · плотность · архимедова сила · сообщающиеся сосуды","summary":"Тема закрепляет важные базовые понятия механики жидкостей и газов.","ex":"Чем больше сила на ту же площадь, тем больше давление; тела в жидкости испытывают выталкивающую силу.","facts":[["давление","физическая величина, равная отношению силы к площади поверхности"],["плотность","масса вещества в единице объёма"],["архимедова сила","выталкивающая сила, действующая на тело в жидкости или газе"],["сообщающиеся сосуды","сосуды, соединённые в нижней части, где однородная жидкость устанавливается на одном уровне"]]},{"subject":["bio"],"diag":"biology","id":"plant7","nm":"Строение растений","dot":"#16a34a","fm":"Корень · стебель · лист · фотосинтез","summary":"Тема систематизирует основные органы растения и их функции.","ex":"Корень удерживает растение и всасывает воду, а лист участвует в фотосинтезе.","facts":[["корень","орган растения, закрепляющий его в почве и поглощающий воду с минеральными веществами"],["стебель","орган растения, который соединяет другие органы и проводит вещества"],["лист","орган растения, где обычно происходит фотосинтез и испарение воды"],["фотосинтез","процесс образования органических веществ на свету из воды и углекислого газа"]]},{"subject":["geog","geo7"],"diag":"geography","id":"climate7","nm":"Климатические пояса","dot":"#ea580c","fm":"Экватор · климатический пояс · течение · муссон","summary":"Тема объясняет, почему на Земле выделяют разные климатические пояса.","ex":"Климат зависит от широты, циркуляции воздуха, океанов и морских течений.","facts":[["экватор","воображаемая линия, делящая Землю на Северное и Южное полушария"],["климатический пояс","широтная область Земли с похожими температурными условиями и осадками"],["морское течение","направленное движение больших масс воды в океане"],["муссон","сезонный ветер, меняющий направление летом и зимой"]]}],"8":[{"subject":["phy"],"diag":"physics","id":"current8","nm":"Электрический ток и цепи","dot":"#dc2626","fm":"Ток · напряжение · сопротивление · амперметр","summary":"Тема закрепляет базовые понятия электричества и работу измерительных приборов.","ex":"Сила тока показывает, какой заряд проходит через проводник, а сопротивление мешает движению зарядов.","facts":[["сила тока","физическая величина, показывающая заряд, проходящий через сечение проводника за единицу времени"],["напряжение","физическая величина, характеризующая работу электрического поля по перемещению заряда"],["сопротивление","свойство проводника препятствовать прохождению электрического тока"],["амперметр","прибор для измерения силы тока в цепи"]]},{"subject":["chem"],"diag":"chemistry","id":"valence8","nm":"Валентность и классы веществ","dot":"#16a34a","fm":"Валентность · оксид · кислота · основание","summary":"Тема помогает составлять формулы и узнавать основные классы неорганических веществ.","ex":"По валентности можно определить соотношение атомов в формуле, а по составу — класс вещества.","facts":[["валентность","способность атома соединяться с определённым числом других атомов"],["оксид","сложное вещество из двух элементов, один из которых кислород"],["кислота","сложное вещество, содержащее атомы водорода и кислотный остаток"],["основание","сложное вещество, состоящее из металла и гидроксогруппы"]]},{"subject":["bio"],"diag":"biology","id":"genetics8","nm":"Наследственность и изменчивость","dot":"#7c3aed","fm":"Ген · хромосома · доминантный признак · наследственность","summary":"Тема вводит базовые понятия генетики на школьном уровне.","ex":"Признаки передаются потомкам через гены, расположенные в хромосомах.","facts":[["ген","участок ДНК, определяющий наследственный признак"],["хромосома","структура клетки, в которой находятся гены"],["доминантный признак","признак, проявляющийся у гибрида первого поколения"],["наследственность","свойство организмов передавать признаки потомкам"]]},{"subject":["geog"],"diag":"geography","id":"population8","nm":"Население и города","dot":"#0d9488","fm":"Урбанизация · агломерация · миграция · плотность населения","summary":"Тема помогает читать карты населения и понимать рост городов.","ex":"Крупные города притягивают людей, поэтому растут агломерации и усиливается урбанизация.","facts":[["урбанизация","рост роли городов и увеличение доли городского населения"],["агломерация","скопление близко расположенных городов и посёлков, связанных хозяйственно"],["миграция","перемещение людей с одной территории на другую"],["плотность населения","число жителей, приходящееся на единицу площади"]]}],"9":[{"subject":["phy"],"diag":"physics","id":"radio9","nm":"Атом и радиоактивность","dot":"#f59e0b","fm":"Радиоактивность · α-излучение · β-излучение · период полураспада","summary":"Тема знакомит с ядерными процессами и видами радиоактивного излучения.","ex":"Радиоактивный распад происходит самопроизвольно, а период полураспада показывает скорость уменьшения числа ядер.","facts":[["радиоактивность","самопроизвольное превращение нестабильных атомных ядер"],["альфа-излучение","поток ядер гелия, испускаемый при радиоактивном распаде"],["бета-излучение","поток электронов или позитронов, возникающий при радиоактивном распаде"],["период полураспада","время, за которое распадается половина начального числа радиоактивных ядер"]]},{"subject":["chem"],"diag":"chemistry","id":"ions9","nm":"Ионы и электролиты","dot":"#2563eb","fm":"Ион · катион · анион · электролит","summary":"Тема помогает понять, почему растворы некоторых веществ проводят электрический ток.","ex":"Если вещество в растворе распадается на ионы, оно может проводить электрический ток.","facts":[["ион","заряженная частица, образующаяся при потере или присоединении электронов"],["катион","положительно заряженный ион"],["анион","отрицательно заряженный ион"],["электролит","вещество, раствор или расплав которого проводит электрический ток благодаря ионам"]]},{"subject":["bio"],"diag":"biology","id":"human9","nm":"Нервная и эндокринная регуляция","dot":"#dc2626","fm":"Нейрон · рефлекс · гормон · иммунитет","summary":"Тема объединяет нервную, эндокринную и защитную регуляцию организма.","ex":"Нервная система действует быстро, а гормоны часто обеспечивают более длительное регулирование.","facts":[["нейрон","нервная клетка, передающая электрические сигналы"],["рефлекс","ответная реакция организма на раздражение при участии нервной системы"],["гормон","биологически активное вещество, выделяемое железами внутренней секреции"],["иммунитет","способность организма защищаться от чужеродных веществ и микробов"]]},{"subject":["geog"],"diag":"geography","id":"economy9","nm":"Хозяйство России","dot":"#16a34a","fm":"Специализация · промышленность · транспортный узел · сельское хозяйство","summary":"Тема систематизирует географию хозяйства России и причины размещения производств.","ex":"Предприятия тяготеют к сырью, энергии, рынкам сбыта и транспортным путям.","facts":[["специализация региона","преобладание в хозяйстве территории определённых видов деятельности"],["промышленность","отрасли хозяйства, занятые добычей сырья и производством продукции"],["транспортный узел","место пересечения нескольких важных транспортных путей"],["сельское хозяйство","отрасль хозяйства, связанная с выращиванием растений и разведением животных"]]}],"10":[{"subject":["phy"],"diag":"physics","id":"thermo10","nm":"Термодинамика","dot":"#ea580c","fm":"Внутренняя энергия · количество теплоты · работа газа · КПД","summary":"Тема закрепляет основные понятия термодинамики и тепловых процессов.","ex":"Изменение внутренней энергии связано с теплопередачей и совершением работы.","facts":[["внутренняя энергия","сумма кинетической энергии движения частиц и потенциальной энергии их взаимодействия"],["количество теплоты","энергия, передаваемая телу при теплопередаче"],["работа газа","работа, совершаемая газом при изменении его объёма"],["коэффициент полезного действия","отношение полезной работы к затраченной энергии"]]},{"subject":["chem"],"diag":"chemistry","id":"equilibrium10","nm":"Скорость реакции и равновесие","dot":"#0d9488","fm":"Скорость реакции · катализатор · обратимая реакция · равновесие","summary":"Тема объясняет, какие факторы влияют на скорость реакции и химическое равновесие.","ex":"Катализатор ускоряет реакцию, а изменение температуры или концентрации может смещать равновесие.","facts":[["скорость химической реакции","изменение количества вещества за единицу времени"],["катализатор","вещество, ускоряющее реакцию и не расходующееся в её ходе"],["обратимая реакция","реакция, способная идти как в прямом, так и в обратном направлении"],["химическое равновесие","состояние системы, когда скорости прямой и обратной реакций равны"]]},{"subject":["bio"],"diag":"biology","id":"metabolism10","nm":"Обмен веществ и ферменты","dot":"#16a34a","fm":"Метаболизм · фермент · АТФ · гомеостаз","summary":"Тема связывает клеточный обмен веществ с работой ферментов и поддержанием постоянства внутренней среды.","ex":"Ферменты ускоряют реакции, а энергия часто запасается и переносится в форме АТФ.","facts":[["метаболизм","совокупность всех химических реакций в организме"],["фермент","биологический катализатор белковой природы"],["АТФ","универсальный переносчик энергии в клетке"],["гомеостаз","поддержание относительного постоянства внутренней среды организма"]]},{"subject":["geog"],"diag":"geography","id":"industry10","nm":"Отрасли мирового хозяйства","dot":"#2563eb","fm":"ТЭК · металлургия · машиностроение · транспорт","summary":"Тема помогает различать важнейшие отрасли мировой экономики и факторы их размещения.","ex":"Одни отрасли тяготеют к сырью и энергии, другие — к кадрам, рынкам и науке.","facts":[["топливно-энергетический комплекс","совокупность отраслей, связанных с добычей топлива и производством энергии"],["металлургия","отрасль промышленности по получению металлов и сплавов"],["машиностроение","отрасль промышленности, производящая машины, оборудование и приборы"],["транспортная система","совокупность путей сообщения, средств перевозки и узлов"]]}],"11":[{"subject":["phy"],"diag":"physics","id":"circuits11","nm":"Электрические цепи и мощность","dot":"#dc2626","fm":"ЭДС · внутреннее сопротивление · мощность тока · закон Джоуля–Ленца","summary":"Тема закрывает важные экзаменные вопросы по постоянному току и работе источника.","ex":"В реальной цепи нужно учитывать не только внешнее сопротивление, но и внутреннее сопротивление источника.","facts":[["ЭДС","работа сторонних сил по перемещению единичного заряда внутри источника тока"],["внутреннее сопротивление","сопротивление, находящееся внутри источника тока"],["мощность тока","работа электрического тока за единицу времени"],["закон Джоуля–Ленца","закон, по которому количество теплоты в проводнике равно I²Rt"]]},{"subject":["chem"],"diag":"chemistry","id":"calc11","nm":"Расчёты по химическим формулам","dot":"#7c3aed","fm":"Моль · молярная масса · молярный объём · массовая доля","summary":"Тема систематизирует расчёты, которые чаще всего встречаются в школьной химии и на экзамене.","ex":"Количество вещества связывает массу, объём и число частиц в задачах по химии.","facts":[["моль","количество вещества, содержащее число частиц, равное числу Авогадро"],["молярная масса","масса одного моля вещества"],["молярный объём","объём одного моля газа при заданных условиях"],["массовая доля","отношение массы компонента к массе всей смеси или раствора"]]},{"subject":["bio"],"diag":"biology","id":"human11","nm":"Регуляция и здоровье человека","dot":"#16a34a","fm":"Гомеостаз · анализатор · вакцина · стресс","summary":"Тема связывает регуляцию функций организма с профилактикой заболеваний и работой органов чувств.","ex":"Организм поддерживает равновесие внутренней среды, а иммунопрофилактика помогает защититься от инфекций.","facts":[["анализатор","система, обеспечивающая восприятие раздражений и их обработку нервной системой"],["вакцина","препарат, формирующий специфический иммунитет к инфекции"],["стресс","общая реакция организма на сильное воздействие среды"],["гомеостаз","поддержание устойчивых параметров внутренней среды организма"]]},{"subject":["geog"],"diag":"geography","id":"geopolitics11","nm":"Глобальные проблемы и геополитика","dot":"#0d9488","fm":"Глобализация · МРТ · устойчивое развитие · демографический переход","summary":"Тема связывает мировую экономику, политику и глобальные вызовы современности.","ex":"Мировые связи усиливаются, поэтому экологические, демографические и экономические проблемы решаются только совместно.","facts":[["глобализация","усиление взаимосвязей и взаимозависимости стран мира"],["международное разделение труда","специализация стран на выпуске определённых товаров и услуг"],["устойчивое развитие","развитие, не подрывающее возможности будущих поколений удовлетворять свои потребности"],["демографический переход","историческая смена режимов рождаемости и смертности в обществе"]]}]};

  var gradeInfo = {
    hooked: false,
    grade: Number(window.GRADE_NUM || 0) || 0,
    subjectsHooked: [],
    addedTopicIds: [],
    totalScienceTopics: 0
  };

  var diagnosticInfo = {
    hooked: false,
    addedRows: 0,
    totalRows: 0,
    grades: [],
    hasChemistrySubject: false,
    insertedChemistryCard: false,
    subjectTotals: {
      physics: 0,
      chemistry: 0,
      biology: 0,
      geography: 0
    }
  };

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(list){
    var out = (list || []).slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function uniqBy(list, keyFn){
    var seen = new Set();
    return (list || []).filter(function(item){
      var key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function ensureArray(v){ return Array.isArray(v) ? v : (v ? [v] : []); }
  function findSubject(ids){
    if (typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return null;
    var list = ensureArray(ids);
    for (var i = 0; i < list.length; i++) {
      var subj = SUBJ.find(function(s){ return s && s.id === list[i]; });
      if (subj) return subj;
    }
    return null;
  }
  function factTerms(facts, correct){
    return shuffle((facts || []).map(function(pair){ return pair[0]; }).filter(function(v){ return v !== correct; }).slice(0, 3).concat([correct]));
  }
  function factDefs(facts, correct){
    return shuffle((facts || []).map(function(pair){ return pair[1]; }).filter(function(v){ return v !== correct; }).slice(0, 3).concat([correct]));
  }
  function makeTheory(def){
    return '<h3>' + esc(def.nm) + '</h3>' +
      '<div class="fm">' + String(def.fm || '') + '</div>' +
      '<p>' + esc(def.summary || '') + '</p>' +
      '<div class="ex"><b>Опора:</b> ' + esc(def.ex || '') + '</div>';
  }
  function makeQuestion(def, topic, subj){
    var facts = Array.isArray(def.facts) ? def.facts : [];
    if (!facts.length) {
      return typeof mkQ === 'function'
        ? mkQ('Тема скоро пополнится', 'ОК', ['ОК'], '', topic.nm, subj.cl || '#2563eb', subj.bg || '#dbeafe', null, false)
        : { question:'Тема скоро пополнится', answer:'ОК', options:['ОК'], hint:'', tag:topic.nm };
    }
    var fact = pick(facts);
    var mode = Math.random() < 0.5 ? 'term' : 'def';
    var q = '';
    var a = '';
    var opts = [];
    var hint = fact[1];
    if (mode === 'term') {
      q = 'Что верно про «' + fact[0] + '»?';
      a = fact[1];
      opts = factDefs(facts, fact[1]);
    } else {
      q = 'Какое понятие подходит к описанию: ' + fact[1];
      a = fact[0];
      opts = factTerms(facts, fact[0]);
    }
    if (typeof mkQ === 'function') {
      return mkQ(q, a, opts, hint, topic.nm, subj.cl || '#2563eb', subj.bg || '#dbeafe', null, false);
    }
    return {
      question: q,
      answer: a,
      options: opts,
      hint: hint,
      tag: topic.nm,
      color: subj.cl || '#2563eb',
      bg: subj.bg || '#dbeafe',
      isMath: false
    };
  }
  function ensureTopic(subj, def){
    if (!subj || !def) return false;
    subj.tops = Array.isArray(subj.tops) ? subj.tops : [];
    if (subj.tops.some(function(t){ return t && t.id === def.id; })) return false;
    var topic = {
      id: def.id,
      nm: def.nm,
      th: makeTheory(def),
      dot: def.dot || subj.cl || '#2563eb',
      gen: function(){ return makeQuestion(def, topic, subj); }
    };
    subj.tops.push(topic);
    if (gradeInfo.addedTopicIds.indexOf(def.id) === -1) gradeInfo.addedTopicIds.push(def.id);
    return true;
  }
  function allDefs(){
    var out = [];
    Object.keys(BANKS).forEach(function(key){ (BANKS[key] || []).forEach(function(def){ out.push(def); }); });
    return out;
  }
  function gradeDefs(grade){ return BANKS[String(grade)] || BANKS[grade] || []; }
  function diagRowsFromFacts(grade, def){
    var rows = [];
    var facts = Array.isArray(def.facts) ? def.facts : [];
    facts.forEach(function(fact){
      rows.push({
        g: Number(grade || 0) || 0,
        topic: def.nm,
        q: 'Что верно про «' + fact[0] + '»?',
        opts: factDefs(facts, fact[1]),
        a: fact[1],
        hint: fact[1],
        src: VERSION
      });
      rows.push({
        g: Number(grade || 0) || 0,
        topic: def.nm,
        q: 'Какое понятие подходит к описанию: ' + fact[1],
        opts: factTerms(facts, fact[0]),
        a: fact[0],
        hint: fact[1],
        src: VERSION
      });
    });
    return rows;
  }
  function normalizeDiagRows(rows){
    return uniqBy((rows || []).filter(function(row){
      return row && Number(row.g || 0) && row.q && row.a && Array.isArray(row.opts) && row.opts.length;
    }).map(function(row){
      return {
        g: Number(row.g || 0) || 0,
        topic: row.topic || 'Естественные науки',
        q: row.q,
        opts: row.opts.slice(),
        a: row.a,
        hint: row.hint || 'Разбери термин и свяжи его с определением.',
        src: row.src || VERSION
      };
    }), function(row){
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
  function buildDiagRowsBySubject(){
    var buckets = { physics:[], chemistry:[], biology:[], geography:[] };
    Object.keys(BANKS).forEach(function(key){
      (BANKS[key] || []).forEach(function(def){
        if (!def || !def.diag || !buckets[def.diag]) return;
        buckets[def.diag] = buckets[def.diag].concat(diagRowsFromFacts(Number(key), def));
      });
    });
    return buckets;
  }
  function ensureChemistryConfig(){
    var cfg = {
      track:'Естественные науки',
      exams:['ОГЭ','ЕГЭ'],
      badge:'8–11',
      focus:'вещества, реакции, расчёты'
    };
    if (window.WAVE25_DIAG_SUBJECT_CONFIGS) window.WAVE25_DIAG_SUBJECT_CONFIGS.chemistry = cfg;
    if (window.wave25Diag && window.wave25Diag.subjectConfigs) window.wave25Diag.subjectConfigs.chemistry = cfg;
    return cfg;
  }
  function makeDiagMetaHtml(cfg){
    if (!cfg) return '';
    var parts = [];
    parts.push('<div class="wave25-cardmeta">');
    parts.push('<span class="wave25-pill">🎯 ' + esc(cfg.track || '') + '</span>');
    parts.push('<span class="wave25-pill">📚 ' + esc(cfg.badge || '') + '</span>');
    if (cfg.exams && cfg.exams.length) parts.push('<span class="wave25-pill">🏁 ' + esc(cfg.exams.join(' / ')) + '</span>');
    parts.push('</div>');
    return parts.join('');
  }
  function insertChemistryCard(subject, afterIndex){
    if (typeof document === 'undefined') return false;
    var grid = document.getElementById('subj-grid');
    if (!grid) return false;
    if (grid.querySelector('[data-subject-id="chemistry"]')) {
      diagnosticInfo.insertedChemistryCard = true;
      return true;
    }
    var cfg = ensureChemistryConfig();
    var card = document.createElement('div');
    card.className = 'scard fu';
    card.setAttribute('data-subject-id', 'chemistry');
    card.style.cssText = '--c:' + String(subject.color || '#ea580c') + ';animation-delay:' + (grid.children.length * 0.05) + 's';
    card.innerHTML =
      '<div class="scard-ic">' + esc(subject.icon || '⚗️') + '</div>' +
      '<div class="scard-nm">' + esc(subject.name || 'Химия') + '</div>' +
      '<div class="scard-cl">' + esc(subject.sub || '8–11 классы') + '</div>' +
      '<div class="scard-desc">' + esc(subject.desc || 'Вещества, реакции, расчёты, exam-core') + '</div>' +
      makeDiagMetaHtml(cfg);
    card.onclick = function(){
      if (typeof startDiag === 'function') startDiag('chemistry');
    };
    if (typeof afterIndex === 'number' && afterIndex >= 0 && grid.children[afterIndex]) {
      if (grid.children[afterIndex].nextSibling) grid.insertBefore(card, grid.children[afterIndex].nextSibling);
      else grid.appendChild(card);
    } else {
      grid.appendChild(card);
    }
    diagnosticInfo.insertedChemistryCard = true;
    return true;
  }
  function ensureChemistrySubject(){
    if (typeof SUBJECTS === 'undefined' || !Array.isArray(SUBJECTS)) return false;
    var existing = SUBJECTS.find(function(s){ return s && s.id === 'chemistry'; });
    var subject = existing || {
      id:'chemistry',
      name:'Химия',
      sub:'8–11 классы',
      icon:'⚗️',
      color:'#ea580c',
      desc:'Вещества, реакции, расчёты, exam-core'
    };
    var physicsIndex = SUBJECTS.findIndex(function(s){ return s && s.id === 'physics'; });
    if (!existing) {
      if (physicsIndex >= 0) SUBJECTS.splice(physicsIndex + 1, 0, subject);
      else SUBJECTS.push(subject);
    }
    diagnosticInfo.hasChemistrySubject = true;
    ensureChemistryConfig();
    insertChemistryCard(subject, physicsIndex);
    return true;
  }
  function patchGrade(){
    var grade = Number(window.GRADE_NUM || 0) || 0;
    var defs = gradeDefs(grade);
    if (!defs.length) return;
    gradeInfo.hooked = true;
    var touched = new Set(gradeInfo.subjectsHooked || []);
    defs.forEach(function(def){
      var subj = findSubject(def.subject);
      if (!subj) return;
      touched.add(subj.id);
      ensureTopic(subj, def);
    });
    gradeInfo.subjectsHooked = Array.from(touched);
    gradeInfo.totalScienceTopics = gradeInfo.subjectsHooked.reduce(function(sum, subjId){
      var subj = findSubject(subjId);
      return sum + (subj && Array.isArray(subj.tops) ? subj.tops.length : 0);
    }, 0);
  }
  function patchDiagnostic(){
    if (typeof QBANK === 'undefined' || !QBANK) {
      ensureChemistrySubject();
      return;
    }
    diagnosticInfo.hooked = true;
    var buckets = buildDiagRowsBySubject();
    var added = 0;
    added += mergeBank('physics', buckets.physics);
    added += mergeBank('chemistry', buckets.chemistry);
    added += mergeBank('biology', buckets.biology);
    added += mergeBank('geography', buckets.geography);
    diagnosticInfo.addedRows = Math.max(diagnosticInfo.addedRows, added);
    diagnosticInfo.subjectTotals.physics = Array.isArray(QBANK.physics) ? QBANK.physics.length : 0;
    diagnosticInfo.subjectTotals.chemistry = Array.isArray(QBANK.chemistry) ? QBANK.chemistry.length : 0;
    diagnosticInfo.subjectTotals.biology = Array.isArray(QBANK.biology) ? QBANK.biology.length : 0;
    diagnosticInfo.subjectTotals.geography = Array.isArray(QBANK.geography) ? QBANK.geography.length : 0;
    diagnosticInfo.totalRows = diagnosticInfo.subjectTotals.physics + diagnosticInfo.subjectTotals.chemistry + diagnosticInfo.subjectTotals.biology + diagnosticInfo.subjectTotals.geography;
    diagnosticInfo.grades = Array.from(new Set([].concat(
      (QBANK.physics || []).map(function(row){ return Number(row.g || 0) || 0; }),
      (QBANK.chemistry || []).map(function(row){ return Number(row.g || 0) || 0; }),
      (QBANK.biology || []).map(function(row){ return Number(row.g || 0) || 0; }),
      (QBANK.geography || []).map(function(row){ return Number(row.g || 0) || 0; })
    ).filter(Boolean))).sort(function(a,b){ return a-b; });
    ensureChemistrySubject();
  }
  function init(){
    try { patchGrade(); } catch (_) {}
    try { patchDiagnostic(); } catch (_) {}
  }

  window.wave33Science = {
    version: VERSION,
    banks: BANKS,
    gradeInfo: gradeInfo,
    diagnosticInfo: diagnosticInfo,
    topicCount: function(){ return allDefs().length; },
    factCount: function(){ return allDefs().reduce(function(sum, def){ return sum + ((def.facts || []).length || 0); }, 0); },
    auditSnapshot: function(){
      return {
        version: VERSION,
        grade: gradeInfo.grade,
        gradeHooked: gradeInfo.hooked,
        subjectsHooked: gradeInfo.subjectsHooked.slice(),
        addedTopicIds: gradeInfo.addedTopicIds.slice(),
        totalScienceTopics: gradeInfo.totalScienceTopics,
        diagnosticHooked: diagnosticInfo.hooked,
        diagnosticAdded: diagnosticInfo.addedRows,
        diagnosticTotal: diagnosticInfo.totalRows,
        diagnosticGrades: diagnosticInfo.grades.slice(),
        hasChemistrySubject: diagnosticInfo.hasChemistrySubject,
        insertedChemistryCard: diagnosticInfo.insertedChemistryCard,
        diagnosticSubjectTotals: {
          physics: diagnosticInfo.subjectTotals.physics,
          chemistry: diagnosticInfo.subjectTotals.chemistry,
          biology: diagnosticInfo.subjectTotals.biology,
          geography: diagnosticInfo.subjectTotals.geography
        },
        bankGrades: Object.keys(BANKS).map(function(v){ return Number(v); }).sort(function(a,b){ return a-b; }),
        topicCount: allDefs().length,
        factCount: allDefs().reduce(function(sum, def){ return sum + ((def.facts || []).length || 0); }, 0)
      };
    }
  };

  init();
  if (typeof document !== 'undefined' && document && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  }
  setTimeout(init, 0);
})();
//# sourceMappingURL=chunk_subject_expansion_wave33_science.7379e9af46.js.map
