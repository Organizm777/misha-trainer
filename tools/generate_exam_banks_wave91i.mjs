#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'assets/data/exam_bank');
const SRC_DIR = path.join(ROOT, 'assets/_src/js');
const CATALOG_PATH = path.join(DATA_DIR, 'catalog.json');

function writeJSON(rel, value){ fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(value, null, 2) + '\n'); }
function readJSON(rel){ return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
function slug(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/gi,'_').replace(/^_+|_+$/g,'') || 'topic'; }
function uniqOptions(answer, options){
  const out = [String(answer)];
  for (const opt of options.map(String)) if (!out.includes(opt)) out.push(opt);
  while (out.length < 4) out.push('Вариант ' + out.length);
  return out.slice(0,4);
}
function row(base){
  const r = {
    exam: base.exam,
    subject: base.subject,
    year: 2026,
    variant: base.variant,
    task_num: base.task_num,
    type: base.type || 'choice',
    max_score: base.max_score || 1,
    q: base.q,
    a: String(base.a),
    o: uniqOptions(base.a, base.o || []),
    h: base.h || '',
    ex: base.ex || base.h || '',
    topic_tag: base.topic_tag || slug(base.section || base.topic || 'exam'),
    section: base.section || '',
    topic: base.topic || base.section || base.topic_tag || 'Экзаменационное задание',
    difficulty: base.difficulty || 1,
    part: base.part || ((base.max_score || 1) > 1 ? 'B' : 'A'),
    source_tag: 'wave91i_generated_training',
    criteria: base.criteria || ['Правильный ответ: ' + String(base.a)]
  };
  if (base.solution_steps) r.solution_steps = base.solution_steps;
  return r;
}
function makeSteps(section, rule, answer){
  return [
    'Определи раздел задания: ' + section + '.',
    'Выпиши ключевое правило: ' + rule,
    'Проверь варианты ответа по правилу, не подставляя лишних условий.',
    'Итоговый ответ: ' + answer + '.'
  ];
}
function binary(n){ return n.toString(2); }
function ceilLog2(n){ let bits = 0, p = 1; while (p < n) { p *= 2; bits++; } return bits; }
function pick(arr, v, t=0){ return arr[(v + t) % arr.length]; }

