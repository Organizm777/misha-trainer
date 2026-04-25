#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';
import vm from 'vm';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJSON = (rel) => JSON.parse(read(rel));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const sw = read('sw.js');
const runtimeLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const cssLogical = 'assets/css/wave88d_breadcrumbs.css';
const runtimeBuilt = manifest.assets[runtimeLogical];
const cssBuilt = manifest.assets[cssLogical];

assert.equal(healthz.wave, 'wave89d', `healthz.wave should be wave89d, got ${healthz.wave}`);
assert.equal(healthz.build_id, 'wave89d', `healthz.build_id should be wave89d, got ${healthz.build_id}`);
assert.ok(String(healthz.cache || '').includes('wave89d'), `healthz.cache should reference wave89d, got ${healthz.cache}`);
assert.ok(runtimeBuilt, `asset-manifest missing ${runtimeLogical}`);
assert.ok(cssBuilt, `asset-manifest missing ${cssLogical}`);
assert.ok(exists(runtimeBuilt), `missing built runtime asset ${runtimeBuilt}`);
assert.ok(exists(cssBuilt), `missing built css asset ${cssBuilt}`);
assert.ok(sw.includes(`./${runtimeBuilt}`), 'sw.js should precache the rebuilt merged runtime');
assert.ok(sw.includes(`./${cssBuilt}`), 'sw.js should precache the rebuilt breadcrumbs/simple-mode css');

for (let grade = 1; grade <= 11; grade += 1) {
  const html = read(`grade${grade}_v2.html`);
  assert.ok(html.includes(`./${runtimeBuilt}`), `grade${grade}_v2.html should load ${runtimeBuilt}`);
  assert.ok(html.includes(`./${cssBuilt}`), `grade${grade}_v2.html should load ${cssBuilt}`);
}

const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
assert.ok(srcRuntime.includes('window.__wave89dSimpleMode'), 'runtime source should expose window.__wave89dSimpleMode');
assert.ok(srcRuntime.includes('trainer_simple_mode_v1'), 'runtime source should persist trainer_simple_mode_v1');
assert.ok(srcRuntime.includes('wave89d-settings-modal'), 'runtime source should define the settings modal id');
assert.ok(srcRuntime.includes('showMixFilter'), 'runtime source should patch showMixFilter');
assert.ok(srcRuntime.includes('startRush'), 'runtime source should patch startRush');
assert.ok(srcRuntime.includes('showRushRecords'), 'runtime source should patch showRushRecords');
assert.ok(srcRuntime.includes('#wave86p-challenge-card'), 'runtime source should hide the exam/weekly card in simple mode');
assert.ok(srcRuntime.includes('#wave86v-pvp-card'), 'runtime source should hide the PvP card in simple mode');
assert.ok(srcRuntime.includes('#wave86w-main-cloud-btn'), 'runtime source should hide main cloud sync in simple mode');
assert.ok(srcRuntime.includes('[data-wave68-action="leaders"]'), 'runtime source should hide hall-of-fame leaderboard actions in simple mode');
assert.ok(srcRuntime.includes('resolvePracticePlan'), 'runtime source should expose smart-start planning');
assert.ok(srcRuntime.includes('trainer_session_snapshot_'), 'runtime source should inspect saved session snapshots');
assert.ok(srcRuntime.includes('trainer_last_topic_'), 'runtime source should inspect the last visited topic');
assert.ok(srcRuntime.includes('trainer_progress_'), 'runtime source should inspect progress for new-topic smart-start');
assert.ok(srcRuntime.includes('startDueReview'), 'runtime source should support due-review smart-start');
assert.ok(srcRuntime.includes('startStickyReview'), 'runtime source should support sticky-review smart-start');
assert.ok(srcRuntime.includes('startWeakTrainingByTopics'), 'runtime source should support weak-topics smart-start');
assert.ok(srcRuntime.includes('wave21ResumeSession'), 'runtime source should resume saved sessions');
assert.ok(srcRuntime.includes('wave21ContinueLastTopic'), 'runtime source should continue the last topic');
assert.ok(srcRuntime.includes("wave21OpenTopic(plan.subjectId, plan.topicId, 'train')"), 'runtime source should open a new topic in train mode');
assert.ok(srcCss.includes('html.simple-mode #wave86p-challenge-card'), 'css source should hide advanced cards under .simple-mode');
assert.ok(srcCss.includes('.wave89d-settings-overlay'), 'css source should style the simple-mode settings overlay');
assert.ok(srcCss.includes('[data-wave89d-hide-simple="1"]'), 'css source should support generic simple-mode hiding markers');

