#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'assets', 'data', 'exam_bank');
const CATALOG_PATH = path.join(DATA_DIR, 'catalog.json');
const OUT_PATH = path.join(ROOT, 'assets', '_src', 'js', 'chunk_exam_bank_wave89q.js');
const STRUCTURED_SCHEMA_VERSION = 'wave89q_exam_bank_v1';
const args = new Set(process.argv.slice(2));
const checkMode = args.has('--check');

function readJSON(abs){ return JSON.parse(fs.readFileSync(abs, 'utf8')); }
function toInt(v){ return Number(v || 0) || 0; }
function fail(message){ throw new Error(message); }
function uniq(list){ return Array.from(new Set(list)); }
function stableStringify(value){ return JSON.stringify(value, null, 2); }
function clone(value){ return JSON.parse(JSON.stringify(value)); }

function familyMode(familyId){
  if (/_part1$/.test(String(familyId || ''))) return 'part1';
  if (/_full$/.test(String(familyId || ''))) return 'full';
  return 'variant';
}
function familySubject(familyId, structure){
  const id = String(familyId || '');
  if (id === 'oge_math_2026_full') return 'math';
  if (id === 'ege_base_math_2026_full') return 'base_math';
  if (id === 'ege_profile_math_2026_part1') return 'profile_math';
  return String(structure.subject_id || structure.subject || 'subject');
}
function familyTask(slot){
  const points = toInt(slot.max_score) || 1;
  return {
    task_num: toInt(slot.task_num),
    section: slot.section || 'Раздел',
    type: slot.type || 'choice',
    max_score: points,
    topic_tag: slot.topic_tag || ('task_' + String(slot.task_num || 0)),
    part: slot.part || (points > 1 ? 'B' : 'A')
  };
}

function validateOptions(item, ctx){
  if (!Array.isArray(item.o)) fail(`${ctx}: o must be an array`);
  const opts = item.o.map(v => String(v == null ? '' : v).trim()).filter(Boolean);
  if (opts.length < 4) fail(`${ctx}: expected at least 4 options, got ${opts.length}`);
  const answer = String(item.a == null ? '' : item.a).trim();
  if (!answer) fail(`${ctx}: missing answer`);
  if (!opts.includes(answer)) fail(`${ctx}: options must include answer`);
}

function validateCatalog(catalog){
  if (!catalog || typeof catalog !== 'object') fail('catalog.json must contain an object');
  if (!catalog.version) fail('catalog.json missing version');
  if (!catalog.structures || typeof catalog.structures !== 'object' || Array.isArray(catalog.structures)) {
    fail('catalog.json must contain structures object');
  }
  const structureIds = Object.keys(catalog.structures);
  if (!structureIds.length) fail('catalog.json structures object is empty');
  structureIds.forEach((id) => {
    const structure = catalog.structures[id];
    const ctx = `catalog.structures.${id}`;
    if (!structure || typeof structure !== 'object') fail(`${ctx} must be an object`);
    if (String(structure.id || '') !== id) fail(`${ctx}.id must match key`);
    ['family_id','bank_id','exam','subject','subject_id','summary','score_kind'].forEach((field) => {
      if (!String(structure[field] || '').trim()) fail(`${ctx}.${field} is required`);
    });
    if (!Number.isInteger(toInt(structure.year)) || toInt(structure.year) <= 0) fail(`${ctx}.year must be a positive integer`);
    if (!Number.isInteger(toInt(structure.time_limit_sec)) || toInt(structure.time_limit_sec) <= 0) fail(`${ctx}.time_limit_sec must be positive`);
    if (!Array.isArray(structure.slots) || !structure.slots.length) fail(`${ctx}.slots must be a non-empty array`);
    const taskNums = new Set();
    structure.slots.forEach((slot, idx) => {
      const slotCtx = `${ctx}.slots[${idx}]`;
      if (!slot || typeof slot !== 'object') fail(`${slotCtx} must be an object`);
      const taskNum = toInt(slot.task_num);
      if (!Number.isInteger(taskNum) || taskNum <= 0) fail(`${slotCtx}.task_num must be a positive integer`);
      if (taskNums.has(taskNum)) fail(`${slotCtx}.task_num duplicates ${taskNum}`);
      taskNums.add(taskNum);
      if (!String(slot.type || '').trim()) fail(`${slotCtx}.type is required`);
      if (toInt(slot.max_score) <= 0) fail(`${slotCtx}.max_score must be positive`);
      if (!String(slot.section || '').trim()) fail(`${slotCtx}.section is required`);
    });
  });
}