function ogeInfoTask(v, t){
  const base = { exam:'ОГЭ', subject:'informatics', variant:v, task_num:t, part:'A', max_score:1 };
  switch(t){
    case 1: { const n = 9 + v; return row({...base, section:'Системы счисления', q:`Переведи число ${binary(n)}₂ в десятичную систему.`, a:n, o:[n+1,n-1,n+2], h:'Сложи степени двойки, соответствующие единицам в записи.', ex:`${binary(n)}₂ = ${n}.`, difficulty:1 }); }
    case 2: { const n = 12 + v; return row({...base, section:'Системы счисления', q:`Как записывается десятичное число ${n} в двоичной системе?`, a:binary(n), o:[binary(n+1), binary(Math.max(1,n-1)), String(n)], h:'Последовательно дели число на 2 и записывай остатки снизу вверх.', ex:`${n}₁₀ = ${binary(n)}₂.`, difficulty:1 }); }
    case 3: { const A = v % 2, B = (v + 1) % 2; const ans = (A && !B) ? '1' : '0'; return row({...base, section:'Логика', q:`При A=${A}, B=${B} чему равно выражение A И НЕ B?`, a:ans, o:['1','0','истина','ложь'], h:'НЕ меняет значение B, И истинно только при двух единицах.', ex:`НЕ B=${B?0:1}, значит A И НЕ B = ${ans}.`, difficulty:1 }); }
    case 4: { const A = v % 2, B = (v + 2) % 2; const ans = (!A || B) ? '1' : '0'; return row({...base, section:'Логика', q:`При A=${A}, B=${B} чему равна импликация A → B?`, a:ans, o:['1','0','истина','ложь'], h:'Импликация ложна только в случае A=1, B=0.', ex:`A → B = ${ans}.`, difficulty:2 }); }
    case 5: { const kb = 2 + (v % 5); const ans = String(kb * 1024); return row({...base, section:'Информация и файлы', q:`Сколько байт в ${kb} КБ?`, a:ans, o:[kb*1000,kb*1024+512,kb*512], h:'1 КБ = 1024 байта.', ex:`${kb} · 1024 = ${ans} байт.`, difficulty:1 }); }
    case 6: { const size = 12 + v; const speed = 2 + (v % 4); const ans = String(Math.ceil(size / speed)); return row({...base, section:'Передача данных', q:`Файл ${size} МБ передаётся со скоростью ${speed} МБ/с. Сколько секунд минимум займёт передача?`, a:ans, o:[Math.floor(size/speed), Math.ceil(size/speed)+1, size*speed], h:'Время = объём / скорость, при необходимости округляем вверх.', ex:`${size}/${speed} = ${(size/speed).toFixed(2)}, минимум ${ans} с.`, difficulty:2 }); }
    case 7: { const a = v+1, b = v+3, c = v+5; const ans = a+b+c; return row({...base, section:'Электронные таблицы', q:`В ячейках A1=${a}, A2=${b}, A3=${c}. Чему равна формула =СУММ(A1:A3)?`, a:ans, o:[ans+1,ans-1,a*b*c], h:'СУММ складывает все ячейки диапазона.', ex:`${a}+${b}+${c}=${ans}.`, difficulty:1 }); }
    case 8: { const n = 3 + (v % 7); return row({...base, section:'Алгоритмы', q:`Сколько раз выполнится цикл Python for i in range(${n})?`, a:n, o:[n-1,n+1,n*2], h:'range(n) содержит n чисел: от 0 до n−1.', ex:`Цикл выполнится ${n} раз.`, difficulty:1 }); }
    case 9: { const x = 10 + v; const ans = x % 2 === 0 ? 'чётное' : 'нечётное'; return row({...base, section:'Программирование', q:`Что выведет программа: x=${x}; print('чётное' if x%2==0 else 'нечётное')?`, a:ans, o:['чётное','нечётное','0','1'], h:'Остаток от деления на 2 показывает чётность.', ex:`${x}%2=${x%2}, значит вывод: ${ans}.`, difficulty:2 }); }
    case 10: { const words=['school','python','data','logic','robot','vector']; const s=pick(words,v); return row({...base, section:'Строки', q:`Чему равен len("${s}") в Python?`, a:s.length, o:[s.length+1,s.length-1,s.length*2], h:'len считает количество символов строки.', ex:`В строке «${s}» ${s.length} символов.`, difficulty:1 }); }
    case 11: { return row({...base, section:'Файлы и маски', q:'Какая маска выберет все текстовые файлы с расширением .txt?', a:'*.txt', o:['?.txt','*.doc','txt.*','*txt'], h:'Звёздочка означает любое имя файла.', ex:'*.txt — любое имя и расширение txt.', difficulty:1 }); }
    case 12: { const start=v; const k=3+(v%4); const ans=start+2*k; return row({...base, section:'Алгоритмы', q:`Переменная x=${start}. Команда x=x+2 выполняется ${k} раза. Чему станет равно x?`, a:ans, o:[ans-2,ans+2,start*k], h:'Каждое повторение увеличивает x на 2.', ex:`${start}+2·${k}=${ans}.`, difficulty:1 }); }
    case 13: { const ages=[12+v%5, 15, 16+v%3, 18, 14]; const limit=15; const ans=ages.filter(x=>x>limit).length; return row({...base, section:'Базы данных', q:`В таблице возраста: ${ages.join(', ')}. Сколько записей удовлетворяют условию age > ${limit}?`, a:ans, o:[ans+1,Math.max(0,ans-1),ages.length], h:'Посчитай только числа строго больше заданного порога.', ex:`Больше ${limit}: ${ages.filter(x=>x>limit).join(', ')}; всего ${ans}.`, difficulty:2 }); }
    case 14: { const r=2+(v%4), u=1+(v%3); return row({...base, section:'Исполнитель Робот', q:`Робот из точки (0;0) сделал ${r} шагов вправо и ${u} шагов вверх. Где он оказался?`, a:`(${r};${u})`, o:[`(${u};${r})`,`(${r+u};0)`,`(0;${r+u})`], h:'Вправо меняет x, вверх меняет y.', ex:`Итоговая точка: (${r};${u}).`, difficulty:1 }); }
    default: { const n=4+(v%6); const ans=n*(n+1)/2; return row({...base, section:'Программирование', q:`Программа складывает числа от 1 до ${n}. Какой результат она выведет?`, a:ans, o:[ans+n,ans-1,n*n], h:'Сумма 1+…+n равна n(n+1)/2.', ex:`${n}·${n+1}/2=${ans}.`, difficulty:2 }); }
  }
}

