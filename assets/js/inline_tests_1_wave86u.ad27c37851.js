
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function pick(a){return a[0|Math.random()*a.length]}
function range(a,b){const r=[];for(let i=a;i<=b;i++)r.push(i);return r}
function go(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('active'));document.getElementById('s-'+id).classList.add('active')}

// ═══════════════════════════════════════
// LOGIC TEST (same as before)
// ═══════════════════════════════════════
const ALL=[],PN=['Матрицы и паттерны','Числовые последовательности','Вербальные аналогии','Пространственное мышление','Рабочая память'];
function MX(g,a,w,h,d){ALL.push({part:0,diff:d,render(){let s='<div class="qtxt" style="margin-bottom:8px">Какой элемент заменит <b style="color:var(--gold)">?</b></div><div class="matrix" style="grid-template-columns:repeat(3,48px);grid-template-rows:repeat(3,48px)">';g.forEach(c=>{s+=c==='?'?'<div class="mcell empty"></div>':'<div class="mcell">'+c+'</div>'});return s+'</div>'},answer:a,opts:shuffle([a,...w]),hint:h})}
function SQ(s,a,h,d){const w=[];const dl=[-3,-2,-1,1,2,3,5,-5,10];while(w.length<3){const v=a+pick(dl);if(v!==a&&!w.includes(v)&&v>0)w.push(v)}ALL.push({part:1,diff:d,render(){return'<div class="qtxt">Продолжите ряд:</div><div class="mono" style="font-size:20px;text-align:center;padding:16px;letter-spacing:4px">'+s.join('  ')+'  <b style="color:var(--gold)">?</b></div>'},answer:''+a,opts:shuffle([''+a,...w.map(v=>''+v)]),hint:h})}
function AN(q,a,w,h,d){ALL.push({part:2,diff:d,render(){return'<div class="qtxt">'+q+'</div>'},answer:a,opts:shuffle([a,...w]),hint:h})}
function SP(q,a,w,h,d){ALL.push({part:3,diff:d,render(){return'<div class="qtxt">'+q+'</div>'},answer:a,opts:shuffle([a,...w]),hint:h})}
function MM(len,dir,d){const seq=[];for(let i=0;i<len;i++)seq.push(pick(range(1,9)));const fwd=seq.join(''),bwd=[...seq].reverse().join(''),ans=dir==='f'?fwd:bwd,lbl=dir==='f'?'Повторите числа в том же порядке':'Повторите числа в <b>ОБРАТНОМ</b> порядке';const wr=new Set();while(wr.size<3){const s=shuffle([...seq]).join('');if(s!==ans)wr.add(s);const s2=seq.map(x=>x===pick(seq)?pick(range(1,9)):x).join('');if(s2!==ans)wr.add(s2)}ALL.push({part:4,diff:d,render(){return'<div class="qtxt" style="margin-bottom:6px">'+lbl+':</div><div class="digit-display">'+seq.join(' ')+'</div><div style="font-size:11px;color:var(--muted);text-align:center">Запомните и выберите</div>'},answer:ans,opts:shuffle([ans,...[...wr].slice(0,3)]),hint:dir==='f'?'Прямой':'Обратный'})}

