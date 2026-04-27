#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';
import { execFileSync } from 'child_process';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');

function read(rel){
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function readJSON(rel){
  return JSON.parse(read(rel));
}

const manifest = readJSON('assets/asset-manifest.json');
const runtimeLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const optionalLogical = 'assets/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.js';
const runtimeBuilt = manifest.assets && manifest.assets[runtimeLogical];
const optionalBuilt = manifest.assets && manifest.assets[optionalLogical];

assert(runtimeBuilt, `asset-manifest: missing ${runtimeLogical}`);
assert(optionalBuilt, `asset-manifest: missing ${optionalLogical}`);
assert(fs.existsSync(path.join(ROOT, runtimeBuilt)), `missing built runtime asset ${runtimeBuilt}`);
assert(fs.existsSync(path.join(ROOT, optionalBuilt)), `missing optional banks asset ${optionalBuilt}`);

const pages = ['grade8_v2.html', 'grade9_v2.html', 'grade10_v2.html', 'grade11_v2.html'];
pages.forEach(page => {
  const html = read(page);
  assert(html.includes(runtimeBuilt), `${page}: must reference rebuilt runtime ${runtimeBuilt}`);
  assert(!html.includes(optionalBuilt), `${page}: must not eagerly include ${optionalBuilt}`);
});

const source = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const built = read(runtimeBuilt);
[
  'wave89xOptionalInputBanks',
  'data-wave89x-optional-banks',
  'wave89x-optional-input-banks-ready',
  'Загружаем расширенные задания',
  optionalBuilt
].forEach(pattern => {
  assert(source.includes(pattern), `source runtime missing marker ${pattern}`);
  assert(built.includes(pattern), `built runtime missing marker ${pattern}`);
});

const validateWorkflow = read('.github/workflows/validate-questions.yml');
assert(validateWorkflow.includes('tools/audit_optional_input_banks_wave89x.mjs'), 'validate workflow: missing optional-banks lazy audit');
assert(validateWorkflow.includes('tools/audit_performance_wave86z.mjs'), 'validate workflow: missing performance audit step');

const perfRaw = execFileSync(process.execPath, ['tools/audit_performance_wave86z.mjs'], {
  cwd: ROOT,
  encoding: 'utf8'
});
const perf = JSON.parse(perfRaw);
assert(perf && perf.ok, 'audit_performance_wave86z must pass after lazy optional banks pass');

const summary = {
  ok: true,
  wave: 'wave89x',
  runtimeBuilt,
  optionalBuilt,
  checkedPages: pages,
  performance: {
    maxGradeScripts: perf.summary.maxGradeScripts,
    maxGradeJsBytes: perf.summary.maxGradeJsBytes
  }
};

console.log(JSON.stringify(summary, null, 2));
