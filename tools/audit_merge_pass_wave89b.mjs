#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);

function read(rel){
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}
function readJSON(rel){
  return JSON.parse(read(rel));
}
function exists(rel){
  return fs.existsSync(path.join(repoRoot, rel));
}
function scriptCount(html){
  return (html.match(/<script\b/gi) || []).length;
}

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const assets = manifest.assets || {};
const runtimeLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const banksLogical = 'assets/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.js';
const runtimeBuilt = assets[runtimeLogical];
const banksBuilt = assets[banksLogical];
assert(runtimeBuilt, `asset-manifest: missing ${runtimeLogical}`);
assert(banksBuilt, `asset-manifest: missing ${banksLogical}`);
assert(exists(runtimeBuilt), `built runtime missing: ${runtimeBuilt}`);
assert(exists(banksBuilt), `built banks chunk missing: ${banksBuilt}`);

const removedLogicalAssets = [
  'assets/js/bundle_grade_runtime_interactions_wave87w.js',
  'assets/js/bundle_grade_runtime_inputs_timing_wave87x.js',
  'assets/js/bundle_grade_runtime_keyboard_wave88c.js',
  'assets/js/bundle_grade_runtime_breadcrumbs_wave88d.js',
  'assets/js/chunk_subject_expansion_wave87y_free_input_banks.js',
  'assets/js/chunk_subject_expansion_wave87z_text_input_banks.js',
  'assets/js/chunk_subject_expansion_wave88b_multi_select_banks.js'
];
for (const logical of removedLogicalAssets) {
  assert(!assets[logical], `asset-manifest: legacy logical asset should be removed after merge pass: ${logical}`);
}

assert(/^wave89[a-z]+$/i.test(String(healthz.wave || '')), `healthz.wave should stay on a wave89* build, got ${healthz.wave}`);
assert(String(healthz.cache || '').includes(String(healthz.build_id || '')), `healthz.cache should reference healthz.build_id, got ${healthz.cache}`);

const legacyBaseRe = /assets\/js\/(bundle_grade_runtime_interactions_wave87w|bundle_grade_runtime_inputs_timing_wave87x|bundle_grade_runtime_keyboard_wave88c|bundle_grade_runtime_breadcrumbs_wave88d|chunk_subject_expansion_wave87y_free_input_banks|chunk_subject_expansion_wave87z_text_input_banks|chunk_subject_expansion_wave88b_multi_select_banks)\.[a-f0-9]{10}\.js/g;

const counts = {};
for (let grade = 1; grade <= 11; grade += 1) {
  const rel = `grade${grade}_v2.html`;
  const html = read(rel);
  counts[grade] = scriptCount(html);
  assert(html.includes(`./${runtimeBuilt}`), `${rel}: missing merged runtime bundle`);
  assert(!legacyBaseRe.test(html), `${rel}: should not reference pre-merge runtime/bank chunks`);
  legacyBaseRe.lastIndex = 0;
  if (grade >= 8) {
    assert(html.includes(`./${banksBuilt}`), `${rel}: missing merged senior banks bundle`);
  } else {
    assert(!html.includes(`./${banksBuilt}`), `${rel}: should not load senior-only banks bundle`);
  }
}

assert.ok(counts[8] <= 20, `grade8_v2.html should stay at or below 20 scripts, got ${counts[8]}`);
assert.ok(counts[9] <= 18, `grade9_v2.html should stay at or below 18 scripts, got ${counts[9]}`);
assert.equal(counts[10], 18, `grade10_v2.html should drop to 18 scripts, got ${counts[10]}`);
assert.equal(counts[11], 18, `grade11_v2.html should drop to 18 scripts, got ${counts[11]}`);
assert.ok(Math.max(counts[8], counts[9], counts[10], counts[11]) <= 20, 'grades 8-11 should stay at or below 20 scripts after merge pass');

const sw = read('sw.js');
assert(sw.includes(`./${runtimeBuilt}`), 'sw.js: missing merged runtime precache asset');
assert(sw.includes(`./${banksBuilt}`), 'sw.js: missing merged senior banks precache asset');
assert(!legacyBaseRe.test(sw), 'sw.js: should not precache pre-merge runtime/bank chunks');
legacyBaseRe.lastIndex = 0;

const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcBanks = read('assets/_src/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.js');
assert(srcRuntime.includes("window.__wave89bMergedRuntime"), 'merged runtime source: missing wave89b marker');
assert(srcRuntime.includes('wave87w') && srcRuntime.includes('wave87x') && srcRuntime.includes('wave88c') && srcRuntime.includes('wave88d'), 'merged runtime source: missing component markers');
assert(srcBanks.includes("window.__wave89bMergedBanks"), 'merged banks source: missing wave89b marker');
assert(srcBanks.includes('wave87y') && srcBanks.includes('wave87z') && srcBanks.includes('wave88b'), 'merged banks source: missing component markers');
assert(!exists('assets/_src/js/bundle_grade_runtime_wave86z.js'), 'deprecated assets/_src/js/bundle_grade_runtime_wave86z.js should be removed');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  runtimeBuilt,
  banksBuilt,
  scriptCounts: counts,
  seniorMaxScripts: Math.max(counts[8], counts[9], counts[10], counts[11]),
  hashedAssetCount: manifest.hashed_asset_count
}, null, 2));