// Matrices (20)
MX(['▲','▲','▲','●','●','●','■','■','?'],'■',['●','▲','◆'],'Строка=фигура',1);MX(['1','2','3','4','5','6','7','8','?'],'9',['0','10','7'],'1-9',1);MX(['●','○','●','○','●','○','●','○','?'],'●',['○','◐','■'],'●○',1);MX(['→','→','→','↓','↓','↓','←','←','?'],'←',['↑','→','↓'],'Строка=направление',1);MX(['A','B','C','D','E','F','G','H','?'],'I',['J','K','G'],'Алфавит',1);
MX(['1','2','3','2','3','4','3','4','?'],'5',['6','4','3'],'Строка+1',2);MX(['▲','■','●','■','●','▲','●','▲','?'],'■',['●','▲','◆'],'Цикл',2);MX(['2','4','6','3','6','9','4','8','?'],'12',['10','14','16'],'n×1,n×2,n×3',2);MX(['○','○','●','○','●','●','●','●','?'],'●',['○','◐','◑'],'●:1,2,3',2);MX(['★','☆','★','☆','★','☆','★','☆','?'],'★',['☆','●','○'],'★☆',2);
MX(['A','C','E','B','D','F','C','E','?'],'G',['H','F','D'],'Через одну',3);MX(['10','20','30','20','30','40','30','40','?'],'50',['60','45','35'],'+10,+10',2);MX(['2','4','8','3','9','27','4','16','?'],'64',['32','48','56'],'n,n²,n³',3);MX(['12','6','3','8','4','2','20','10','?'],'5',['4','15','8'],'÷2',3);MX(['♠','♥','♦','♥','♦','♣','♦','♣','?'],'♠',['♥','♦','♣'],'Масти',3);
MX(['100','50','25','80','40','20','60','30','?'],'15',['10','20','12'],'÷2,−20',3);MX(['F','E','D','I','H','G','L','K','?'],'J',['I','M','H'],'Обратно',3);MX(['1','1','2','1','2','3','2','3','?'],'5',['4','6','3'],'Сумма',3);MX(['3','5','7','5','7','9','7','9','?'],'11',['10','13','8'],'Нечётные+2',3);MX(['81','27','9','64','16','4','49','7','?'],'1',['7','49','0'],'÷3,÷3',3);
// Sequences (12)
SQ([2,4,6,8,10],12,'+2',1);SQ([5,10,15,20,25],30,'+5',1);SQ([3,6,12,24,48],96,'×2',1);SQ([1,4,9,16,25],36,'n²',2);SQ([1,1,2,3,5,8,13],21,'Фибоначчи',2);SQ([2,6,18,54,162],486,'×3',2);SQ([1,3,7,15,31],63,'×2+1',2);SQ([100,81,64,49,36],25,'n²↓',3);SQ([1,4,27,256,3125],46656,'n^n',3);SQ([2,3,5,7,11,13,17],19,'Простые',3);SQ([0,1,1,2,3,5,8,13],21,'Фиб(0)',2);SQ([1,2,4,7,11,16,22],29,'+1+2+3',3);
// Analogies (10)
AN('Птица : гнездо = пчела : ?','улей',['мёд','цветок','рой'],'Дом',1);AN('Утро : вечер = начало : ?','конец',['середина','день','завтра'],'Антоним',1);AN('Палец : рука = ветка : ?','дерево',['лист','лес','корень'],'Часть→целое',1);AN('Глаз : видеть = нос : ?','обонять',['дышать','слышать','трогать'],'Функция',2);AN('Горячий : ожог = острый : ?','порез',['укол','падение','перелом'],'Травма',2);AN('Автор : роман = композитор : ?','симфония',['картина','здание','фильм'],'Творение',2);AN('Вода : жажда = еда : ?','голод',['аппетит','обед','кухня'],'Утоляет',2);AN('Километр : расстояние = килограмм : ?','масса',['вес','объём','скорость'],'Величина',3);AN('Квадрат : куб = круг : ?','шар',['цилиндр','конус','овал'],'2D→3D',3);AN('Электричество : провод = вода : ?','труба',['кран','река','стакан'],'Передаёт',3);
// Spatial (10)
SP('Сколько граней у куба?','6',['4','8','12'],'',1);SP('Куб 3×3×3: кубиков?','27',['9','18','26'],'3³',1);SP('Развёртка куба — квадратов?','6',['4','8','5'],'',1);SP('Тень от шара:','круг',['квадрат','овал','точка'],'',2);SP('Тень от конуса сбоку:','треугольник',['круг','квадрат','овал'],'',2);SP('Куб 3×3×3, покрашен. С 3 гранями:','8',['6','12','4'],'Углы',3);SP('Куб 3×3×3, покрашен. С 2 гранями:','12',['8','6','24'],'Рёбра',3);SP('Куб 3×3×3, покрашен. С 0 граней:','1',['0','8','6'],'Центр',3);SP('Осей симметрии у квадрата:','4',['2','8','1'],'',3);SP('Лист пополам дважды, отрезать угол — дырок:','4',['2','1','8'],'4 слоя',3);
// Memory (8)
MM(4,'f',1);MM(5,'f',1);MM(5,'f',2);MM(6,'f',2);MM(4,'b',2);MM(5,'b',3);MM(6,'b',3);MM(7,'b',3);

const iqQ=[];for(let p=0;p<5;p++)iqQ.push(...ALL.filter(q=>q.part===p).sort((a,b)=>a.diff-b.diff));
let iqCur=0,iqAns=[],iqTimer=null,iqTime=40*60,iqAge=14;

