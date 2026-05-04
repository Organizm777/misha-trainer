/* --- wave86s: lazy grade10 subject chunk: inf --- */
(function(){
  if(String(window.GRADE_NUM || '') !== '10') return;
  var INF_TH={numsys:'<h3>Системы счисления</h3>\n<p><b>Из десятичной в двоичную:</b> делим на 2, пишем остатки снизу вверх</p>\n<div class="ex">25: 25/2=12(ост.1), 12/2=6(ост.0), 6/2=3(ост.0), 3/2=1(ост.1), 1/2=0(ост.1) → 11001</div>\n<p><b>Из двоичной в десятичную:</b> каждый разряд × степень двойки, справа налево:</p>\n<div class="fm">Степени 2: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024</div>\n<div class="ex">11001₂ = 1·16 + 1·8 + 0·4 + 0·2 + 1·1 = 25</div>\n<p><b>16-ричная:</b> цифры 0–9, затем A=10, B=11, C=12, D=13, E=14, F=15</p>',logic:'<h3>Логика</h3>\n<p><b>Операции (запомни таблицы!):</b></p>\n<div class="fm">∧ (И): 1∧1=1, всё остальное 0 (оба должны быть 1)\n∨ (ИЛИ): 0∨0=0, всё остальное 1 (хотя бы один = 1)\n¬ (НЕ): ¬0=1, ¬1=0 (переворачивает)\n→ (импликация): 1→0=0, всё остальное 1 (ложь только при «из истины следует ложь»)\n⊕ (XOR): разные=1, одинаковые=0</div>\n<p><b>Де Морган:</b> ¬(A∧B) = ¬A∨¬B, ¬(A∨B) = ¬A∧¬B</p>',encode:'<h3>Кодирование информации</h3>\n<p><b>Текст:</b> V = N × i (N символов × i бит на символ)</p>\n<p><b>Мощность алфавита:</b> 2ⁱ = количество символов. Если 256 символов → 8 бит (2⁸=256)</p>\n<div class="fm">1 байт = 8 бит, 1 Кб = 1024 байт, 1 Мб = 1024 Кб</div>\n<p><b>Изображение:</b> V = ширина × высота × бит_на_пиксель</p>\n<p><b>Звук:</b> V = частота × глубина × время × каналы</p>\n<div class="ex">200 символов, 16 бит/символ: V = 200×16 = 3200 бит = 400 байт<br>Алфавит 32 символа: 2⁵=32 → 5 бит на символ</div>',algo:'<h3>Алгоритмы (Python)</h3>\n<p><b>range(a, b)</b> — числа от a до b−1. range(1, 6) → 1,2,3,4,5</p>\n<p><b>range(n)</b> — числа от 0 до n−1. range(5) → 0,1,2,3,4</p>\n<div class="fm">// — целочисленное деление: 17//5 = 3 (отбросить дробь)\n% — остаток от деления: 17%5 = 2 (17 = 5·3 + 2)</div>\n<p><b>Как решать:</b> бери карандаш и выполняй код строчка за строчкой. Записывай значение каждой переменной после каждого шага.</p>\n<div class="ex">x=1, while x<10: x=x*2 → x: 1→2→4→8→16 (остановились, т.к. 16≥10). Ответ: 16</div>',python:'<h3>Python: строки и списки</h3>\n<p><b>Строки:</b></p>\n<div class="fm">len("Hello") = 5 (длина)\n"Hello"[1:4] = "ell" (срез от 1 до 3, т.е. до 4−1)\n"Hi" + "!" = "Hi!" (склейка)</div>\n<p><b>Списки:</b></p>\n<div class="fm">a = [3, 1, 4, 1, 5]\nmax(a) = 5, min(a) = 1, sum(a) = 14, len(a) = 5</div>\n<p><b>Функции:</b> def f(x): return x*x — при вызове f(3) подставляется 3 вместо x → 9</p>'};function genINS(){const o=pick([()=>{const o=pick(range(5,63));return[`${o}₁₀ → двоичная=?`,o.toString(2),"Делим на 2"]},()=>{const o=pick(range(5,63));return[`${o.toString(2)}₂ → десятичная=?`,""+o,"×степени 2"]},()=>{const o=pick(range(16,255));return[`${o}₁₀ → hex=?`,o.toString(16).toUpperCase(),"Делим на 16"]},()=>{const o=pick(range(16,255));return[`${o.toString(16).toUpperCase()}₁₆ → десятичная=?`,""+o,"×степени 16"]}])(),a=()=>""+(parseInt(o[1])||0)+pick([-2,-1,1,2]);return mkQ(o[0],o[1],fillW(o[1],[a,a,a]),o[2],"Сист.счисл.","#16a34a","#dcfce7")}function genILog(){const o=pick([()=>{const o=pick([0,1]),a=pick([0,1]),e=pick([{s:"A∧B",r:o&a},{s:"A∨B",r:o|a},{s:"A→B",r:1===o&&0===a?0:1},{s:"A⊕B",r:o^a},{s:"¬A∧B",r:1-o&a},{s:"¬A∨B",r:1-o|a},{s:"A∧¬B",r:o&1-a},{s:"¬(A∧B)",r:1-(o&a)},{s:"¬(A∨B)",r:1-(o|a)}]);return[`A=${o},B=${a}. ${e.s}=?`,""+e.r]},()=>{const o=pick([0,1]),a=pick([0,1]),e=pick([0,1]),n=pick([{s:"A∧B∧C",r:o&a&e},{s:"A∨B∨C",r:o|a|e},{s:"(A∨B)∧C",r:(o|a)&e},{s:"A∧(B∨C)",r:o&(a|e)},{s:"(A⊕B)∨C",r:o^a|e}]);return[`A=${o},B=${a},C=${e}. ${n.s}=?`,""+n.r]},()=>{const o=pick([0,1]);return[`¬${o}=?`,""+(1-o)]}])();return mkQ(o[0],o[1],fillW(o[1],[()=>""+(1-parseInt(o[1])),()=>"0",()=>"1"]),"∧=И ∨=ИЛИ →:1→0=0","Логика","#dc2626","#fee2e2")}function genIEnc(){const o=pick([()=>{const o=pick([64,128,256,512,1024,2048]),a=pick([8,16,32]),e=o*a/8,n=e>=1024;return[`${o} симв., ${a} бит/симв. ${n?"Кб":"байт"}=?`,n?""+e/1024:""+e,"N×i/8"]},()=>{const o=pick([[2,1],[4,2],[8,3],[16,4],[32,5],[64,6],[128,7],[256,8],[512,9],[1024,10]]);return[`Алфавит ${o[0]}. Бит/симв.=?`,""+o[1],"2ⁱ="+o[0]]},()=>{const o=pick([1,2,4,5,8,10]),a=pick([8,16]);return[`${o} Кб, ${a} бит/симв. Символов=?`,""+1024*o*8/a,"V×8/i"]},()=>{const o=pick([100,200,320,640,800]),a=pick([100,200,240,480]),e=pick([1,4,8,16,24]),n=o*a*e/8;return[`${o}×${a}, ${e} бит/пикс. ≈${n>=1048576?"Мб":"Кб"}?`,n>=1048576?Math.round(n/1024/1024):""+Math.round(n/1024),"W×H×bpp/8"]}])(),a=+o[1],e=()=>""+Math.max(1,a+pick([-2,-1,1,2,3]));return mkQ(o[0],o[1],fillW(o[1],[e,e,e]),o[2],"Кодирование","#ea580c","#fff7ed")}function genIAlg(){const o=pick([()=>{const o=pick([8,10,16,20,32,50,64,100,128]);let a=1;for(;a<o;)a*=2;return["x=?",`x=1\nwhile x<${o}:\n    x=x*2`,""+a,"x удваивается"]},()=>{const o=pick(range(3,12));let a=0;for(let e=1;e<=o;e++)a+=e;return["s=?",`s=0\nfor i in range(1,${o+1}):\n    s=s+i`,""+a,"1+2+…+"+o]},()=>{const o=pick(range(3,20)),a=pick(range(3,20));return["Что выведет?",`a=${o}\nb=${a}\nif a>b:\n    print(a-b)\nelse:\n    print(b-a)`,""+Math.abs(o-a),o+(o>a?">":"<")+a]},()=>{const o=pick(range(2,6)),a=pick(range(2,6));return["Сколько print?",`for i in range(${o}):\n    for j in range(${a}):\n        print(i,j)`,""+o*a,o+"×"+a]},()=>{const o=pick([32,64,100,128,200,256,512,1024]);let a=o,e=0;for(;a>1;)a=Math.floor(a/2),e++;return["count=?",`x=${o}\ncount=0\nwhile x>1:\n    x=x//2\n    count+=1`,""+e,"Сколько раз пополам"]},()=>{const o=pick(range(5,15));let a=0;for(let e=1;e<=o;e++)e%2==0&&(a+=e);return["s=?",`s=0\nfor i in range(1,${o+1}):\n    if i%2==0:\n        s+=i`,""+a,"Сумма чётных до "+o]},()=>{const o=pick(range(2,8)),a=pick(range(2,6));let e=o;for(let o=0;o<a;o++)e*=2;return["x=?",`x=${o}\nfor i in range(${a}):\n    x=x*2`,""+e,o+" удваивается "+a+" раз"]}])(),a=+o[2],e=()=>""+Math.max(0,a+pick([-3,-2,-1,1,2,3]));return mkQ(o[0],o[2],fillW(o[2],[e,e,e]),o[3],"Алгоритмы","#2563eb","#dbeafe",o[1])}function genIPy(){const o=pick([()=>{const o="ИНФОРМАТИКА",a=pick([0,1,2]),e=pick([5,6,7,8]);return[`"${o}"[${a}:${e}]=?`,o.slice(a,e),`с ${a} по ${e-1}`]},()=>{const o=shuffle(range(1,9)).slice(0,5),a=pick(["max","min","sum"]),e="max"===a?Math.max(...o):"min"===a?Math.min(...o):o.reduce((o,a)=>o+a,0);return[`[${o}]. ${a}()=?`,""+e,a]},()=>{const o=pick([17,23,37,100]),a=pick([3,5,7,10]),e=pick(["//","%"]);return[`${o} ${e} ${a}=?`,""+("//"===e?Math.floor(o/a):o%a),"// целая, % остаток"]}])(),a=parseFloat(o[1]),e=()=>isNaN(a)?"ИНФОРМАТИКА".slice(pick([0,1,2]),pick([4,5,6])):""+(a+pick([-2,-1,1,2]));return mkQ(o[0],o[1],fillW(o[1],[e,e,e]),o[2],"Python","#7c3aed","#ede9fe")}
  if(typeof window.__wave86sApplyGrade10Subject === 'function'){
    window.__wave86sApplyGrade10Subject("inf", { topics:[
      {id:"numsys",nm:"Системы счисления",gen:genINS,th:INF_TH.numsys,dot:"#2563eb"},
      {id:"logic",nm:"Логика",gen:genILog,th:INF_TH.logic,dot:"#7c3aed"},
      {id:"encode",nm:"Кодирование",gen:genIEnc,th:INF_TH.encode,dot:"#16a34a"},
      {id:"algo",nm:"Алгоритмы",gen:genIAlg,th:INF_TH.algo,dot:"#ea580c"},
      {id:"python",nm:"Python",gen:genIPy,th:INF_TH.python,dot:"#0d9488"}
    ] });
  }
})();

