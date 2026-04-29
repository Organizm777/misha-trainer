#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function scriptCount(html){ return (html.match(/<script\b[^>]*\bsrc=/g) || []).length; }

const sourceRel = 'assets/_src/js/bundle_grade_runtime_extended_wave89b.js';
const logical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const source = read(sourceRel);
const manifest = JSON.parse(read('assets/asset-manifest.json'));
const builtRel = manifest.assets && manifest.assets[logical];
assert.ok(builtRel, `asset-manifest missing ${logical}`);
assert.ok(exists(builtRel), `missing built runtime ${builtRel}`);
const built = read(builtRel);

const requiredMarkers = [
  'wave91g: visual content and interactive task formats',
  'geometrySvg',
  'geographySvg',
  'chemistrySvg',
  'physicsSvg',
  'worksheetHtml',
  'sortWidget',
  'matchWidget',
  'tableWidget',
  'graphWidget',
  'constructionWidget',
  'canvasWidget',
  'wave91gVisualInteractive'
];

for (const marker of requiredMarkers) {
  assert.ok(source.includes(marker), `source missing wave91g marker: ${marker}`);
  assert.ok(built.includes(marker), `built runtime missing wave91g marker: ${marker}`);
}

const supportKeys = [
  'E1-geometry-svg',
  'E2-geography-svg',
  'E3-chemistry-structures',
  'E5-print-worksheet-pdf',
  'E6-physics-schemes',
  'F1-sort',
  'F2-match',
  'F3-table',
  'F4-graph',
  'F5-construction',
  'F6-canvas'
];

for (const key of supportKeys) {
  assert.ok(source.includes(key), `source missing support key ${key}`);
}

assert.ok(source.includes('body.simple-mode .wave91g-main-card'), 'wave91g main card must respect simple-mode');
assert.ok(source.includes('window.wave91gVisualInteractive'), 'wave91g runtime should expose audit API');
assert.ok(!manifest.assets['assets/js/chunk_wave91g_visual_interactive.js'], 'wave91g should not add a separate eager runtime chunk');

const pages = Array.from({ length: 11 }, (_, idx) => `grade${idx + 1}_v2.html`);
const counts = {};
for (const page of pages) {
  const html = read(page);
  counts[page] = scriptCount(html);
  assert.ok(html.includes(`./${builtRel}`), `${page} should load the rebuilt extended runtime`);
  assert.ok(counts[page] <= 20, `${page} should stay under script budget, got ${counts[page]}`);
}

const healthz = JSON.parse(read('healthz.json'));
function waveRank(value){
  const raw = String(value || '').trim().toLowerCase();
  const match = raw.match(/^wave(\d+)([a-z]*)$/);
  if (!match) return -1;
  const major = Number(match[1]) || 0;
  const suffix = match[2] || '';
  let minor = 0;
  for (let i = 0; i < suffix.length; i += 1) minor = minor * 26 + (suffix.charCodeAt(i) - 96);
  return major * 1000 + minor;
}
assert.ok(waveRank(healthz.wave) >= waveRank('wave91g'), `healthz.wave should be wave91g+ (got ${healthz.wave})`);

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  builtRuntime: builtRel,
  sourceBytes: Buffer.byteLength(source),
  builtBytes: Buffer.byteLength(built),
  supportKeys,
  maxScripts: Math.max(...Object.values(counts))
}, null, 2));