function launchIQ(){go('intro')}
function startIQ(){iqAge=+document.getElementById('age-select').value;iqCur=0;iqAns=new Array(iqQ.length).fill(null);iqTime=40*60;go('quiz');iqTimer=setInterval(iqTick,1000);iqRender()}
function iqTick(){iqTime--;const m=0|iqTime/60,s=iqTime%60;const e=document.getElementById('q-timer');e.textContent=m+':'+(''+s).padStart(2,'0');e.className='hdr-timer'+(iqTime<=120?' warn':'');if(iqTime<=0){clearInterval(iqTimer);iqFinish()}}
function iqRender(){if(iqCur>=iqQ.length){iqFinish();return}const q=iqQ[iqCur];document.getElementById('q-cat').textContent='Часть '+(q.part+1)+'. '+PN[q.part];document.getElementById('q-pgfill').style.width=Math.round(iqCur/iqQ.length*100)+'%';document.getElementById('q-pgtext').textContent=(iqCur+1)+'/'+iqQ.length+' · '+'⬤'.repeat(q.diff)+'○'.repeat(3-q.diff);document.getElementById('q-card').innerHTML=q.render();const oe=document.getElementById('q-opts');oe.className='opts'+(q.part===4?' single':'');oe.innerHTML=q.opts.map((o,i)=>'<button class="opt" onclick="iqSel('+i+')">'+o+'</button>').join('')}
function iqSel(i){iqAns[iqCur]=iqQ[iqCur].opts[i];document.querySelectorAll('.opt')[i].classList.add('selected');setTimeout(()=>{iqCur++;iqRender()},350)}
function skipQ(){if(document.getElementById('s-quiz').classList.contains('active')){iqAns[iqCur]=null;iqCur++;iqRender()}}

function iqFinish(){
if(iqTimer)clearInterval(iqTimer);const el=40*60-iqTime;
const ps=[];for(let p=0;p<5;p++){const idx=iqQ.map((q,i)=>q.part===p?i:-1).filter(i=>i>=0);let ok=0;idx.forEach(i=>{if(iqAns[i]===iqQ[i].answer)ok++});ps.push({ok,total:idx.length,pct:Math.round(ok/idx.length*100)})}
const tOk=ps.reduce((s,p)=>s+p.ok,0),tQ=iqQ.length,rawPct=Math.round(tOk/tQ*100);
const z=(rawPct-50)/16;let iq=Math.round(100+z*15);
if(iqAge<=11)iq+=12;else if(iqAge<=15)iq+=5;else if(iqAge<=17)iq+=2;
iq=Math.max(70,Math.min(145,iq));const pctl=iqPctl(iq);
let cls,bg,cc;if(iq>=130){cls='Очень высокий';bg='#dcfce7';cc='#166534'}else if(iq>=120){cls='Высокий';bg='#dbeafe';cc='#1e40af'}else if(iq>=110){cls='Выше среднего';bg='#eff6ff';cc='#2563eb'}else if(iq>=90){cls='Средний';bg='#f5f3ee';cc='#6b6b7e'}else if(iq>=80){cls='Ниже среднего';bg='#fff7ed';cc='#c2410c'}else{cls='Низкий';bg='#fee2e2';cc='#dc2626'}
const sn=['Матрицы','Числ.ряды','Аналогии','Простр.','Память'];
let h='<div style="font-size:36px;margin-bottom:4px">🧠</div><div class="iq-num" style="color:'+cc+'">'+iq+'</div><div class="iq-label">Оценка логического мышления</div><div class="iq-range" style="background:'+bg+';color:'+cc+'">'+cls+' · '+pctl+'-й перцентиль</div><div style="font-size:12px;color:var(--muted)">'+tOk+'/'+tQ+' ('+rawPct+'%) · '+fmtT(el)+'</div>';
h+='<div style="margin-top:16px;font-size:11px;color:var(--muted);font-weight:600;text-align:left">Распределение:</div><div class="bell">';
[{l:'<85',h:15,r:[0,84],c:'#fee2e2'},{l:'85-99',h:40,r:[85,99],c:'#fff7ed'},{l:'100-114',h:55,r:[100,114],c:'#f0fdf4'},{l:'115-129',h:35,r:[115,129],c:'#dbeafe'},{l:'130+',h:12,r:[130,200],c:'#ede9fe'}].forEach(b=>{const you=iq>=b.r[0]&&iq<=b.r[1];h+='<div class="bell-bar'+(you?' you':'')+'" style="height:'+b.h+'px;background:'+b.c+'"><span style="font-size:9px;color:var(--muted);margin-bottom:2px">'+b.l+'</span></div>'});h+='</div>';
h+='<div style="margin-top:12px;text-align:left;font-size:11px;color:var(--muted);font-weight:600;margin-bottom:4px">По разделам:</div>';
ps.forEach((p,i)=>{const c=p.pct>=80?'var(--green)':p.pct>=50?'var(--orange)':'var(--red)';h+='<div class="bd-row"><span style="width:80px;font-weight:600;font-size:12px">'+sn[i]+'</span><div class="bd-bar"><div class="bd-fill" style="width:'+p.pct+'%;background:'+c+'"></div></div><span class="mono" style="width:40px;text-align:right;font-size:12px;font-weight:700;color:'+c+'">'+p.ok+'/'+p.total+'</span></div>'});
const sorted=[...ps.map((p,i)=>({...p,name:sn[i]}))].sort((a,b)=>b.pct-a.pct);
h+='<div style="margin-top:14px;display:flex;gap:8px"><div style="flex:1;background:#f0fdf4;border-radius:10px;padding:10px;font-size:12px"><div style="font-weight:700;color:var(--green);margin-bottom:4px">💪 Сила</div>'+sorted[0].name+'</div><div style="flex:1;background:#fff7ed;border-radius:10px;padding:10px;font-size:12px"><div style="font-weight:700;color:var(--orange);margin-bottom:4px">📌 Развивать</div>'+sorted[sorted.length-1].name+'</div></div>';
h+='<div class="disclaimer">⚠️ Скрининговая оценка. Не заменяет профессиональную диагностику. По структуре матриц Равена и субтестов Векслера.</div>';
document.getElementById('r-card').innerHTML=h;
try{const r=JSON.parse(localStorage.getItem('iq_results')||'[]');r.push({date:new Date().toISOString(),iq,percentile:pctl,correct:tOk,total:tQ,pct:rawPct,age:iqAge,parts:ps.map((p,i)=>({name:sn[i],...p}))});localStorage.setItem('iq_results',JSON.stringify(r.slice(-10)))}catch{}
lastResult={type:'iq',iq,pctl,tOk,tQ,rawPct,parts:ps,sn};go('result')}

