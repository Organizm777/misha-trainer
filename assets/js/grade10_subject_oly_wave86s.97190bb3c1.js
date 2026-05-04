/* --- wave87c: lazy grade10 subject shell: olympiad split by topic --- */
(function(){
  if(String(window.GRADE_NUM || '') !== '10') return;
  const VERSION = 'wave91i';
  const OLY_TH = {
  "logic": "<h3>Логика и смекалка</h3>\n<p>Олимпиадные задачи проверяют не знание формул, а <b>умение думать нестандартно</b>.</p>\n<div class=\"fm\"><b>Приёмы:</b>\n1) Прочитай ВНИМАТЕЛЬНО — подвох часто в формулировке\n2) Попробуй подставить числа и проверить\n3) Рассмотри крайние случаи (0, 1, максимум)\n4) Нарисуй схему или таблицу\n5) Если «очевидный» ответ — скорее всего ловушка</div>",
  "cross": "<h3>Межпредметные задачи</h3>\n<p>Задачи на стыке наук — математика + физика, история + география, биология + химия.</p>\n<div class=\"fm\">Главное — не паниковать. Разбей задачу на части:\nкакие предметы задействованы? Что ты знаешь из каждого?</div>",
  "traps": "<h3>Задачи-ловушки</h3>\n<p>Формулировка специально провоцирует на неправильный ответ. Типичные ловушки:</p>\n<div class=\"fm\">• «Не» в вопросе (какое НЕ является...)\n• Похожие варианты (отличие в одной букве/цифре)\n• Очевидный ответ — неправильный\n• Вопрос про исключение, а не правило</div>",
  "deep": "<h3>Углублённые задачи</h3>\n<p>Задачи, которые требуют знания <b>за рамками учебника</b>: редкие факты, тонкие различия, сложные связи.</p>",
  "strategy": "<h3>Стратегии решения олимпиадных задач</h3>\n<p>Олимпиадная задача почти всегда требует не перебора фактов, а выбора подхода. Начни с формулировки: что дано, что нужно доказать или найти, какие ограничения скрыты в условии.</p>\n<div class=\"fm\"><b>Алгоритм:</b>\n1) Переформулируй условие своими словами.\n2) Сделай малую модель: таблицу, схему, крайний пример.\n3) Проверь инвариант: что не меняется при действиях?\n4) Ищи контрпример для слишком простого ответа.\n5) После решения запиши короткое доказательство, а не только ответ.</div>\n<p>Типичные ловушки: лишние данные, отрицание в вопросе, подмена «для всех» на «существует», округление без проверки и ответ, который подходит только для первого примера.</p>"
};
  const TOPIC_META = {
    logic: { nm:'Логика и смекалка', dot:'#7c3aed' },
    cross: { nm:'Межпредметные', dot:'#2563eb' },
    traps: { nm:'Ловушки', dot:'#dc2626' },
    deep: { nm:'Углублённые', dot:'#0d9488' },
    strategy: { nm:'Стратегии решения', dot:'#b45309' }
  };
  const TOPIC_ASSETS = {"logic":"./assets/js/grade10_subject_oly_logic_wave87c.4e7ea0f18b.js","cross":"./assets/js/grade10_subject_oly_cross_wave87c.15067e39a4.js","traps":"./assets/js/grade10_subject_oly_traps_wave87c.8c8acd7db6.js","deep":"./assets/js/grade10_subject_oly_deep_wave87c.8c8ae2c5aa.js","strategy":"./assets/js/grade10_subject_oly_strategy_wave91i.9079de7ddb.js"};
  const topicActual = window.__wave87cOlyActual = window.__wave87cOlyActual || {};
  const topicLoaded = window.__wave87cOlyLoaded = window.__wave87cOlyLoaded || {};
  const topicLoading = window.__wave87cOlyLoading = window.__wave87cOlyLoading || {};
  function findOlySubject(){
    const list = Array.isArray(window.SUBJ) ? window.SUBJ : [];
    for(let i=0;i<list.length;i++) if(list[i] && list[i].id === 'oly') return list[i];
    return null;
  }
  function findTopic(id){
    const s = findOlySubject();
    const list = s && Array.isArray(s.tops) ? s.tops : [];
    for(let i=0;i<list.length;i++) if(list[i] && list[i].id === id) return list[i];
    return null;
  }
  function fallbackQuestion(id){
    const meta = TOPIC_META[id] || { nm:'Олимпиада', dot:'#b45309' };
    const label = meta.nm || 'Олимпиада';
    if(typeof mkQ === 'function') return mkQ('Банк темы «' + label + '» загружается. Нажми «Дальше» через секунду.', 'Готово', ['Готово','Загружается','Повторить','Открыть тему'], 'Олимпиадный банк разбит на отдельные чанки. Тема подгружается один раз и затем работает офлайн из SW cache.', label, '#b45309', '#fef3c7', null, false, 'wave87c split-load: тема «' + label + '» загружается отдельным файлом, чтобы не тянуть весь олимпиадный банк сразу.');
    return { question:'Банк темы загружается', answer:'Готово', options:['Готово','Загружается','Повторить','Открыть тему'], hint:'Открой тему ещё раз.', tag:label };
  }
  function loadScript(src){
    return new Promise(function(resolve, reject){
      const existing = document.querySelector && document.querySelector('script[data-wave87c-oly-src="' + src + '"]');
      if(existing){
        if(existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', resolve, { once:true });
        existing.addEventListener('error', reject, { once:true });
        return;
      }
      const script = document.createElement('script');
      script.defer = true;
      script.src = src;
      script.dataset.wave87cOlySrc = src;
      script.onload = function(){ script.dataset.loaded = '1'; resolve(); };
      script.onerror = function(){ reject(new Error('Не удалось загрузить олимпиадный чанк ' + src)); };
      (document.head || document.documentElement).appendChild(script);
    });
  }
  function hydrateTopic(id){
    if(topicLoaded[id] && typeof topicActual[id] === 'function') return Promise.resolve(findTopic(id));
    const src = TOPIC_ASSETS[id];
    if(!src) return Promise.resolve(findTopic(id));
    if(topicLoading[id]) return topicLoading[id];
    topicLoading[id] = loadScript(src).then(function(){ return findTopic(id); }).catch(function(err){ console.warn('[wave87c] olympiad topic failed:', id, err); throw err; });
    return topicLoading[id];
  }
  function hydrateAll(){ return Promise.all(Object.keys(TOPIC_ASSETS).map(hydrateTopic)); }
  function pendingCount(){ return Object.keys(TOPIC_ASSETS).filter(function(id){ return !(topicLoaded[id] && typeof topicActual[id] === 'function'); }).length; }
  function makeGen(id){
    return function(){
      if(typeof topicActual[id] === 'function') return topicActual[id]();
      hydrateTopic(id).catch(function(){});
      return fallbackQuestion(id);
    };
  }
  window.__wave87cApplyOlyTopic = function(id, payload){
    if(!id || !payload || typeof payload.gen !== 'function') return false;
    topicActual[id] = payload.gen;
    topicLoaded[id] = true;
    const topic = findTopic(id);
    if(topic){
      topic.__wave87cActualGen = payload.gen;
      topic._wave87cLoaded = true;
      topic._wave87cQuestions = payload.questions || topic._wave87cQuestions || 0;
    }
    return true;
  };
  if(typeof window.__wave86sApplyGrade10Subject === 'function'){
    window.__wave86sApplyGrade10Subject('oly', { topics:Object.keys(TOPIC_META).map(function(id){
      const meta = TOPIC_META[id];
      return { id:id, nm:meta.nm, gen:makeGen(id), th:OLY_TH[id], dot:meta.dot, _wave87cSrc:TOPIC_ASSETS[id] };
    }) });
  }
  function wrapAllMode(name){
    const original = window[name];
    if(typeof original !== 'function' || original._wave87cOlyWrapped) return;
    function wrapped(){
      const args = arguments;
      if(pendingCount() > 0){
        hydrateAll().then(function(){ original.apply(window, args); }).catch(function(){ original.apply(window, args); });
        return;
      }
      return original.apply(this, args);
    }
    wrapped._wave87cOlyWrapped = true;
    window[name] = wrapped;
  }
  wrapAllMode('startGlobalMix');
  wrapAllMode('startRush');
  document.addEventListener('click', function(ev){
    const target = ev.target && ev.target.closest ? ev.target.closest('#wave86p-challenge-card [data-w86p]') : null;
    if(!target || pendingCount() <= 0) return;
    const action = target.getAttribute('data-w86p') || '';
    if(action === 'leaderboard') return;
    ev.preventDefault();
    ev.stopPropagation();
    if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    hydrateAll().then(function(){
      if(!window.wave86pChallenge) return;
      if(action === 'weekly' && typeof window.wave86pChallenge.startWeeklyChallenge === 'function') window.wave86pChallenge.startWeeklyChallenge();
      if(action === 'exam' && typeof window.wave86pChallenge.startExamPicker === 'function') window.wave86pChallenge.startExamPicker();
    });
  }, true);
  window.wave87cOlyLazy = {
    version: VERSION,
    assets: TOPIC_ASSETS,
    hydrateTopic: hydrateTopic,
    hydrateAll: hydrateAll,
    auditSnapshot: function(){
      const keys = Object.keys(TOPIC_ASSETS);
      return { version: VERSION, grade: String(window.GRADE_NUM || ''), subject: 'oly', shellLoaded: true, topics: keys.length, loadedTopics: keys.filter(function(id){ return topicLoaded[id] && typeof topicActual[id] === 'function'; }).length, pendingTopics: pendingCount(), assets: TOPIC_ASSETS };
    }
  };
})();
