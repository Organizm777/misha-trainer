(function(){
  'use strict';
  var MANIFEST='./assets/data/content_depth/manifest.json';
  var store={manifest:null,items:[]};
  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function fetchJson(path){return fetch(path).then(function(r){if(!r.ok)throw new Error(path+' '+r.status);return r.json()})}
  function flatten(data){if(Array.isArray(data.items))return data.items;if(Array.isArray(data.cases))return data.cases.flatMap(function(c){return c.questions||[]});if(Array.isArray(data.tracks))return data.tracks.flatMap(function(t){return t.items||[]});if(Array.isArray(data.topics))return data.topics;return[]}
  function setStatus(s){$('teacherStatus').textContent=s}
  function render(rows){$('teacherResult').innerHTML=rows.map(function(q,i){return '<article class="q"><span class="tag">#'+(i+1)+' · '+esc(q.subject||q.direction||q.kind||'задание')+'</span><h3>'+esc(q.q||q.question)+'</h3><p class="muted">Ответ: '+esc(q.a||q.answer||'')+'</p></article>'}).join('')}
  function build(){var grade=$('teacherGrade').value, count=Number($('teacherCount').value)||10, bank=$('teacherBank').value;var shard=(store.manifest.shards||[]).find(function(s){return s.kind===bank});if(!shard)return;setStatus('Загружаю банк…');fetchJson(shard.path).then(function(data){var rows=flatten(data).filter(function(q){return !grade||String(q.grade||q.target_grade||'')===grade});rows=rows.slice(0,count);store.items=rows;render(rows);setStatus('Назначение готово: '+rows.length+' заданий')}).catch(function(e){setStatus(e.message)})}
  function exportJson(){var payload=JSON.stringify({wave:'wave91j',type:'teacher-assignment',createdAt:new Date().toISOString(),items:store.items},null,2);try{var blob=new Blob([payload],{type:'application/json;charset=utf-8'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='trainer3_teacher_assignment.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},0)}catch(_){}}
  function boot(){return; /* wave92j: teacher mode disabled */ fetchJson(MANIFEST).then(function(m){store.manifest=m;setStatus('Манифест: '+m.total_questions+' вопросов');build()}).catch(function(e){setStatus(e.message)});$('teacherBuild').onclick=build;$('teacherExport').onclick=exportJson}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