function egeInfoTask(v, t){
  const base = { exam:'ЕГЭ', subject:'informatics', variant:v, task_num:t, part:'A', max_score:1 };
  switch(t){
    case 1: { const n=17+(v%12); const bits=ceilLog2(n); return row({...base, section:'Кодирование информации', q:`Алфавит содержит ${n} символов. Минимум сколько бит нужно для кодирования одного символа?`, a:bits, o:[bits-1,bits+1,n], h:'Нужно минимальное k, при котором 2^k ≥ мощность алфавита.', ex:`2^${bits-1}<${n}≤2^${bits}, значит ${bits} бит.`, difficulty:2 }); }
    case 2: { const chars=80+v*3; const bits=8; const ans=chars*bits/8; return row({...base, section:'Кодирование текста', q:`Текст из ${chars} символов кодируется по ${bits} бит на символ. Сколько байт занимает текст?`, a:ans, o:[ans*8, ans+8, Math.round(ans/2)], h:'Байты = символы · биты / 8.', ex:`${chars}·${bits}/8=${ans} байт.`, difficulty:1 }); }
    case 3: { const ans = 1; return row({...base, section:'Логика', q:`Сколько наборов (A,B) делают выражение A ИЛИ (НЕ B) ложным?`, a:ans, o:[0,2,3], h:'ИЛИ ложно только когда обе части ложны.', ex:'A должно быть 0, НЕ B должно быть 0, значит B=1. Один набор: A=0, B=1.', difficulty:2 }); }
    case 4: { const a=2+(v%4), b=5+(v%5), c=3+(v%3); const ans=Math.min(a+b,c+b); return row({...base, section:'Графы', q:`Из A в B путь ${a}, из B в D ${b}, из A в C ${c}, из C в D ${b}. Кратчайший путь A→D?`, a:ans, o:[a+b+c, Math.max(a+b,c+b), ans+1], h:'Сравни маршруты A-B-D и A-C-D.', ex:`min(${a}+${b}, ${c}+${b})=${ans}.`, difficulty:2 }); }
    case 5: { const n=3+(v%5); const ans=2*n+1; return row({...base, section:'Алгоритмы', q:`Функция F(n)=2n+1. Чему равно F(${n})?`, a:ans, o:[2*n,ans+1,n*n], h:'Подставь n в формулу.', ex:`2·${n}+1=${ans}.`, difficulty:1 }); }
    case 6: { const a=2+(v%4), b=3+(v%5); const ans=a*b; return row({...base, section:'Программирование', q:`Сколько раз выполнится тело внутреннего цикла: for i in range(${a}): for j in range(${b}): ... ?`, a:ans, o:[a+b, a*b+1, Math.max(a,b)], h:'Во вложенных циклах количества итераций перемножаются.', ex:`${a}·${b}=${ans}.`, difficulty:2 }); }
    case 7: { const x=v+2, y=v+4; const ans=x*x+y; return row({...base, section:'Электронные таблицы', q:`A1=${x}, B1=${y}. Чему равна формула =A1*A1+B1?`, a:ans, o:[x+y, x*y+y, ans+1], h:'Сначала умножение, затем сложение.', ex:`${x}·${x}+${y}=${ans}.`, difficulty:1 }); }
    case 8: { const bits=8+(v%5); const ans=Math.pow(2,bits)-2; return row({...base, section:'Сети', q:`В сети для адресов узлов выделено ${bits} бит. Сколько рабочих адресов можно получить, если исключить адрес сети и broadcast?`, a:ans, o:[Math.pow(2,bits), Math.pow(2,bits)-1, Math.pow(2,bits-1)], h:'Всего 2^bits адресов, два служебных исключаются.', ex:`2^${bits}−2=${ans}.`, difficulty:3 }); }
    case 9: { const n=30+v; return row({...base, section:'Системы счисления', q:`Переведи ${n}₁₀ в шестнадцатеричную систему.`, a:n.toString(16).toUpperCase(), o:[(n+1).toString(16).toUpperCase(), binary(n), String(n)], h:'Дели число на 16 и записывай остатки.', ex:`${n}₁₀ = ${n.toString(16).toUpperCase()}₁₆.`, difficulty:2 }); }
    case 10: { const x=v%7+1; const ans=x*x-1; return row({...base, section:'Программирование', q:`Что выведет Python-код: x=${x}; print(x*x-1)?`, a:ans, o:[x*x, ans+1, x-1], h:'Вычисли квадрат x, затем вычти 1.', ex:`${x}²−1=${ans}.`, difficulty:1 }); }
    case 11: { const n=64*Math.pow(2,v%4); const ans=Math.ceil(Math.log2(n)); return row({...base, section:'Поиск и сортировка', q:`Сколько сравнений максимум нужно бинарному поиску среди ${n} элементов?`, a:ans, o:[ans+1, ans-1, n/2], h:'Оценка бинарного поиска — ⌈log₂ n⌉.', ex:`log₂(${n})=${ans}.`, difficulty:3 }); }
    case 12: { const rows=[v%2,1,0,1,0,1]; const ans=rows.filter(Boolean).length; return row({...base, section:'Базы данных', q:`В таблице флаг active принимает значения ${rows.join(', ')}. Сколько записей попадёт в WHERE active=1?`, a:ans, o:[ans+1,Math.max(0,ans-1),rows.length], h:'Считай только единицы.', ex:`Единиц: ${ans}.`, difficulty:1 }); }
    case 13: { return row({...base, section:'Файловая система', q:'Какая маска выбирает файлы report1.csv, report2.csv, но не report_old.txt?', a:'report?.csv', o:['report*.txt','*.report','report.csv','?.csv'], h:'? означает ровно один символ, расширение должно быть csv.', ex:'report?.csv подходит к report1.csv и report2.csv.', difficulty:2 }); }
    case 14: { const s='ABCDE'; const start=v%3; const ans=s.slice(start,start+2); return row({...base, section:'Строки', q:`Чему равно "${s}"[${start}:${start+2}] в Python?`, a:ans, o:[s[start],s.slice(start+1,start+3),s], h:'Срез включает левую границу и не включает правую.', ex:`Получаем «${ans}».`, difficulty:2 }); }
    default: { const a=1+(v%5), b=2+(v%5), c=3+(v%5); const ans=a+b+c; return row({...base, section:'Исполнители и алгоритмы', q:`Автомат получает числа ${a}, ${b}, ${c} и выводит их сумму. Что будет выведено?`, a:ans, o:[ans+1, ans-1, a*b*c], h:'Сложи все входные числа.', ex:`${a}+${b}+${c}=${ans}.`, difficulty:1 }); }
  }
}

