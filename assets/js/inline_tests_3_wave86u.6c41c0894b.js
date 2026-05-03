
// ═══ MOTIVATION TEST ═══
const MOTIV_Q=[
{q:'Я учусь, потому что мне интересно узнавать новое',d:'i'},
{q:'Мне важны хорошие оценки, чтобы родители были довольны',d:'e'},
{q:'Я стараюсь разобраться в теме, даже если это не задавали',d:'i'},
{q:'Я учусь, чтобы поступить в хороший вуз',d:'e'},
{q:'Мне нравится решать сложные задачи — это как головоломка',d:'i'},
{q:'Я стараюсь, потому что не хочу быть хуже других',d:'e'},
{q:'Я читаю дополнительные книги по предметам, которые мне нравятся',d:'i'},
{q:'Похвала учителя или родителей мотивирует меня больше всего',d:'e'},
{q:'Мне важно понять «почему», а не просто запомнить',d:'i'},
{q:'Если бы не экзамены, я бы не учил многие предметы',d:'e'},
{q:'Я занимаюсь предметом, даже когда знаю, что контрольной не будет',d:'i'},
{q:'Мне важно, что обо мне думают одноклассники',d:'e'},
{q:'Я получаю удовольствие, когда наконец понимаю сложную тему',d:'i'},
{q:'Главное для меня — получить аттестат и забыть',d:'e'},
{q:'Я бы хотел изучать некоторые предметы глубже, чем дают в школе',d:'i'},
];
function launchMotiv(){psychMode2='motiv';pCur2=0;pAns2=[];go('psych');renderPsych2()}

// ═══ ANXIETY TEST ═══
const ANXIETY_Q=[
{q:'Перед контрольной я сильно волнуюсь'},
{q:'Мне трудно заснуть, если завтра важный день'},
{q:'Я часто думаю: «а вдруг я не справлюсь?»'},
{q:'Когда вызывают к доске, у меня потеют ладони'},
{q:'Я переживаю из-за оценок больше, чем мои друзья'},
{q:'Мне трудно сосредоточиться, когда я нервничаю'},
{q:'Я часто проверяю, правильно ли я всё сделал'},
{q:'Плохая оценка портит мне настроение на весь день'},
{q:'Я боюсь ошибиться на глазах у других'},
{q:'Перед экзаменом у меня болит живот или голова'},
{q:'Я избегаю ситуаций, где могу выглядеть глупо'},
{q:'Мне сложно попросить помощь у учителя'},
{q:'Я часто сравниваю себя с другими и чувствую себя хуже'},
{q:'Неожиданная самостоятельная — это кошмар'},
{q:'Я переживаю даже из-за мелких ошибок'},
];
function launchAnxiety(){psychMode2='anxiety';pCur2=0;pAns2=[];go('psych');renderPsych2()}

// ═══ HOLLAND / RIASEC ═══
const HOLLAND_Q=[
{q:'Мне нравится работать руками, мастерить, чинить',d:'R'},
{q:'Я люблю проводить эксперименты и исследования',d:'I'},
{q:'Мне нравится рисовать, музицировать, придумывать',d:'A'},
{q:'Я люблю помогать людям, объяснять, учить',d:'S'},
{q:'Мне нравится организовывать и руководить',d:'E'},
{q:'Я люблю работать с таблицами, числами, файлами',d:'C'},
{q:'Мне интересна техника, механизмы, компьютеры',d:'R'},
{q:'Я люблю анализировать данные и искать закономерности',d:'I'},
{q:'Мне нравится придумывать необычные решения',d:'A'},
{q:'Я хорошо чувствую настроение других людей',d:'S'},
{q:'Мне нравится убеждать людей и вести переговоры',d:'E'},
{q:'Я аккуратен и люблю порядок в документах',d:'C'},
{q:'Я предпочитаю работать на воздухе, а не в офисе',d:'R'},
{q:'Мне нравится читать научные статьи и книги',d:'I'},
{q:'Я люблю писать рассказы, стихи или вести блог',d:'A'},
{q:'Мне важно, чтобы моя работа помогала другим',d:'S'},
{q:'Я люблю соревноваться и побеждать',d:'E'},
{q:'Мне нравится следовать чёткому плану и инструкции',d:'C'},
{q:'Мне нравится собирать и разбирать вещи',d:'R'},
{q:'Я люблю решать логические головоломки',d:'I'},
{q:'Мне нравится фотографировать, снимать видео',d:'A'},
{q:'Я легко нахожу общий язык с новыми людьми',d:'S'},
{q:'Я хочу открыть свой бизнес',d:'E'},
{q:'Мне нравится работа, где всё предсказуемо и стабильно',d:'C'},
{q:'Я люблю спорт и физическую активность',d:'R'},
{q:'Мне интересно, как устроен мир вокруг',d:'I'},
{q:'Мне нравится выступать на сцене',d:'A'},
{q:'Я хочу работать с детьми или в медицине',d:'S'},
{q:'Мне нравится управлять проектами',d:'E'},
{q:'Я внимателен к деталям и редко ошибаюсь',d:'C'},
];
function launchHolland(){psychMode2='holland';pCur2=0;pAns2=[];go('psych');renderPsych2()}

