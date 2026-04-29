/* wave91i: C3/C4 theory enrichment for formulas, code, social studies and probability */
(function(){
  'use strict';
  var W='wave91i', timer=null, lastCount=0;
  function grade(){ var g=String(window.GRADE_NUM||window.GRADE_NO||document.body.getAttribute('data-grade')||'').replace(/[^0-9]/g,''); return Number(g||0); }
  function subjects(){ return Array.isArray(window.SUBJ) ? window.SUBJ : []; }
  function topicsOf(s){ return (s && (Array.isArray(s.tops)?s.tops:Array.isArray(s.t)?s.t:Array.isArray(s.topics)?s.topics:[])) || []; }
  function text(x){ return String(x==null?'':x).toLowerCase().replace(/ё/g,'е'); }
  function has(t, words){ var v=text((t&&t.id)||'')+' '+text((t&&t.nm)||'')+' '+text((t&&t.name)||''); return words.some(function(w){ return v.indexOf(text(w))>=0; }); }
  function html(title, body, bullets){ return '<section class="wave91i-theory"><h3>'+title+'</h3><p>'+body+'</p><div class="fm">'+bullets.join('<br>')+'</div></section>'; }
  var TH={
    algebra: html('Формулы и преобразования', 'В задачах по алгебре сначала приведи выражение к стандартному виду: раскрой скобки, собери подобные, вынеси общий множитель и только потом подставляй числа.', ['1) Проверь ОДЗ: знаменатель не равен нулю, корень имеет неотрицательное подкоренное выражение.', '2) Для степеней используй a^m·a^n=a^(m+n), (a^m)^n=a^(mn), a^0=1.', '3) В уравнении делай одно и то же действие с обеими частями.', '4) После преобразования подставь ответ обратно — это ловит лишние корни.']),
    geometry: html('Формулы и чертёж', 'Геометрическая задача решается с рисунка: отметь равные углы, стороны, радиусы, параллельные прямые и только потом выбирай теорему.', ['1) Треугольник: сумма углов 180°, площадь S=ah/2.', '2) Окружность: радиусы к точке касания перпендикулярны касательной.', '3) Подобие: равные углы → пропорциональные стороны.', '4) Координаты: расстояние ищи по формуле d²=(x₂−x₁)²+(y₂−y₁)².']),
    physics: html('Расчётная задача по физике', 'В физике важно не угадывать формулу, а собрать модель: величины, единицы СИ, закон, подстановка, проверка размерности.', ['1) Выпиши дано и переведи в СИ: км/ч → м/с, см → м, г → кг.', '2) Выбери закон: F=ma, A=Fs, p=mv, Q=cmΔt, U=IR.', '3) Вырази неизвестную величину до подстановки чисел.', '4) Проверь размерность и порядок ответа.']),
    chemistry: html('Расчёты и формулы в химии', 'Химическая задача начинается с уравнения реакции и количества вещества. Коэффициенты показывают молярные соотношения, а не массу напрямую.', ['1) Уравняй реакцию.', '2) Переведи массу, объём или число частиц в n: n=m/M, n=V/Vm.', '3) Используй коэффициенты как пропорцию.', '4) Вернись к нужной величине и укажи единицы.']),
    informatics: html('Трассировка кода', 'При трассировке программы не выполняй код «в голове» сразу целиком. Заведи таблицу значений переменных после каждой строки или итерации цикла.', ['1) Запиши начальные значения переменных.', '2) Для цикла отмечай номер итерации, условие и новые значения.', '3) Для if отдельно проверяй истинность условия.', '4) В строках помни: индексы обычно начинаются с 0, len считает символы.']),
    social: html('Обществознание: понятие → признак → пример', 'Чтобы не путать термины, проверяй три слоя: определение, обязательный признак и жизненный пример. Если пример не содержит обязательного признака, это другой термин.', ['1) Человек и общество: отделяй биологическое, социальное и духовное.', '2) Экономика: спрос, предложение, рынок, собственность — это разные роли участников.', '3) Политика: власть, государство, режим, партия, выборы.', '4) Право: норма, правоотношение, ответственность, отрасль права.']),
    probability: html('Вероятность и статистика', 'Вероятность — это отношение благоприятных исходов ко всем равновозможным исходам. Статистика описывает данные: среднее, медиану, размах и частоты.', ['1) P(A)=m/n, где m — подходящие исходы, n — все исходы.', '2) Для «и» часто умножаем вероятности, для «или» в несовместимых событиях складываем.', '3) Среднее = сумма значений / количество.', '4) Медиана — центральное значение после сортировки ряда.'])
  };
  function patchTopic(topic, block, marker){
    if(!topic || !block) return false;
    marker = marker || 'wave91i';
    var current = String(topic.th || '');
    if(current.indexOf(marker)>=0) return false;
    if(!current || /готовится|раздел в разработке/i.test(current)) topic.th = block;
    else topic.th = current + block;
    topic._wave91iTheory = marker;
    return true;
  }
  function apply(){
    var g=grade(), n=0;
    subjects().forEach(function(s){
      var sid=text(s.id), sn=text(s.nm||s.name), label=sid+' '+sn;
      var tops=topicsOf(s);
      tops.forEach(function(t){
        if(g>=8 && g<=11 && (/\balg\b|алгебр|математ/.test(label) || has(t,['уравн','неравен','степен','корн','логарифм','тригонометр','функц','выражен']))) n += patchTopic(t, TH.algebra, 'wave91i-c3-algebra') ? 1 : 0;
        if(g>=8 && g<=11 && (/\bgeo\b|геометр/.test(label) || has(t,['треуг','окруж','четырех','стерео','координат','вектор']))) n += patchTopic(t, TH.geometry, 'wave91i-c3-geometry') ? 1 : 0;
        if(g>=8 && g<=11 && (/\bphy\b|физик/.test(label) || has(t,['кинемат','динамик','энерг','импульс','электр','молекул','оптик']))) n += patchTopic(t, TH.physics, 'wave91i-c3-physics') ? 1 : 0;
        if(g>=8 && g<=11 && (/\bchem\b|хими/.test(label) || has(t,['атом','реакц','органик','раствор','моль']))) n += patchTopic(t, TH.chemistry, 'wave91i-c3-chemistry') ? 1 : 0;
        if(g>=8 && g<=11 && (/\binf\b|информ|код|python|программ/.test(label) || has(t,['python','алгоритм','код','системы счисления','логика','строки']))) n += patchTopic(t, TH.informatics, 'wave91i-c3-informatics') ? 1 : 0;
        if(g>=5 && g<=7 && (/\bsoc\b|обществ/.test(label) || has(t,['общество','эконом','право','политик','человек']))) n += patchTopic(t, TH.social, 'wave91i-c4-social') ? 1 : 0;
        if(g>=7 && g<=8 && (/\bprob\b|вероят|статист/.test(label) || has(t,['вероят','статист','комбинатор','частот','диаграм']))) n += patchTopic(t, TH.probability, 'wave91i-c4-probability') ? 1 : 0;
      });
    });
    lastCount += n;
    return n;
  }
  function wrap(name){
    var original=window[name];
    if(typeof original!=='function' || original._wave91iTheoryWrapped) return;
    function wrapped(){ var out=original.apply(this,arguments); try{ apply(); }catch(_){} return out; }
    wrapped._wave91iTheoryWrapped=1;
    window[name]=wrapped;
  }
  function boot(){
    try{ apply(); wrap('__wave86sApplyGrade10Subject'); }catch(_){}
    window.wave91iTheoryPatch={
      version:W,
      apply:apply,
      auditSnapshot:function(){
        var total=0, marked=0;
        subjects().forEach(function(s){ topicsOf(s).forEach(function(t){ total++; if(String(t.th||'').indexOf('wave91i-c')>=0) marked++; }); });
        return { wave:W, grade:grade(), topics:total, marked:marked, totalPatched:lastCount, supports:['C3-formulas-code-8-11','C4-social-5-7','C4-probability-7-8'] };
      }
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
  if(typeof setInterval==='function'){
    timer=setInterval(function(){ try{ apply(); }catch(_){} }, 1100);
    if(typeof setTimeout==='function') setTimeout(function(){ clearInterval(timer); }, 9000);
  }
})();
