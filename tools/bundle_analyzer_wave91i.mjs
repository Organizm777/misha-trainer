#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const MAX_EAGER_KIB = 1500;
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function size(rel){ return exists(rel) ? fs.statSync(path.join(ROOT, rel)).size : 0; }
function scripts(page){
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  return Array.from(html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)).map(m => m[1].replace(/^\.\//,'')).filter(Boolean);
}
const pages = fs.readdirSync(ROOT).filter(n => /^grade\d+_v2\.html$/.test(n)).sort();
const pageBudgets = pages.map(page => {
  const list = scripts(page);
  const total = list.reduce((sum, rel) => sum + size(rel), 0);
  return { page, scripts:list.length, eagerKiB:Number((total/1024).toFixed(1)), totalBytes:total };
});
const max = pageBudgets.reduce((a,b) => !a || b.totalBytes > a.totalBytes ? b : a, null);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/asset-manifest.json'), 'utf8'));
const largest = Object.values(manifest.assets || {}).filter(rel => exists(rel)).map(rel => ({ rel, kib:Number((size(rel)/1024).toFixed(1)) })).sort((a,b)=>b.kib-a.kib).slice(0,12);
const failures = [];
if (max && max.eagerKiB > MAX_EAGER_KIB) failures.push(`grade eager JS over ${MAX_EAGER_KIB} KiB: ${max.page} ${max.eagerKiB} KiB`);
['assets/js/chunk_exam_bank_wave89q.js','assets/js/bundle_grade_runtime_extended_wave89b.js','assets/js/bundle_exam.js'].forEach(logical => {
  const built = manifest.assets && manifest.assets[logical];
  if (!built || !exists(built)) failures.push(`missing built asset ${logical}`);
});
const result = { ok: failures.length === 0, wave:manifest.wave || 'wave91i', mode: CHECK?'check':'report', maxGradeEager:max, largestAssets:largest, failures };
console.log(JSON.stringify(result, null, 2));
if (CHECK && failures.length) process.exit(1);
