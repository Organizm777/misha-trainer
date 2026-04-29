#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
const failures = [];
const mustExist = [
  'playwright.config.mjs',
  'tests/e2e/wave91j_content_depth.spec.mjs',
  'staging.html',
  'landing.html',
  'teacher.html',
  'embed.html',
  'assets/data/api/trainer3_content_api.json',
  'docs/STAGING_wave91j.md',
  'docs/CONTENT_DEPTH_wave91j.md'
];
for (const rel of mustExist) if (!exists(rel)) failures.push('missing ' + rel);
const manifest = JSON.parse(read('assets/asset-manifest.json'));
const assets = manifest.assets || {};
[
  'assets/js/bundle_navigation_logger.js',
  'assets/js/bundle_content_depth.js',
  'assets/js/bundle_teacher_mode.js',
  'assets/js/bundle_embed_widget.js',
  'assets/css/wave91j_content_depth.css'
].forEach(logical => { if (!assets[logical] || !exists(assets[logical])) failures.push('missing built asset ' + logical); });
const navSrc = read('assets/_src/js/bundle_navigation_logger.js');
if (!navSrc.includes('trainer_navigation_log_wave91j') || !navSrc.includes('TrainerNavigationLog')) failures.push('navigation logger markers missing');
const errSrc = read('assets/_src/js/bundle_error_tracking.js');
if (!errSrc.includes('navigationContext') || !errSrc.includes('wave91j')) failures.push('error tracking wave91j context missing');
const api = JSON.parse(read('assets/data/api/trainer3_content_api.json'));
if (!api.endpoints || !api.endpoints.some(e => e.name === 'content_depth_manifest')) failures.push('static API endpoint manifest missing');
const pw = read('tests/e2e/wave91j_content_depth.spec.mjs');
['content_depth.html','teacher.html','embed.html'].forEach(token => { if (!pw.includes(token)) failures.push('Playwright spec missing ' + token); });
const htmlRefs = {
  'teacher.html':'bundle_teacher_mode.',
  'embed.html':'bundle_embed_widget.',
  'landing.html':'bundle_navigation_logger.',
  'staging.html':'bundle_navigation_logger.',
  'index.html':'bundle_navigation_logger.'
};
for (const [page, token] of Object.entries(htmlRefs)) {
  if (!read(page).includes(token)) failures.push(page + ' missing ' + token);
}
const result = { ok: failures.length === 0, wave:'wave91j', checks:mustExist.length, builtAssets:Object.keys(assets).length, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