/* wave87v rich-content injection: grade10 inf */
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
  var TH = `<h3>Трассировка кода</h3><p>Сначала выпиши стартовые значения переменных, затем пройди цикл по шагам. Для функций отдельно отметь, что именно возвращает <code>return</code>.</p><div class="fm">range(1,5) → 1,2,3,4<br>// — целая часть, % — остаток<br>append добавляет элемент в конец списка</div>`;
  function gen(){
    return bank([
      {q:'Какую сумму выведет программа после цикла?', a:'10', o:['8','9','12'], h:'Суммируются числа 1, 2, 3 и 4.', ex:'1 + 2 + 3 + 4 = 10.', code:`s = 0
for i in range(1, 5):
    s += i
print(s)`},
      {q:'Какой список получится после append?', a:'[1, 2, 3, 4]', o:['[4, 3, 2, 1]','[1, 2, 3]','None'], h:'append добавляет новый элемент в конец списка.', ex:'После append список становится [1, 2, 3, 4].', code:`a = [1, 2, 3]
a.append(4)
print(a)`},
      {q:'Чему равно значение f(3)?', a:'7', o:['5','6','8'], h:'Функция возвращает 2x+1 при x=3.', ex:'2·3 + 1 = 7.', code:`def f(x):
    return 2 * x + 1

print(f(3))`},
      {q:'Сколько чётных чисел посчитает программа?', a:'3', o:['2','4','5'], h:'Считаются чётные числа 2, 4 и 6.', ex:'В диапазоне 1..6 три чётных числа.', code:`count = 0
for i in range(1, 7):
    if i % 2 == 0:
        count += 1
print(count)`},
      {q:'Какую строку вернёт upper()?', a:'HELLO', o:['hello','Hello','ошибка'], h:'Метод upper() переводит строку в верхний регистр.', ex:'hello превращается в HELLO.', code:`text = "hello"
print(text.upper())`},
      {q:'Чему равно x после выполнения программы?', a:'16', o:['8','12','32'], h:'x удваивается четыре раза.', ex:'1 → 2 → 4 → 8 → 16.', code:`x = 1
for i in range(4):
    x *= 2
print(x)`},
      matchRow(
        'Соедини конструкцию Python с её результатом или действием.',
        [
          ['a.append(4)', 'добавляет 4 в конец списка'],
          ['"hello".upper()', 'HELLO'],
          ['range(1, 5)', '1, 2, 3, 4']
        ],
        'append меняет список, upper переводит строку в верхний регистр, а range(1, 5) не включает 5.',
        'append(4) добавляет элемент в конец списка, upper() даёт HELLO, а range(1, 5) перечисляет 1, 2, 3, 4.'
      )
    ], 'Трассировка кода', '#16a34a', '#dcfce7');
  }
  window.__wave86sApplyGrade10Subject('inf', { topics:[
    { id:'code10w87v', nm:'Трассировка кода', gen:gen, th:TH, dot:'#0d9488' }
  ] });
})();
