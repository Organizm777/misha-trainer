/* wave86t split from bundle_grade_content: wave14_english.js */
/* --- wave14_english.js --- */
(function(){
  if(typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  var grade = String(window.GRADE_NUM || '');
  if(['5','6','7'].indexOf(grade) < 0) return;

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

  ensureTheory('be5', `<h3>To be &amp; have got</h3>
    <div class="fm">I am / he is / we are<br>I have got / she has got</div>
    <p><b>To be</b> помогает сказать, кто ты и какой ты: <i>I am a pupil. She is happy.</i></p>
    <p><b>Have got</b> помогает сказать, что у кого-то есть: <i>I have got a bike. He has got a cat.</i></p>
    <p>В вопросах меняется порядок слов: <i>Are you ready? Has she got a pen?</i></p>`);
  ensureTheory('ps5', `<h3>Present Simple</h3>
    <div class="fm">I play / she plays<br>Do you play? / Does she play?</div>
    <p><b>Present Simple</b> нужен для привычек и того, что бывает часто: <i>every day, usually, often</i>.</p>
    <p>С <b>he / she / it</b> добавляем <b>-s</b>: <i>likes, goes, reads</i>.</p>
    <p>В вопросах используем <b>do / does</b>, а в отрицании — <b>don't / doesn't</b>.</p>`);
  ensureTheory('vocab5', `<h3>Basic Vocabulary</h3>
    <p>Для 5 класса важны слова про <b>семью, школу, животных, еду, цвета, числа, вещи в классе</b>.</p>
    <p>Учить лучше короткими фразами: <i>a red pen</i>, <i>my sister</i>, <i>two dogs</i>, <i>in the classroom</i>.</p>`);
  ensureTheory('phon5', `<h3>Alphabet &amp; Phonics</h3>
    <div class="fm">A B C ... Z<br>sh, ch, th, ck</div>
    <p>Важно различать <b>букву</b> и <b>звук</b>. Буква <i>a</i> может звучать по-разному в разных словах.</p>
    <p>Частые сочетания: <b>sh</b> как в <i>ship</i>, <b>ch</b> как в <i>chair</i>, <b>th</b> как в <i>this</i> или <i>thin</i>.</p>`);

  ensureTheory('be6', `<h3>To be &amp; have got — повторение</h3>
    <div class="fm">I am / you are / he is<br>I have got / she has got</div>
    <p>В 6 классе важно быстро различать, где нужен <b>to be</b>, а где <b>have got</b>.</p>
    <p><i>She is clever</i> — говорим про качество. <i>She has got a new phone</i> — говорим, что у неё есть вещь.</p>`);
  ensureTheory('ps6', `<h3>Present Simple Basics</h3>
    <div class="fm">He watches TV every day.<br>Does she like music?</div>
    <p>В 6 классе Present Simple нужен для режима дня, любимых занятий, расписания и простых фактов.</p>
    <p>После <b>he / she / it</b> не забывай окончание <b>-s / -es</b>.</p>`);
  ensureTheory('vocab6', `<h3>Basic Vocabulary</h3>
    <p>Здесь важны слова про <b>дом, еду, одежду, животных, хобби, школьные предметы</b>.</p>
    <p>Смотри на смысл в коротком контексте: <i>I feed my pet</i>, <i>We have maths on Monday</i>.</p>`);
  ensureTheory('phon6', `<h3>Alphabet &amp; Reading Patterns</h3>
    <p>В 6 классе полезно узнавать частые patterns: <b>ee = /i:/</b>, <b>oo</b> может быть долгим или коротким, <b>igh = /aɪ/</b>.</p>
    <p>Есть и <b>silent letters</b>: <i>knife</i>, <i>write</i>, <i>lamb</i>.</p>`);

  ensureTheory('pres7', `<h3>Present Simple &amp; Continuous</h3>
    <div class="fm">He plays every day.<br>He is playing now.</div>
    <p><b>Present Simple</b> — привычка, факт, расписание.</p>
    <p><b>Present Continuous</b> — действие прямо сейчас или временная ситуация.</p>
    <p>Слова-подсказки: <i>every day, usually</i> vs <i>now, at the moment, today</i>.</p>`);
  ensureTheory('past7', `<h3>Past Simple</h3>
    <div class="fm">worked / played / watched<br>went / saw / took / had</div>
    <p><b>Past Simple</b> нужен для законченных действий в прошлом.</p>
    <p>Правильные глаголы получают <b>-ed</b>, неправильные надо запоминать: <i>go → went</i>, <i>see → saw</i>.</p>`);
  ensureTheory('modal7', `<h3>Can / Could / Must</h3>
    <p><b>can</b> — умею / могу, <b>could</b> — умел / мог в прошлом, <b>must</b> — должен.</p>
    <p>Для совета часто используется <b>should</b>, а для запрета — <b>mustn't</b>.</p>`);
  ensureTheory('there7', `<h3>There is / There are</h3>
    <div class="fm">There is a book on the table.<br>There are three books in the bag.</div>
    <p><b>There is</b> — для одного предмета, <b>there are</b> — для нескольких.</p>
    <p>С неисчисляемыми существительными тоже часто <b>there is</b>: <i>There is some milk.</i></p>`);
  ensureTheory('vocab7', `<h3>Vocabulary A1–A2</h3>
    <p>Для 7 класса важны everyday words: <b>months, food, colours, school, body parts, hobbies, weather</b>.</p>
    <p>Лучше учить их не списком, а в коротких фразах: <i>cold weather</i>, <i>play chess</i>, <i>brush teeth</i>.</p>`);
  ensureTheory('spell7', `<h3>Spelling A1–A2</h3>
    <p>Частые tricky words: <b>Monday, Tuesday, January, school, teacher, brother, house, water</b>.</p>
    <p>Слово легче запомнить по кусочкам: <i>tea-cher</i>, <i>bro-ther</i>, <i>Jan-u-a-ry</i>.</p>`);

  var BANK5 = {
    be5: [
      {q:'Choose the correct form: I ___ ten years old.', a:'am', o:['is','are','have'], h:'With I we use am.'},
      {q:'Choose the correct form: My brother ___ very funny.', a:'is', o:['am','are','have'], h:'With he we use is.'},
      {q:'Choose the correct form: We ___ in the same class.', a:'are', o:['is','am','has'], h:'With we we use are.'},
      {q:'Choose the correct form: She ___ got a green bag.', a:'has', o:['have','is','are'], h:'She has got ...'},
      {q:'Choose the correct form: They ___ got two cats.', a:'have', o:['has','is','am'], h:'They have got ...'},
      {q:'Choose the correct form: ___ you happy today?', a:'Are', o:['Is','Am','Have'], h:'Question with you → Are you ...?'},
      {q:'Choose the correct form: ___ he got a pencil?', a:'Has', o:['Have','Is','Are'], h:'Question with he + got → Has he got ...?'},
      {q:'Choose the correct form: I ___ got a new ruler.', a:'have', o:['has','am','is'], h:'I have got ...'},
      {q:'Choose the correct form: It ___ a big dog.', a:'is', o:['are','am','have'], h:'It is ...'},
      {q:'Choose the correct form: ___ they at school now?', a:'Are', o:['Is','Am','Has'], h:'They → Are they ...?'},
      {q:'Choose the correct form: My mum ___ got a car.', a:'has', o:['have','are','am'], h:'Mum = she → has got.'},
      {q:'Choose the correct form: You ___ my best friend.', a:'are', o:['is','am','has'], h:'You are ...'}
    ],
    ps5: [
      {q:'Choose the correct form: She ___ milk every morning.', a:'drinks', o:['drink','is drinking','drank'], h:'Habit → Present Simple with she = drinks.'},
      {q:'Choose the correct form: I ___ my homework after school.', a:'do', o:['does','am doing','did'], h:'With I we use do.'},
      {q:'Choose the correct form: My dad ___ to work by bus.', a:'goes', o:['go','is going','went'], h:'He/she/it + goes.'},
      {q:'Choose the correct form: We ___ football on Fridays.', a:'play', o:['plays','are playing','played'], h:'With we we use play.'},
      {q:'Choose the correct form: ___ your sister like music?', a:'Does', o:['Do','Is','Has'], h:'Question with she → Does ...?'},
      {q:'Choose the correct form: They ___ not watch TV in the morning.', a:'do', o:['does','are','have'], h:'Negative: do not watch.'},
      {q:'Choose the correct form: He ___ his teeth every evening.', a:'brushes', o:['brush','brushing','brushed'], h:'He + brushes.'},
      {q:'Choose the correct form: ___ you go to bed at nine?', a:'Do', o:['Does','Are','Has'], h:'Question with you → Do ...?'},
      {q:'Choose the correct form: My cat ___ fish.', a:'likes', o:['like','is liking','liked'], h:'It likes ...'},
      {q:'Choose the correct form: Anna ___ in London.', a:'lives', o:['live','living','lived'], h:'She lives ...'},
      {q:'Choose the correct form: We ___ English on Monday.', a:'have', o:['has','are having','had'], h:'Timetable / routine → have.'},
      {q:'Choose the correct form: Tom ___ not get up late.', a:'does', o:['do','is','has'], h:'He does not get up late.'}
    ],
    vocab5: [
      {q:'Choose the correct word: I write with a ___ .', a:'pen', o:['pen','chair','window','shoe'], h:'You write with a pen.'},
      {q:'Choose the correct word: A dog and a cat are ___ .', a:'animals', o:['animals','colours','numbers','rooms'], h:'Dog and cat are animals.'},
      {q:'Choose the correct word: Red, blue and green are ___ .', a:'colours', o:['colours','days','jobs','drinks'], h:'These are colours.'},
      {q:'Choose the correct word: My mother and father are my ___ .', a:'parents', o:['parents','teachers','friends','pets'], h:'Mother and father = parents.'},
      {q:'Choose the correct word: We eat soup with a ___ .', a:'spoon', o:['spoon','pencil','ball','desk'], h:'A spoon is for soup.'},
      {q:'Choose the correct word: A room where you sleep is a ___ .', a:'bedroom', o:['bedroom','kitchen','garden','street'], h:'You sleep in a bedroom.'},
      {q:'Choose the correct word: Twelve o’clock at night is ___ .', a:'midnight', o:['midnight','breakfast','summer','window'], h:'12 at night = midnight.'},
      {q:'Choose the correct word: A lion is a wild ___ .', a:'animal', o:['animal','teacher','colour','month'], h:'A lion is an animal.'},
      {q:'Choose the correct word: We keep books on a ___ .', a:'shelf', o:['shelf','plate','sock','farm'], h:'Books go on a shelf.'},
      {q:'Choose the correct word: Monday, Tuesday and Friday are ___ .', a:'days', o:['days','foods','animals','toys'], h:'They are days of the week.'},
      {q:'Choose the correct word: Apples, bananas and pears are ___ .', a:'fruit', o:['fruit','furniture','clothes','weather'], h:'These are fruit.'},
      {q:'Choose the correct word: A rabbit is a small ___ .', a:'pet', o:['pet','city','school','season'], h:'A rabbit can be a pet.'}
    ],
    phon5: [
      {q:'Which letter comes after C?', a:'D', o:['B','E','F'], h:'A B C D ...'},
      {q:'Which pair has the same first sound as ship?', a:'shoe', o:['chair','this','cat'], h:'sh- like in ship and shoe.'},
      {q:'Which pair has the same first sound as chair?', a:'chicken', o:['shoe','three','game'], h:'ch- like in chair and chicken.'},
      {q:'Which word begins with the /th/ sound?', a:'three', o:['tree','green','plane'], h:'three starts with th.'},
      {q:'Which word has a silent k?', a:'knife', o:['kite','king','kitten'], h:'In knife the k is silent.'},
      {q:'Choose the correct beginning sound for cat.', a:'c', o:['t','a','g'], h:'Cat starts with c.'},
      {q:'Which word has the same ending sound as book?', a:'look', o:['cake','car','pen'], h:'book / look.'},
      {q:'Which letter is a vowel?', a:'E', o:['T','M','R'], h:'A, E, I, O, U are vowels.'},
      {q:'Which word has sh?', a:'fish', o:['cake','lamp','frog'], h:'fiSH.'},
      {q:'Which word has ch?', a:'chair', o:['mouse','snake','star'], h:'CHair.'},
      {q:'Which word starts with b?', a:'book', o:['apple','orange','ice'], h:'Book starts with b.'},
      {q:'Which letter comes before Z?', a:'Y', o:['X','W','V'], h:'... X Y Z'}
    ]
  };

  var BANK6 = {
    be6: [
      {q:'Choose the correct form: My friends ___ very kind.', a:'are', o:['is','am','has'], h:'Friends = they → are.'},
      {q:'Choose the correct form: I ___ not tired today.', a:'am', o:['is','are','have'], h:'I am not tired.'},
      {q:'Choose the correct form: Kate ___ got a little brother.', a:'has', o:['have','are','am'], h:'Kate = she → has got.'},
      {q:'Choose the correct form: We ___ got three lessons on Friday.', a:'have', o:['has','is','are'], h:'We have got ...'},
      {q:'Choose the correct form: ___ your parents at home?', a:'Are', o:['Is','Am','Have'], h:'Parents = they → Are ...?'},
      {q:'Choose the correct form: ___ he got a bike?', a:'Has', o:['Have','Is','Are'], h:'Has he got ...?'},
      {q:'Choose the correct form: My school bag ___ heavy.', a:'is', o:['are','have','has'], h:'Bag = it → is.'},
      {q:'Choose the correct form: They ___ not got a pet.', a:'have', o:['has','are','is'], h:'They have not got ...'},
      {q:'Choose the correct form: You ___ very good at English.', a:'are', o:['is','am','has'], h:'You are ...'},
      {q:'Choose the correct form: I ___ got two notebooks.', a:'have', o:['has','are','is'], h:'I have got ...'},
      {q:'Choose the correct form: ___ she your cousin?', a:'Is', o:['Are','Am','Has'], h:'Is she ...?'},
      {q:'Choose the correct form: Our classroom ___ on the second floor.', a:'is', o:['are','have','has'], h:'Classroom = it → is.'}
    ],
    ps6: [
      {q:'Choose the correct form: He ___ breakfast at seven.', a:'has', o:['have','is having','had'], h:'Routine with he → has.'},
      {q:'Choose the correct form: We ___ to school by bus.', a:'go', o:['goes','going','went'], h:'We go ...'},
      {q:'Choose the correct form: Mary ___ English on Tuesdays.', a:'studies', o:['study','is studying','studied'], h:'She studies ...'},
      {q:'Choose the correct form: ___ your brother play tennis?', a:'Does', o:['Do','Is','Has'], h:'Question with he → Does ...?'},
      {q:'Choose the correct form: I ___ not watch cartoons every day.', a:'do', o:['does','am','have'], h:'I do not watch ...'},
      {q:'Choose the correct form: My teacher ___ a lot of books.', a:'reads', o:['read','is reading','readed'], h:'Teacher = she/he → reads.'},
      {q:'Choose the correct form: ___ they finish school at two?', a:'Do', o:['Does','Are','Has'], h:'They → Do ...?'},
      {q:'Choose the correct form: Tom ___ his room on Saturdays.', a:'cleans', o:['clean','cleaning','cleaned'], h:'Tom cleans ...'},
      {q:'Choose the correct form: We ___ maths on Monday and Thursday.', a:'have', o:['has','having','had'], h:'Timetable → have.'},
      {q:'Choose the correct form: She ___ not like noisy places.', a:'does', o:['do','is','has'], h:'She does not like ...'},
      {q:'Choose the correct form: My dog ___ in the garden every morning.', a:'runs', o:['run','is running','ran'], h:'Dog = it → runs.'},
      {q:'Choose the correct form: ___ you usually help at home?', a:'Do', o:['Does','Are','Has'], h:'You → Do you ...?'}
    ],
    vocab6: [
      {q:'Choose the correct word: We keep milk in the ___.', a:'fridge', o:['fridge','garden','sofa','bridge'], h:'Milk stays in the fridge.'},
      {q:'Choose the correct word: A T-shirt, jeans and a coat are ___.', a:'clothes', o:['clothes','furniture','animals','months'], h:'They are clothes.'},
      {q:'Choose the correct word: We use a ___ to open a door.', a:'key', o:['key','soup','leaf','pillow'], h:'A key opens a door.'},
      {q:'Choose the correct word: Maths, History and English are school ___.', a:'subjects', o:['subjects','seasons','toys','rooms'], h:'They are school subjects.'},
      {q:'Choose the correct word: I feed my ___ every morning.', a:'pet', o:['pet','carpet','street','cloud'], h:'You feed a pet.'},
      {q:'Choose the correct word: In winter people wear a warm ___.', a:'jacket', o:['jacket','plate','window','pencil'], h:'A jacket is a piece of clothing.'},
      {q:'Choose the correct word: Soup, salad and pasta are types of ___.', a:'food', o:['food','weather','transport','music'], h:'These are kinds of food.'},
      {q:'Choose the correct word: A doctor works in a ___.', a:'hospital', o:['hospital','forest','kitchen','garage'], h:'Doctors work in hospitals.'},
      {q:'Choose the correct word: A hobby many people enjoy after school is ___.', a:'reading', o:['reading','ceiling','weather','garden'], h:'Reading can be a hobby.'},
      {q:'Choose the correct word: My aunt is my mother’s ___.', a:'sister', o:['sister','teacher','student','neighbour'], h:'Aunt = mother’s sister.'},
      {q:'Choose the correct word: We sit on a ___ in the living room.', a:'sofa', o:['sofa','spoon','river','shoe'], h:'A sofa is in the living room.'},
      {q:'Choose the correct word: A lion lives in the wild, but a cow lives on a ___.', a:'farm', o:['farm','lamp','desk','wall'], h:'Cows usually live on a farm.'}
    ],
    phon6: [
      {q:'Which word has a silent w?', a:'write', o:['winter','water','window'], h:'The w is silent in write.'},
      {q:'Which word has the /aɪ/ sound like night?', a:'light', o:['sit','red','cup'], h:'night / light.'},
      {q:'Which word has ee = /i:/?', a:'green', o:['bread','head','great'], h:'ee often makes a long /i:/ sound.'},
      {q:'Which word begins with th?', a:'think', o:['sink','drink','pink'], h:'think starts with th.'},
      {q:'Which word has ch?', a:'cheese', o:['shoe','this','boat'], h:'cheese has ch.'},
      {q:'Which word has sh?', a:'sheep', o:['cheap','sleep','step'], h:'sheep starts with sh.'},
      {q:'Which word has a silent b?', a:'lamb', o:['boat','blue','banana'], h:'The b is silent in lamb.'},
      {q:'Which word has oo?', a:'book', o:['bag','cat','glass'], h:'book has oo.'},
      {q:'Which word starts with a vowel sound?', a:'apple', o:['dog','pen','table'], h:'apple starts with a vowel sound.'},
      {q:'Which word has the same ending sound as cake?', a:'lake', o:['lamp','look','pen'], h:'cake / lake.'},
      {q:'Which word has igh?', a:'right', o:['ring','road','rest'], h:'r-igh-t.'},
      {q:'Which word begins with the same sound as phone?', a:'photo', o:['potato','fox','fish'], h:'ph can sound like /f/.'}
    ]
  };

  var BANK7 = {
    pres7: [
      {q:'Choose the correct form: He ___ football every day.', a:'plays', o:['is playing','play','played'], h:'Every day → Present Simple.'},
      {q:'Choose the correct form: Look! He ___ football now.', a:'is playing', o:['plays','play','played'], h:'Now → Present Continuous.'},
      {q:'Choose the correct form: We ___ dinner at the moment.', a:'are cooking', o:['cook','cooks','cooked'], h:'At the moment → Continuous.'},
      {q:'Choose the correct form: My mum usually ___ tea in the evening.', a:'drinks', o:['is drinking','drink','drank'], h:'Usually → Present Simple.'},
      {q:'Choose the correct form: I ___ my friend today because she is ill.', a:'am helping', o:['help','helps','helped'], h:'Today as a temporary action.'},
      {q:'Choose the correct form: ___ you often read before bed?', a:'Do', o:['Does','Are','Is'], h:'Habit question → Do you ...?'},
      {q:'Choose the correct form: ___ she doing her project now?', a:'Is', o:['Does','Do','Has'], h:'Continuous question → Is she ...?'},
      {q:'Choose the correct form: They ___ not watching TV now.', a:'are', o:['do','does','is'], h:'They are not watching ...'},
      {q:'Choose the correct form: Tom ___ to school by bike every day.', a:'goes', o:['is going','go','went'], h:'Routine with Tom → goes.'},
      {q:'Choose the correct form: I ___ for my test this week.', a:'am studying', o:['study','studies','studied'], h:'Temporary action around now.'},
      {q:'Choose the correct form: The train ___ at 8 every morning.', a:'leaves', o:['is leaving now','leave','left'], h:'Timetable can use Present Simple.'},
      {q:'Choose the correct form: We ___ not go swimming in winter.', a:'do', o:['are','does','is'], h:'We do not go ...'}
    ],
    past7: [
      {q:'Choose the correct form: Yesterday we ___ a new film.', a:'watched', o:['watch','are watching','watches'], h:'Finished past action → Past Simple.'},
      {q:'Choose the correct form: Last week my brother ___ to Moscow.', a:'went', o:['go','goes','gone'], h:'Past form of go = went.'},
      {q:'Choose the correct form: She ___ her homework after dinner.', a:'did', o:['do','does','done'], h:'Past form of do = did.'},
      {q:'Choose the correct form: I ___ my keys at home.', a:'left', o:['leave','leaved','leaving'], h:'Past form of leave = left.'},
      {q:'Choose the correct form: They ___ not come to school yesterday.', a:'did', o:['do','were','have'], h:'Past negative: did not come.'},
      {q:'Choose the correct form: ___ you see that message?', a:'Did', o:['Do','Does','Were'], h:'Past question → Did you see ...?'},
      {q:'Choose the correct form: We ___ in the park two days ago.', a:'played', o:['play','plays','playing'], h:'Regular verb in the past.'},
      {q:'Choose the correct form: My dad ___ me a funny story.', a:'told', o:['tell','tells','telling'], h:'Past form of tell = told.'},
      {q:'Choose the correct form: Anna ___ breakfast at home this morning.', a:'had', o:['has','have','having'], h:'Past form of have = had.'},
      {q:'Choose the correct form: The lesson ___ at nine yesterday.', a:'started', o:['start','starts','starting'], h:'Regular verb in the past.'},
      {q:'Choose the correct form: He ___ a photo of the castle.', a:'took', o:['take','takes','taken'], h:'Past form of take = took.'},
      {q:'Choose the correct form: We ___ not know the answer.', a:'did', o:['do','were','are'], h:'Past negative uses did not know.'}
    ],
    modal7: [
      {q:'Choose the correct modal: I ___ swim very well.', a:'can', o:['must','should','had'], h:'Ability now → can.'},
      {q:'Choose the correct modal: When I was five, I ___ not read.', a:'could', o:['can','must','should'], h:'Past ability / inability → could.'},
      {q:'Choose the correct modal: Students ___ do their homework.', a:'must', o:['can','could','may'], h:'Strong obligation → must.'},
      {q:'Choose the correct modal: You look tired. You ___ rest.', a:'should', o:['mustn’t','can’t','had'], h:'Advice → should.'},
      {q:'Choose the correct modal: We ___ run in the corridor.', a:'mustn’t', o:['can','should','could'], h:'Rule / prohibition.'},
      {q:'Choose the correct modal: ___ I use your pen, please?', a:'Can', o:['Must','Had','Should'], h:'Permission request.'},
      {q:'Choose the correct modal: My grandmother ___ speak French when she was young.', a:'could', o:['can','must','should'], h:'Past ability.'},
      {q:'Choose the correct modal: You ___ be kind to younger children.', a:'should', o:['mustn’t','can’t','had'], h:'Advice / good idea.'},
      {q:'Choose the correct modal: I ___ finish this today because it is for tomorrow’s class.', a:'must', o:['could','might','may'], h:'Necessary today → must.'},
      {q:'Choose the correct modal: She ___ play the piano very well.', a:'can', o:['must','had','should'], h:'Ability.'},
      {q:'Choose the correct modal: We ___ touch that wire. It is dangerous.', a:'mustn’t', o:['can','could','may'], h:'Danger → prohibition.'},
      {q:'Choose the correct modal: ___ you help me with this bag?', a:'Can', o:['Must','Had','Should'], h:'Request → Can you ...?'}
    ],
    there7: [
      {q:'Choose the correct form: There ___ a book on the table.', a:'is', o:['are','am','be'], h:'One book → there is.'},
      {q:'Choose the correct form: There ___ three apples in the bag.', a:'are', o:['is','am','was'], h:'Three apples → there are.'},
      {q:'Choose the correct form: There ___ some milk in the fridge.', a:'is', o:['are','am','were'], h:'Milk is uncountable.'},
      {q:'Choose the correct form: There ___ two windows in our classroom.', a:'are', o:['is','am','be'], h:'Two windows → are.'},
      {q:'Choose the correct form: ___ there a swimming pool near your house?', a:'Is', o:['Are','Do','Does'], h:'One swimming pool → Is there ...?'},
      {q:'Choose the correct form: ___ there any pencils on the desk?', a:'Are', o:['Is','Does','Has'], h:'Plural pencils → Are there ...?'},
      {q:'Choose the correct form: There ___ not any cheese on the plate.', a:'is', o:['are','am','be'], h:'Cheese is uncountable.'},
      {q:'Choose the correct form: There ___ a lot of students in the hall.', a:'are', o:['is','am','was'], h:'Students = plural.'},
      {q:'Choose the correct form: There ___ an old bridge over the river.', a:'is', o:['are','am','were'], h:'One bridge → is.'},
      {q:'Choose the correct form: There ___ many trees in the park.', a:'are', o:['is','am','be'], h:'Trees = plural.'},
      {q:'Choose the correct form: There ___ a cat and two kittens in the box.', a:'is', o:['are','am','were'], h:'With a singular noun first, beginners often use is.'},
      {q:'Choose the correct form: There ___ my shoes under the bed.', a:'are', o:['is','am','be'], h:'Shoes = plural.'}
    ],
    vocab7: [
      {q:'Choose the correct word: We wear gloves on our ___.', a:'hands', o:['hands','heads','ears','knees'], h:'Gloves go on hands.'},
      {q:'Choose the correct word: January is the first ___ of the year.', a:'month', o:['month','colour','subject','meal'], h:'January is a month.'},
      {q:'Choose the correct word: Carrots and tomatoes are ___.', a:'vegetables', o:['vegetables','animals','clothes','seasons'], h:'They are vegetables.'},
      {q:'Choose the correct word: Chess and tennis are kinds of ___.', a:'hobbies', o:['hobbies','weather','rooms','transport'], h:'They can be hobbies.'},
      {q:'Choose the correct word: Rain, snow and wind describe the ___.', a:'weather', o:['weather','family','classroom','address'], h:'These are weather words.'},
      {q:'Choose the correct word: We brush our ___ every morning.', a:'teeth', o:['teeth','eyes','hands','hairpins'], h:'Brush your teeth.'},
      {q:'Choose the correct word: A library is a place with many ___.', a:'books', o:['books','bikes','animals','cakes'], h:'Libraries have books.'},
      {q:'Choose the correct word: Summer, autumn, winter and spring are ___.', a:'seasons', o:['seasons','cities','tests','jobs'], h:'These are seasons.'},
      {q:'Choose the correct word: Bread, cheese and soup are kinds of ___.', a:'food', o:['food','sports','music','clothes'], h:'They are food.'},
      {q:'Choose the correct word: Maths and English are school ___.', a:'subjects', o:['subjects','brothers','animals','houses'], h:'They are subjects.'},
      {q:'Choose the correct word: Blue, yellow and purple are ___.', a:'colours', o:['colours','months','rooms','pets'], h:'These are colours.'},
      {q:'Choose the correct word: A football, a racket and a bike are sports ___.', a:'equipment', o:['equipment','weather','vegetables','countries'], h:'Things for sport.'}
    ],
    spell7: [
      {q:'Choose the correct spelling of Monday.', a:'Monday', o:['Mondey','Munday','Mondai'], h:'Monday.'},
      {q:'Choose the correct spelling of Tuesday.', a:'Tuesday', o:['Tuseday','Tusday','Teusday'], h:'Tuesday.'},
      {q:'Choose the correct spelling of January.', a:'January', o:['Janury','Jenuary','Januaary'], h:'January.'},
      {q:'Choose the correct spelling of teacher.', a:'teacher', o:['techer','teecher','teachar'], h:'teacher.'},
      {q:'Choose the correct spelling of brother.', a:'brother', o:['brothr','brothar','brather'], h:'brother.'},
      {q:'Choose the correct spelling of school.', a:'school', o:['scholl','scool','shool'], h:'school.'},
      {q:'Choose the correct spelling of friend.', a:'friend', o:['frend','freind','frand'], h:'friend.'},
      {q:'Choose the correct spelling of house.', a:'house', o:['hause','houze','hous'], h:'house.'},
      {q:'Choose the correct spelling of water.', a:'water', o:['woter','waater','watter'], h:'water.'},
      {q:'Choose the correct spelling of apple.', a:'apple', o:['appel','aplpe','aple'], h:'apple.'},
      {q:'Choose the correct spelling of father.', a:'father', o:['fathar','fatrher','fether'], h:'father.'},
      {q:'Choose the correct spelling of sister.', a:'sister', o:['sistar','sistr','seester'], h:'sister.'}
    ]
  };

  if(grade === '5'){
    injectAfter('rus', {id:'eng', nm:'Английский', ic:'🇬🇧', date:'', cl:ENG_COLOR, bg:ENG_BG, tops:[
      {id:'be5', nm:'To Be & Have Got', gen:bankGen('To Be & Have Got', BANK5.be5, ENG_COLOR, ENG_BG), th:TH.be5, dot:'#2563eb'},
      {id:'ps5', nm:'Present Simple Basics', gen:bankGen('Present Simple Basics', BANK5.ps5, ENG_COLOR, ENG_BG), th:TH.ps5, dot:'#0d9488'},
      {id:'vocab5', nm:'Basic Vocabulary', gen:bankGen('Basic Vocabulary', BANK5.vocab5, ENG_COLOR, ENG_BG), th:TH.vocab5, dot:'#16a34a'},
      {id:'phon5', nm:'Alphabet & Phonics', gen:bankGen('Alphabet & Phonics', BANK5.phon5, ENG_COLOR, ENG_BG), th:TH.phon5, dot:'#ea580c'}
    ]});
  }

  if(grade === '6'){
    injectAfter('rus', {id:'eng', nm:'Английский', ic:'🇬🇧', date:'', cl:ENG_COLOR, bg:ENG_BG, tops:[
      {id:'be6', nm:'To Be & Have Got', gen:bankGen('To Be & Have Got', BANK6.be6, ENG_COLOR, ENG_BG), th:TH.be6, dot:'#2563eb'},
      {id:'ps6', nm:'Present Simple Basics', gen:bankGen('Present Simple Basics', BANK6.ps6, ENG_COLOR, ENG_BG), th:TH.ps6, dot:'#0d9488'},
      {id:'vocab6', nm:'Basic Vocabulary', gen:bankGen('Basic Vocabulary', BANK6.vocab6, ENG_COLOR, ENG_BG), th:TH.vocab6, dot:'#16a34a'},
      {id:'phon6', nm:'Alphabet & Reading Patterns', gen:bankGen('Alphabet & Reading Patterns', BANK6.phon6, ENG_COLOR, ENG_BG), th:TH.phon6, dot:'#ea580c'}
    ]});
  }

  if(grade === '7'){
    injectAfter('rus', {id:'eng', nm:'Английский', ic:'🇬🇧', date:'', cl:ENG_COLOR, bg:ENG_BG, tops:[
      {id:'pres7', nm:'Present Simple & Continuous', gen:bankGen('Present Simple & Continuous', BANK7.pres7, ENG_COLOR, ENG_BG), th:TH.pres7, dot:'#2563eb'},
      {id:'past7', nm:'Past Simple', gen:bankGen('Past Simple', BANK7.past7, ENG_COLOR, ENG_BG), th:TH.past7, dot:'#0d9488'},
      {id:'modal7', nm:'Can / Could / Must', gen:bankGen('Can / Could / Must', BANK7.modal7, ENG_COLOR, ENG_BG), th:TH.modal7, dot:'#7c3aed'},
      {id:'there7', nm:'There is / There are', gen:bankGen('There is / There are', BANK7.there7, ENG_COLOR, ENG_BG), th:TH.there7, dot:'#16a34a'},
      {id:'vocab7', nm:'Vocabulary A1–A2', gen:bankGen('Vocabulary A1–A2', BANK7.vocab7, ENG_COLOR, ENG_BG), th:TH.vocab7, dot:'#ea580c'},
      {id:'spell7', nm:'Spelling A1–A2', gen:bankGen('Spelling A1–A2', BANK7.spell7, ENG_COLOR, ENG_BG), th:TH.spell7, dot:'#ca8a04'}
    ]});
  }
})();

;
