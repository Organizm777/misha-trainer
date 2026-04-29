(function(){
  'use strict';
  var MANIFEST='./assets/data/content_depth/manifest.json';
  var state={manifest:null,loaded:{},current:'overview'};
  var $=function(id){return document.getElementById(id)};
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function recordError(message,extra){try{if(window.TrainerErrorTracking)window.TrainerErrorTracking.record({kind:'content-depth',message:message,source:'bundle_content_depth',stack:JSON.stringify(extra||{}).slice(0,1000)})}catch(_){}}
  function logNav(target){try{if(window.TrainerNavigationLog)window.TrainerNavigationLog.record({kind:'content-depth',target:target,href:location.href})}catch(_){}}
  function fetchJson(path){return fetch(path).then(function(r){if(!r.ok)throw new Error(path+' '+r.status);return r.json()})}
  function shard(kind){return (state.manifest.shards||[]).find(function(s){return s.kind===kind||s.id===kind})}
  function load(kind){if(state.loaded[kind])return Promise.resolve(state.loaded[kind]);var s=shard(kind);if(!s)return Promise.reject(new Error('unknown shard '+kind));return fetchJson(s.path).then(function(j){state.loaded[kind]=j;return j}).catch(function(err){recordError(err.message,{kind:kind});throw err})}
  function flatten(data){
    if(!data)return[];
    if(Array.isArray(data.items))return data.items;
    if(Array.isArray(data.cases))return data.cases.flatMap(function(c){return (c.questions||[]).map(function(q){q.case_title=c.title;q.case_context=c.context;return q})});
    if(Array.isArray(data.tracks))return data.tracks.flatMap(function(t){return (t.items||[]).map(function(q){q.track_title=t.title;q.target_grade=t.target_grade;return q})});
    if(Array.isArray(data.topics))return data.topics;
    return[];
  }
  function setStatus(text){var el=$('status');if(el)el.textContent=text}
  function card(q){
    var title=q.q||q.question||q.title||'Вопрос';
    var answer=q.a||q.answer||'';
    var opts=Array.isArray(q.o)?q.o:Array.isArray(q.options)?q.options:[];
    return '<article class="q"><div class="q-top"><div><span class="tag">'+esc(q.subject||q.direction||q.topic||q.kind||'задание')+'</span><h3>'+esc(title)+'</h3></div><span class="meta">'+(q.grade?'класс '+esc(q.grade)+' · ':'')+esc(q.id||'')+'</span></div>'+
      (q.case_context?'<p class="muted">'+esc(q.case_context)+'</p>':'')+
      (opts.length?'<p class="muted">Варианты: '+opts.map(esc).join(' · ')+'</p>':'')+
      '<div class="answer"><b>Ответ:</b> '+esc(answer)+'</div>'+
      (q.h||q.hint?'<p class="muted"><b>Подсказка:</b> '+esc(q.h||q.hint)+'</p>':'')+
      (q.ex?'<p class="muted"><b>Разбор:</b> '+esc(q.ex)+'</p>':'')+
      (Array.isArray(q.criteria)?'<div class="criteria">'+q.criteria.map(function(c){return '<span>'+esc(c)+'</span>'}).join('')+'</div>':'')+
      '</article>';
  }
  function renderItems(title,items,limit){
    limit=limit||24;
    var list=$('result'); if(!list)return;
    list.innerHTML='<div class="panel"><h2>'+esc(title)+'</h2><p class="muted">Показано '+Math.min(limit,items.length)+' из '+items.length+'. Используй поиск и фильтры, чтобы сузить список.</p><div class="list">'+items.slice(0,limit).map(card).join('')+'</div></div>';
  }
  function applyFilters(items){
    var q=($('search')&&$('search').value||'').toLowerCase().trim();
    var grade=($('grade')&&$('grade').value||'');
    var subject=($('subject')&&$('subject').value||'').toLowerCase().trim();
    return items.filter(function(row){
      var hay=[row.q,row.question,row.a,row.answer,row.subject,row.topic,row.direction,row.id].join(' ').toLowerCase();
      if(q&&hay.indexOf(q)<0)return false;
      if(grade&&String(row.grade||row.target_grade||'')!==grade)return false;
      if(subject&&String(row.subject||row.direction||'').toLowerCase().indexOf(subject)<0)return false;
      return true;
    });
  }
  function showTraining(){
    logNav('I1 training bank'); setStatus('Загружаю дополнительные банки…');
    Promise.all(['school_question_pack_primary','school_question_pack_middle','school_question_pack_senior'].map(load)).then(function(rows){
      var items=rows.flatMap(flatten); window.__wave91jLastItems=items; setStatus('Готово: '+items.length+' тренировочных заданий'); renderItems('I1 · Дополнительный банк 1–11',applyFilters(items));
    }).catch(function(e){setStatus('Ошибка загрузки: '+e.message)});
  }
  function showPisa(){logNav('I4 PISA');setStatus('Загружаю PISA-кейсы…');load('functional_literacy_pisa').then(function(j){var items=flatten(j);window.__wave91jLastItems=items;setStatus('Готово: '+j.case_count+' кейсов · '+items.length+' вопросов');renderItems('I4 · Функциональная грамотность / PISA',applyFilters(items))}).catch(function(e){setStatus(e.message)})}
  function showCross(){logNav('I3 cross-grade');setStatus('Загружаю сквозную диагностику…');load('cross_grade_diagnostic').then(function(j){var items=flatten(j);window.__wave91jLastItems=items;setStatus('Готово: '+j.track_count+' треков · '+items.length+' заданий');renderItems('I3 · Cross-grade diagnostic',applyFilters(items))}).catch(function(e){setStatus(e.message)})}
  function showEssay(){logNav('I5 final essay');setStatus('Загружаю темы сочинения…');load('final_essay_bank').then(function(j){var items=flatten(j);window.__wave91jLastItems=items;setStatus('Готово: '+items.length+' тем');renderItems('I5 · Итоговое сочинение',applyFilters(items))}).catch(function(e){setStatus(e.message)})}
  function showTextbooks(){
    logNav('I2/I6 textbooks'); setStatus('Загружаю привязки к учебникам…');
    load('textbook_bindings').then(function(j){
      var rows=j.bindings||[]; var grade=($('grade')&&$('grade').value)||''; var subject=($('subject')&&$('subject').value||'').toLowerCase().trim();
      var filtered=rows.filter(function(r){return (!grade||String(r.grade)===grade)&&(!subject||String(r.subject).toLowerCase().indexOf(subject)>=0)});
      setStatus('Готово: '+rows.length+' привязок');
      $('result').innerHTML='<div class="panel"><h2>I2/I6 · Учебники и параграфы</h2><p class="muted">Навигационные привязки без внешних ссылок: тренажёр подсказывает, какой параграф повторить перед серией задач.</p><div class="list">'+filtered.map(function(r){return '<article class="q"><div class="q-top"><div><span class="tag">'+esc(r.subject)+'</span><h3>'+esc(r.link_label)+'</h3></div><span class="meta">'+esc(r.grade)+' класс · '+esc(r.paragraph)+'</span></div><p class="muted"><b>Тема:</b> '+esc(r.topic)+' · <b>Учебник:</b> '+esc(r.textbook_author)+'</p><div class="answer">'+esc(r.note)+'</div></article>'}).join('')+'</div></div>';
    }).catch(function(e){setStatus(e.message)})
  }
  function exportCurrent(){var items=window.__wave91jLastItems||[];var payload=JSON.stringify({wave:'wave91j',exportedAt:new Date().toISOString(),items:items},null,2);try{var blob=new Blob([payload],{type:'application/json;charset=utf-8'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='trainer3_content_depth_export.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},0);setStatus('Экспортировано: '+items.length+' строк')}catch(e){setStatus('Не удалось экспортировать: '+e.message)}}
  function bind(){
    document.querySelectorAll('[data-wave91j-action]').forEach(function(b){b.addEventListener('click',function(){
      document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on')}); if(b.classList.contains('tab'))b.classList.add('on');
      var a=b.getAttribute('data-wave91j-action'); if(a==='training')showTraining(); else if(a==='pisa')showPisa(); else if(a==='cross')showCross(); else if(a==='essay')showEssay(); else if(a==='textbooks')showTextbooks(); else if(a==='export')exportCurrent();
    })});
    ['search','grade','subject'].forEach(function(id){var el=$(id);if(el)el.addEventListener('input',function(){var items=window.__wave91jLastItems||[];if(items.length)renderItems('Фильтрованный список',applyFilters(items))})});
  }
  function boot(){
    bind(); setStatus('Загружаю манифест…');
    fetchJson(MANIFEST).then(function(m){state.manifest=m; $('totalQuestions').textContent=String(m.total_questions||0); $('shards').textContent=String((m.shards||[]).length); $('features').textContent=String((m.features||[]).length); setStatus('Манифест загружен: '+(m.total_questions||0)+' вопросов'); showTraining();}).catch(function(e){setStatus('Ошибка манифеста: '+e.message); recordError(e.message)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
