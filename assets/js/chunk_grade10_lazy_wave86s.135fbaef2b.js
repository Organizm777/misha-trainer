/* --- wave86s: grade10 lazy subject loader --- */
(function(){
  if(String(window.GRADE_NUM || '') !== '10') return;
  var VERSION = 'wave86s';
  var loadedMap = window.__wave86sGrade10Hydrated = window.__wave86sGrade10Hydrated || {};
  var loadingMap = {};
  /* wave89h: grade10 lazy subject skeleton */
  var lazyUiSeq = 0;
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

  function lazyUiId(prefix){
    lazyUiSeq += 1;
    return 'wave89h-grade10-' + String(prefix || 'lazy') + '-' + lazyUiSeq;
  }
  function emitLazyUi(phase, detail){
    try {
      window.dispatchEvent(new CustomEvent('trainer:lazy-' + phase, {
        detail: Object.assign({
          wave:'wave89h',
          phase:phase,
          ts:Date.now()
        }, detail || {})
      }));
    } catch (_err) {}
  }
  function withLazyUi(promise, detail){
    if(!detail) return Promise.resolve(promise);
    var payload = Object.assign({}, detail);
    if(!payload.id) payload.id = lazyUiId(payload.scope || payload.kind || 'subject');
    emitLazyUi('start', payload);
    return Promise.resolve(promise).then(function(result){
      emitLazyUi('end', {
        id: payload.id,
        scope: payload.scope || 'subject',
        kind: payload.kind || 'grade10-subject',
        action: payload.action || '',
        status: 'ok'
      });
      return result;
    }, function(err){
      emitLazyUi('end', {
        id: payload.id,
        scope: payload.scope || 'subject',
        kind: payload.kind || 'grade10-subject',
        action: payload.action || '',
        status: 'error',
        message: err && err.message ? String(err.message) : ''
      });
      throw err;
    });
  }
  function escapeHtml(value){
    return String(value || '').replace(/[&<>"]/g, function(ch){
      if(ch === '&') return '&amp;';
      if(ch === '<') return '&lt;';
      if(ch === '>') return '&gt;';
      return '&quot;';
    });
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
        topic = { id: row.id, nm: row.nm || row.id, dot: (subject && (subject.dot || subject.cl)) || row.dot || '#2563eb', th: '' };
        subject.tops.push(topic);
      }
      topic.nm = row.nm || topic.nm;
      topic.dot = (subject && (subject.dot || subject.cl)) || row.dot || topic.dot || '#2563eb';
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
  function showLoading(label, title){
    try{
      var tl = document.getElementById('tl');
      if(!tl) return;
      var safeTitle = escapeHtml(title || 'Подгружаю банк 10 класса…');
      var safeLabel = escapeHtml(label || 'Предметные данные вынесены в отдельные чанки и подгружаются по запросу.');
      tl.innerHTML = '' +
        '<section class="wave89h-inline-card" data-wave89h-inline-loading="1" aria-live="polite">' +
          '<div class="wave89h-inline-badge">Загрузка</div>' +
          '<h3 class="wave89h-inline-title">' + safeTitle + '</h3>' +
          '<p class="wave89h-inline-copy">' + safeLabel + '</p>' +
          '<div class="wave89h-inline-skeleton" aria-hidden="true">' +
            '<span class="wave89h-skeleton-line w88"></span>' +
            '<span class="wave89h-skeleton-line w76"></span>' +
            '<span class="wave89h-skeleton-line w64"></span>' +
          '</div>' +
        '</section>';
    }catch(_){}
  }
  function subjectUiMeta(subject, mode){
    var subjectName = subject && subject.nm ? subject.nm : 'Предмет 10 класса';
    if(mode === 'all') return {
      scope:'subject',
      kind:'grade10-all',
      action:'hydrate-all',
      title:'Подгружаю банки 10 класса…',
      label:'Подгружаю все предметные банки для сборной, экзамена или молнии.'
    };
    return {
      scope:'subject',
      kind:'grade10-subject',
      action:'hydrate-subject',
      title:'Подгружаю предмет 10 класса…',
      label:'Загружаю банк «' + subjectName + '». Тема откроется автоматически.'
    };
  }
  function hydrateSubject(id, opts){
    opts = opts || {};
    var subject = findSubject(id);
    if(!subject || !subject._wave86sSrc || subject._wave86sLoaded) return Promise.resolve(subject);
    var ui = opts.skipUi ? null : (opts.ui || subjectUiMeta(subject, 'subject'));
    if(loadingMap[id]) return ui ? withLazyUi(loadingMap[id], ui) : loadingMap[id];
    if(!opts.skipInline) showLoading((subject && subject.nm ? subject.nm : id), ui && ui.title);
    loadingMap[id] = inject(subject._wave86sSrc).then(function(){
      if(!subject._wave86sLoaded && loadedMap[id]) subject._wave86sLoaded = true;
      return subject;
    }).catch(function(err){
      console.warn('[wave86s] lazy subject failed:', id, err);
      throw err;
    });
    return ui ? withLazyUi(loadingMap[id], ui) : loadingMap[id];
  }
  function hydrateAll(opts){
    opts = opts || {};
    var list = subjects().filter(function(s){ return s && s._wave86sSrc && !s._wave86sLoaded; });
    var base;
    var ui = opts.skipUi ? null : (opts.ui || subjectUiMeta(null, 'all'));
    if(!list.length) base = Promise.resolve([]);
    else {
      if(!opts.skipInline) showLoading('Подгружаю все предметные банки для сборной, экзамена или молнии.', ui && ui.title);
      base = Promise.all(list.map(function(s){ return hydrateSubject(s.id, { skipUi:true, skipInline:true }); }));
    }
    var chain = base.then(function(rows){
      if(window.wave87cOlyLazy && typeof window.wave87cOlyLazy.hydrateAll === 'function') return window.wave87cOlyLazy.hydrateAll().then(function(){ return rows; });
      return rows;
    });
    return ui ? withLazyUi(chain, ui) : chain;
  }
  function wrapOpenSubj(){
    var original = window.openSubj;
    if(typeof original !== 'function' || original._wave86sWrapped) return;
    function wrapped(id, opts){
      var subject = findSubject(id);
      if(subject && subject._wave86sSrc && !subject._wave86sLoaded){
        hydrateSubject(id, { ui: subjectUiMeta(subject, 'subject') }).then(function(){ original.call(window, id, opts); }).catch(function(){ original.call(window, id, opts); });
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
        hydrateAll({ ui: subjectUiMeta(null, 'all') }).then(function(){ original.apply(window, args); }).catch(function(){ original.apply(window, args); });
        return;
      }
      if(mode === 'subject' && window.cS && window.cS.id){
        var s = findSubject(window.cS.id);
        if(s && s._wave86sSrc && !s._wave86sLoaded){
          hydrateSubject(s.id, { ui: subjectUiMeta(s, 'subject') }).then(function(){ original.apply(window, args); }).catch(function(){ original.apply(window, args); });
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
    hydrateAll({ ui: subjectUiMeta(null, 'all') }).then(function(){
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
