#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function json(rel){ return JSON.parse(read(rel)); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
const expected = {
  'assets/data/exam_bank/oge_informatics_2026_foundation.json': { variants:30, items:450, exam:'ОГЭ', subject:'informatics' },
  'assets/data/exam_bank/ege_informatics_2026_foundation.json': { variants:30, items:450, exam:'ЕГЭ', subject:'informatics' },
  'assets/data/exam_bank/oge_history_2026_foundation.json': { variants:20, items:480, exam:'ОГЭ', subject:'history' },
  'assets/data/exam_bank/ege_history_2026_foundation.json': { variants:20, items:400, exam:'ЕГЭ', subject:'history' }
};
const failures = [];
for (const [rel, spec] of Object.entries(expected)) {
  if (!exists(rel)) { failures.push(`missing ${rel}`); continue; }
  const data = json(rel);
  const variants = Array.isArray(data.variants) ? data.variants.length : 0;
  const items = Array.isArray(data.items) ? data.items.length : Number(data.item_count||0);
  if (variants !== spec.variants) failures.push(`${rel}: expected ${spec.variants} variants, got ${variants}`);
  if (items !== spec.items) failures.push(`${rel}: expected ${spec.items} items, got ${items}`);
  if (!Array.isArray(data.items)) failures.push(`${rel}: items array missing`);
  else {
    const badExam = data.items.filter(x => x.exam !== spec.exam).length;
    const badSubject = data.items.filter(x => x.subject !== spec.subject).length;
    const incomplete = data.items.filter(x => !x.q || !x.a || !Array.isArray(x.o) || x.o.length < 4 || !x.ex || !x.h).length;
    if (badExam) failures.push(`${rel}: ${badExam} rows have wrong exam`);
    if (badSubject) failures.push(`${rel}: ${badSubject} rows have wrong subject`);
    if (incomplete) failures.push(`${rel}: ${incomplete} incomplete rows`);
  }
}
const catalog = json('assets/data/exam_bank/catalog.json');
['oge_informatics_full_v1','ege_informatics_part1_v1','oge_history_full_v1','ege_history_part1_v1'].forEach(id => {
  if (!catalog.structures || !catalog.structures[id]) failures.push(`catalog missing structure ${id}`);
});
['oge_informatics_2026_full','ege_informatics_2026_part1','oge_history_2026_full','ege_history_2026_part1'].forEach(family => {
  if (!JSON.stringify(catalog).includes(family)) failures.push(`catalog missing family ${family}`);
});
const profile = json('assets/data/exam_bank/ege_profile_math_2026_foundation.json');
const profileRows = Array.isArray(profile.items) ? profile.items : [];
const missingSteps = profileRows.filter(x => !Array.isArray(x.solution_steps) || x.solution_steps.length < 3).length;
if (profileRows.length < 600) failures.push(`profile math expected at least 600 rows, got ${profileRows.length}`);
if (missingSteps) failures.push(`profile math rows without solution_steps: ${missingSteps}`);
const bundle = read('assets/_src/js/bundle_exam.js');
['oge_informatics_2026_full','ege_informatics_2026_part1','oge_history_2026_full','ege_history_2026_part1','buildSolutionStepsReview','solution_steps'].forEach(token => {
  if (!bundle.includes(token)) failures.push(`bundle_exam.js missing ${token}`);
});
const shell = read('assets/_src/js/chunk_exam_bank_wave89q.js');
['exam_bank_oge_informatics_wave91i','exam_bank_ege_informatics_wave91i','exam_bank_oge_history_wave91i','exam_bank_ege_history_wave91i'].forEach(token => {
  if (!shell.includes(token)) failures.push(`exam shell missing ${token}`);
});
const manifest = json('assets/asset-manifest.json');
['assets/js/exam_bank_oge_informatics_wave91i.js','assets/js/exam_bank_ege_informatics_wave91i.js','assets/js/exam_bank_oge_history_wave91i.js','assets/js/exam_bank_ege_history_wave91i.js'].forEach(logical => {
  if (!manifest.assets || !manifest.assets[logical]) failures.push(`manifest missing ${logical}`);
  else if (!exists(manifest.assets[logical])) failures.push(`hashed asset missing for ${logical}: ${manifest.assets[logical]}`);
});
const result = {
  ok: failures.length === 0,
  wave: 'wave91i',
  newBanks: 4,
  profileMathRowsWithSteps: profileRows.length - missingSteps,
  structures: catalog.structures ? Object.keys(catalog.structures).length : 0,
  failures
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