// ═══ PSYCHOLOGY: THEORY vs PRACTICE ═══
const PSYCH_KNOW=[
// THEORY (t) — textbook knowledge
{q:'Какой психолог считается основателем психоанализа?',o:['Фрейд','Юнг','Павлов','Скиннер'],a:'Фрейд',d:'t',h:'Зигмунд Фрейд, начало XX века'},
{q:'Что находится на вершине иерархии потребностей Маслоу?',o:['самореализация','безопасность','уважение','любовь'],a:'самореализация',d:'t',h:'Пирамида Маслоу'},
{q:'Кто впервые подробно описал условный рефлекс в классических опытах с животными?',o:['Павлов','Фрейд','Выготский','Скиннер'],a:'Павлов',d:'t',h:'Собака Павлова, слюноотделение'},
{q:'Сколько основных стадий когнитивного развития выделял Жан Пиаже?',o:['4','3','5','6'],a:'4',d:'t',h:'Сенсомоторная, дооперациональная, конкретных операций, формальных'},
{q:'Какие процессы изучает когнитивная психология?',o:['мышление, память, восприятие','бессознательное','только внешнее поведение','только поведение групп'],a:'мышление, память, восприятие',d:'t',h:'Познавательные процессы'},
{q:'С каким психологом связан термин «зона ближайшего развития»?',o:['Выготского','Пиаже','Фрейда','Юнга'],a:'Выготского',d:'t',h:'То, что ребёнок может с помощью взрослого'},
{q:'Что является главным предметом изучения бихевиоризма?',o:['наблюдаемое поведение','сны','бессознательное','архетипы'],a:'наблюдаемое поведение',d:'t',h:'Уотсон, Скиннер — стимул-реакция'},
{q:'С теорией какого психолога связано понятие «архетипы»?',o:['Юнга','Фрейда','Адлера','Маслоу'],a:'Юнга',d:'t',h:'Коллективное бессознательное'},
{q:'Что означает эффект ореола в оценке человека?',o:['общее впечатление влияет на оценку деталей','человек быстрее забывает информацию','мотивация всегда растёт после похвалы','страх усиливает внимание'],a:'общее впечатление влияет на оценку деталей',d:'t',h:'Красивого часто считают умным'},
{q:'Что называют когнитивным диссонансом?',o:['дискомфорт от противоречивых убеждений','обычное забывание фактов','страх перед новой ситуацией','радость от успеха'],a:'дискомфорт от противоречивых убеждений',d:'t',h:'Фестингер, 1957'},
{q:'Что обычно называют Стокгольмским синдромом?',o:['привязанность жертвы к агрессору','страх толпы','боязнь высоты','любовь к строгому порядку'],a:'привязанность жертвы к агрессору',d:'t',h:'Жертва может сочувствовать агрессору'},
{q:'Что описывает эффект Даннинга-Крюгера?',o:['люди с низкой компетенцией склонны переоценивать свой уровень','компетентные люди всегда переоценивают себя','все люди оценивают себя одинаково точно','никто не способен оценить свои знания'],a:'люди с низкой компетенцией склонны переоценивать свой уровень',d:'t',h:'А более компетентные чаще видят ограничения своих знаний'},
{q:'Какая последовательность соответствует пяти стадиям горя по модели Кюблер-Росс?',o:['отрицание, гнев, торг, депрессия, принятие','страх, гнев, грусть, радость, покой','шок, боль, адаптация, рост, мудрость','паника, ступор, слёзы, покой, забвение'],a:'отрицание, гнев, торг, депрессия, принятие',d:'t',h:'Модель принятия утраты'},
{q:'Сколько элементов обычно связывают с классической оценкой объёма кратковременной памяти?',o:['7±2','3±1','12±3','20±5'],a:'7±2',d:'t',h:'Магическое число Миллера'},
{q:'Что показали классические эксперименты Милгрэма о подчинении авторитету?',o:['люди могут подчиняться авторитету, даже причиняя страдания другим','люди никогда не подчиняются авторитету','дети всегда агрессивнее взрослых','люди всегда точно оценивают опасность приказа'],a:'люди могут подчиняться авторитету, даже причиняя страдания другим',d:'t',h:'Подчинение авторитету, 1963'},
// PRACTICE (p) — emotional intelligence, real situations
{q:'Друг получил двойку и злится. Лучшая реакция:',o:['выслушать и посочувствовать','сказать «сам виноват»','дать совет сразу','отвлечь шуткой'],a:'выслушать и посочувствовать',d:'p',h:'Сначала эмпатия, потом советы'},
{q:'Одноклассник всё время перебивает. Что эффективнее:',o:['сказать спокойно: «дай мне договорить»','накричать','молча терпеть','пожаловаться учителю'],a:'сказать спокойно: «дай мне договорить»',d:'p',h:'Я-высказывание, без агрессии'},
{q:'Ты видишь, что тихий одноклассник сидит один на перемене. Что это может значить:',o:['может, ему плохо, стоит подойти','ему всё равно','он просто странный','не моё дело'],a:'может, ему плохо, стоит подойти',d:'p',h:'Внимательность к другим'},
{q:'Перед экзаменом очень волнуешься. Что поможет:',o:['глубокое дыхание и подготовка','кофе и энергетики','не думать об этом','заболеть и не идти'],a:'глубокое дыхание и подготовка',d:'p',h:'Саморегуляция'},
{q:'Друг просит списать. Лучший ответ:',o:['предложить объяснить тему вместо списывания','дать списать','отказать грубо','проигнорировать'],a:'предложить объяснить тему вместо списывания',d:'p',h:'Помощь, а не медвежья услуга'},
{q:'Тебя критикуют несправедливо. Что делать:',o:['спокойно объяснить свою позицию','ответить тем же','заплакать','промолчать и затаить обиду'],a:'спокойно объяснить свою позицию',d:'p',h:'Ассертивность'},
{q:'В группе один человек не работает. Что эффективнее:',o:['поговорить с ним и дать посильную задачу','пожаловаться','сделать за него','исключить'],a:'поговорить с ним и дать посильную задачу',d:'p',h:'Вовлечение, а не наказание'},
{q:'Друг хвастается, а тебе завидно. Что здоровее:',o:['порадоваться за друга, а свои чувства осознать','обесценить его успех','перестать общаться','тоже начать хвастаться'],a:'порадоваться за друга, а свои чувства осознать',d:'p',h:'Осознание эмоций'},
{q:'Новенький в классе ни с кем не общается. Что поможет:',o:['пригласить в свою компанию','подождать, пока сам подойдёт','игнорировать','обсуждать за спиной'],a:'пригласить в свою компанию',d:'p',h:'Инициатива в коммуникации'},
{q:'Ты ошибся при всех. Что лучше:',o:['признать ошибку спокойно','отрицать','обвинить других','расплакаться'],a:'признать ошибку спокойно',d:'p',h:'Здоровое отношение к ошибкам'},
{q:'Мама устала после работы. Что покажет эмпатию:',o:['предложить помочь, не дожидаясь просьбы','ничего не делать','попросить купить телефон','пожаловаться на свои проблемы'],a:'предложить помочь, не дожидаясь просьбы',d:'p',h:'Проактивная забота'},
{q:'Два друга поссорились и просят тебя выбрать сторону:',o:['выслушать обоих, не принимая сторону','выбрать того, кто популярнее','перестать общаться с обоими','рассказать всем о ссоре'],a:'выслушать обоих, не принимая сторону',d:'p',h:'Нейтральность и медиация'},
{q:'Ты заметил, что друг стал грустным и замкнутым. Что делать:',o:['мягко спросить, всё ли в порядке','не лезть','высмеять','сказать «не грусти»'],a:'мягко спросить, всё ли в порядке',d:'p',h:'Бережное внимание'},
{q:'Учитель поставил несправедливую оценку. Как лучше:',o:['подойти после урока и спокойно обсудить','устроить скандал на уроке','молча обидеться','написать жалобу директору'],a:'подойти после урока и спокойно обсудить',d:'p',h:'Конструктивный диалог'},
{q:'Тебе кажется, что тебя никто не понимает. Это значит:',o:['стоит попробовать выразить чувства словами','никто не поймёт никогда','нужно стать другим','все против тебя'],a:'стоит попробовать выразить чувства словами',d:'p',h:'Коммуникация — ключ'},
];
function launchPsychKnow(){psychMode2='psychknow';pCur2=0;pAns2=[];go('psych');renderPsych2()}

