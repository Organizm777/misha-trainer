#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const TARGETS = {
  oge_math_2026_full: { bankId:'oge_math_2026_foundation', variants:50, tasks:25, rows:1250, fallback:50 },
  oge_russian_2026_full: { bankId:'oge_russian_2026_foundation', variants:50, tasks:9, rows:450, fallback:50 },
  oge_english_2026_full: { bankId:'oge_english_2026_foundation', variants:30, tasks:20, rows:600, fallback:30 },
  oge_social_2026_full: { bankId:'oge_social_2026_foundation', variants:30, tasks:24, rows:720, fallback:30 },
  ege_base_math_2026_full: { bankId:'ege_base_math_2026_foundation', variants:30, tasks:21, rows:630, fallback:30 },
  ege_profile_math_2026_part1: { bankId:'ege_profile_math_2026_foundation', variants:50, tasks:12, rows:600, fallback:50 },
  ege_russian_2026_part1: { bankId:'ege_russian_2026_foundation', variants:50, tasks:26, rows:1300, fallback:50 },
  ege_social_2026_part1: { bankId:'ege_social_2026_foundation', variants:50, tasks:20, rows:1000, fallback:50 },
  ege_english_2026_part1: { bankId:'ege_english_2026_foundation', variants:30, tasks:20, rows:600, fallback:30 },
  ege_physics_2026_part1: { bankId:'ege_physics_2026_foundation', variants:30, tasks:20, rows:600, fallback:30 }
};
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function readJSON(rel){ return JSON.parse(read(rel)); }
function toNum(value){ return Number(value || 0) || 0; }
function range(n){ return Array.from({length:n}, (_, i) => i + 1); }
function sameInts(a, b){ return Array.isArray(a) && a.length === b.length && a.every((x, i) => toNum(x) === b[i]); }
function assert(ok, message){ if (!ok) throw new Error(message); }

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

function builtAsset(manifest, logical){
  const rel = manifest.assets && manifest.assets[logical];
  assert(rel, `manifest missing ${logical}`);
  assert(fs.existsSync(path.join(ROOT, rel)), `built asset missing ${rel}`);
  return rel;
}
function packPrefix(bankId){ return String(bankId).replace(/_2026_foundation$/, '_var'); }

const manifest = readJSON('assets/asset-manifest.json');
const catalog = readJSON('assets/data/exam_bank/catalog.json');
const sw = read('sw.js');
const sourceExam = read('assets/_src/js/bundle_exam.js');
const builtExamRel = builtAsset(manifest, 'assets/js/bundle_exam.js');
const builtExam = read(builtExamRel);
const shellRel = builtAsset(manifest, 'assets/js/chunk_exam_bank_wave89q.js');
const shellSource = read(shellRel);

assert(waveRank(catalog.version) >= waveRank('wave91d'), `catalog version should be wave91d+, got ${catalog.version}`);
assert(sw.includes(String(manifest.version || '')), 'sw cache should match manifest version');
assert(/^trainer-build-wave91[a-z]-2026-04-28$/.test(String(manifest.version || '')) && waveRank(manifest.build_id) >= waveRank('wave91d'), `asset manifest should be wave91d+, got ${manifest.version} / ${manifest.build_id}`);
assert(waveRank(manifest.build_id) >= waveRank('wave91d'), `asset manifest build_id should be wave91d+, got ${manifest.build_id}`);

const ctx = { window:null, self:null, globalThis:null, console:{ log(){}, warn(){}, error(){} } };
ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(shellSource, ctx, { filename:shellRel, timeout:3000 });
const payload = ctx.WAVE89Q_EXAM_BANK;
assert(payload && payload.schema === 'wave89q_exam_bank_v1', 'runtime shell payload missing or schema mismatch');
assert(payload.lazy && payload.lazy.familyChunks, 'runtime shell must expose lazy family chunks');

