#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function readJSON(rel){ return JSON.parse(read(rel)); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function walk(dir){
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes:true })) {
    const rel = path.join(dir, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}
function countJsonQuestions(value){
  let n = 0;
  function rec(x){
    if (!x) return;
    if (Array.isArray(x)) { for (const y of x) rec(y); return; }
    if (typeof x !== 'object') return;
    if (typeof x.q === 'string' && (typeof x.a === 'string' || typeof x.answer === 'string')) n++;
    for (const v of Object.values(x)) rec(v);
  }
  rec(value);
  return n;
}
function sourceQuestionApprox(){
  let n = 0;
  for (const rel of walk('assets/_src/js').filter(f => f.endsWith('.js'))) {
    n += (read(rel).match(/\bq\s*:/g) || []).length;
  }
  return n;
}
const manifest = readJSON('assets/data/content_depth/manifest.json');
const required = [
  'school_question_pack_primary.json',
  'school_question_pack_middle.json',
  'school_question_pack_senior.json',
  'functional_literacy_pisa.json',
  'cross_grade_diagnostic.json',
  'final_essay_bank.json',
  'textbook_bindings.json'
];
const failures = [];
for (const file of required) if (!exists('assets/data/content_depth/' + file)) failures.push('missing content_depth/' + file);
const shardCounts = [];
for (const shard of manifest.shards || []) {
  const rel = shard.path.replace(/^\.\//, '');
  if (!exists(rel)) { failures.push('manifest shard path missing: ' + rel); continue; }
  const json = readJSON(rel);
  const counted = countJsonQuestions(json);
  if (rel.includes('textbook_bindings')) {
    if (!Array.isArray(json.bindings) || json.bindings.length < 40) failures.push('too few textbook bindings');
  } else {
    if (counted < 1) failures.push('no q/a rows in ' + rel);
    if (Number(shard.item_count || 0) !== counted && rel.includes('final_essay') === false) failures.push('item_count mismatch in ' + rel + ': ' + shard.item_count + ' vs ' + counted);
  }
  shardCounts.push({ rel, declared:shard.item_count, counted });
}
const dataQuestionRows = walk('assets/data').filter(f => f.endsWith('.json')).reduce((sum, rel) => sum + countJsonQuestions(readJSON(rel)), 0);
const sourceQuestionRows = sourceQuestionApprox();
const totalQuestionRows = dataQuestionRows + sourceQuestionRows;
if (Number(manifest.total_questions || 0) < 6900) failures.push('content_depth total_questions below expected wave91j pack');
if (totalQuestionRows < 25000) failures.push('I1 total question accounting below 25000: ' + totalQuestionRows);
const html = read('content_depth.html');
['bundle_content_depth.', 'bundle_navigation_logger.', 'assets/css/wave91j_content_depth.', 'assets/data/content_depth'].forEach(token => {
  if (!html.includes(token)) failures.push('content_depth.html missing token ' + token);
});
const index = read('index.html');
if (!index.includes('content_depth.html') || !index.includes('29 000+')) failures.push('index.html does not surface content depth / updated questions stat');
const result = { ok: failures.length === 0, wave:'wave91j', contentDepthQuestions:manifest.total_questions, dataQuestionRows, sourceQuestionRows, totalQuestionRows, shardCounts, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