// ═══ UNIFIED ENGINE v2 (for Likert + multiple choice) ═══
let psychMode2='',pCur2=0,pAns2=[];

function renderPsych2(){
  const mode=psychMode2;
  let qs,title;
  if(mode==='motiv'){qs=MOTIV_Q;title='💪 Мотивация'}
  else if(mode==='anxiety'){qs=ANXIETY_Q;title='😰 Тревожность'}
  else if(mode==='holland'){qs=HOLLAND_Q;title='🧭 Профориентация'}
  else if(mode==='psychknow'){qs=PSYCH_KNOW;title='🔬 Психология'}
  else return;

  if(pCur2>=qs.length){finishPsych2(mode);return}

  document.getElementById('p-title').textContent=title;
  document.getElementById('p-progress').textContent=(pCur2+1)+'/'+qs.length;
  document.getElementById('p-pgfill').style.width=Math.round(pCur2/qs.length*100)+'%';

  const q=qs[pCur2];
  document.getElementById('p-question').textContent=q.q;
  const oe=document.getElementById('p-opts');

  if(mode==='psychknow'){
    // Multiple choice
    oe.innerHTML=q.o.map((o,i)=>'<div class="likert-opt" data-wave86u-on-click="pSel2('+i+')"><div class="likert-dot"></div>'+o+'</div>').join('');
  } else if(mode==='holland'){
    oe.innerHTML=['Да, точно','Скорее да','Скорее нет','Нет'].map((l,i)=>'<div class="likert-opt" data-wave86u-on-click="pSel2('+i+')"><div class="likert-dot"></div>'+l+'</div>').join('');
  } else {
    // Likert 4-point
    oe.innerHTML=['Да, это про меня','Скорее да','Скорее нет','Нет, не про меня'].map((l,i)=>'<div class="likert-opt" data-wave86u-on-click="pSel2('+i+')"><div class="likert-dot"></div>'+l+'</div>').join('');
  }
}


function wave92tLikertTarget2(){
  let ev=null;
  try{ev=(typeof event!=='undefined')?event:null}catch(_){ev=null}
  let el=ev&&ev.currentTarget&&ev.currentTarget.classList?ev.currentTarget:null;
  if((!el||el===document)&&ev&&ev.target&&ev.target.closest)el=ev.target.closest('.likert-opt');
  return el&&el.classList?el:null;
}
function pSel2(val){
  pAns2.push(val);
  const clicked=wave92tLikertTarget2();if(clicked)clicked.classList.add('selected');
  setTimeout(()=>{pCur2++;renderPsych2()},300);
}

