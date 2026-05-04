/* wave86t split from bundle_grade_content: wave15_english.js */
/* --- wave15_english.js --- */
(function(){
  if(typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  var grade = String(window.GRADE_NUM || '');
  if(['2','3','4'].indexOf(grade) < 0) return;

  var ENG_COLOR = '#2563eb';
  var ENG_BG = '#dbeafe';
  window.ENG_TH = window.ENG_TH || {};
  var TH = window.ENG_TH;

  function ensureTheory(key, html){
    if(!TH[key]) TH[key] = html;
  }

  function bankGen(topicName, entries, color, bg){
    return function(){
      var q = entries[(Math.random() * entries.length) | 0];
      return mkQ(q.q, q.a, shuffle([q.a].concat(q.o || [])).slice(0, 4), q.h || '', topicName, color || ENG_COLOR, bg || ENG_BG, q.code || null, !!q.isMath, q.ex || q.h || '');
    };
  }

  function injectAfter(subjectId, newSubject){
    var existing = SUBJ.find(function(s){ return s.id === newSubject.id; });
    if(existing) return existing;
    var idx = SUBJ.findIndex(function(s){ return s.id === subjectId; });
    if(idx >= 0) SUBJ.splice(idx + 1, 0, newSubject); else SUBJ.push(newSubject);
    return newSubject;
  }

  function makeEnglishSubject(topics){
    return {
      id:'eng',
      nm:'Английский',
      ic:'🇬🇧',
      date:'',
      cl:ENG_COLOR,
      bg:ENG_BG,
      tops:topics,
    };
  }

  ensureTheory('letters2', `<h3>Letters &amp; Sounds</h3>
    <div class="fm">A a, B b, C c ...<br>cat = c-a-t</div>
    <p>Сначала учимся узнавать <b>большие и маленькие буквы</b>. Потом — слышать простой звук в слове.</p>
    <p>Например: <i>cat</i> начинается со звука <b>c</b>, а <i>dog</i> — со звука <b>d</b>.</p>`);
  ensureTheory('words2', `<h3>My First Words</h3>
    <p>Первые английские слова удобно учить <b>маленькими группами</b>: цвета, животные, числа, вещи в школе.</p>
    <div class="fm">cat, dog, book, pen,<br>red, blue, one, two</div>
    <p>Лучше не зубрить список, а говорить короткие фразы: <i>a red book</i>, <i>two dogs</i>.</p>`);

  ensureTheory('phrases3', `<h3>Simple Phrases</h3>
    <div class="fm">My name is ...<br>I am 9.<br>This is red.</div>
    <p>В 3 классе важно уверенно отвечать на простые вопросы: как тебя зовут, сколько тебе лет, какого цвета предмет.</p>
    <p>Полезно запоминать готовые кусочки речи, а не отдельные слова.</p>`);
  ensureTheory('numcol3', `<h3>Numbers &amp; Colours</h3>
    <div class="fm">one, two, three ... twenty<br>red, blue, green, yellow</div>
    <p>Числа и цвета часто встречаются в самых первых диалогах: <i>two books</i>, <i>a green frog</i>.</p>
    <p>Смотри на слово целиком и запоминай его вместе с предметом.</p>`);

  ensureTheory('be4', `<h3>To be &amp; have got</h3>
    <div class="fm">I am / he is / we are<br>I have got / she has got</div>
    <p><b>To be</b> нужно, чтобы сказать, кто ты и какой ты: <i>I am a pupil. She is kind.</i></p>
    <p><b>Have got</b> показывает, что у кого-то есть: <i>I have got a bike. He has got a dog.</i></p>`);
  ensureTheory('speak4', `<h3>Simple Sentences</h3>
    <div class="fm">This is my bag.<br>These are my books.<br>I like apples.</div>
    <p>В 4 классе начинаем собирать короткие правильные предложения про себя, школу, семью и любимые вещи.</p>
    <p>Смотри на опорные слова: <b>this/these</b>, <b>my</b>, <b>like</b>, <b>can</b>.</p>`);

  var BANK2 = {
    letters2: [
      {q:'Выбери маленькую букву для A.', a:'a', o:['b','c','d'], h:'Большая A и маленькая a — одна и та же буква.'},
      {q:'Выбери маленькую букву для B.', a:'b', o:['d','p','e'], h:'B → b.'},
      {q:'Выбери маленькую букву для C.', a:'c', o:['e','g','o'], h:'C → c.'},
      {q:'Выбери маленькую букву для D.', a:'d', o:['b','a','t'], h:'D → d.'},
      {q:'Выбери большую букву для e.', a:'E', o:['F','B','G'], h:'e → E.'},
      {q:'Выбери большую букву для g.', a:'G', o:['C','J','Q'], h:'g → G.'},
      {q:'С какой буквы начинается слово cat?', a:'c', o:['k','t','a'], h:'cat = c-a-t.'},
      {q:'С какой буквы начинается слово dog?', a:'d', o:['g','o','b'], h:'dog starts with d.'},
      {q:'С какой буквы начинается слово sun?', a:'s', o:['z','u','n'], h:'sun starts with s.'},
      {q:'С какой буквы начинается слово book?', a:'b', o:['p','k','o'], h:'book starts with b.'},
      {q:'Выбери букву, с которой начинается fish.', a:'f', o:['s','h','i'], h:'fish starts with f.'},
      {q:'Выбери букву, с которой начинается lamp.', a:'l', o:['m','p','t'], h:'lamp starts with l.'},
      {q:'Какую букву ты слышишь в начале слова apple?', a:'a', o:['p','e','l'], h:'apple starts with a.'},
      {q:'Какую букву ты слышишь в начале слова red?', a:'r', o:['d','e','t'], h:'red starts with r.'},
      {q:'Какая буква стоит первой в слове pen?', a:'p', o:['e','n','b'], h:'pen starts with p.'},
      {q:'Какая буква стоит первой в слове zebra?', a:'z', o:['b','s','r'], h:'zebra starts with z.'},
      {q:'Какая буква стоит первой в слове yellow?', a:'y', o:['w','e','l'], h:'yellow starts with y.'}
    ],
    words2: [
      {q:'Как по-английски «кот»?', a:'cat', o:['dog','book','red'], h:'cat = кот.'},
      {q:'Как по-английски «собака»?', a:'dog', o:['cat','blue','pen'], h:'dog = собака.'},
      {q:'Как по-английски «книга»?', a:'book', o:['bag','pen','dog'], h:'book = книга.'},
      {q:'Как по-английски «ручка»?', a:'pen', o:['pencil','cat','tree'], h:'pen = ручка.'},
      {q:'Как по-английски «красный»?', a:'red', o:['blue','green','black'], h:'red = красный.'},
      {q:'Как по-английски «синий»?', a:'blue', o:['red','pink','brown'], h:'blue = синий.'},
      {q:'Как по-английски «один»?', a:'one', o:['two','three','ten'], h:'one = один.'},
      {q:'Как по-английски «два»?', a:'two', o:['one','four','nine'], h:'two = два.'},
      {q:'Как по-английски «да»?', a:'yes', o:['no','hello','bye'], h:'yes = да.'},
      {q:'Как по-английски «нет»?', a:'no', o:['yes','please','thanks'], h:'no = нет.'},
      {q:'Как по-английски «привет»?', a:'hello', o:['goodbye','sorry','no'], h:'hello = привет.'},
      {q:'Как по-английски «до свидания»?', a:'goodbye', o:['hello','please','cat'], h:'goodbye = до свидания.'},
      {q:'Как по-английски «спасибо»?', a:'thank you', o:['please','sorry','hello'], h:'thank you = спасибо.'},
      {q:'Как по-английски «пожалуйста»?', a:'please', o:['thanks','goodbye','dog'], h:'please = пожалуйста.'},
      {q:'Как по-английски «извини»?', a:'sorry', o:['hello','blue','book'], h:'sorry = извини.'},
      {q:'Как по-английски «зелёный»?', a:'green', o:['grey','pink','white'], h:'green = зелёный.'},
      {q:'Как по-английски «школа»?', a:'school', o:['home','milk','garden'], h:'school = школа.'}
    ]
  };

  var BANK3 = {
    phrases3: [
      {q:'Закончи фразу: My name ___ Anna.', a:'is', o:['am','are','be'], h:'My name is ...'},
      {q:'Выбери ответ: How old are you? — I ___ 9.', a:'am', o:['is','are','be'], h:'I am 9.'},
      {q:'Выбери ответ: What is your name? — My name is ___.', a:'Tom', o:['nine','red','cat'], h:'Нужно назвать имя.'},
      {q:'Закончи фразу: This ___ my bag.', a:'is', o:['are','am','be'], h:'This is my bag.'},
      {q:'Выбери ответ: What colour is it? — It is ___.', a:'red', o:['six','book','dog'], h:'Нужно назвать цвет.'},
      {q:'Выбери ответ: Who is this? — This is my ___.', a:'mum', o:['blue','seven','book'], h:'Нужно назвать человека.'},
      {q:'Закончи фразу: I ___ happy.', a:'am', o:['is','are','has'], h:'I am happy.'},
      {q:'Выбери ответ: Can you swim? — Yes, I ___.', a:'can', o:['am','is','do'], h:'Yes, I can.'},
      {q:'Выбери ответ: Can you fly? — No, I ___.', a:'cannot', o:['am not','do not','is not'], h:'No, I cannot.'},
      {q:'Закончи фразу: She ___ my friend.', a:'is', o:['am','are','have'], h:'She is my friend.'},
      {q:'Выбери ответ: How are you? — I am ___.', a:'fine', o:['cat','ten','green'], h:'Fine = хорошо.'},
      {q:'Выбери ответ: What is this? — It is a ___.', a:'book', o:['blue','seven','goodbye'], h:'Нужно назвать предмет.'},
      {q:'Закончи фразу: We ___ pupils.', a:'are', o:['am','is','has'], h:'We are pupils.'},
      {q:'Выбери ответ: Is it blue? — Yes, it ___.', a:'is', o:['are','am','has'], h:'Yes, it is.'},
      {q:'Выбери ответ: Is he your dad? — No, he ___.', a:'is not', o:['are not','am not','has not'], h:'No, he is not.'},
      {q:'Закончи фразу: They ___ at school.', a:'are', o:['is','am','has'], h:'They are at school.'},
      {q:'Выбери ответ: Do you like apples? — Yes, I ___.', a:'do', o:['am','can','is'], h:'Yes, I do.'}
    ],
    numcol3: [
      {q:'Как по-английски «три»?', a:'three', o:['two','five','ten'], h:'three = три.'},
      {q:'Как по-английски «пять»?', a:'five', o:['four','six','nine'], h:'five = пять.'},
      {q:'Как по-английски «десять»?', a:'ten', o:['eight','twelve','fourteen'], h:'ten = десять.'},
      {q:'Как по-английски «зелёный»?', a:'green', o:['brown','black','white'], h:'green = зелёный.'},
      {q:'Как по-английски «жёлтый»?', a:'yellow', o:['purple','orange','pink'], h:'yellow = жёлтый.'},
      {q:'Как по-английски «чёрный»?', a:'black', o:['white','red','blue'], h:'black = чёрный.'},
      {q:'Choose the number: 7', a:'seven', o:['five','nine','three'], h:'7 = seven.'},
      {q:'Choose the number: 12', a:'twelve', o:['twenty','eleven','two'], h:'12 = twelve.'},
      {q:'Choose the number: 15', a:'fifteen', o:['fifty','fourteen','sixteen'], h:'15 = fifteen.'},
      {q:'Choose the colour: blue', a:'blue', o:['green','yellow','orange'], h:'blue = синий.'},
      {q:'Choose the colour: white', a:'white', o:['black','brown','grey'], h:'white = белый.'},
      {q:'Choose the colour: pink', a:'pink', o:['purple','red','green'], h:'pink = розовый.'},
      {q:'What comes after four?', a:'five', o:['three','six','seven'], h:'one, two, three, four, five.'},
      {q:'What comes after nine?', a:'ten', o:['eight','eleven','seven'], h:'nine, ten.'},
      {q:'What comes before six?', a:'five', o:['four','seven','eight'], h:'five comes before six.'},
      {q:'What colour is grass?', a:'green', o:['blue','black','red'], h:'Grass is green.'},
      {q:'What colour is milk?', a:'white', o:['yellow','green','brown'], h:'Milk is white.'}
    ]
  };

  var BANK4 = {
    be4: [
      {q:'Choose the correct form: I ___ a pupil.', a:'am', o:['is','are','have'], h:'With I we use am.'},
      {q:'Choose the correct form: She ___ my sister.', a:'is', o:['am','are','have'], h:'With she we use is.'},
      {q:'Choose the correct form: We ___ friends.', a:'are', o:['is','am','has'], h:'With we we use are.'},
      {q:'Choose the correct form: He ___ got a bike.', a:'has', o:['have','is','are'], h:'He has got ...'},
      {q:'Choose the correct form: They ___ got two cats.', a:'have', o:['has','is','am'], h:'They have got ...'},
      {q:'Choose the correct form: ___ you happy today?', a:'Are', o:['Is','Am','Have'], h:'Are you ... ?'},
      {q:'Choose the correct form: ___ she got a pen?', a:'Has', o:['Have','Is','Are'], h:'Has she got ... ?'},
      {q:'Choose the correct form: It ___ a small dog.', a:'is', o:['are','am','have'], h:'It is ...'},
      {q:'Choose the correct form: I ___ got a red bag.', a:'have', o:['has','am','is'], h:'I have got ...'},
      {q:'Choose the correct form: You ___ my best friend.', a:'are', o:['is','am','has'], h:'You are ...'},
      {q:'Choose the correct form: My dad ___ tall.', a:'is', o:['are','am','have'], h:'Dad = he → is.'},
      {q:'Choose the correct form: Kate ___ got a doll.', a:'has', o:['have','are','am'], h:'Kate = she → has.'},
      {q:'Choose the correct form: We ___ in class 4.', a:'are', o:['is','am','has'], h:'We are in class 4.'},
      {q:'Choose the correct form: ___ they at home?', a:'Are', o:['Is','Am','Has'], h:'Are they at home?'},
      {q:'Choose the correct form: ___ he your brother?', a:'Is', o:['Are','Am','Has'], h:'Is he your brother?'},
      {q:'Choose the correct form: My friends ___ got pencils.', a:'have', o:['has','is','am'], h:'Plural → have got.'},
      {q:'Choose the correct form: The room ___ big.', a:'is', o:['are','am','have'], h:'The room = it → is.'}
    ],
    speak4: [
      {q:'Which sentence is correct about one book?', a:'This is my book.', o:['This are my book.','These is my book.','This my book.'], h:'For one thing: This is ...'},
      {q:'Which sentence is correct about many pens?', a:'These are my pens.', o:['These is my pens.','This are my pens.','These my pens.'], h:'For many things: These are ...'},
      {q:'Which sentence correctly says that I like apples?', a:'I like apples.', o:['I likes apples.','I am like apples.','I liking apples.'], h:'I like ...'},
      {q:'Which sentence correctly says that he likes milk?', a:'He likes milk.', o:['He like milk.','He liking milk.','He is like milk.'], h:'He/she/it + likes.'},
      {q:'Which question is correct with can?', a:'Can you swim?', o:['Do you swim can?','Can swim you?','You can swim?'], h:'Question with can: Can you ... ?'},
      {q:'How do you answer a can-question positively?', a:'Yes, I can.', o:['Yes, I am.','Yes, I do.','Yes, I is.'], h:'Answer to can-question.'},
      {q:'How do you answer a can-question negatively?', a:'No, I cannot.', o:['No, I am not.','No, I do not.','No, I has not.'], h:'No, I cannot.'},
      {q:'Which sentence correctly tells your name?', a:'My name is Nina.', o:['My name Nina.','I name is Nina.','Mine name is Nina.'], h:'My name is ...'},
      {q:'Which sentence correctly tells your age?', a:'I am ten.', o:['I ten.','I is ten.','I are ten.'], h:'I am ten.'},
      {q:'Which sentence correctly says that she has a cat?', a:'She has a cat.', o:['She have a cat.','She is a cat.','She can a cat.'], h:'She has ...'},
      {q:'Which sentence correctly says that we are at school?', a:'We are at school.', o:['We is at school.','We am at school.','We has at school.'], h:'We are ...'},
      {q:'Which sentence correctly says the colour is green?', a:'It is green.', o:['It are green.','It am green.','It have green.'], h:'It is ...'},
      {q:'Which sentence correctly introduces your mum?', a:'This is my mum.', o:['This are my mum.','These is my mum.','This my mum.'], h:'This is ...'},
      {q:'Which sentence correctly talks about many toys?', a:'These are my toys.', o:['These is my toys.','This are my toys.','These my toys.'], h:'These are ...'},
      {q:'Which sentence correctly says that I can read?', a:'I can read.', o:['I read can.','Can I read.','I am read.'], h:'I can read.'},
      {q:'Which question correctly asks about liking dogs?', a:'Do you like dogs?', o:['Does you like dogs?','Like you dogs?','You do like dogs?'], h:'Do you like ... ?'},
      {q:'How do you answer a do-question positively?', a:'Yes, I do.', o:['Yes, I am.','Yes, I can.','Yes, I has.'], h:'Answer to do-question.'}
    ]
  };

  if(grade === '2'){
    injectAfter('rus', makeEnglishSubject([
      {id:'letters2', nm:'Буквы и звуки', gen:bankGen('Буквы и звуки', BANK2.letters2, '#2563eb', '#dbeafe'), th:TH.letters2, dot:'#2563eb'},
      {id:'words2', nm:'Первые слова', gen:bankGen('Первые слова', BANK2.words2, '#0d9488', '#ccfbf1'), th:TH.words2, dot:'#0d9488'}
    ]));
  }

  if(grade === '3'){
    injectAfter('rus', makeEnglishSubject([
      {id:'phrases3', nm:'Простые фразы', gen:bankGen('Простые фразы', BANK3.phrases3, '#2563eb', '#dbeafe'), th:TH.phrases3, dot:'#2563eb'},
      {id:'numcol3', nm:'Числа и цвета', gen:bankGen('Числа и цвета', BANK3.numcol3, '#0d9488', '#ccfbf1'), th:TH.numcol3, dot:'#0d9488'}
    ]));
  }

  if(grade === '4'){
    injectAfter('rus', makeEnglishSubject([
      {id:'be4', nm:'To be & have got', gen:bankGen('To be & have got', BANK4.be4, '#2563eb', '#dbeafe'), th:TH.be4, dot:'#2563eb'},
      {id:'speak4', nm:'Простые предложения', gen:bankGen('Простые предложения', BANK4.speak4, '#0d9488', '#ccfbf1'), th:TH.speak4, dot:'#0d9488'}
    ]));
  }
})();

;

//# sourceMappingURL=chunk_grade_content_wave15_english_wave86t.839380b3d8.js.map
