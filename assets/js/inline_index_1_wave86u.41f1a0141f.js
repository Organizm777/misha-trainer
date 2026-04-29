(function(){try{var qs=new URLSearchParams(location.search||'');if(qs.get('lhci')==='1'||navigator.webdriver)return}catch(_err){}if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{})}})();
/* wave92a: my class, resume, backup import/export */
(function(){
  'use strict';
  var KEY_GRADE='trainer_my_grade_wave92a', KEY_LAST='trainer_last_session_wave92a';
  function S(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}}
  function R(k,f){try{var v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(_){return f}}
  function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function dl(name,body,type){try{var u=URL.createObjectURL(new Blob([body],{type:type||'application/json;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},250)}catch(_){}}
  function collect(){var data={app:'trainer3',wave:'wave92a',ts:new Date().toISOString(),localStorage:{}};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^trainer_|^(iq_|style_|temp_|motiv_|anxiety_|holland_|psychknow_)/.test(k))data.localStorage[k]=localStorage.getItem(k)}}catch(_){}return data}
  function restore(obj){if(!obj||obj.app!=='trainer3'||!obj.localStorage)throw new Error('Неверный формат backup');Object.keys(obj.localStorage).forEach(function(k){try{localStorage.setItem(k,String(obj.localStorage[k]))}catch(_){}})}
  function card(){
    var header=document.querySelector('.header'); if(!header||document.getElementById('wave92a-index-quick'))return;
    var my=R(KEY_GRADE,''), last=R(KEY_LAST,null)||{};
    var myHref=my?('grade'+my+'_v2.html'):'';
    var c=document.createElement('section'); c.id='wave92a-index-quick'; c.className='wave92a-index-quick';
    c.innerHTML='<div><b>Быстрый вход</b><p>Выбери «мой класс», продолжай последнюю сессию и храни backup локальных данных.</p></div>'+
      '<div class="wave92a-index-actions">'+
      '<select id="wave92a-my-grade" aria-label="Мой класс"><option value="">Мой класс…</option>'+Array.from({length:11},function(_,i){var g=i+1;return '<option value="'+g+'"'+(String(my)===String(g)?' selected':'')+'>'+g+' класс</option>'}).join('')+'</select>'+
      '<a class="wave92a-index-btn primary" id="wave92a-open-my" href="'+(myHref||'#')+'">Мой класс</a>'+
      '<a class="wave92a-index-btn" id="wave92a-continue" href="'+esc(last.url||myHref||'#')+'">Продолжить'+(last.grade?' · '+esc(last.grade)+' кл':'')+'</a>'+
      '<button class="wave92a-index-btn" id="wave92a-export" type="button">Экспорт</button>'+
      '<button class="wave92a-index-btn" id="wave92a-import" type="button">Импорт</button>'+
      '<input id="wave92a-import-file" type="file" accept="application/json,.json" hidden></div>';
    header.insertAdjacentElement('afterend',c);
    var sel=c.querySelector('#wave92a-my-grade'), open=c.querySelector('#wave92a-open-my'), cont=c.querySelector('#wave92a-continue');
    sel.onchange=function(){var g=sel.value;S(KEY_GRADE,g);open.href=g?('grade'+g+'_v2.html'):'#'; if(!last.url)cont.href=open.href;};
    open.onclick=function(ev){if(!sel.value){ev.preventDefault();sel.focus();}};
    cont.onclick=function(ev){if(!cont.getAttribute('href')||cont.getAttribute('href')==='#'){ev.preventDefault();sel.focus();}};
    c.querySelector('#wave92a-export').onclick=function(){dl('trainer3_backup_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(collect(),null,2))};
    var input=c.querySelector('#wave92a-import-file');
    c.querySelector('#wave92a-import').onclick=function(){input.click()};
    input.onchange=function(){var f=input.files&&input.files[0]; if(!f)return; var r=new FileReader();r.onload=function(){try{restore(JSON.parse(r.result));alert('Backup импортирован. Обнови страницу.')}catch(e){alert('Не удалось импортировать: '+e.message)}};r.readAsText(f)};
  }
  function clicks(){document.querySelectorAll('a[href^="grade"][href$="_v2.html"]').forEach(function(a){if(a.__wave92a)return;a.__wave92a=1;a.addEventListener('click',function(){var m=/grade(\d+)_v2/.exec(a.getAttribute('href')||'');if(m){S(KEY_LAST,{grade:m[1],url:a.getAttribute('href'),ts:Date.now()});if(!R(KEY_GRADE,''))S(KEY_GRADE,m[1])}})})}
  function boot(){card();clicks()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