function finishPsych2(mode){
  let h='';
  if(mode==='motiv'){
    let iScore=0,eScore=0;
    MOTIV_Q.forEach((q,i)=>{const v=pAns2[i];const pts=v<=1?1:0;if(q.d==='i')iScore+=pts;else eScore+=pts});
    const iPct=Math.round(iScore/MOTIV_Q.filter(q=>q.d==='i').length*100);
    const ePct=Math.round(eScore/MOTIV_Q.filter(q=>q.d==='e').length*100);
    const dominant=iPct>ePct?'Внутренняя':'Внешняя';
    const emoji=iPct>ePct?'🌟':'🏆';
    h='<div style="font-size:36px;margin-bottom:4px">'+emoji+'</div>';
    h+='<div style="font-family:Unbounded,system-ui,sans-serif;font-size:20px;font-weight:900">'+dominant+' мотивация</div>';
    h+='<div style="font-size:12px;color:var(--muted);margin:8px 0 16px">Что движет вашим учеником</div>';
    h+='<div class="bd-row"><span style="width:100px;font-weight:600;font-size:12px">🌟 Внутренняя</span><div class="bd-bar"><div class="bd-fill" style="width:'+iPct+'%;background:var(--green)"></div></div><span class="mono" style="width:35px;text-align:right;font-size:12px;font-weight:700">'+iPct+'%</span></div>';
    h+='<div class="bd-row"><span style="width:100px;font-weight:600;font-size:12px">🏆 Внешняя</span><div class="bd-bar"><div class="bd-fill" style="width:'+ePct+'%;background:var(--orange)"></div></div><span class="mono" style="width:35px;text-align:right;font-size:12px;font-weight:700">'+ePct+'%</span></div>';
    const tip=iPct>ePct?'Ученик мотивирован интересом. Давайте сложные задачи, поощряйте любознательность, не давите оценками.':'Ученик мотивирован внешними факторами (оценки, одобрение). Используйте систему наград, но постепенно развивайте интерес к содержанию.';
    h+='<div style="margin-top:14px;background:#f8f7f4;border-radius:12px;padding:14px;font-size:13px;line-height:1.6;text-align:left"><b>💡 Рекомендации:</b><br>'+tip+'</div>';
    try{localStorage.setItem('motiv_result',JSON.stringify({date:new Date().toISOString(),dominant,iPct,ePct}))}catch{}
  }
  else if(mode==='anxiety'){
    let score=0;
    ANXIETY_Q.forEach((_,i)=>{if(pAns2[i]<=1)score++});
    const pct=Math.round(score/ANXIETY_Q.length*100);
    let level,color,emoji,tip;
    if(pct>=70){level='Высокая';color='var(--red)';emoji='😰';tip='Рекомендуется консультация психолога. Дома: поддержка, снижение давления по оценкам, дыхательные техники, физическая активность.'}
    else if(pct>=40){level='Средняя';color='var(--orange)';emoji='😐';tip='Умеренное волнение — это нормально. Помогите ребёнку с планированием, учите не катастрофизировать. Режим сна и спорт.'}
    else{level='Низкая';color='var(--green)';emoji='😊';tip='Ребёнок спокойно относится к учёбе. Следите, чтобы это не перешло в безразличие — умеренное волнение полезно.'}
    h='<div style="font-size:36px;margin-bottom:4px">'+emoji+'</div>';
    h+='<div style="font-family:Unbounded,system-ui,sans-serif;font-size:20px;font-weight:900;color:'+color+'">'+level+' тревожность</div>';
    h+='<div style="font-size:12px;color:var(--muted);margin:8px 0">'+score+'/'+ANXIETY_Q.length+' признаков ('+pct+'%)</div>';
    h+='<div style="margin:12px 0;height:12px;background:#e8e6e0;border-radius:6px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:6px"></div></div>';
    h+='<div style="background:#f8f7f4;border-radius:12px;padding:14px;font-size:13px;line-height:1.6;text-align:left"><b>💡 Рекомендации:</b><br>'+tip+'</div>';
    try{localStorage.setItem('anxiety_result',JSON.stringify({date:new Date().toISOString(),level,pct}))}catch{}
  }
  else if(mode==='holland'){
    const scores={R:0,I:0,A:0,S:0,E:0,C:0};
    HOLLAND_Q.forEach((q,i)=>{if(pAns2[i]<=1)scores[q.d]++});
    const names={R:'Реалистический',I:'Исследовательский',A:'Артистический',S:'Социальный',E:'Предприимчивый',C:'Конвенциональный'};
    const icons={R:'🔧',I:'🔬',A:'🎨',S:'🤝',E:'💼',C:'📋'};
    const careers={R:'инженер, механик, программист, строитель',I:'учёный, аналитик, врач, исследователь',A:'дизайнер, музыкант, писатель, режиссёр',S:'учитель, психолог, врач, соцработник',E:'менеджер, предприниматель, юрист, политик',C:'бухгалтер, администратор, логист, архивист'};
    const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const top3=sorted.slice(0,3);
    h='<div style="font-size:36px;margin-bottom:4px">'+icons[top3[0][0]]+'</div>';
    h+='<div style="font-family:Unbounded,system-ui,sans-serif;font-size:18px;font-weight:900">'+names[top3[0][0]]+'</div>';
    h+='<div style="font-size:12px;color:var(--muted);margin:8px 0">Ваш ведущий тип по Голланду</div>';
    sorted.forEach(([k,v])=>{const mx=Math.max(...Object.values(scores))||1;const pct=Math.round(v/5*100);
      h+='<div class="bd-row"><span style="width:32px;font-size:16px">'+icons[k]+'</span><span style="width:60px;font-weight:600;font-size:11px">'+names[k].slice(0,6)+'</span><div class="bd-bar"><div class="bd-fill" style="width:'+pct+'%;background:var(--accent)"></div></div><span class="mono" style="width:25px;text-align:right;font-size:12px;font-weight:700">'+v+'</span></div>'});
    h+='<div style="margin-top:14px;background:#f8f7f4;border-radius:12px;padding:14px;font-size:13px;line-height:1.6;text-align:left"><b>💡 Топ-3 направления:</b><br>';
    top3.forEach(([k])=>{h+='<b>'+icons[k]+' '+names[k]+':</b> '+careers[k]+'<br>'});
    h+='</div>';
    try{localStorage.setItem('holland_result',JSON.stringify({date:new Date().toISOString(),top:names[top3[0][0]],scores}))}catch{}
  }
  else if(mode==='psychknow'){
    let theory=0,practice=0,tTotal=0,pTotal=0;
    PSYCH_KNOW.forEach((q,i)=>{
      if(q.d==='t'){tTotal++;if(q.o[pAns2[i]]===q.a)theory++}
      else{pTotal++;if(q.o[pAns2[i]]===q.a)practice++}
    });
    const tPct=Math.round(theory/tTotal*100),pPct=Math.round(practice/pTotal*100);
    let profile,emoji;
    if(tPct>=60&&pPct>=60){profile='Психолог-универсал';emoji='🌟'}
    else if(tPct>=60){profile='Теоретик';emoji='📖'}
    else if(pPct>=60){profile='Практик-интуит';emoji='💡'}
    else{profile='Начинающий';emoji='🌱'}
    h='<div style="font-size:36px;margin-bottom:4px">'+emoji+'</div>';
    h+='<div style="font-family:Unbounded,system-ui,sans-serif;font-size:18px;font-weight:900">'+profile+'</div>';
    h+='<div style="font-size:12px;color:var(--muted);margin:8px 0 16px">Два измерения: знания и понимание людей</div>';
    h+='<div class="bd-row"><span style="width:80px;font-weight:600;font-size:12px">📖 Теория</span><div class="bd-bar"><div class="bd-fill" style="width:'+tPct+'%;background:var(--accent)"></div></div><span class="mono" style="width:50px;text-align:right;font-size:12px;font-weight:700">'+theory+'/'+tTotal+'</span></div>';
    h+='<div class="bd-row"><span style="width:80px;font-weight:600;font-size:12px">💡 Практика</span><div class="bd-bar"><div class="bd-fill" style="width:'+pPct+'%;background:var(--green)"></div></div><span class="mono" style="width:50px;text-align:right;font-size:12px;font-weight:700">'+practice+'/'+pTotal+'</span></div>';
    // Quadrant
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;text-align:center;margin:16px 0">';
    h+='<div style="padding:10px;border-radius:8px;background:'+(profile==='Теоретик'?'#dbeafe':'#f8f7f4')+'"><b>📖 Теоретик</b><br>знает термины,<br>но сложно с людьми</div>';
    h+='<div style="padding:10px;border-radius:8px;background:'+(profile==='Психолог-универсал'?'#dcfce7':'#f8f7f4')+'"><b>🌟 Универсал</b><br>знает и понимает<br>людей</div>';
    h+='<div style="padding:10px;border-radius:8px;background:'+(profile==='Начинающий'?'#fef9c3':'#f8f7f4')+'"><b>🌱 Начинающий</b><br>пока мало<br>опыта и знаний</div>';
    h+='<div style="padding:10px;border-radius:8px;background:'+(profile==='Практик-интуит'?'#f0fdf4':'#f8f7f4')+'"><b>💡 Практик</b><br>чувствует людей,<br>но не знает теорию</div>';
    h+='</div>';
    const tip=profile==='Практик-интуит'?'У вас сильная интуиция и эмпатия. Подтяните теорию — читайте Канемана, Чалдини, Гоулмана. Теория поможет осознать то, что вы уже чувствуете.':
      profile==='Теоретик'?'Вы хорошо знаете психологию как науку. Практикуйте активное слушание, наблюдайте за людьми, пробуйте применять знания в реальных ситуациях.':
      profile==='Психолог-универсал'?'Отлично! Вы и знаете теорию, и понимаете людей. Продолжайте развиваться — попробуйте медиацию конфликтов или наставничество.':
      'Всё впереди! Начните с книг: Дэниел Гоулман «Эмоциональный интеллект», Роберт Чалдини «Влияние». Наблюдайте за людьми и своими эмоциями.';
    h+='<div style="background:#f8f7f4;border-radius:12px;padding:14px;font-size:13px;line-height:1.6;text-align:left"><b>💡 Рекомендации:</b><br>'+tip+'</div>';
    try{localStorage.setItem('psychknow_result',JSON.stringify({date:new Date().toISOString(),profile,tPct,pPct,theory,practice}))}catch{}
  }

  h+='<div class="disclaimer">Результаты носят ознакомительный характер и не являются клинической диагностикой.</div>';
  document.getElementById('pr-card').innerHTML=h;
  go('presult');
}

