/* --- wave86s: lazy grade10 subject chunk: phy --- */
(function(){
  if(String(window.GRADE_NUM || '') !== '10') return;
  var PHY_TH={kin:'<h3>Кинематика</h3>\n<p><b>Кинематика</b> — описание движения без причин (куда, как быстро).</p>\n<p><b>Скорость</b> — как быстро меняется положение: v = S/t (путь / время)</p>\n<p><b>Ускорение</b> — как быстро меняется скорость: a = (v−v₀)/t</p>\n<div class="fm">Равномерное: S = v·t\nРавноускоренное: S = v₀t + at²/2,  v = v₀ + at\nСвободное падение: g ≈ 10 м/с²</div>\n<div class="ex">Машина разгоняется с 0 до 20 м/с за 10 с: a = 20/10 = 2 м/с²<br>Путь: S = 0 + 2·100/2 = 100 м</div>\n<p><b>🔑 Алгоритм решения:</b></p>\n<ol><li>Запиши «дано» — что известно (v, t, S, a)</li>\n<li>Определи тип движения: равномерное (a=0) или равноускоренное</li>\n<li>Выбери формулу с нужными величинами</li>\n<li>Подставь числа, посчитай</li></ol>\n<p><b>Единицы:</b> скорость в м/с, время в с, путь в м, ускорение в м/с²</p>\n<p><b>⚠️ Перевод:</b> 36 км/ч = 10 м/с (дели на 3.6), 72 км/ч = 20 м/с</p>',dyn:'<h3>Динамика (законы Ньютона)</h3>\n<p><b>1 закон:</b> тело сохраняет скорость, если на него не действуют силы (инерция)</p>\n<p><b>2 закон:</b> F = m·a (сила = масса × ускорение). Главная формула!</p>\n<p><b>3 закон:</b> действие = противодействие (F₁ = −F₂)</p>\n<div class="fm">Сила тяжести: F = mg (g ≈ 10 м/с²)\nВес тела = mg (на горизонтальной поверхности)\nСила трения: F = μ·N (μ — коэффициент трения)\nЗакон Гука (пружина): F = k·x</div>\n<div class="ex">Масса 5 кг, g=10: вес = 5·10 = 50 Н<br>F=20Н, m=4кг: a = F/m = 20/4 = 5 м/с²</div>\n<p><b>🔑 Главная формула физики:</b> F = m·a → из неё всё:</p>\n<ul><li>Найти силу: F = m·a</li>\n<li>Найти ускорение: a = F/m</li>\n<li>Найти массу: m = F/a</li></ul>\n<p><b>⚠️ Частые ошибки:</b></p>\n<ul><li>Путают вес (сила, в Ньютонах) и массу (в кг). Вес = mg</li>\n<li>Забывают g = 10 м/с² при расчёте веса</li>\n<li>Сила трения ПРОТИВ движения, а не по движению</li></ul>',energy:'<h3>Законы сохранения</h3>\n<p><b>Импульс:</b> p = m·v. Сохраняется при столкновениях: m₁v₁ + m₂v₂ = const</p>\n<p><b>Кинетическая энергия</b> (энергия движения): Eк = mv²/2</p>\n<p><b>Потенциальная энергия</b> (энергия высоты): Eп = mgh</p>\n<div class="fm">Закон сохранения энергии: Eк + Eп = const\nРабота: A = F·S·cos α  (если сила вдоль пути: A = F·S)\nМощность: P = A/t = F·v</div>\n<div class="ex">m=2кг, v=3м/с: Eк = 2·9/2 = 9 Дж<br>m=5кг, h=4м: Eп = 5·10·4 = 200 Дж</div>\n<p><b>🔑 Закон сохранения энергии простыми словами:</b></p>\n<p>Энергия не исчезает, а превращается. Мяч летит вверх → скорость падает (Eк↓), высота растёт (Eп↑). Сумма та же!</p>\n<p><b>Импульс</b> — «количество движения». Тяжёлый грузовик на 10 км/ч опаснее велосипеда на 30 км/ч, потому что p = m·v больше.</p>\n<p><b>⚠️ Не путай:</b> работа A = F·S (сила × путь), мощность P = A/t (работа за время)</p>',mol:'<h3>Молекулярная физика</h3>\n<p><b>Температура:</b> T(К) = t(°C) + 273. Абсолютный ноль = −273°C = 0 К</p>\n<p><b>Идеальный газ:</b> pV = nRT (уравнение Менделеева-Клапейрона)</p>\n<div class="fm">Газовые законы (при постоянном третьем):\n  Бойля-Мариотта: p₁V₁ = p₂V₂ (T=const)\n  Гей-Люссака: V₁/T₁ = V₂/T₂ (p=const)\n  Шарля: p₁/T₁ = p₂/T₂ (V=const)</div>\n<div class="ex">20°C в Кельвинах: T = 20 + 273 = 293 К<br>Газ: p=2атм, V=3л → p·V = 6. Сжали V=1л → p = 6 атм</div>'};function genPhyKin(){const o=pick([()=>{const o=pick(range(2,20)),a=pick(range(2,15));return[`v=${o} м/с, t=${a} с. S=?`,""+o*a,`S = v·t = ${o}·${a} = ${o*a} м`]},()=>{const o=pick(range(2,20)),a=pick(range(2,10)),e=o*a;return[`S=${e} м, t=${a} с. v=?`,""+o,`v = S/t = ${e}/${a} = ${o} м/с`]},()=>{const o=pick(range(1,8)),a=pick(range(2,10)),e=o*a;return[`Разгон 0→${e} м/с за ${a} с. a=?`,""+o,`a = (v−v₀)/t = ${e}/${a} = ${o} м/с²`]},()=>{const o=pick([1,2,3,4,5]),a=5*o*o;return[`Свободное падение с h=${a}м. t=?`,""+o,`t = √(2h/g) = √(${2*a}/10) = √${o*o} = ${o} с`]},()=>{const o=pick(range(1,6)),a=10*o*o/2;return[`Свободное падение t=${o}с. h=?`,""+a,`h = gt²/2 = 10·${o}²/2 = ${a} м`]},()=>{const o=pick([0,5,10]),a=pick([2,3,4,5]),e=pick(range(2,8)),n=o+a*e;return[`v₀=${o}, a=${a}, t=${e}. v=?`,""+n,`v = v₀+at = ${o}+${a}·${e} = ${n}`]},()=>{const o=pick([0,2,4,6]),a=pick([2,4,6,8]),e=pick(range(2,6)),n=o*e+a*e*e/2;return[`v₀=${o}, a=${a}, t=${e}. S=?`,""+n,`S = v₀t+at²/2 = ${o}·${e}+${a}·${e*e}/2 = ${n}`]}])(),a=+o[1],e=()=>""+Math.max(0,Math.round(a+a*pick([-.5,-.3,.3,.5,1])));return mkQ(o[0],o[1],fillW(o[1],[e,e,e]),o[2],"Кинематика","#dc2626","#fee2e2",null,!0)}function genPhyDyn(){const o=pick([()=>{const o=pick(range(1,20)),a=pick(range(1,10));return[`m=${o}кг, a=${a}м/с². F=?`,""+o*a,`F = m·a = ${o}·${a} = ${o*a} Н`]},()=>{const o=pick(range(1,10)),a=pick(range(1,10)),e=o*a;return[`F=${e}Н, m=${o}кг. a=?`,""+a,`a = F/m = ${e}/${o} = ${a} м/с²`]},()=>{const o=pick(range(1,15));return[`Масса ${o}кг. Вес (g=10)=?`,""+10*o,`P = mg = ${o}·10 = ${10*o} Н`]},()=>{const o=pick(range(1,15)),a=10*o;return[`Вес ${a}Н. Масса (g=10)=?`,""+o,`m = P/g = ${a}/10 = ${o} кг`]},()=>{const o=pick([100,200,500,1e3]),a=pick([1,2,4,5,10]),e=a/100,n=o*e;return[`Пружина k=${o}Н/м, x=${a}см. F=?`,""+n,`F = kx = ${o}·${e} = ${n} Н`]},()=>{const o=pick(range(2,10)),a=pick([.1,.2,.5]),e=10*o*a;return[`m=${o}кг, μ=${a}. Fтрения=?`,""+e,`F = μmg = ${a}·${o}·10 = ${e} Н`]},()=>{const o=pick(range(1,5)),a=pick(range(2,8)),e=pick(range(1,5)),n=o+e,t=o*a,h=t/n,i=Number.isInteger(h)?""+h:h.toFixed(1);return[`Неупр. удар: m₁=${o} v₁=${a} + m₂=${e} v₂=0. v=?`,i,`v = m₁v₁/(m₁+m₂) = ${t}/${n} ≈ ${i}`]}])(),a=parseFloat(o[1]),e=()=>{const o=Math.round(a+a*pick([-.5,-.3,.3,.5]));return""+Math.max(0,o)};return mkQ(o[0],o[1],fillW(o[1],[e,e,e]),o[2],"Динамика","#2563eb","#dbeafe",null,!0)}function genPhyEnergy(){const o=pick([()=>{const o=pick(range(1,10)),a=pick(range(2,10)),e=o*a*a/2;return[`m=${o}кг, v=${a}м/с. Eк=?`,""+e,`Eк = mv²/2 = ${o}·${a*a}/2 = ${e} Дж`]},()=>{const o=pick(range(1,10)),a=pick(range(2,15)),e=10*o*a;return[`m=${o}кг, h=${a}м. Eп=?`,""+e,`Eп = mgh = ${o}·10·${a} = ${e} Дж`]},()=>{const o=pick([10,20,30,50,100]),a=pick(range(2,10));return[`F=${o}Н, S=${a}м. A=?`,""+o*a,`A = F·S = ${o}·${a} = ${o*a} Дж`]},()=>{const o=pick([10,20,50,100,200,500]),a=pick(range(2,10)),e=o*a;return[`A=${e}Дж, t=${a}с. P=?`,""+o,`P = A/t = ${e}/${a} = ${o} Вт`]},()=>{const o=pick(range(1,5)),a=pick(range(2,8));return[`m=${o}кг, v=${a}м/с. p=?`,""+o*a,`p = mv = ${o}·${a} = ${o*a} кг·м/с`]},()=>{const o=pick([[5,10],[20,20],[45,30],[80,40],[125,50],[180,60]]);return[`Падение с h=${o[0]}м. v у земли≈?`,""+o[1],`Eп→Eк: mgh=mv²/2 → v=√(2·10·${o[0]})=√${20*o[0]}=${o[1]}`]},()=>{const o=pick([100,200,500,1e3,2e3]),a=pick([60,120,300,600]);return[`P=${o}Вт, t=${a}с. A=?`,""+o*a,`A = P·t = ${o}·${a} = ${o*a} Дж`]}])(),a=+o[1],e=()=>""+Math.max(0,Math.round(a+a*pick([-.5,-.3,.3,.5,1])));return mkQ(o[0],o[1],fillW(o[1],[e,e,e]),o[2],"Энергия","#16a34a","#dcfce7",null,!0)}function genPhyMol(){const o=pick([()=>{const o=pick(range(-50,150));return[`${o}°C в Кельвинах = ?`,""+(o+273),`T = t + 273 = ${o} + 273 = ${o+273} К`]},()=>{const o=pick(range(200,400));return[`${o} К в Цельсиях = ?`,""+(o-273),`t = T − 273 = ${o} − 273 = ${o-273}°C`]},()=>{const o=pick([1,2,3,4]),a=pick([2,3,4,6,8]),e=pick([1,2,3,4]),n=o*a/e;return Number.isInteger(n)?[`Бойля: p₁=${o}атм, V₁=${a}л → V₂=${e}л. p₂=?`,""+n,`p₁V₁=p₂V₂ → p₂=${o}·${a}/${e}=${n} атм`]:["0°C = ? К","273","T = t + 273 = 0 + 273"]},()=>{const o=pick([2,4,6,8]),a=pick([200,300,400]),e=pick([400,600,800]),n=o*e/a;return Number.isInteger(n)?[`Гей-Люссак: V₁=${o}л, T₁=${a}К, T₂=${e}К. V₂=?`,""+n,`V₁/T₁=V₂/T₂ → V₂=${o}·${e}/${a}=${n} л`]:["100°C = ? К","373","T = 100 + 273"]},()=>{const o=pick([1,2,3]),a=pick([200,300]),e=pick([400,600,900]),n=o*e/a;return Number.isInteger(n)?[`Шарля: p₁=${o}атм, T₁=${a}К, T₂=${e}К. p₂=?`,""+n,`p₁/T₁=p₂/T₂ → p₂=${o}·${e}/${a}=${n} атм`]:["−273°C = ? К","0","Абсолютный ноль"]}])(),a=+o[1],e=()=>""+Math.max(0,Math.round(a+pick([-30,-10,10,30,50])));return mkQ(o[0],o[1],fillW(o[1],[e,e,e]),o[2],"Молек.физика","#7c3aed","#ede9fe",null,!0)}
  if(typeof window.__wave86sApplyGrade10Subject === 'function'){
    window.__wave86sApplyGrade10Subject("phy", { topics:[
      {id:"kin",nm:"Кинематика",gen:genPhyKin,th:PHY_TH.kin,dot:"#2563eb"},
      {id:"dyn",nm:"Динамика",gen:genPhyDyn,th:PHY_TH.dyn,dot:"#dc2626"},
      {id:"energy",nm:"Энергия и импульс",gen:genPhyEnergy,th:PHY_TH.energy,dot:"#16a34a"},
      {id:"mol",nm:"Молекул. физика",gen:genPhyMol,th:PHY_TH.mol,dot:"#7c3aed"}
    ] });
  }
})();

