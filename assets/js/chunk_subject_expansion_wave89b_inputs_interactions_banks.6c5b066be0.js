/* wave89b: merge pass for senior input/interaction banks (wave87y + wave87z + wave88b) */
/* --- wave87y: explicit free-input banks for grades 8-11 --- */
(function(){
  'use strict';
  var grade = String(window.GRADE_NUM || '');
  if (!/^(8|9|10|11)$/.test(grade) || !Array.isArray(window.SUBJ)) return;

  var STYLES = {
    alg: { color:'#dc2626', bg:'#fee2e2' },
    prob: { color:'#7c3aed', bg:'#ede9fe' },
    phy: { color:'#2563eb', bg:'#dbeafe' },
    chem: { color:'#16a34a', bg:'#dcfce7' }
  };
  var THEORY = {
    alg8: '<h3>Числовой ответ: уравнения и степени</h3><p>В этих заданиях важно быстро выделить <b>одно действие</b>: раскрыть скобки, перенести число или вычислить степень.</p><div class="fm">3x + 5 = 20 → 3x = 15 → x = 5\n√81 = 9\n(a² − b²) = (a − b)(a + b)</div><div class="ex">Записывай только число. Для корней и степеней сначала считай выражение, потом вводи ответ.</div>',
    prob8: '<h3>Числовой ответ: вероятность и среднее</h3><p>Сначала посчитай число благоприятных исходов, затем раздели его на число всех исходов.</p><div class="fm">P = m / n\nсреднее арифметическое = сумма чисел / их количество\nдля двух монет всего 4 исхода</div><div class="ex">Можно вводить дробь 1/2 или десятичное число 0,5 — оба формата засчитываются.</div>',
    phy8: '<h3>Числовой ответ: ток и тепло</h3><p>Используй одну нужную формулу и следи за единицами.</p><div class="fm">I = U / R\nR = U / I\nA = P · t\nQ = c · m · Δt</div><div class="ex">Если в эталоне есть единицы, ответ можно ввести и с единицами, и без них.</div>',
    chem8: '<h3>Числовой ответ: формулы и состав вещества</h3><p>Читай формулу внимательно: индексы показывают число атомов, а относительная молекулярная масса — сумму атомных масс.</p><div class="fm">M<sub>r</sub>(H₂O) = 2·1 + 16 = 18\nмассовая доля = масса вещества / масса раствора · 100%</div><div class="ex">В заданиях на состав раствора сначала найди общую массу, потом вычисляй процент.</div>',
    alg9: '<h3>Числовой ответ: квадратные уравнения и прогрессии</h3><p>Перед вводом ответа уточни, что именно спрашивают: корень, дискриминант или номерной член прогрессии.</p><div class="fm">x² − 5x + 6 = 0 → корни 2 и 3\na<sub>n</sub> = a₁ + d(n − 1)\nb<sub>n</sub> = b₁ · q<sup>n−1</sup></div><div class="ex">Если сказано «меньший корень», сравни оба значения и вводи только нужное.</div>',
    phy9: '<h3>Числовой ответ: механика и волны</h3><p>Определи величину и сразу выбери формулу из механики.</p><div class="fm">v = s / t\nF = m · a\np = m · v\nT = 1 / ν\nA = F · s</div><div class="ex">Период можно ввести дробью 1/2 или десятичным числом 0,5.</div>',
    chem9: '<h3>Числовой ответ: ионы и расчёты</h3><p>Здесь важны три опоры: относительная масса, степень окисления и массовая доля.</p><div class="fm">M<sub>r</sub>(CO₂) = 12 + 2·16 = 44\nO обычно имеет степень окисления −2\nω = m(вещества) / m(раствора) · 100%</div><div class="ex">Для процента удобно сначала составить отношение, а затем умножить на 100.</div>',
    alg10: '<h3>Числовой ответ: логарифмы и тригонометрия</h3><p>Большинство задач решаются по одной опоре: логарифм, степень или значение тригонометрической функции для табличного угла.</p><div class="fm">log₂8 = 3\n3ˣ = 81 → x = 4\nsin 30° = 1/2\ncos 60° = 1/2</div><div class="ex">Для тригонометрии можно вводить 1/2, 0,5 или 0.5.</div>',
    prob10: '<h3>Числовой ответ: вероятность и комбинаторика</h3><p>Сначала выясни, сколько всего исходов, затем — сколько подходят условию.</p><div class="fm">C(4, 2) = 6\nP = m / n\nдля двух подбрасываний монеты всего 4 исхода</div><div class="ex">Дробные ответы можно писать через косую черту или десятичной записью.</div>',
    phy10: '<h3>Числовой ответ: энергия, давление и работа</h3><p>Перед расчётом проверь, в каких единицах даны величины, и подставляй в формулу без лишних преобразований.</p><div class="fm">E<sub>k</sub> = m · v² / 2\np = F / S\nA = p · ΔV\nQ = c · m · Δt\na = F / m</div><div class="ex">Если давление дано в кПа, сначала переведи его в Па.</div>',
    chem10: '<h3>Числовой ответ: молярная масса и количество вещества</h3><p>Задачи держатся на базовых формулах для молярной массы, количества вещества и массовой доли.</p><div class="fm">M(NaOH) = 23 + 16 + 1 = 40\nn = m / M\nω = m(вещества) / m(раствора) · 100%</div><div class="ex">В заданиях на моли сначала найди молярную массу, потом дели массу вещества на неё.</div>',
    alg11: '<h3>Числовой ответ: производная и интеграл</h3><p>Часто нужно не полное решение, а сразу числовое значение производной или интеграла.</p><div class="fm">(x²)′ = 2x\n(3x + 1)′ = 3\n∫₀² x dx = [x²/2]₀² = 2\nln(e⁴) = 4</div><div class="ex">После нахождения производной не забудь подставить указанное значение x.</div>',
    prob11: '<h3>Числовой ответ: вероятность и статистика</h3><p>Сочетания, вероятности и статистические характеристики удобно держать в одном блоке.</p><div class="fm">C(5, 2) = 10\nP(ровно один орёл при двух бросках) = 1/2\nM(честный кубик) = 3,5\nмедиана для 1, 1, 3, 9 равна 2</div><div class="ex">Средние и вероятности можно вводить через запятую, точку или дробью.</div>',
    phy11: '<h3>Числовой ответ: цепи, линзы и волны</h3><p>В этом наборе встречаются последовательное соединение, закон Ома, мощность, линзы и длина волны.</p><div class="fm">R = R₁ + R₂\nI = U / R\nP = U · I\nD = 1 / f\nλ = c / ν</div><div class="ex">Фокусное расстояние и длину волны можно вводить как 0,5 или 1/2.</div>',
    chem11: '<h3>Числовой ответ: pH, степени окисления и моли</h3><p>Сначала определи тип задачи: pH, степень окисления, молярная масса или количество вещества.</p><div class="fm">pH = −log[H⁺]\nв KMnO₄ марганец имеет степень окисления +7\nM(CH₃COOH) = 60\n22,4 л газа при н.у. = 1 моль</div><div class="ex">Для pH достаточно внимательно прочитать показатель степени у концентрации и поменять знак.</div>'
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
  function numericTextVariants(value){
    var text = asText(value).trim();
    if (!text) return [];
    var out = [text];
    if (text.indexOf(',') !== -1) out.push(text.replace(',', '.'));
    if (text.indexOf('.') !== -1) out.push(text.replace('.', ','));
    return uniq(out);
  }
  function unitAnswers(value, unit){
    var out = [];
    numericTextVariants(value).forEach(function(item){
      out.push(item);
      out.push(item + ' ' + unit);
      out.push(item + unit);
    });
    return uniq(out);
  }
  function percentAnswers(value){
    var out = [];
    numericTextVariants(value).forEach(function(item){
      out.push(item);
      out.push(item + '%');
      out.push(item + ' %');
    });
    return uniq(out);
  }
  function fractionAnswers(frac, decimal){
    var out = [frac];
    numericTextVariants(decimal).forEach(function(item){ out.push(item); });
    return uniq(out);
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
    var fillers = ['другое число', 'вариант 2', 'вариант 3', 'вариант 4'];
    for (var i = 0; list.length < 4 && i < fillers.length; i++) {
      if (list.indexOf(fillers[i]) === -1) list.push(fillers[i]);
    }
    while (list.length < 4) list.push('вариант ' + (list.length + 1));
    return list.slice(0, 4);
  }
  function buildInputQuestion(meta, row){
    var style = STYLES[meta.subject] || { color:'#2563eb', bg:'#dbeafe' };
    var options = defaultOptions(row.a, row.o);
    var question = typeof mkQ === 'function'
      ? mkQ(row.q, row.a, options, row.h, meta.tag, style.color, style.bg, null, true, row.ex)
      : { question:row.q, answer:asText(row.a), options:options, hint:row.h, tag:meta.tag, color:style.color, bg:style.bg, isMath:true, ex:row.ex };
    question.inputMode = 'numeric';
    question.acceptedAnswers = uniq([row.a].concat(Array.isArray(row.accepted) ? row.accepted : []));
    return question;
  }

  var TOPICS = {
    '8': [
      {
        subject:'alg',
        id:'numalg8w87y',
        nm:'Числовой ответ: уравнения и степени',
        tag:'Числовой ответ: уравнения и степени',
        th: THEORY.alg8,
        rows: [
          { q:'Реши уравнение: 3x + 5 = 20.', a:'5', o:['4', '6', '7'], h:'Сначала вычти 5, потом раздели на 3.', ex:'После переноса 5 получаем 3x = 15, поэтому x = 5.' },
          { q:'Найди значение выражения: 2⁵.', a:'32', o:['16', '25', '64'], h:'Степень показывает, сколько раз число умножают само на себя.', ex:'2⁵ = 2·2·2·2·2 = 32.' },
          { q:'Реши уравнение: x / 4 = 3.', a:'12', o:['7', '8', '16'], h:'Чтобы найти x, умножь обе части на 4.', ex:'Если x / 4 = 3, то x = 3·4 = 12.' },
          { q:'Вычисли: (7² − 5²) / 4.', a:'6', o:['4', '5', '8'], h:'Сначала найди квадраты 7 и 5.', ex:'7² = 49, 5² = 25, разность 24, а 24 / 4 = 6.' },
          { q:'Чему равно √81?', a:'9', o:['8', '7', '10'], h:'Квадратный корень — это число, квадрат которого равен 81.', ex:'9² = 81, значит √81 = 9.' },
          { q:'Реши уравнение: 5(x − 2) = 15.', a:'5', o:['3', '4', '6'], h:'Сначала раздели обе части на 5.', ex:'После деления на 5 получаем x − 2 = 3, откуда x = 5.' }
        ]
      },
      {
        subject:'prob',
        id:'numprob8w87y',
        nm:'Числовой ответ: вероятность и среднее',
        tag:'Числовой ответ: вероятность и среднее',
        th: THEORY.prob8,
        rows: [
          { q:'Бросают обычный кубик. Какова вероятность выпадения чётного числа?', a:'1/2', accepted:fractionAnswers('1/2', '0.5'), o:['1/3', '2/3', '1/6'], h:'На кубике 3 чётных исхода из 6.', ex:'Чётные числа — 2, 4 и 6, значит вероятность равна 3/6 = 1/2.' },
          { q:'В коробке 3 красных и 1 синий шар. Какова вероятность вытянуть синий шар?', a:'1/4', accepted:fractionAnswers('1/4', '0.25'), o:['1/2', '3/4', '1/3'], h:'Всего 4 шара, благоприятный исход один.', ex:'Синий шар один из четырёх, поэтому вероятность равна 1/4.' },
          { q:'Найди среднее арифметическое чисел 2, 4 и 6.', a:'4', o:['3', '5', '6'], h:'Сложи числа и раздели на 3.', ex:'Сумма равна 12, а 12 / 3 = 4.' },
          { q:'Сколько всего исходов у двух подбрасываний монеты?', a:'4', o:['2', '3', '8'], h:'Перечисли варианты: ОО, ОР, РО, РР.', ex:'Для двух бросков есть 4 равновероятных исхода.' },
          { q:'Из чисел 1, 2, 3, 4 случайно выбирают одно. Вероятность выбрать число больше 2?', a:'1/2', accepted:fractionAnswers('1/2', '0.5'), o:['1/4', '3/4', '1/3'], h:'Подходят числа 3 и 4.', ex:'Благоприятных исходов 2 из 4, значит вероятность равна 2/4 = 1/2.' }
        ]
      },
      {
        subject:'phy',
        id:'numphy8w87y',
        nm:'Числовой ответ: ток и тепло',
        tag:'Числовой ответ: ток и тепло',
        th: THEORY.phy8,
        rows: [
          { q:'Найди силу тока: U = 12 В, R = 3 Ом.', a:'4 А', accepted:unitAnswers('4', 'А'), o:['3 А', '5 А', '6 А'], h:'Используй формулу I = U / R.', ex:'Сила тока равна 12 / 3 = 4 А.' },
          { q:'Сколько теплоты получит 1 кг воды при нагревании на 2 °C? c = 4200 Дж/(кг·°C).', a:'8400 Дж', accepted:unitAnswers('8400', 'Дж'), o:['4200 Дж', '2100 Дж', '840 Дж'], h:'Используй формулу Q = c·m·Δt.', ex:'Q = 4200 · 1 · 2 = 8400 Дж.' },
          { q:'Определи работу тока: P = 60 Вт, t = 5 с.', a:'300 Дж', accepted:unitAnswers('300', 'Дж'), o:['120 Дж', '240 Дж', '360 Дж'], h:'Работа равна произведению мощности на время.', ex:'A = 60 · 5 = 300 Дж.' },
          { q:'Найди сопротивление участка цепи: U = 18 В, I = 3 А.', a:'6 Ом', accepted:unitAnswers('6', 'Ом'), o:['3 Ом', '9 Ом', '15 Ом'], h:'Используй формулу R = U / I.', ex:'Сопротивление равно 18 / 3 = 6 Ом.' },
          { q:'Лампочка потребляет 40 Вт в течение 10 секунд. Сколько энергии израсходовано?', a:'400 Дж', accepted:unitAnswers('400', 'Дж'), o:['40 Дж', '200 Дж', '800 Дж'], h:'Энергия равна A = P·t.', ex:'За 10 секунд при мощности 40 Вт расходуется 40 · 10 = 400 Дж.' }
        ]
      },
      {
        subject:'chem',
        id:'numchem8w87y',
        nm:'Числовой ответ: формулы и состав вещества',
        tag:'Числовой ответ: формулы и состав вещества',
        th: THEORY.chem8,
        rows: [
          { q:'Чему равна относительная молекулярная масса H₂O?', a:'18', o:['16', '20', '22'], h:'Сложи атомные массы двух атомов водорода и одного атома кислорода.', ex:'Mᵣ(H₂O) = 2·1 + 16 = 18.' },
          { q:'Сколько атомов водорода в формуле H₂SO₄?', a:'2', o:['1', '4', '6'], h:'Индекс после символа показывает число атомов.', ex:'У водорода индекс 2, значит атомов водорода два.' },
          { q:'Сколько процентов соли в растворе, если взяли 10 г соли и 90 г воды?', a:'10%', accepted:percentAnswers('10'), o:['5%', '20%', '50%'], h:'Сначала найди массу всего раствора.', ex:'Масса раствора 100 г, поэтому массовая доля соли равна 10/100 · 100% = 10%.' },
          { q:'Какова валентность кислорода в оксидах?', a:'2', o:['1', '3', '4'], h:'Это одно из базовых постоянных правил школьной химии.', ex:'Кислород в оксидах обычно двухвалентен.' },
          { q:'Чему равна относительная молекулярная масса CO₂?', a:'44', o:['28', '32', '48'], h:'Углерод имеет относительную атомную массу 12, кислород — 16.', ex:'Mᵣ(CO₂) = 12 + 2·16 = 44.' }
        ]
      }
    ],
    '9': [
      {
        subject:'alg',
        id:'numalg9w87y',
        nm:'Числовой ответ: квадратные уравнения и прогрессии',
        tag:'Числовой ответ: квадратные уравнения и прогрессии',
        th: THEORY.alg9,
        rows: [
          { q:'Найди меньший корень уравнения x² − 5x + 6 = 0.', a:'2', o:['1', '3', '6'], h:'Разложи квадратный трёхчлен на множители.', ex:'x² − 5x + 6 = (x − 2)(x − 3), значит корни 2 и 3, меньший — 2.' },
          { q:'Арифметическая прогрессия: 7, 11, 15, ... Чему равен пятый член?', a:'23', o:['19', '21', '27'], h:'Разность прогрессии равна 4.', ex:'a₅ = 7 + 4·(5 − 1) = 23.' },
          { q:'Геометрическая прогрессия: 2, 6, 18, ... Чему равен четвёртый член?', a:'54', o:['36', '72', '108'], h:'Знаменатель прогрессии равен 3.', ex:'b₄ = 2 · 3³ = 54.' },
          { q:'Найди значение x², если x = −3.', a:'9', o:['−9', '6', '12'], h:'При возведении отрицательного числа в квадрат получается положительное.', ex:'(−3)² = 9.' },
          { q:'Найди дискриминант уравнения x² − 4x + 3 = 0.', a:'4', o:['1', '8', '16'], h:'Используй формулу D = b² − 4ac.', ex:'D = (−4)² − 4·1·3 = 16 − 12 = 4.' }
        ]
      },
      {
        subject:'phy',
        id:'numphy9w87y',
        nm:'Числовой ответ: механика и волны',
        tag:'Числовой ответ: механика и волны',
        th: THEORY.phy9,
        rows: [
          { q:'Тело прошло 150 м за 30 с. Найди скорость.', a:'5 м/с', accepted:unitAnswers('5', 'м/с'), o:['3 м/с', '6 м/с', '10 м/с'], h:'Используй формулу v = s / t.', ex:'Скорость равна 150 / 30 = 5 м/с.' },
          { q:'Найди силу: m = 2 кг, a = 3 м/с².', a:'6 Н', accepted:unitAnswers('6', 'Н'), o:['3 Н', '5 Н', '8 Н'], h:'Используй второй закон Ньютона.', ex:'F = m·a = 2 · 3 = 6 Н.' },
          { q:'Найди импульс тела: m = 3 кг, v = 4 м/с.', a:'12 кг·м/с', accepted:unitAnswers('12', 'кг·м/с'), o:['7 кг·м/с', '10 кг·м/с', '14 кг·м/с'], h:'Импульс равен p = m·v.', ex:'Импульс тела равен 3 · 4 = 12 кг·м/с.' },
          { q:'Частота волны 2 Гц. Чему равен период?', a:'1/2', accepted:fractionAnswers('1/2', '0.5'), o:['1/4', '1', '2'], h:'Период и частота связаны формулой T = 1 / ν.', ex:'При ν = 2 Гц период T = 1 / 2 с.' },
          { q:'Какую работу совершает сила 10 Н на пути 4 м?', a:'40 Дж', accepted:unitAnswers('40', 'Дж'), o:['10 Дж', '20 Дж', '80 Дж'], h:'Для постоянной силы A = F·s.', ex:'Работа равна 10 · 4 = 40 Дж.' }
        ]
      },
      {
        subject:'chem',
        id:'numchem9w87y',
        nm:'Числовой ответ: ионы и расчёты',
        tag:'Числовой ответ: ионы и расчёты',
        th: THEORY.chem9,
        rows: [
          { q:'Чему равна относительная молекулярная масса CO₂?', a:'44', o:['28', '32', '48'], h:'Сложи массы одного атома углерода и двух атомов кислорода.', ex:'Mᵣ(CO₂) = 12 + 2·16 = 44.' },
          { q:'Какова степень окисления кислорода в большинстве соединений?', a:'-2', o:['-1', '+2', '+6'], h:'Это одно из базовых правил школьной химии.', ex:'В большинстве соединений кислород имеет степень окисления −2.' },
          { q:'Сколько атомов водорода в молекуле C₂H₆?', a:'6', o:['2', '4', '8'], h:'Смотри на индекс после H.', ex:'В формуле C₂H₆ у водорода индекс 6, значит атомов шесть.' },
          { q:'Каков заряд сульфат-иона SO₄?', a:'-2', o:['-1', '+1', '+2'], h:'Сульфат-ион — один из стандартных многоатомных ионов.', ex:'Сульфат-ион SO₄ имеет заряд −2.' },
          { q:'Сколько процентов соли в растворе, если в 200 г раствора содержится 20 г соли?', a:'10%', accepted:percentAnswers('10'), o:['5%', '15%', '20%'], h:'Используй формулу массовой доли.', ex:'20 / 200 · 100% = 10%.' }
        ]
      }
    ],
    '10': [
      {
        subject:'alg',
        id:'numalg10w87y',
        nm:'Числовой ответ: логарифмы и тригонометрия',
        tag:'Числовой ответ: логарифмы и тригонометрия',
        th: THEORY.alg10,
        rows: [
          { q:'Вычисли log₂8.', a:'3', o:['2', '4', '8'], h:'Подумай, в какую степень нужно возвести 2, чтобы получить 8.', ex:'2³ = 8, значит log₂8 = 3.' },
          { q:'Реши уравнение 3ˣ = 81.', a:'4', o:['3', '5', '9'], h:'Представь 81 как степень тройки.', ex:'81 = 3⁴, поэтому x = 4.' },
          { q:'Найди sin 30°.', a:'1/2', accepted:fractionAnswers('1/2', '0.5'), o:['√3/2', '1', '0'], h:'Это табличное значение.', ex:'Для угла 30° синус равен 1/2.' },
          { q:'Найди cos 60°.', a:'1/2', accepted:fractionAnswers('1/2', '0.5'), o:['√3/2', '1', '0'], h:'Это табличное значение.', ex:'Для угла 60° косинус равен 1/2.' },
          { q:'Реши уравнение 2^(x + 1) = 16.', a:'3', o:['2', '4', '5'], h:'Представь 16 как степень двойки.', ex:'16 = 2⁴, значит x + 1 = 4 и x = 3.' }
        ]
      },
      {
        subject:'prob',
        id:'numprob10w87y',
        nm:'Числовой ответ: вероятность и комбинаторика',
        tag:'Числовой ответ: вероятность и комбинаторика',
        th: THEORY.prob10,
        rows: [
          { q:'Сколько различных пар можно выбрать из 4 учеников?', a:'6', o:['4', '8', '12'], h:'Это сочетания из 4 по 2.', ex:'C(4, 2) = 6, значит можно составить 6 различных пар.' },
          { q:'Кубик бросают один раз. Вероятность получить число больше 4?', a:'1/3', accepted:fractionAnswers('1/3', '0.333333'), o:['1/2', '1/6', '2/3'], h:'Подходят только 5 и 6.', ex:'Благоприятных исходов 2 из 6, значит вероятность равна 2/6 = 1/3.' },
          { q:'Сколько исходов у двух подбрасываний монеты?', a:'4', o:['2', '3', '8'], h:'Перечисли варианты двух бросков.', ex:'ОО, ОР, РО, РР — всего 4 исхода.' },
          { q:'В урне 3 красных и 1 синий шар. Вероятность вытянуть красный шар?', a:'3/4', accepted:fractionAnswers('3/4', '0.75'), o:['1/4', '1/2', '2/3'], h:'Красных шаров три из четырёх.', ex:'Вероятность вытянуть красный шар равна 3/4.' },
          { q:'Найди среднее арифметическое чисел 4, 6 и 8.', a:'6', o:['5', '7', '8'], h:'Сумму нужно разделить на число слагаемых.', ex:'(4 + 6 + 8) / 3 = 18 / 3 = 6.' }
        ]
      },
      {
        subject:'phy',
        id:'numphy10w87y',
        nm:'Числовой ответ: энергия, давление и работа',
        tag:'Числовой ответ: энергия, давление и работа',
        th: THEORY.phy10,
        rows: [
          { q:'Найди кинетическую энергию тела: m = 2 кг, v = 3 м/с.', a:'9 Дж', accepted:unitAnswers('9', 'Дж'), o:['6 Дж', '12 Дж', '18 Дж'], h:'Используй формулу Eₖ = m·v² / 2.', ex:'Eₖ = 2 · 3² / 2 = 9 Дж.' },
          { q:'Найди давление, если F = 40 Н, S = 0,2 м².', a:'200 Па', accepted:unitAnswers('200', 'Па'), o:['8 Па', '20 Па', '400 Па'], h:'Используй формулу p = F / S.', ex:'p = 40 / 0,2 = 200 Па.' },
          { q:'Газ совершил работу при постоянном давлении 100 кПа и увеличении объёма на 0,02 м³. Чему равна работа?', a:'2000 Дж', accepted:unitAnswers('2000', 'Дж'), o:['200 Дж', '500 Дж', '10000 Дж'], h:'Переведи кПа в Па и используй A = p·ΔV.', ex:'100 кПа = 100000 Па, поэтому A = 100000 · 0,02 = 2000 Дж.' },
          { q:'Определи количество теплоты: c = 4200 Дж/(кг·°C), m = 0,5 кг, Δt = 4 °C.', a:'8400 Дж', accepted:unitAnswers('8400', 'Дж'), o:['4200 Дж', '16800 Дж', '2100 Дж'], h:'Используй формулу Q = c·m·Δt.', ex:'Q = 4200 · 0,5 · 4 = 8400 Дж.' },
          { q:'Найди ускорение тела, если F = 12 Н, m = 3 кг.', a:'4 м/с²', accepted:unitAnswers('4', 'м/с²'), o:['3 м/с²', '5 м/с²', '9 м/с²'], h:'Используй формулу a = F / m.', ex:'Ускорение равно 12 / 3 = 4 м/с².' }
        ]
      },
      {
        subject:'chem',
        id:'numchem10w87y',
        nm:'Числовой ответ: молярная масса и количество вещества',
        tag:'Числовой ответ: молярная масса и количество вещества',
        th: THEORY.chem10,
        rows: [
          { q:'Чему равна молярная масса NaOH?', a:'40', o:['23', '39', '56'], h:'Сложи атомные массы Na, O и H.', ex:'M(NaOH) = 23 + 16 + 1 = 40 г/моль.' },
          { q:'Сколько молей воды содержится в 18 г H₂O?', a:'1', o:['0,5', '2', '18'], h:'Используй формулу n = m / M.', ex:'Молярная масса воды равна 18 г/моль, поэтому n = 18 / 18 = 1 моль.' },
          { q:'Чему равна степень окисления азота в NH₃?', a:'-3', o:['-2', '+3', '+5'], h:'Сумма степеней окисления в молекуле равна нулю.', ex:'Три атома водорода дают суммарно +3, значит азот имеет степень окисления −3.' },
          { q:'Какова массовая доля соли в растворе, если в 250 г раствора содержится 25 г соли?', a:'10%', accepted:percentAnswers('10'), o:['5%', '15%', '20%'], h:'Массовая доля — это отношение массы растворённого вещества к массе раствора.', ex:'25 / 250 · 100% = 10%.' },
          { q:'Сколько граммов кислорода содержится в 2 моль O₂?', a:'64 г', accepted:unitAnswers('64', 'г'), o:['16 г', '32 г', '96 г'], h:'Сначала найди молярную массу O₂.', ex:'M(O₂) = 32 г/моль, поэтому 2 моль весят 64 г.' }
        ]
      }
    ],
    '11': [
      {
        subject:'alg',
        id:'numalg11w87y',
        nm:'Числовой ответ: производная и интеграл',
        tag:'Числовой ответ: производная и интеграл',
        th: THEORY.alg11,
        rows: [
          { q:'Найди производную функции y = x² в точке x = 3.', a:'6', o:['3', '9', '12'], h:'Сначала найди общую производную функции.', ex:'Производная функции x² равна 2x, а в точке x = 3 получаем 6.' },
          { q:'Вычисли ∫₀² x dx.', a:'2', o:['1', '3', '4'], h:'Найди первообразную и подставь пределы.', ex:'Первообразная x — это x²/2, поэтому [x²/2]₀² = 2.' },
          { q:'Вычисли log₁₀1000.', a:'3', o:['2', '4', '10'], h:'Подумай, в какую степень нужно возвести 10.', ex:'10³ = 1000, значит логарифм равен 3.' },
          { q:'Чему равно ln(e⁴)?', a:'4', o:['1', '2', 'e'], h:'Натуральный логарифм и экспонента взаимно уничтожают друг друга.', ex:'ln(e⁴) = 4.' },
          { q:'Найди производную функции y = 3x + 1.', a:'3', o:['1', '2', '4'], h:'Производная линейной функции ax + b равна a.', ex:'Для y = 3x + 1 производная постоянна и равна 3.' }
        ]
      },
      {
        subject:'prob',
        id:'numprob11w87y',
        nm:'Числовой ответ: вероятность и статистика',
        tag:'Числовой ответ: вероятность и статистика',
        th: THEORY.prob11,
        rows: [
          { q:'Вычисли C(5, 2).', a:'10', o:['5', '8', '20'], h:'Это число сочетаний из 5 по 2.', ex:'C(5, 2) = 5·4 / 2 = 10.' },
          { q:'Какова вероятность ровно одного орла при двух бросках монеты?', a:'1/2', accepted:fractionAnswers('1/2', '0.5'), o:['1/4', '3/4', '1'], h:'Подходят исходы ОР и РО.', ex:'Благоприятных исходов 2 из 4, поэтому вероятность равна 1/2.' },
          { q:'Чему равно математическое ожидание результата честного кубика?', a:'3,5', accepted:numericTextVariants('3,5'), o:['3', '4', '4,5'], h:'Это среднее арифметическое чисел от 1 до 6.', ex:'(1 + 2 + 3 + 4 + 5 + 6) / 6 = 3,5.' },
          { q:'В урне 4 красных и 6 синих шаров. Вероятность достать красный шар?', a:'2/5', accepted:fractionAnswers('2/5', '0.4'), o:['1/2', '3/5', '2/3'], h:'Красных шаров 4 из 10.', ex:'Вероятность равна 4/10 = 2/5.' },
          { q:'Найди медиану набора 1, 1, 3, 9.', a:'2', o:['1', '3', '5'], h:'Для чётного числа элементов медиана — среднее двух центральных.', ex:'Средние элементы — 1 и 3, поэтому медиана равна 2.' }
        ]
      },
      {
        subject:'phy',
        id:'numphy11w87y',
        nm:'Числовой ответ: цепи, линзы и волны',
        tag:'Числовой ответ: цепи, линзы и волны',
        th: THEORY.phy11,
        rows: [
          { q:'Два резистора 2 Ом и 3 Ом соединены последовательно. Чему равно общее сопротивление?', a:'5 Ом', accepted:unitAnswers('5', 'Ом'), o:['1 Ом', '6 Ом', '12 Ом'], h:'При последовательном соединении сопротивления складываются.', ex:'R = 2 + 3 = 5 Ом.' },
          { q:'При напряжении 24 В и сопротивлении 6 Ом найди силу тока.', a:'4 А', accepted:unitAnswers('4', 'А'), o:['3 А', '5 А', '6 А'], h:'Используй закон Ома: I = U / R.', ex:'I = 24 / 6 = 4 А.' },
          { q:'Найди мощность цепи: U = 12 В, I = 2 А.', a:'24 Вт', accepted:unitAnswers('24', 'Вт'), o:['6 Вт', '12 Вт', '36 Вт'], h:'Мощность равна P = U·I.', ex:'P = 12 · 2 = 24 Вт.' },
          { q:'Оптическая сила линзы 2 дптр. Чему равно фокусное расстояние?', a:'0,5 м', accepted:uniq(unitAnswers('0,5', 'м').concat(unitAnswers('1/2', 'м'))), o:['0,25 м', '1 м', '2 м'], h:'Используй связь D = 1 / f.', ex:'Если D = 2 дптр, то f = 1 / 2 м = 0,5 м.' },
          { q:'Электромагнитная волна имеет частоту 6·10⁸ Гц. Чему равна длина волны? (c = 3·10⁸ м/с)', a:'0,5 м', accepted:uniq(unitAnswers('0,5', 'м').concat(unitAnswers('1/2', 'м'))), o:['0,25 м', '1 м', '2 м'], h:'Используй формулу λ = c / ν.', ex:'λ = 3·10⁸ / 6·10⁸ = 0,5 м.' }
        ]
      },
      {
        subject:'chem',
        id:'numchem11w87y',
        nm:'Числовой ответ: pH, степени окисления и моли',
        tag:'Числовой ответ: pH, степени окисления и моли',
        th: THEORY.chem11,
        rows: [
          { q:'Чему равен pH раствора, если [H⁺] = 10⁻³ моль/л?', a:'3', o:['−3', '1', '7'], h:'pH равен минус логарифму концентрации ионов водорода.', ex:'Если [H⁺] = 10⁻³, то pH = 3.' },
          { q:'Какова степень окисления марганца в KMnO₄?', a:'7', o:['2', '4', '6'], h:'Калий даёт +1, кислород — по −2.', ex:'Сумма степеней окисления равна 0, поэтому марганец имеет степень окисления +7.' },
          { q:'Чему равна молярная масса CH₃COOH?', a:'60', o:['44', '58', '74'], h:'Сложи атомные массы всех атомов в молекуле.', ex:'2 атома углерода дают 24, 4 атома водорода — 4, 2 атома кислорода — 32, всего 60 г/моль.' },
          { q:'Сколько граммов кислорода содержится в 2 моль O₂?', a:'64 г', accepted:unitAnswers('64', 'г'), o:['16 г', '32 г', '96 г'], h:'Найди молярную массу O₂ и умножь на количество вещества.', ex:'M(O₂) = 32 г/моль, а 2 моль весят 64 г.' },
          { q:'Сколько молей газа занимает 22,4 л при н.у.?', a:'1', o:['0,5', '2', '22,4'], h:'При нормальных условиях 22,4 л газа соответствуют 1 молю.', ex:'По молярному объёму газа 22,4 л при н.у. — это 1 моль.' }
        ]
      }
    ]
  };

  var applied = [];
  (TOPICS[grade] || []).forEach(function(meta){
    var topic = {
      id: meta.id,
      nm: meta.nm,
      th: meta.th,
      dot: (STYLES[meta.subject] && STYLES[meta.subject].color) || '#2563eb',
      gen: function(){ return buildInputQuestion(meta, pickOne(meta.rows)); }
    };
    if (ensureTopic(meta.subject, topic)) {
      applied.push({ grade:grade, subject:meta.subject, topicId:meta.id, rows:meta.rows.length });
    }
  });

  window.__wave87yFreeInputBanks = {
    version: 'wave87y',
    grade: grade,
    topics: applied,
    topicCount: applied.length,
    rowCount: applied.reduce(function(sum, item){ return sum + (item.rows || 0); }, 0)
  };
})();


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


/* --- wave88b: explicit multi-select banks for grades 8-11 --- */
(function(){
  'use strict';
  var grade = String(window.GRADE_NUM || '');
  if (!/^(8|9|10|11)$/.test(grade) || !Array.isArray(window.SUBJ)) return;

  var STYLES = {
    bio: { color:'#16a34a', bg:'#dcfce7' },
    his: { color:'#ea580c', bg:'#fff7ed' },
    chem:{ color:'#0d9488', bg:'#ccfbf1' },
    soc: { color:'#7c3aed', bg:'#ede9fe' },
    inf: { color:'#2563eb', bg:'#dbeafe' },
    rus: { color:'#dc2626', bg:'#fee2e2' }
  };
  var THEORY = {
    bio8: '<h3>Множественный выбор: признаки и функции</h3><p>В таких вопросах нужно отметить <b>все верные признаки</b>, а не один «самый похожий» ответ.</p><div class="fm">Сначала вспомни определение класса или органоида, затем по одному проверяй каждый вариант.</div><div class="ex">Если вариант верен только частично или «иногда», его обычно не нужно отмечать.</div>',
    his8: '<h3>Множественный выбор: явления и реформы</h3><p>Отмечай только те пункты, которые действительно относятся к указанному историческому процессу.</p><div class="fm">Удобно искать три опоры: время, признаки явления и конкретные последствия.</div>',
    chem9: '<h3>Множественный выбор: классы веществ и признаки реакций</h3><p>Здесь нужно быстро различать <b>кислоты, основания, оксиды</b> и типичные признаки химической реакции.</p><div class="fm">Смотри на формулу, состав и поведение вещества, а не на знакомые буквы в записи.</div>',
    soc9: '<h3>Множественный выбор: общество и государство</h3><p>Выбирай все признаки понятия, а не только самый очевидный.</p><div class="fm">Правильные варианты обычно описывают сущность явления, а неверные — его искажают или относятся к другой теме.</div>',
    inf10: '<h3>Множественный выбор: информатика</h3><p>Часть заданий требует отметить <b>несколько верных свойств</b> алгоритма, формата или устройства.</p><div class="fm">Проверь каждый вариант отдельно: относится ли он к теме, не перепутан ли с соседним понятием.</div>',
    soc10: '<h3>Множественный выбор: экономика и политика</h3><p>Сначала вспомни определение, затем отмечай только те признаки, которые из него прямо следуют.</p><div class="fm">В таких вопросах часто ловят на похожих, но лишних характеристиках.</div>',
    rus11: '<h3>Множественный выбор: текст и выразительность</h3><p>В ответе может быть 2–3 верных пункта. Сначала вспомни термин, затем проверь каждый пример отдельно.</p><div class="fm">Если пункт относится к грамматике, а вопрос про тропы, его выбирать не нужно.</div>',
    bio11: '<h3>Множественный выбор: эволюция и клетка</h3><p>Отмечай только те процессы и признаки, которые действительно связаны с указанным биологическим явлением.</p><div class="fm">Полезно задавать себе вопрос: это причина, механизм или просто соседнее понятие?</div>'
  };

  function asText(value){ return String(value == null ? '' : value); }
  function uniq(list){
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = asText(item).trim();
      if (!value || out.indexOf(value) !== -1) return;
      out.push(value);
    });
    return out;
  }
  function clone(list){ return Array.isArray(list) ? list.slice() : []; }
  function findSubject(id){
    var list = Array.isArray(window.SUBJ) ? window.SUBJ : [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }
  function ensureTopic(subjectId, topic){
    var subject = findSubject(subjectId);
    if (!subject || !topic || !topic.id || typeof topic.gen !== 'function') return false;
    subject.tops = Array.isArray(subject.tops) ? subject.tops : [];
    var existing = null;
    for (var i = 0; i < subject.tops.length; i++) {
      if (subject.tops[i] && subject.tops[i].id === topic.id) { existing = subject.tops[i]; break; }
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
  function combinations(list, size){
    var src = clone(list);
    var out = [];
    function walk(start, acc){
      if (acc.length === size) { out.push(acc.slice()); return; }
      for (var i = start; i <= src.length - (size - acc.length); i++) {
        acc.push(src[i]);
        walk(i + 1, acc);
        acc.pop();
      }
    }
    if (size > 0 && src.length >= size) walk(0, []);
    return out;
  }
  function intersectionCount(a, b){
    var count = 0;
    clone(a).forEach(function(item){ if (b.indexOf(item) !== -1) count += 1; });
    return count;
  }
  function canonicalAnswers(options, correct){
    var all = uniq(options);
    var good = uniq(correct);
    return all.filter(function(item){ return good.indexOf(item) !== -1; });
  }
  function serialize(values){ return uniq(values).join(' | '); }
  function fallbackCombos(options, correct){
    var all = uniq(options);
    var good = canonicalAnswers(all, correct);
    var answer = serialize(good);
    var combos = combinations(all, good.length).filter(function(combo){ return serialize(combo) !== answer; });
    combos.sort(function(a, b){
      var scoreA = intersectionCount(a, good);
      var scoreB = intersectionCount(b, good);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return serialize(a).localeCompare(serialize(b), 'ru');
    });
    var out = [answer];
    for (var i = 0; i < combos.length && out.length < 4; i++) out.push(serialize(combos[i]));
    while (out.length < 4) out.push('вариант ' + (out.length + 1));
    return uniq(out).slice(0, 4);
  }
  function buildQuestion(meta, row){
    var style = STYLES[meta.subject] || { color:'#2563eb', bg:'#dbeafe' };
    var all = uniq(row.options);
    var correct = canonicalAnswers(all, row.correct);
    var answer = serialize(correct);
    var options = fallbackCombos(all, correct);
    var question = typeof mkQ === 'function'
      ? mkQ(row.q, answer, options, row.h, meta.tag, style.color, style.bg, null, !!row.isMath, row.ex)
      : { question:row.q, answer:answer, options:options, hint:row.h, tag:meta.tag, color:style.color, bg:style.bg, isMath:!!row.isMath, ex:row.ex };
    question.interactionType = 'multi-select';
    question.multiSelectOptions = all.slice();
    question.multiSelectAnswers = correct.slice();
    question.multiSelectMin = Number(row.min || correct.length) || correct.length;
    question.multiSelectMax = Number(row.max || correct.length) || correct.length;
    question.options = fallbackCombos(all, correct);
    question.answer = answer;
    question.ex = asText(row.ex || '');
    return question;
  }
  function topic(meta){
    var index = 0;
    var rows = clone(meta.rows);
    return {
      id: meta.id,
      nm: meta.nm,
      dot: (STYLES[meta.subject] && STYLES[meta.subject].color) || '#2563eb',
      th: meta.th,
      gen: function(){
        if (!rows.length) return buildQuestion(meta, { q:'Нет данных', options:['1','2','3','4','5','6'], correct:['1','2'], h:'', ex:'' });
        var row = rows[index % rows.length];
        index += 1;
        return buildQuestion(meta, row);
      }
    };
  }

  var TOPICS = {
    '8': [
      {
        subject:'bio',
        id:'multibio8w88b',
        nm:'Множественный выбор: биология',
        tag:'Множественный выбор: биология',
        th: THEORY.bio8,
        rows: [
          {
            q:'Какие признаки характерны для млекопитающих?',
            options:['вскармливают детёнышей молоком','тело покрыто шерстью','дышат лёгкими','откладывают икру во внешнюю среду','имеют жабры во взрослом состоянии','температура тела полностью зависит от среды'],
            correct:['вскармливают детёнышей молоком','тело покрыто шерстью','дышат лёгкими'],
            h:'Вспомни основные признаки класса млекопитающих.',
            ex:'Для млекопитающих характерны вскармливание молоком, волосяной покров и лёгочное дыхание.'
          },
          {
            q:'Какие структуры обычно есть в растительной клетке, но нет в животной?',
            options:['клеточная стенка','крупная центральная вакуоль','хлоропласты','ядро','митохондрии','рибосомы'],
            correct:['клеточная стенка','крупная центральная вакуоль','хлоропласты'],
            h:'Ищи признаки именно растительной клетки.',
            ex:'Клеточная стенка, большая вакуоль и хлоропласты — отличительные признаки растительной клетки.'
          },
          {
            q:'Что необходимо для фотосинтеза?',
            options:['свет','углекислый газ','вода','кислород как исходное вещество','хлорид натрия','азот воздуха как основной реагент'],
            correct:['свет','углекислый газ','вода'],
            h:'Вспомни исходные вещества и условие процесса.',
            ex:'Для фотосинтеза нужны свет, вода и углекислый газ; кислород при этом выделяется как продукт.'
          },
          {
            q:'Какие признаки относятся к земноводным?',
            options:['размножаются в воде','кожа голая и влажная','личинки дышат жабрами','тело покрыто перьями','постоянная температура тела','обязательное развитие в яйце с твёрдой скорлупой'],
            correct:['размножаются в воде','кожа голая и влажная','личинки дышат жабрами'],
            h:'Подумай о среде жизни и развитии земноводных.',
            ex:'Для земноводных характерны размножение в воде, влажная кожа и личиночная стадия с жаберным дыханием.'
          },
          {
            q:'Какие азотистые основания входят в состав ДНК?',
            options:['аденин','тимин','цитозин','урацил','рибоза','хлорофилл'],
            correct:['аденин','тимин','цитозин'],
            h:'Урацил относится к РНК, а не к ДНК.',
            ex:'В ДНК входят аденин, тимин, цитозин и гуанин; урацил характерен для РНК.'
          },
          {
            q:'Что относится к функциям корня растения?',
            options:['закрепляет растение в почве','всасывает воду и минеральные вещества','может запасать питательные вещества','образует плоды','обеспечивает половое размножение','выполняет основной фотосинтез в большинстве растений'],
            correct:['закрепляет растение в почве','всасывает воду и минеральные вещества','может запасать питательные вещества'],
            h:'Корень работает в почве, а не как цветок или плод.',
            ex:'Корень закрепляет растение, поглощает воду и минеральные вещества, а у некоторых растений ещё и запасает питательные вещества.'
          }
        ]
      },
      {
        subject:'his',
        id:'multihis8w88b',
        nm:'Множественный выбор: история',
        tag:'Множественный выбор: история',
        th: THEORY.his8,
        rows: [
          {
            q:'Какие признаки характерны для промышленного переворота?',
            options:['машинное производство','рост фабрик и заводов','переход от мануфактуры к фабрике','господство натурального хозяйства','сокращение роли городов','отказ от паровых машин'],
            correct:['машинное производство','рост фабрик и заводов','переход от мануфактуры к фабрике'],
            h:'Вспомни, что меняется в производстве во время промышленного переворота.',
            ex:'Промышленный переворот связан с внедрением машин, ростом фабрик и переходом от мануфактур к фабричному производству.'
          },
          {
            q:'Какие последствия Великих географических открытий были важными?',
            options:['расширение мировой торговли','создание колониальных империй','обмен товарами и культурными влияниями между континентами','полное прекращение мореплавания','исчезновение европейских городов','отказ от денежного обращения'],
            correct:['расширение мировой торговли','создание колониальных империй','обмен товарами и культурными влияниями между континентами'],
            h:'Подумай о торговле, колониях и глобальных связях.',
            ex:'Великие географические открытия расширили мировую торговлю, способствовали созданию колониальных империй и ускорили обмен товарами и идеями.'
          },
          {
            q:'Что относится к идеям Просвещения?',
            options:['вера в силу разума','критика абсолютизма','идея естественных прав человека','защита сословных привилегий как вечных','отказ от образования','требование изолировать науку от общества'],
            correct:['вера в силу разума','критика абсолютизма','идея естественных прав человека'],
            h:'Философы Просвещения подчёркивали права человека и силу знания.',
            ex:'Идеи Просвещения строились на вере в разум, критике произвольной власти и признании естественных прав человека.'
          },
          {
            q:'Какие события связаны с Французской революцией конца XVIII века?',
            options:['падение Бастилии','принятие Декларации прав человека и гражданина','ликвидация сословных привилегий','открытие Америки Колумбом','создание ООН','крещение Руси'],
            correct:['падение Бастилии','принятие Декларации прав человека и гражданина','ликвидация сословных привилегий'],
            h:'Ищи события именно революционного периода во Франции.',
            ex:'К Французской революции относятся падение Бастилии, Декларация прав человека и гражданина и уничтожение сословных привилегий.'
          },
          {
            q:'Какие признаки характерны для конституционной монархии?',
            options:['власть монарха ограничена законом','существует парламент','права граждан закрепляются в законах','монарх единолично издаёт все законы без ограничений','представительный орган отсутствует','монарх избирается на один год'],
            correct:['власть монарха ограничена законом','существует парламент','права граждан закрепляются в законах'],
            h:'Сравни такую монархию с абсолютной.',
            ex:'В конституционной монархии власть монарха ограничена законом, действует парламент, а права граждан фиксируются в нормативных актах.'
          },
          {
            q:'Какие реформы Александра II относят к великим реформам 1860–1870-х годов?',
            options:['отмена крепостного права','судебная реформа','земская реформа','опричнина','введение Табели о рангах','политика военного коммунизма'],
            correct:['отмена крепостного права','судебная реформа','земская реформа'],
            h:'Подумай о либеральных преобразованиях XIX века.',
            ex:'К великим реформам Александра II относятся отмена крепостного права, судебная и земская реформы.'
          }
        ]
      }
    ],
    '9': [
      {
        subject:'chem',
        id:'multichem9w88b',
        nm:'Множественный выбор: химия',
        tag:'Множественный выбор: химия',
        th: THEORY.chem9,
        rows: [
          {
            q:'Какие признаки обычно указывают на химическую реакцию?',
            options:['выделение газа','образование осадка','изменение цвета','изменение формы куска вещества','плавление льда','испарение воды'],
            correct:['выделение газа','образование осадка','изменение цвета'],
            h:'Ищи признаки образования новых веществ.',
            ex:'Выделение газа, осадок и изменение цвета часто сопровождают химическую реакцию, потому что появляются новые вещества.'
          },
          {
            q:'Какие вещества относятся к кислотам?',
            options:['HCl','H₂SO₄','HNO₃','NaOH','CaO','NaCl'],
            correct:['HCl','H₂SO₄','HNO₃'],
            h:'Кислоты обычно начинаются с водорода и содержат кислотный остаток.',
            ex:'HCl, H₂SO₄ и HNO₃ — кислоты; NaOH — основание, CaO — оксид, NaCl — соль.'
          },
          {
            q:'Какие вещества являются основаниями?',
            options:['NaOH','KOH','Ca(OH)₂','HCl','CO₂','Na₂SO₄'],
            correct:['NaOH','KOH','Ca(OH)₂'],
            h:'Основания содержат гидроксогруппу OH.',
            ex:'NaOH, KOH и Ca(OH)₂ относятся к основаниям, потому что содержат гидроксогруппу.'
          },
          {
            q:'Какие вещества относятся к оксидам?',
            options:['CO₂','CaO','SO₃','NaOH','H₂SO₄','NaCl'],
            correct:['CO₂','CaO','SO₃'],
            h:'Оксид — это соединение элемента с кислородом без гидроксогруппы и без кислотного водорода.',
            ex:'CO₂, CaO и SO₃ — оксиды; остальные формулы относятся к другим классам веществ.'
          },
          {
            q:'Какие факторы обычно ускоряют химическую реакцию?',
            options:['повышение температуры','увеличение концентрации реагентов','использование катализатора','уменьшение площади соприкосновения','охлаждение системы','удаление реагентов из смеси'],
            correct:['повышение температуры','увеличение концентрации реагентов','использование катализатора'],
            h:'Подумай, что увеличивает число эффективных столкновений частиц.',
            ex:'Реакции обычно идут быстрее при повышении температуры, росте концентрации и в присутствии катализатора.'
          },
          {
            q:'Для ионной связи характерно, что…',
            options:['она часто возникает между металлом и неметаллом','происходит передача электронов','образуются ионы','электроны всегда становятся общими','такая связь характерна только для газов','в веществе отсутствуют заряженные частицы'],
            correct:['она часто возникает между металлом и неметаллом','происходит передача электронов','образуются ионы'],
            h:'Вспомни отличие ионной связи от ковалентной.',
            ex:'При ионной связи электроны передаются, возникают катионы и анионы; такая связь часто образуется между металлом и неметаллом.'
          }
        ]
      },
      {
        subject:'soc',
        id:'multisoc9w88b',
        nm:'Множественный выбор: обществознание',
        tag:'Множественный выбор: обществознание',
        th: THEORY.soc9,
        rows: [
          {
            q:'Какие признаки характерны для правового государства?',
            options:['верховенство закона','разделение властей','гарантия прав и свобод человека','произвольные решения власти','отсутствие суда','полная власть одного органа'],
            correct:['верховенство закона','разделение властей','гарантия прав и свобод человека'],
            h:'Сравни правовое государство с произвольной властью.',
            ex:'Для правового государства обязательны верховенство закона, разделение властей и гарантия прав человека.'
          },
          {
            q:'Какие права относятся к политическим правам граждан?',
            options:['избирать и быть избранным','участвовать в митингах и собраниях','обращаться в органы власти','право на отдых','право на социальное обеспечение','право на наследование'],
            correct:['избирать и быть избранным','участвовать в митингах и собраниях','обращаться в органы власти'],
            h:'Политические права связаны с участием в управлении государством.',
            ex:'Политические права позволяют гражданину участвовать в общественной и государственной жизни: выбирать, обращаться к власти, участвовать в собраниях.'
          },
          {
            q:'Что относится к формам правления?',
            options:['монархия','республика','федерация','конфедерация','правовое государство','демократия'],
            correct:['монархия','республика'],
            min:2,
            max:2,
            h:'Форма правления отвечает на вопрос, как устроена верховная власть.',
            ex:'К формам правления относятся монархия и республика; федерация и конфедерация относятся к государственному устройству.'
          },
          {
            q:'Какие признаки характерны для рынка?',
            options:['свободный обмен товарами и услугами','конкуренция производителей','цена зависит от спроса и предложения','централизованное распределение всех товаров государством','полный запрет частной собственности','отсутствие денег'],
            correct:['свободный обмен товарами и услугами','конкуренция производителей','цена зависит от спроса и предложения'],
            h:'Рынок основан на обмене и конкуренции.',
            ex:'Рынок предполагает свободный обмен, конкуренцию и ценообразование под влиянием спроса и предложения.'
          },
          {
            q:'Что относится к социальным нормам?',
            options:['мораль','право','обычаи','гравитация','температура кипения воды','химическая реакция'],
            correct:['мораль','право','обычаи'],
            h:'Социальные нормы регулируют поведение людей в обществе.',
            ex:'Мораль, право и обычаи — это социальные нормы; законы природы к ним не относятся.'
          },
          {
            q:'Какие признаки характерны для семьи как социальной группы?',
            options:['совместный быт','родство или брак','взаимная ответственность членов','обязательное членство по паспорту','отсутствие личных связей','существование только на работе'],
            correct:['совместный быт','родство или брак','взаимная ответственность членов'],
            h:'Подумай о личных связях и обязанностях внутри семьи.',
            ex:'Семья как малая социальная группа строится на браке или родстве, совместном быте и взаимной ответственности.'
          }
        ]
      }
    ],
    '10': [
      {
        subject:'inf',
        id:'multiinf10w88b',
        nm:'Множественный выбор: информатика',
        tag:'Множественный выбор: информатика',
        th: THEORY.inf10,
        rows: [
          {
            q:'Какие свойства обязательны для алгоритма?',
            options:['дискретность','определённость','результативность','бесконечность','случайность шагов','необязательность выполнения команд'],
            correct:['дискретность','определённость','результативность'],
            h:'Вспомни базовые свойства алгоритма из теории.',
            ex:'Алгоритм должен быть дискретным, однозначным и приводить к результату за конечное число шагов.'
          },
          {
            q:'Какие устройства относятся к устройствам ввода?',
            options:['клавиатура','сканер','микрофон','монитор','принтер','наушники'],
            correct:['клавиатура','сканер','микрофон'],
            h:'Ищи то, что передаёт данные в компьютер.',
            ex:'Клавиатура, сканер и микрофон вводят данные в компьютер; монитор и принтер данные выводят.'
          },
          {
            q:'Что обычно относится к сетевым протоколам?',
            options:['HTTP','TCP/IP','FTP','JPEG','PNG','MP3'],
            correct:['HTTP','TCP/IP','FTP'],
            h:'Протоколы задают правила сетевого обмена.',
            ex:'HTTP, TCP/IP и FTP — сетевые протоколы; JPEG, PNG и MP3 — форматы данных.'
          },
          {
            q:'Какие утверждения о двоичной системе верны?',
            options:['используются цифры 0 и 1','каждый разряд имеет вес степени двойки','она удобна для работы цифровых устройств','в ней десять цифр','основание системы равно 16','символ A обязательно обозначает число 10'],
            correct:['используются цифры 0 и 1','каждый разряд имеет вес степени двойки','она удобна для работы цифровых устройств'],
            h:'Сопоставь двоичную систему с устройством компьютера.',
            ex:'В двоичной системе только два символа — 0 и 1, разряды имеют веса степеней двойки, а сама система удобна для цифровой техники.'
          },
          {
            q:'Что относится к способам защиты информации?',
            options:['резервное копирование','сложные пароли','антивирусная защита','передача пароля всем знакомым','отключение обновлений безопасности','хранение данных без копий'],
            correct:['резервное копирование','сложные пароли','антивирусная защита'],
            h:'Ищи практики, которые реально повышают безопасность.',
            ex:'Резервное копирование, надёжные пароли и антивирусная защита уменьшают риск потери данных и заражения.'
          },
          {
            q:'Какие форматы относятся к растровой графике?',
            options:['PNG','JPEG','BMP','SVG','HTML','TXT'],
            correct:['PNG','JPEG','BMP'],
            h:'Растровые форматы хранят изображение по пикселям.',
            ex:'PNG, JPEG и BMP — растровые форматы; SVG относится к векторной графике.'
          }
        ]
      },
      {
        subject:'soc',
        id:'multisoc10w88b',
        nm:'Множественный выбор: экономика и политика',
        tag:'Множественный выбор: экономика и политика',
        th: THEORY.soc10,
        rows: [
          {
            q:'Какие признаки характерны для гражданского общества?',
            options:['самостоятельные общественные объединения','независимость частной жизни от государства','активное участие граждан в общественной жизни','полное подчинение всех организаций государству','отсутствие инициативы снизу','запрет на общественные ассоциации'],
            correct:['самостоятельные общественные объединения','независимость частной жизни от государства','активное участие граждан в общественной жизни'],
            h:'Подумай, как общество действует без прямого приказа сверху.',
            ex:'Гражданское общество строится на свободных объединениях, инициативе граждан и относительной автономии частной сферы от государства.'
          },
          {
            q:'Что относится к функциям государства?',
            options:['обеспечение правопорядка','оборона страны','сбор налогов и организация публичных услуг','отмена всех законов','ликвидация образования','упразднение судебной системы'],
            correct:['обеспечение правопорядка','оборона страны','сбор налогов и организация публичных услуг'],
            h:'Государство должно поддерживать общий порядок и систему управления.',
            ex:'К функциям государства относятся обеспечение безопасности и порядка, оборона и организация публичных услуг через систему налогов и институтов.'
          },
          {
            q:'Какие признаки характерны для рыночной экономики?',
            options:['частная собственность','конкуренция','свободное ценообразование','карточное распределение всех товаров','полный запрет предпринимательства','обязательный единый план для каждого предприятия'],
            correct:['частная собственность','конкуренция','свободное ценообразование'],
            h:'Вспомни три базовые опоры рынка.',
            ex:'Рыночная экономика держится на частной собственности, конкуренции и свободном ценообразовании.'
          },
          {
            q:'Какие налоги относятся к прямым?',
            options:['налог на доходы физических лиц','налог на прибыль организаций','имущественный налог','НДС','акциз','таможенная пошлина'],
            correct:['налог на доходы физических лиц','налог на прибыль организаций','имущественный налог'],
            h:'Прямые налоги уплачиваются непосредственно с дохода или имущества.',
            ex:'НДФЛ, налог на прибыль и имущественный налог относятся к прямым; НДС и акцизы — косвенные налоги.'
          },
          {
            q:'Что относится к факторам производства?',
            options:['труд','земля','капитал','только деньги покупателя','слава компании','готовый товар на полке'],
            correct:['труд','земля','капитал'],
            h:'Это ресурсы, которые нужны для выпуска товаров и услуг.',
            ex:'Классические факторы производства — труд, земля и капитал.'
          },
          {
            q:'Какие признаки характерны для федеративного государства?',
            options:['разделение полномочий между центром и субъектами','наличие субъектов федерации','единая конституционная система при сочетании уровней власти','полное отсутствие региональных органов','существование только одной местной общины','монарх выбирается парламентом'],
            correct:['разделение полномочий между центром и субъектами','наличие субъектов федерации','единая конституционная система при сочетании уровней власти'],
            h:'Сравни федерацию с унитарным государством.',
            ex:'Федерация предполагает субъекты, разделение полномочий и единую систему государства при сохранении регионального уровня власти.'
          }
        ]
      }
    ],
    '11': [
      {
        subject:'rus',
        id:'multirus11w88b',
        nm:'Множественный выбор: русский язык',
        tag:'Множественный выбор: русский язык',
        th: THEORY.rus11,
        rows: [
          {
            q:'Какие средства относятся к тропам?',
            options:['метафора','эпитет','олицетворение','подлежащее','грамматическая основа','обращение'],
            correct:['метафора','эпитет','олицетворение'],
            h:'Тропы создают образность речи.',
            ex:'Метафора, эпитет и олицетворение относятся к тропам; подлежащее и обращение — не тропы.'
          },
          {
            q:'Какие признаки характерны для рассуждения как типа речи?',
            options:['наличие тезиса','аргументы или доказательства','вывод','обязательное описание внешности','только последовательность действий','простое перечисление предметов'],
            correct:['наличие тезиса','аргументы или доказательства','вывод'],
            h:'Рассуждение строится как логическая цепочка.',
            ex:'Рассуждение включает тезис, аргументы и вывод; это не описание и не повествование.'
          },
          {
            q:'Какие средства связи предложений в тексте относятся к лексическим?',
            options:['лексический повтор','синонимы','однокоренные слова','союзы','интонация','порядок слов'],
            correct:['лексический повтор','синонимы','однокоренные слова'],
            h:'Лексические средства связаны со словарным составом текста.',
            ex:'Повтор, синонимы и однокоренные слова обеспечивают лексическую связность текста.'
          },
          {
            q:'Какие слова могут быть вводными в предложении?',
            options:['конечно','по-моему','во-первых','дом','идти','красивый'],
            correct:['конечно','по-моему','во-первых'],
            h:'Вводные слова выражают отношение говорящего и не являются членами предложения.',
            ex:'«Конечно», «по-моему», «во-первых» могут быть вводными словами и обычно выделяются запятыми.'
          },
          {
            q:'Какие признаки характерны для публицистического стиля?',
            options:['общественно значимая тематика','воздействие на читателя','сочетание логичности и экспрессии','обязательное использование только формул','полное отсутствие оценки','строгая секретность текста'],
            correct:['общественно значимая тематика','воздействие на читателя','сочетание логичности и экспрессии'],
            h:'Публицистика не только сообщает, но и убеждает.',
            ex:'Публицистический стиль обращён к обществу, стремится воздействовать на читателя и сочетает логичность с выразительностью.'
          },
          {
            q:'Какие выразительные средства построены на повторе?',
            options:['анафора','эпифора','лексический повтор','метонимия','гипербола','сравнение'],
            correct:['анафора','эпифора','лексический повтор'],
            h:'Ищи средства, где важен повтор слова или конструкции.',
            ex:'Анафора, эпифора и лексический повтор прямо основаны на повторе.'
          }
        ]
      },
      {
        subject:'bio',
        id:'multibio11w88b',
        nm:'Множественный выбор: биология 11 класса',
        tag:'Множественный выбор: биология 11 класса',
        th: THEORY.bio11,
        rows: [
          {
            q:'Какие процессы обеспечивают наследственную изменчивость?',
            options:['мутации','кроссинговер','независимое расхождение хромосом в мейозе','митоз без ошибок','вегетативное размножение как копирование','только рост организма'],
            correct:['мутации','кроссинговер','независимое расхождение хромосом в мейозе'],
            h:'Ищи механизмы, которые меняют сочетание наследственного материала.',
            ex:'Наследственную изменчивость обеспечивают мутации, кроссинговер и независимое расхождение хромосом при мейозе.'
          },
          {
            q:'Что относится к экологическим факторам среды?',
            options:['температура','влажность','взаимоотношения организмов','генетический код','количество хромосом в гамете','скорость транскрипции в клетке'],
            correct:['температура','влажность','взаимоотношения организмов'],
            h:'Экологические факторы действуют на организм извне.',
            ex:'Температура, влажность и биотические отношения между организмами относятся к экологическим факторам среды.'
          },
          {
            q:'Какие положения верны для естественного отбора?',
            options:['сохраняет полезные наследственные признаки','действует на фенотипические проявления','ведёт к приспособленности популяций','создаёт признаки по потребности организма','происходит только у домашних животных','не связан с наследственностью'],
            correct:['сохраняет полезные наследственные признаки','действует на фенотипические проявления','ведёт к приспособленности популяций'],
            h:'Естественный отбор не создаёт признак «по желанию».',
            ex:'Естественный отбор сохраняет наследственные преимущества и повышает приспособленность популяций через отбор фенотипически проявившихся признаков.'
          },
          {
            q:'Какие признаки характерны для мейоза?',
            options:['два последовательных деления','образуются гаметы или споры','число хромосом уменьшается вдвое','образуются две одинаковые диплоидные клетки','кроссинговер невозможен','происходит только в соматических клетках'],
            correct:['два последовательных деления','образуются гаметы или споры','число хромосом уменьшается вдвое'],
            h:'Сравни мейоз с митозом.',
            ex:'Мейоз включает два деления, ведёт к уменьшению числа хромосом и образованию гаплоидных клеток — гамет или спор.'
          },
          {
            q:'Что относится к доказательствам эволюции?',
            options:['палеонтологические данные','сравнительно-анатомические данные','эмбриологические данные','таблица умножения','правила орфографии','климатический пояс региона'],
            correct:['палеонтологические данные','сравнительно-анатомические данные','эмбриологические данные'],
            h:'Ищи научные данные, подтверждающие историческое развитие живого мира.',
            ex:'Палеонтологические, сравнительно-анатомические и эмбриологические данные относятся к классическим доказательствам эволюции.'
          },
          {
            q:'Какие функции выполняет АТФ в клетке?',
            options:['накопление энергии','перенос энергии','обеспечение энергией синтеза веществ','хранение наследственной информации','образование клеточной стенки у животных','перенос кислорода в крови'],
            correct:['накопление энергии','перенос энергии','обеспечение энергией синтеза веществ'],
            h:'АТФ — универсальный энергетический носитель клетки.',
            ex:'АТФ запасает и переносит энергию и обеспечивает энергией многие клеточные процессы, включая синтез веществ.'
          }
        ]
      }
    ]
  };

  var injected = [];
  (TOPICS[grade] || []).forEach(function(def){
    var built = topic(def);
    if (ensureTopic(def.subject, built)) injected.push(def.id);
  });

  window.__wave88bMultiSelectBanks = {
    version:'wave88b',
    grade:grade,
    topicCount: injected.length,
    rowCount: (TOPICS[grade] || []).reduce(function(sum, def){ return sum + ((def.rows && def.rows.length) || 0); }, 0),
    topicIds: injected.slice()
  };
})();


(function(){
  'use strict';
  if (typeof window === 'undefined') return;
  window.__wave89bMergedBanks = {
    version: 'wave89b',
    components: ['wave87y','wave87z','wave88b']
  };
})();
