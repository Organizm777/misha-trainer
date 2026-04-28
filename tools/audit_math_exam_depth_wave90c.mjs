#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const CATALOG_PATH = path.join(ROOT, 'assets', 'data', 'exam_bank', 'catalog.json');
const SOURCE_EXAM_PATH = path.join(ROOT, 'assets', '_src', 'js', 'bundle_exam.js');

const EXPECTED = {
  oge_math_2026_full: {
    bankId: 'oge_math_2026_foundation',
    builtPackPrefix: 'oge_math_var',
    variantCount: 10,
    taskCount: 25,
    rowCount: 250,
    sourceFallbackMarker: "structuredVariantNosHint('oge_math_2026_full', 10)"
  },
  ege_profile_math_2026_part1: {
    bankId: 'ege_profile_math_2026_foundation',
    builtPackPrefix: 'ege_profile_math_var',
    variantCount: 10,
    taskCount: 12,
    rowCount: 120,
    sourceFallbackMarker: "structuredVariantNosHint('ege_profile_math_2026_part1', 10)"
  }
};

function readJSON(rel){ return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
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
const sourceExam = fs.readFileSync(SOURCE_EXAM_PATH, 'utf8');
const builtChunk = builtAsset(manifest, 'assets/js/chunk_exam_bank_wave89q.js');
const builtExam = builtAsset(manifest, 'assets/js/bundle_exam.js');
const builtExamSource = fs.readFileSync(builtExam.abs, 'utf8');
const builderCheck = runCheck();

const ctx = { window:null, self:null, globalThis:null };
ctx.window = ctx;
ctx.self = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(builtChunk.abs, 'utf8'), ctx, { filename: builtChunk.rel, timeout: 3000 });
const runtimePayload = ctx.WAVE89Q_EXAM_BANK || null;

const reports = {};
for (const [familyId, spec] of Object.entries(EXPECTED)) {
  const bank = readJSON(path.join('assets', 'data', 'exam_bank', `${spec.bankId}.json`));
  const runtimeFamily = runtimePayload && runtimePayload.families ? runtimePayload.families[familyId] : null;
  const expectedVariants = arrayRange(spec.variantCount);
  const bankRows = Array.isArray(bank.items) ? bank.items : [];
  const byVariant = new Map();
  bankRows.forEach((row) => {
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
      sequential: sameInts(tasks, arrayRange(spec.taskCount))
    };
  });
  const familyVariants = runtimeFamily && Array.isArray(runtimeFamily.variants) ? runtimeFamily.variants.map((value) => toNum(value)) : [];
  const familyRows = runtimeFamily && Array.isArray(runtimeFamily.rows) ? runtimeFamily.rows : [];
  const familyPackIds = runtimeFamily && Array.isArray(runtimeFamily.pack_ids) ? runtimeFamily.pack_ids.slice() : [];
  const expectedPackIds = expectedVariants.map((variant) => `${spec.builtPackPrefix}${variant}`);
  const sourceFallbackPresent = sourceExam.includes(spec.sourceFallbackMarker);
  const builtFallbackPresent = builtExamSource.includes(spec.sourceFallbackMarker);
  const variantSourceTags = bankRows.filter((row) => toNum(row.variant) >= 6).map((row) => String(row.source_tag || ''));
  reports[familyId] = {
    bankId: spec.bankId,
    bankVariants: bank.variants,
    familyVariants,
    itemCount: toNum(bank.item_count),
    runtimeRowCount: familyRows.length,
    packIds: familyPackIds,
    expectedPackIds,
    sourceFallbackPresent,
    builtFallbackPresent,
    perVariant,
    newVariantSourceTags: Array.from(new Set(variantSourceTags)).sort()
  };
}

const ok = builderCheck && builderCheck.ok === true
  && runtimePayload && runtimePayload.schema === 'wave89q_exam_bank_v1'
  && Object.entries(EXPECTED).every(([familyId, spec]) => {
    const report = reports[familyId];
    const expectedVariants = arrayRange(spec.variantCount);
    return report
      && sameInts(report.bankVariants, expectedVariants)
      && sameInts(report.familyVariants, expectedVariants)
      && report.itemCount === spec.rowCount
      && report.runtimeRowCount === spec.rowCount
      && sameInts(report.packIds.map((value) => Number(String(value).replace(spec.builtPackPrefix, ''))), expectedVariants)
      && sameInts(report.expectedPackIds.map((value) => Number(String(value).replace(spec.builtPackPrefix, ''))), expectedVariants)
      && report.sourceFallbackPresent === true
      && report.builtFallbackPresent === true
      && report.newVariantSourceTags.includes('wave90c_math_expansion');
  })
  && Object.entries(EXPECTED).every(([familyId, spec]) => {
    const report = reports[familyId];
    const expectedVariants = arrayRange(spec.variantCount);
    return expectedVariants.every((variant) => {
      const row = report.perVariant[variant];
      return row && row.count === spec.taskCount && row.sequential === true;
    });
  });

const report = {
  ok,
  wave: 'wave90c',
  builderCheck,
  catalogVersion: catalog.version,
  builtChunk: builtChunk.rel,
  builtExam: builtExam.rel,
  reports
};

console.log(JSON.stringify(report, null, 2));
if (!ok) process.exit(1);