function validateBank(bank, expectedBankId, expectedFamilyId){
  if (!bank || typeof bank !== 'object') fail(`${expectedBankId}: bank file must contain an object`);
  if (String(bank.bank_id || '') !== expectedBankId) fail(`${expectedBankId}: bank_id mismatch`);
  if (String(bank.family_id || '') !== expectedFamilyId) fail(`${expectedBankId}: family_id mismatch`);
  ['exam','subject','subject_id','source','description'].forEach((field) => {
    if (!String(bank[field] || '').trim()) fail(`${expectedBankId}: missing ${field}`);
  });
  if (!Number.isInteger(toInt(bank.year)) || toInt(bank.year) <= 0) fail(`${expectedBankId}: invalid year`);
  if (!Array.isArray(bank.variants) || !bank.variants.length) fail(`${expectedBankId}: variants must be a non-empty array`);
  if (!Array.isArray(bank.items) || !bank.items.length) fail(`${expectedBankId}: items must be a non-empty array`);
  if (toInt(bank.item_count) !== bank.items.length) fail(`${expectedBankId}: item_count mismatch`);
  const seen = new Set();
  bank.items.forEach((item, idx) => {
    const ctx = `${expectedBankId}.items[${idx}]`;
    ['exam','subject','q','a','h','ex','topic_tag','section','topic','type'].forEach((field) => {
      if (!String(item[field] || '').trim()) fail(`${ctx}: missing ${field}`);
    });
    if (toInt(item.year) !== toInt(bank.year)) fail(`${ctx}: year must match bank year`);
    const variant = toInt(item.variant);
    const taskNum = toInt(item.task_num);
    if (!Number.isInteger(variant) || variant <= 0) fail(`${ctx}: variant must be positive integer`);
    if (!Number.isInteger(taskNum) || taskNum <= 0) fail(`${ctx}: task_num must be positive integer`);
    if (toInt(item.max_score) <= 0) fail(`${ctx}: max_score must be positive`);
    if (!Array.isArray(item.criteria) || !item.criteria.length) fail(`${ctx}: criteria must be a non-empty array`);
    validateOptions(item, ctx);
    const key = `${variant}|${taskNum}`;
    if (seen.has(key)) fail(`${ctx}: duplicate variant/task_num combination ${key}`);
    seen.add(key);
  });
}

function buildFamilySnapshot(structure, bank){
  const familyId = String(structure.family_id || bank.family_id || '');
  const subject = familySubject(familyId, structure);
  const tasks = (structure.slots || []).map(familyTask);
  const blueprint = {
    schema: STRUCTURED_SCHEMA_VERSION,
    family_id: familyId,
    exam: structure.exam,
    subject,
    year: toInt(structure.year),
    mode: familyMode(familyId),
    task_count: tasks.length,
    time_limit_sec: toInt(structure.time_limit_sec),
    summary: structure.summary || '',
    score_kind: structure.score_kind || '',
    score_model: structure.score_model || '',
    accent: structure.accent || '',
    grades: structure.grades || '',
    tasks
  };
  const rows = (bank.items || []).map((item) => {
    const points = toInt(item.max_score) || 1;
    return {
      exam: structure.exam || item.exam,
      subject,
      year: toInt(item.year || structure.year),
      variant: toInt(item.variant),
      task_num: toInt(item.task_num),
      type: item.type || 'choice',
      max_score: points,
      q: item.q,
      a: item.a,
      o: clone(item.o || []),
      h: item.h || '',
      ex: item.ex || '',
      criteria: clone(item.criteria || []),
      topic_tag: item.topic_tag || ('task_' + String(item.task_num || 0)),
      section: item.section || '',
      topic: item.topic || '',
      grades: structure.grades || '',
      source_pack: item.source_pack || '',
      source_tag: 'exam_bank_json',
      score_kind: structure.score_kind || '',
      score_model: structure.score_model || '',
      part: item.part || (points > 1 ? 'B' : 'A')
    };
  });
  return {
    schema: STRUCTURED_SCHEMA_VERSION,
    family_id: familyId,
    exam: structure.exam,
    subject,
    year: toInt(structure.year),
    variants: clone(bank.variants || []).sort((a, b) => toInt(a) - toInt(b)).map((value) => toInt(value)),
    blueprint,
    rows,
    row_count: rows.length,
    pack_ids: uniq(rows.map((row) => String(row.source_pack || '')).filter(Boolean)),
    compiled_from: 'json_bank',
    bank_id: String(bank.bank_id || ''),
    structure_id: String(structure.id || '')
  };
}