function iqPctl(iq){const z=(iq-100)/15;const t=1/(1+.2316419*Math.abs(z));const d=.3989423*Math.exp(-z*z/2);const p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return Math.round(z>0?(1-p)*100:p*100)}
function fmtT(s){return(0|s/60)+' мин '+s%60+' сек'}

// ═══════════════════════════════════════
// LEARNING STYLE TEST
// ═══════════════════════════════════════
const STYLE_Q=[
{q:'Когда учу новое, мне легче всего:',o:[{t:'Прочитать и посмотреть схему',s:'v'},{t:'Послушать объяснение',s:'a'},{t:'Попробовать сделать самому',s:'k'}]},
{q:'Я лучше запоминаю:',o:[{t:'То, что видел (картинки, таблицы)',s:'v'},{t:'То, что слышал (рассказ, лекция)',s:'a'},{t:'То, что делал руками',s:'k'}]},
{q:'Когда скучно на уроке, я:',o:[{t:'Рисую в тетради',s:'v'},{t:'Разговариваю с соседом',s:'a'},{t:'Верчу что-то в руках, двигаюсь',s:'k'}]},
{q:'Дорогу к новому месту я запоминаю по:',o:[{t:'Карте или ориентирам (вижу дом, поворот)',s:'v'},{t:'Названиям улиц (проговариваю)',s:'a'},{t:'Ощущениям (поворот налево, потом прямо)',s:'k'}]},
{q:'Мне проще понять задачу, если:',o:[{t:'Нарисовать схему',s:'v'},{t:'Кто-то объяснит вслух',s:'a'},{t:'Разобрать конкретный пример',s:'k'}]},
{q:'В свободное время я предпочитаю:',o:[{t:'Смотреть видео, листать картинки',s:'v'},{t:'Слушать музыку или подкасты',s:'a'},{t:'Заниматься спортом или мастерить',s:'k'}]},
{q:'Когда злюсь, я:',o:[{t:'Представляю ситуацию мысленно',s:'v'},{t:'Говорю об этом (жалуюсь, обсуждаю)',s:'a'},{t:'Хожу туда-сюда, сжимаю кулаки',s:'k'}]},
{q:'Новый телефон я освою быстрее, если:',o:[{t:'Посмотрю видеоинструкцию',s:'v'},{t:'Кто-то расскажет по шагам',s:'a'},{t:'Просто начну тыкать и разберусь',s:'k'}]},
{q:'На контрольной я чаще:',o:[{t:'Вижу ответ «картинкой» в голове',s:'v'},{t:'Проговариваю решение про себя',s:'a'},{t:'Пишу и считаю, чтобы «нащупать» ответ',s:'k'}]},
{q:'Мне мешает сосредоточиться:',o:[{t:'Беспорядок на столе, мелькание',s:'v'},{t:'Шум и разговоры',s:'a'},{t:'Неудобное кресло, духота',s:'k'}]},
{q:'При чтении книги я:',o:[{t:'Представляю картинки и сцены',s:'v'},{t:'Как будто слышу голоса героев',s:'a'},{t:'Чувствую, будто сам там нахожусь',s:'k'}]},
{q:'Если покупаю вещь, для меня важнее:',o:[{t:'Как она выглядит',s:'v'},{t:'Что о ней говорят',s:'a'},{t:'Как она ощущается (на ощупь, удобство)',s:'k'}]},
{q:'Чтобы выучить стихотворение, я:',o:[{t:'Перечитываю много раз',s:'v'},{t:'Читаю вслух или слушаю',s:'a'},{t:'Хожу по комнате и повторяю с жестами',s:'k'}]},
{q:'Учитель объясняет лучше, если:',o:[{t:'Рисует на доске, показывает слайды',s:'v'},{t:'Рассказывает интересно и эмоционально',s:'a'},{t:'Даёт попробовать, эксперимент',s:'k'}]},
{q:'Мне легче общаться:',o:[{t:'В переписке (вижу текст)',s:'v'},{t:'По телефону или голосом',s:'a'},{t:'Лично, вживую',s:'k'}]},
{q:'Когда вспоминаю отпуск, я думаю о:',o:[{t:'Пейзажах, фотографиях',s:'v'},{t:'Звуках (море, музыка)',s:'a'},{t:'Ощущениях (тепло, вкус еды)',s:'k'}]},
{q:'Конспект я веду:',o:[{t:'С цветными пометками, схемами',s:'v'},{t:'Записываю главные мысли словами',s:'a'},{t:'Почти не пишу, запоминаю по ходу',s:'k'}]},
{q:'Мне нравятся игры:',o:[{t:'С красивой графикой',s:'v'},{t:'С озвучкой и музыкой',s:'a'},{t:'С активным управлением (экшн, спорт)',s:'k'}]},
{q:'Когда объясняю другу, я:',o:[{t:'Рисую на бумаге или показываю на экране',s:'v'},{t:'Рассказываю подробно словами',s:'a'},{t:'Показываю на примере, руками',s:'k'}]},
{q:'Лучше всего учусь:',o:[{t:'Один, с книгой или экраном',s:'v'},{t:'В группе, обсуждая',s:'a'},{t:'На практике, пробуя',s:'k'}]},
];

