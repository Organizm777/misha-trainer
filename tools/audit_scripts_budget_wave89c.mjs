#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';

const ROOT = process.cwd();
const pages = Array.from({ length: 11 }, (_, idx) => `grade${idx + 1}_v2.html`);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'asset-manifest.json'), 'utf8'));
const healthz = JSON.parse(fs.readFileSync(path.join(ROOT, 'healthz.json'), 'utf8'));
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const mergedLogical = 'assets/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.js';
const mergedBuilt = manifest.assets[mergedLogical];
const legacyLogical = [
  'assets/js/chunk_subject_expansion_wave58_secondary_math_7_9.js',
  'assets/js/chunk_subject_expansion_wave59_physics_chemistry_7_9.js'
];

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function scriptCount(html){ return (html.match(/<script\b[^>]*\bsrc=/g) || []).length; }

assert.ok(/^(wave89c|wave89d)$/.test(healthz.wave), `healthz.wave should be wave89c/wave89d, got ${healthz.wave}`);
assert.ok(/^(wave89c|wave89d)$/.test(String(healthz.build_id || '')), `healthz.build_id should be wave89c/wave89d, got ${healthz.build_id}`);
assert.ok(/wave89[cd]/.test(String(healthz.cache || '')), `healthz.cache should reference wave89c/wave89d, got ${healthz.cache}`);
assert.equal(healthz.hashed_asset_count, Object.keys(manifest.assets || {}).length, 'healthz.hashed_asset_count mismatch');
assert.ok(mergedBuilt, `asset-manifest missing ${mergedLogical}`);
assert.ok(fs.existsSync(path.join(ROOT, mergedBuilt)), `missing built merged asset ${mergedBuilt}`);

for (const logical of legacyLogical) {
  assert.ok(!manifest.assets[logical], `asset-manifest should not keep legacy logical asset ${logical}`);
}
assert.ok(sw.includes(`./${mergedBuilt}`), 'sw.js should precache the merged 7-9 STEM chunk');
assert.ok(!/chunk_subject_expansion_wave58_secondary_math_7_9\.[a-f0-9]{10}\.js/.test(sw), 'sw.js should not precache legacy wave58 chunk');
assert.ok(!/chunk_subject_expansion_wave59_physics_chemistry_7_9\.[a-f0-9]{10}\.js/.test(sw), 'sw.js should not precache legacy wave59 chunk');

const counts = {};
for (const page of pages) {
  const html = read(page);
  const grade = Number(page.match(/grade(\d+)_/)[1]);
  counts[grade] = scriptCount(html);
  assert.ok(counts[grade] <= 20, `${page} should stay at or below 20 external scripts, got ${counts[grade]}`);
  if ([7, 8, 9].includes(grade)) {
    assert.ok(html.includes(`./${mergedBuilt}`), `${page} should load ${mergedBuilt}`);
    assert.ok(!/chunk_subject_expansion_wave58_secondary_math_7_9\.[a-f0-9]{10}\.js/.test(html), `${page} should not load legacy wave58 chunk`);
    assert.ok(!/chunk_subject_expansion_wave59_physics_chemistry_7_9\.[a-f0-9]{10}\.js/.test(html), `${page} should not load legacy wave59 chunk`);
  }
}

const report = {
  ok: true,
  wave: healthz.wave,
  mergedBuilt,
  counts,
  maxScripts: Math.max(...Object.values(counts)),
  hashedAssetCount: healthz.hashed_asset_count
};
console.log(JSON.stringify(report, null, 2));
