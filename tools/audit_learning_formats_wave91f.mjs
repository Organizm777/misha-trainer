#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'assets/asset-manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { assets: {} };
const built = manifest.assets && manifest.assets['assets/js/bundle_grade_runtime_extended_wave89b.js'];
const candidates = [
  'assets/_src/js/bundle_grade_runtime_extended_wave89b.js',
  built || 'assets/js/bundle_grade_runtime_extended_wave89b.js'
];
const required = [
  'wave91fLearningFormats',
  'Карта связей тем',
  'Дневник ошибок',
  'Марафон',
  'Сложность',
  'План к контрольной',
  'streak_freeze',
  'speechSynthesis',
  'auditSnapshot'
];
const report = { wave: 'wave91f', ok: true, runtimeBuilt: built || null, files: [] };
for (const rel of candidates) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    report.ok = false;
    report.files.push({ file: rel, exists: false, missing: required });
    continue;
  }
  const src = fs.readFileSync(abs, 'utf8');
  const missing = required.filter(token => !src.includes(token));
  const duplicateGuard = src.includes('window.__wave91fLearningPack');
  const hasPatch = src.includes('__wave91f') && src.includes('setTimeout(mount,0)');
  const ok = missing.length === 0 && duplicateGuard && hasPatch;
  if (!ok) report.ok = false;
  report.files.push({ file: rel, exists: true, bytes: src.length, duplicateGuard, hasPatch, missing, ok });
}
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
