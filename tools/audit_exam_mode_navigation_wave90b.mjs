#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRel = 'assets/_src/js/bundle_exam.js';
const manifestRel = 'assets/asset-manifest.json';

function read(rel){
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const manifest = JSON.parse(read(manifestRel));
const builtRel = manifest.assets && manifest.assets['assets/js/bundle_exam.js'];
const source = read(sourceRel);
const built = builtRel && fs.existsSync(path.join(root, builtRel)) ? read(builtRel) : '';

const requiredTokens = [
  'data-wave90b-task-index',
  'wave30-exam-review',
  'openExamReview',
  'finishExamPack',
  'goToExamTask',
  'rebuildExamGradeStats',
  'window.__wave30ExamUiState = { packId: packRuntime.id, flags: {}, visited: {} };',
  '"jump-task"',
  '"toggle-flag"',
  '"review-pack"',
  '"finish-pack"',
  'Проверка ответов — в конце.',
  'btn.classList.add(\'selected\')',
  "skipBtn.textContent = qIndex >= questions.length - 1 ? 'К финальной проверке →' : 'Дальше без ответа →';",
  "nextBtn.textContent = qIndex >= questions.length - 1 ? 'Финальная проверка →' : 'Следующее →';",
  'patchSelect()',
  'patchNext()',
  'patchSkip()',
  'openReview: openExamReview',
  'goToTask: goToExamTask'
];

const sourceMissing = requiredTokens.filter((token) => !source.includes(token));
const builtMissing = requiredTokens.filter((token) => !built.includes(token));

const result = {
  ok: false,
  wave: 'wave90b',
  sourceRel,
  builtRel: builtRel || null,
  requiredTokens: requiredTokens.length,
  sourceMissing,
  builtMissing,
  sourceTaskButtons: (source.match(/wave30-task-btn/g) || []).length,
  builtTaskButtons: (built.match(/wave30-task-btn/g) || []).length,
  sourceReviewButtons: (source.match(/wave30-review-btn/g) || []).length,
  builtReviewButtons: (built.match(/wave30-review-btn/g) || []).length
};

result.ok = !!(
  builtRel &&
  sourceMissing.length === 0 &&
  builtMissing.length === 0 &&
  result.sourceTaskButtons >= 3 &&
  result.builtTaskButtons >= 3 &&
  result.sourceReviewButtons >= 2 &&
  result.builtReviewButtons >= 2
);

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
