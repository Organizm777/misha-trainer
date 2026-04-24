#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function assert(condition, message){ if (!condition) throw new Error(message); }

const checks = [
  { file:'assets/_src/js/grade8_data.js', marker:'wave87v rich-content injections: grade8', ids:['formula8w87v','calc8w87v','code8w87v'] },
  { file:'assets/_src/js/grade9_data.js', marker:'wave87v rich-content injections: grade9', ids:['formula9w87v','calc9w87v','code9w87v'] },
  { file:'assets/_src/js/grade11_data.js', marker:'wave87v rich-content injections: grade11', ids:['formula11w87v','calc11w87v','code11w87v'] },
  { file:'assets/_src/js/grade10_subject_alg_wave86s.js', marker:'wave87v rich-content injection: grade10 alg', ids:['formula10w87v'] },
  { file:'assets/_src/js/grade10_subject_phy_wave86s.js', marker:'wave87v rich-content injection: grade10 phy', ids:['calc10w87v'] },
  { file:'assets/_src/js/grade10_subject_inf_wave86s.js', marker:'wave87v rich-content injection: grade10 inf', ids:['code10w87v'] },
  { file:'assets/_src/js/grade10_subject_chem_wave86s.js', marker:'wave87v rich-content injection: grade10 chem', ids:['chemcalc10w87v'] },
  { file:'assets/_src/js/chunk_subject_expansion_wave59_physics_chemistry_7_9.js', marker:'wave87v rich-content chemistry injections: grades 8-9', ids:['chemcalc8w87v','chemcalc9w87v'] },
  { file:'assets/_src/js/chunk_subject_expansion_wave61_senior_school_10_11.js', marker:'wave87v rich-content chemistry injection: grade11', ids:['chemcalc11w87v'] }
];

const summary = { filesChecked: 0, idsChecked: 0, codeBlocks: 0, mathFlags: 0, results: [] };
for (const item of checks){
  const raw = read(item.file);
  assert(raw.includes(item.marker), `${item.file}: missing marker ${item.marker}`);
  for (const id of item.ids){
    assert(raw.includes(id), `${item.file}: missing topic id ${id}`);
    summary.idsChecked += 1;
  }
  summary.filesChecked += 1;
  summary.codeBlocks += (raw.match(/code:`/g) || []).length;
  summary.mathFlags += (raw.match(/isMath:true/g) || []).length;
  summary.results.push({ file: item.file, ids: item.ids.length });
}
assert(summary.codeBlocks >= 18, `expected at least 18 inline code blocks, got ${summary.codeBlocks}`);
assert(summary.mathFlags >= 40, `expected at least 40 math-rich rows, got ${summary.mathFlags}`);
console.log(JSON.stringify(summary, null, 2));