/* wave87v rich-content injection: grade10 phy */
(function(){
  if (String(window.GRADE_NUM || '') !== '10' || typeof window.__wave86sApplyGrade10Subject !== 'function') return;
  function mix(arr){
    var copy = Array.isArray(arr) ? arr.slice() : [];
    if (typeof shuffle === 'function') return shuffle(copy).slice(0, 4);
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
    }
    return copy.slice(0, 4);
  }
  var recentRows = Object.create(null);
  function pickRow(rows, key){
    var row = rows[Math.floor(Math.random() * rows.length)];
    for (var attempt = 0; attempt < 4 && rows.length > 1 && recentRows[key] === row.q; attempt++) {
      row = rows[Math.floor(Math.random() * rows.length)];
    }
    recentRows[key] = row.q;
    return row;
  }
  function clonePairs(pairs){
    return (Array.isArray(pairs) ? pairs : []).map(function(pair){
      return Array.isArray(pair) ? [pair[0], pair[1]] : pair;
    });
  }
  function mergeExtra(row, extra){
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function(key){ row[key] = extra[key]; });
    }
    return row;
  }
  function attachRowMeta(item, row){
    if (!item || !row) return item;
    if (row.interactionType) item.interactionType = row.interactionType;
    if (Array.isArray(row.errorSteps)) item.errorSteps = row.errorSteps.slice();
    if (Array.isArray(row.sequenceItems)) item.sequenceItems = row.sequenceItems.slice();
    if (Array.isArray(row.sequencePool)) item.sequencePool = row.sequencePool.slice();
    if (Array.isArray(row.matchPairs)) item.matchPairs = clonePairs(row.matchPairs);
    if (Array.isArray(row.matchOptions)) item.matchOptions = row.matchOptions.slice();
    return item;
  }
  function serializeSequence(items){
    return (Array.isArray(items) ? items : []).map(function(item){ return String(item); }).join(' → ');
  }
  function uniqueStrings(items){
    var out = [];
    (Array.isArray(items) ? items : []).forEach(function(item){
      item = String(item);
      if (item && out.indexOf(item) === -1) out.push(item);
    });
    return out;
  }
  function sequenceDistractors(items){
    var base = (Array.isArray(items) ? items : []).slice();
    if (base.length < 3) return [];
    var vars = [];
    function add(seq){
      var value = serializeSequence(seq);
      if (value !== serializeSequence(base) && vars.indexOf(value) === -1) vars.push(value);
    }
    add([base[0], base[2], base[1]].concat(base.slice(3)));
    add(base.slice().reverse());
    add(base.slice(1).concat(base[0]));
    add([base[0]].concat(base.slice(2), [base[1]]));
    return vars.slice(0, 3);
  }
  function sequenceRow(q, items, h, ex, extra){
    var steps = (Array.isArray(items) ? items : []).slice();
    return mergeExtra({
      q: q,
      a: serializeSequence(steps),
      o: sequenceDistractors(steps),
      h: h || '',
      ex: ex || h || '',
      interactionType: 'sequence',
      sequenceItems: steps.slice(),
      sequencePool: mix(steps).slice(0, steps.length)
    }, extra);
  }
  function serializePairs(pairs, rights){
    return (Array.isArray(pairs) ? pairs : []).map(function(pair, idx){
      return String(pair[0]) + ' → ' + String(rights[idx]);
    }).join(' | ');
  }
  function matchDistractors(pairs){
    var rights = (Array.isArray(pairs) ? pairs : []).map(function(pair){ return String(pair[1]); });
    var vars = [];
    function add(candidate){
      var value = serializePairs(pairs, candidate);
      if (value !== serializePairs(pairs, rights) && vars.indexOf(value) === -1) vars.push(value);
    }
    for (var shift = 1; shift < rights.length; shift++) add(rights.slice(shift).concat(rights.slice(0, shift)));
    add(rights.slice().reverse());
    return vars.slice(0, 3);
  }
  function matchRow(q, pairs, h, ex, extra){
    var rows = clonePairs(pairs);
    var rights = rows.map(function(pair){ return String(pair[1]); });
    return mergeExtra({
      q: q,
      a: serializePairs(rows, rights),
      o: matchDistractors(rows),
      h: h || '',
      ex: ex || h || '',
      interactionType: 'match',
      matchPairs: rows,
      matchOptions: mix(rights).slice(0, rights.length)
    }, extra);
  }
  function errorRow(q, steps, answerIndex, h, ex, extra){
    var rows = (Array.isArray(steps) ? steps : []).slice();
    return mergeExtra({
      q: q,
      a: rows[answerIndex],
      o: rows.filter(function(_item, idx){ return idx !== answerIndex; }),
      h: h || '',
      ex: ex || h || '',
      interactionType: 'find-error',
      errorSteps: rows
    }, extra);
  }
  function bank(rows, tag, color, bg){
    var row = pickRow(rows, tag);
    var item = mkQ(row.q, row.a, mix([row.a].concat(row.o || [])), row.h || '', tag, color, bg, row.code || null, !!row.isMath, row.ex || row.h || '');
    return attachRowMeta(item, row);
  }
  var TH = `<h3>Формулы и расчёты</h3><div class="fm">p = m·v<br>Eₖ = mv²/2<br>Eₚ = mgh<br>P = A/t<br>η = Aₚ/Aₓ · 100%<br>pV = const</div><p>Тема даёт быстрый тренажёр на выбор формулы и числовую подстановку.</p>`;
  function gen(){
    return bank([
      {q:'m=4 кг, v=5 м/с. Чему равен импульс?', a:'20 кг·м/с', o:['9 кг·м/с','10 кг·м/с','25 кг·м/с'], h:'p = mv.', ex:'4·5 = 20 кг·м/с.', isMath:true},
      {q:'m=2 кг, v=6 м/с. Чему равна кинетическая энергия?', a:'36 Дж', o:['18 Дж','12 Дж','72 Дж'], h:'Eₖ = mv²/2.', ex:'2·36/2 = 36 Дж.', isMath:true},
      {q:'m=3 кг, h=10 м, g≈10 Н/кг. Чему равна потенциальная энергия?', a:'300 Дж', o:['30 Дж','100 Дж','600 Дж'], h:'Eₚ = mgh.', ex:'3·10·10 = 300 Дж.', isMath:true},
      {q:'A=600 Дж, t=3 с. Какова мощность?', a:'200 Вт', o:['180 Вт','300 Вт','603 Вт'], h:'P = A/t.', ex:'600/3 = 200 Вт.', isMath:true},
      {q:'КПД механизма равен 80%. Какая формула описывает КПД?', a:'η = Aпол / Aзат · 100%', o:['η = Aзат / Aпол · 100%','η = P·t','η = mv²/2'], h:'КПД — отношение полезной работы к затраченной.', ex:'Полезную работу делят на затраченную и переводят в проценты.', isMath:true},
      {q:'Найди ошибочную формулу.', a:'p = m / v', o:['Eₖ = mv²/2','P = A/t','Eₚ = mgh'], h:'Импульс пропорционален скорости, а не обратно пропорционален.', ex:'Верная формула: p = m·v.', isMath:true},
      sequenceRow(
        'Расставь шаги решения задачи: A=600 Дж, t=3 c, найти мощность P.',
        [
          'Записать формулу P = A/t',
          'Подставить A = 600 Дж и t = 3 c',
          'Выполнить деление 600 на 3',
          'Записать ответ в ваттах'
        ],
        'Сначала выбираем формулу мощности, затем подставляем данные и считаем.',
        'Правильный порядок: формула → подстановка → вычисление → ответ в Вт.',
        { isMath:true }
      )
    ], 'Формулы и расчёты', '#2563eb', '#dbeafe');
  }
  window.__wave86sApplyGrade10Subject('phy', { topics:[
    { id:'calc10w87v', nm:'Формулы и расчёты', gen:gen, th:TH, dot:'#0d9488' }
  ] });
})();
