import fs from 'fs';
import path from 'path';
const root=process.cwd();
const htmlFiles=fs.readdirSync(root).filter(f=>f.endsWith('.html')).sort();
function localPath(ref){return ref.replace(/^\.\//,'');}
function bytes(ref){const p=path.join(root,localPath(ref)); return fs.existsSync(p)?fs.statSync(p).size:0;}
const pages=[];
for(const file of htmlFiles){const html=fs.readFileSync(file,'utf8'); const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map(m=>m[1]); const styles=[...html.matchAll(/<link\b(?=[^>]*rel="stylesheet")(?=[^>]*href="([^"]+)")[^>]*>/g)].map(m=>m[1]); pages.push({file,grade:/^grade\d+_v2\.html$/.test(file),scriptCount:scripts.length,stylesheetCount:styles.length,localJsBytes:scripts.filter(s=>s.startsWith('./')).reduce((n,s)=>n+bytes(s),0),localCssBytes:styles.filter(s=>s.startsWith('./')).reduce((n,s)=>n+bytes(s),0)});}
const gradePages=pages.filter(p=>p.grade); const maxGradeScripts=Math.max(...gradePages.map(p=>p.scriptCount)); const maxGradeJsBytes=Math.max(...gradePages.map(p=>p.localJsBytes));
const result={ok:maxGradeScripts<=20&&maxGradeJsBytes<=1900000,wave:'wave86z',note:'Static proxy for N10. Real-device Lighthouse/FCP/LCP still needs browser hardware, but this guards request-count and local payload regressions.',baselineFromReview:{maxGradeScriptsBeforeWave86z:31},budgets:{maxGradeScripts:20,maxGradeJsBytes:1900000},summary:{maxGradeScripts,maxGradeJsBytes,pageCount:pages.length,gradePageCount:gradePages.length},gradePages:gradePages.map(({file,scriptCount,stylesheetCount,localJsBytes,localCssBytes})=>({file,scriptCount,stylesheetCount,localJsBytes,localCssBytes}))};
console.log(JSON.stringify(result,null,2)); if(!result.ok) process.exit(1);
