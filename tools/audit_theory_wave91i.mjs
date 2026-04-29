#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
const failures = [];
const olyShell = read('assets/_src/js/grade10_subject_oly_wave86s.js');
['strategy','Стратегии решения','grade10_subject_oly_strategy_wave91i','wave91i'].forEach(token => {
  if (!olyShell.includes(token)) failures.push(`grade10 olympiad shell missing ${token}`);
});
const strategySrc = 'assets/_src/js/grade10_subject_oly_strategy_wave91i.js';
if (!exists(strategySrc)) failures.push(`missing ${strategySrc}`);
else {
  const strategy = read(strategySrc);
  ['__wave87cApplyOlyTopic','Стратегии решения','инвариант','контрпример'].forEach(token => {
    if (!strategy.includes(token)) failures.push(`strategy chunk missing ${token}`);
  });
}
const runtime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const theoryChunk = read('assets/_src/js/chunk_theory_wave91i.js');
['__wave91iTheoryLoader','chunk_theory_wave91i'].forEach(token => {
  if (!runtime.includes(token)) failures.push(`extended runtime missing lazy loader ${token}`);
});
['wave91iTheoryPatch','wave91i-c3-algebra','wave91i-c3-physics','wave91i-c3-chemistry','wave91i-c3-informatics','wave91i-c4-social','wave91i-c4-probability'].forEach(token => {
  if (!theoryChunk.includes(token)) failures.push(`chunk_theory_wave91i.js missing ${token}`);
});
const manifest = JSON.parse(read('assets/asset-manifest.json'));
['assets/js/grade10_subject_oly_strategy_wave91i.js','assets/js/grade10_subject_oly_wave86s.js','assets/js/bundle_grade_runtime_extended_wave89b.js','assets/js/chunk_theory_wave91i.js'].forEach(logical => {
  if (!manifest.assets || !manifest.assets[logical]) failures.push(`manifest missing ${logical}`);
  else if (!exists(manifest.assets[logical])) failures.push(`hashed asset missing for ${logical}: ${manifest.assets[logical]}`);
});
const result = { ok: failures.length === 0, wave:'wave91i', checks:['C2-olympiad-strategies','C3-formulas-code','C4-social-probability'], failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