let styleCur=0,styleAns=[];
function launchStyle(){styleCur=0;styleAns=[];go('psych');renderPsych('style')}

// ═══════════════════════════════════════
// TEMPERAMENT TEST (Eysenck-based)
// ═══════════════════════════════════════
const TEMP_Q=[
{q:'Ты легко заводишь новые знакомства?',d:'e'},
{q:'Тебе нравятся шумные компании?',d:'e'},
{q:'Ты часто действуешь не подумав?',d:'e'},
{q:'Тебе легко выступать перед классом?',d:'e'},
{q:'Ты быстро переключаешься с одного дела на другое?',d:'e'},
{q:'Тебе скучно сидеть на одном месте?',d:'e'},
{q:'Ты любишь организовывать других?',d:'e'},
{q:'Тебе нравится быть в центре внимания?',d:'e'},
{q:'Ты часто первый начинаешь разговор?',d:'e'},
{q:'Ты предпочитаешь действовать, а не планировать?',d:'e'},
{q:'Ты часто волнуешься перед контрольной?',d:'n'},
{q:'Тебя легко обидеть?',d:'n'},
{q:'Ты часто чувствуешь себя уставшим без причины?',d:'n'},
{q:'Ты долго переживаешь из-за ошибок?',d:'n'},
{q:'Тебе трудно заснуть, когда думаешь о проблемах?',d:'n'},
{q:'Ты часто сомневаешься в своих решениях?',d:'n'},
{q:'Твоё настроение часто меняется?',d:'n'},
{q:'Ты чувствуешь себя неловко в новой обстановке?',d:'n'},
{q:'Ты склонен видеть в ситуациях плохое?',d:'n'},
{q:'Ты часто чувствуешь тревогу?',d:'n'},
];