const historyFacts = [
  ['Крещение Руси','988','Владимир Святославич'], ['Невская битва','1240','Александр Невский'], ['Куликовская битва','1380','Дмитрий Донской'], ['стояние на реке Угре','1480','Иван III'], ['венчание Ивана IV на царство','1547','Иван IV'], ['избрание Михаила Романова','1613','Земский собор'], ['основание Санкт-Петербурга','1703','Пётр I'], ['провозглашение Российской империи','1721','Пётр I'], ['Отечественная война','1812','Александр I'], ['восстание декабристов','1825','декабристы'], ['отмена крепостного права','1861','Александр II'], ['Первая российская революция','1905','Николай II'], ['Февральская революция','1917','Временное правительство'], ['образование СССР','1922','советские республики'], ['начало Великой Отечественной войны','1941','СССР и Германия'], ['первый полёт человека в космос','1961','Юрий Гагарин'], ['распад СССР','1991','союзные республики']
];
const cultureFacts = [['Андрей Рублёв','иконопись'],['Михаил Ломоносов','наука и просвещение'],['Лев Толстой','литература'],['Пётр Чайковский','музыка'],['Казимир Малевич','авангард'],['Сергей Королёв','космическая техника']];
function historyOptions(correct, pool){ return [correct, ...pool.filter(x=>String(x)!==String(correct)).slice(0,3)]; }
function ogeHistoryTask(v,t){
  const base={exam:'ОГЭ',subject:'history',variant:v,task_num:t,part:t>=20?'B':'A',max_score:t>=20?2:1};
  const fact=pick(historyFacts,v,t); const otherYears=historyFacts.map(f=>f[1]).filter(y=>y!==fact[1]);
  switch(t){
    case 1: return row({...base, section:'Древняя Русь', q:`В каком году произошло событие «${fact[0]}»?`, a:fact[1], o:historyOptions(fact[1], otherYears), h:'Соотнеси событие с ключевой датой.', ex:`${fact[0]} — ${fact[1]} год.`, difficulty:1});
    case 2: return row({...base, section:'Персоналии', q:`С каким деятелем связано событие «${fact[0]}»?`, a:fact[2], o:historyOptions(fact[2], historyFacts.map(f=>f[2])), h:'Вспомни политического или культурного деятеля эпохи.', ex:`Событие связано с: ${fact[2]}.`, difficulty:1});
    case 3: return row({...base, section:'Хронология', q:`Какое событие произошло раньше: «${fact[0]}» или «${pick(historyFacts,v,t+4)[0]}»?`, a:Number(fact[1])<Number(pick(historyFacts,v,t+4)[1])?fact[0]:pick(historyFacts,v,t+4)[0], o:[fact[0],pick(historyFacts,v,t+4)[0],'оба одновременно','нельзя сравнить'], h:'Сравни годы событий.', ex:'Ранее произошло событие с меньшим годом.', difficulty:2});
    case 4: return row({...base, section:'Московское государство', q:'Какой процесс завершился стоянием на реке Угре?', a:'освобождение от ордынской зависимости', o:['начало Смуты','создание Сената','отмена крепостного права'], h:'1480 год традиционно связывают с концом зависимости от Орды.', ex:'Стояние на Угре — рубеж освобождения от ордынской зависимости.', difficulty:2});
    case 5: return row({...base, section:'Смута и XVII век', q:'Какое событие считается началом династии Романовых?', a:'избрание Михаила Романова в 1613 году', o:['венчание Ивана IV','основание Санкт-Петербурга','восстание декабристов'], h:'После Смуты Земский собор избрал нового царя.', ex:'В 1613 году царём избрали Михаила Романова.', difficulty:1});
    case 6: return row({...base, section:'Пётр I', q:'Какой город был основан Петром I в 1703 году?', a:'Санкт-Петербург', o:['Москва','Казань','Новгород'], h:'Город стал новой столицей Российской империи.', ex:'Санкт-Петербург основан в 1703 году.', difficulty:1});
    case 7: return row({...base, section:'XVIII век', q:'Что относится к реформам Петра I?', a:'создание Сената и коллегий', o:['отмена крепостного права','созыв Учредительного собрания','полет Гагарина'], h:'Пётр I перестраивал органы управления.', ex:'Сенат и коллегии — элементы петровских реформ.', difficulty:2});
    case 8: return row({...base, section:'XIX век', q:'Какой правитель отменил крепостное право?', a:'Александр II', o:['Николай I','Пётр I','Иван III'], h:'Крестьянская реформа была проведена в 1861 году.', ex:'Отмена крепостного права связана с Александром II.', difficulty:1});
    case 9: return row({...base, section:'Россия начала XX века', q:'Какое событие относится к 1905 году?', a:'Первая российская революция', o:['Куликовская битва','образование СССР','Крещение Руси'], h:'1905–1907 годы — первая российская революция.', ex:'1905 год — начало Первой российской революции.', difficulty:1});
    case 10: return row({...base, section:'Революции 1917 года', q:'Что возникло после Февральской революции 1917 года?', a:'Временное правительство', o:['Сенат Петра I','Государственный комитет обороны','Земский собор'], h:'После падения монархии власть перешла к Временному правительству.', ex:'Февраль 1917 года — Временное правительство.', difficulty:2});
    case 11: return row({...base, section:'СССР 1920–1930-х', q:'В каком году был образован СССР?', a:'1922', o:['1917','1936','1945'], h:'Союзный договор был подписан в 1922 году.', ex:'СССР образован в 1922 году.', difficulty:1});
    case 12: return row({...base, section:'Великая Отечественная война', q:'Какие годы охватывает Великая Отечественная война?', a:'1941–1945', o:['1939–1945','1914–1918','1905–1907'], h:'Для СССР война началась 22 июня 1941 года и завершилась в мае 1945 года.', ex:'Великая Отечественная война: 1941–1945.', difficulty:1});
    case 13: return row({...base, section:'Послевоенный СССР', q:'Кто совершил первый полёт человека в космос?', a:'Юрий Гагарин', o:['Сергей Королёв','Алексей Леонов','Герман Титов'], h:'12 апреля 1961 года — полёт Гагарина.', ex:'Первым человеком в космосе был Юрий Гагарин.', difficulty:1});
    case 14: return row({...base, section:'Перестройка', q:'Какой год связан с распадом СССР?', a:'1991', o:['1985','1993','2000'], h:'Союз прекратил существование в декабре 1991 года.', ex:'Распад СССР — 1991 год.', difficulty:1});
    case 15: { const cf=pick(cultureFacts,v,t); return row({...base, section:'Культура', q:`С какой сферой прежде всего связан ${cf[0]}?`, a:cf[1], o:historyOptions(cf[1], cultureFacts.map(f=>f[1])), h:'Соотнеси деятеля культуры с областью.', ex:`${cf[0]} связан со сферой: ${cf[1]}.`, difficulty:1}); }
    case 16: return row({...base, section:'Термины', q:'Что означает термин «реформа»?', a:'преобразование какой-либо стороны жизни общества', o:['полный отказ от управления','случайное событие','военный союз'], h:'Реформа — целенаправленное изменение.', ex:'Реформа — преобразование, проводимое властью или обществом.', difficulty:1});
    case 17: return row({...base, section:'Историческая карта', q:'Если в задании на карте отмечен поход Наполеона на Москву, к какой войне он относится?', a:'Отечественная война 1812 года', o:['Северная война','Крымская война','Гражданская война'], h:'Наполеон вторгся в Россию в 1812 году.', ex:'Поход Наполеона связан с Отечественной войной 1812 года.', difficulty:2});
    case 18: return row({...base, section:'Источники', q:'Как называется письменное свидетельство, созданное современником событий?', a:'исторический источник', o:['географическая карта','хронологическая ошибка','экономический прогноз'], h:'Источник даёт сведения о прошлом.', ex:'Письменные свидетельства — один из типов исторических источников.', difficulty:1});
    case 19: return row({...base, section:'Причины и последствия', q:'Какое последствие имела отмена крепостного права?', a:'крестьяне получили личную свободу', o:['началась Северная война','возникла Киевская Русь','была создана Орда'], h:'Главный итог реформы — изменение правового положения крестьян.', ex:'После реформы 1861 года крестьяне стали лично свободными.', difficulty:2});
    case 20: return row({...base, section:'Работа с источником', q:'В тексте говорится: «царь избран Земским собором после Смуты». О каком событии речь?', a:'избрание Михаила Романова', o:['основание Петербурга','отмена крепостного права','первый полёт в космос'], h:'Земский собор 1613 года завершил Смуту.', ex:'Речь об избрании Михаила Романова.', difficulty:2});
    case 21: return row({...base, section:'Сравнение эпох', q:'Что объединяет реформы Петра I и Александра II?', a:'они меняли важные стороны жизни государства и общества', o:['они проходили в один год','они были только культурными','они отменяли письменность'], h:'Обе реформаторские эпохи связаны с крупными преобразованиями.', ex:'Пётр I и Александр II проводили масштабные реформы.', difficulty:2});
    case 22: return row({...base, section:'Хронология', q:'Выбери правильную последовательность.', a:'Крещение Руси → Куликовская битва → Отмена крепостного права', o:['Отмена крепостного права → Крещение Руси → Куликовская битва','Куликовская битва → Отмена крепостного права → Крещение Руси','Крещение Руси → Отмена крепостного права → Куликовская битва'], h:'Сравни даты: 988, 1380, 1861.', ex:'Правильный порядок: 988 → 1380 → 1861.', difficulty:2});
    case 23: return row({...base, section:'Мини-вывод', q:'Какой навык проверяет задание на установление причин и последствий?', a:'понимание связи между событием и его результатом', o:['только знание алфавита','умение считать проценты','знание химических формул'], h:'Причина объясняет, почему событие произошло; последствие — что изменилось.', ex:'Это задание на причинно-следственные связи.', difficulty:1});
    default: return row({...base, section:'Обобщение', q:'Что помогает не ошибиться в историческом задании с датами?', a:'сначала определить век и затем сравнить годы', o:['игнорировать даты','выбирать самый длинный ответ','смотреть только на первое слово'], h:'Век и порядок событий резко уменьшают число вариантов.', ex:'Определи век, затем расположи события на линии времени.', difficulty:1});
  }
}
function egeHistoryTask(v,t){
  const base={exam:'ЕГЭ',subject:'history',variant:v,task_num:t,part:'A',max_score:1};
  const fact=pick(historyFacts,v,t);
  if(t<=17){ const r=ogeHistoryTask(v,t); return { ...r, exam:'ЕГЭ', subject:'history', variant:v, task_num:t, max_score:1, part:'A' }; }
  switch(t){
    case 18: return row({...base, section:'Историческое сочинение: аргументация', q:'Какой элемент нужен для исторической аргументации?', a:'факт, объясняющий причинно-следственную связь', o:['только эмоциональная оценка','случайная дата без события','пересказ без вывода'], h:'Аргумент должен связывать факт с тезисом.', ex:'В ЕГЭ важно не просто назвать факт, а показать его роль.', difficulty:3});
    case 19: return row({...base, section:'Культура', q:'Как корректно использовать факт культуры в ответе?', a:'назвать деятеля, произведение или направление и связать с эпохой', o:['только написать «культура развивалась»','заменить факт личным мнением','не указывать эпоху'], h:'Культурный факт должен быть конкретным.', ex:'Например: Андрей Рублёв — иконопись Древней Руси.', difficulty:2});
    default: return row({...base, section:'Сравнение исторических процессов', q:'Что является корректным критерием сравнения реформ?', a:'цели, методы, участники и последствия', o:['длина названия реформы','только век без содержания','случайный набор дат'], h:'Сравнение требует общих оснований.', ex:'Сравнивай реформы по одинаковым параметрам.', difficulty:3});
  }
}

