#!/usr/bin/env node
import fs from 'fs';
import vm from 'vm';
const artSrc = fs.readFileSync('assets/_src/js/grade10_subject_art_wave86s.js','utf8');
const dataSrc = fs.readFileSync('assets/_src/js/grade10_data.js','utf8');
const expected = {design_xx:'Дизайн XX–XXI веков',fashion_illustration:'Фэшн-иллюстрация',costume_art:'Костюм в искусстве',poster_graphics:'Плакат и графика',industrial_design:'Промышленный дизайн'};
const failures=[];
for (const [id,name] of Object.entries(expected)){
  if(!dataSrc.includes(`"id":"${id}"`)) failures.push(`grade10_data missing ${id}`);
  if(!dataSrc.includes(`"nm":"${name}"`)) failures.push(`grade10_data missing name ${name}`);
  if(!artSrc.includes(`id:"${id}"`)) failures.push(`art payload missing ${id}`);
  if(!artSrc.includes(`ART_TH.${id}`)) failures.push(`theory binding missing ${id}`);
}
let applied=null;
let pickIndex=0;
const sandbox={window:{GRADE_NUM:'10',__wave86sApplyGrade10Subject(id,payload){applied={id,payload};return true;}},console,Math,String,Array,Object,Date,pick(list){const row=list[pickIndex%list.length]; pickIndex+=1; return row;},shuffle(list){return Array.isArray(list)?list.slice():list;},mkQ(q,a,o,h,tag,cl,bg){return {q,a,o,h,tag,cl,bg};}};
vm.createContext(sandbox);
try{vm.runInContext(artSrc,sandbox,{filename:'grade10_subject_art_wave86s.js'});}catch(err){failures.push(`execution failed: ${err.message}`);}
if(!applied||applied.id!=='art') failures.push('art payload not applied');
else{
 const topics=applied.payload?.topics||[]; const topicMap=new Map(topics.map(t=>[t.id,t]));
 if(topics.length<9) failures.push(`expected at least 9 topics, got ${topics.length}`);
 for(const [id,name] of Object.entries(expected)){
  const topic=topicMap.get(id);
  if(!topic){failures.push(`applied missing ${id}`); continue;}
  if(topic.nm!==name) failures.push(`name mismatch ${id}: ${topic.nm}`);
  if(!topic.th||!String(topic.th).includes('<h3>')) failures.push(`missing theory ${id}`);
  if(typeof topic.gen!=='function') failures.push(`missing gen ${id}`);
  else{ const seen=new Set(); for(let i=0;i<30;i++){const q=topic.gen(); if(!q||!q.q||!q.a||!Array.isArray(q.o)||q.o.length<4) failures.push(`invalid question ${id}`); else seen.add(q.q);} if(seen.size<15) failures.push(`expected 15 reachable questions for ${id}, got ${seen.size}`); }
 }
}
if(failures.length){console.error('[wave91c] Art history audit failed:'); failures.forEach(f=>console.error('-',f)); process.exit(1);}
console.log(JSON.stringify({ok:true,wave:'wave91c',artTopicsAdded:Object.keys(expected).length,totalAppliedTopics:applied.payload.topics.length},null,2));
