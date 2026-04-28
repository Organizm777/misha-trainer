#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const manifest = JSON.parse(read('assets/asset-manifest.json'));
const index = read('index.html');
const sw = read('sw.js');

const retiredAssets = [
  'assets/js/chunk_roadmap_wave88a_daily_question.js',
  'assets/css/wave88a_daily_question.css'
];
const retiredBuilt = [
  'assets/js/chunk_roadmap_wave88a_daily_question.e88c38de95.js',
  'assets/css/wave88a_daily_question.28618f024e.css',
  'assets/_src/js/chunk_roadmap_wave88a_daily_question.js',
  'assets/_src/css/wave88a_daily_question.css'
];
const forbiddenPatterns = [
  'chunk_roadmap_wave88a_daily_question',
  'wave88a_daily_question',
  'wave88a-daily-question',
  'daily-question',
  'daily-card',
  'ЗАДАНИЕ ДНЯ'
];

const errors = [];
for (const logical of retiredAssets) {
  if (manifest.assets && Object.prototype.hasOwnProperty.call(manifest.assets, logical)) {
    errors.push(`asset-manifest should not contain retired asset ${logical}`);
  }
}
for (const rel of retiredBuilt) {
  if (exists(rel)) errors.push(`retired daily-question file should be removed: ${rel}`);
}
for (const pattern of forbiddenPatterns) {
  if (index.includes(pattern)) errors.push(`index.html still references ${pattern}`);
  if (sw.includes(pattern)) errors.push(`sw.js still references ${pattern}`);
}

const report = {
  ok: errors.length === 0,
  wave: 'wave91a',
  retired: true,
  reason: 'daily question removed from homepage and service-worker precache',
  checkedPatterns: forbiddenPatterns.length,
  errors
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