function loadPayload(){
  if (!fs.existsSync(CATALOG_PATH)) fail(`Missing ${path.relative(ROOT, CATALOG_PATH)}`);
  const catalog = readJSON(CATALOG_PATH);
  validateCatalog(catalog);
  const banks = {};
  const families = {};
  const structureEntries = Object.entries(catalog.structures || {});
  const requiredBankIds = uniq(structureEntries.map(([, structure]) => String(structure.bank_id)));

  requiredBankIds.forEach((bankId) => {
    const abs = path.join(DATA_DIR, `${bankId}.json`);
    if (!fs.existsSync(abs)) fail(`Missing bank file assets/data/exam_bank/${bankId}.json`);
  });

  structureEntries.forEach(([structureId, structure]) => {
    const bankId = String(structure.bank_id || '');
    const familyId = String(structure.family_id || '');
    if (!banks[bankId]) {
      const bank = readJSON(path.join(DATA_DIR, `${bankId}.json`));
      validateBank(bank, bankId, familyId);
      banks[bankId] = bank;
    }
    const bank = banks[bankId];
    const variants = new Set((bank.variants || []).map((value) => toInt(value)));
    (structure.slots || []).forEach((slot, idx) => {
      const slotCtx = `${structureId}.slots[${idx}]`;
      variants.forEach((variant) => {
        const hit = (bank.items || []).some((item) => toInt(item.variant) === variant && toInt(item.task_num) === toInt(slot.task_num));
        if (!hit) fail(`${slotCtx}: bank ${bank.bank_id} is missing variant ${variant}, task ${slot.task_num}`);
      });
    });
    families[familyId] = buildFamilySnapshot(structure, bank);
  });

  return {
    version: String(catalog.version || 'wave89q'),
    schema: STRUCTURED_SCHEMA_VERSION,
    catalog,
    banks,
    families
  };
}

function buildSource(payload){
  const serialized = stableStringify(payload);
  return [
    '/* generated by tools/build_exam_bank_runtime_wave89q.mjs */',
    '(function(global){',
    `  var payload = ${serialized};`,
    '  global.WAVE89Q_EXAM_BANK = payload;',
    '  if (global.window) global.window.WAVE89Q_EXAM_BANK = payload;',
    `})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));`,
    ''
  ].join('\n');
}

const payload = loadPayload();
const nextSource = buildSource(payload);
const currentSource = fs.existsSync(OUT_PATH) ? fs.readFileSync(OUT_PATH, 'utf8') : '';

if (checkMode) {
  if (currentSource !== nextSource) {
    console.error('Exam bank runtime source is out of sync. Run: node tools/build_exam_bank_runtime_wave89q.mjs');
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, mode: 'check', out: path.relative(ROOT, OUT_PATH), bankCount: Object.keys(payload.banks || {}).length, familyCount: Object.keys(payload.families || {}).length }, null, 2));
  process.exit(0);
}

fs.writeFileSync(OUT_PATH, nextSource);
console.log(JSON.stringify({ ok: true, mode: 'write', out: path.relative(ROOT, OUT_PATH), bankCount: Object.keys(payload.banks || {}).length, familyCount: Object.keys(payload.families || {}).length }, null, 2));