let tempCur=0,tempAns=[];
function launchTemp(){tempCur=0;tempAns=[];go('psych');renderPsych('temp')}

// ═══════════════════════════════════════
// UNIFIED PSYCH RENDERER
// ═══════════════════════════════════════
let psychMode='';
function renderPsych(mode){
  psychMode=mode;
  const qs=mode==='style'?STYLE_Q:TEMP_Q;
  const cur=mode==='style'?styleCur:tempCur;
  const title=mode==='style'?'📚 Стиль восприятия':'🎭 Темперамент';

  if(cur>=qs.length){finishPsych(mode);return}

  document.getElementById('p-title').textContent=title;
  document.getElementById('p-progress').textContent=(cur+1)+'/'+qs.length;
  document.getElementById('p-pgfill').style.width=Math.round(cur/qs.length*100)+'%';

  const q=qs[cur];
  document.getElementById('p-question').textContent=mode==='style'?q.q:q.q;

  const optsEl=document.getElementById('p-opts');
  if(mode==='style'){
    optsEl.innerHTML=q.o.map((o,i)=>{return'<div class="likert-opt" onclick="psychSelStyle('+i+')"><div class="likert-dot"></div>'+o.t+'</div>'}).join('');
  } else {
    optsEl.innerHTML=['Да, точно','Скорее да','Скорее нет','Нет'].map((lbl,i)=>'<div class="likert-opt" onclick="psychSel('+i+')"><div class="likert-dot"></div>'+lbl+'</div>').join('');
  }
}

function psychSelStyle(idx){const q=STYLE_Q[styleCur];psychSel(q.o[idx].s)}

function wave92tLikertTarget(){
  let ev=null;
  try{ev=(typeof event!=='undefined')?event:null}catch(_){ev=null}
  let el=ev&&ev.currentTarget&&ev.currentTarget.classList?ev.currentTarget:null;
  if((!el||el===document)&&ev&&ev.target&&ev.target.closest)el=ev.target.closest('.likert-opt');
  return el&&el.classList?el:null;
}
function psychSel(val){
  if(psychMode==='style'){
    styleAns.push(val);
    document.querySelectorAll('.likert-opt').forEach(o=>{if(o.textContent.trim()!=='')o.style.pointerEvents='none'});
    const clicked=wave92tLikertTarget();if(clicked)clicked.classList.add('selected');
    setTimeout(()=>{styleCur++;renderPsych('style')},300);
  } else {
    tempAns.push(+val);
    const clicked=wave92tLikertTarget();if(clicked)clicked.classList.add('selected');
    setTimeout(()=>{tempCur++;renderPsych('temp')},300);
  }
}

