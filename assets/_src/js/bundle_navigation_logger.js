(function(){
  'use strict';
  var KEY='trainer_navigation_log_wave91j';
  var MAX=160;
  function parse(raw,fallback){try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}}
  function read(){try{var rows=parse(localStorage.getItem(KEY),[]);return Array.isArray(rows)?rows:[]}catch(_){return []}}
  function write(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-MAX)))}catch(_){}}
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim().slice(0,180)}
  function record(evt){
    var entry={ts:new Date().toISOString(),page:location.pathname||'/',kind:evt&&evt.kind||'navigation',target:clean(evt&&evt.target),href:clean(evt&&evt.href),meta:evt&&evt.meta||null};
    var rows=read(); rows.push(entry); write(rows);
    try{window.dispatchEvent(new CustomEvent('trainer:navigation-log',{detail:entry}))}catch(_){}
    return entry;
  }
  function download(){
    var payload=JSON.stringify({wave:'wave91j',exportedAt:new Date().toISOString(),rows:read()},null,2);
    try{var blob=new Blob([payload],{type:'application/json;charset=utf-8'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='trainer-navigation-log.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},0);return true}catch(_){return false}
  }
  window.TrainerNavigationLog={version:'wave91j',key:KEY,record:record,read:read,clear:function(){write([])},download:download};
  document.addEventListener('click',function(ev){
    var el=ev.target&&ev.target.closest?ev.target.closest('a,button,[data-action],[data-wave87r-action],[data-wave91j-action]'):null;
    if(!el)return;
    record({kind:el.tagName==='A'?'link':'action',target:el.getAttribute('aria-label')||el.textContent||el.getAttribute('data-action')||el.getAttribute('data-wave87r-action')||'',href:el.getAttribute('href')||'',meta:{id:el.id||'',className:clean(el.className||'')}});
  },true);
  record({kind:'pageview',target:document.title||location.pathname,href:location.href});
})();
