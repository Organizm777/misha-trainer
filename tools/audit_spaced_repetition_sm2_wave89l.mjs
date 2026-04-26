#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';
import vm from 'vm';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJSON = (rel) => JSON.parse(read(rel));

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
function createNode(tagName = 'div'){
  return {
    tagName: String(tagName).toUpperCase(),
    style: {},
    className: '',
    innerHTML: '',
    textContent: '',
    id: '',
    children: [],
    onclick: null,
    appendChild(child){ this.children.push(child); return child; },
    setAttribute(name, value){ this[name] = value; },
    getAttribute(name){ return this[name] ?? null; },
    addEventListener(){},
    removeEventListener(){},
    remove(){},
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    closest(){ return this; },
    scrollIntoView(){}
  };
}
function makeContext(initialStore = {}){
  const store = new Map(Object.entries(initialStore));
  const document = {
    readyState: 'complete',
    head: createNode('head'),
    body: createNode('body'),
    addEventListener(){},
    removeEventListener(){},
    getElementById(){ return null; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    createElement(tagName){ return createNode(tagName); }
  };
  const context = vm.createContext({
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN,
    document,
    navigator: {},
    localStorage: {
      getItem(key){ return store.has(key) ? store.get(key) : null; },
      setItem(key, value){ store.set(String(key), String(value)); },
      removeItem(key){ store.delete(String(key)); }
    },
    setTimeout(fn){ if (typeof fn === 'function') fn(); return 1; },
    clearTimeout(){},
    alert(){},
    shuffle(list){ return Array.isArray(list) ? list.slice() : []; },
    declNum(value, one, two, many){
      const n = Math.abs(Number(value)) % 100;
      const n1 = n % 10;
      if (n > 10 && n < 20) return many;
      if (n1 > 1 && n1 < 5) return two;
      if (n1 === 1) return one;
      return many;
    },
    esc(value){ return String(value == null ? '' : value); },
    showToast(){},
    startQuiz(){},
    render(){},
    startWeakTraining(){},
    renderDailyMeter(){},
    renderProg(){},
    resetProgress(){},
    getBackupSnapshot(){ return {}; },
    applyBackupSnapshot(){ return true; },
    addToJournal(){},
    go(){},
    endSession(){ return true; },
    jumpToTopic(){},
    startGlobalMix(){},
    SUBJ: [],
    GRADE_NUM: '10'
  });
  context.window = context;
  context.self = context;
  context.globalThis = context;
  context.document = document;
  return { context, store };
}
function isolateWave28(source){
  const startMarker = '/* --- wave28_spaced.js --- */';
  const endMarker = '/* --- wave41_olympiad_and_ux.js --- */';
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  assert.ok(start >= 0 && end > start, 'could not isolate the wave28 block');
  return source.slice(start, end);
}
function readReviewItem(api, key){
  const state = api.loadReview();
  return { state, item: state.items[key] };
}

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const srcCore = read('assets/_src/js/bundle_grade_runtime_core_wave87n.js');
const builtCorePath = manifest.assets['assets/js/bundle_grade_runtime_core_wave87n.js'];
assert.ok(builtCorePath, 'asset-manifest should include the core runtime bundle');
const builtCore = read(builtCorePath);
const changelog = read('CHANGELOG.md');
const docs = read('docs/SPACED_REPETITION_SM2_wave89l.md');
const claude = read('CLAUDE.md');
const toolsReadme = read('tools/README.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');

assert.ok(waveRank(healthz.wave) >= waveRank('wave89l'), `healthz.wave should be wave89l+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89l'), `healthz.build_id should be wave89l+ (got ${healthz.build_id})`);
assert.equal(manifest.version, healthz.version, 'manifest/healthz versions should match');
assert.ok(Number(manifest.hashed_asset_count || 0) >= 101, 'hashed asset count should stay populated');

const gradePages = Array.from({ length: 11 }, (_, idx) => `grade${idx + 1}_v2.html`);
gradePages.forEach((page) => {
  const html = read(page);
  assert.ok(html.includes(`./${builtCorePath}`), `${page} should reference the rebuilt core runtime`);
});

assert.ok(srcCore.includes('/* wave89l: SM-2 spaced repetition */'), 'core source should contain the wave89l SM-2 marker');
assert.ok(srcCore.includes("algo:'sm2'"), 'core source should store review state with algo=sm2');
assert.ok(srcCore.includes('SM2_BASE_EF'), 'core source should define the SM-2 base EF constant');
assert.ok(srcCore.includes('SM2_SECOND_INTERVAL = 6'), 'core source should define the 6-day second interval');
assert.ok(srcCore.includes('function reviewPreview(item, quality)'), 'core source should expose a reviewPreview helper');
assert.ok(srcCore.includes('function gradeReviewCard(key, quality, helped)'), 'core source should expose the review grading helper');
assert.ok(srcCore.includes('window.getReviewSummary = getReviewSummary;'), 'core source should export getReviewSummary');
assert.ok(srcCore.includes('window.startSpacedReview = startDueReview;'), 'core source should export startSpacedReview');
assert.ok(srcCore.includes('upcomingWeek'), 'core source should compute the weekly due summary');
assert.ok(srcCore.includes('avgEf'), 'core source should compute the average EF summary');
assert.ok(srcCore.includes("row.sticky = row.sticky == null ? row.lapses >= 3 : !!row.sticky;"), 'core source should preserve cleared sticky cards');
assert.ok(builtCore.includes('/* wave89l: SM-2 spaced repetition */'), 'rebuilt core runtime should keep the wave89l marker');
assert.ok(builtCore.includes('SM-2 повторение'), 'rebuilt core runtime should render SM-2 UI labels');
assert.ok(builtCore.includes('startSpacedReview'), 'rebuilt core runtime should export startSpacedReview');

assert.ok(changelog.includes('## wave89l'), 'CHANGELOG should document wave89l');
assert.ok(changelog.includes('roadmap `#45`'), 'CHANGELOG should mention roadmap item #45');
assert.ok(docs.includes('trainer_review_<grade>'), 'wave89l doc should mention the persisted review key');
assert.ok(docs.includes('1 день → 6 дней'), 'wave89l doc should mention the initial SM-2 cadence');
assert.ok(claude.includes('### wave89l spaced repetition'), 'CLAUDE.md should document wave89l');
assert.ok(toolsReadme.includes('audit_spaced_repetition_sm2_wave89l.mjs'), 'tools README should list the wave89l audit');
assert.ok(validateWorkflow.includes('node tools/audit_spaced_repetition_sm2_wave89l.mjs'), 'validate workflow should run the wave89l audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_spaced_repetition_sm2_wave89l.mjs'), 'lighthouse workflow should run the wave89l audit');

const isolated = isolateWave28(srcCore);

const legacySeed = {
  trainer_review_10: JSON.stringify({
    version: 1,
    items: {
      legacy: {
        key: 'legacy',
        q: 'Q',
        correct: 'A',
        tag: 'Legacy topic',
        step: 2,
        intervalDays: 7,
        dueAt: 0,
        wrongCount: 2,
        rightCount: 1
      }
    }
  })
};
const legacyEnv = makeContext(legacySeed);
vm.runInContext(isolated, legacyEnv.context, { filename: 'wave89l-legacy.vm.js', timeout: 2000 });
const legacyApi = legacyEnv.context.window.wave28Debug;
assert.ok(legacyApi, 'legacy vm should expose wave28Debug');
const legacyState = legacyApi.loadReview();
const legacyItem = legacyState.items.legacy;
assert.equal(legacyState.version, 2, 'legacy state should migrate to version 2');
assert.equal(legacyState.algo, 'sm2', 'legacy state should migrate to algo=sm2');
assert.equal(legacyItem.repetitions, 2, 'legacy state should preserve repetitions from step');
assert.equal(legacyItem.step, 2, 'legacy state should preserve step compatibility');
assert.equal(legacyItem.intervalDays, 7, 'legacy state should preserve the interval during migration');
assert.equal(legacyItem.ef, 2.5, 'legacy state should receive the default EF');
assert.equal(legacyItem.easeFactor, 2.5, 'legacy state should mirror EF to easeFactor');

const trainEnv = makeContext();
vm.runInContext(isolated, trainEnv.context, { filename: 'wave89l-train.vm.js', timeout: 2000 });
const api = trainEnv.context.window.wave28Debug;
assert.equal(api.version, 'wave89l-sm2', 'wave28Debug should expose the wave89l version');
assert.equal(typeof trainEnv.context.window.startSpacedReview, 'function', 'startSpacedReview should be exported');
assert.equal(typeof trainEnv.context.window.getReviewSummary, 'function', 'getReviewSummary should be exported');

const card = api.registerMistake({ q: '2 + 2 = ?', correct: '4', tag: 'Алгебра' });
let current = readReviewItem(api, card.key).item;
assert.equal(current.intervalDays, 1, 'a fresh mistake should schedule a 1-day interval');
assert.equal(current.repetitions, 0, 'a fresh mistake should keep repetitions at 0');
assert.equal(current.step, 0, 'a fresh mistake should keep step at 0 for compatibility');
assert.ok(current.ef < 2.5, 'a fresh mistake should reduce the EF');
assert.equal(current.lapses, 1, 'a fresh mistake should count as the first lapse');
assert.equal(current.sticky, false, 'a single lapse should not be sticky yet');
assert.equal(api.dueCount(), 0, 'a fresh mistake should not be due immediately');

api.gradeCard(card.key, 5, false);
current = readReviewItem(api, card.key).item;
assert.equal(current.intervalDays, 1, 'the first successful review should keep the 1-day interval');
assert.equal(current.repetitions, 1, 'the first successful review should move repetitions to 1');
assert.equal(current.step, 1, 'the first successful review should mirror repetitions into step');

api.gradeCard(card.key, 5, false);
current = readReviewItem(api, card.key).item;
assert.equal(current.intervalDays, 6, 'the second successful review should move to 6 days');
assert.equal(current.repetitions, 2, 'the second successful review should move repetitions to 2');
const preview = api.previewQuality(card.key, 5);
assert.ok(preview && preview.intervalDays >= 12 && preview.intervalDays <= 18, 'the next successful preview should jump beyond the fixed 6-day step');

api.gradeCard(card.key, 5, false);
current = readReviewItem(api, card.key).item;
assert.ok(current.intervalDays >= 12 && current.intervalDays <= 18, 'the third successful review should grow by EF beyond 6 days');
assert.equal(current.repetitions, 3, 'the third successful review should move repetitions to 3');
assert.equal(api.masteredCount(), 1, 'a stable card should count as mastered');
const thirdSuccessInterval = current.intervalDays;
const digest = api.digest();
assert.equal(digest.total, 1, 'digest should track the single card');
assert.equal(digest.mastered, 1, 'digest should report the mastered card');
assert.ok(digest.avgEf >= 2.4, 'digest should report an elevated average EF after several successes');

const efBeforeHelp = current.ef;
api.gradeCard(card.key, 5, true);
current = readReviewItem(api, card.key).item;
assert.equal(current.intervalDays, 1, 'a hinted success should reset to a 1-day quick repeat');
assert.equal(current.repetitions, 0, 'a hinted success should reset repetitions');
assert.equal(current.step, 0, 'a hinted success should reset step compatibility');
assert.equal(current.lastOutcome, 'helped', 'a hinted success should record the helped outcome');
assert.equal(current.lastGrade, 3, 'a hinted success should use the gentle quality=3 grade');
assert.ok(current.ef <= efBeforeHelp, 'a hinted success should not raise EF');

const stickyEnv = makeContext();
vm.runInContext(isolated, stickyEnv.context, { filename: 'wave89l-sticky.vm.js', timeout: 2000 });
const stickyApi = stickyEnv.context.window.wave28Debug;
const stickyCard = stickyApi.registerMistake({ q: 'Столица Франции', correct: 'Париж', tag: 'География' });
stickyApi.registerMistake({ q: 'Столица Франции', correct: 'Париж', tag: 'География' });
stickyApi.registerMistake({ q: 'Столица Франции', correct: 'Париж', tag: 'География' });
let stickyItem = readReviewItem(stickyApi, stickyCard.key).item;
assert.equal(stickyItem.sticky, true, 'three lapses should mark the card as sticky');
assert.equal(stickyItem.lapses, 3, 'sticky cards should track three lapses');
assert.equal(stickyItem.ef, 1.3, 'sticky cards should bottom out at the minimum EF');
stickyApi.gradeCard(stickyCard.key, 5, false);
stickyItem = readReviewItem(stickyApi, stickyCard.key).item;
assert.equal(stickyItem.sticky, true, 'one strong answer should keep the sticky card under watch');
stickyApi.gradeCard(stickyCard.key, 5, false);
stickyItem = readReviewItem(stickyApi, stickyCard.key).item;
assert.equal(stickyItem.sticky, false, 'two strong answers should release the sticky card');

stickyApi.markAllDue();
assert.ok(stickyApi.dueCount() >= 1, 'markAllDue should bring cards back into the due queue');
const reviewSummary = stickyEnv.context.window.getReviewSummary();
assert.ok(typeof reviewSummary.upcomingWeek === 'number', 'getReviewSummary should expose the weekly due summary');
assert.ok(typeof reviewSummary.avgEf === 'number', 'getReviewSummary should expose the average EF summary');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  hashedAssetCount: manifest.hashed_asset_count,
  gradePages: gradePages.length,
  builtCorePath,
  intervals: {
    firstSuccess: 1,
    secondSuccess: 6,
    thirdSuccess: thirdSuccessInterval,
    hintedReset: 1
  },
  legacy: {
    version: legacyState.version,
    algo: legacyState.algo,
    repetitions: legacyItem.repetitions,
    intervalDays: legacyItem.intervalDays,
    ef: legacyItem.ef
  },
  sticky: {
    lapses: stickyItem.lapses,
    released: stickyItem.sticky === false
  },
  digest,
  reviewSummary
}, null, 2));
