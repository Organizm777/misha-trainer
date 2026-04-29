#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function fail(message, extra){ console.error(JSON.stringify({ ok:false, message, ...(extra||{}) }, null, 2)); process.exit(1); }
const manifest = JSON.parse(read('assets/asset-manifest.json'));
const assets = manifest.assets || {};
function asset(logical){ const v = assets[logical]; if (!v) fail('asset-manifest missing logical asset', { logical }); return v; }
const runtimeSrc = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const runtimeBuilt = asset('assets/js/bundle_grade_runtime_extended_wave89b.js');
const loaderBuilt = asset('assets/js/chunk_grade_lazy_payloads_wave91h.js');
const requiredRuntime = [
  'wave91hUxGamification', 'Notification.permission', 'quiet_hour', 'Heat map', 'Прогресс ФГОС',
  'parent_report', 'qrSvg', 'Daily quiz', 'Marathon leaderboard', 'seasonal-events'
];
for (const marker of requiredRuntime) if (!runtimeSrc.includes(marker)) fail('wave91h runtime marker missing', { marker });
if (!exists(runtimeBuilt)) fail('built wave91h runtime missing', { runtimeBuilt });
if (!exists(loaderBuilt)) fail('built wave91h lazy loader missing', { loaderBuilt });
const index = read('index.html');
const miniCount = (index.match(/daily-mini/g) || []).length;
if (miniCount < 11) fail('G8 daily mini-banner missing from class cards', { miniCount });
if (/daily-question|daily-card/.test(index)) fail('retired full daily-card leaked back into index');
const indexCss = read('assets/_src/css/wave86x_inline_index.css');
if (!indexCss.includes('.daily-mini')) fail('daily mini-banner CSS missing');
const removed = {
  'grade5_v2.html':['chunk_subject_expansion_wave60_biology_history_english_5_8','chunk_grade_content_wave86l_content_balance_wave86t'],
  'grade6_v2.html':['chunk_subject_expansion_wave60_biology_history_english_5_8'],
  'grade7_v2.html':['chunk_subject_expansion_wave89c_secondary_stem_7_9','chunk_subject_expansion_wave60_biology_history_english_5_8'],
  'grade8_v2.html':['chunk_subject_expansion_wave89c_secondary_stem_7_9','chunk_subject_expansion_wave60_biology_history_english_5_8','chunk_subject_expansion_wave38_content_consolidation'],
  'grade9_v2.html':['chunk_subject_expansion_wave89c_secondary_stem_7_9'],
  'grade11_v2.html':['chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d']
};
const budget = 1500 * 1024;
let max = { page:'', bytes:0, scripts:0 };
for (const page of fs.readdirSync(ROOT).filter(n => /^grade\d+_v2\.html$/.test(n))) {
  const html = read(page);
  if (!html.includes(loaderBuilt)) fail('grade page missing wave91h lazy loader', { page, loaderBuilt });
  if (!html.includes('rel="modulepreload"') || !html.includes(asset('assets/js/bundle_grade_runtime_core_wave87n.js'))) fail('J8 modulepreload missing for core runtime', { page });
  if (!html.includes(asset('assets/js/bundle_grade_runtime_extended_wave89b.js'))) fail('grade page missing current extended runtime', { page });
  for (const marker of removed[page] || []) if (html.includes(marker)) fail('lazy payload still eagerly referenced', { page, marker });
  const scripts = [...html.matchAll(/<script[^>]+src="\.\/([^"]+)"/g)].map(m => m[1]);
  const bytes = scripts.reduce((sum, rel) => sum + (exists(rel) ? fs.statSync(path.join(ROOT, rel)).size : 0), 0);
  if (bytes > max.bytes) max = { page, bytes, scripts:scripts.length };
  if (bytes > budget) fail('J7 eager JS budget exceeded', { page, bytes, limit:budget, scripts:scripts.length });
}
if (manifest.brotli_count == null || manifest.brotli_count < 20) fail('J4 brotli metadata missing or too low', { brotli_count:manifest.brotli_count });
const brMissing = [runtimeBuilt + '.br', loaderBuilt + '.br', asset('assets/css/wave86x_inline_index.css') + '.br'].filter(rel => !exists(rel));
if (brMissing.length) fail('J4 representative brotli files missing', { brMissing });
console.log(JSON.stringify({ ok:true, wave:'wave91h', maxEagerKiB:Math.round(max.bytes/1024*10)/10, maxPage:max.page, maxScripts:max.scripts, dailyMiniCount:miniCount, brotliCount:manifest.brotli_count, loader:loaderBuilt }, null, 2));
