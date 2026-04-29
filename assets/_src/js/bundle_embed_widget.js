(function(){
  'use strict';
  var params=new URLSearchParams(location.search);var grade=params.get('grade')||'7';var subject=(params.get('subject')||'').toLowerCase();
  function $(id){return document.getElementById(id)}function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function fetchJson(p){return fetch(p).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
  function boot(){fetchJson('./assets/data/content_depth/school_question_pack_middle.json').then(function(j){var rows=(j.items||[]).filter(function(q){return String(q.grade)===grade&&(!subject||String(q.subject).toLowerCase().indexOf(subject)>=0)}).slice(0,5);if(!rows.length)rows=(j.items||[]).slice(0,5);$('embedTitle').textContent='Тренажёр · '+grade+' класс';$('embedList').innerHTML=rows.map(function(q){return '<article class="q"><h3>'+esc(q.q)+'</h3><p class="muted">Ответ: '+esc(q.a)+'</p></article>'}).join('')}).catch(function(e){$('embedList').textContent='Ошибка загрузки: '+e.message})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