const runtimeMarker = '/* wave89d: simple mode / simplified UX gate */';
const runtimeStart = srcRuntime.indexOf(runtimeMarker);
assert.ok(runtimeStart >= 0, 'could not find the wave89d runtime marker');
const isolatedRuntime = srcRuntime.slice(runtimeStart);
assert.ok(isolatedRuntime.includes('window.__wave89dSimpleMode'), 'could not isolate the wave89d runtime block for vm audit');

function makeClassList(){
  const values = new Set();
  return {
    add(name){ values.add(String(name)); },
    remove(name){ values.delete(String(name)); },
    contains(name){ return values.has(String(name)); },
    toArray(){ return Array.from(values.values()).sort(); }
  };
}

function makeNode(tag = 'div'){
  return {
    tagName: String(tag).toUpperCase(),
    className: '',
    textContent: '',
    innerHTML: '',
    attributes: {},
    children: [],
    parentNode: null,
    classList: makeClassList(),
    style: {},
    appendChild(child){ if (child) { child.parentNode = this; this.children.push(child); } return child; },
    removeChild(child){ this.children = this.children.filter((item) => item !== child); if (child) child.parentNode = null; return child; },
    remove(){ if (this.parentNode) this.parentNode.removeChild(this); },
    setAttribute(name, value){ this.attributes[String(name)] = String(value); },
    getAttribute(name){ return Object.prototype.hasOwnProperty.call(this.attributes, String(name)) ? this.attributes[String(name)] : null; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    addEventListener(){},
    removeEventListener(){},
    closest(){ return null; }
  };
}

function asStored(value){
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function runVm(options = {}){
  const htmlClassList = makeClassList();
  const bodyClassList = makeClassList();
  const body = makeNode('body');
  body.classList = bodyClassList;
  const documentElement = makeNode('html');
  documentElement.classList = htmlClassList;
  const storage = new Map();
  if (typeof options.initialMode === 'string') storage.set('trainer_simple_mode_v1', options.initialMode);
  Object.entries(options.storage || {}).forEach(([key, value]) => {
    storage.set(String(key), asStored(value));
  });

  const document = {
    readyState: 'complete',
    documentElement,
    body,
    addEventListener(){},
    removeEventListener(){},
    dispatchEvent(){ return true; },
    querySelectorAll(){ return []; },
    querySelector(){ return null; },
    getElementById(){ return null; },
    createElement(tag){ return makeNode(tag); }
  };

  const counts = Object.assign({ due:0, sticky:0, total:0 }, options.reviewCounts || {});
  const calls = [];
  const toasts = [];
  const MutationObserver = function(){ this.observe = function(){}; this.disconnect = function(){}; };

  const context = {
    window: {},
    document,
    localStorage: {
      getItem(key){ return storage.has(String(key)) ? storage.get(String(key)) : null; },
      setItem(key, value){ storage.set(String(key), String(value)); },
      removeItem(key){ storage.delete(String(key)); }
    },
    MutationObserver,
    CustomEvent: function(type, init){ this.type = type; this.detail = init && init.detail; },
    console,
    setTimeout(fn){ if (typeof fn === 'function') fn(); return 1; },
    clearTimeout(){},
    alert(message){ toasts.push(String(message)); },
    navigator: {},
    location: {},
    addEventListener(){},
    removeEventListener(){},
    GRADE_NUM: options.grade || '10',
    GRADE_NO: options.grade || '10',
    SUBJ: options.subjects || [],
    toast(message){ toasts.push(String(message)); },
    showAbout(){ calls.push('show-about'); },
    showMixFilter(){ calls.push('show-mix-filter'); return true; },
    startGlobalMix(){ calls.push('global-mix'); return true; },
    startDueReview(){ calls.push('due-review'); return true; },
    startStickyReview(){ calls.push('sticky-review'); return true; },
    startWeakTrainingByTopics(){ calls.push('weak-topics'); return true; },
    wave21ResumeSession(){ calls.push('resume-session'); return true; },
    wave21ContinueLastTopic(){ calls.push('continue-last'); return true; },
    wave21OpenTopic(subjectId, topicId, mode){ calls.push({ fn:'open-topic', args:[subjectId, topicId, mode] }); return true; },
    wave28Debug: {
      dueCount(){ return counts.due; },
      stickyCount(){ return counts.sticky; },
      totalCount(){ return counts.total; }
    }
  };
  context.window = context;
  vm.runInNewContext(isolatedRuntime, context, { timeout: 1000 });
  return { context, storage, htmlClassList, bodyClassList, calls, toasts };
}

const fresh = runVm();
assert.ok(fresh.context.window.__wave89dSimpleMode, 'vm: __wave89dSimpleMode should be exposed');
assert.equal(fresh.context.window.__wave89dSimpleMode.storageKey, 'trainer_simple_mode_v1', 'vm: storageKey mismatch');
assert.equal(fresh.context.window.__wave89dSimpleMode.isEnabled(), true, 'vm: simple mode should default to ON');
assert.ok(fresh.htmlClassList.contains('simple-mode'), 'vm: html should get simple-mode class by default');
assert.ok(fresh.bodyClassList.contains('simple-mode'), 'vm: body should get simple-mode class by default');

fresh.context.window.__wave89dSimpleMode.setEnabled(false, { silent:true });
assert.equal(fresh.storage.get('trainer_simple_mode_v1'), 'off', 'vm: disabling should persist off');
assert.equal(fresh.context.window.__wave89dSimpleMode.isEnabled(), false, 'vm: simple mode should switch off');
assert.ok(!fresh.htmlClassList.contains('simple-mode'), 'vm: html should drop simple-mode class after disabling');
assert.ok(!fresh.bodyClassList.contains('simple-mode'), 'vm: body should drop simple-mode class after disabling');

const persistedOff = runVm({ initialMode:'off' });
assert.equal(persistedOff.context.window.__wave89dSimpleMode.isEnabled(), false, 'vm: persisted off should stay off on boot');
assert.ok(!persistedOff.htmlClassList.contains('simple-mode'), 'vm: persisted off should not add html simple-mode class');

const dueVm = runVm({ reviewCounts:{ due:3, sticky:1, total:4 } });
const duePlan = dueVm.context.window.__wave89dSimpleMode.resolvePracticePlan();
assert.equal(duePlan.kind, 'due-review', 'vm: due review should be the first smart-start priority');
assert.equal(dueVm.context.window.__wave89dSimpleMode.directPractice(), true, 'vm: directPractice should return true for due-review');
assert.deepEqual(dueVm.calls, ['due-review'], 'vm: due-review should trigger startDueReview');
assert.ok(dueVm.toasts.some((msg) => /повторим ошибки/i.test(msg)), 'vm: due-review should toast a helpful message');

const stickyVm = runVm({ reviewCounts:{ due:0, sticky:2, total:2 } });
const stickyPlan = stickyVm.context.window.__wave89dSimpleMode.resolvePracticePlan();
assert.equal(stickyPlan.kind, 'sticky-review', 'vm: sticky review should be chosen after due-review');
stickyVm.context.window.__wave89dSimpleMode.directPractice();
assert.deepEqual(stickyVm.calls, ['sticky-review'], 'vm: sticky-review should trigger startStickyReview');

const weakVm = runVm({ reviewCounts:{ due:0, sticky:0, total:5 } });
const weakPlan = weakVm.context.window.__wave89dSimpleMode.resolvePracticePlan();
assert.equal(weakPlan.kind, 'weak-topics', 'vm: weak-topics should follow error review modes');
weakVm.context.window.__wave89dSimpleMode.directPractice();
assert.deepEqual(weakVm.calls, ['weak-topics'], 'vm: weak-topics should trigger startWeakTrainingByTopics');

const resumeVm = runVm({
  storage: {
    trainer_session_snapshot_10: { prob:{ q:'x' } }
  }
});
const resumePlan = resumeVm.context.window.__wave89dSimpleMode.resolvePracticePlan();
assert.equal(resumePlan.kind, 'resume-session', 'vm: smart-start should resume a saved session before continuing last topic');
resumeVm.context.window.__wave89dSimpleMode.directPractice();
assert.deepEqual(resumeVm.calls, ['resume-session'], 'vm: resume-session should trigger wave21ResumeSession');

const continueVm = runVm({
  storage: {
    trainer_last_topic_10: { subjId:'math', topicId:'alg' }
  }
});
const continuePlan = continueVm.context.window.__wave89dSimpleMode.resolvePracticePlan();
assert.equal(continuePlan.kind, 'continue-last', 'vm: smart-start should continue the last topic when no saved session exists');
continueVm.context.window.__wave89dSimpleMode.directPractice();
assert.deepEqual(continueVm.calls, ['continue-last'], 'vm: continue-last should trigger wave21ContinueLastTopic');

const newTopicVm = runVm({
  storage: {
    trainer_progress_10: {
      math: {
        alg: { ok:2, err:1 },
        geo: { ok:0, err:0 }
      }
    },
    trainer_last_topic_10: { subjId:'math', topicId:'alg' },
    trainer_streak_10: { totalOk:10 }
  },
  subjects: [
    {
      id: 'math',
      nm: 'Математика',
      tops: [
        { id:'alg', nm:'Алгебра' },
        { id:'geo', nm:'Геометрия' }
      ]
    },
    {
      id: 'bio',
      nm: 'Биология',
      tops: [
        { id:'cell', nm:'Клетка' }
      ]
    }
  ]
});
delete newTopicVm.context.wave21ContinueLastTopic;
const newTopicPlan = newTopicVm.context.window.__wave89dSimpleMode.resolvePracticePlan();
assert.equal(newTopicPlan.kind, 'new-topic', 'vm: smart-start should offer a new untouched topic when no review/resume targets remain');
assert.equal(newTopicPlan.subjectId, 'math', 'vm: new-topic should prefer the subject of the last topic when possible');
assert.equal(newTopicPlan.topicId, 'geo', 'vm: new-topic should pick the untouched topic inside that subject');
newTopicVm.context.window.__wave89dSimpleMode.directPractice();
assert.deepEqual(newTopicVm.calls, [{ fn:'open-topic', args:['math', 'geo', 'train'] }], 'vm: new-topic should open the untouched topic in train mode');

const mixVm = runVm();
const mixPlan = mixVm.context.window.__wave89dSimpleMode.resolvePracticePlan();
assert.equal(mixPlan.kind, 'global-mix', 'vm: smart-start should fall back to the standard global mix');
mixVm.context.window.__wave89dSimpleMode.directPractice();
assert.deepEqual(mixVm.calls, ['global-mix'], 'vm: fallback should launch the standard global mix');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  runtimeBuilt,
  cssBuilt,
  storageKey: 'trainer_simple_mode_v1',
  defaultOn: true,
  smartStartOrder: ['due-review', 'sticky-review', 'weak-topics', 'resume-session', 'continue-last', 'new-topic', 'global-mix'],
  gradePages: 11,
  hashedAssetCount: manifest.hashed_asset_count
}, null, 2));
