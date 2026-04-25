#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(condition, message){ if (!condition) throw new Error(message); }
function count(raw, pattern){ const match = raw.match(pattern); return match ? match.length : 0; }

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const logical = 'assets/js/bundle_grade_runtime_inputs_timing_wave87x.js';
const builtRel = manifest.assets && manifest.assets[logical];
assert(builtRel, `asset-manifest.json: missing ${logical}`);
assert(exists(builtRel), `missing built runtime ${builtRel}`);

const runtimeSrc = read('assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js');
assert(runtimeSrc.includes('window.__wave87xInputTimingRuntime'), 'runtime source: missing wave87x guard export');
assert(runtimeSrc.includes('function inputModeFor') && runtimeSrc.includes('function matchInput'), 'runtime source: missing input mode helpers');
assert(runtimeSrc.includes('function captureTiming') && runtimeSrc.includes('function appendTimingProgress'), 'runtime source: missing timing helpers');
assert(runtimeSrc.includes('trainer_response_timing_') && runtimeSrc.includes('bindKeyboardGuard'), 'runtime source: missing storage key or keyboard guard');

const pageChecks = [];
for (let grade = 1; grade <= 11; grade++) {
  const htmlFile = `grade${grade}_v2.html`;
  const html = read(htmlFile);
  const hasRuntime = html.includes('./' + builtRel);
  assert(hasRuntime, `${htmlFile}: missing ${builtRel}`);
  pageChecks.push({ grade, hasRuntime });
}
assert(read('sw.js').includes(`'./${builtRel}'`), `sw.js: missing ${builtRel}`);

const contentChecks = [
  { file:'assets/_src/js/grade8_data.js', topicId:'cloze8w87x' },
  { file:'assets/_src/js/grade9_data.js', topicId:'cloze9w87x' },
  { file:'assets/_src/js/grade11_data.js', topicId:'cloze11w87x' },
  { file:'assets/_src/js/grade10_subject_rus_wave86s.js', topicId:'cloze10w87x' }
];
const contentSummary = [];
for (const item of contentChecks) {
  const raw = read(item.file);
  assert(raw.includes(item.topicId), `${item.file}: missing ${item.topicId}`);
  assert(raw.includes("inputMode = 'cloze'"), `${item.file}: missing explicit cloze input mode`);
  contentSummary.push({
    file: item.file,
    topicId: item.topicId,
    blankMarkers: count(raw, /___/g)
  });
}

const englishSources = [
  'assets/_src/js/chunk_grade_content_wave12_english_wave86t.js',
  'assets/_src/js/chunk_grade_content_wave13_english_wave86t.js',
  'assets/_src/js/bundle_boosters.js'
];
const englishBlankCount = englishSources.reduce((sum, rel) => sum + count(read(rel), /___/g), 0);
assert(englishBlankCount >= 100, `expected at least 100 existing english blank markers, got ${englishBlankCount}`);

const healthz = JSON.parse(read('healthz.json'));
assert(/^(wave87[xyz]|wave88[abc])$/.test(healthz.wave), `healthz.json: expected wave87x/wave87y/wave87z/wave88a/wave88b/wave88c, got ${healthz.wave}`);
assert(/^(wave87[xyz]|wave88[abc])$/.test(healthz.build_id), `healthz.json: expected build_id wave87x/wave87y/wave87z/wave88a/wave88b/wave88c, got ${healthz.build_id}`);
assert(healthz.hashed_asset_count === Object.keys(manifest.assets || {}).length, 'healthz.json: hashed_asset_count mismatch');

const docRel = 'docs/FREE_INPUT_TIMING_wave87x.md';
assert(exists(docRel), `missing ${docRel}`);

console.log(JSON.stringify({
  logical,
  builtRel,
  healthzWave: healthz.wave,
  englishBlankCount,
  pageChecks,
  contentSummary,
  hashedAssetCount: Object.keys(manifest.assets || {}).length
}, null, 2));
