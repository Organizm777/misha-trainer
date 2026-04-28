#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const CATALOG_PATH = path.join(ROOT, 'assets', 'data', 'exam_bank', 'catalog.json');
const SOURCE_EXAM_PATH = path.join(ROOT, 'assets', '_src', 'js', 'bundle_exam.js');
const TARGET_VARIANT_COUNT = 10;
const MARKER = 'wave90d_variant_depth';
const MARKED_BANKS = new Set([
  'oge_russian_2026_foundation',
  'oge_english_2026_foundation',
  'oge_social_2026_foundation',
  'ege_base_math_2026_foundation',
  'ege_russian_2026_foundation',
  'ege_social_2026_foundation',
  'ege_english_2026_foundation',
  'ege_physics_2026_foundation'
]);

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function readJSON(rel){ return JSON.parse(read(rel)); }
function toNum(v){ return Number(v || 0) || 0; }
function builtAsset(manifest, logical){
  const built = manifest.assets && manifest.assets[logical];
  if (!built) throw new Error(`asset-manifest missing ${logical}`);
  const abs = path.join(ROOT, built);
  if (!fs.existsSync(abs)) throw new Error(`missing built asset ${built}`);
  return { rel: built, abs };
}
function arrayRange(n){ return Array.from({ length:n }, (_, index) => index + 1); }
function sameInts(list, expected){
  return Array.isArray(list)
    && list.length === expected.length
    && list.every((value, index) => toNum(value) === expected[index]);
}
function packPrefix(bankId){ return String(bankId || '').replace(/_2026_foundation$/, '_var'); }
function runCheck(){
  try {
    const raw = execFileSync(process.execPath, ['tools/build_exam_bank_runtime_wave89q.mjs', '--check'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    return JSON.parse(raw || '{}');
  } catch (error) {
    return {
      ok: false,
      stderr: error && typeof error.stderr === 'string' ? error.stderr.trim() : '',
      stdout: error && typeof error.stdout === 'string' ? error.stdout.trim() : ''
    };
  }
}

const manifest = readJSON('assets/asset-manifest.json');
const catalog = readJSON('assets/data/exam_bank/catalog.json');
const sourceExam = read('assets/_src/js/bundle_exam.js');
const builtExam = builtAsset(manifest, 'assets/js/bundle_exam.js');
const builtExamSource = fs.readFileSync(builtExam.abs, 'utf8');
const builtChunk = builtAsset(manifest, 'assets/js/chunk_exam_bank_wave89q.js');
const builderCheck = runCheck();

const ctx = { window:null, self:null, globalThis:null };
ctx.window = ctx;
ctx.self = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(builtChunk.abs, 'utf8'), ctx, { filename:builtChunk.rel, timeout:3000 });
const runtimePayload = ctx.WAVE89Q_EXAM_BANK || null;
const expectedVariants = arrayRange(TARGET_VARIANT_COUNT);
const reports = {};

for (const structure of Object.values(catalog.structures || {})) {
  const familyId = String(structure.family_id || '');
  const bankId = String(structure.bank_id || '');
  const bank = readJSON(path.join('assets', 'data', 'exam_bank', `${bankId}.json`));
  const runtimeFamily = runtimePayload && runtimePayload.families ? runtimePayload.families[familyId] : null;
  const taskCount = Array.isArray(structure.slots) ? structure.slots.length : 0;
  const expectedPackIds = expectedVariants.map((variant) => `${packPrefix(bankId)}${variant}`);
  const familyVariants = runtimeFamily && Array.isArray(runtimeFamily.variants) ? runtimeFamily.variants.map((value) => toNum(value)) : [];
  const familyRows = runtimeFamily && Array.isArray(runtimeFamily.rows) ? runtimeFamily.rows : [];
  const familyPackIds = runtimeFamily && Array.isArray(runtimeFamily.pack_ids) ? runtimeFamily.pack_ids.slice() : [];
  const byVariant = new Map();
  (Array.isArray(bank.items) ? bank.items : []).forEach((row) => {
    const variant = toNum(row.variant);
    const taskNum = toNum(row.task_num);
    if (!byVariant.has(variant)) byVariant.set(variant, []);
    byVariant.get(variant).push(taskNum);
  });
  const perVariant = {};
  expectedVariants.forEach((variant) => {
    const tasks = (byVariant.get(variant) || []).slice().sort((a, b) => a - b);
    perVariant[variant] = {
      count: tasks.length,
      tasks,
      sequential: sameInts(tasks, arrayRange(taskCount))
    };
  });
  const sourceFallbackMarker = `structuredVariantNosHint('${familyId}', ${TARGET_VARIANT_COUNT})`;
  const sourceFallbackPresent = sourceExam.includes(sourceFallbackMarker);
  const builtFallbackPresent = builtExamSource.includes(sourceFallbackMarker);
  const bankRows = Array.isArray(bank.items) ? bank.items : [];
  const markerRows = bankRows.filter((row) => String(row.source_tag || '').includes(MARKER));
  reports[familyId] = {
    bankId,
    bankVariants: bank.variants,
    familyVariants,
    taskCount,
    itemCount: toNum(bank.item_count),
    runtimeRowCount: familyRows.length,
    compiledFrom: runtimeFamily ? String(runtimeFamily.compiled_from || '') : '',
    packIds: familyPackIds,
    expectedPackIds,
    sourceFallbackPresent,
    builtFallbackPresent,
    markerRows: markerRows.length,
    perVariant
  };
}

const ok = builderCheck && builderCheck.ok === true
  && catalog.version === 'wave90d'
  && runtimePayload && runtimePayload.schema === 'wave89q_exam_bank_v1'
  && Object.entries(reports).every(([familyId, report]) => {
    const expectedRows = report.taskCount * TARGET_VARIANT_COUNT;
    const familyOk = sameInts(report.bankVariants, expectedVariants)
      && sameInts(report.familyVariants, expectedVariants)
      && report.itemCount === expectedRows
      && report.runtimeRowCount === expectedRows
      && report.compiledFrom === 'json_bank'
      && JSON.stringify(report.packIds) === JSON.stringify(report.expectedPackIds)
      && report.sourceFallbackPresent === true
      && report.builtFallbackPresent === true
      && expectedVariants.every((variant) => {
        const row = report.perVariant[variant];
        return row && row.count === report.taskCount && row.sequential === true;
      });
    if (!familyOk) return false;
    if (MARKED_BANKS.has(report.bankId)) return report.markerRows === expectedRows;
    return true;
  });

const report = {
  ok,
  wave: 'wave90d',
  builderCheck,
  catalogVersion: catalog.version,
  builtChunk: builtChunk.rel,
  builtExam: builtExam.rel,
  targetVariantCount: TARGET_VARIANT_COUNT,
  marker: MARKER,
  reports
};

console.log(JSON.stringify(report, null, 2));
if (!ok) process.exit(1);
