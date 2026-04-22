/* wave86t split from bundle_grade_content: wave12_english.js */
/* --- wave12_english.js --- */
(function(){
  if(typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  if(String(window.GRADE_NUM || '') !== '11') return;

  var COLOR = '#2563eb';
  var BG = '#dbeafe';
  var DOTS = ['#2563eb','#7c3aed','#0d9488','#ea580c','#16a34a','#dc2626','#ca8a04','#9333ea'];

  window.ENG_TH = window.ENG_TH || {};
  var TH = window.ENG_TH;

  function ensureTheory(key, html){
    if(!TH[key]) TH[key] = html;
  }

  function bankQ(tag, bank){
    var item = bank[(Math.random() * bank.length) | 0];
    return mkQ(item.q, item.a, [item.a].concat(item.o || []), item.h || '', tag, COLOR, BG, item.code || null, !!item.isMath, item.ex || item.h || '');
  }

  ensureTheory('tenses_adv', `<h3>Advanced Tenses</h3>
  <p><b>Present Perfect</b> связывает прошлое с настоящим: <i>I have finished the report.</i></p>
  <p><b>Past Perfect</b> показывает более раннее прошлое: <i>She had left before I arrived.</i></p>
  <p><b>Future Perfect / Future Perfect Continuous</b>: <i>By June, I will have completed the course.</i> / <i>By June, I will have been studying here for two years.</i></p>
  <p><b>Narrative tenses</b> в рассказе: основной фон — Past Simple / Past Continuous, ещё более раннее действие — Past Perfect.</p>`);

  ensureTheory('conditionals', `<h3>Conditionals</h3>
  <p><b>Zero:</b> If water reaches 100°C, it boils.</p>
  <p><b>First:</b> If it rains, we will stay home.</p>
  <p><b>Second:</b> If I were rich, I would travel more.</p>
  <p><b>Third:</b> If she had studied harder, she would have passed.</p>
  <p><b>Mixed:</b> If I had taken that job, I would live in London now.</p>
  <p>После <b>unless</b> не ставим <i>not</i>: <i>Unless you hurry, you will miss the train.</i></p>`);

  ensureTheory('reported', `<h3>Reported Speech</h3>
  <p>В косвенной речи часто происходит <b>сдвиг времён назад</b>: <i>"I am tired" → He said he was tired.</i></p>
  <p><b>Questions:</b> <i>Where do you live?</i> → He asked where I lived.</p>
  <p><b>Commands / requests:</b> <i>"Sit down."</i> → She told me to sit down.</p>
  <p><b>Reporting verbs</b> часто требуют герундий или инфинитив: <i>suggest doing</i>, <i>promise to do</i>, <i>deny doing</i>.</p>`);

  ensureTheory('passive_adv', `<h3>Advanced Passive</h3>
  <p><b>Passive</b> = <i>be + V3</i>: <i>The bridge was built in 2010.</i></p>
  <p>Во всех временах сохраняется форма времени: <i>is built / was built / has been built / will be built</i>.</p>
  <p><b>Causative</b>: <i>have / get something done</i> — когда работу выполняет кто-то другой.</p>
  <p><b>Impersonal passive</b>: <i>It is said that...</i> / <i>He is believed to...</i></p>`);

  ensureTheory('modals_adv', `<h3>Advanced Modals</h3>
  <p><b>must / can't / might have + V3</b> — вывод о прошлом: <i>She can't have forgotten.</i></p>
  <p><b>should have + V3</b> — сожаление / упрёк: <i>You should have called me.</i></p>
  <p><b>needn't have + V3</b> = сделал лишнее, а <b>didn't need to</b> = не было необходимости делать.</p>
  <p><b>be able to</b> часто заменяет can в сложных временах.</p>`);

  ensureTheory('articles', `<h3>Articles & Zero Article</h3>
  <p><b>a/an</b> — первое упоминание, один из многих: <i>I saw a dog.</i></p>
  <p><b>the</b> — когда предмет уже известен, уникален или уточнён: <i>the sun, the book on the table</i>.</p>
  <p><b>Zero article</b> часто с абстрактными и неисчисляемыми словами: <i>love, information, advice</i>.</p>
  <p>География: <i>Lake Baikal</i>, но <i>the Volga</i>; <i>at school</i>, но <i>at the cinema</i>.</p>`);

  ensureTheory('gerund_inf', `<h3>Gerund vs Infinitive</h3>
  <p><b>Gerund</b> после <i>enjoy, avoid, suggest, mind, deny</i>.</p>
  <p><b>Infinitive</b> после <i>want, decide, hope, plan, agree, refuse</i>.</p>
  <p>Некоторые глаголы меняют смысл:</p>
  <p><i>stop smoking</i> = перестать курить, но <i>stop to smoke</i> = остановиться, чтобы покурить.</p>
  <p><i>remember locking the door</i> = помнить сам факт, <i>remember to lock the door</i> = не забыть сделать.</p>`);

  ensureTheory('phrasal_ext', `<h3>Phrasal Verbs</h3>
  <p>Фразовый глагол = глагол + частица/предлог: <i>give up, put off, look after, run out of</i>.</p>
  <p>Смысл нельзя угадывать только по отдельным словам, его надо помнить в контексте.</p>
  <p>Смотри на шаблон: <i>look after somebody</i>, <i>put off doing something</i>, <i>come across something</i>.</p>`);

  ensureTheory('wordform11', `<h3>Word Formation</h3>
  <p>Смотри, какая часть речи нужна: существительное, прилагательное, наречие или глагол.</p>
  <p>Частые суффиксы: <b>-tion/-sion, -ment, -ness, -er/-or, -ity, -able, -ous, -ive, -ly</b>.</p>
  <p>Частые приставки: <b>un-, in-, im-, ir-, dis-, mis-</b>.</p>
  <p>Пример: <i>DECIDE → decision</i>, <i>HAPPY → happiness / unhappy</i>.</p>`);

  ensureTheory('confusing', `<h3>Confusing Words</h3>
  <p>Некоторые слова похожи по форме, но отличаются по смыслу: <i>advise / advice, affect / effect, lend / borrow</i>.</p>
  <p>Есть и ложные друзья переводчика: <i>accurate ≠ аккуратный, fabric ≠ фабрика</i>.</p>
  <p>Лучше запоминать такие пары не списком, а в предложениях.</p>`);

  ensureTheory('collocations', `<h3>Collocations</h3>
  <p>В английском слова часто «ходят парами»: <i>make a decision</i>, <i>do homework</i>, <i>pay attention</i>.</p>
  <p>Именно коллокации делают речь естественной. Часто ошибка не в грамматике, а в неправильном сочетании слов.</p>`);

  ensureTheory('connectors', `<h3>Linking Words & Essay</h3>
  <p>Для противопоставления: <b>however, nevertheless, although, whereas</b>.</p>
  <p>Для добавления: <b>moreover, furthermore, in addition</b>.</p>
  <p>Для результата: <b>therefore, consequently, as a result</b>.</p>
  <p>Для структуры эссе: <b>firstly, on the one hand, on the other hand, in conclusion</b>.</p>`);

  var BANK = {
    tenses_adv: [
      {q:'By next June, I ___ here for five years.', a:'will have been working', o:['will work','have worked','had been working'], h:'By + future point → Future Perfect Continuous.'},
      {q:'When we got to the station, the train ___ already ___.', a:'had left', o:['has left','left','was leaving'], h:'Earlier past action → Past Perfect.'},
      {q:'I ___ this museum three times, so I know the route well.', a:'have visited', o:['visited','had visited','visit'], h:'Life experience up to now → Present Perfect.'},
      {q:'We ___ that exhibition last summer, not this year.', a:'visited', o:['have visited','had visited','visit'], h:'Specific finished time in the past → Past Simple.'},
      {q:'By the end of the month, she ___ the whole book.', a:'will have finished', o:['finishes','will finish','has finished'], h:'Completed before a future deadline → Future Perfect.'},
      {q:'At 8 p.m. yesterday, I ___ for the exam.', a:'was revising', o:['revised','had revised','have revised'], h:'Action in progress at a specific past moment.'},
      {q:'He was tired because he ___ all night.', a:'had been driving', o:['was driving','has driven','drove'], h:'Cause before another past moment → Past Perfect Continuous.'},
      {q:'Don’t call me at six: I ___ my tutor then.', a:'will be meeting', o:['meet','will meet','have met'], h:'Future action in progress at a specific time.'},
      {q:'She ___ for Paris tomorrow morning; the tickets are already booked.', a:'is leaving', o:['leaves','will have left','left'], h:'Fixed arrangement → Present Continuous.'},
      {q:'How long ___ you ___ English by the end of this course?', a:'will have been studying', o:['do study','have studied','had been studying'], h:'Duration up to a future point.'},
      {q:'I can’t go out now — I ___ my essay yet.', a:'haven’t finished', o:['didn’t finish','hadn’t finished','don’t finish'], h:'Yet with unfinished present result → Present Perfect.'},
      {q:'By the time the lecture started, most students ___.', a:'had arrived', o:['were arriving','have arrived','arrived'], h:'Earlier action before another past action.'},
      {q:'This time tomorrow we ___ over the Alps.', a:'will be flying', o:['fly','have flown','flew'], h:'Future action in progress.'},
      {q:'The film ___ by the time we finally found our seats.', a:'had already started', o:['has already started','already started','was already starting'], h:'Past Perfect with already.'}
    ],
    conditionals: [
      {q:'If I ___ more time, I would take up Italian.', a:'had', o:['have','would have','had had'], h:'Second Conditional: If + Past Simple.'},
      {q:'If she had listened to your advice, she ___ that mistake.', a:'wouldn’t have made', o:['won’t make','wouldn’t make','hadn’t made'], h:'Third Conditional.'},
      {q:'Unless you ___ now, you will miss the bus.', a:'leave', o:['will leave','left','would leave'], h:'After unless we use Present Simple, not will.'},
      {q:'If water reaches 100°C, it ___.', a:'boils', o:['will boil','would boil','boiled'], h:'Zero Conditional = general truth.'},
      {q:'If they invite us, we ___.', a:'will come', o:['would come','come','had come'], h:'First Conditional.'},
      {q:'If I had accepted that offer, I ___ in Madrid now.', a:'would be living', o:['will live','lived','would have lived'], h:'Mixed conditional: past cause, present result.'},
      {q:'Had I known about the delay, I ___ earlier.', a:'would have left', o:['will leave','left','would leave'], h:'Inversion = If I had known...' },
      {q:'If he ___ so careless, he wouldn’t lose things all the time.', a:'weren’t', o:['isn’t','hadn’t been','wouldn’t be'], h:'Second Conditional often uses were.'},
      {q:'Provided that everyone ___ on time, we can start at nine.', a:'arrives', o:['will arrive','arrived','would arrive'], h:'Provided that behaves like if.'},
      {q:'If you heat ice, it ___.', a:'melts', o:['will melt','would melt','melted'], h:'Zero Conditional.'},
      {q:'If I ___ you, I would apologise immediately.', a:'were', o:['am','had been','would be'], h:'Set phrase: If I were you.'},
      {q:'Supposing you ___ the job, would you move abroad?', a:'got', o:['get','had got','would get'], h:'Supposing often takes past form in hypothetical questions.'},
      {q:'If the weather had been better, we ___ the whole day outside.', a:'would have spent', o:['would spend','spent','had spent'], h:'Third Conditional.'},
      {q:'As long as she ___ me tonight, I’ll wait.', a:'calls', o:['will call','called','would call'], h:'Present Simple after as long as.'}
    ],
    reported: [
      {q:'He said, “I am exhausted.” → He said that he ___ exhausted.', a:'was', o:['is','had been','were'], h:'Backshift: am → was.'},
      {q:'“We have finished,” they said. → They said they ___ finished.', a:'had', o:['have','were','would'], h:'Present Perfect often shifts to Past Perfect.'},
      {q:'“Where do you live?” → She asked me where I ___.', a:'lived', o:['live','did live','was living'], h:'Question word stays, word order becomes statement order.'},
      {q:'“Don’t be late.” → He told me ___ late.', a:'not to be', o:['to not be','not be','don’t be'], h:'Negative command → told me not to...' },
      {q:'“Can you help me?” → She asked if I ___ help her.', a:'could', o:['can','would','helped'], h:'can → could in reported speech.'},
      {q:'They suggested ___ by train instead of flying.', a:'going', o:['to go','go','gone'], h:'Suggest is followed by gerund.'},
      {q:'He admitted ___ the document by mistake.', a:'losing', o:['to lose','lose','lost'], h:'Admit + gerund.'},
      {q:'She promised ___ me as soon as she arrived.', a:'to call', o:['calling','call','called'], h:'Promise + infinitive.'},
      {q:'“I will send the file tomorrow,” she said. → She said she ___ the file the next day.', a:'would send', o:['will send','sends','had sent'], h:'will → would.'},
      {q:'“Why did you leave early?” → He asked why I ___ early.', a:'had left', o:['left','leave','was leaving'], h:'Past Simple often shifts to Past Perfect.'},
      {q:'The teacher recommended ___ the article twice.', a:'reading', o:['to read','read','have read'], h:'Recommend + gerund.'},
      {q:'“Please sit down.” → She asked us ___.', a:'to sit down', o:['sit down','sitting down','that we sit down'], h:'Ask + object + infinitive.'}
    ],
    passive_adv: [
      {q:'The bridge ___ in 1890 and is still in use.', a:'was built', o:['built','has built','was building'], h:'Past Simple Passive: was/were + V3.'},
      {q:'The results ___ by Friday.', a:'will be announced', o:['will announce','are announced','have announced'], h:'Future Passive.'},
      {q:'The new stadium ___ at the moment.', a:'is being renovated', o:['renovates','has been renovated','was renovated'], h:'Present Continuous Passive.'},
      {q:'The suspect ___ by the police before noon.', a:'had been arrested', o:['was arrested','had arrested','has been arrested'], h:'Past Perfect Passive.'},
      {q:'All the documents ___ before the meeting started.', a:'had been checked', o:['were checking','have checked','had checked'], h:'Past Perfect Passive.'},
      {q:'The package ___ tomorrow morning.', a:'will be delivered', o:['delivers','will deliver','is delivered'], h:'Future Passive.'},
      {q:'I need to ___ my laptop repaired.', a:'have', o:['make','let','do'], h:'Causative: have something done.'},
      {q:'He is believed ___ one of the witnesses.', a:'to know', o:['knowing','that he knows','know'], h:'Impersonal passive: is believed to know.'},
      {q:'It is said that the painting ___ during the war.', a:'was hidden', o:['hid','has hidden','was hiding'], h:'Passive after It is said that...' },
      {q:'The room ___ yet, so please wait outside.', a:'hasn’t been cleaned', o:['didn’t clean','hasn’t cleaned','wasn’t cleaning'], h:'Present Perfect Passive negative.'},
      {q:'Mobile phones must not ___ during the exam.', a:'be used', o:['use','been used','using'], h:'After modal in passive: modal + be + V3.'},
      {q:'Dinner ___ when we arrived, so we helped in the kitchen.', a:'was being prepared', o:['prepared','has been prepared','had prepared'], h:'Past Continuous Passive.'}
    ],
    modals_adv: [
      {q:'She looks relaxed. She ___ the exam.', a:'must have passed', o:['must pass','can’t have passed','should pass'], h:'Strong positive deduction about the past.'},
      {q:'They ___ the wrong train — they arrived an hour late.', a:'might have taken', o:['must take','should take','needn’t have taken'], h:'Possible explanation about the past.'},
      {q:'You ___ me earlier; I was waiting all day.', a:'should have called', o:['must call','needn’t call','can call'], h:'Regret / criticism about the past.'},
      {q:'We bought extra food, but guests brought plenty. We ___ so much.', a:'needn’t have bought', o:['didn’t need to buy','mustn’t have bought','shouldn’t buy'], h:'Action was done but was unnecessary.'},
      {q:'There is no answer and the lights are off. He ___ at home.', a:'can’t be', o:['must be','should be','could have been'], h:'Negative deduction about the present.'},
      {q:'I ___ swim when I was six.', a:'could', o:['can','must','should'], h:'Past ability.'},
      {q:'By next year, she will ___ speak Spanish fluently.', a:'be able to', o:['can','could','must'], h:'Future ability uses be able to.'},
      {q:'You ___ bring your passport; they checked everyone’s documents.', a:'had to', o:['must have','should','needn’t'], h:'Past obligation often becomes had to.'},
      {q:'He ___ known the answer; he teaches this topic.', a:'must have', o:['can’t have','should have','needn’t have'], h:'Very likely deduction.'},
      {q:'I ___ have told her the secret; now everyone knows.', a:'shouldn’t', o:['mustn’t','couldn’t','needn’t'], h:'Regret about something done.'},
      {q:'You look pale. You ___ see a doctor.', a:'should', o:['can','need','would'], h:'Advice.'},
      {q:'They ___ have left already — their coats are still here.', a:'can’t', o:['must','should','might'], h:'Negative deduction from evidence.'}
    ],
    articles: [
      {q:'She wants to become ___ engineer.', a:'an', o:['a','the','—'], h:'Engineer starts with a vowel sound.'},
      {q:'___ Volga is the longest river in Europe.', a:'The', o:['A','An','—'], h:'Rivers take the definite article.'},
      {q:'We usually have lunch at ___ school.', a:'—', o:['a','the','an'], h:'Institutional use: at school.'},
      {q:'Let’s go to ___ cinema tonight.', a:'the', o:['a','an','—'], h:'Set phrase: go to the cinema.'},
      {q:'I need ___ information you mentioned yesterday.', a:'the', o:['a','an','—'], h:'Specific information already identified.'},
      {q:'Love is important, but ___ money also matters.', a:'—', o:['a','the','an'], h:'Abstract / uncountable noun in general meaning.'},
      {q:'We stayed near ___ Lake Baikal last summer.', a:'—', o:['the','a','an'], h:'Most lakes do not take an article.'},
      {q:'She bought ___ umbrella because it was raining.', a:'an', o:['a','the','—'], h:'First mention, vowel sound.'},
      {q:'___ sun was already setting when we arrived.', a:'The', o:['A','An','—'], h:'Unique object.'},
      {q:'He plays ___ guitar surprisingly well.', a:'the', o:['a','an','—'], h:'Musical instruments often take the.'},
      {q:'Could you open ___ window, please?', a:'the', o:['a','an','—'], h:'The specific window in the room.'},
      {q:'She gave me ___ excellent advice.', a:'—', o:['an','a','the'], h:'Advice is uncountable.'}
    ],
    gerund_inf: [
      {q:'I can’t afford ___ another mistake.', a:'to make', o:['making','make','to making'], h:'Afford + infinitive.'},
      {q:'He denied ___ the message.', a:'sending', o:['to send','send','to sending'], h:'Deny + gerund.'},
      {q:'Please remember ___ the door when you leave.', a:'to lock', o:['locking','lock','to locking'], h:'Remember to do = not forget to do.'},
      {q:'I remember ___ this castle as a child.', a:'visiting', o:['to visit','visit','to visiting'], h:'Remember doing = memory of a past experience.'},
      {q:'She stopped ___ because she was out of breath.', a:'running', o:['to run','run','to running'], h:'Stop doing = cease the activity.'},
      {q:'We stopped ___ some water on the way home.', a:'to buy', o:['buying','buy','to buying'], h:'Stop to do = pause in order to do.'},
      {q:'They suggested ___ earlier tomorrow.', a:'meeting', o:['to meet','meet','to meeting'], h:'Suggest + gerund.'},
      {q:'I hope ___ the answer soon.', a:'to hear', o:['hearing','hear','to hearing'], h:'Hope + infinitive.'},
      {q:'Would you mind ___ the window?', a:'opening', o:['to open','open','to opening'], h:'Mind + gerund.'},
      {q:'He refused ___ his mind.', a:'to change', o:['changing','change','to changing'], h:'Refuse + infinitive.'},
      {q:'Try ___ less sugar if you want to feel better.', a:'eating', o:['to eat','eat','to eating'], h:'Try doing = experiment with a possible solution.'},
      {q:'I regret ___ you that your application was rejected.', a:'to inform', o:['informing','inform','to informing'], h:'Regret to inform = formal bad news.'}
    ],
    phrasal_ext: [
      {q:'I had to ___ the meeting until Friday.', a:'put off', o:['look after','turn down','break into'], h:'Put off = postpone.'},
      {q:'Can you ___ my cat while I’m away?', a:'look after', o:['give up','run into','take over'], h:'Look after = care for.'},
      {q:'We’ve ___ milk, so I’ll go to the shop.', a:'run out of', o:['come across','put up with','get over'], h:'Run out of = have none left.'},
      {q:'She finally ___ smoking last year.', a:'gave up', o:['took off','brought up','came across'], h:'Give up = stop doing.'},
      {q:'I ___ an interesting article while cleaning my desk.', a:'came across', o:['put off','ran out of','turned down'], h:'Come across = find by chance.'},
      {q:'He can’t ___ the flu yet.', a:'get over', o:['look up','take after','break down'], h:'Get over = recover from.'},
      {q:'They ___ our offer and chose another company.', a:'turned down', o:['looked after','worked out','put off'], h:'Turn down = reject.'},
      {q:'The plane ___ on time despite the fog.', a:'took off', o:['gave in','broke down','came up with'], h:'Take off = leave the ground.'},
      {q:'I really can’t ___ his rude jokes any longer.', a:'put up with', o:['run out of','turn on','get over'], h:'Put up with = tolerate.'},
      {q:'She ___ a brilliant solution in ten minutes.', a:'came up with', o:['gave away','looked after','ran into'], h:'Come up with = invent / think of.'},
      {q:'Who do you ___ in your family?', a:'take after', o:['look into','set off','break out'], h:'Take after = resemble.'},
      {q:'Could you ___ the word in the dictionary?', a:'look up', o:['put off','give in','break up'], h:'Look up = search for information.'},
      {q:'The company was ___ by an international group.', a:'taken over', o:['looked over','put over','run over'], h:'Take over = gain control of.'},
      {q:'Our car ___ on the motorway, so we called for help.', a:'broke down', o:['set off','gave up','took after'], h:'Break down = stop working.'}
    ],
    wordform11: [
      {q:'Word formation: Her final ___ surprised everyone. (DECIDE)', a:'decision', o:['decisive','deciding','decider'], h:'A noun is needed after final.'},
      {q:'Word formation: We need more ___ evidence before acting. (SCIENCE)', a:'scientific', o:['scientist','science','scientifically'], h:'Adjective before evidence.'},
      {q:'Word formation: His answer was completely ___. (LOGIC)', a:'illogical', o:['logic','logician','logically'], h:'Adjective with a negative meaning.'},
      {q:'Word formation: She showed great ___ in difficult conditions. (BRAVE)', a:'bravery', o:['brave','bravely','braveness'], h:'A noun is needed.'},
      {q:'Word formation: The plan is not ___ at the moment. (PRACTICE)', a:'practical', o:['practise','practically','practicality'], h:'Adjective meaning workable.'},
      {q:'Word formation: We apologise for any ___. (CONVENIENT)', a:'inconvenience', o:['convenient','inconvenient','convenience'], h:'Noun after any.'},
      {q:'Word formation: Her speech was clear and very ___. (PERSUADE)', a:'persuasive', o:['persuasion','persuasively','persuader'], h:'Adjective after very.'},
      {q:'Word formation: This method can greatly improve ___ . (EFFICIENT)', a:'efficiency', o:['efficient','inefficient','efficiently'], h:'Noun required after improve.'},
      {q:'Word formation: He became famous for his ___. (CREATE)', a:'creativity', o:['creative','creation','creatively'], h:'A noun after for his.'},
      {q:'Word formation: The manager acted ___ and solved the problem. (DECIDE)', a:'decisively', o:['decision','decisive','indecisive'], h:'Adverb modifies acted.'},
      {q:'Word formation: It was a highly ___ performance. (PROFESSION)', a:'professional', o:['profession','professionally','unprofessional'], h:'Adjective before performance.'},
      {q:'Word formation: The storm caused major ___. (DESTROY)', a:'destruction', o:['destructive','destroyed','destroyer'], h:'Noun after caused.'},
      {q:'Word formation: She is one of the most ___ people I know. (RELY)', a:'reliable', o:['reliably','reliance','unreliability'], h:'Adjective describing people.'},
      {q:'Word formation: His explanation lacked ___. (CLEAR)', a:'clarity', o:['clear','clearly','unclear'], h:'Noun after lacked.'}
    ],
    confusing: [
      {q:'Choose the correct word: The medicine had a strong ___ on him.', a:'effect', o:['affect','advice','practice'], h:'Effect is usually a noun; affect is usually a verb.'},
      {q:'Choose the correct word: Could you ___ me what to do?', a:'advise', o:['advice','effect','borrow'], h:'Advise = verb.'},
      {q:'Choose the correct word: Could you ___ me your notes for one day?', a:'lend', o:['borrow','effect','loose'], h:'Lend = give something temporarily.'},
      {q:'Choose the correct word: Don’t ___ your keys again.', a:'lose', o:['loose','advise','raise'], h:'Lose = misplace; loose = not tight.'},
      {q:'Choose the correct word: Their house is over ___ .', a:'there', o:['their','they’re','theirs'], h:'There = place; their = possession; they’re = they are.'},
      {q:'Choose the correct word: The company wants to ___ production next year.', a:'raise', o:['rise','lay','lie'], h:'Raise takes an object; rise does not.'},
      {q:'Choose the correct word: Please ___ me the salt.', a:'pass', o:['borrow','effect','loose'], h:'Natural collocation.'},
      {q:'Choose the correct word: Could I ___ your umbrella for a minute?', a:'borrow', o:['lend','rise','lay'], h:'Borrow = take from someone for a time.'},
      {q:'Choose the correct word: She has a very ___ approach to detail.', a:'practical', o:['practice','practise','practically'], h:'Adjective needed.'},
      {q:'Choose the correct word: The story is based on a ___ event.', a:'historical', o:['historic','history','historically'], h:'Historical = related to history; historic = important in history.'},
      {q:'Choose the correct word: Don’t forget to ___ your coat with you.', a:'take', o:['bring','borrow','lend'], h:'Take = from here to there; bring = toward the speaker.'},
      {q:'Choose the correct word: The lecture was very ___ ; I learned a lot.', a:'informative', o:['information','inform','informed'], h:'Adjective meaning full of useful information.'}
    ],
    collocations: [
      {q:'Choose the natural collocation: ___ a decision', a:'make', o:['do','take','set'], h:'We make a decision.'},
      {q:'Choose the natural collocation: ___ homework', a:'do', o:['make','take','have'], h:'We do homework.'},
      {q:'Choose the natural collocation: ___ attention', a:'pay', o:['make','give','do'], h:'Pay attention.'},
      {q:'Choose the natural collocation: ___ a cold', a:'catch', o:['take','do','make'], h:'Catch a cold.'},
      {q:'Choose the natural collocation: heavy ___', a:'traffic', o:['tea','homework','knowledge'], h:'Heavy traffic.'},
      {q:'Choose the natural collocation: strong ___', a:'coffee', o:['rain','decision','homework'], h:'Strong coffee.'},
      {q:'Choose the natural collocation: ___ responsibility', a:'take', o:['do','catch','pay'], h:'Take responsibility.'},
      {q:'Choose the natural collocation: ___ progress', a:'make', o:['do','pay','catch'], h:'Make progress.'},
      {q:'Choose the natural collocation: ___ a promise', a:'keep', o:['do','take','catch'], h:'Keep a promise.'},
      {q:'Choose the natural collocation: ___ research', a:'do', o:['make','catch','keep'], h:'Do research.'},
      {q:'Choose the natural collocation: ___ a conclusion', a:'reach', o:['do','catch','pay'], h:'Reach a conclusion.'},
      {q:'Choose the natural collocation: ___ business', a:'do', o:['make','take','reach'], h:'Do business.'},
      {q:'Choose the natural collocation: ___ rain', a:'heavy', o:['strong','hardly','serious'], h:'Heavy rain is standard.'},
      {q:'Choose the natural collocation: ___ a photo', a:'take', o:['make','do','keep'], h:'Take a photo.'}
    ],
    connectors: [
      {q:'Choose the best linker: The task was difficult; ___, we managed to finish it on time.', a:'however', o:['therefore','for example','besides'], h:'Contrast between difficulty and success.'},
      {q:'Choose the best linker: He studied hard; ___, he passed with excellent marks.', a:'therefore', o:['although','meanwhile','whereas'], h:'Result.'},
      {q:'Choose the best linker: ___ the rain, they continued playing.', a:'Despite', o:['Because','However','Whereas'], h:'Despite + noun / gerund.'},
      {q:'Choose the best linker: ___ she was tired, she kept working.', a:'Although', o:['Therefore','Moreover','In addition'], h:'Concession.'},
      {q:'Choose the best linker: I want to improve my grammar. ___, I need to enlarge my vocabulary.', a:'In addition', o:['Nevertheless','As a result','Whereas'], h:'Adding another point.'},
      {q:'Choose the best linker: Public transport is cheap, ___ taxis are more convenient.', a:'whereas', o:['therefore','because of','in conclusion'], h:'Whereas = contrast between two facts.'},
      {q:'Choose the best linker: ___, I believe this course is worth taking.', a:'In conclusion', o:['However','For instance','Otherwise'], h:'Closing phrase for an essay.'},
      {q:'Choose the best linker: The evidence was weak; ___, the court dismissed the case.', a:'consequently', o:['although','meanwhile','furthermore'], h:'Consequence.'},
      {q:'Choose the best linker: ___ the one hand, online learning is flexible; on the other hand, it requires discipline.', a:'On', o:['At','In','By'], h:'Fixed essay phrase.'},
      {q:'Choose the best linker: She was ill. ___, she still came to the interview.', a:'Nevertheless', o:['Therefore','For this reason','Besides'], h:'Unexpected contrast.'},
      {q:'Choose the best linker: The museum was closed, ___ we went to the park instead.', a:'so', o:['although','despite','whereas'], h:'Simple result connector.'},
      {q:'Choose the best linker: We should recycle more. ___, cities must improve waste collection.', a:'Moreover', o:['Instead','Otherwise','Yet'], h:'Adds a second argument.'}
    ]
  };

  function genEng11TensesAdv(){ return bankQ('Advanced Tenses', BANK.tenses_adv); }
  function genEng11Conditionals(){ return bankQ('Conditionals', BANK.conditionals); }
  function genEng11Reported(){ return bankQ('Reported Speech', BANK.reported); }
  function genEng11Passive(){ return bankQ('Advanced Passive', BANK.passive_adv); }
  function genEng11Modals(){ return bankQ('Modal Verbs', BANK.modals_adv); }
  function genEng11Articles(){ return bankQ('Articles & Zero Article', BANK.articles); }
  function genEng11Gerund(){ return bankQ('Gerund vs Infinitive', BANK.gerund_inf); }
  function genEng11Phrasal(){ return bankQ('Phrasal Verbs', BANK.phrasal_ext); }
  function genEng11WordForm(){ return bankQ('Word Formation', BANK.wordform11); }
  function genEng11Confusing(){ return bankQ('Confusing Words', BANK.confusing); }
  function genEng11Collocations(){ return bankQ('Collocations', BANK.collocations); }
  function genEng11Connectors(){ return bankQ('Linking Words & Essay', BANK.connectors); }

  var engSubject = {
    id:'eng',
    nm:'Английский',
    ic:'🇬🇧',
    date:'',
    cl:COLOR,
    bg:BG,
    tops:[
      {id:'tenses_adv', nm:'Advanced Tenses', gen:genEng11TensesAdv, th:TH.tenses_adv, dot:DOTS[0]},
      {id:'conditionals', nm:'Conditionals', gen:genEng11Conditionals, th:TH.conditionals, dot:DOTS[1]},
      {id:'reported', nm:'Reported Speech', gen:genEng11Reported, th:TH.reported, dot:DOTS[2]},
      {id:'passive_adv', nm:'Advanced Passive', gen:genEng11Passive, th:TH.passive_adv, dot:DOTS[3]},
      {id:'modals_adv', nm:'Modal Verbs', gen:genEng11Modals, th:TH.modals_adv, dot:DOTS[4]},
      {id:'articles', nm:'Articles & Zero Article', gen:genEng11Articles, th:TH.articles, dot:DOTS[5]},
      {id:'gerund_inf', nm:'Gerund vs Infinitive', gen:genEng11Gerund, th:TH.gerund_inf, dot:DOTS[6]},
      {id:'phrasal_ext', nm:'Phrasal Verbs', gen:genEng11Phrasal, th:TH.phrasal_ext, dot:DOTS[7]},
      {id:'wordform11', nm:'Word Formation', gen:genEng11WordForm, th:TH.wordform11, dot:DOTS[0]},
      {id:'confusing', nm:'Confusing Words', gen:genEng11Confusing, th:TH.confusing, dot:DOTS[1]},
      {id:'collocations', nm:'Collocations', gen:genEng11Collocations, th:TH.collocations, dot:DOTS[2]},
      {id:'connectors', nm:'Linking Words & Essay', gen:genEng11Connectors, th:TH.connectors, dot:DOTS[3]}
    ]
  };

  var existing = SUBJ.find(function(s){ return s.id === 'eng'; });
  if(existing){
    var seen = new Set((existing.tops || []).map(function(t){ return t.id; }));
    existing.nm = engSubject.nm;
    existing.ic = engSubject.ic;
    existing.cl = engSubject.cl;
    existing.bg = engSubject.bg;
    existing.tops = existing.tops || [];
    engSubject.tops.forEach(function(topic){ if(!seen.has(topic.id)) existing.tops.push(topic); });
  } else {
    SUBJ.push(engSubject);
  }

  window.__wave12English = {
    grade: 11,
    subjectId: 'eng',
    topics: engSubject.tops.map(function(t){ return t.id; }),
    counts: Object.fromEntries(Object.keys(BANK).map(function(key){ return [key, BANK[key].length]; }))
  };
})();

;