function buildBank({bank_id,family_id,exam,subject,subject_id,year=2026,variantCount,taskCount,structure_id,structureTitle,timeLimit,scoreKind,scoreModel,accent,grades,summary,slotSections,taskFactory}){
  const variants = Array.from({length:variantCount}, (_,i)=>i+1);
  const items = [];
  for (const v of variants) for (let t=1;t<=taskCount;t++) items.push(taskFactory(v,t));
  const slots = Array.from({length:taskCount}, (_,i)=>{
    const t=i+1; const sample=items.find(x=>x.task_num===t) || {}; const section=sample.section || slotSections[(t-1)%slotSections.length] || 'Раздел';
    return { task_num:t, type:sample.type || 'choice', max_score:sample.max_score || 1, section, topic_tag:sample.topic_tag || slug(section), part:sample.part || 'A' };
  });
  const bank = { bank_id, family_id, exam, subject, subject_id, year, source:'wave91i generated original training variants', description:summary, variants, item_count:items.length, items };
  const structure = { id:structure_id, bank_id, exam, subject, subject_id, year, time_limit_sec:timeLimit, score_kind:scoreKind, score_model:scoreModel, accent, grades, summary, bands: scoreKind==='grade' ? [ {min:0,label:'2',note:'ниже порога'}, {min:Math.ceil(taskCount*.4),label:'3',note:'базовый уровень'}, {min:Math.ceil(taskCount*.65),label:'4',note:'хороший уровень'}, {min:Math.ceil(taskCount*.85),label:'5',note:'сильный результат'} ] : [ {min:0,label:'ниже порога',note:'нужно добрать базу'}, {min:Math.ceil(taskCount*.35),label:'порог',note:'минимальный ориентир'}, {min:Math.ceil(taskCount*.55),label:'рабочий',note:'уверенная база'}, {min:Math.ceil(taskCount*.75),label:'сильный',note:'сильный результат'}, {min:Math.ceil(taskCount*.9),label:'высокий',note:'высокий результат'} ], slots, family_id };
  return {bank, structure};
}
function enrichProfileMathSteps(){
  const rel='assets/data/exam_bank/ege_profile_math_2026_foundation.json';
  const bank=readJSON(rel);
  bank.version='wave91i';
  bank.items=(bank.items||[]).map((item)=>{
    const section = item.section || item.topic_tag || 'профильная математика';
    const rule = item.h || item.ex || 'используй определение и стандартное преобразование';
    return { ...item, solution_steps: makeSteps(section, rule, item.a) };
  });
  bank.item_count=bank.items.length;
  writeJSON(rel, bank);
  return bank;
}
function familyPackPrefix(familyId){
  return {
    oge_math_2026_full:'oge_math_var', oge_russian_2026_full:'oge_russian_var', oge_english_2026_full:'oge_english_var', oge_social_2026_full:'oge_social_var',
    ege_profile_math_2026_part1:'ege_profile_math_var', ege_base_math_2026_full:'ege_base_math_var', ege_russian_2026_part1:'ege_russian_var', ege_social_2026_part1:'ege_social_var', ege_english_2026_part1:'ege_english_var', ege_physics_2026_part1:'ege_physics_var',
    oge_informatics_2026_full:'oge_informatics_var', ege_informatics_2026_part1:'ege_informatics_var', oge_history_2026_full:'oge_history_var', ege_history_2026_part1:'ege_history_var'
  }[familyId] || (familyId + '_var');
}
function chunkFileName(bankId){
  return {
    oge_informatics_2026_foundation:'exam_bank_oge_informatics_wave91i.js',
    ege_informatics_2026_foundation:'exam_bank_ege_informatics_wave91i.js',
    oge_history_2026_foundation:'exam_bank_oge_history_wave91i.js',
    ege_history_2026_foundation:'exam_bank_ege_history_wave91i.js',
    ege_profile_math_2026_foundation:'exam_bank_ege_profile_math_wave91.js'
  }[bankId] || (`exam_bank_${bankId.replace(/_2026_foundation$/,'')}_wave91i.js`);
}
function writeFamilyChunk(bank, structure){
  const familyId = bank.family_id;
  const prefix = familyPackPrefix(familyId);
  const tasks = structure.slots.map(slot => ({ task_num:slot.task_num, section:slot.section, type:slot.type, max_score:slot.max_score, topic_tag:slot.topic_tag, part:slot.part }));
  const family = { schema:'wave89q_exam_bank_v1', family_id:familyId, exam:bank.exam, subject:bank.subject_id || bank.subject, year:bank.year, variants:bank.variants, blueprint:{ schema:'wave89q_exam_bank_v1', family_id:familyId, exam:bank.exam, subject:bank.subject_id || bank.subject, year:bank.year, mode:structure.score_kind==='grade'?'full':'part1', task_count:tasks.length, time_limit_sec:structure.time_limit_sec, summary:structure.summary, score_kind:structure.score_kind, score_model:structure.score_model, accent:structure.accent, grades:structure.grades, tasks }, rows:bank.items, row_count:bank.items.length, pack_ids:bank.variants.map(v=>prefix+v), compiled_from:'json_bank', bank_id:bank.bank_id, structure_id:structure.id };
  const src = `/* wave91i lazy exam bank family: ${familyId} */\n(function(global){\n  var payload = global.WAVE89Q_EXAM_BANK || { version:\"wave91i\", schema:\"wave89q_exam_bank_v1\", catalog:{}, banks:{}, families:{}, __loadedFamilies:{} };\n  payload.banks = payload.banks || {};\n  payload.families = payload.families || {};\n  payload.__loadedFamilies = payload.__loadedFamilies || {};\n  payload.banks[${JSON.stringify(bank.bank_id)}] = ${JSON.stringify(bank)};\n  payload.families[${JSON.stringify(familyId)}] = ${JSON.stringify(family)};\n  payload.__loadedFamilies[${JSON.stringify(familyId)}] = true;\n  global.WAVE89Q_EXAM_BANK = payload;\n  if (global.window) global.window.WAVE89Q_EXAM_BANK = payload;\n  if (typeof payload.__resolveFamily === \"function\") payload.__resolveFamily(${JSON.stringify(familyId)});\n  try { if (global.dispatchEvent && typeof global.CustomEvent === \"function\") global.dispatchEvent(new CustomEvent(\"wave89q:family-loaded\", { detail:{ familyId:${JSON.stringify(familyId)}, bankId:${JSON.stringify(bank.bank_id)} } })); } catch(_err) {}\n})(typeof globalThis !== \"undefined\" ? globalThis : (typeof window !== \"undefined\" ? window : this));\n`;
  fs.writeFileSync(path.join(SRC_DIR, chunkFileName(bank.bank_id)), src);
}
function main(){
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH,'utf8'));
  catalog.version='wave91i';
  catalog.generated_from='wave91i_exam_banks_informatics_history_solution_steps';
  catalog.structures = catalog.structures || {};

  const generated = [
    buildBank({ bank_id:'oge_informatics_2026_foundation', family_id:'oge_informatics_2026_full', exam:'ОГЭ', subject:'Информатика', subject_id:'informatics', variantCount:30, taskCount:15, structure_id:'oge_informatics_full_v1', timeLimit:150*60, scoreKind:'grade', scoreModel:'oge_informatics_2026', accent:'#0f172a', grades:'9 класс', summary:'15 заданий · системы счисления, логика, таблицы, Python · JSON bank', slotSections:['Системы счисления','Логика','Информация и файлы','Алгоритмы','Программирование'], taskFactory:ogeInfoTask }),
    buildBank({ bank_id:'ege_informatics_2026_foundation', family_id:'ege_informatics_2026_part1', exam:'ЕГЭ', subject:'Информатика', subject_id:'informatics', variantCount:30, taskCount:15, structure_id:'ege_informatics_part1_v1', timeLimit:235*60, scoreKind:'ege100', scoreModel:'ege_informatics_part1_2026', accent:'#1e293b', grades:'10–11 класс', summary:'15 заданий · кодирование, логика, алгоритмы, таблицы, сети · JSON bank', slotSections:['Кодирование информации','Логика','Графы','Алгоритмы','Программирование','Сети'], taskFactory:egeInfoTask }),
    buildBank({ bank_id:'oge_history_2026_foundation', family_id:'oge_history_2026_full', exam:'ОГЭ', subject:'История', subject_id:'history', variantCount:20, taskCount:24, structure_id:'oge_history_full_v1', timeLimit:180*60, scoreKind:'grade', scoreModel:'oge_history_2026', accent:'#92400e', grades:'9 класс', summary:'24 задания · даты, персоналии, источники, причинно-следственные связи · JSON bank', slotSections:['Даты и события','Персоналии','Хронология','Источники','Культура'], taskFactory:ogeHistoryTask }),
    buildBank({ bank_id:'ege_history_2026_foundation', family_id:'ege_history_2026_part1', exam:'ЕГЭ', subject:'История', subject_id:'history', variantCount:20, taskCount:20, structure_id:'ege_history_part1_v1', timeLimit:210*60, scoreKind:'ege100', scoreModel:'ege_history_part1_2026', accent:'#b45309', grades:'10–11 класс', summary:'20 заданий · даты, процессы, культура, аргументация · JSON bank', slotSections:['Даты и события','Персоналии','Процессы','Культура','Аргументация'], taskFactory:egeHistoryTask })
  ];
  for (const pack of generated) {
    catalog.structures[pack.structure.id] = pack.structure;
    writeJSON(`assets/data/exam_bank/${pack.bank.bank_id}.json`, pack.bank);
    writeFamilyChunk(pack.bank, pack.structure);
  }
  const profile = enrichProfileMathSteps();
  if (catalog.structures.ege_profile_math_part1_v1) catalog.structures.ege_profile_math_part1_v1.summary = '50 вариантов · 12 заданий · профильный уровень · пошаговые разборы · JSON bank';
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n');
  if (catalog.structures.ege_profile_math_part1_v1) writeFamilyChunk(profile, catalog.structures.ege_profile_math_part1_v1);
  console.log(JSON.stringify({ ok:true, generated:generated.map(x=>({bank:x.bank.bank_id, variants:x.bank.variants.length, items:x.bank.items.length})), profile_steps:profile.items.filter(x=>Array.isArray(x.solution_steps)).length }, null, 2));
}
main();
