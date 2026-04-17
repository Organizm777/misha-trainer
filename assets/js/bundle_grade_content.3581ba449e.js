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
    return mkQ(item.q, item.a, [item.a].concat(item.o || []), item.h || '', tag, COLOR, BG);
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
/* --- wave13_english.js --- */
(function(){
  if(typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  var grade = String(window.GRADE_NUM || '');
  if(grade !== '8' && grade !== '9') return;
  var ENG_COLOR = '#2563eb';
  var ENG_BG = '#dbeafe';
  window.ENG_TH = window.ENG_TH || {};
  function bankGen(topicName, entries, color, bg){
    return function(){
      var q = entries[(Math.random() * entries.length) | 0];
      return mkQ(q.q, q.a, shuffle([q.a].concat(q.o || [])).slice(0,4), q.h || '', topicName, color || ENG_COLOR, bg || ENG_BG, q.code || null, !!q.isMath);
    };
  }
  function injectAfter(subjectId, newSubject){
    var existing = SUBJ.find(function(s){ return s.id === newSubject.id; });
    if(existing) return existing;
    var idx = SUBJ.findIndex(function(s){ return s.id === subjectId; });
    if(idx >= 0) SUBJ.splice(idx + 1, 0, newSubject); else SUBJ.push(newSubject);
    return newSubject;
  }
  if(!window.ENG_TH["present8"]) window.ENG_TH["present8"] = "\n      <h3>Present Tenses</h3>\n      <div class=\"fm\">Present Simple = action in general / every day<br>Present Continuous = action happening now / around now</div>\n      <p><b>Present Simple</b>: habits, routines, facts. Markers: <i>every day, usually, often, always</i>.</p>\n      <p><b>Present Continuous</b>: action now or temporary situation. Markers: <i>now, at the moment, today</i>.</p>\n      <p><b>Stative verbs</b> usually do not take Continuous: <i>know, like, love, want, believe, understand</i>.</p>\n      <div class=\"ex\">She <b>goes</b> to school every day. / She <b>is doing</b> her homework now.</div>\n    ";
  if(!window.ENG_TH["past8"]) window.ENG_TH["past8"] = "\n      <h3>Past Simple</h3>\n      <div class=\"fm\">Regular verbs: play \u2192 played<br>Irregular verbs: go \u2192 went, see \u2192 saw, take \u2192 took</div>\n      <p>Use <b>Past Simple</b> for finished actions in the past. Markers: <i>yesterday, last week, ago, in 2024</i>.</p>\n      <p>Negative and question forms use <b>did</b>: <i>didn't go, Did you see?</i></p>\n      <div class=\"ex\">We <b>watched</b> a film yesterday. / Did she <b>finish</b> her project?</div>\n    ";
  if(!window.ENG_TH["future8"]) window.ENG_TH["future8"] = "\n      <h3>Future Forms</h3>\n      <div class=\"fm\">will = decision / prediction<br>be going to = plan / visible result<br>Present Continuous = arranged future</div>\n      <p><b>Will</b> often appears with promises, offers and instant decisions.</p>\n      <p><b>Going to</b> is used for plans and things we can already see.</p>\n      <p><b>Present Continuous</b> can describe a fixed arrangement: <i>I'm meeting my coach tomorrow.</i></p>\n    ";
  if(!window.ENG_TH["compare8"]) window.ENG_TH["compare8"] = "\n      <h3>Comparisons</h3>\n      <div class=\"fm\">small \u2192 smaller \u2192 the smallest<br>interesting \u2192 more interesting \u2192 the most interesting</div>\n      <p>Short adjectives usually take <b>-er / -est</b>, longer adjectives use <b>more / the most</b>.</p>\n      <p>Irregular forms: <b>good \u2192 better \u2192 the best</b>, <b>bad \u2192 worse \u2192 the worst</b>, <b>far \u2192 farther/further</b>.</p>\n      <div class=\"ex\">This puzzle is <b>easier</b> than the last one. / She is <b>the best</b> runner in the class.</div>\n    ";
  if(!window.ENG_TH["articles8"]) window.ENG_TH["articles8"] = "\n      <h3>Articles</h3>\n      <div class=\"fm\">a/an = one of many, first mention<br>the = specific thing we know<br>zero article = no article</div>\n      <p><b>a / an</b> for one countable thing: <i>a book, an apple</i>.</p>\n      <p><b>the</b> for something already known or unique: <i>the sun, the book on the table</i>.</p>\n      <p><b>No article</b> in many general expressions: <i>at school, by bus, for breakfast</i>.</p>\n    ";
  if(!window.ENG_TH["preps8"]) window.ENG_TH["preps8"] = "\n      <h3>Prepositions of Time and Place</h3>\n      <div class=\"fm\">at 5 o'clock / at home<br>on Monday / on the wall<br>in July / in the room / in 2026</div>\n      <p>Use <b>at</b> for \u0442\u043e\u0447\u043a\u0430 \u0432\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0438 \u0438 some places, <b>on</b> for days and surfaces, <b>in</b> for months, years, rooms, cities and countries.</p>\n      <div class=\"ex\">We meet <b>on</b> Friday, but we study <b>in</b> June and wait <b>at</b> the bus stop.</div>\n    ";
  if(!window.ENG_TH["vocab8"]) window.ENG_TH["vocab8"] = "\n      <h3>Vocabulary A2</h3>\n      <p>\u0414\u043b\u044f 8 \u043a\u043b\u0430\u0441\u0441\u0430 \u0432\u0430\u0436\u043d\u044b everyday topics: rooms, clothes, weather, food, school, hobbies, body parts.</p>\n      <p>\u041b\u0443\u0447\u0448\u0435 \u0437\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u0442\u044c \u0441\u043b\u043e\u0432\u043e \u043d\u0435 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e, \u0430 \u0432 \u043a\u043e\u0440\u043e\u0442\u043a\u043e\u043c \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u0435: <i>I wear gloves in winter.</i> / <i>The kitchen is next to the living room.</i></p>\n    ";
  if(!window.ENG_TH["spelling8"]) window.ENG_TH["spelling8"] = "\n      <h3>Spelling A2</h3>\n      <p>\u0421\u043c\u043e\u0442\u0440\u0438 \u043d\u0430 \u0447\u0430\u0441\u0442\u044b\u0435 tricky words: <b>because, friend, people, usually, together, favourite</b>.</p>\n      <p>\u041f\u043e\u043b\u0435\u0437\u043d\u043e \u0434\u0435\u043b\u0438\u0442\u044c \u0441\u043b\u043e\u0432\u043e \u043d\u0430 \u043a\u0443\u0441\u043e\u0447\u043a\u0438 \u0438 \u043f\u0440\u043e\u0433\u043e\u0432\u0430\u0440\u0438\u0432\u0430\u0442\u044c: <i>to-ge-ther, fa-vou-rite</i>.</p>\n    ";
  if(!window.ENG_TH["pps9"]) window.ENG_TH["pps9"] = "\n      <h3>Present Perfect vs Past Simple</h3>\n      <div class=\"fm\">Present Perfect = have/has + V3<br>Past Simple = V2 / did</div>\n      <p><b>Present Perfect</b> connects the past with the present: experience, result, unfinished time period.</p>\n      <p><b>Past Simple</b> is used with finished past time: <i>yesterday, last year, in 2023, two days ago</i>.</p>\n      <div class=\"ex\">I <b>have seen</b> this film three times. / I <b>saw</b> it last Friday.</div>\n    ";
  if(!window.ENG_TH["pastmix9"]) window.ENG_TH["pastmix9"] = "\n      <h3>Past Tenses Mix</h3>\n      <div class=\"fm\">Past Simple = main finished event<br>Past Continuous = background / process<br>Past Perfect = action before another past action</div>\n      <div class=\"ex\">When I <b>arrived</b>, they <b>were waiting</b>. / She was nervous because she <b>had forgotten</b> her notes.</div>\n    ";
  if(!window.ENG_TH["cond9"]) window.ENG_TH["cond9"] = "\n      <h3>Conditionals 0\u20132</h3>\n      <div class=\"fm\">0: If + Present, Present<br>1: If + Present, will + V1<br>2: If + Past, would + V1</div>\n      <p><b>Zero</b> = facts, <b>First</b> = real future possibility, <b>Second</b> = unreal or imaginary situation.</p>\n      <div class=\"ex\">If you heat ice, it <b>melts</b>. / If it rains, we <b>will stay</b> home. / If I were rich, I <b>would travel</b>.</div>\n    ";
  if(!window.ENG_TH["passive9"]) window.ENG_TH["passive9"] = "\n      <h3>Passive Voice Basics</h3>\n      <div class=\"fm\">am/is/are + V3<br>was/were + V3<br>will be + V3<br>must be + V3</div>\n      <p>Use passive when the object or action is more important than the person who does it.</p>\n      <div class=\"ex\">English <b>is spoken</b> in many countries. / The bridge <b>was built</b> in 2010.</div>\n    ";
  if(!window.ENG_TH["modals9"]) window.ENG_TH["modals9"] = "\n      <h3>Modal Verbs</h3>\n      <div class=\"fm\">can / could = ability<br>must / have to = obligation<br>should = advice<br>may / might = possibility</div>\n      <p><b>Mustn't</b> = prohibition. <b>Don't have to</b> = no necessity.</p>\n      <div class=\"ex\">You <b>must</b> wear a helmet. / You <b>don't have to</b> come early tomorrow.</div>\n    ";
  if(!window.ENG_TH["wordform9"]) window.ENG_TH["wordform9"] = "\n      <h3>Word Formation</h3>\n      <p>\u0412 \u0437\u0430\u0434\u0430\u043d\u0438\u044f\u0445 \u041e\u0413\u042d \u0432\u0430\u0436\u043d\u043e \u043f\u043e\u043d\u044f\u0442\u044c, \u043a\u0430\u043a\u0430\u044f \u0447\u0430\u0441\u0442\u044c \u0440\u0435\u0447\u0438 \u043d\u0443\u0436\u043d\u0430: noun, adjective, adverb \u0438\u043b\u0438 negative form.</p>\n      <div class=\"fm\">teach \u2192 teacher<br>happy \u2192 unhappy / happiness<br>care \u2192 careful / carefully<br>success \u2192 successful</div>\n    ";
  if(!window.ENG_TH["vocab9"]) window.ENG_TH["vocab9"] = "\n      <h3>Vocabulary A2\u2013B1</h3>\n      <p>\u0414\u043b\u044f 9 \u043a\u043b\u0430\u0441\u0441\u0430 \u043d\u0443\u0436\u043d\u044b school, family, travel, hobbies, health, technology, environment.</p>\n      <p>\u0421\u043b\u043e\u0432\u043e \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0439 \u0447\u0435\u0440\u0435\u0437 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442: \u043d\u0435 \u043f\u0440\u043e\u0441\u0442\u043e \u043f\u0435\u0440\u0435\u0432\u043e\u0434, \u0430 \u0446\u0435\u043b\u0443\u044e \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044e \u0432 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u0438.</p>\n    ";
  if(!window.ENG_TH["spelling9"]) window.ENG_TH["spelling9"] = "\n      <h3>Spelling B1</h3>\n      <p>\u0427\u0430\u0441\u0442\u044b\u0435 tricky words: <b>beautiful, successful, comfortable, favourite, dangerous, library, Wednesday</b>.</p>\n      <p>\u041e\u0431\u044b\u0447\u043d\u043e \u043f\u043e\u043c\u043e\u0433\u0430\u044e\u0442 chunks: <i>beau-ti-ful</i>, <i>Wed-nes-day</i>, <i>com-for-ta-ble</i>.</p>\n    ";
  var BANK8 = {"present8": [{"q": "Choose the correct form: My brother ___ football every Saturday.", "a": "plays", "o": ["is playing", "play", "played"], "h": "Every Saturday → Present Simple."}, {"q": "Choose the correct form: Look! The children ___ in the yard now.", "a": "are playing", "o": ["play", "played", "is playing"], "h": "Look / now → Present Continuous."}, {"q": "Choose the correct form: I usually ___ my homework after dinner.", "a": "do", "o": ["am doing", "does", "did"], "h": "Usually → Present Simple."}, {"q": "Choose the correct form: She ___ a blue jacket today.", "a": "is wearing", "o": ["wears", "wear", "wore"], "h": "Today / temporary situation → Present Continuous."}, {"q": "Choose the correct form: Water ___ at 100°C.", "a": "boils", "o": ["is boiling", "boil", "boiled"], "h": "General fact → Present Simple."}, {"q": "Choose the correct form: We ___ for the bus at the moment.", "a": "are waiting", "o": ["wait", "waited", "is waiting"], "h": "At the moment → Present Continuous."}, {"q": "Choose the correct form: Dad ___ coffee every morning.", "a": "drinks", "o": ["is drinking", "drink", "drank"], "h": "Habit in the present → Present Simple."}, {"q": "Choose the correct form: I ___ what you mean.", "a": "understand", "o": ["am understanding", "understands", "understood"], "h": "Understand is a stative verb."}, {"q": "Choose the correct form: Why ___ you ___ at me like that?", "a": "are / looking", "o": ["do / look", "is / looking", "did / look"], "h": "Action happening now."}, {"q": "Choose the correct form: Our teacher always ___ us interesting projects.", "a": "gives", "o": ["is giving", "give", "gave"], "h": "Always + routine → Present Simple."}, {"q": "Choose the correct form: This week I ___ at my grandma’s house.", "a": "am staying", "o": ["stay", "stays", "stayed"], "h": "Temporary arrangement this week."}, {"q": "Choose the correct form: Cats usually ___ milk.", "a": "like", "o": ["are liking", "likes", "liked"], "h": "General preference → Present Simple."}], "past8": [{"q": "Choose the correct form: We ___ a great film yesterday.", "a": "watched", "o": ["watch", "were watching", "have watched"], "h": "Yesterday → Past Simple."}, {"q": "Choose the correct form: She ___ to school by bike last year.", "a": "went", "o": ["go", "goes", "gone"], "h": "Past Simple of go = went."}, {"q": "Choose the correct form: They ___ not ___ the answer.", "a": "did / know", "o": ["were / knowing", "do / know", "did / knew"], "h": "Past negative = did not + V1."}, {"q": "Choose the correct question: ___ you ___ the homework?", "a": "Did / finish", "o": ["Did / finished", "Do / finish", "Were / finishing"], "h": "Past question = Did + V1."}, {"q": "Choose the correct form: I ___ my keys two days ago.", "a": "lost", "o": ["lose", "losed", "have lost"], "h": "Ago → Past Simple."}, {"q": "Choose the correct form: My parents ___ dinner at home on Friday.", "a": "cooked", "o": ["cook", "are cooking", "have cooked"], "h": "Finished past time."}, {"q": "Choose the correct form: He ___ the door and went out.", "a": "opened", "o": ["open", "opens", "opening"], "h": "Sequence of finished actions."}, {"q": "Choose the correct form: We ___ our teacher at the museum.", "a": "saw", "o": ["see", "seen", "are seeing"], "h": "Past Simple of see = saw."}, {"q": "Choose the correct form: Anna ___ a letter to her friend last month.", "a": "wrote", "o": ["write", "written", "writes"], "h": "Past Simple of write = wrote."}, {"q": "Choose the correct form: I ___ breakfast because I was late.", "a": "didn’t have", "o": ["haven’t", "wasn’t having", "don’t have"], "h": "Past negative."}, {"q": "Choose the correct form: Where ___ they ___ during the holidays?", "a": "did / stay", "o": ["were / stay", "did / stayed", "do / stay"], "h": "Past question with did."}, {"q": "Choose the correct form: The match ___ at 6 p.m. and finished at 8.", "a": "started", "o": ["starts", "has started", "is starting"], "h": "Specific finished past event."}], "future8": [{"q": "Choose the correct form: I think our team ___ the game.", "a": "will win", "o": ["is winning", "wins", "won"], "h": "Prediction → will."}, {"q": "Choose the correct form: Look at those black clouds! It ___.", "a": "is going to rain", "o": ["will rain always", "rains", "is raining every day"], "h": "Visible sign → going to."}, {"q": "Choose the correct form: We ___ our cousins on Saturday — tickets are booked.", "a": "are meeting", "o": ["will meet maybe", "meet every day", "met"], "h": "Fixed arrangement → Present Continuous."}, {"q": "Choose the correct form: Wait, I ___ you with that heavy bag.", "a": "will help", "o": ["am helping next week", "help", "helped"], "h": "Instant decision → will."}, {"q": "Choose the correct form: She ___ a doctor when she grows up.", "a": "is going to be", "o": ["was being", "be", "is"], "h": "Future plan / intention."}, {"q": "Choose the correct form: The train ___ at 7:15 tomorrow morning.", "a": "leaves", "o": ["will leaving", "left", "is leave"], "h": "Timetable → Present Simple."}, {"q": "Choose the correct form: Don’t worry, I ___ the window.", "a": "will close", "o": ["am closing next week", "close usually", "closed"], "h": "Promise / quick offer."}, {"q": "Choose the correct form: They ___ in a hotel next weekend.", "a": "are staying", "o": ["stay every week", "will stayed", "stayed"], "h": "Planned arrangement."}, {"q": "Choose the correct form: We ___ a picnic if the weather is good.", "a": "will have", "o": ["have yesterday", "are having always", "had"], "h": "Future result in a condition context."}, {"q": "Choose the correct form: He has bought the wood. He ___ a shelf.", "a": "is going to build", "o": ["builds every year", "will built", "built"], "h": "Plan based on present evidence."}, {"q": "Choose the correct form: Maybe people ___ on Mars one day.", "a": "will live", "o": ["live yesterday", "are living now", "lived"], "h": "General future prediction."}, {"q": "Choose the correct form: We ___ at the museum at 11 a.m. tomorrow.", "a": "are arriving", "o": ["arrive always", "arrived", "will arrived"], "h": "Personal arrangement."}], "compare8": [{"q": "Choose the correct form: My room is ___ than yours.", "a": "bigger", "o": ["more big", "the biggest", "biggest"], "h": "One-syllable adjective → bigger."}, {"q": "Choose the correct form: This exercise is ___ than the previous one.", "a": "more difficult", "o": ["difficulter", "the difficult", "most difficult"], "h": "Long adjective → more difficult."}, {"q": "Choose the correct form: Sam is the ___ runner in our class.", "a": "fastest", "o": ["most fast", "faster", "more fast"], "h": "Superlative of fast = fastest."}, {"q": "Choose the correct form: Today is ___ day of the week for me.", "a": "the busiest", "o": ["busyer", "more busy", "the busy"], "h": "Busy → busiest."}, {"q": "Choose the correct form: Your bag is as ___ as mine.", "a": "heavy", "o": ["heavier", "the heaviest", "more heavy"], "h": "As ... as + base form."}, {"q": "Choose the correct form: Maths is ___ for me than chemistry.", "a": "easier", "o": ["more easy", "easyer", "easiest"], "h": "Easy → easier."}, {"q": "Choose the correct form: This is the ___ book I have read this year.", "a": "most interesting", "o": ["interestinger", "more interesting", "interesting"], "h": "Long adjective + the most."}, {"q": "Choose the correct form: My sister is ___ at languages than I am.", "a": "better", "o": ["gooder", "best", "more good"], "h": "Good → better."}, {"q": "Choose the correct form: Winter is usually ___ than autumn here.", "a": "colder", "o": ["more cold", "coldest", "most cold"], "h": "Cold → colder."}, {"q": "Choose the correct form: Alex is one of the ___ students in the school.", "a": "best", "o": ["better", "goodest", "more good"], "h": "Good → best."}, {"q": "Choose the correct form: This road is not as ___ as the main street.", "a": "wide", "o": ["wider", "the widest", "more wide"], "h": "Not as ... as + base form."}, {"q": "Choose the correct form: My cat is ___ than our old dog.", "a": "smaller", "o": ["smallest", "more small", "smaller than"], "h": "Comparative adjective needed."}], "articles8": [{"q": "Choose the correct article: I saw ___ elephant at the zoo.", "a": "an", "o": ["a", "the", "—"], "h": "Elephant starts with a vowel sound."}, {"q": "Choose the correct article: ___ sun is very bright today.", "a": "The", "o": ["A", "An", "—"], "h": "Unique object → the sun."}, {"q": "Choose the correct article: She has ___ new bike.", "a": "a", "o": ["an", "the", "—"], "h": "First mention of one countable object."}, {"q": "Choose the correct article: We go to ___ school by bus.", "a": "—", "o": ["a", "the", "an"], "h": "Institutional use: go to school."}, {"q": "Choose the correct article: Please open ___ window.", "a": "the", "o": ["a", "an", "—"], "h": "The window in this room is specific."}, {"q": "Choose the correct article: My favourite season is ___ summer.", "a": "—", "o": ["a", "the", "an"], "h": "Seasons in general often have no article."}, {"q": "Choose the correct article: He is ___ honest boy.", "a": "an", "o": ["a", "the", "—"], "h": "Honest starts with a vowel sound."}, {"q": "Choose the correct article: This is ___ best pizza in town.", "a": "the", "o": ["a", "an", "—"], "h": "Superlative → the best."}, {"q": "Choose the correct article: We had ___ breakfast at 8.", "a": "—", "o": ["a", "the", "an"], "h": "Meals usually have zero article."}, {"q": "Choose the correct article: My mother works in ___ hospital near our home.", "a": "a", "o": ["the", "an", "—"], "h": "One hospital, first mention."}, {"q": "Choose the correct article: He plays ___ guitar after school.", "a": "the", "o": ["a", "an", "—"], "h": "Musical instruments usually take the."}, {"q": "Choose the correct article: We visited ___ old castle on the hill.", "a": "an", "o": ["a", "the", "—"], "h": "Old begins with a vowel sound."}], "preps8": [{"q": "Choose the correct preposition: We meet ___ Monday.", "a": "on", "o": ["at", "in", "to"], "h": "Days → on Monday."}, {"q": "Choose the correct preposition: The keys are ___ the table.", "a": "on", "o": ["in", "at", "under of"], "h": "Surface → on the table."}, {"q": "Choose the correct preposition: My birthday is ___ July.", "a": "in", "o": ["on", "at", "to"], "h": "Months → in July."}, {"q": "Choose the correct preposition: The lesson starts ___ 9 o’clock.", "a": "at", "o": ["on", "in", "into"], "h": "Clock time → at 9."}, {"q": "Choose the correct preposition: Dad is waiting ___ the bus stop.", "a": "at", "o": ["on", "in", "to"], "h": "Small point / place → at the bus stop."}, {"q": "Choose the correct preposition: Our cat is sleeping ___ the box.", "a": "in", "o": ["on", "at", "over"], "h": "Inside → in the box."}, {"q": "Choose the correct preposition: We usually go skiing ___ winter.", "a": "in", "o": ["on", "at", "to"], "h": "Seasons → in winter."}, {"q": "Choose the correct preposition: There is a photo ___ the wall.", "a": "on", "o": ["in", "at", "under of"], "h": "Pictures on a wall."}, {"q": "Choose the correct preposition: I stay ___ home on Sundays.", "a": "at", "o": ["in", "on", "to"], "h": "Fixed phrase: at home."}, {"q": "Choose the correct preposition: She lives ___ Moscow.", "a": "in", "o": ["on", "at", "into"], "h": "Cities / countries → in."}, {"q": "Choose the correct preposition: The cat is hiding ___ the bed.", "a": "under", "o": ["in", "on", "at"], "h": "Position below something."}, {"q": "Choose the correct preposition: We usually travel ___ bus.", "a": "by", "o": ["on", "at", "with"], "h": "Transport: by bus, by train."}], "vocab8": [{"q": "Choose the correct word: We cook dinner in the ___.", "a": "kitchen", "o": ["bedroom", "garden", "corridor"], "h": "Kitchen = place for cooking."}, {"q": "Choose the correct word: You wear these on your hands in winter.", "a": "gloves", "o": ["boots", "caps", "belts"], "h": "Gloves protect your hands."}, {"q": "Choose the correct word: When it rains, you may need an ___.", "a": "umbrella", "o": ["helmet", "apron", "notebook"], "h": "Umbrella = for rain."}, {"q": "Choose the correct word: The opposite of cheap is ___.", "a": "expensive", "o": ["noisy", "hungry", "friendly"], "h": "Cheap ↔ expensive."}, {"q": "Choose the correct word: You can cut paper with ___.", "a": "scissors", "o": ["pillows", "mirrors", "gloves"], "h": "Scissors are used for cutting."}, {"q": "Choose the correct word: Your elbow is part of your ___.", "a": "body", "o": ["weather", "schoolbag", "street"], "h": "Elbow is a body part."}, {"q": "Choose the correct word: The season between summer and winter is ___.", "a": "autumn", "o": ["spring", "Tuesday", "January"], "h": "Autumn is a season."}, {"q": "Choose the correct word: A person who helps sick people is a ___.", "a": "doctor", "o": ["driver", "farmer", "artist"], "h": "Doctor treats patients."}, {"q": "Choose the correct word: We usually keep milk in the ___.", "a": "fridge", "o": ["wardrobe", "garage", "sink"], "h": "Fridge keeps food cold."}, {"q": "Choose the correct word: If you are very thirsty, you need some ___.", "a": "water", "o": ["blankets", "shoes", "coins"], "h": "Water helps when you are thirsty."}, {"q": "Choose the correct word: Football, tennis and swimming are types of ___.", "a": "sports", "o": ["countries", "months", "furniture"], "h": "They are sports."}, {"q": "Choose the correct word: We use a ___ to see very small things.", "a": "microscope", "o": ["piano", "pillow", "uniform"], "h": "Microscope makes tiny things visible."}], "spelling8": [{"q": "Choose the correct spelling of because.", "a": "because", "o": ["becouse", "beacause", "becaus"], "h": "because"}, {"q": "Choose the correct spelling of friend.", "a": "friend", "o": ["freind", "frend", "frient"], "h": "friend"}, {"q": "Choose the correct spelling of people.", "a": "people", "o": ["peaple", "peeple", "pepole"], "h": "people"}, {"q": "Choose the correct spelling of usually.", "a": "usually", "o": ["ussually", "usualy", "useually"], "h": "usually"}, {"q": "Choose the correct spelling of together.", "a": "together", "o": ["togather", "togehter", "to gether"], "h": "together"}, {"q": "Choose the correct spelling of family.", "a": "family", "o": ["famly", "familly", "fammily"], "h": "family"}, {"q": "Choose the correct spelling of really.", "a": "really", "o": ["realy", "rially", "reaally"], "h": "really"}, {"q": "Choose the correct spelling of already.", "a": "already", "o": ["allready", "alredy", "alraedy"], "h": "already"}, {"q": "Choose the correct spelling of weather.", "a": "weather", "o": ["wether", "weither", "waether"], "h": "weather"}, {"q": "Choose the correct spelling of favourite.", "a": "favourite", "o": ["favoruite", "favourit", "faverite"], "h": "British spelling: favourite."}, {"q": "Choose the correct spelling of beautiful.", "a": "beautiful", "o": ["beautifull", "butiful", "beautyful"], "h": "beautiful"}, {"q": "Choose the correct spelling of different.", "a": "different", "o": ["diferent", "differant", "differnt"], "h": "different"}]};
  var BANK9 = {"pps9": [{"q": "Choose the correct form: I ___ this film three times.", "a": "have seen", "o": ["saw", "had seen", "see"], "h": "Life experience until now → Present Perfect."}, {"q": "Choose the correct form: We ___ this film last Friday.", "a": "saw", "o": ["have seen", "had seen", "see"], "h": "Specific finished time → Past Simple."}, {"q": "Choose the correct form: She ___ her keys, so she can’t open the door.", "a": "has lost", "o": ["lost", "had lost", "lose"], "h": "Present result → Present Perfect."}, {"q": "Choose the correct form: She ___ her keys yesterday at school.", "a": "lost", "o": ["has lost", "had lost", "loses"], "h": "Yesterday → Past Simple."}, {"q": "Choose the correct form: ___ you ever ___ to London?", "a": "Have / been", "o": ["Did / go", "Have / went", "Had / been"], "h": "Ever + life experience → Present Perfect."}, {"q": "Choose the correct form: I ___ my homework already.", "a": "have finished", "o": ["finished", "had finished", "finish"], "h": "Already + present result."}, {"q": "Choose the correct form: We ___ our homework two hours ago.", "a": "finished", "o": ["have finished", "had finished", "finish"], "h": "Ago → Past Simple."}, {"q": "Choose the correct form: Tom ___ in this town since 2020.", "a": "has lived", "o": ["lived", "had lived", "lives"], "h": "Since + starting point → Present Perfect."}, {"q": "Choose the correct form: Tom ___ in this town when he was a child.", "a": "lived", "o": ["has lived", "had lived", "lives"], "h": "Finished period in the past."}, {"q": "Choose the correct form: We ___ lunch yet.", "a": "haven’t had", "o": ["didn’t have", "hadn’t had", "don’t have"], "h": "Yet + unfinished present result."}, {"q": "Choose the correct form: I ___ my phone, but I found it later.", "a": "lost", "o": ["have lost", "has lost", "lose"], "h": "A finished event in the past."}, {"q": "Choose the correct form: They ___ just ___ home.", "a": "have / arrived", "o": ["did / arrive", "had / arrived", "have / arrive"], "h": "Just + Present Perfect."}], "pastmix9": [{"q": "Choose the correct form: When I arrived, they ___ dinner.", "a": "were having", "o": ["had", "have had", "having"], "h": "Action in progress when another action happened."}, {"q": "Choose the correct form: She was tired because she ___ all night.", "a": "had studied", "o": ["studied", "was studying", "has studied"], "h": "Earlier past action → Past Perfect."}, {"q": "Choose the correct form: While we ___ home, it started to snow.", "a": "were walking", "o": ["walked", "had walked", "have walked"], "h": "Background action → Past Continuous."}, {"q": "Choose the correct form: I ___ the door before I left.", "a": "had locked", "o": ["locked", "was locking", "have locked"], "h": "First action before left → Past Perfect."}, {"q": "Choose the correct form: They ___ TV when the lights went out.", "a": "were watching", "o": ["watched", "had watched", "have watched"], "h": "Interrupted background action."}, {"q": "Choose the correct form: By the time we reached the station, the train ___.", "a": "had left", "o": ["left", "was leaving", "has left"], "h": "The train left earlier."}, {"q": "Choose the correct form: We ___ in the park yesterday evening.", "a": "walked", "o": ["were walk", "had walking", "have walked"], "h": "Simple finished past event."}, {"q": "Choose the correct form: She ___ a shower when the phone rang.", "a": "was taking", "o": ["took", "had taken", "has taken"], "h": "Long action in progress."}, {"q": "Choose the correct form: He ___ his homework before he played games.", "a": "had done", "o": ["did", "was doing", "has done"], "h": "Homework first, games second."}, {"q": "Choose the correct form: I ___ to music while my sister was cooking.", "a": "was listening", "o": ["listened", "had listened", "have listened"], "h": "Two parallel actions in the past."}, {"q": "Choose the correct form: They ___ the museum and then went for lunch.", "a": "visited", "o": ["had visiting", "were visit", "have visited"], "h": "Sequence of past actions → Past Simple."}, {"q": "Choose the correct form: We couldn’t get in because someone ___ the key.", "a": "had taken", "o": ["took", "was taking", "has taken"], "h": "The key was taken before we arrived."}], "cond9": [{"q": "Choose the correct form: If you heat ice, it ___.", "a": "melts", "o": ["will melt", "would melt", "melted"], "h": "Zero Conditional = fact."}, {"q": "Choose the correct form: If it rains, we ___ at home.", "a": "will stay", "o": ["stay", "would stay", "stayed"], "h": "First Conditional."}, {"q": "Choose the correct form: If I ___ more money, I would buy a laptop.", "a": "had", "o": ["have", "will have", "had had"], "h": "Second Conditional."}, {"q": "Choose the correct form: If she studies hard, she ___ the test.", "a": "will pass", "o": ["passes always", "would pass", "passed"], "h": "Real future possibility."}, {"q": "Choose the correct form: If I ___ you, I would apologise.", "a": "were", "o": ["am", "was always", "had been"], "h": "Fixed phrase: If I were you."}, {"q": "Choose the correct form: Plants die if they ___ enough water.", "a": "don’t get", "o": ["won’t get", "wouldn’t get", "didn’t get"], "h": "General truth."}, {"q": "Choose the correct form: If they ___ now, they will catch the train.", "a": "leave", "o": ["will leave", "would leave", "left"], "h": "If-clause in First Conditional uses Present Simple."}, {"q": "Choose the correct form: If I lived by the sea, I ___ every day.", "a": "would swim", "o": ["will swim", "swim", "swam"], "h": "Imaginary present situation."}, {"q": "Choose the correct form: Unless you hurry, you ___ late.", "a": "will be", "o": ["are", "would be", "were"], "h": "Unless = if not."}, {"q": "Choose the correct form: If people ___ less plastic, the oceans would be cleaner.", "a": "used", "o": ["use", "will use", "had used"], "h": "Second Conditional."}, {"q": "Choose the correct form: If we ___ the answer, we ask the teacher.", "a": "don’t know", "o": ["won’t know", "didn’t know", "wouldn’t know"], "h": "Zero Conditional routine."}, {"q": "Choose the correct form: If he calls me, I ___ him the news.", "a": "will tell", "o": ["tell", "would tell", "told"], "h": "Main clause in First Conditional."}], "passive9": [{"q": "Choose the correct form: English ___ in many countries.", "a": "is spoken", "o": ["speaks", "is speaking", "spoke"], "h": "Present Simple Passive."}, {"q": "Choose the correct form: The bridge ___ in 2010.", "a": "was built", "o": ["built", "is built", "was building"], "h": "Past Simple Passive."}, {"q": "Choose the correct form: The classroom ___ every day.", "a": "is cleaned", "o": ["cleans", "is cleaning", "cleaned"], "h": "Routine action in passive."}, {"q": "Choose the correct form: The letters ___ yesterday.", "a": "were sent", "o": ["sent", "are sent", "were sending"], "h": "Past Simple Passive plural."}, {"q": "Choose the correct form: The homework must ___ today.", "a": "be finished", "o": ["finished", "to finish", "been finished"], "h": "Modal + be + V3."}, {"q": "Choose the correct form: The new phones ___ next month.", "a": "will be sold", "o": ["will sell", "are selling", "were sold"], "h": "Future Passive."}, {"q": "Choose the correct form: Coffee ___ in Brazil.", "a": "is grown", "o": ["grows", "is growing", "grew"], "h": "Passive because coffee is the object."}, {"q": "Choose the correct form: The windows ___ last week.", "a": "were painted", "o": ["painted", "are painted", "were painting"], "h": "Finished past action."}, {"q": "Choose the correct form: This song ___ by millions of people.", "a": "is loved", "o": ["loves", "is loving", "loved"], "h": "Present Passive."}, {"q": "Choose the correct form: The museum ___ on Mondays.", "a": "is closed", "o": ["closes", "closed", "is closing"], "h": "State/result in passive form."}, {"q": "Choose the correct form: These books ___ by our teacher.", "a": "were chosen", "o": ["chose", "are choosing", "was chosen"], "h": "Plural subject + Past Passive."}, {"q": "Choose the correct form: A lot of rubbish ___ in the sea every year.", "a": "is thrown", "o": ["throws", "threw", "is throwing"], "h": "Passive present statement."}], "modals9": [{"q": "Choose the correct modal: You ___ wear a seat belt in a car.", "a": "must", "o": ["can", "might", "shouldn’t"], "h": "Strong obligation / rule."}, {"q": "Choose the correct modal: She ___ swim very well when she was six.", "a": "could", "o": ["must", "should", "may"], "h": "Past ability."}, {"q": "Choose the correct modal: You look tired. You ___ go to bed earlier.", "a": "should", "o": ["mustn’t", "can’t", "would"], "h": "Advice."}, {"q": "Choose the correct modal: ___ I open the window?", "a": "May", "o": ["Must", "Should", "Had"], "h": "Polite permission."}, {"q": "Choose the correct modal: I ___ finish this today; it isn’t urgent.", "a": "don’t have to", "o": ["must", "mustn’t", "can’t"], "h": "No necessity."}, {"q": "Choose the correct modal: He ___ be at home — the lights are on.", "a": "might", "o": ["mustn’t", "don’t have to", "had to"], "h": "Possibility."}, {"q": "Choose the correct modal: We ___ run in the corridor at school.", "a": "mustn’t", "o": ["can", "might", "don’t have to"], "h": "Prohibition."}, {"q": "Choose the correct modal: My sister ___ speak three languages.", "a": "can", "o": ["must", "should", "has to"], "h": "Ability."}, {"q": "Choose the correct modal: I ___ get up early tomorrow because the exam starts at 8.", "a": "have to", "o": ["don’t have to", "might", "can"], "h": "External necessity."}, {"q": "Choose the correct modal: It’s dark outside; you ___ take a torch.", "a": "should", "o": ["mustn’t", "can’t", "had"], "h": "Recommendation."}, {"q": "Choose the correct modal: When I was younger, I ___ climb that tree.", "a": "could", "o": ["must", "may", "should"], "h": "Past ability."}, {"q": "Choose the correct modal: Students ___ use phones during the exam.", "a": "mustn’t", "o": ["can", "have to", "may"], "h": "Rule / prohibition."}], "wordform9": [{"q": "Choose the correct form: My uncle is a bus ___. (DRIVE)", "a": "driver", "o": ["driving", "drive", "driven"], "h": "Person who drives = driver."}, {"q": "Choose the correct form: She answered the question ___. (QUICK)", "a": "quickly", "o": ["quick", "quickness", "quicker"], "h": "Adverb needed."}, {"q": "Choose the correct form: We need more ___ people in the team. (HELP)", "a": "helpful", "o": ["helpfully", "help", "helpless"], "h": "Adjective before people."}, {"q": "Choose the correct form: This game is very ___. (USE)", "a": "useful", "o": ["uselessly", "use", "usage"], "h": "Useful = helpful."}, {"q": "Choose the correct form: His answer was completely ___. (CORRECT)", "a": "incorrect", "o": ["correctly", "correction", "correctness"], "h": "Negative adjective needed."}, {"q": "Choose the correct form: Thank you for your ___. (KIND)", "a": "kindness", "o": ["kindly", "kind", "unkind"], "h": "Noun needed after your."}, {"q": "Choose the correct form: She is a very ___ student. (SUCCESS)", "a": "successful", "o": ["successfully", "success", "successes"], "h": "Adjective needed."}, {"q": "Choose the correct form: The children listened ___. (CAREFUL)", "a": "carefully", "o": ["careful", "careless", "carefulness"], "h": "Adverb describes listened."}, {"q": "Choose the correct form: It was a big ___. (IMPROVE)", "a": "improvement", "o": ["improve", "improving", "improved"], "h": "Noun needed."}, {"q": "Choose the correct form: He felt ___ before the competition. (NERVE)", "a": "nervous", "o": ["nervously", "nerves", "nerve"], "h": "Adjective after felt."}, {"q": "Choose the correct form: The idea was quite ___. (CREATE)", "a": "creative", "o": ["creativity", "creator", "create"], "h": "Adjective needed."}, {"q": "Choose the correct form: That rule is easy to ___. (MEMORY)", "a": "remember", "o": ["memory", "memorable", "remembering"], "h": "Verb is required."}], "vocab9": [{"q": "Choose the correct word: We had to ___ a hotel room before the trip.", "a": "book", "o": ["grow", "paint", "borrow"], "h": "You book a room or a ticket."}, {"q": "Choose the correct word: I need some ___ because my head hurts.", "a": "medicine", "o": ["luggage", "traffic", "environment"], "h": "Medicine helps when you are ill."}, {"q": "Choose the correct word: My phone battery is almost ___.", "a": "dead", "o": ["warm", "straight", "local"], "h": "A battery can be dead."}, {"q": "Choose the correct word: Our teacher asked us to work in ___.", "a": "pairs", "o": ["vacations", "weather", "shelves"], "h": "Work in pairs = work with a partner."}, {"q": "Choose the correct word: He missed the bus because of heavy ___.", "a": "traffic", "o": ["culture", "luggage", "pain"], "h": "Heavy traffic slows transport."}, {"q": "Choose the correct word: We carried our bags to the hotel ___.", "a": "reception", "o": ["forest", "factory", "bridge"], "h": "Reception is the front desk."}, {"q": "Choose the correct word: Doing regular exercise is good for your ___.", "a": "health", "o": ["rent", "distance", "choice"], "h": "Exercise is good for health."}, {"q": "Choose the correct word: We should protect the ___ from pollution.", "a": "environment", "o": ["wardrobe", "receipt", "festival"], "h": "Pollution harms the environment."}, {"q": "Choose the correct word: I usually ___ the internet for homework information.", "a": "use", "o": ["invite", "repair", "carry"], "h": "Use the internet."}, {"q": "Choose the correct word: During the tour we visited several famous ___.", "a": "landmarks", "o": ["bandages", "recipes", "engines"], "h": "Landmarks = famous places."}, {"q": "Choose the correct word: She felt ___ before speaking to the whole class.", "a": "nervous", "o": ["available", "wooden", "outside"], "h": "Nervous = worried / anxious."}, {"q": "Choose the correct word: We need to ___ for the exam, not just read once.", "a": "revise", "o": ["borrow", "cancel", "mix"], "h": "Revise = prepare again."}], "spelling9": [{"q": "Choose the correct spelling of beautiful.", "a": "beautiful", "o": ["beautifull", "butiful", "beautifal"], "h": "beautiful"}, {"q": "Choose the correct spelling of important.", "a": "important", "o": ["importent", "imporant", "importandt"], "h": "important"}, {"q": "Choose the correct spelling of successful.", "a": "successful", "o": ["succesful", "successfull", "succesfull"], "h": "successful"}, {"q": "Choose the correct spelling of comfortable.", "a": "comfortable", "o": ["comftable", "comfortible", "comforrtable"], "h": "comfortable"}, {"q": "Choose the correct spelling of dangerous.", "a": "dangerous", "o": ["dangorous", "dangerus", "dangerouss"], "h": "dangerous"}, {"q": "Choose the correct spelling of library.", "a": "library", "o": ["libary", "librery", "lybrary"], "h": "library"}, {"q": "Choose the correct spelling of Wednesday.", "a": "Wednesday", "o": ["Wensday", "Wednsday", "Wednesdy"], "h": "Wednesday"}, {"q": "Choose the correct spelling of favourite.", "a": "favourite", "o": ["favorit", "favouritte", "faverite"], "h": "British spelling: favourite."}, {"q": "Choose the correct spelling of different.", "a": "different", "o": ["differant", "diferent", "diffrent"], "h": "different"}, {"q": "Choose the correct spelling of restaurant.", "a": "restaurant", "o": ["restaraunt", "restorant", "restarant"], "h": "restaurant"}, {"q": "Choose the correct spelling of environment.", "a": "environment", "o": ["enviroment", "envirenment", "environmant"], "h": "environment"}, {"q": "Choose the correct spelling of necessary.", "a": "necessary", "o": ["neccessary", "necesary", "necessaryy"], "h": "necessary"}]};
  if(grade === '8'){
    injectAfter('rus', {id:'eng', nm:'Английский', ic:'🇬🇧', date:'', cl:ENG_COLOR, bg:ENG_BG, tops:[
      {id:"present8", nm:"Present Tenses", gen:bankGen("Present Tenses", BANK8["present8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["present8"], dot:"#2563eb"},
      {id:"past8", nm:"Past Simple", gen:bankGen("Past Simple", BANK8["past8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["past8"], dot:"#0d9488"},
      {id:"future8", nm:"Future Forms", gen:bankGen("Future Forms", BANK8["future8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["future8"], dot:"#7c3aed"},
      {id:"compare8", nm:"Comparisons", gen:bankGen("Comparisons", BANK8["compare8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["compare8"], dot:"#16a34a"},
      {id:"articles8", nm:"Articles a/an/the", gen:bankGen("Articles a/an/the", BANK8["articles8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["articles8"], dot:"#ea580c"},
      {id:"preps8", nm:"Prepositions of Time & Place", gen:bankGen("Prepositions of Time & Place", BANK8["preps8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["preps8"], dot:"#dc2626"},
      {id:"vocab8", nm:"Vocabulary A2", gen:bankGen("Vocabulary A2", BANK8["vocab8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["vocab8"], dot:"#2563eb"},
      {id:"spelling8", nm:"Spelling A2", gen:bankGen("Spelling A2", BANK8["spelling8"], ENG_COLOR, ENG_BG), th:window.ENG_TH["spelling8"], dot:"#ca8a04"}
    ]});
  }
  if(grade === '9'){
    injectAfter('rus', {id:'eng', nm:'Английский', ic:'🇬🇧', date:'', cl:ENG_COLOR, bg:ENG_BG, tops:[
      {id:"pps9", nm:"Present Perfect vs Past Simple", gen:bankGen("Present Perfect vs Past Simple", BANK9["pps9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["pps9"], dot:"#2563eb"},
      {id:"pastmix9", nm:"Past Tenses Mix", gen:bankGen("Past Tenses Mix", BANK9["pastmix9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["pastmix9"], dot:"#0d9488"},
      {id:"cond9", nm:"Conditionals 0\u20132", gen:bankGen("Conditionals 0\u20132", BANK9["cond9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["cond9"], dot:"#7c3aed"},
      {id:"passive9", nm:"Passive Voice Basics", gen:bankGen("Passive Voice Basics", BANK9["passive9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["passive9"], dot:"#16a34a"},
      {id:"modals9", nm:"Modal Basics", gen:bankGen("Modal Basics", BANK9["modals9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["modals9"], dot:"#ea580c"},
      {id:"wordform9", nm:"Word Formation \u041e\u0413\u042d", gen:bankGen("Word Formation \u041e\u0413\u042d", BANK9["wordform9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["wordform9"], dot:"#dc2626"},
      {id:"vocab9", nm:"Vocabulary A2\u2013B1", gen:bankGen("Vocabulary A2\u2013B1", BANK9["vocab9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["vocab9"], dot:"#2563eb"},
      {id:"spelling9", nm:"Spelling B1", gen:bankGen("Spelling B1", BANK9["spelling9"], ENG_COLOR, ENG_BG), th:window.ENG_TH["spelling9"], dot:"#ca8a04"}
    ]});
  }
})();

;
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
      return mkQ(q.q, q.a, shuffle([q.a].concat(q.o || [])).slice(0, 4), q.h || '', topicName, color || ENG_COLOR, bg || ENG_BG, q.code || null, !!q.isMath);
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
      return mkQ(q.q, q.a, shuffle([q.a].concat(q.o || [])).slice(0, 4), q.h || '', topicName, color || ENG_COLOR, bg || ENG_BG, q.code || null, !!q.isMath);
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
/* --- wave16_theory.js --- */
(function(){
  const subjectList = (typeof SUBJ !== 'undefined' ? SUBJ : (window.SUBJ || []));
  if (!Array.isArray(subjectList) || !subjectList.length) return;

  function setTheory(subjectId, topicId, html){
    const subj = subjectList.find(s => s && s.id === subjectId);
    if (!subj || !Array.isArray(subj.tops)) return false;
    const topic = subj.tops.find(t => t && t.id === topicId);
    if (!topic) return false;
    topic.th = `<div class="tcard">${html}</div>`;
    return true;
  }

  const patches = {
    '5': {
      math: {
        dec: `<h3>Десятичные дроби</h3>
<p><b>Что это такое:</b> десятичная дробь показывает части целого. После запятой идут десятые, сотые, тысячные.</p>
<div class="fm">3,4 = 3 целых и 4 десятых
0,25 = 25 сотых
1,07 = 1 целая и 7 сотых</div>
<ul>
  <li>При сложении и вычитании записывай числа <b>под запятую</b>.</li>
  <li>При умножении на 10, 100, 1000 запятая идёт вправо.</li>
  <li>При делении на 10, 100, 1000 запятая идёт влево.</li>
</ul>
<div class="ex">Пример: 3,5 + 1,25 = 4,75. Сначала выравниваем запятые, потом считаем как в столбик.</div>
<p><b>Проверь себя:</b> 0,3 × 10 = 3, а 42 ÷ 10 = 4,2.</p>`,
        frac: `<h3>Обыкновенные дроби</h3>
<p><b>Дробь</b> состоит из числителя и знаменателя. Знаменатель показывает, на сколько частей разделили целое, числитель — сколько частей взяли.</p>
<div class="fm">3/5 — взяли 3 части из 5
7/4 = 1 3/4
6/8 = 3/4 после сокращения</div>
<ul>
  <li><b>Правильная дробь</b>: числитель меньше знаменателя.</li>
  <li><b>Неправильная дробь</b>: числитель не меньше знаменателя.</li>
  <li>С одинаковыми знаменателями складываем и вычитаем только <b>числители</b>.</li>
</ul>
<div class="ex">Пример: 2/7 + 3/7 = 5/7. Знаменатель 7 остаётся тем же.</div>
<p><b>Сокращение:</b> если числитель и знаменатель делятся на одно и то же число, дробь можно упростить.</p>`,
        pct: `<h3>Проценты</h3>
<p><b>1%</b> — это одна сотая часть числа. Проценты помогают быстро сравнивать части целого.</p>
<div class="fm">10% = одна десятая
25% = одна четверть
50% = половина
100% = всё число</div>
<ul>
  <li>Чтобы найти процент от числа, умножь число на процент и раздели на 100.</li>
  <li>Удобно помнить готовые случаи: 50%, 25%, 10%.</li>
</ul>
<div class="ex">Пример: 25% от 200 = 200 × 25 ÷ 100 = 50.</div>
<p><b>Лайфхак:</b> 10% от числа — просто разделить его на 10.</p>`,
        geo: `<h3>Геометрия</h3>
<p>В 5 классе важно не только узнавать фигуры, но и понимать, <b>что именно измеряем</b>: длину, периметр, площадь или объём.</p>
<div class="fm">Периметр прямоугольника: P = 2(a + b)
Площадь прямоугольника: S = a × b
Площадь треугольника: S = a × h ÷ 2
Объём прямоугольного параллелепипеда: V = a × b × c</div>
<ul>
  <li><b>Периметр</b> — сумма длин всех сторон.</li>
  <li><b>Площадь</b> — сколько места фигура занимает на плоскости.</li>
  <li><b>Объём</b> — сколько места занимает тело в пространстве.</li>
</ul>
<div class="ex">Пример: у прямоугольника со сторонами 4 см и 6 см периметр 20 см, а площадь 24 см².</div>`,
      },
      rus: {
        syn: `<h3>Синтаксис</h3>
<p><b>Синтаксис</b> изучает, как слова соединяются в словосочетания и предложения.</p>
<div class="fm">Подлежащее — кто? что?
Сказуемое — что делает? каков?
Дополнение — кого? чего? кому?
Определение — какой? чей?
Обстоятельство — где? когда? как?</div>
<ul>
  <li>В каждом предложении ищем <b>грамматическую основу</b>: подлежащее и сказуемое.</li>
  <li>Если основа одна — предложение простое.</li>
  <li>Если основ две и больше — предложение сложное.</li>
</ul>
<div class="ex">Пример: <i>Ребята читают книгу.</i> Подлежащее — ребята, сказуемое — читают.</div>`,
        phon: `<h3>Фонетика</h3>
<p><b>Фонетика</b> изучает звуки речи. Важно помнить: <b>буквы пишем</b>, а <b>звуки произносим</b>.</p>
<div class="fm">Гласные: а, о, у, э, ы, и, е, ё, ю, я
Согласные: звонкие / глухие, твёрдые / мягкие
Ь и Ъ сами звука не дают</div>
<ul>
  <li>Буквы е, ё, ю, я могут давать два звука: [й'э], [й'о], [й'у], [й'а].</li>
  <li>Ударение помогает отличить ударный и безударный гласный звук.</li>
  <li>Количество букв и звуков иногда не совпадает.</li>
</ul>
<div class="ex">Пример: <i>яма</i> — 4 буквы, но 5 звуков: [й'ама].</div>`,
        morph: `<h3>Морфология</h3>
<p><b>Морфология</b> изучает части речи и их признаки. Чтобы определить слово, задаём к нему вопрос.</p>
<div class="fm">Существительное — кто? что?
Прилагательное — какой? какая?
Глагол — что делать? что сделать?
Наречие — как? где? когда?</div>
<ul>
  <li>Существительное имеет род, число, падеж.</li>
  <li>Прилагательное согласуется с существительным.</li>
  <li>Глагол изменяется по временам, лицам и числам.</li>
</ul>
<div class="ex">Пример: <i>зелёный лист растёт</i>. Лист — существительное, зелёный — прилагательное, растёт — глагол.</div>
<p><b>Подсказка:</b> сначала найди главное слово, потом смотри, какие слова от него зависят.</p>`,
      },
      his: {
        egypt: `<h3>Древний Египет</h3>
<p>Египет возник на берегах Нила. Разливы реки делали землю плодородной, поэтому люди могли выращивать хлеб и строить города.</p>
<div class="fm">Фараон — правитель Египта
Нил — главная река страны
Пирамида — гробница фараона
Иероглифы — письменность
Папирус — материал для письма</div>
<ul>
  <li>Египтяне строили каналы и орошали поля.</li>
  <li>Фараона считали не просто царём, а священным правителем.</li>
  <li>Большую роль играли жрецы и писцы.</li>
</ul>
<div class="ex">Запомни: без Нила не было бы и могущественного Египта.</div>`,
        greece: `<h3>Древняя Греция</h3>
<p>Греция состояла из множества <b>полисов</b> — городов-государств. Самые известные — Афины и Спарта.</p>
<div class="fm">Полис — город-государство
Демократия — власть народа
Олимпийские игры — праздник спорта
Философы — Сократ, Платон, Аристотель</div>
<ul>
  <li>В Афинах развивались наука, театр и демократия.</li>
  <li>Спарта славилась строгим воспитанием воинов.</li>
  <li>Греки верили в богов Олимпа: Зевса, Афину, Посейдона и других.</li>
</ul>
<div class="ex">Если в вопросе есть слова <i>полис</i>, <i>Олимпиада</i>, <i>демократия</i>, чаще всего речь о Греции.</div>`,
        rome: `<h3>Древний Рим</h3>
<p>История Рима делится на царский период, республику и империю. Римляне создали сильную армию, законы и дороги.</p>
<div class="fm">Республика — власть выборных органов
Сенат — совет знатных граждан
Империя — власть императора
Легион — военное подразделение</div>
<ul>
  <li>Сначала в Риме были консулы и сенат.</li>
  <li>Позже установилась власть императоров.</li>
  <li>Римское право и сегодня влияет на законы многих стран.</li>
</ul>
<div class="ex">Рим легко узнать по словам: <i>сенат</i>, <i>легион</i>, <i>император</i>, <i>Колизей</i>.</div>`,
      },
      bio: {
        cell: `<h3>Клетка</h3>
<p><b>Клетка</b> — основная единица живого организма. Все растения, животные и человек состоят из клеток.</p>
<div class="fm">Мембрана — защита
Цитоплазма — внутренняя среда
Ядро — хранит наследственную информацию
Митохондрии — дают энергию
Хлоропласты — есть у растений</div>
<ul>
  <li>У растительной клетки есть клеточная стенка и крупная вакуоль.</li>
  <li>У животной клетки нет хлоропластов.</li>
  <li>Органоиды выполняют разные задачи внутри клетки.</li>
</ul>
<div class="ex">Если вопрос про фотосинтез — ищи хлоропласты. Если про хранение ДНК — это ядро.</div>`,
        plant: `<h3>Растения</h3>
<p>У растения каждый орган выполняет свою работу. Чтобы понять вопрос, полезно помнить, <b>что делает каждая часть</b>.</p>
<div class="fm">Корень — удерживает и всасывает воду
Стебель — проводит вещества
Лист — фотосинтез и дыхание
Цветок — размножение
Плод и семя — распространение потомства</div>
<ul>
  <li>Фотосинтез идёт в зелёных частях растения на свету.</li>
  <li>После опыления из цветка развивается плод.</li>
  <li>Семя содержит зародыш нового растения.</li>
</ul>
<div class="ex">Лист нельзя путать с корнем: лист работает со светом и воздухом, корень — с почвой и водой.</div>`,
        human: `<h3>Человек и здоровье</h3>
<p>Органы человека работают вместе. Чтобы быть здоровым, важно понимать, <b>какая система за что отвечает</b>.</p>
<div class="fm">Скелет — опора тела
Мышцы — движение
Лёгкие — дыхание
Сердце — движение крови
Желудок и кишечник — пищеварение</div>
<ul>
  <li>Гигиена и мытьё рук защищают от микробов.</li>
  <li>Сон, движение и полезная еда помогают организму расти.</li>
  <li>При плохом самочувствии нужно сообщить взрослым.</li>
</ul>
<div class="ex">Если вопрос о том, какой орган качает кровь, ответ — сердце. Если о поступлении воздуха — лёгкие.</div>`,
      },
      geo5: {
        earth: `<h3>Земля</h3>
<p>Земля — планета Солнечной системы. Она вращается вокруг своей оси и вокруг Солнца, из-за этого сменяются день и ночь, а также времена года.</p>
<div class="fm">Ось вращения — 24 часа = сутки
Орбита вокруг Солнца — 365 дней = год
Экватор делит Землю на полушария
Параллели идут с запада на восток
Меридианы идут от полюса к полюсу</div>
<ul>
  <li>Наклон земной оси объясняет смену времён года.</li>
  <li>Экватор — главная параллель.</li>
  <li>Полюса находятся на севере и юге.</li>
</ul>
<div class="ex">Если в задании спрашивают, почему есть день и ночь, ответ: Земля вращается вокруг своей оси.</div>`,
        map: `<h3>Карта и план</h3>
<p>Карта и план помогают изображать местность на бумаге. Самое важное — понимать <b>масштаб</b> и условные знаки.</p>
<div class="fm">Масштаб 1:1000 → 1 см = 10 м
Компас показывает север
Условные знаки обозначают объекты
Горизонтали показывают высоту</div>
<ul>
  <li>План обычно показывает маленькую территорию очень подробно.</li>
  <li>Карта охватывает большую территорию в более мелком масштабе.</li>
  <li>По условным знакам узнаём лес, реку, дорогу, город.</li>
</ul>
<div class="ex">Если расстояние на карте 3 см при масштабе 1:1000, в реальности это 30 метров.</div>`,
        zones: `<h3>Природные зоны</h3>
<p>Природная зона — это территория со своим климатом, почвами, растениями и животными.</p>
<div class="fm">Тундра — холодно, мхи и лишайники
Тайга — хвойные леса
Смешанные леса — хвойные и лиственные деревья
Степь — травы и мало деревьев
Пустыня — жарко и сухо</div>
<ul>
  <li>На севере холоднее, на юге теплее.</li>
  <li>Климат влияет на то, какие растения и животные могут жить в зоне.</li>
  <li>Одну зону удобно узнавать по характерным растениям.</li>
</ul>
<div class="ex">Ель и сосна чаще всего указывают на тайгу, а мхи и лишайники — на тундру.</div>`,
      }
    },
    '6': {
      math: {
        neg: `<h3>Отрицательные числа</h3>
<p>Отрицательные числа нужны, когда значение меньше нуля: температура −5°, долг −200 рублей, глубина ниже уровня моря.</p>
<div class="fm">... −3, −2, −1, 0, 1, 2, 3 ...
Правее на прямой — число больше
Левее на прямой — число меньше
|−5| = 5 — модуль числа</div>
<ul>
  <li>Любое положительное число больше любого отрицательного.</li>
  <li>Из двух отрицательных больше то, которое ближе к нулю.</li>
  <li>Модуль показывает расстояние от нуля.</li>
</ul>
<div class="ex">−2 > −7, потому что −2 находится правее на координатной прямой.</div>`,
        div: `<h3>Делимость</h3>
<p>Делимость помогает быстро понять, делится ли число без остатка. Это удобно для сокращения дробей, поиска НОД и НОК.</p>
<div class="fm">На 2 — если последняя цифра чётная
На 3 — если сумма цифр делится на 3
На 5 — если число оканчивается на 0 или 5
На 9 — если сумма цифр делится на 9
На 10 — если оканчивается на 0</div>
<ul>
  <li><b>НОД</b> — наибольший общий делитель.</li>
  <li><b>НОК</b> — наименьшее общее кратное.</li>
  <li>Признаки делимости позволяют проверять число без длинного деления.</li>
</ul>
<div class="ex">Число 126 делится на 3, потому что 1 + 2 + 6 = 9, а 9 делится на 3.</div>`,
        rat: `<h3>Пропорции и масштаб</h3>
<p><b>Отношение</b> показывает, во сколько раз одно число больше или меньше другого. <b>Пропорция</b> — это равенство двух отношений.</p>
<div class="fm">a : b = c : d
В пропорции a·d = b·c
Масштаб 1:100000 → 1 см = 1 км</div>
<ul>
  <li>Чтобы найти неизвестный член пропорции, используем произведения крест-накрест.</li>
  <li>Масштаб показывает, во сколько раз реальный объект уменьшили на карте.</li>
  <li>Прямая пропорциональность: больше одно — больше другое.</li>
</ul>
<div class="ex">x : 4 = 6 : 8 → x·8 = 4·6 → x = 3.</div>`,
        coord: `<h3>Координаты</h3>
<p>Координатная плоскость помогает находить положение точки по двум числам: по оси <b>x</b> и по оси <b>y</b>.</p>
<div class="fm">Первая координата — x (вправо/влево)
Вторая координата — y (вверх/вниз)
A(3; 2) — сначала 3 вправо, потом 2 вверх</div>
<ul>
  <li>Точка в начале координат имеет координаты (0; 0).</li>
  <li>Если x отрицательный — идём влево, если y отрицательный — вниз.</li>
  <li>По координатам можно строить графики и фигуры.</li>
</ul>
<div class="ex">Точка B(−2; 4) находится левее оси y и выше оси x.</div>`,
      },
      rus: {
        pron: `<h3>Местоимения</h3>
<p><b>Местоимение</b> указывает на предмет, признак или количество, но не называет их прямо.</p>
<div class="fm">Личные: я, ты, он, мы, вы, они
Притяжательные: мой, твой, наш
Указательные: этот, тот
Вопросительные: кто? что? какой?</div>
<ul>
  <li>Местоимения помогают не повторять одно и то же существительное много раз.</li>
  <li>Некоторые местоимения изменяются по падежам.</li>
  <li>В предложении местоимение может быть подлежащим, дополнением и определением.</li>
</ul>
<div class="ex">Маша взяла книгу. <i>Она</i> читает <i>её</i> вечером. Слова <i>она</i> и <i>её</i> — местоимения.</div>`,
        num: `<h3>Числительные</h3>
<p><b>Числительное</b> обозначает количество предметов или порядок при счёте.</p>
<div class="fm">Количественные: пять, двадцать, сто
Порядковые: пятый, двадцатый, сотый
Собирательные: двое, трое</div>
<ul>
  <li>Количественные отвечают на вопрос <b>сколько?</b></li>
  <li>Порядковые отвечают на вопрос <b>который?</b></li>
  <li>Числительные часто склоняются, поэтому важно следить за формой слова.</li>
</ul>
<div class="ex">Пять тетрадей — количественное числительное. Пятая парта — порядковое.</div>`,
        adj: `<h3>Имя прилагательное</h3>
<p><b>Прилагательное</b> обозначает признак предмета и зависит от существительного.</p>
<div class="fm">какой? какая? какое? какие?
каменный дом
сильный ветер
высокая гора</div>
<ul>
  <li>Прилагательные изменяются по родам, числам и падежам.</li>
  <li>Есть качественные, относительные и притяжательные прилагательные.</li>
  <li>Качественные могут образовывать степени сравнения: сильный — сильнее — самый сильный.</li>
</ul>
<div class="ex">В сочетании <i>зелёная трава</i> прилагательное <i>зелёная</i> согласуется со словом <i>трава</i>.</div>`,
      },
      his: {
        med: `<h3>Средние века</h3>
<p>Средневековье началось после падения Западной Римской империи и продолжалось примерно до конца XV века.</p>
<div class="fm">Феодал — владелец земли
Вассал — подчинённый феодалу
Замок — укреплённое жилище
Крестовые походы — военные походы на Восток</div>
<ul>
  <li>Основой общества была феодальная лестница.</li>
  <li>Большую роль играла церковь.</li>
  <li>Города постепенно росли, развивались ремёсла и торговля.</li>
</ul>
<div class="ex">Если в вопросе есть рыцари, замки и вассалы, скорее всего речь идёт о Средневековье.</div>`,
        byz: `<h3>Византия и ислам</h3>
<p>Византия была продолжением Римской империи на Востоке. Ислам возник в VII веке на Аравийском полуострове.</p>
<div class="fm">Константинополь — столица Византии
Император Юстиниан — известный правитель
Мухаммед — основатель ислама
Коран — священная книга мусульман</div>
<ul>
  <li>Византия сохранила римские традиции, право и христианскую культуру.</li>
  <li>Ислам быстро распространился по Ближнему Востоку и Северной Африке.</li>
  <li>Арабский мир дал много открытий в науке и медицине.</li>
</ul>
<div class="ex">Вопросы про Юстиниана и Константинополь относятся к Византии, а про Коран и Мекку — к исламу.</div>`,
        rmed: `<h3>Древняя Русь</h3>
<p>История Древней Руси связана с князьями, объединением земель и принятием христианства.</p>
<div class="fm">Рюрик — начало княжеской династии
Олег — объединил Новгород и Киев
Владимир — крестил Русь
Ярослав Мудрый — укрепил государство</div>
<ul>
  <li>Киев стал важным политическим центром.</li>
  <li>Принятие христианства усилило связи Руси с Византией.</li>
  <li>Русская Правда — один из первых сводов законов.</li>
</ul>
<div class="ex">Если в задании говорится о крещении Руси, правильный исторический герой — князь Владимир.</div>`,
      },
      bio: {
        anim: `<h3>Животные</h3>
<p>Животные — живые организмы, которые питаются готовыми органическими веществами и обычно активно передвигаются.</p>
<div class="fm">Признаки животных:
движение
питание готовой пищей
дыхание
рост и развитие
размножение</div>
<ul>
  <li>Животные делятся на беспозвоночных и позвоночных.</li>
  <li>Среда обитания влияет на строение тела и образ жизни.</li>
  <li>У разных групп есть свои признаки: покровы, дыхание, способ размножения.</li>
</ul>
<div class="ex">Рыбы дышат жабрами, птицы имеют перья, млекопитающие кормят детёнышей молоком.</div>`,
        class: `<h3>Классификация животных</h3>
<p>Классификация нужна, чтобы объединять животных в группы по общим признакам.</p>
<div class="fm">Тип → класс → отряд → семейство → род → вид
Позвоночные: рыбы, земноводные, пресмыкающиеся, птицы, млекопитающие</div>
<ul>
  <li>Чем ниже ступень классификации, тем более похожи организмы.</li>
  <li>Главные признаки группы помогают определить место животного.</li>
  <li>Классификация показывает родство живых организмов.</li>
</ul>
<div class="ex">Кошка и лев относятся к одному семейству кошачьих, потому что имеют сходное строение и происхождение.</div>`,
        plants: `<h3>Растения и их органы</h3>
<p>У растений есть органы, и каждый выполняет свою функцию. Это помогает растению жить, расти и размножаться.</p>
<div class="fm">Корень — всасывает воду и соли
Стебель — проводит вещества
Лист — фотосинтез и дыхание
Цветок — образование плода и семян</div>
<ul>
  <li>В листьях под действием света образуются питательные вещества.</li>
  <li>По стеблю вода идёт вверх, а питательные вещества — ко всем частям растения.</li>
  <li>После цветения появляются плоды и семена.</li>
</ul>
<div class="ex">Если растение завяло, часто проблема связана с корнем или нехваткой воды.</div>`,
      },
      geo6: {
        litho: `<h3>Литосфера</h3>
<p><b>Литосфера</b> — твёрдая оболочка Земли. Она состоит из земной коры и верхней части мантии.</p>
<div class="fm">Горы, равнины, вулканы, землетрясения
Горные породы: магматические, осадочные, метаморфические</div>
<ul>
  <li>Движение литосферных плит вызывает землетрясения и образование гор.</li>
  <li>Рельеф Земли постоянно меняется под действием внутренних и внешних сил.</li>
  <li>Полезные ископаемые связаны с особенностями строения земной коры.</li>
</ul>
<div class="ex">Если спрашивают про землетрясения, вулканы и плиты — это тема литосферы.</div>`,
        hydro: `<h3>Гидросфера</h3>
<p><b>Гидросфера</b> — водная оболочка Земли. В неё входят океаны, моря, реки, озёра, ледники и подземные воды.</p>
<div class="fm">Океан — крупнейшая часть гидросферы
Река — водный поток
Озеро — замкнутый водоём
Ледник — запас пресной воды</div>
<ul>
  <li>Большая часть воды на Земле солёная.</li>
  <li>Пресной воды меньше, но она особенно важна для человека.</li>
  <li>Вода постоянно движется в круговороте.</li>
</ul>
<div class="ex">Испарение, облака, осадки и сток в реки — это части круговорота воды.</div>`,
        atm: `<h3>Атмосфера и погода</h3>
<p><b>Атмосфера</b> — воздушная оболочка Земли. Она защищает планету и создаёт условия для жизни.</p>
<div class="fm">Погода — состояние воздуха сейчас
Климат — многолетний режим погоды
Температура, давление, ветер, облака, осадки</div>
<ul>
  <li>Нагревание поверхности Земли влияет на движение воздуха.</li>
  <li>Разность давления вызывает ветер.</li>
  <li>Облака и осадки образуются из водяного пара.</li>
</ul>
<div class="ex">Если воздух нагрелся и поднялся вверх, давление у поверхности уменьшается и меняется ветер.</div>`,
      }
    },
    '7': {
      alg: {
        lin: `<h3>Линейные уравнения</h3>
<p><b>Линейное уравнение</b> — это уравнение вида ax + b = 0. Его решают переносом и делением.</p>
<div class="fm">ax + b = 0
ax = −b
x = −b / a</div>
<ul>
  <li>Сначала переносим известные числа в другую часть уравнения.</li>
  <li>Потом делим обе части на коэффициент при x.</li>
  <li>Ответ всегда можно проверить подстановкой.</li>
</ul>
<div class="ex">3x + 6 = 0 → 3x = −6 → x = −2. Проверка: 3·(−2)+6 = 0.</div>`,
        pow: `<h3>Степени</h3>
<p>Степень показывает, сколько раз число умножают само на себя. Это удобная короткая запись повторяющегося умножения.</p>
<div class="fm">a² = a·a
a³ = a·a·a
a⁰ = 1
(aⁿ)·(aᵐ) = aⁿ⁺ᵐ</div>
<ul>
  <li>При умножении степеней с одинаковым основанием показатели складываются.</li>
  <li>При делении — вычитаются.</li>
  <li>Квадрат и куб числа нужно знать быстро и уверенно.</li>
</ul>
<div class="ex">2³ · 2² = 2⁵ = 32. Сначала сложили показатели: 3 + 2.</div>`,
        poly: `<h3>Многочлены</h3>
<p><b>Многочлен</b> состоит из нескольких одночленов, соединённых знаками плюс или минус.</p>
<div class="fm">3x + 2x = 5x
4a² − a² = 3a²
2x(3x + 5) = 6x² + 10x</div>
<ul>
  <li>Складывать можно только <b>подобные</b> слагаемые.</li>
  <li>Подобные слагаемые имеют одинаковую буквенную часть.</li>
  <li>Чтобы раскрыть скобки, умножаем число или одночлен на каждый член скобок.</li>
</ul>
<div class="ex">5x + 3y нельзя превратить в 8xy, потому что это не подобные слагаемые.</div>`,
        func: `<h3>Функции</h3>
<p><b>Функция</b> показывает, как одному значению x соответствует одно значение y. В 7 классе важна линейная функция y = kx + b.</p>
<div class="fm">k — наклон графика
b — точка пересечения с осью y
Если k > 0, график растёт
Если k < 0, график убывает</div>
<ul>
  <li>Чтобы построить график, достаточно найти несколько точек.</li>
  <li>Сначала подставляем x, затем вычисляем y.</li>
  <li>Если b = 0, прямая проходит через начало координат.</li>
</ul>
<div class="ex">Для y = 2x + 1: при x = 0 получаем y = 1, при x = 1 получаем y = 3.</div>`,
      },
      geo: {
        tri: `<h3>Треугольники</h3>
<p>Треугольник — фигура с тремя сторонами и тремя углами. Главный факт: сумма его углов всегда равна 180°.</p>
<div class="fm">Равнобедренный — две стороны равны
Равносторонний — все стороны и углы равны
Прямоугольный — один угол 90°</div>
<ul>
  <li>В равнобедренном треугольнике углы при основании равны.</li>
  <li>Периметр — сумма длин сторон.</li>
  <li>Площадь треугольника: S = a·h ÷ 2.</li>
</ul>
<div class="ex">Если два угла равны 50° и 60°, то третий угол равен 70°, потому что 180 − 110 = 70.</div>`,
        par: `<h3>Параллельные прямые</h3>
<p>Если две прямые не пересекаются, их называют <b>параллельными</b>. При пересечении секущей появляются связанные углы.</p>
<div class="fm">Накрест лежащие углы равны
Соответственные углы равны
Сумма внутренних односторонних = 180°</div>
<ul>
  <li>По углам можно доказать, что прямые параллельны.</li>
  <li>Если соответствующие углы равны, прямые параллельны.</li>
  <li>Если сумма внутренних односторонних 180°, прямые тоже параллельны.</li>
</ul>
<div class="ex">Если один из соответствующих углов равен 65°, то и второй соответствующий угол тоже 65°.</div>`,
        angles: `<h3>Углы и признаки равенства</h3>
<p>В геометрии важно узнавать вертикальные, смежные и равные углы, а также использовать признаки равенства треугольников.</p>
<div class="fm">Вертикальные углы равны
Смежные углы в сумме 180°
1-й признак: по двум сторонам и углу между ними
2-й признак: по стороне и двум прилежащим углам
3-й признак: по трём сторонам</div>
<ul>
  <li>Если треугольники равны, то равны и соответствующие элементы.</li>
  <li>Смежные углы всегда образуют развернутый угол.</li>
  <li>Вертикальные углы образуются при пересечении двух прямых.</li>
</ul>
<div class="ex">Если один из смежных углов 130°, второй равен 50°.</div>`,
      },
      phy: {
        mech: `<h3>Механика</h3>
<p>Механика изучает движение тел. В 7 классе главное — понимать связь между скоростью, временем и расстоянием.</p>
<div class="fm">Путь: s
Время: t
Скорость: v
Формулы: s = v·t, v = s/t, t = s/v</div>
<ul>
  <li>Скорость показывает, какой путь тело проходит за единицу времени.</li>
  <li>Нужно следить за единицами измерения: м/с, км/ч, с, ч, м, км.</li>
  <li>Перед вычислением удобно перевести всё в одинаковые единицы.</li>
</ul>
<div class="ex">Если велосипедист ехал 2 часа со скоростью 12 км/ч, он прошёл 24 км.</div>`,
        work: `<h3>Работа и энергия</h3>
<p>Работа совершается, когда сила перемещает тело. Мощность показывает, как быстро совершается работа.</p>
<div class="fm">Работа: A = F·s
Мощность: N = A/t
Энергия — способность совершать работу</div>
<ul>
  <li>Если путь равен нулю, механическая работа не совершается.</li>
  <li>Мощность измеряют в ваттах.</li>
  <li>Кинетическая энергия связана с движением тела.</li>
</ul>
<div class="ex">Если сила 10 Н переместила тело на 3 м, работа равна 30 Дж.</div>`,
        press: `<h3>Давление</h3>
<p><b>Давление</b> показывает, как сила действует на единицу площади.</p>
<div class="fm">p = F / S
Чем больше сила — тем больше давление
Чем больше площадь — тем меньше давление</div>
<ul>
  <li>Острая кнопка давит сильнее, чем тупая, потому что площадь меньше.</li>
  <li>В жидкостях давление передаётся во все стороны.</li>
  <li>С глубиной давление в жидкости растёт.</li>
</ul>
<div class="ex">Лыжи уменьшают давление на снег, потому что увеличивают площадь опоры.</div>`,
      },
      rus: {
        part: `<h3>Причастие и деепричастие</h3>
<p><b>Причастие</b> обозначает признак по действию, а <b>деепричастие</b> — добавочное действие при основном.</p>
<div class="fm">Причастие: читающий, написанный
Деепричастие: читая, написав
Причастный оборот отвечает на вопрос какой?
Деепричастный оборот — что делая? что сделав?</div>
<ul>
  <li>Причастный оборот часто обособляется запятыми.</li>
  <li>Деепричастный оборот почти всегда выделяется запятыми.</li>
  <li>У деепричастия и сказуемого должен быть один исполнитель действия.</li>
</ul>
<div class="ex">Мальчик, <i>читающий книгу</i>, не слышал звонка. <i>Улыбаясь</i>, он вошёл в класс.</div>`,
        adv: `<h3>Наречие</h3>
<p><b>Наречие</b> обозначает признак действия или другого признака. Обычно отвечает на вопросы <b>как?</b>, <b>где?</b>, <b>когда?</b>.</p>
<div class="fm">быстро, громко, справа, вчера
Степени сравнения: быстро — быстрее — быстрее всего</div>
<ul>
  <li>Наречие чаще всего относится к глаголу.</li>
  <li>Некоторые наречия образуют степени сравнения.</li>
  <li>Важно отличать наречие от краткого прилагательного по роли в предложении.</li>
</ul>
<div class="ex">В предложении <i>Птица летит высоко</i> слово <i>высоко</i> — наречие.</div>`,
        not: `<h3>НЕ с частями речи</h3>
<p>Правописание <b>не</b> зависит от того, с какой частью речи оно стоит и можно ли употребить слово без <b>не</b>.</p>
<div class="fm">не был — раздельно
негодовать — слитно
неправда — можно заменить словом ложь
не высокий, а низкий — раздельно</div>
<ul>
  <li>С глаголами не обычно пишется раздельно.</li>
  <li>Если слово без не не употребляется, пишем слитно.</li>
  <li>При противопоставлении с союзом <b>а</b> обычно пишем раздельно.</li>
</ul>
<div class="ex">Нелёгкий путь = трудный путь, поэтому слитно. Не лёгкий, а тяжёлый — раздельно.</div>`,
      },
      his: {
        nt: `<h3>Новое время</h3>
<p>Новое время связано с Великими географическими открытиями, Реформацией, развитием науки и промышленности.</p>
<div class="fm">Колумб, Магеллан, Васко да Гама
Реформация
Просвещение
Научная революция</div>
<ul>
  <li>Европейцы открывали новые морские пути и материки.</li>
  <li>Менялись взгляды на человека, государство и науку.</li>
  <li>Появлялись новые технологии и формы хозяйства.</li>
</ul>
<div class="ex">Если вопрос о путешествиях через океан и новых путях в Индию, это тема Нового времени.</div>`,
        r17: `<h3>Россия XVII—XVIII вв.</h3>
<p>Это время Смуты, первых Романовых и крупных перемен в жизни государства.</p>
<div class="fm">Смута — начало XVII века
Романовы — новая династия
Расширение территории
Изменения в армии и управлении</div>
<ul>
  <li>После Смуты государство постепенно укреплялось.</li>
  <li>Менялась система управления и войска.</li>
  <li>Россия активнее включалась в европейскую политику.</li>
</ul>
<div class="ex">Если в вопросе упоминаются Смута, Земский собор или первые Романовы, это эта тема.</div>`,
        peter: `<h3>Пётр I и реформы</h3>
<p>Пётр I проводил масштабные реформы, чтобы сделать Россию сильнее и современнее.</p>
<div class="fm">Регулярная армия и флот
Сенат и коллегии
Санкт-Петербург
Табель о рангах
Победа в Северной войне</div>
<ul>
  <li>Реформы затронули армию, государственное управление, образование и быт.</li>
  <li>Россия получила выход к Балтийскому морю.</li>
  <li>Санкт-Петербург стал новой столицей.</li>
</ul>
<div class="ex">Если вопрос о кораблях, Балтике и Табели о рангах, правильный ответ почти всегда связан с Петром I.</div>`,
      }
    }
  };

  const current = patches[String(window.GRADE_NUM || '')];
  if (!current) return;
  Object.keys(current).forEach(subjectId => {
    const topics = current[subjectId] || {};
    Object.keys(topics).forEach(topicId => setTheory(subjectId, topicId, topics[topicId]));
  });
})();

;
/* --- wave19_mesh_8911.js --- */

(function(){
  if(typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  var grade = String(window.GRADE_NUM || '');
  var PACK = {"8": [{"id": "chem", "after": "phy", "nm": "Химия", "ic": "⚗️", "cl": "#16a34a", "bg": "#dcfce7", "tops": [{"id": "atom", "nm": "Атом и вещество", "dot": "#16a34a", "fm": "Атом → молекула → вещество<br>Элемент = один вид атомов", "summary": "Тема учит различать частицы, элементы и вещества, с которых начинается школьная химия.", "ex": "Сначала узнаём частицы и обозначения, потом понимаем, из чего состоят простые и сложные вещества.", "facts": [["атом", "наименьшая электронейтральная частица химического элемента"], ["молекула", "частица вещества, которая сохраняет его химические свойства"], ["химический элемент", "совокупность атомов одного вида"], ["простое вещество", "вещество, состоящее из атомов одного элемента"], ["сложное вещество", "вещество, состоящее из атомов разных элементов"]]}, {"id": "classes", "nm": "Классы веществ", "dot": "#0d9488", "fm": "Оксиды · кислоты · основания · соли", "summary": "В 8 классе важно научиться узнавать основные классы неорганических веществ по составу и свойствам.", "ex": "Если вещество содержит кислород и два элемента, это часто оксид; если есть металл и кислотный остаток — соль.", "facts": [["оксид", "соединение двух элементов, один из которых кислород"], ["кислота", "вещество, содержащее водород и кислотный остаток"], ["основание", "вещество, состоящее из металла и гидроксогруппы"], ["соль", "соединение металла и кислотного остатка"], ["индикатор", "вещество, меняющее цвет в кислотной или щелочной среде"]]}, {"id": "react", "nm": "Химические реакции", "dot": "#2563eb", "fm": "Реагенты → продукты<br>Коэффициенты уравнивают атомы", "summary": "Здесь ученик понимает, как записывают химические реакции и зачем нужны коэффициенты.", "ex": "В уравнении число атомов каждого элемента слева и справа должно совпадать.", "facts": [["химическая реакция", "превращение одних веществ в другие"], ["реагенты", "исходные вещества до начала реакции"], ["продукты реакции", "вещества, которые образуются после реакции"], ["коэффициент", "число перед формулой, показывающее количество частиц в уравнении"], ["закон сохранения массы", "правило, по которому масса веществ до и после реакции сохраняется"]]}]}, {"id": "bio", "after": "chem", "nm": "Биология", "ic": "🧬", "cl": "#0d9488", "bg": "#ccfbf1", "tops": [{"id": "anat", "nm": "Анатомия человека", "dot": "#0d9488", "fm": "Органы → системы органов<br>Скелет + мышцы = опора и движение", "summary": "Тема знакомит с устройством тела человека и работой основных систем органов.", "ex": "Важно различать отдельный орган и целую систему органов, которая выполняет большую функцию.", "facts": [["скелет", "совокупность костей, образующих опору тела"], ["мышцы", "органы, обеспечивающие движение тела"], ["сустав", "подвижное соединение костей"], ["осанка", "привычное положение тела человека"], ["система органов", "группа органов, работающих вместе"]]}, {"id": "blood", "nm": "Кровь и дыхание", "dot": "#dc2626", "fm": "Сердце качает кровь<br>Артерии несут кровь от сердца", "summary": "Здесь ученик повторяет кровообращение, состав крови и связь кровеносной и дыхательной систем.", "ex": "Кислород попадает в кровь в лёгких, а сердце разносит его по телу.", "facts": [["сердце", "мышечный орган, который перекачивает кровь"], ["артерии", "сосуды, по которым кровь течёт от сердца"], ["вены", "сосуды, по которым кровь возвращается к сердцу"], ["капилляры", "самые тонкие сосуды, где идёт обмен веществ"], ["гемоглобин", "вещество в эритроцитах, переносящее кислород"]]}, {"id": "nerv", "nm": "Нервная система", "dot": "#7c3aed", "fm": "Рецептор → нерв → мозг → ответ", "summary": "Тема объясняет, как нервная система получает сигналы и управляет реакциями организма.", "ex": "Рефлекс — это быстрый ответ организма на раздражитель при участии нервной системы.", "facts": [["нейрон", "нервная клетка, передающая сигналы"], ["рефлекс", "ответ организма на раздражение при участии нервной системы"], ["головной мозг", "главный отдел центральной нервной системы"], ["спинной мозг", "отдел ЦНС, связывающий мозг и органы"], ["рецептор", "структура, воспринимающая раздражение"]]}]}, {"id": "geog", "after": "his", "nm": "География", "ic": "🗺️", "cl": "#0284c7", "bg": "#e0f2fe", "tops": [{"id": "russia8", "nm": "Россия: положение и рельеф", "dot": "#0284c7", "fm": "Россия — крупнейшая страна мира<br>Рельеф: равнины и горы", "summary": "Тема помогает понять географическое положение России и основные формы её рельефа.", "ex": "Для 8 класса важно знать, где расположены главные равнины, горы и границы страны.", "facts": [["географическое положение", "положение территории относительно океанов, соседей и материков"], ["Восточно-Европейская равнина", "крупная равнинная территория европейской части России"], ["Урал", "горная система, разделяющая Европу и Азию"], ["Кавказ", "горная область на юге России"], ["рельеф", "совокупность неровностей земной поверхности"]]}, {"id": "climate8", "nm": "Климат и природные зоны", "dot": "#16a34a", "fm": "Климат зависит от широты и океанов<br>Зоны: тундра → тайга → степь", "summary": "Тема связывает климат России с её природными зонами и разнообразием ландшафтов.", "ex": "Чем севернее территория, тем холоднее климат и беднее растительность.", "facts": [["климат", "многолетний режим погоды на данной территории"], ["тундра", "природная зона с мхами, лишайниками и вечной мерзлотой"], ["тайга", "зона хвойных лесов"], ["степь", "зона травянистой растительности и засушливого климата"], ["континентальный климат", "климат с холодной зимой и тёплым летом вдали от океана"]]}, {"id": "water8", "nm": "Внутренние воды России", "dot": "#0d9488", "fm": "Реки · озёра · болота · подземные воды", "summary": "Здесь ученик повторяет главные реки и озёра России и понимает значение внутренних вод.", "ex": "Реки важны для транспорта, энергии, сельского хозяйства и водоснабжения.", "facts": [["Волга", "крупнейшая река европейской части России"], ["Байкал", "самое глубокое озеро мира"], ["Енисей", "одна из крупнейших рек Сибири"], ["подземные воды", "воды, находящиеся в толще горных пород"], ["бассейн реки", "территория, с которой река собирает воды"]]}]}, {"id": "lit", "after": "geog", "nm": "Литература", "ic": "📚", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "lit18", "nm": "Литература XVIII–XIX вв.", "dot": "#9333ea", "fm": "Классицизм · сентиментализм · романтизм", "summary": "Тема вводит в литературные направления XVIII–XIX веков и ключевые имена эпохи.", "ex": "Важно различать направление и автора: Фонвизин — классицизм, Жуковский — романтизм.", "facts": [["классицизм", "направление, ценившее порядок, разум и строгие правила"], ["сентиментализм", "направление, уделявшее внимание чувствам человека"], ["романтизм", "направление, в центре которого сильная личность и мечта о свободе"], ["Фонвизин", "автор комедии «Недоросль»"], ["Жуковский", "поэт, связанный с романтизмом и жанром баллады"]]}, {"id": "pushkin8", "nm": "Пушкин", "dot": "#2563eb", "fm": "«Капитанская дочка» · честь · долг", "summary": "Тема посвящена Пушкину как прозаику и поэту, особенно «Капитанской дочке».", "ex": "Для Пушкина важны темы чести, долга, выбора и исторической памяти.", "facts": [["«Капитанская дочка»", "историческая повесть Пушкина о времени Пугачёва"], ["Пётр Гринёв", "главный герой «Капитанской дочки»"], ["Пугачёв", "предводитель крестьянского восстания в повести"], ["честь", "одна из главных нравственных ценностей в мире Пушкина"], ["историческая повесть", "жанр, соединяющий художественный сюжет и реальные события прошлого"]]}, {"id": "lermontov8", "nm": "Лермонтов", "dot": "#dc2626", "fm": "«Мцыри» · свобода · романтический герой", "summary": "Тема раскрывает романтический мир Лермонтова и поэму «Мцыри».", "ex": "Герой Лермонтова часто одинок, стремится к свободе и спорит с судьбой.", "facts": [["«Мцыри»", "романтическая поэма Лермонтова о стремлении к свободе"], ["Мцыри", "герой поэмы, мечтающий вернуться на родину"], ["романтический герой", "герой-одиночка с сильным внутренним конфликтом"], ["исповедь", "форма рассказа о собственных переживаниях от первого лица"], ["свобода", "ключевая тема творчества Лермонтова"]]}]}], "9": [{"id": "chem", "after": "phy", "nm": "Химия", "ic": "⚗️", "cl": "#16a34a", "bg": "#dcfce7", "tops": [{"id": "metals", "nm": "Металлы", "dot": "#16a34a", "fm": "Металлы проводят ток и тепло<br>Ряд активности показывает реакционность", "summary": "Тема знакомит со свойствами металлов, их активностью и применением.", "ex": "Активные металлы легче вступают в реакции и вытесняют менее активные из растворов.", "facts": [["металлы", "вещества с металлическим блеском, хорошей теплопроводностью и электропроводностью"], ["ряд активности металлов", "последовательность металлов по способности вступать в реакции"], ["коррозия", "разрушение металлов под действием окружающей среды"], ["сплав", "смесь металла с другими веществами, улучшающая свойства"], ["вытеснение металла", "реакция, в которой более активный металл вытесняет менее активный из соли"]]}, {"id": "nonmet", "nm": "Неметаллы", "dot": "#0d9488", "fm": "Неметаллы: O₂, N₂, Cl₂ и др.", "summary": "Тема помогает различать неметаллы, их свойства и важные соединения.", "ex": "Неметаллы часто образуют кислотные оксиды и встречаются в газообразном состоянии.", "facts": [["неметаллы", "элементы, обычно не обладающие металлическим блеском и высокой проводимостью"], ["галогены", "активные неметаллы 17 группы периодической системы"], ["кислород", "неметалл, необходимый для дыхания и горения"], ["азот", "основной компонент воздуха"], ["аммиак", "соединение азота и водорода с резким запахом"]]}, {"id": "org", "nm": "Органические вещества", "dot": "#2563eb", "fm": "Углеводороды — соединения углерода и водорода", "summary": "Это первое знакомство с органической химией и углеводородами.", "ex": "Простейшие органические вещества строятся вокруг атомов углерода.", "facts": [["органическая химия", "раздел химии, изучающий соединения углерода"], ["углеводороды", "соединения, состоящие из углерода и водорода"], ["метан", "простейший углеводород с формулой CH₄"], ["гомологический ряд", "ряд веществ с похожими свойствами и общей формулой"], ["горение", "реакция окисления, сопровождающаяся выделением тепла"]]}]}, {"id": "bio", "after": "chem", "nm": "Биология", "ic": "🧬", "cl": "#0d9488", "bg": "#ccfbf1", "tops": [{"id": "genetics", "nm": "Генетика", "dot": "#7c3aed", "fm": "Ген → признак<br>Доминантный / рецессивный", "summary": "Тема вводит основные понятия генетики и наследования признаков.", "ex": "Ученик учится различать ген, аллель, генотип и фенотип.", "facts": [["ген", "участок ДНК, отвечающий за наследственный признак"], ["аллель", "одна из форм одного и того же гена"], ["доминантный признак", "признак, проявляющийся при наличии хотя бы одного соответствующего аллеля"], ["рецессивный признак", "признак, проявляющийся только в паре одинаковых аллелей"], ["генотип", "совокупность генов организма"]]}, {"id": "evolution", "nm": "Эволюция", "dot": "#16a34a", "fm": "Изменчивость + отбор = эволюция", "summary": "Тема объясняет, как виды меняются и почему появляются приспособления.", "ex": "Главная идея — выживают и оставляют потомство лучше приспособленные организмы.", "facts": [["эволюция", "историческое развитие живой природы"], ["естественный отбор", "сохранение и размножение более приспособленных организмов"], ["адаптация", "приспособление организма к условиям среды"], ["вид", "группа сходных организмов, способных давать плодовитое потомство"], ["Дарвин", "учёный, разработавший учение о естественном отборе"]]}, {"id": "ecology", "nm": "Экология", "dot": "#0284c7", "fm": "Организм → популяция → экосистема", "summary": "Тема раскрывает связи организмов между собой и с окружающей средой.", "ex": "Экология нужна, чтобы понимать пищевые цепи, круговороты и влияние человека на природу.", "facts": [["экосистема", "сообщество организмов вместе с условиями среды"], ["производители", "организмы, создающие органические вещества из неорганических"], ["потребители", "организмы, питающиеся готовыми органическими веществами"], ["разрушители", "организмы, разлагающие остатки живых существ"], ["биосфера", "оболочка Земли, где существует жизнь"]]}]}, {"id": "geog", "after": "his", "nm": "География", "ic": "🗺️", "cl": "#0284c7", "bg": "#e0f2fe", "tops": [{"id": "pop9", "nm": "Население России", "dot": "#0284c7", "fm": "Численность · миграции · урбанизация", "summary": "Тема учит анализировать размещение населения России и его движение.", "ex": "Важно различать естественный прирост, миграцию и урбанизацию.", "facts": [["урбанизация", "рост доли городского населения и роли городов"], ["миграция", "перемещение людей из одного места в другое"], ["плотность населения", "число жителей на единицу площади"], ["агломерация", "скопление близко расположенных городов вокруг крупного центра"], ["естественный прирост", "разность между рождаемостью и смертностью"]]}, {"id": "econ9", "nm": "Хозяйство России", "dot": "#16a34a", "fm": "Промышленность · сельское хозяйство · транспорт", "summary": "Тема показывает, как устроено хозяйство России и от чего зависит размещение отраслей.", "ex": "На размещение производства влияют сырьё, транспорт, энергия и трудовые ресурсы.", "facts": [["промышленность", "отрасль хозяйства, где из сырья получают готовую продукцию"], ["топливно-энергетический комплекс", "совокупность отраслей, связанных с добычей топлива и производством энергии"], ["специализация района", "преобладание определённых отраслей в хозяйстве территории"], ["транспорт", "отрасль хозяйства, обеспечивающая перевозку людей и грузов"], ["сельское хозяйство", "отрасль, производящая продукцию растениеводства и животноводства"]]}, {"id": "regions9", "nm": "Экономические районы", "dot": "#0d9488", "fm": "Центр · Урал · Сибирь · Поволжье", "summary": "Тема помогает различать экономические районы России и их специализацию.", "ex": "Каждый район выделяют по хозяйственным связям, ресурсам и историческому развитию.", "facts": [["Центральный район", "район с высокой концентрацией населения и промышленности вокруг Москвы"], ["Урал", "район, известный металлургией и машиностроением"], ["Сибирь", "крупный район с богатыми природными ресурсами"], ["Поволжье", "район, развитие которого тесно связано с Волгой"], ["Северный Кавказ", "район с развитым сельским хозяйством и рекреацией"]]}]}, {"id": "lit", "after": "geog", "nm": "Литература", "ic": "📚", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "slovo9", "nm": "«Слово о полку Игореве»", "dot": "#9333ea", "fm": "Памятник древнерусской литературы", "summary": "Тема посвящена одному из главных памятников древнерусской словесности.", "ex": "Важно помнить образ Русской земли и плач Ярославны как ключевые элементы произведения.", "facts": [["«Слово о полку Игореве»", "памятник древнерусской литературы о походе князя Игоря"], ["князь Игорь", "герой произведения, отправившийся в поход против половцев"], ["Ярославна", "героиня произведения, известная своим плачем"], ["древнерусская литература", "литература Древней Руси, тесно связанная с историей и летописями"], ["Русская земля", "образ родины, объединяющий героев произведения"]]}, {"id": "gribo9", "nm": "Грибоедов и «Горе от ума»", "dot": "#2563eb", "fm": "Чацкий ↔ фамусовское общество", "summary": "Тема разбирает конфликт комедии Грибоедова и её крылатые выражения.", "ex": "Главный конфликт — столкновение свободной мысли Чацкого с консервативным обществом.", "facts": [["Чацкий", "главный герой комедии «Горе от ума»"], ["Фамусовское общество", "мир консервативных взглядов и чиновного порядка"], ["комедия", "драматический жанр, в котором через смешное раскрываются серьёзные проблемы"], ["афоризм", "меткое и легко запоминающееся выражение"], ["«Горе от ума»", "комедия Грибоедова о конфликте личности и общества"]]}, {"id": "authors9", "nm": "Пушкин, Лермонтов, Гоголь", "dot": "#dc2626", "fm": "Онегин · Печорин · Чичиков", "summary": "Тема объединяет ключевых авторов 9 класса и их главных героев.", "ex": "Нужно различать героя, произведение и центральный конфликт.", "facts": [["Евгений Онегин", "герой романа Пушкина в стихах"], ["Печорин", "герой романа Лермонтова «Герой нашего времени»"], ["Чичиков", "герой поэмы Гоголя «Мёртвые души»"], ["роман в стихах", "жанр, в котором сюжет романа написан стихами"], ["маленький человек", "литературный тип героя, уязвимого перед обществом и системой"]]}]}], "11": [{"id": "prob", "after": "alg", "nm": "Вероятность и статистика", "ic": "🎲", "cl": "#ea580c", "bg": "#ffedd5", "tops": [{"id": "rand11", "nm": "Случайные величины", "dot": "#ea580c", "fm": "Событие → вероятность → случайная величина", "summary": "Тема вводит базовые вероятностные понятия, нужные для задач ЕГЭ и статистики.", "ex": "Главное — понимать связь между экспериментом, событием и вероятностью.", "facts": [["вероятность", "числовая мера возможности наступления события"], ["случайное событие", "событие, которое может произойти или не произойти"], ["достоверное событие", "событие, которое обязательно произойдёт"], ["невозможное событие", "событие, которое не может произойти"], ["независимые события", "события, наступление одного из которых не влияет на другое"]]}, {"id": "stat11", "nm": "Статистика", "dot": "#f59e0b", "fm": "Среднее · медиана · мода", "summary": "Тема помогает читать и интерпретировать статистические данные.", "ex": "Для таблиц и диаграмм важно различать среднее арифметическое, медиану и моду.", "facts": [["среднее арифметическое", "сумма чисел, делённая на их количество"], ["медиана", "серединное значение упорядоченного набора данных"], ["мода", "значение, которое встречается чаще всего"], ["размах", "разность между наибольшим и наименьшим значением"], ["частота", "число повторений данного значения в наборе"]]}, {"id": "comb11", "nm": "Комбинаторика", "dot": "#fb923c", "fm": "Перестановки · сочетания · размещения", "summary": "Тема вводит базовые комбинаторные идеи, которые помогают считать число вариантов.", "ex": "Перед решением всегда спрашиваем: важен ли порядок и можно ли повторять элементы.", "facts": [["перестановка", "упорядочение всех элементов набора"], ["сочетание", "выбор нескольких элементов без учёта порядка"], ["размещение", "выбор нескольких элементов с учётом порядка"], ["факториал", "произведение натуральных чисел от 1 до n"], ["правило произведения", "способ найти число вариантов через перемножение независимых шагов"]]}]}, {"id": "chem", "after": "phy", "nm": "Химия", "ic": "⚗️", "cl": "#16a34a", "bg": "#dcfce7", "tops": [{"id": "genchem", "nm": "Общая химия", "dot": "#16a34a", "fm": "Скорость · равновесие · катализ", "summary": "Тема объединяет ключевые понятия общей химии, которые нужны для ЕГЭ и базовой картины мира.", "ex": "На скорость реакции влияют температура, концентрация, поверхность и катализаторы.", "facts": [["скорость реакции", "изменение количества вещества за единицу времени"], ["химическое равновесие", "состояние, при котором прямая и обратная реакции идут с одинаковой скоростью"], ["катализатор", "вещество, ускоряющее реакцию и не расходующееся полностью"], ["обратимая реакция", "реакция, которая может идти в двух направлениях"], ["принцип Ле Шателье", "правило смещения равновесия при изменении условий"]]}, {"id": "ovr", "nm": "ОВР, электролиз, гидролиз", "dot": "#0d9488", "fm": "Окисление ↔ восстановление", "summary": "Тема связывает окислительно-восстановительные процессы с растворами и электролизом.", "ex": "Важно научиться различать окислитель, восстановитель и изменение степеней окисления.", "facts": [["окисление", "процесс отдачи электронов или повышения степени окисления"], ["восстановление", "процесс присоединения электронов или понижения степени окисления"], ["окислитель", "частица, принимающая электроны"], ["электролиз", "разложение вещества под действием электрического тока"], ["гидролиз", "взаимодействие вещества с водой, приводящее к изменению среды раствора"]]}, {"id": "org11", "nm": "Органическая химия", "dot": "#2563eb", "fm": "Углеводороды → кислородсодержащие → азотсодержащие", "summary": "Тема систематизирует органические вещества и их важнейшие классы.", "ex": "Нужно различать спирты, альдегиды, кислоты, эфиры, амины и белки по составу и свойствам.", "facts": [["спирты", "органические вещества, содержащие гидроксогруппу"], ["альдегиды", "органические вещества с альдегидной группой"], ["карбоновые кислоты", "органические вещества с карбоксильной группой"], ["эфиры", "продукты взаимодействия кислоты и спирта"], ["амины", "органические производные аммиака"]]}]}, {"id": "bio", "after": "chem", "nm": "Биология", "ic": "🧬", "cl": "#0d9488", "bg": "#ccfbf1", "tops": [{"id": "cell11", "nm": "Клетка и молекулярная биология", "dot": "#0d9488", "fm": "ДНК → РНК → белок", "summary": "Тема объединяет клеточные структуры и реализацию наследственной информации.", "ex": "Для ЕГЭ особенно важна схема: репликация, транскрипция, трансляция.", "facts": [["ДНК", "молекула, хранящая наследственную информацию"], ["РНК", "молекула, участвующая в передаче и реализации наследственной информации"], ["генетический код", "система соответствия между триплетами нуклеотидов и аминокислотами"], ["митоз", "деление клетки, при котором образуются две одинаковые клетки"], ["мейоз", "деление клетки, при котором образуются гаметы с уменьшенным набором хромосом"]]}, {"id": "gen11", "nm": "Генетика", "dot": "#7c3aed", "fm": "Хромосомы · мутации · наследование", "summary": "Тема систематизирует законы наследственности и изменчивости.", "ex": "Нужно различать генные, хромосомные и геномные изменения.", "facts": [["хромосома", "структура клетки, содержащая ДНК и гены"], ["мутация", "устойчивое изменение наследственного материала"], ["кроссинговер", "обмен участками между гомологичными хромосомами"], ["геном", "полный набор наследственной информации организма"], ["наследственность", "свойство организмов передавать признаки потомкам"]]}, {"id": "eco11", "nm": "Эволюция и экология", "dot": "#16a34a", "fm": "Популяция · отбор · биосфера", "summary": "Тема объединяет эволюционные процессы и экологические закономерности.", "ex": "ЕГЭ часто проверяет, как изменяется популяция и как факторы среды влияют на живые системы.", "facts": [["популяция", "совокупность особей одного вида на общей территории"], ["экологический фактор", "любое условие среды, влияющее на организм"], ["биогеоценоз", "устойчивая природная система организмов и среды"], ["видообразование", "процесс образования новых видов"], ["естественный отбор", "механизм эволюции, сохраняющий более приспособленных особей"]]}]}, {"id": "geog", "after": "his", "nm": "География", "ic": "🗺️", "cl": "#0284c7", "bg": "#e0f2fe", "tops": [{"id": "regions11", "nm": "Страны и регионы мира", "dot": "#0284c7", "fm": "Европа · Азия · Америка · Африка", "summary": "Тема помогает ориентироваться в крупных регионах мира и их особенностях.", "ex": "Нужно связывать регион, страну, уровень развития и хозяйственную специализацию.", "facts": [["Европейский союз", "объединение европейских государств с тесной экономической и политической интеграцией"], ["БРИКС", "объединение крупных развивающихся стран"], ["Северная Америка", "регион мира, где ведущую роль играют США и Канада"], ["АТР", "Азиатско-Тихоокеанский регион, важный центр мировой экономики"], ["развивающиеся страны", "страны с более низким уровнем экономического развития по сравнению с постиндустриальными"]]}, {"id": "worldecon11", "nm": "Мировое хозяйство", "dot": "#16a34a", "fm": "МРТ · глобализация · ТНК", "summary": "Тема показывает, как устроена мировая экономика и почему страны специализируются по-разному.", "ex": "Главные ключи темы — международное разделение труда, глобализация и роль ТНК.", "facts": [["мировое хозяйство", "совокупность национальных хозяйств, связанных международными отношениями"], ["международное разделение труда", "специализация стран на производстве определённых товаров и услуг"], ["глобализация", "усиление взаимосвязей между странами мира"], ["ТНК", "транснациональная корпорация, работающая в нескольких странах"], ["постиндустриальная экономика", "экономика, где ведущую роль играют услуги и высокие технологии"]]}, {"id": "global11", "nm": "Глобальные проблемы", "dot": "#dc2626", "fm": "Экология · ресурсы · демография", "summary": "Тема посвящена вызовам, которые затрагивают всё человечество.", "ex": "Глобальные проблемы нельзя решить силами одной страны — нужно международное сотрудничество.", "facts": [["глобальные проблемы", "проблемы, затрагивающие всё человечество"], ["демографическая проблема", "проблема, связанная с ростом или сокращением населения и его структурой"], ["устойчивое развитие", "развитие без разрушения природной основы жизни будущих поколений"], ["опустынивание", "процесс превращения земель в пустынные и малопродуктивные"], ["изменение климата", "долговременное изменение климатических условий на планете"]]}]}, {"id": "lit", "after": "geog", "nm": "Литература", "ic": "📚", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "silver11", "nm": "Серебряный век", "dot": "#9333ea", "fm": "Символизм · акмеизм · футуризм", "summary": "Тема знакомит с поэзией Серебряного века и её художественными направлениями.", "ex": "Важно различать направления и ключевых авторов: Блок, Ахматова, Маяковский.", "facts": [["Серебряный век", "период расцвета русской поэзии конца XIX — начала XX века"], ["символизм", "направление, строящее образ через символ и многозначность"], ["акмеизм", "направление, ценящее ясность и предметность слова"], ["футуризм", "авангардное направление, ориентированное на разрыв с традицией"], ["Блок", "поэт Серебряного века, связанный с символизмом"]]}, {"id": "prose11", "nm": "Проза XX века", "dot": "#2563eb", "fm": "Булгаков · Шолохов · Солженицын", "summary": "Тема охватывает важнейших прозаиков XX века и их круг проблем.", "ex": "XX век в прозе — это человек перед историей, войной, системой и нравственным выбором.", "facts": [["Булгаков", "автор романа «Мастер и Маргарита»"], ["Шолохов", "автор эпопеи «Тихий Дон»"], ["Солженицын", "писатель, осмысливавший опыт репрессий и лагерей"], ["эпопея", "крупное произведение, охватывающее широкую историческую картину"], ["нравственный выбор", "одна из главных проблем прозы XX века"]]}, {"id": "poetry11", "nm": "Поэзия XX века", "dot": "#dc2626", "fm": "Есенин · Твардовский · Пастернак", "summary": "Тема помогает различать интонации и проблемы поэзии XX века.", "ex": "Для поэзии XX века важны темы Родины, памяти, времени, человека и истории.", "facts": [["Есенин", "поэт, в лирике которого важны природа, Родина и народная речь"], ["Твардовский", "поэт, писавший о войне, памяти и судьбе народа"], ["Пастернак", "поэт и прозаик, соединявший философскую и личную интонацию"], ["лирический герой", "образ человека, чьи чувства и мысли раскрываются в стихотворении"], ["гражданская лирика", "поэзия, обращённая к общественным и историческим вопросам"]]}]}]};
  if(!PACK[grade]) return;

  function rand(arr){ return arr[(Math.random()*arr.length)|0]; }
  function shuffleLocal(arr){
    var out = arr.slice();
    for(var i=out.length-1;i>0;i--){
      var j = (Math.random()*(i+1))|0;
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function ensureSubject(afterId, subject){
    if(SUBJ.some(function(s){ return s.id === subject.id; })) return;
    var idx = SUBJ.findIndex(function(s){ return s.id === afterId; });
    if(idx >= 0) SUBJ.splice(idx + 1, 0, subject); else SUBJ.push(subject);
  }
  function makeTheory(topic){
    return '<h3>'+topic.nm+'</h3>'+
      '<div class="fm">'+topic.fm+'</div>'+
      '<p>'+topic.summary+'</p>'+
      '<div class="ex"><b>Опора:</b> '+topic.ex+'</div>';
  }
  function takeThree(arr){
    var pool = arr.slice();
    var out = [];
    while(pool.length && out.length < 3){
      var idx = (Math.random()*pool.length)|0;
      out.push(pool.splice(idx,1)[0]);
    }
    return out;
  }
  function pickTerms(facts, correct){
    var pool = facts.map(function(f){ return f[0]; }).filter(function(x){ return x !== correct; });
    return shuffleLocal([correct].concat(takeThree(pool)));
  }
  function pickDefs(facts, correct){
    var pool = facts.map(function(f){ return f[1]; }).filter(function(x){ return x !== correct; });
    return shuffleLocal([correct].concat(takeThree(pool)));
  }
  function makeGen(topic, color, bg){
    return function(){
      var facts = topic.facts || [];
      var fact = rand(facts);
      var mode = (Math.random()*3)|0;
      if(mode === 0){
        return mkQ('Выбери термин: ' + fact[1], fact[0], pickTerms(facts, fact[0]), fact[1], topic.nm, color, bg);
      }
      if(mode === 1){
        return mkQ('Что верно про «' + fact[0] + '»?', fact[1], pickDefs(facts, fact[1]), fact[1], topic.nm, color, bg);
      }
      return mkQ('Какое понятие подходит к описанию: ' + fact[1], fact[0], pickTerms(facts, fact[0]), fact[1], topic.nm, color, bg);
    };
  }

  PACK[grade].forEach(function(subject){
    var built = {
      id: subject.id,
      nm: subject.nm,
      ic: subject.ic,
      date: '',
      cl: subject.cl,
      bg: subject.bg,
      tops: subject.tops.map(function(topic){
        return {
          id: topic.id,
          nm: topic.nm,
          gen: makeGen(topic, subject.cl, subject.bg),
          th: makeTheory(topic),
          dot: topic.dot || subject.cl,
          _coverageBoosted: true,
          _coverageExtraCount: (topic.facts || []).length,
          _coverageSources: ['wave19']
        };
      })
    };
    ensureSubject(subject.after, built);
  });
})();

;
/* --- wave20_mesh_567primary.js --- */

(function(){
  if(typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
  var grade = String(window.GRADE_NUM || '');
  var DATA = {"1": {"subjects": [{"id": "read", "after": "rus", "nm": "Литературное чтение", "ic": "📖", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "fairy1", "nm": "Сказки", "dot": "#9333ea", "fm": "Сказка · герой · добро и зло", "summary": "В литературном чтении 1 класса ребёнок учится узнавать сказку, её героев и чудеса.", "ex": "Если в тексте есть волшебство, повторяющиеся события и победа добра, это часто сказка.", "facts": [["сказка", "история с чудесами и волшебными героями"], ["герой", "главный персонаж произведения"], ["волшебство", "чудесное событие, которого не бывает в обычной жизни"], ["добро", "то, что помогает и побеждает зло"], ["зачин", "начало сказки, например «Жили-были...»"]]}, {"id": "poem1", "nm": "Стихи", "dot": "#2563eb", "fm": "Стихотворение · строка · рифма", "summary": "Тема знакомит с тем, как устроены детские стихи и почему их легко запоминать.", "ex": "Стихотворение записывают строками. Если окончания строк похожи по звучанию, это рифма.", "facts": [["стихотворение", "текст, записанный строками с ритмом"], ["строка", "одна запись в стихотворении"], ["рифма", "похожие по звучанию окончания строк"], ["поэт", "человек, который пишет стихи"], ["настроение", "чувство, которое передаёт стихотворение"]]}, {"id": "riddle1", "nm": "Загадки и потешки", "dot": "#16a34a", "fm": "Загадка · ответ · игра слов", "summary": "Тема знакомит с короткими народными текстами, в которых нужно догадаться о предмете или явлении.", "ex": "В загадке предмет не называют прямо, а описывают его признаки. Потешка помогает играть, запоминать и чувствовать ритм речи.", "facts": [["загадка", "короткий текст, в котором предмет нужно отгадать по признакам"], ["отгадка", "правильный ответ на загадку"], ["потешка", "короткий весёлый народный стишок для игры и речи"], ["игра слов", "необычное употребление слов, которое делает текст интереснее"], ["народное творчество", "произведения, созданные и передаваемые народом"]]}]}], "extend": [{"subjectId": "world", "topics": [{"id": "safe1", "nm": "Безопасность", "dot": "#dc2626", "fm": "Светофор · переход · номер 112", "summary": "Ребёнок запоминает простые правила безопасного поведения дома, в школе и на дороге.", "ex": "Красный свет запрещает идти, а при опасности взрослым помогают службы по номеру 112.", "facts": [["светофор", "прибор с красным, жёлтым и зелёным сигналами"], ["пешеходный переход", "место, где дорогу переходят безопасно"], ["112", "единый номер экстренной помощи"], ["незнакомец", "человек, которого ты не знаешь"], ["правила безопасности", "действия, которые помогают избежать беды"]]}, {"id": "family1", "nm": "Семья и школа", "dot": "#f59e0b", "fm": "Семья · школа · обязанности", "summary": "Тема учит видеть связь семьи, школы и личной ответственности ребёнка.", "ex": "Дома и в школе у каждого есть свои обязанности: учиться, помогать, соблюдать правила.", "facts": [["семья", "близкие люди, которые заботятся друг о друге"], ["школа", "место, где дети учатся"], ["учитель", "человек, который учит"], ["одноклассники", "дети, которые учатся в одном классе"], ["обязанность", "то, что нужно выполнять"]]}]}]}, "2": {"subjects": [{"id": "read", "after": "rus", "nm": "Литературное чтение", "ic": "📖", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "nature2", "nm": "Рассказы о природе", "dot": "#16a34a", "fm": "Герой · природа · настроение", "summary": "Дети учатся замечать, как писатель описывает животных, растения и времена года.", "ex": "В рассказах о природе важно видеть, какие чувства вызывает лес, река, птицы и погода.", "facts": [["рассказ", "небольшое произведение о событии или героях"], ["природа", "всё живое и неживое вокруг нас"], ["описание", "слова, которые помогают представить картину"], ["автор", "человек, который написал текст"], ["настроение", "чувство, которое передаёт произведение"]]}, {"id": "folk2", "nm": "Народные сказки", "dot": "#2563eb", "fm": "Народ · мудрость · повторы", "summary": "Тема знакомит с народными сказками и их особыми признаками.", "ex": "У народной сказки нет одного автора: её создавал и передавал народ.", "facts": [["народная сказка", "сказка, созданная народом, а не одним автором"], ["повтор", "одинаковое действие или слова, которые встречаются несколько раз"], ["мудрость", "умный жизненный смысл произведения"], ["помощник", "герой или предмет, который помогает главному персонажу"], ["финал", "конец произведения"]]}, {"id": "poem2", "nm": "Стихи о детстве", "dot": "#dc2626", "fm": "Ритм · чувства · образ", "summary": "Тема учит находить в стихах настроение, ритм и образы, близкие ребёнку.", "ex": "В детских стихах важно замечать, что чувствует герой и какие картины создаёт поэт.", "facts": [["ритм", "ровное повторение ударений и пауз в стихотворении"], ["образ", "картина или представление, которое создают слова"], ["чувства героя", "то, что переживает персонаж или лирический герой"], ["строфа", "несколько строк, объединённых в группу"], ["выразительное чтение", "чтение с правильными паузами и интонацией"]]}]}], "extend": [{"subjectId": "world", "topics": [{"id": "water2", "nm": "Вода и её свойства", "dot": "#0284c7", "fm": "Лёд · вода · пар", "summary": "Тема показывает, как вода меняется и почему она нужна всему живому.", "ex": "Вода может быть жидкой, твёрдой и газообразной. Без воды не могут жить люди, животные и растения.", "facts": [["вода", "жидкость, необходимая для жизни"], ["лёд", "твёрдое состояние воды"], ["пар", "газообразное состояние воды"], ["круговорот воды", "путь воды от поверхности Земли в облака и обратно"], ["испарение", "превращение воды в пар"]]}, {"id": "transport2", "nm": "Транспорт и профессии", "dot": "#ea580c", "fm": "Наземный · водный · воздушный", "summary": "Тема помогает различать виды транспорта и профессии людей, которые их обслуживают.", "ex": "Автобус едет по дороге, корабль плывёт по воде, а самолёт летит в небе.", "facts": [["транспорт", "средства для перевозки людей и грузов"], ["водитель", "человек, который управляет машиной или автобусом"], ["машинист", "человек, который ведёт поезд"], ["пилот", "человек, который управляет самолётом"], ["пассажир", "человек, которого перевозят"]]}]}]}, "3": {"subjects": [{"id": "read", "after": "rus", "nm": "Литературное чтение", "ic": "📖", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "byliny3", "nm": "Былины", "dot": "#9333ea", "fm": "Богатырь · подвиг · защита Родины", "summary": "Тема знакомит с былинами, богатырями и героическими подвигами.", "ex": "В былине герой защищает родную землю, показывает силу, смелость и верность.", "facts": [["былина", "народное героическое произведение о богатырях"], ["богатырь", "сильный защитник Родины в былинах"], ["подвиг", "смелый поступок ради других"], ["Илья Муромец", "один из самых известных былинных богатырей"], ["Родина", "страна и родная земля человека"]]}, {"id": "children3", "nm": "Рассказы о детях", "dot": "#2563eb", "fm": "Герой · поступок · дружба", "summary": "В рассказах о детях важны поступки, дружба, честность и ответственность.", "ex": "Нужно уметь объяснить, почему герой поступил правильно или ошибся.", "facts": [["поступок", "действие человека в определённой ситуации"], ["дружба", "добрые и честные отношения между людьми"], ["честность", "умение говорить правду и не обманывать"], ["ответственность", "готовность отвечать за свои слова и дела"], ["герой рассказа", "персонаж, о котором говорится в тексте"]]}, {"id": "fable3", "nm": "Басни", "dot": "#f59e0b", "fm": "Басня · мораль · аллегория", "summary": "Тема знакомит с басней как поучительным жанром и учит видеть скрытый смысл.", "ex": "В басне герои могут быть животными, но через них автор говорит о людях и их поступках.", "facts": [["басня", "небольшое поучительное произведение, часто в стихах"], ["мораль", "главный вывод, который делает читатель"], ["аллегория", "иносказание, когда через одно показывают другое"], ["герои-животные", "персонажи, которые изображают человеческие качества"], ["поучение", "урок, который содержит произведение"]]}]}], "extend": [{"subjectId": "okr", "topics": [{"id": "eco3", "nm": "Экология", "dot": "#16a34a", "fm": "Природа · цепь питания · Красная книга", "summary": "Тема объясняет, почему нужно беречь природу и как связаны между собой живые организмы.", "ex": "Если исчезает одно звено цепи питания, это влияет на других животных и растения.", "facts": [["экология", "наука о связях живых организмов и среды"], ["цепь питания", "последовательность, кто кого ест в природе"], ["Красная книга", "список редких и охраняемых видов"], ["заповедник", "территория, где природу особенно охраняют"], ["мусор", "отходы, которые нужно правильно собирать и перерабатывать"]]}, {"id": "cities3", "nm": "Города России", "dot": "#ea580c", "fm": "Столица · река · достопримечательность", "summary": "Тема расширяет знания о крупных городах России и их особенностях.", "ex": "Москва — столица, Санкт-Петербург стоит на Неве, а Казань известна своим кремлём.", "facts": [["Москва", "столица России"], ["Санкт-Петербург", "крупный город России на реке Неве"], ["Казань", "город на Волге, столица Татарстана"], ["достопримечательность", "известное и важное место города"], ["река", "водный путь, вокруг которого часто растут города"]]}]}]}, "4": {"subjects": [{"id": "read", "after": "rus", "nm": "Литературное чтение", "ic": "📖", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "classic4", "nm": "Классика", "dot": "#9333ea", "fm": "Автор · герой · главная мысль", "summary": "Тема знакомит с классическими произведениями и учит находить главную мысль текста.", "ex": "Классика остаётся важной долгое время, потому что поднимает вечные темы: добро, честь, труд, дружбу.", "facts": [["классика", "произведения, которые ценят многие поколения читателей"], ["главная мысль", "то, что автор хочет донести до читателя"], ["характер", "черты поведения и привычки героя"], ["сюжет", "последовательность событий в произведении"], ["авторская позиция", "отношение автора к героям и событиям"]]}, {"id": "foreign4", "nm": "Зарубежная литература", "dot": "#2563eb", "fm": "Страна · перевод · герой", "summary": "Тема помогает увидеть, что интересные книги пишут авторы разных стран.", "ex": "Зарубежную литературу мы читаем в переводе, но герои и проблемы остаются понятными.", "facts": [["зарубежная литература", "книги авторов из других стран"], ["перевод", "передача текста с одного языка на другой"], ["сказочник", "автор, который создаёт сказки"], ["приключение", "интересное и необычное событие"], ["читатель", "человек, который читает книгу"]]}, {"id": "poetry4", "nm": "Поэзия о Родине", "dot": "#16a34a", "fm": "Родина · чувство · образ природы", "summary": "Тема помогает понимать стихи о Родине, природе и памяти.", "ex": "В таких стихах автор часто соединяет образ родной земли с чувствами любви, гордости и благодарности.", "facts": [["Родина", "страна и место, с которым человек чувствует связь"], ["лирический герой", "образ человека, чьи чувства звучат в стихотворении"], ["пейзаж", "описание природы"], ["интонация", "звучание и настроение речи в стихотворении"], ["патриотизм", "любовь и уважение к своей стране"]]}]}], "extend": [{"subjectId": "okr", "topics": [{"id": "eco4", "nm": "Экология и охрана природы", "dot": "#16a34a", "fm": "Заповедник · Красная книга · охрана", "summary": "Тема объясняет, почему государство и люди защищают природу.", "ex": "Редкие виды заносят в Красную книгу, а в заповедниках природу стараются сохранить без вреда.", "facts": [["охрана природы", "действия по сохранению растений, животных и среды"], ["Красная книга", "список редких и исчезающих видов"], ["заповедник", "особо охраняемая природная территория"], ["браконьер", "человек, который незаконно охотится или ловит животных"], ["экологическая проблема", "ситуация, когда природе наносится вред"]]}, {"id": "human4", "nm": "Человек и здоровье", "dot": "#dc2626", "fm": "Иммунитет · кровь · режим дня", "summary": "Тема повторяет строение организма и полезные привычки для здоровья.", "ex": "Организм работает лучше, если человек высыпается, двигается, правильно питается и соблюдает гигиену.", "facts": [["иммунитет", "способность организма защищаться от болезней"], ["кровь", "жидкость, которая переносит кислород и питательные вещества"], ["нервная система", "система, которая управляет работой органов"], ["режим дня", "правильное чередование учёбы, отдыха и сна"], ["гигиена", "правила ухода за телом и чистотой"]]}]}]}, "5": {"subjects": [{"id": "lit", "after": "his", "nm": "Литература", "ic": "📚", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "folk5", "nm": "Сказки и басни", "dot": "#9333ea", "fm": "Сказка · басня · мораль", "summary": "Тема помогает различать сказку и басню и понимать их поучительный смысл.", "ex": "В басне часто действуют животные, а в конце скрыта или прямо названа мораль.", "facts": [["басня", "небольшое поучительное произведение, часто с моралью"], ["мораль", "главный вывод или урок произведения"], ["аллегория", "иносказание, когда через животных показывают людей"], ["сказка", "произведение с вымыслом и чудесами"], ["герой", "персонаж произведения"]]}, {"id": "push5", "nm": "Пушкин и Лермонтов", "dot": "#2563eb", "fm": "Поэт · образ · настроение", "summary": "Тема знакомит с ключевыми произведениями Пушкина и Лермонтова для 5 класса.", "ex": "Важно видеть, какие чувства вызывают стихи и как автор создаёт образ героя или природы.", "facts": [["Пушкин", "русский поэт и писатель, автор сказок и лирики"], ["Лермонтов", "русский поэт, автор стихов и поэм"], ["лирика", "произведения, в которых передаются чувства и мысли"], ["образ", "художественное представление героя, природы или явления"], ["настроение", "эмоциональное звучание произведения"]]}, {"id": "terms5", "nm": "Литературные термины", "dot": "#dc2626", "fm": "Тема · идея · эпитет", "summary": "Тема систематизирует базовые литературные термины, которые помогают разбирать текст.", "ex": "Чтобы разбирать произведение, нужно различать тему, идею и художественные средства.", "facts": [["тема", "то, о чём говорится в произведении"], ["идея", "главная мысль произведения"], ["эпитет", "яркое образное определение"], ["сравнение", "сопоставление одного предмета с другим"], ["сюжет", "последовательность событий в произведении"]]}]}]}, "6": {"subjects": [{"id": "lit", "after": "his", "nm": "Литература", "ic": "📚", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "oldrus6", "nm": "Древнерусская литература", "dot": "#9333ea", "fm": "Летопись · житие · поучение", "summary": "Тема вводит в древнерусскую литературу и её особые жанры.", "ex": "В древнерусской литературе важны история, вера, память и наставление.", "facts": [["летопись", "запись исторических событий по годам"], ["житие", "произведение о жизни святого"], ["поучение", "текст с наставлением и советом"], ["древнерусская литература", "литература Древней Руси"], ["летописец", "человек, который вёл летопись"]]}, {"id": "push6", "nm": "Пушкин и Лермонтов", "dot": "#2563eb", "fm": "Поэма · лирика · герой", "summary": "Тема продолжает знакомство с Пушкиным и Лермонтовым на более содержательном уровне.", "ex": "Важно видеть, как герой раскрывается через поступки, речь и отношение автора.", "facts": [["поэма", "крупное стихотворное произведение с сюжетом"], ["лирический герой", "образ человека, чьи переживания звучат в стихотворении"], ["портрет героя", "описание внешности и деталей, важных для образа"], ["конфликт", "столкновение интересов или чувств"], ["автор", "создатель произведения"]]}, {"id": "turg6", "nm": "Тургенев и Некрасов", "dot": "#dc2626", "fm": "Рассказ · герой · авторская позиция", "summary": "Тема знакомит с произведениями Тургенева и Некрасова и их отношением к человеку и природе.", "ex": "Нужно понимать, как автор показывает характер героя и зачем обращается к деталям природы и быта.", "facts": [["Тургенев", "русский писатель, автор рассказов и повестей"], ["Некрасов", "русский поэт, писавший о народной жизни"], ["повесть", "произведение больше рассказа, но меньше романа"], ["деталь", "небольшая подробность, важная для смысла"], ["авторская позиция", "отношение автора к героям и событиям"]]}]}]}, "7": {"subjects": [{"id": "lit", "after": "his", "nm": "Литература", "ic": "📚", "cl": "#9333ea", "bg": "#f3e8ff", "tops": [{"id": "gog7", "nm": "Гоголь и Тургенев", "dot": "#9333ea", "fm": "Повесть · рассказ · герой", "summary": "Тема помогает сравнивать мир героев Гоголя и Тургенева и видеть особенности их прозы.", "ex": "У Гоголя часто есть сатирический взгляд, а у Тургенева важны характер и внутренний мир героя.", "facts": [["Гоголь", "русский писатель, автор повестей и комедий"], ["Тургенев", "русский писатель, мастер рассказа и повести"], ["сатира", "осмеяние недостатков в обществе и человеке"], ["повесть", "прозаическое произведение среднего объёма"], ["характер героя", "устойчивые черты героя, проявляющиеся в поступках"]]}, {"id": "tol7", "nm": "Толстой и Чехов", "dot": "#2563eb", "fm": "Рассказ · деталь · смысл", "summary": "Тема знакомит с произведениями Толстого и Чехова и умением видеть скрытый смысл деталей.", "ex": "У Чехова маленькая деталь часто раскрывает большой смысл, а у Толстого важен нравственный выбор героя.", "facts": [["Толстой", "русский писатель, автор рассказов и повестей о человеке и морали"], ["Чехов", "русский писатель, мастер короткого рассказа"], ["подтекст", "смысл, который не назван прямо"], ["нравственный выбор", "ситуация, в которой герой выбирает между добром и злом"], ["художественная деталь", "подробность, которая помогает понять произведение"]]}, {"id": "verse7", "nm": "Стихосложение", "dot": "#dc2626", "fm": "Рифма · ритм · строфа", "summary": "Тема объясняет, как устроено стихотворение на уровне формы.", "ex": "Чтобы разбирать стихи, нужно различать ритм, рифму и строфу.", "facts": [["ритм", "повторяющийся порядок ударных и безударных слогов"], ["рифма", "созвучие концов строк"], ["строфа", "группа строк в стихотворении"], ["стопа", "повторяющаяся ритмическая единица стиха"], ["размер", "схема чередования ударных и безударных слогов"]]}]}, {"id": "bio", "after": "lit", "nm": "Биология", "ic": "🧬", "cl": "#0d9488", "bg": "#ccfbf1", "tops": [{"id": "zool7", "nm": "Зоология", "dot": "#0d9488", "fm": "Животные · органы · среда обитания", "summary": "Тема вводит в многообразие животных и их приспособления к жизни.", "ex": "Животных можно сравнивать по строению тела, питанию и среде обитания.", "facts": [["зоология", "раздел биологии, изучающий животных"], ["среда обитания", "место, где живёт организм"], ["приспособление", "признак, помогающий выживать"], ["позвоночные", "животные, у которых есть позвоночник"], ["беспозвоночные", "животные, у которых нет позвоночника"]]}, {"id": "class7", "nm": "Классификация животных", "dot": "#16a34a", "fm": "Тип · класс · вид", "summary": "Тема показывает, как учёные объединяют животных по общим признакам.", "ex": "Классификация помогает понять, какие животные похожи по строению и происхождению.", "facts": [["вид", "группа очень похожих организмов, способных давать потомство"], ["класс", "более крупная группа в классификации"], ["тип", "крупная группа, объединяющая классы организмов"], ["млекопитающие", "животные, которые кормят детёнышей молоком"], ["членистоногие", "животные с членистыми конечностями и наружным покровом"]]}, {"id": "evo7", "nm": "Эволюция животных", "dot": "#2563eb", "fm": "Изменение · отбор · приспособление", "summary": "Тема объясняет, как животные изменялись и приспосабливались к условиям жизни.", "ex": "Если среда меняется, выживают те, чьи признаки лучше подходят к новым условиям.", "facts": [["эволюция", "длительное историческое изменение живой природы"], ["естественный отбор", "сохранение более приспособленных организмов"], ["изменчивость", "различия между особями одного вида"], ["наследственность", "передача признаков потомкам"], ["приспособленность", "соответствие признаков организма условиям среды"]]}]}, {"id": "geog", "after": "bio", "nm": "География", "ic": "🗺️", "cl": "#0284c7", "bg": "#e0f2fe", "tops": [{"id": "cont7", "nm": "Материки", "dot": "#0284c7", "fm": "Материк · рельеф · климат", "summary": "Тема знакомит с особенностями материков Земли.", "ex": "Каждый материк отличается климатом, рельефом, природными зонами и животным миром.", "facts": [["материк", "крупный участок суши, окружённый океанами"], ["Африка", "материк, который пересекает экватор"], ["Евразия", "самый большой материк Земли"], ["Антарктида", "самый холодный материк"], ["Австралия", "самый маленький материк"]]}, {"id": "ocean7", "nm": "Океаны", "dot": "#0d9488", "fm": "Течения · глубина · ресурсы", "summary": "Тема помогает различать океаны и их роль в жизни планеты.", "ex": "Океаны влияют на климат, дают ресурсы и соединяют материки.", "facts": [["Тихий океан", "самый большой океан Земли"], ["Атлантический океан", "океан между Америкой и Европой с Африкой"], ["течение", "движение больших масс воды в океане"], ["Мировой океан", "совокупность всех океанов Земли"], ["ресурсы океана", "рыба, соль, нефть, газ и другие богатства океана"]]}, {"id": "pop7", "nm": "Население мира", "dot": "#ea580c", "fm": "Население · плотность · миграция", "summary": "Тема вводит в понятия численности, размещения и движения населения.", "ex": "Люди живут неравномерно: одни территории густо заселены, другие почти пусты.", "facts": [["население", "все люди, живущие на определённой территории"], ["плотность населения", "число жителей на единицу площади"], ["миграция", "переселение людей с одного места на другое"], ["город", "крупный населённый пункт с развитой инфраструктурой"], ["деревня", "небольшой сельский населённый пункт"]]}]}, {"id": "inf", "after": "geog", "nm": "Информатика", "ic": "💻", "cl": "#475569", "bg": "#e2e8f0", "tops": [{"id": "algo7", "nm": "Алгоритмы", "dot": "#475569", "fm": "Команда · исполнитель · порядок действий", "summary": "Тема учит видеть алгоритм как точный план действий для исполнителя.", "ex": "Алгоритм должен быть понятным, последовательным и конечным.", "facts": [["алгоритм", "точная последовательность действий для решения задачи"], ["исполнитель", "тот, кто выполняет команды алгоритма"], ["команда", "отдельное действие в алгоритме"], ["ветвление", "выбор одного из нескольких путей"], ["цикл", "повторение действий несколько раз"]]}, {"id": "data7", "nm": "Данные и кодирование", "dot": "#0f766e", "fm": "Текст · число · код", "summary": "Тема показывает, как информация представляется и хранится в компьютере.", "ex": "Любую информацию компьютер хранит в виде данных, которые можно кодировать.", "facts": [["данные", "сведения, представленные в удобной для хранения форме"], ["кодирование", "запись информации с помощью условных знаков"], ["бит", "наименьшая единица информации"], ["байт", "единица информации, равная 8 битам"], ["файл", "именованная запись данных на носителе"]]}, {"id": "net7", "nm": "Компьютерные сети", "dot": "#2563eb", "fm": "Сеть · сервер · браузер", "summary": "Тема знакомит с тем, как компьютеры обмениваются информацией.", "ex": "Интернет — это большая сеть, где устройства соединяются и передают данные.", "facts": [["компьютерная сеть", "соединение устройств для обмена данными"], ["интернет", "глобальная сеть, объединяющая множество сетей"], ["сервер", "компьютер, который предоставляет данные или услуги"], ["браузер", "программа для просмотра сайтов"], ["сайт", "набор веб-страниц, доступных по адресу"]]}]}]}};
  if(!DATA[grade]) return;

  function rand(arr){ return arr[(Math.random()*arr.length)|0]; }
  function shuffleLocal(arr){
    var out = arr.slice();
    for(var i=out.length-1;i>0;i--){
      var j = (Math.random()*(i+1))|0;
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function ensureSubject(afterId, subject){
    if(SUBJ.some(function(s){ return s.id === subject.id; })) return;
    var idx = SUBJ.findIndex(function(s){ return s.id === afterId; });
    if(idx >= 0) SUBJ.splice(idx + 1, 0, subject); else SUBJ.push(subject);
  }
  function makeTheory(topic){
    return '<h3>'+topic.nm+'</h3>'+
      '<div class="fm">'+topic.fm+'</div>'+
      '<p>'+topic.summary+'</p>'+
      '<div class="ex"><b>Опора:</b> '+topic.ex+'</div>';
  }
  function takeThree(arr){
    var pool = arr.slice();
    var out = [];
    while(pool.length && out.length < 3){
      var idx = (Math.random()*pool.length)|0;
      out.push(pool.splice(idx,1)[0]);
    }
    return out;
  }
  function pickTerms(facts, correct){
    var pool = facts.map(function(f){ return f[0]; }).filter(function(x){ return x !== correct; });
    return shuffleLocal([correct].concat(takeThree(pool)));
  }
  function pickDefs(facts, correct){
    var pool = facts.map(function(f){ return f[1]; }).filter(function(x){ return x !== correct; });
    return shuffleLocal([correct].concat(takeThree(pool)));
  }
  function makeGen(topic, color, bg){
    return function(){
      var facts = topic.facts || [];
      var fact = rand(facts);
      var mode = (Math.random()*3)|0;
      if(mode === 0) return mkQ('Выбери термин: ' + fact[1], fact[0], pickTerms(facts, fact[0]), fact[1], topic.nm, color, bg);
      if(mode === 1) return mkQ('Что верно про «' + fact[0] + '»?', fact[1], pickDefs(facts, fact[1]), fact[1], topic.nm, color, bg);
      return mkQ('Какое понятие подходит к описанию: ' + fact[1], fact[0], pickTerms(facts, fact[0]), fact[1], topic.nm, color, bg);
    };
  }
  function buildTopic(subject, topic){
    return {
      id: topic.id,
      nm: topic.nm,
      gen: makeGen(topic, subject.cl, subject.bg),
      th: makeTheory(topic),
      dot: topic.dot || subject.cl,
      _coverageBoosted: true,
      _coverageExtraCount: (topic.facts || []).length,
      _coverageSources: ['wave20']
    };
  }

  (DATA[grade].subjects || []).forEach(function(subject){
    var built = {
      id: subject.id,
      nm: subject.nm,
      ic: subject.ic,
      date: '',
      cl: subject.cl,
      bg: subject.bg,
      tops: subject.tops.map(function(topic){ return buildTopic(subject, topic); })
    };
    ensureSubject(subject.after, built);
  });

  (DATA[grade].extend || []).forEach(function(ext){
    var subj = SUBJ.find(function(s){ return s.id === ext.subjectId; });
    if(!subj) return;
    (ext.topics || []).forEach(function(topic){
      if(subj.tops.some(function(t){ return t.id === topic.id; })) return;
      subj.tops.push(buildTopic(subj, topic));
    });
  });

  try{
    var meta = document.querySelector('#s-main .fade p');
    if(meta){
      var totalTopics = SUBJ.reduce(function(sum, s){ return sum + ((s.tops || []).length || 0); }, 0);
      meta.textContent = String(window.GRADE_NUM || grade) + ' класс · ' + SUBJ.length + ' предметов · ' + totalTopics + ' тем';
    }
  }catch(e){}
})();

;
/* --- wave34_world.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave34World) return;

  var VERSION = 'wave34';

  var BANKS = {
    1: [
      {
        subject: ['world', 'okr'],
        id: 'day1',
        nm: 'Режим дня и здоровье',
        dot: '#dc2626',
        fm: 'Сон · зарядка · чистота · завтрак',
        summary: 'Тема помогает ребёнку связать здоровье с простыми ежедневными привычками.',
        ex: 'Когда мы высыпаемся, завтракаем и соблюдаем гигиену, учиться и играть становится легче.',
        facts: [
          ['режим дня', 'правильное чередование сна, учёбы, игр и отдыха'],
          ['зарядка', 'короткие упражнения утром, которые помогают проснуться и размяться'],
          ['завтрак', 'первая еда утром, дающая силы на начало дня'],
          ['гигиена', 'правила чистоты, которые помогают сохранять здоровье'],
          ['сон', 'время отдыха, когда организм набирается сил']
        ]
      },
      {
        subject: ['world', 'okr'],
        id: 'home1',
        nm: 'Дом, двор и улица',
        dot: '#ea580c',
        fm: 'Адрес · улица · двор · переход',
        summary: 'Тема учит ребёнка ориентироваться рядом с домом и понимать безопасные правила поведения на улице.',
        ex: 'Важно знать свой адрес, различать двор и улицу и помнить, что дорогу переходят только в безопасном месте.',
        facts: [
          ['адрес', 'название города, улицы, дома и квартиры, по которому можно найти человека'],
          ['улица', 'часть города или села, вдоль которой стоят дома'],
          ['двор', 'пространство возле дома, где можно гулять и играть'],
          ['перекрёсток', 'место, где пересекаются дороги или улицы'],
          ['общественное место', 'место, где бывает много людей и нужно соблюдать правила поведения']
        ]
      },
      {
        subject: ['world', 'okr'],
        id: 'sky1',
        nm: 'Небо, Солнце и Луна',
        dot: '#2563eb',
        fm: 'День · ночь · Солнце · Луна · звёзды',
        summary: 'Тема знакомит с самыми важными объектами на небе и объясняет смену дня и ночи.',
        ex: 'Днём мы видим Солнце, ночью — Луну и звёзды. Земля вращается, поэтому день сменяется ночью.',
        facts: [
          ['Солнце', 'ближайшая к Земле звезда, которая даёт свет и тепло'],
          ['Луна', 'спутник Земли, который мы видим ночью'],
          ['звезда', 'небесное тело, которое само излучает свет'],
          ['день и ночь', 'смена светлого и тёмного времени суток на Земле'],
          ['сутки', 'одни полные день и ночь вместе']
        ]
      },
      {
        subject: ['world', 'okr'],
        id: 'prof1',
        nm: 'Профессии вокруг нас',
        dot: '#7c3aed',
        fm: 'Врач · пожарный · продавец · почтальон',
        summary: 'Тема помогает увидеть, как разные профессии помогают людям каждый день.',
        ex: 'Одни люди лечат, другие строят, перевозят письма, тушат пожары и помогают покупать нужные вещи.',
        facts: [
          ['врач', 'человек, который лечит людей и помогает сохранить здоровье'],
          ['пожарный', 'человек, который тушит пожар и спасает людей'],
          ['продавец', 'человек, который помогает покупать товары в магазине'],
          ['почтальон', 'человек, который доставляет письма и газеты'],
          ['строитель', 'человек, который строит дома и другие здания']
        ]
      }
    ],
    2: [
      {
        subject: ['world', 'okr'],
        id: 'air2',
        nm: 'Воздух и погода',
        dot: '#0284c7',
        fm: 'Воздух · ветер · облака · осадки',
        summary: 'Тема даёт простую картину погоды и объясняет, почему воздух нужен всем живым организмам.',
        ex: 'Воздух нельзя увидеть, но его можно почувствовать по ветру. Облака и осадки помогают наблюдать погоду.',
        facts: [
          ['воздух', 'смесь газов, которая окружает Землю и нужна для дыхания'],
          ['ветер', 'движение воздуха'],
          ['облака', 'скопления мелких капель воды или кристалликов льда в небе'],
          ['осадки', 'дождь, снег и град, которые выпадают из облаков'],
          ['термометр', 'прибор для измерения температуры']
        ]
      },
      {
        subject: ['world', 'okr'],
        id: 'land2',
        nm: 'Формы поверхности и водоёмы',
        dot: '#16a34a',
        fm: 'Река · озеро · гора · равнина',
        summary: 'Тема помогает различать основные формы поверхности Земли и ближайшие водоёмы.',
        ex: 'Реки текут, озёра заполняют углубления, а горы и равнины отличаются высотой и рельефом.',
        facts: [
          ['река', 'поток воды, который течёт по руслу'],
          ['озеро', 'водоём со стоячей водой, окружённый сушей'],
          ['гора', 'высокий участок поверхности Земли'],
          ['равнина', 'ровный или слегка холмистый участок земной поверхности'],
          ['берег', 'край суши у реки, озера или моря']
        ]
      },
      {
        subject: ['world', 'okr'],
        id: 'health2',
        nm: 'Человек и здоровье',
        dot: '#dc2626',
        fm: 'Скелет · мышцы · сердце · дыхание',
        summary: 'Тема связывает строение тела с движением, дыханием и полезными привычками.',
        ex: 'Скелет держит тело, мышцы помогают двигаться, а сердце и лёгкие обеспечивают жизнь организма.',
        facts: [
          ['скелет', 'совокупность костей, которая служит опорой телу'],
          ['мышцы', 'части тела, которые помогают двигаться'],
          ['сердце', 'орган, который перекачивает кровь'],
          ['дыхание', 'процесс поступления воздуха в организм и удаления углекислого газа'],
          ['витамины', 'полезные вещества в пище, необходимые для роста и здоровья']
        ]
      },
      {
        subject: ['world', 'okr'],
        id: 'city2',
        nm: 'Родной край и общественные места',
        dot: '#f59e0b',
        fm: 'Город · село · музей · библиотека',
        summary: 'Тема знакомит с местами, которые есть в городе или селе, и их значением для людей.',
        ex: 'В библиотеке берут книги, в музее узнают историю и культуру, а город и село отличаются образом жизни.',
        facts: [
          ['город', 'крупный населённый пункт с улицами, домами и общественными зданиями'],
          ['село', 'небольшой населённый пункт, где обычно меньше домов и больше природы'],
          ['музей', 'место, где хранят и показывают важные предметы прошлого и культуры'],
          ['библиотека', 'место, где можно брать книги для чтения'],
          ['профессия', 'основное дело, которым человек занимается в своей работе']
        ]
      }
    ],
    3: [
      {
        subject: ['okr', 'world'],
        id: 'space3',
        nm: 'Земля и Солнечная система',
        dot: '#2563eb',
        fm: 'Планета · орбита · спутник · Солнце',
        summary: 'Тема связывает знания о Земле с более широкой картиной Солнечной системы.',
        ex: 'Земля — планета, которая движется вокруг Солнца, а Луна обращается вокруг Земли.',
        facts: [
          ['Солнечная система', 'Солнце и все небесные тела, которые движутся вокруг него'],
          ['планета', 'крупное небесное тело, которое движется вокруг звезды'],
          ['орбита', 'путь, по которому движется небесное тело'],
          ['спутник', 'небесное тело, которое обращается вокруг планеты'],
          ['ось Земли', 'воображаемая линия, вокруг которой вращается Земля']
        ]
      },
      {
        subject: ['okr', 'world'],
        id: 'soil3',
        nm: 'Почва и полезные ископаемые',
        dot: '#16a34a',
        fm: 'Почва · песок · глина · гранит',
        summary: 'Тема объясняет, из чего состоит верхний слой Земли и какие богатства люди добывают из недр.',
        ex: 'Почва нужна растениям, а полезные ископаемые используются в строительстве, производстве и быту.',
        facts: [
          ['почва', 'верхний плодородный слой земли, в котором растут растения'],
          ['песок', 'сыпучая горная порода из мелких зёрен'],
          ['глина', 'пластичная горная порода, которую используют для кирпича и посуды'],
          ['гранит', 'твёрдая горная порода, которую часто используют в строительстве'],
          ['полезные ископаемые', 'природные богатства, которые добывают из недр Земли']
        ]
      },
      {
        subject: ['okr', 'world'],
        id: 'society3',
        nm: 'Права и обязанности',
        dot: '#dc2626',
        fm: 'Гражданин · право · обязанность · закон',
        summary: 'Тема даёт ребёнку понятные основы жизни в обществе и уважения к общим правилам.',
        ex: 'У человека есть права, но вместе с ними всегда есть обязанности: учиться, беречь природу, уважать других людей и законы.',
        facts: [
          ['гражданин', 'человек, который принадлежит определённому государству'],
          ['право', 'то, что человеку разрешено и гарантировано правилами или законом'],
          ['обязанность', 'то, что человек должен выполнять'],
          ['закон', 'обязательное правило, которое действует в государстве'],
          ['государственный символ', 'официальный знак страны, например флаг, герб или гимн']
        ]
      },
      {
        subject: ['okr', 'world'],
        id: 'farm3',
        nm: 'Растениеводство и животноводство',
        dot: '#f59e0b',
        fm: 'Ферма · урожай · пшеница · животные',
        summary: 'Тема показывает, как люди получают продукты и сырьё с помощью сельского хозяйства.',
        ex: 'На полях выращивают растения, а на фермах содержат животных, чтобы получать пищу и материалы для жизни.',
        facts: [
          ['растениеводство', 'выращивание культурных растений человеком'],
          ['животноводство', 'разведение домашних животных для пользы человека'],
          ['урожай', 'собранные плоды и растения, выращенные на поле или в саду'],
          ['ферма', 'хозяйство, где выращивают животных или растения'],
          ['пшеница', 'культурное растение, из которого получают муку и хлеб']
        ]
      }
    ],
    4: [
      {
        subject: ['okr', 'world'],
        id: 'map4',
        nm: 'Карта России и мира',
        dot: '#0284c7',
        fm: 'Масштаб · материк · океан · граница',
        summary: 'Тема учит увереннее читать карту и связывать её с устройством мира и страны.',
        ex: 'На карте можно увидеть границы стран, материки, океаны и расстояния в уменьшенном виде.',
        facts: [
          ['масштаб', 'отношение расстояния на карте к расстоянию на местности'],
          ['материк', 'очень большой участок суши, окружённый океанами'],
          ['океан', 'крупнейшая часть Мирового океана'],
          ['граница', 'линия, которая отделяет одну территорию или страну от другой'],
          ['полушарие', 'одна из двух половин Земли']
        ]
      },
      {
        subject: ['okr', 'world'],
        id: 'regions4',
        nm: 'Регионы России',
        dot: '#16a34a',
        fm: 'Урал · Сибирь · Дальний Восток · Кавказ',
        summary: 'Тема расширяет представление о больших природных и географических частях России.',
        ex: 'Россия очень большая, поэтому её части отличаются природой, климатом, городами и хозяйством.',
        facts: [
          ['Урал', 'горная область, которая условно разделяет Европу и Азию в России'],
          ['Сибирь', 'огромная территория России к востоку от Урала'],
          ['Дальний Восток', 'восточная часть России у Тихого океана'],
          ['Кавказ', 'горный район на юге России'],
          ['Русская равнина', 'крупная равнинная территория европейской части России']
        ]
      },
      {
        subject: ['okr', 'world'],
        id: 'economy4',
        nm: 'Хозяйство и труд людей',
        dot: '#ea580c',
        fm: 'Промышленность · транспорт · энергетика',
        summary: 'Тема показывает, как разные виды труда создают вещи, перевозят их и обеспечивают жизнь страны.',
        ex: 'Одни люди выращивают продукты, другие производят машины, третьи перевозят грузы или дают энергию и тепло.',
        facts: [
          ['промышленность', 'отрасли, где из сырья делают нужные человеку товары'],
          ['сельское хозяйство', 'труд людей по выращиванию растений и разведению животных'],
          ['транспорт', 'система перевозки людей и грузов'],
          ['энергетика', 'отрасль, которая производит электричество и тепло'],
          ['полезные ископаемые', 'минеральные богатства, которые добывают из недр земли']
        ]
      },
      {
        subject: ['okr', 'world'],
        id: 'culture4',
        nm: 'Народы и культура России',
        dot: '#7c3aed',
        fm: 'Народ · традиция · язык · памятник',
        summary: 'Тема помогает увидеть богатство культур, традиций и памятников нашей страны.',
        ex: 'В России живут разные народы, и у каждого есть свои традиции, песни, ремёсла и памятные места.',
        facts: [
          ['народ', 'большая группа людей, связанная общей историей и культурой'],
          ['традиция', 'обычай или правило, которое передаётся из поколения в поколение'],
          ['язык', 'средство общения людей'],
          ['музей', 'место, где хранятся и показываются предметы культуры и истории'],
          ['памятник', 'сооружение или объект в память о человеке, событии или эпохе']
        ]
      }
    ]
  };

  var gradeInfo = {
    hooked: false,
    grade: Number(window.GRADE_NUM || 0) || 0,
    subjectId: '',
    addedTopicIds: [],
    totalWorldTopics: 0,
    totalSubjects: 0
  };

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(list){
    var out = (list || []).slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }
  function ensureArray(v){ return Array.isArray(v) ? v : (v ? [v] : []); }
  function findSubject(ids){
    if (typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return null;
    var list = ensureArray(ids);
    for (var i = 0; i < list.length; i++) {
      var subj = SUBJ.find(function(s){ return s && s.id === list[i]; });
      if (subj) return subj;
    }
    return null;
  }
  function factTerms(facts, correct){
    return shuffle((facts || []).map(function(pair){ return pair[0]; }).filter(function(v){ return v !== correct; }).slice(0, 3).concat([correct]));
  }
  function factDefs(facts, correct){
    return shuffle((facts || []).map(function(pair){ return pair[1]; }).filter(function(v){ return v !== correct; }).slice(0, 3).concat([correct]));
  }
  function makeTheory(def){
    return '<h3>' + esc(def.nm) + '</h3>' +
      '<div class="fm">' + String(def.fm || '') + '</div>' +
      '<p>' + esc(def.summary || '') + '</p>' +
      '<div class="ex"><b>Опора:</b> ' + esc(def.ex || '') + '</div>';
  }
  function makeQuestion(def, topic, subj){
    var facts = Array.isArray(def.facts) ? def.facts : [];
    if (!facts.length) {
      return typeof mkQ === 'function'
        ? mkQ('Тема скоро пополнится', 'ОК', ['ОК'], '', topic.nm, subj.cl || '#16a34a', subj.bg || '#dcfce7', null, false)
        : { question:'Тема скоро пополнится', answer:'ОК', options:['ОК'], hint:'', tag:topic.nm };
    }
    var fact = pick(facts);
    var mode = Math.random() < 0.5 ? 'term' : 'def';
    var q = '';
    var a = '';
    var opts = [];
    var hint = fact[1];
    if (mode === 'term') {
      q = 'Что верно про «' + fact[0] + '»?';
      a = fact[1];
      opts = factDefs(facts, fact[1]);
    } else {
      q = 'Какое понятие подходит к описанию: ' + fact[1];
      a = fact[0];
      opts = factTerms(facts, fact[0]);
    }
    if (typeof mkQ === 'function') {
      return mkQ(q, a, opts, hint, topic.nm, subj.cl || '#16a34a', subj.bg || '#dcfce7', null, false);
    }
    return {
      question: q,
      answer: a,
      options: opts,
      hint: hint,
      tag: topic.nm,
      color: subj.cl || '#16a34a',
      bg: subj.bg || '#dcfce7',
      isMath: false
    };
  }
  function ensureTopic(subj, def){
    if (!subj || !def) return false;
    subj.tops = Array.isArray(subj.tops) ? subj.tops : [];
    if (subj.tops.some(function(t){ return t && t.id === def.id; })) return false;
    var topic = {
      id: def.id,
      nm: def.nm,
      th: makeTheory(def),
      dot: def.dot || subj.cl || '#16a34a',
      gen: function(){ return makeQuestion(def, topic, subj); }
    };
    subj.tops.push(topic);
    if (gradeInfo.addedTopicIds.indexOf(def.id) === -1) gradeInfo.addedTopicIds.push(def.id);
    return true;
  }
  function gradeDefs(grade){ return BANKS[String(grade)] || BANKS[grade] || []; }
  function totalFacts(){
    return Object.keys(BANKS).reduce(function(sum, key){
      return sum + (BANKS[key] || []).reduce(function(inner, def){ return inner + ((def.facts || []).length || 0); }, 0);
    }, 0);
  }
  function refreshMeta(){
    if (typeof document === 'undefined' || !document || typeof document.querySelector !== 'function') return;
    try {
      var meta = document.querySelector('#s-main .fade p');
      if (!meta || typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;
      gradeInfo.totalSubjects = SUBJ.length;
    } catch(_) {}
  }
  function patchGrade(){
    var grade = Number(window.GRADE_NUM || 0) || 0;
    var defs = gradeDefs(grade);
    if (!defs.length) return;
    var subj = findSubject(defs[0].subject || ['world', 'okr']);
    if (!subj) return;
    gradeInfo.hooked = true;
    gradeInfo.subjectId = subj.id || '';
    defs.forEach(function(def){ ensureTopic(subj, def); });
    gradeInfo.totalWorldTopics = Array.isArray(subj.tops) ? subj.tops.length : 0;
    gradeInfo.totalSubjects = (typeof SUBJ !== 'undefined' && Array.isArray(SUBJ)) ? SUBJ.length : 0;
    refreshMeta();
  }
  function init(){
    try { patchGrade(); } catch (_) {}
  }

  window.wave34World = {
    version: VERSION,
    banks: BANKS,
    gradeInfo: gradeInfo,
    topicCount: function(){
      return Object.keys(BANKS).reduce(function(sum, key){ return sum + (BANKS[key] || []).length; }, 0);
    },
    factCount: totalFacts,
    auditSnapshot: function(){
      return {
        version: VERSION,
        grade: gradeInfo.grade,
        gradeHooked: gradeInfo.hooked,
        subjectId: gradeInfo.subjectId,
        addedTopicIds: gradeInfo.addedTopicIds.slice(),
        totalWorldTopics: gradeInfo.totalWorldTopics,
        totalSubjects: gradeInfo.totalSubjects,
        bankGrades: Object.keys(BANKS).map(function(v){ return Number(v); }).sort(function(a,b){ return a-b; }),
        topicCount: window.wave34World.topicCount(),
        factCount: totalFacts()
      };
    }
  };

  init();
  if (typeof document !== 'undefined' && document && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  }
  setTimeout(init, 0);
})();
//# sourceMappingURL=bundle_grade_content.3581ba449e.js.map
