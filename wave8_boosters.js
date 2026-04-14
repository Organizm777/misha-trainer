(function(){
  function bankQ(arr, tag, color, bg){ const e = pick(arr); return mkQ(e.q, e.a, shuffle([e.a, ...e.o]).slice(0,4), e.h, tag, color, bg); }
  function wrapGen(name, tag, color, bg, extra){
    const original = window[name];
    if(typeof original !== 'function') return;
    window[name] = function(){ return Math.random() < 0.55 ? bankQ(extra, tag, color, bg) : original(); };
  }

  if(String(window.GRADE_NUM||'') === '1'){
    wrapGen('genCount','Счёт до 20','#2563eb','#dbeafe',[
      {q:'Какое число идёт после 14?',a:'15',o:['13','16','12'],h:'После 14 идёт 15.'},
      {q:'Какое число стоит перед 19?',a:'18',o:['17','20','16'],h:'Перед 19 стоит 18.'},
      {q:'Что больше?',a:'17',o:['15','16','14'],h:'17 больше 15, 16 и 14.'},
      {q:'Сколько всего: 10 и ещё 8?',a:'18',o:['17','19','16'],h:'10 + 8 = 18.'},
      {q:'Сколько будет 20 без одного?',a:'19',o:['18','17','20'],h:'20 − 1 = 19.'},
      {q:'Какое число между 11 и 13?',a:'12',o:['10','14','15'],h:'Между 11 и 13 стоит 12.'}
    ]);
    wrapGen('genSub','Вычитание','#dc2626','#fee2e2',[
      {q:'13 − 4 = ?',a:'9',o:['8','10','7'],h:'13 − 4 = 9.'},
      {q:'18 − 6 = ?',a:'12',o:['11','13','14'],h:'18 − 6 = 12.'},
      {q:'20 − 9 = ?',a:'11',o:['10','12','9'],h:'20 − 9 = 11.'},
      {q:'15 − 7 = ?',a:'8',o:['7','9','6'],h:'15 − 7 = 8.'},
      {q:'16 − 8 = ?',a:'8',o:['7','9','10'],h:'Поровну: остаётся 8.'},
      {q:'12 − 5 = ?',a:'7',o:['6','8','9'],h:'12 − 5 = 7.'}
    ]);
    wrapGen('genShapes','Фигуры','#f59e0b','#fef3c7',[
      {q:'У какой фигуры 3 угла?',a:'Треугольник',o:['Круг','Квадрат','Прямоугольник'],h:'У треугольника 3 угла.'},
      {q:'У какой фигуры нет углов?',a:'Круг',o:['Квадрат','Треугольник','Прямоугольник'],h:'У круга нет углов.'},
      {q:'Какая фигура похожа на дверь?',a:'Прямоугольник',o:['Круг','Треугольник','Квадрат'],h:'Дверь чаще всего прямоугольная.'},
      {q:'У какой фигуры 4 равные стороны?',a:'Квадрат',o:['Круг','Треугольник','Прямоугольник'],h:'У квадрата 4 равные стороны.'},
      {q:'Что катится лучше всего?',a:'Круг',o:['Квадрат','Треугольник','Куб'],h:'Круглая фигура катится.'}
    ]);
    wrapGen('genLetters','Буквы и звуки','#0d9488','#ccfbf1',[
      {q:'Сколько гласных в слове «мама»?',a:'2',o:['1','3','4'],h:'ма-ма — две гласные А.'},
      {q:'Какой звук первый в слове «дом»?',a:'д',o:['м','о','т'],h:'Слово начинается со звука д.'},
      {q:'Выбери гласную букву.',a:'О',o:['М','Т','С'],h:'О — гласная.'},
      {q:'Сколько слогов в слове «лиса»?',a:'2',o:['1','3','4'],h:'ли-са — 2 слога.'},
      {q:'Какой звук последний в слове «кот»?',a:'т',o:['к','о','д'],h:'КоТ оканчивается на т.'}
    ]);
  }

  if(String(window.GRADE_NUM||'') === '2'){
    wrapGen('genMeasure','Единицы измерения','#f59e0b','#fef3c7',[
      {q:'Сколько сантиметров в 2 дециметрах?',a:'20',o:['10','12','200'],h:'1 дм = 10 см, значит 2 дм = 20 см.'},
      {q:'Что длиннее: 1 дм или 8 см?',a:'1 дм',o:['8 см','они равны','сравнить нельзя'],h:'1 дм = 10 см.'},
      {q:'Сколько граммов в 1 килограмме?',a:'1000',o:['100','10','500'],h:'1 кг = 1000 г.'},
      {q:'Сколько минут в двух часах?',a:'120',o:['60','90','100'],h:'2 × 60 = 120.'},
      {q:'Что тяжелее: 2 кг или 1500 г?',a:'2 кг',o:['1500 г','они равны','сравнить нельзя'],h:'2 кг = 2000 г.'}
    ]);
    wrapGen('genBezud','Безударные гласные','#ea580c','#fff7ed',[
      {q:'Как проверить слово «тр_ва»?',a:'травы',o:['трава','травка','травный'],h:'травы — слышно А.'},
      {q:'Какое слово проверяет «сн_га»?',a:'снег',o:['снежный','снеговик','снега'],h:'снег — слышно Е.'},
      {q:'Выбери верное слово.',a:'весна',o:['висна','вясна','вёсна'],h:'Проверяем: вёсны.'},
      {q:'Какое слово проверяет «р_ка»?',a:'реки',o:['руки','река','речка'],h:'реки — слышно Е.'},
      {q:'Выбери правильное слово.',a:'земля',o:['зимля','замля','землё'],h:'земли — слышно Е.'}
    ]);
    wrapGen('genPair','Парные согласные','#7c3aed','#ede9fe',[
      {q:'Какая буква в слове «лу_» (растение)?',a:'к',o:['г','т','д'],h:'лук — проверяем словом луки.'},
      {q:'Какая буква в слове «зу_»?',a:'б',o:['п','д','т'],h:'зуб — зубы.'},
      {q:'Какая буква в слове «ла_ка»?',a:'в',o:['ф','б','п'],h:'лавка — слышно В.'},
      {q:'Какая буква в слове «медве_ь» перед мягким знаком?',a:'д',o:['т','б','п'],h:'медведи — слышно Д.'},
      {q:'Какая буква в слове «дру_»?',a:'г',o:['к','б','п'],h:'друг — друзья.'}
    ]);
    wrapGen('genAnimals','Животные','#16a34a','#dcfce7',[
      {q:'Какое животное впадает в спячку?',a:'Медведь',o:['Волк','Лиса','Заяц'],h:'Медведь спит зимой.'},
      {q:'Кто живёт в воде?',a:'Щука',o:['Лиса','Белка','Ёж'],h:'Щука — рыба.'},
      {q:'Какое животное домашнее?',a:'Собака',o:['Волк','Лось','Лиса'],h:'Собака живёт рядом с человеком.'},
      {q:'Чем покрыто тело птицы?',a:'Перьями',o:['Шерстью','Чешуёй','Кожей'],h:'У птиц перья.'},
      {q:'У кого есть копыта?',a:'У лошади',o:['У кошки','У курицы','У белки'],h:'Лошадь — копытное животное.'}
    ]);
  }

  if(String(window.GRADE_NUM||'') === '10'){
    function ensureTh(key, html){ if(typeof ENG_TH !== 'undefined') ENG_TH[key] = html; }
    function bank(arr, tag, color, bg){ const e=pick(arr); return mkQ(e.q, e.a, shuffle([e.a, ...e.o]).slice(0,4), e.h, tag, color, bg); }
    ensureTh('phrasal', '<h3>Фразовые глаголы</h3><div class="fm">give up = сдаваться / бросать<br>turn on = включать<br>look for = искать<br>find out = выяснять<br>put off = откладывать</div><p>Смотри на смысл целиком: phrasal verb часто нельзя переводить по отдельным словам.</p>');
    ensureTh('essay', '<h3>Написание эссе</h3><div class="fm">1) Вступление: обозначь тему и позицию<br>2) Аргумент 1 + пример<br>3) Аргумент 2 + пример<br>4) Короткий вывод</div><p>Следи за логикой: firstly, moreover, however, in conclusion.</p>');
    function genPhrasal10(){
      return bank([
        {q:'Choose the phrasal verb: I had to ____ smoking for my health.',a:'give up',o:['give in','give away','give over'],h:'give up = бросить привычку.'},
        {q:'Choose the phrasal verb: Please ____ the light before you leave.',a:'turn off',o:['turn up','turn into','turn over'],h:'turn off = выключить.'},
        {q:'Choose the phrasal verb: We are ____ a new flat in the city centre.',a:'looking for',o:['looking after','looking up','looking through'],h:'look for = искать.'},
        {q:'Choose the phrasal verb: I want to ____ more about this university.',a:'find out',o:['find over','find up','find after'],h:'find out = выяснить.'},
        {q:'Choose the phrasal verb: Don’t ____ the meeting till Friday.',a:'put off',o:['put out','put on','put away'],h:'put off = откладывать.'},
        {q:'Choose the phrasal verb: Could you ____ the TV? It is too quiet.',a:'turn up',o:['turn off','turn down','turn back'],h:'turn up = сделать громче.'},
        {q:'Choose the phrasal verb: Who will ____ the dog when we are away?',a:'look after',o:['look for','look into','look over'],h:'look after = заботиться.'},
        {q:'Choose the phrasal verb: The plane will ____ at 6 p.m.',a:'take off',o:['take away','take after','take over'],h:'take off = взлетать.'}
      ], 'Фразовые глаголы', '#0d9488', '#ccfbf1');
    }
    function genEssay10(){
      return bank([
        {q:'What should come first in an opinion essay?',a:'an introduction with your position',o:['a list of random ideas','only examples','a conclusion'],h:'Сначала вводим тему и позицию.'},
        {q:'Which linker is best to add a second argument?',a:'Moreover,',o:['However,','In conclusion,','On the one hand,'],h:'Moreover = к тому же.'},
        {q:'What should the final paragraph do?',a:'summarise your ideas',o:['add a new main argument','retell the topic word for word','ask several questions'],h:'Вывод подводит итог, а не вводит новую мысль.'},
        {q:'Which phrase is best for the opposite view?',a:'However, some people think ...',o:['Firstly,', 'For example,', 'In conclusion,'],h:'However помогает показать контраст.'},
        {q:'A strong body paragraph should contain:',a:'one clear idea and an example',o:['many unrelated ideas','only one short sentence','a title only'],h:'Один абзац = одна мысль + пояснение.'},
        {q:'Choose the best ending phrase:',a:'In conclusion,',o:['Firstly,','For instance,','As a result of that question'],h:'Вывод удобно начинать с In conclusion.'},
        {q:'What style is best for an exam essay?',a:'neutral and clear',o:['very informal','full of slang','like a text message'],h:'Экзаменационное эссе должно быть нейтральным.'},
        {q:'What helps connect ideas in an essay?',a:'linking words',o:['emoji','very long quotes','random abbreviations'],h:'Linkers делают текст логичным.'}
      ], 'Написание эссе', '#2563eb', '#dbeafe');
    }
    const eng = (SUBJ||[]).find(s => s.id === 'eng');
    if(eng && !eng.tops.find(t => t.id === 'phrasal')) eng.tops.push({id:'phrasal', nm:'Фразовые глаголы', gen:genPhrasal10, th:(ENG_TH&&ENG_TH.phrasal)||'', dot:'#0d9488'});
    if(eng && !eng.tops.find(t => t.id === 'essay')) eng.tops.push({id:'essay', nm:'Написание эссе', gen:genEssay10, th:(ENG_TH&&ENG_TH.essay)||'', dot:'#2563eb'});
  }
})();