function finishPsych(mode){
  if(mode==='style'){
    const counts={v:0,a:0,k:0};
    styleAns.forEach(s=>counts[s]++);
    const total=styleAns.length;
    const pv=Math.round(counts.v/total*100),pa=Math.round(counts.a/total*100),pk=Math.round(counts.k/total*100);
    const dominant=pv>=pa&&pv>=pk?'v':pa>=pk?'a':'k';
    const names={v:'Визуальный стиль 👁',a:'Слуховой стиль 👂',k:'Практический стиль ✋'};
    const descs={
      v:'Вы лучше всего воспринимаете информацию через зрение: схемы, таблицы, картинки, цветные пометки. Используйте майнд-карты, выделяйте маркером, смотрите обучающие видео.',
      a:'Вы лучше всего воспринимаете информацию на слух: лекции, обсуждения, аудиокниги. Читайте вслух, обсуждайте материал с друзьями, записывайте голосовые заметки.',
      k:'Вы лучше всего воспринимаете информацию через действие: практика, эксперименты, движение. Делайте модели, пишите от руки, ходите во время заучивания.'
    };
    const colors={v:'#2563eb',a:'#16a34a',k:'#ea580c'};
    let h='<div style="font-size:36px;margin-bottom:4px">📚</div>';
    h+='<div style="font-family:Unbounded,system-ui,sans-serif;font-size:20px;font-weight:900;color:'+colors[dominant]+'">'+names[dominant]+'</div>';
    h+='<div style="font-size:12px;color:var(--muted);margin:8px 0">Ваш преобладающий стиль обучения</div>';
    // Bars
    [{k:'v',n:'👁 Визуальный стиль',p:pv},{k:'a',n:'👂 Слуховой стиль',p:pa},{k:'k',n:'✋ Практический стиль',p:pk}].forEach(b=>{
      h+='<div class="bd-row"><span style="width:100px;font-weight:600;font-size:12px">'+b.n+'</span><div class="bd-bar"><div class="bd-fill" style="width:'+b.p+'%;background:'+colors[b.k]+'"></div></div><span class="mono" style="width:35px;text-align:right;font-size:12px;font-weight:700;color:'+colors[b.k]+'">'+b.p+'%</span></div>';
    });
    h+='<div style="margin-top:14px;text-align:left;background:#f8f7f4;border-radius:12px;padding:14px;font-size:13px;line-height:1.6"><b>💡 Рекомендации:</b><br>'+descs[dominant]+'</div>';
    h+='<div class="disclaimer">Результат показывает предпочтительный канал восприятия. Большинство людей используют все три, но один обычно доминирует.</div>';
    document.getElementById('pr-card').innerHTML=h;
    lastResult={type:'style',dominant:names[dominant],pv,pa,pk};
    try{localStorage.setItem('style_result',JSON.stringify({date:new Date().toISOString(),dominant,pv,pa,pk}))}catch{}
  } else {
    // Temperament
    const eScore=TEMP_Q.slice(0,10).reduce((s,_,i)=>{const v=tempAns[i];return s+(v<=1?1:0)},0);
    const nScore=TEMP_Q.slice(10).reduce((s,_,i)=>{const v=tempAns[10+i];return s+(v<=1?1:0)},0);
    const extro=eScore>=5;const neuro=nScore>=5;
    let type,emoji,desc;
    if(extro&&!neuro){type='Сангвиник';emoji='😊';desc='Активный, общительный, оптимистичный. Легко адаптируется, но может быть поверхностным. Лучший режим: разнообразие задач, работа в группе, частая смена деятельности.'}
    else if(extro&&neuro){type='Холерик';emoji='🔥';desc='Энергичный, вспыльчивый, целеустремлённый. Быстро загорается, но может быстро остыть. Лучший режим: соревнования, дедлайны, лидерские задачи.'}
    else if(!extro&&!neuro){type='Флегматик';emoji='🧊';desc='Спокойный, уравновешенный, настойчивый. Работает медленно, но надёжно. Лучший режим: планомерная работа, чёткий график, минимум отвлечений.'}
    else{type='Меланхолик';emoji='🌧';desc='Чувствительный, вдумчивый, перфекционист. Глубоко переживает, склонен к тревоге. Лучший режим: тихая обстановка, индивидуальный темп, поддержка.'}

    let h='<div style="font-size:36px;margin-bottom:4px">'+emoji+'</div>';
    h+='<div style="font-family:Unbounded,system-ui,sans-serif;font-size:20px;font-weight:900">'+type+'</div>';
    h+='<div style="font-size:12px;color:var(--muted);margin:8px 0">Ваш тип темперамента</div>';
    // Axes
    h+='<div style="margin:16px 0">';
    h+='<div class="bd-row"><span style="width:100px;font-weight:600;font-size:12px">Экстраверсия</span><div class="bd-bar"><div class="bd-fill" style="width:'+eScore*10+'%;background:var(--accent)"></div></div><span class="mono" style="width:35px;text-align:right;font-size:12px;font-weight:700">'+eScore+'/10</span></div>';
    h+='<div class="bd-row"><span style="width:100px;font-weight:600;font-size:12px">Нейротизм</span><div class="bd-bar"><div class="bd-fill" style="width:'+nScore*10+'%;background:var(--orange)"></div></div><span class="mono" style="width:35px;text-align:right;font-size:12px;font-weight:700">'+nScore+'/10</span></div>';
    h+='</div>';
    // Grid
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;text-align:center;margin:12px 0">';
    h+='<div style="padding:10px;border-radius:8px;background:'+(type==='Меланхолик'?'#dbeafe':'#f8f7f4')+'"><b>Меланхолик</b><br>интроверт+нейротик</div>';
    h+='<div style="padding:10px;border-radius:8px;background:'+(type==='Холерик'?'#fee2e2':'#f8f7f4')+'"><b>Холерик</b><br>экстраверт+нейротик</div>';
    h+='<div style="padding:10px;border-radius:8px;background:'+(type==='Флегматик'?'#f0fdf4':'#f8f7f4')+'"><b>Флегматик</b><br>интроверт+стабильный</div>';
    h+='<div style="padding:10px;border-radius:8px;background:'+(type==='Сангвиник'?'#fef9c3':'#f8f7f4')+'"><b>Сангвиник</b><br>экстраверт+стабильный</div>';
    h+='</div>';
    h+='<div style="text-align:left;background:#f8f7f4;border-radius:12px;padding:14px;font-size:13px;line-height:1.6"><b>💡 Рекомендации:</b><br>'+desc+'</div>';
    h+='<div class="disclaimer">Тип темперамента — врождённая особенность нервной системы. Нет «хороших» или «плохих» типов. Адаптировано по методике Айзенка.</div>';
    document.getElementById('pr-card').innerHTML=h;
    lastResult={type:'temp',tempType:type,eScore,nScore};
    try{localStorage.setItem('temp_result',JSON.stringify({date:new Date().toISOString(),type,eScore,nScore}))}catch{}
  }
  go('presult');
}