const reports = {};
for (const [familyId, target] of Object.entries(TARGETS)) {
  const structure = Object.values(catalog.structures || {}).find((row) => String(row.family_id || '') === familyId);
  assert(structure, `catalog missing structure for ${familyId}`);
  assert(String(structure.bank_id) === target.bankId, `${familyId}: bank id mismatch`);
  assert(Array.isArray(structure.slots) && structure.slots.length === target.tasks, `${familyId}: expected ${target.tasks} slots, got ${structure.slots && structure.slots.length}`);
  assert(sameInts(structure.slots.map((slot) => slot.task_num).sort((a,b)=>toNum(a)-toNum(b)), range(target.tasks)), `${familyId}: catalog slots should be sequential 1..${target.tasks}`);
  const bank = readJSON(`assets/data/exam_bank/${target.bankId}.json`);
  const expectedVariants = range(target.variants);
  assert(sameInts(bank.variants, expectedVariants), `${target.bankId}: variants should be 1..${target.variants}`);
  assert(toNum(bank.item_count) === target.rows, `${target.bankId}: item_count should be ${target.rows}, got ${bank.item_count}`);
  assert(Array.isArray(bank.items) && bank.items.length === target.rows, `${target.bankId}: items length mismatch`);
  const seen = new Set();
  const perVariant = new Map();
  let fieldErrors = 0;
  let generatedRows = 0;
  for (const [index, item] of bank.items.entries()) {
    const key = `${toNum(item.variant)}|${toNum(item.task_num)}`;
    if (seen.has(key)) throw new Error(`${target.bankId}: duplicate variant/task ${key}`);
    seen.add(key);
    if (!perVariant.has(toNum(item.variant))) perVariant.set(toNum(item.variant), []);
    perVariant.get(toNum(item.variant)).push(toNum(item.task_num));
    ['exam','subject','q','a','h','ex','topic_tag','section','topic','type','source_pack','source_tag'].forEach((field) => {
      if (!String(item[field] || '').trim()) fieldErrors += 1;
    });
    if (!Array.isArray(item.o) || item.o.length < 4 || !item.o.includes(item.a)) fieldErrors += 1;
    if (!Array.isArray(item.criteria) || !item.criteria.length) fieldErrors += 1;
    if (toNum(item.variant) > 10 || (target.bankId === 'ege_russian_2026_foundation' && toNum(item.task_num) > 20)) {
      if (String(item.source_tag || '') === 'wave91d_variant_expansion') generatedRows += 1;
    }
  }
  assert(fieldErrors === 0, `${target.bankId}: field validation errors ${fieldErrors}`);
  expectedVariants.forEach((variant) => {
    const tasks = (perVariant.get(variant) || []).sort((a,b)=>a-b);
    assert(sameInts(tasks, range(target.tasks)), `${target.bankId}: variant ${variant} tasks are not 1..${target.tasks}`);
  });
  const chunkRaw = payload.lazy.familyChunks[familyId];
  assert(chunkRaw, `${familyId}: shell missing lazy chunk path`);
  const chunkRel = String(chunkRaw).replace(/^\.\//, '');
  assert(fs.existsSync(path.join(ROOT, chunkRel)), `${familyId}: lazy chunk file missing ${chunkRel}`);
  vm.runInContext(read(chunkRel), ctx, { filename:chunkRel, timeout:5000 });
  const family = payload.families && payload.families[familyId];
  assert(family, `${familyId}: lazy chunk did not register family`);
  assert(family.compiled_from === 'json_bank', `${familyId}: compiled_from should be json_bank`);
  assert(family.row_count === target.rows, `${familyId}: runtime row_count should be ${target.rows}, got ${family.row_count}`);
  assert(sameInts(family.variants, expectedVariants), `${familyId}: runtime variants mismatch`);
  assert(Array.isArray(family.pack_ids) && family.pack_ids.length === target.variants, `${familyId}: pack id count mismatch`);
  assert(family.pack_ids.every((packId, idx) => packId === `${packPrefix(target.bankId)}${idx + 1}`), `${familyId}: pack ids not sequential`);
  const marker = `structuredVariantNosHint('${familyId}', ${target.fallback})`;
  assert(sourceExam.includes(marker), `${familyId}: source bundle_exam fallback marker missing ${marker}`);
  assert(builtExam.includes(marker), `${familyId}: built bundle_exam fallback marker missing ${marker}`);
  reports[familyId] = {
    bankId: target.bankId,
    variants: target.variants,
    tasks: target.tasks,
    rows: target.rows,
    generatedRows,
    chunk: chunkRel,
    fallback: target.fallback
  };
}

const totalRows = Object.values(reports).reduce((sum, row) => sum + row.rows, 0);
const totalVariants = Object.values(reports).reduce((sum, row) => sum + row.variants, 0);
const ok = totalRows === 7750 && totalVariants === 400;
const report = {
  ok,
  wave: 'wave91d',
  cache: manifest.version,
  totalVariants,
  totalRows,
  shell: shellRel,
  bundleExam: builtExamRel,
  lazyChunkCount: Object.keys(payload.lazy.familyChunks || {}).length,
  reports
};
console.log(JSON.stringify(report, null, 2));
if (!ok) process.exit(1);