// Update refreshMenu
const _origRefresh=refreshMenu;
refreshMenu=function(){
  _origRefresh();
  try{const m=JSON.parse(localStorage.getItem('motiv_result')||'null');if(m)document.getElementById('motiv-done').textContent='✓ '+m.dominant}catch{}
  try{const a=JSON.parse(localStorage.getItem('anxiety_result')||'null');if(a)document.getElementById('anxiety-done').textContent='✓ '+a.level}catch{}
  try{const h=JSON.parse(localStorage.getItem('holland_result')||'null');if(h)document.getElementById('holland-done').textContent='✓ '+h.top}catch{}
  try{const p=JSON.parse(localStorage.getItem('psychknow_result')||'null');if(p)document.getElementById('psychknow-done').textContent='✓ '+p.profile}catch{}
};
refreshMenu();

function showClassSelect(){
  const o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
  o.onclick=()=>o.remove();
  const a=document.createElement('div');
  a.style.cssText='background:#fff;border-radius:20px;padding:24px 20px;max-width:360px;width:100%;max-height:85vh;overflow-y:auto';
  a.onclick=e=>e.stopPropagation();
  const grades=[
    {g:'1',f:'grade1_v2.html',ic:'🌱',color:'#f59e0b',bg:'#fef3c7'},
    {g:'2',f:'grade2_v2.html',ic:'🌿',color:'#f97316',bg:'#fff7ed'},
    {g:'3',f:'grade3_v2.html',ic:'🎒',color:'#16a34a',bg:'#dcfce7'},
    {g:'4',f:'grade4_v2.html',ic:'📐',color:'#2563eb',bg:'#dbeafe'},
    {g:'5',f:'grade5_v2.html',ic:'🔢',color:'#7c3aed',bg:'#ede9fe'},
    {g:'6',f:'grade6_v2.html',ic:'🌍',color:'#ea580c',bg:'#fff7ed'},
    {g:'7',f:'grade7_v2.html',ic:'⚗️',color:'#0d9488',bg:'#ccfbf1'},
    {g:'8',f:'grade8_v2.html',ic:'⚡',color:'#dc2626',bg:'#fee2e2'},
    {g:'9',f:'grade9_v2.html',ic:'∫',color:'#ca8a04',bg:'#fef9c3'},
    {g:'10',f:'grade10_v2.html',ic:'∑',color:'#1a1a2e',bg:'#e8e6e0'},
    {g:'11',f:'grade11_v2.html',ic:'🎓',color:'#7c3aed',bg:'#ede9fe'},
  ];
  let h='<h3 style="font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:800;margin-bottom:16px;text-align:center">📚 Выбери класс</h3>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">';
  grades.forEach(({g,f,ic,color,bg})=>{
    const currentFile=window.location.pathname.split('/').pop()||'index.html';
    const isCurrent=f===currentFile;
    h+=`<a href="${f}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 8px;background:${bg};border-radius:12px;text-decoration:none;border:${isCurrent?'2.5px solid '+color:'2px solid transparent'};min-height:70px">
      <span style="font-size:20px;margin-bottom:4px">${ic}</span>
      <span style="font-size:13px;font-weight:800;color:${color}">${g} класс</span>
    </a>`;
  });
  h+='</div>';
  h+='<button style="width:100%;padding:10px;border:none;border-radius:10px;background:#1a1a2e;color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:Golos Text,sans-serif" data-wave86u-on-click="this.closest(\'div[style*=fixed]\').remove()">Закрыть</button>';
  a.innerHTML=h;o.appendChild(a);document.body.appendChild(o);
}

