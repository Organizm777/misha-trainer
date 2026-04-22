/* --- wave86s: grade10 lazy subject loader --- */
(function(){
  if(String(window.GRADE_NUM || '') !== '10') return;
  var VERSION = 'wave86s';
  var loadedMap = window.__wave86sGrade10Hydrated = window.__wave86sGrade10Hydrated || {};
  var loadingMap = {};
  function subjects(){ return Array.isArray(window.SUBJ) ? window.SUBJ : []; }
  function findSubject(id){
    var list = subjects();
    for(var i=0;i<list.length;i++) if(list[i] && list[i].id === id) return list[i];
    return null;
  }
  function topicFallback(subject, topic){
    var name = topic && topic.nm ? topic.nm : 'Тема';
    var subj = subject && subject.nm ? subject.nm : '10 класс';
    if(typeof mkQ === 'function') return mkQ('Данные темы «' + name + '» ещё загружаются. Нажми «Дальше» после открытия темы.', 'Готово', ['Готово','Загружается','Повторить','Открыть тему'], 'Предметный банк грузится отдельным чанком. Открой тему ещё раз — вопросы появятся без перезагрузки страницы.', name, (subject && subject.cl) || '#2563eb', (subject && subject.bg) || '#dbeafe', null, false, 'Lazy-load банка: ' + subj + ' · ' + name + '.');
    return { question:'Данные темы загружаются', answer:'Готово', options:['Готово','Загружается','Повторить','Открыть тему'], hint:'Открой тему ещё раз.', tag:name };
  }
  function ensureTopicGen(subject, topic){
    if(!topic) return;
    if(typeof topic.gen === 'function'){
      topic._wave86sGenReady = true;
      return;
    }
    topic._wave86sGenReady = true;
    topic.gen = function(){
      if(typeof topic.__wave86sActualGen === 'function') return topic.__wave86sActualGen();
      return topicFallback(subject, topic);
    };
  }
  window.__wave86sApplyGrade10Subject = function(subjectId, payload){
    var subject = findSubject(subjectId);
    if(!subject) return false;
    var rows = payload && Array.isArray(payload.topics) ? payload.topics : [];
    subject.tops = Array.isArray(subject.tops) ? subject.tops : [];
    rows.forEach(function(row){
      if(!row || !row.id) return;
      var topic = subject.tops.filter(function(t){ return t && t.id === row.id; })[0];
      if(!topic){
        topic = { id: row.id, nm: row.nm || row.id, dot: row.dot || subject.cl, th: '' };
        subject.tops.push(topic);
      }
      topic.nm = row.nm || topic.nm;
      topic.dot = row.dot || topic.dot || subject.cl;
      topic.th = row.th || topic.th || '';
      topic.__wave86sActualGen = row.gen;
      topic._wave86sLoaded = true;
      ensureTopicGen(subject, topic);
    });
    subject._wave86sLoaded = true;
    subject._wave86sLazy = false;
    loadedMap[subjectId] = true;
    return true;
  };
  subjects().forEach(function(subject){
    if(!subject || !Array.isArray(subject.tops)) return;
    subject.tops.forEach(function(topic){ ensureTopicGen(subject, topic); });
  });
  function hasPending(){
    return subjects().some(function(s){ return s && s._wave86sSrc && !s._wave86sLoaded; });
  }
  function inject(src){
    return new Promise(function(resolve, reject){
      var existing = document.querySelector && document.querySelector('script[data-wave86s-src="' + src + '"]');
      if(existing){
        if(existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', resolve, { once:true });
        existing.addEventListener('error', reject, { once:true });
        return;
      }
      var script = document.createElement('script');
      script.defer = true;
      script.src = src;
      script.dataset.wave86sSrc = src;
      script.onload = function(){ script.dataset.loaded = '1'; resolve(); };
      script.onerror = function(){ reject(new Error('Не удалось загрузить ' + src)); };
      (document.head || document.documentElement).appendChild(script);
    });
  }
  function showLoading(label){
    try{
      var tl = document.getElementById('tl');
      if(tl) tl.innerHTML = '<div class="rcard"><h3>Загружаю банк 10 класса…</h3><div class="rempty">' + (label || 'Предметные данные вынесены в отдельные чанки и подгружаются по запросу.') + '</div></div>';
    }catch(_){}
  }
  function hydrateSubject(id){
    var subject = findSubject(id);
    if(!subject || !subject._wave86sSrc || subject._wave86sLoaded) return Promise.resolve(subject);
    if(loadingMap[id]) return loadingMap[id];
    showLoading(subject.nm || id);
    loadingMap[id] = inject(subject._wave86sSrc).then(function(){
      if(!subject._wave86sLoaded && loadedMap[id]) subject._wave86sLoaded = true;
      return subject;
    }).catch(function(err){
      console.warn('[wave86s] lazy subject failed:', id, err);
      throw err;
    });
    return loadingMap[id];
  }
  function hydrateAll(){
    var list = subjects().filter(function(s){ return s && s._wave86sSrc && !s._wave86sLoaded; });
    if(!list.length) return Promise.resolve([]);
    showLoading('Подгружаю все предметные банки для сборной/экзамена.');
    return Promise.all(list.map(function(s){ return hydrateSubject(s.id); }));
  }
  function wrapOpenSubj(){
    var original = window.openSubj;
    if(typeof original !== 'function' || original._wave86sWrapped) return;
    function wrapped(id, opts){
      var subject = findSubject(id);
      if(subject && subject._wave86sSrc && !subject._wave86sLoaded){
        hydrateSubject(id).then(function(){ original.call(window, id, opts); }).catch(function(){ original.call(window, id, opts); });
        return;
      }
      return original.apply(this, arguments);
    }
    wrapped._wave86sWrapped = true;
    window.openSubj = wrapped;
  }
  function wrapGlobalStart(name, mode){
    var original = window[name];
    if(typeof original !== 'function' || original._wave86sWrapped) return;
    function wrapped(){
      var args = arguments;
      if(mode === 'all' && hasPending()){
        hydrateAll().then(function(){ original.apply(window, args); }).catch(function(){ original.apply(window, args); });
        return;
      }
      if(mode === 'subject' && window.cS && window.cS.id){
        var s = findSubject(window.cS.id);
        if(s && s._wave86sSrc && !s._wave86sLoaded){
          hydrateSubject(s.id).then(function(){ original.apply(window, args); }).catch(function(){ original.apply(window, args); });
          return;
        }
      }
      return original.apply(this, args);
    }
    wrapped._wave86sWrapped = true;
    window[name] = wrapped;
  }
  wrapOpenSubj();
  wrapGlobalStart('startGlobalMix', 'all');
  wrapGlobalStart('startRush', 'all');
  wrapGlobalStart('startDiag', 'subject');
  document.addEventListener('click', function(ev){
    var target = ev.target && ev.target.closest ? ev.target.closest('#wave86p-challenge-card [data-w86p]') : null;
    if(!target || !hasPending()) return;
    var action = target.getAttribute('data-w86p') || '';
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
  window.wave86sGrade10Lazy = {
    version: VERSION,
    hydrateSubject: hydrateSubject,
    hydrateAll: hydrateAll,
    auditSnapshot: function(){
      var list = subjects();
      var lazy = list.filter(function(s){ return s && s._wave86sSrc; });
      var loaded = lazy.filter(function(s){ return s._wave86sLoaded; });
      return {
        version: VERSION,
        grade: String(window.GRADE_NUM || ''),
        subjects: list.length,
        lazySubjects: lazy.length,
        loadedSubjects: loaded.length,
        pendingSubjects: lazy.length - loaded.length,
        topics: list.reduce(function(sum, s){ return sum + ((s && s.tops && s.tops.length) || 0); }, 0)
      };
    }
  };
})();