// ═══ SHARE ═══
let lastResult=null;
function shareResult(){
  if(!lastResult)return;
  let t='';
  if(lastResult.type==='iq'){
    const l=lastResult;t='🧠 Тест логического мышления\nБалл: '+l.iq+' ('+l.pctl+'-й перцентиль)\n'+l.tOk+'/'+l.tQ+' ('+l.rawPct+'%)\n';
    l.parts.forEach((p,i)=>{t+=(p.pct>=80?'🟢':p.pct>=50?'🟡':'🔴')+' '+l.sn[i]+': '+p.ok+'/'+p.total+'\n'});
  }
  t+='\nhttps://organizm777.github.io/misha-trainer/tests.html';
  if(navigator.share)navigator.share({text:t}).catch(()=>{});else navigator.clipboard.writeText(t).then(()=>alert('Скопировано!')).catch(()=>{});
}
function sharePsych(){
  let t='';
  if(lastResult&&lastResult.type==='style'){t='📚 Стиль восприятия\nРезультат: '+lastResult.dominant+'\n👁 Визуальный стиль: '+lastResult.pv+'%\n👂 Слуховой стиль: '+lastResult.pa+'%\n✋ Практический стиль: '+lastResult.pk+'%'}
  else if(lastResult&&lastResult.type==='temp'){t='🎭 Темперамент: '+lastResult.tempType+'\nЭкстраверсия: '+lastResult.eScore+'/10\nНейротизм: '+lastResult.nScore+'/10'}
  t+='\nhttps://organizm777.github.io/misha-trainer/tests.html';
  if(navigator.share)navigator.share({text:t}).catch(()=>{});else navigator.clipboard.writeText(t).then(()=>alert('Скопировано!')).catch(()=>{});
}

// ═══ MENU REFRESH ═══
function refreshMenu(){
  try{const r=JSON.parse(localStorage.getItem('iq_results')||'[]');if(r.length){const l=r[r.length-1];document.getElementById('iq-done').textContent='✓ Логика: '+l.iq+' ('+l.pct+'%)'}}catch{}
  try{const s=JSON.parse(localStorage.getItem('style_result')||'null');if(s)document.getElementById('style-done').textContent='✓ '+{v:'Визуальный стиль',a:'Слуховой стиль',k:'Практический стиль'}[s.dominant]}catch{}
  try{const t=JSON.parse(localStorage.getItem('temp_result')||'null');if(t)document.getElementById('temp-done').textContent='✓ '+t.type}catch{}
;if(typeof updatePortraitCTA==="function")updatePortraitCTA()}
refreshMenu();

// Update portrait CTA state
(function updatePortraitCTA(){
  const done = typeof countDoneTests==="function" ? countDoneTests() : 0;
  const cta = document.getElementById('portrait-cta');
  const hint = document.getElementById('portrait-hint');
  if(!cta) return;
  if(done >= 3){
    cta.style.opacity='1';
    cta.querySelector('button').style.pointerEvents='auto';
    if(hint) hint.textContent = done >= 7 ? '✓ Все тесты пройдены — полный портрет!' : `✓ ${done} из 7 тестов — портрет уже доступен`;
  } else {
    cta.style.opacity='.4';
    cta.querySelector('button').style.pointerEvents='none';
  }
})();