function countDoneTests(){
  const keys=['iq_results','style_result','temp_result','motiv_result','anxiety_result','holland_result','psychknow_result'];
  return keys.filter(k=>{try{const v=localStorage.getItem(k);return v&&v!=='[]'&&v!=='null'}catch{return false}}).length;
}

function showPortrait(){
  // Read all results
  let iq=null,style=null,temp=null,motiv=null,anxiety=null,holland=null,psych=null;
  try{const r=JSON.parse(localStorage.getItem('iq_results')||'[]');if(r.length)iq=r[r.length-1]}catch{}
  try{style=JSON.parse(localStorage.getItem('style_result')||'null')}catch{}
  try{temp=JSON.parse(localStorage.getItem('temp_result')||'null')}catch{}
  try{motiv=JSON.parse(localStorage.getItem('motiv_result')||'null')}catch{}
  try{anxiety=JSON.parse(localStorage.getItem('anxiety_result')||'null')}catch{}
  try{holland=JSON.parse(localStorage.getItem('holland_result')||'null')}catch{}
  try{psych=JSON.parse(localStorage.getItem('psychknow_result')||'null')}catch{}

  const done=[iq,style,temp,motiv,anxiety,holland,psych].filter(Boolean).length;

  // ── Helpers ──────────────────────────────────────
  const styleNames={v:'Визуальный стиль',a:'Слуховой стиль',k:'Практический стиль'};
  const styleEmoji={v:'👁',a:'👂',k:'✋'};
  const styleDesc={v:'лучше воспринимает информацию визуально — схемы, графики, цвет',a:'лучше воспринимает на слух — объяснения, подкасты, проговаривание',k:'учится через действие — практика, эксперимент, движение'};
  const hollandNames={R:'Реалистический',I:'Исследовательский',A:'Артистический',S:'Социальный',E:'Предприимчивый',C:'Конвенциональный'};
  const hollandEmoji={R:'🔧',I:'🔬',A:'🎨',S:'🤝',E:'💼',C:'📋'};
  const hollandCareers={
    R:'инженер, программист, архитектор, механик',
    I:'учёный, аналитик, врач, исследователь',
    A:'дизайнер, режиссёр, писатель, музыкант',
    S:'психолог, учитель, врач, соцработник',
    E:'предприниматель, менеджер, юрист, маркетолог',
    C:'бухгалтер, аналитик данных, логист, администратор'
  };

  // Holland top-2
  let holTop2=[];
  if(holland&&holland.scores){
    holTop2=Object.entries(holland.scores).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k);
  }

  // Temperament label
  const tempLabel=temp?temp.type:'';
  const tempEmoji={
    'Холерик':'⚡','Сангвиник':'☀️','Флегматик':'🏔','Меланхолик':'🌙',
    'Экстраверт':'🌟','Интроверт':'💎'
  };

  // ── Generate insights ────────────────────────────
  const insights=[];

  // Logic insight
  if(iq){
    const pct=iq.pct||iq.pctl||50;
    if(pct>=80) insights.push({icon:'🏆',text:`<b>Высокие когнитивные способности</b> — балл ${iq.iq}, лучше ${pct}% сверстников. Мозг хорошо справляется с абстрактным мышлением и анализом. Не бойся брать сложные задачи — они тебе по силам.`});
    else if(pct>=50) insights.push({icon:'💡',text:`<b>Хороший потенциал</b> — балл ${iq.iq}, лучше ${pct}% сверстников. Особенно сильны там, где работала внимательность и последовательность. Регулярная практика заметно поднимает результат.`});
    else insights.push({icon:'🌱',text:`<b>балл ${iq.iq}</b> — есть куда расти. Это рабочий показатель, а не приговор: логику и память развивают тренировкой. Кроссворды, шахматы, задачники — вполне работают.`});
  }

  // Style + study tip
  if(style){
    const d=style.dominant;
    const tips={
      v:'Делай конспекты с цветами и схемами, рисуй mind-maps, смотри видеоуроки. При запоминании — представляй визуально.',
      a:'Проговаривай материал вслух, слушай подкасты и лекции. Объясни тему другу — и сам запомнишь лучше.',
      k:'Учи через практику: делай, пробуй, экспериментируй. Перемещайся при зубрёжке, пиши от руки — двигательная память работает.'
    };
    insights.push({icon:styleEmoji[d],text:`<b>${styleNames[d]} по стилю обучения</b> — ${styleDesc[d]}. <br>💬 ${tips[d]}`});
  }

  // Motivation insight (combined with anxiety)
  if(motiv){
    const isInternal=motiv.dominant==='Внутренняя'||motiv.iPct>motiv.ePct;
    if(isInternal){
      insights.push({icon:'🔥',text:`<b>Внутренняя мотивация ${motiv.iPct||''}%</b> — учишься ради интереса, а не оценок. Это самый устойчивый ресурс. Выбирай предметы, которые зажигают, ищи связь между школой и реальной жизнью.`});
    } else {
      const anxHigh=anxiety&&anxiety.pct>=50;
      insights.push({icon:'🏅',text:`<b>Внешняя мотивация ${motiv.ePct||''}%</b> — тебя двигают оценки и одобрение. Это работает, но быстро истощает.${anxHigh?' Плюс высокая тревожность — риск выгорания.'  :''} Попробуй найти хотя бы один предмет, который интересен сам по себе.`});
    }
  }

  // Anxiety insight (standalone if notable)
  if(anxiety){
    if(anxiety.level==='Высокая'){
      insights.push({icon:'😤',text:`<b>Высокая тревожность (${anxiety.pct}%)</b> — экзамены и оценки вызывают сильный стресс. Это мешает показать реальный уровень. Помогают: дыхательные техники, подготовка заранее, разговор с родителями. Не молчи.`});
    } else if(anxiety.level==='Средняя'){
      insights.push({icon:'😌',text:`<b>Умеренная тревожность (${anxiety.pct}%)</b> — лёгкое волнение перед контрольной есть, но не мешает. Это нормально и даже полезно: небольшой стресс мобилизует. Главное — не доводить до зубрёжки ночью.`});
    }
  }

  // Holland career insight
  if(holTop2.length){
    const t1=holTop2[0],t2=holTop2[1]||holTop2[0];
    const code=t1+(t2!==t1?t2:'');
    insights.push({icon:hollandEmoji[t1],text:`<b>Профтип ${code} — ${hollandNames[t1]}${t2!==t1?' + '+hollandNames[t2]:''}</b>. Тебе подойдут профессии: ${hollandCareers[t1]}${t2!==t1?', '+hollandCareers[t2]:''}.`});
  }

  // Psych knowledge insight
  if(psych){
    const both=psych.tPct>=60&&psych.pPct>=60;
    const theoryWin=psych.tPct>psych.pPct;
    if(both) insights.push({icon:'🌟',text:`<b>Психология: профиль «${psych.profile}»</b> — и теорию знаешь, и людей чувствуешь. Редкое сочетание. Это большой ресурс в командной работе и любой профессии с людьми.`});
    else if(theoryWin) insights.push({icon:'📖',text:`<b>Психология: профиль «${psych.profile}»</b> — хорошая теоретическая база. Попробуй применять знания в жизни: наблюдай за собой и другими, это делает психологию живой.`});
    else insights.push({icon:'💡',text:`<b>Психология: профиль «${psych.profile}»</b> — сильная интуиция в общении. Подтяни теорию — она объяснит то, что ты уже чувствуешь.`});
  }

  // Cross-synthesis (only if enough data)
  if(style&&temp&&motiv){
    const isV=style.dominant==='v';
    const highInt=motiv.iPct>60||motiv.dominant==='Внутренняя';
    const isSang=tempLabel.includes('Сангвиник')||tempLabel.includes('Холерик');
    if(isV&&highInt) insights.push({icon:'✨',text:`<b>Твоя сильная комбинация:</b> визуальное мышление + внутренняя мотивация. Такие люди хорошо работают над сложными проектами — видят целое и не теряют интерес. Ищи задачи с видимым результатом.`});
    else if(!highInt&&anxiety&&anxiety.pct>=50) insights.push({icon:'⚠️',text:`<b>Зона внимания:</b> внешняя мотивация + тревожность — риск выгорания при неудачах. Важно сформировать "подушку" — хотя бы 1-2 предмета, в которых ты уверен и который нравится независимо от оценок.`});
  }

  // ── Build badges ─────────────────────────────────
  const badges=[];
  if(style) badges.push({icon:styleEmoji[style.dominant],label:styleNames[style.dominant],bg:'#dbeafe',color:'#1e40af'});
  if(temp) badges.push({icon:tempEmoji[tempLabel]||'🎭',label:tempLabel,bg:'#fff7ed',color:'#9a3412'});
  if(holland&&holTop2.length) badges.push({icon:hollandEmoji[holTop2[0]],label:hollandNames[holTop2[0]].split(' ')[0],bg:'#ede9fe',color:'#5b21b6'});
  if(psych) badges.push({icon:psych.tPct>=60&&psych.pPct>=60?'🌟':psych.tPct>psych.pPct?'📖':'💡',label:psych.profile,bg:'#dcfce7',color:'#166534'});
  if(motiv) badges.push({icon:motiv.dominant==='Внутренняя'||motiv.iPct>motiv.ePct?'🔥':'🏅',label:(motiv.dominant==='Внутренняя'||motiv.iPct>motiv.ePct?'Внутренняя':'Внешняя')+' мотивация',bg:'#fef9c3',color:'#92400e'});

  // ── Build profile bars ───────────────────────────
  const bars=[];
  if(iq) bars.push({label:'Когнитивный индекс',val:'Балл: '+iq.iq,pct:Math.min(100,Math.max(0,Math.round((iq.iq-60)/90*100))),color:'#2563eb'});
  if(motiv) bars.push({label:'Внутренняя мотивация',val:(motiv.iPct||0)+'%',pct:motiv.iPct||0,color:'#16a34a'});
  if(anxiety) bars.push({label:'Тревожность',val:anxiety.pct+'%',pct:anxiety.pct,color:anxiety.pct>=70?'#dc2626':anxiety.pct>=40?'#ea580c':'#16a34a'});

  // ── Render overlay ───────────────────────────────
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,14,23,.75);z-index:9999;overflow-y:auto;padding:16px;display:flex;justify-content:center;-webkit-overflow-scrolling:touch';

  const now=new Date().toLocaleDateString('ru',{day:'numeric',month:'long',year:'numeric'});

  let html=`
  <div style="background:#f5f3ee;border-radius:20px;max-width:480px;width:100%;overflow:hidden;margin:auto">

    <div style="background:#1a1a2e;color:#fff;padding:20px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#4ade80,#2563eb);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;flex-shrink:0">🧠</div>
        <div>
          <div style="font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:900;margin-bottom:2px">Портрет ученика</div>
          <div style="font-size:11px;opacity:.5">${now} · ${done} из 7 тестов</div>
        </div>
        <button data-wave86u-on-click="this.closest('[style*=position]').remove()" style="margin-left:auto;background:rgba(255,255,255,.1);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center">×</button>
      </div>

      ${bars.map(b=>`
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:11px;opacity:.6;font-weight:600">${b.label}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700">${b.val}</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden">
          <div style="width:${b.pct}%;height:100%;background:${b.color};border-radius:3px;transition:width .6s"></div>
        </div>
      </div>`).join('')}
    </div>

    ${badges.length?`
    <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:6px;border-bottom:1px solid #e2e0d8">
      ${badges.map(b=>`<span style="background:${b.bg};color:${b.color};font-size:11px;font-weight:700;padding:5px 11px;border-radius:20px;display:inline-flex;align-items:center;gap:4px">${b.icon} ${b.label}</span>`).join('')}
    </div>`:''}

    <div style="padding:16px">
      <div style="font-family:Unbounded,system-ui,sans-serif;font-size:10px;font-weight:700;color:#6b6a74;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">Ключевые выводы</div>
      ${insights.slice(0,5).map(ins=>`
      <div style="display:flex;gap:12px;margin-bottom:12px;padding:12px;background:#fff;border-radius:12px;border:1px solid #e2e0d8">
        <span style="font-size:20px;flex-shrink:0;margin-top:1px">${ins.icon}</span>
        <div style="font-size:13px;line-height:1.55;color:#1a1a2e">${ins.text}</div>
      </div>`).join('')}
    </div>

    ${holTop2.length?`
    <div style="padding:0 16px 16px">
      <div style="font-family:Unbounded,system-ui,sans-serif;font-size:10px;font-weight:700;color:#6b6a74;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Направления для профессии</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${holTop2.map(k=>`
        <div style="background:#fff;border-radius:10px;padding:12px;border:1px solid #e2e0d8">
          <div style="font-size:18px;margin-bottom:4px">${hollandEmoji[k]}</div>
          <div style="font-size:12px;font-weight:700;margin-bottom:3px">${hollandNames[k]}</div>
          <div style="font-size:11px;color:#6b6a74;line-height:1.4">${hollandCareers[k]}</div>
        </div>`).join('')}
      </div>
    </div>`:''}

    <div style="padding:0 16px 16px">
      <div style="font-size:10px;color:#9b9aad;text-align:center;margin-bottom:12px;line-height:1.5">Результаты носят ознакомительный характер и не являются клинической диагностикой.</div>
      <button data-wave86u-on-click="sharePortrait()" style="width:100%;padding:13px;border:none;border-radius:12px;background:#1a1a2e;color:#fff;font-family:'Golos Text',sans-serif;font-weight:700;font-size:14px;cursor:pointer">📤 Отправить родителям</button>
      ${done<7?`<div style="text-align:center;margin-top:10px;font-size:12px;color:#6b6a74">Пройди все ${7-done} оставшихся тестов — портрет станет полнее</div>`:''}
    </div>
  </div>`;

  overlay.innerHTML=html;
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
  document.body.appendChild(overlay);

  // Store for share
  window._portraitData={iq,style,temp,motiv,anxiety,holland,psych,insights,badges,holTop2,done};
}

function sharePortrait(){
  const d=window._portraitData||{};
  const now=new Date().toLocaleDateString('ru',{day:'numeric',month:'long'});
  let text=`🧠 Портрет ученика — ${now}\n(${d.done||'?'} из 7 тестов пройдено)\n\n`;

  if(d.iq) text+=`📊 Балл: ${d.iq.iq} (лучше ${d.iq.pct||d.iq.pctl}% сверстников)\n`;
  if(d.style) text+=`👁 Стиль восприятия: ${({v:'Визуальный стиль',a:'Слуховой стиль',k:'Практический стиль'})[d.style.dominant]||d.style.dominant}\n`;
  if(d.temp) text+=`🎭 Темперамент: ${d.temp.type}\n`;
  if(d.motiv) text+=`💪 Мотивация: ${d.motiv.dominant==='Внутренняя'||d.motiv.iPct>d.motiv.ePct?'Внутренняя ('+d.motiv.iPct+'%)':'Внешняя ('+d.motiv.ePct+'%)'}\n`;
  if(d.anxiety) text+=`😌 Тревожность: ${d.anxiety.level} (${d.anxiety.pct}%)\n`;
  if(d.holland) text+=`🧭 Профтип: ${d.holland.top}\n`;
  if(d.psych) text+=`🔬 Психология: ${d.psych.profile}\n`;

  if(d.insights&&d.insights.length){
    text+='\n💡 Главные выводы:\n';
    d.insights.slice(0,3).forEach(ins=>{
      text+='• '+ins.text.replace(/<[^>]+>/g,'').trim()+'\n';
    });
  }

  if(navigator.share){
    navigator.share({title:'Портрет ученика',text}).catch(()=>fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text){
  navigator.clipboard&&navigator.clipboard.writeText(text)
    .then(()=>alert('✅ Скопировано! Вставь в сообщение.'))
    .catch(()=>prompt('Скопируй текст:',text));
}


function bindTestsAction(action, handler){
  document.querySelectorAll('[data-wave87r-action="'+action+'"]').forEach(el=>{
    if(el.__wave87rTestsBound) return;
    el.__wave87rTestsBound = true;
    const run = event=>{
      if(event) event.preventDefault();
      handler(event);
    };
    el.addEventListener('click', run);
    if(el.tagName !== 'BUTTON' && el.tagName !== 'A'){
      el.addEventListener('keydown', event=>{
        if(event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') run(event);
      });
    }
  });
}

function bindTestsActions(){
  bindTestsAction('test-launch-iq', ()=>launchIQ());
  bindTestsAction('test-launch-style', ()=>launchStyle());
  bindTestsAction('test-launch-temp', ()=>launchTemp());
  bindTestsAction('test-launch-motiv', ()=>launchMotiv());
  bindTestsAction('test-launch-holland', ()=>launchHolland());
  bindTestsAction('test-launch-psychknow', ()=>launchPsychKnow());
  bindTestsAction('test-launch-anxiety', ()=>launchAnxiety());
  bindTestsAction('test-portrait', ()=>showPortrait());
  bindTestsAction('test-start-iq', ()=>startIQ());
  bindTestsAction('show-class-select', ()=>showClassSelect());
  bindTestsAction('test-menu', ()=>go('menu'));
  bindTestsAction('diag-skip', ()=>skipQ());
  bindTestsAction('diag-share', ()=>shareResult());
  bindTestsAction('test-menu-refresh', ()=>{ go('menu'); refreshMenu(); });
  bindTestsAction('test-share-psych', ()=>sharePsych());
}

bindTestsActions();
