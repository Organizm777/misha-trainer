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
function isolateWave89m(source){
  const marker = '/* wave89m: adaptive difficulty */';
  const start = source.indexOf(marker);
  assert.ok(start >= 0, 'could not locate the wave89m marker in the merged runtime source');
  return source.slice(start);
}
function createClassList(initial = []){
  const set = new Set(initial.map(String));
  return {
    add(...names){ names.forEach((name) => set.add(String(name))); },
    remove(...names){ names.forEach((name) => set.delete(String(name))); },
    contains(name){ return set.has(String(name)); },
    toArray(){ return Array.from(set); }
  };
}
function matches(node, selector){
  if (!node || !selector) return false;
  if (selector.startsWith('#')) return node.id === selector.slice(1);
  const attrMatch = selector.match(/^\[([^\]=]+)(?:=([^\]]+))?\]$/);
  if (attrMatch) {
    const attr = attrMatch[1];
    return Object.prototype.hasOwnProperty.call(node.attributes || {}, attr) || node[attr] != null;
  }
  return false;
}
function walkQuery(root, selector, results){
  const out = results || [];
  if (!root || !Array.isArray(root.children)) return out;
  root.children.forEach((child) => {
    if (matches(child, selector)) out.push(child);
    walkQuery(child, selector, out);
  });
  return out;
}
function createNode(tagName = 'div'){
  return {
    tagName: String(tagName).toUpperCase(),
    id: '',
    attributes: {},
    children: [],
    parentNode: null,
    style: {},
    className: '',
    textContent: '',
    innerHTML: '',
    classList: createClassList(),
    appendChild(child){
      if (!child) return child;
      if (child.parentNode && typeof child.parentNode.removeChild === 'function') child.parentNode.removeChild(child);
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    insertBefore(child, before){
      if (!child) return child;
      if (child.parentNode && typeof child.parentNode.removeChild === 'function') child.parentNode.removeChild(child);
      const idx = this.children.indexOf(before);
      if (idx < 0) this.children.push(child);
      else this.children.splice(idx, 0, child);
      child.parentNode = this;
      return child;
    },
    removeChild(child){
      const idx = this.children.indexOf(child);
      if (idx >= 0) {
        this.children.splice(idx, 1);
        child.parentNode = null;
      }
      return child;
    },
    remove(){
      if (this.parentNode && typeof this.parentNode.removeChild === 'function') this.parentNode.removeChild(this);
    },
    setAttribute(name, value){
      this.attributes[String(name)] = String(value);
      this[String(name)] = String(value);
      if (name === 'id') this.id = String(value);
    },
    getAttribute(name){
      return this.attributes[String(name)] ?? null;
    },
    querySelector(selector){
      return walkQuery(this, selector, [])[0] || null;
    },
    querySelectorAll(selector){
      return walkQuery(this, selector, []);
    },
    addEventListener(){},
    removeEventListener(){},
    closest(){ return this; },
    scrollIntoView(){}
  };
}
function createHarness(){
  let runtimeContext = null;
  const store = new Map();
  const head = createNode('head');
  const body = createNode('body');
  const html = createNode('html');
  const playScreen = createNode('section');
  playScreen.id = 's-play';
  playScreen.classList.add('on');
  const progressHost = createNode('div');
  progressHost.id = 'prog-content';
  const qcWrap = createNode('div');
  const qc = createNode('div');
  qc.id = 'qc';
  qcWrap.appendChild(qc);
  const progressArea = createNode('div');
  progressArea.id = 'pa';
  body.appendChild(playScreen);
  body.appendChild(qcWrap);
  body.appendChild(progressHost);
  body.appendChild(progressArea);
  const ids = {
    's-play': playScreen,
    'prog-content': progressHost,
    qc,
    pa: progressArea
  };
  const randomSequence = [0.05, 0.45, 0.85, 0.15, 0.55, 0.95, 0.25, 0.65, 0.75, 0.35];
  let randomIndex = 0;
  const mathObject = Object.create(Math);
  mathObject.random = () => randomSequence[(randomIndex += 1) % randomSequence.length];
  const document = {
    readyState: 'complete',
    head,
    body,
    documentElement: html,
    addEventListener(){},
    removeEventListener(){},
    dispatchEvent(){},
    getElementById(id){ return ids[id] || null; },
    createElement(tagName){ return createNode(tagName); },
    querySelector(selector){ return walkQuery(body, selector, [])[0] || null; },
    querySelectorAll(selector){ return walkQuery(body, selector, []); }
  };
  function setStorage(key, value){ store.set(String(key), String(value)); }
  function getStorage(key){ return store.has(String(key)) ? store.get(String(key)) : null; }
  function writeTiming(samples){
    setStorage('trainer_response_timing_10', JSON.stringify({
      version: 'wave87x',
      grade: '10',
      updatedAt: Date.now(),
      samples
    }));
  }
  function topic(id, name, bucket){
    let counter = 0;
    return {
      id,
      nm: name,
      th: `<p>${name}</p>`,
      gen(){
        counter += 1;
        const levelMap = { easy:1, medium:2, hard:3 };
        return {
          question: `${name} #${counter}`,
          answer: 'ok',
          options: ['ok', 'no1', 'no2', 'no3'],
          tag: name,
          diffBucket: bucket,
          difficultyLevel: levelMap[bucket],
          difficulty: bucket
        };
      }
    };
  }
  const easyTopic = topic('easy', 'Лёгкие уравнения', 'easy');
  const mediumTopic = topic('medium', 'Средние уравнения', 'medium');
  const hardTopic = topic('hard', 'Сложные уравнения', 'hard');
  const subject = { id:'alg', nm:'Алгебра', tops:[easyTopic, mediumTopic, hardTopic] };
  const context = vm.createContext({
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math: mathObject,
    Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN,
    document,
    CustomEvent: function CustomEvent(type, init){ this.type = type; this.detail = init && init.detail; },
    navigator: {},
    localStorage: {
      getItem: getStorage,
      setItem: setStorage,
      removeItem(key){ store.delete(String(key)); }
    },
    GRADE_NUM: '10',
    SUBJ: [subject],
    cS: subject,
    cT: easyTopic,
    prob: null,
    sel: null,
    hintOn: false,
    shpOn: false,
    usedHelp: false,
    seenQs: {},
    st: { ok:0, err:0 },
    mix: false,
    globalMix: false,
    rushMode: false,
    diagMode: false,
    __wave21QuestionQueue: null,
    __wave21QuestionQueueTotal: 0,
    __wave21SessionMode: '',
    __wave28CurrentReviewKey: '',
    wave28Debug: null,
    prepareQuestion(question){
      return Object.assign({}, question, {
        options: Array.isArray(question && question.options) ? question.options.slice() : []
      });
    },
    findTopicMeta(arg1, arg2){
      const wantedTag = String(arg2 || arg1 || '').toLowerCase();
      const wantedSubject = String(arg2 ? arg1 || '' : '').toLowerCase();
      if (wantedSubject && wantedSubject !== 'alg') return null;
      return subject.tops.reduce((found, topicRow) => {
        if (found) return found;
        const id = String(topicRow.id || '').toLowerCase();
        const nm = String(topicRow.nm || '').toLowerCase();
        return wantedTag === id || wantedTag === nm ? { subj:subject, topic:topicRow } : null;
      }, null);
    },
    render(){
      const self = runtimeContext || this || {};
      self.__renderCount = (self.__renderCount || 0) + 1;
      return true;
    },
    renderProg(){
      const self = runtimeContext || this || {};
      self.__renderProgCount = (self.__renderProgCount || 0) + 1;
      return true;
    },
    nextQ(){
      const self = runtimeContext || this || {};
      let raw = null;
      if (self.globalMix && typeof self.genGlobalMix === 'function') raw = self.genGlobalMix();
      else if (self.mix) raw = subject.tops[0].gen();
      else if (self.cT && typeof self.cT.gen === 'function') raw = self.cT.gen();
      if (!raw) return false;
      self.prob = self.prepareQuestion(raw);
      const key = String(self.prob.question || '') + String(self.prob.answer || '');
      self.seenQs[key] = (Number(self.seenQs[key]) || 0) + 1;
      self.sel = null;
      self.hintOn = false;
      self.shpOn = false;
      self.usedHelp = false;
      self.render();
      return true;
    },
    startQuiz(){
      const self = runtimeContext || this || {};
      self.st = { ok:0, err:0 };
      self.seenQs = {};
      self.sel = null;
      return self.nextQ();
    },
    ans(index){
      const self = runtimeContext || this || {};
      if (self.sel != null || !self.prob) return null;
      const option = self.prob.options[index];
      self.sel = option;
      const correct = option === self.prob.answer;
      self.st.ok += correct ? 1 : 0;
      self.st.err += correct ? 0 : 1;
      return option;
    },
    endSession(){ const self = runtimeContext || this || {}; self.__ended = true; return true; },
    scrollTo(){},
    __wave87xInputTimingRuntime: {
      readStore(){
        const raw = getStorage('trainer_response_timing_10');
        return raw ? JSON.parse(raw) : { version:'wave87x', grade:'10', samples:[] };
      }
    }
  });
  context.window = context;
  context.self = context;
  context.globalThis = context;
  runtimeContext = context;
  return { context, store, writeTiming, nodes:{ playScreen, progressHost, qcWrap, body }, subject, easyTopic, mediumTopic, hardTopic };
}

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const changelog = read('CHANGELOG.md');
const docs = read('docs/ADAPTIVE_DIFFICULTY_wave89m.md');
const claude = read('CLAUDE.md');
const toolsReadme = read('tools/README.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');
const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
const builtRuntimePath = manifest.assets['assets/js/bundle_grade_runtime_extended_wave89b.js'];
const builtCssPath = manifest.assets['assets/css/wave88d_breadcrumbs.css'];
assert.ok(builtRuntimePath, 'asset-manifest should include the merged runtime bundle');
assert.ok(builtCssPath, 'asset-manifest should include the shared grade CSS asset');
const builtRuntime = read(builtRuntimePath);
const builtCss = read(builtCssPath);

assert.ok(waveRank(healthz.wave) >= waveRank('wave89m'), `healthz.wave should be wave89m+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89m'), `healthz.build_id should be wave89m+ (got ${healthz.build_id})`);
assert.equal(manifest.version, healthz.version, 'manifest/healthz versions should match');
assert.ok(Number(manifest.hashed_asset_count || 0) >= 101, 'hashed asset count should stay populated');

const gradePages = Array.from({ length: 11 }, (_, idx) => `grade${idx + 1}_v2.html`);
gradePages.forEach((page) => {
  const html = read(page);
  assert.ok(html.includes(`./${builtRuntimePath}`), `${page} should reference the rebuilt merged runtime`);
  assert.ok(html.includes(`./${builtCssPath}`), `${page} should reference the rebuilt shared grade CSS`);
});

assert.ok(srcRuntime.includes('/* wave89m: adaptive difficulty */'), 'source merged runtime should contain the wave89m marker');
assert.ok(srcRuntime.includes('trainer_adaptive_difficulty_'), 'source merged runtime should persist per-grade adaptive state');
assert.ok(srcRuntime.includes('__wave87xInputTimingRuntime'), 'source merged runtime should integrate with the timing runtime');
assert.ok(srcRuntime.includes('SESSION_STREAK_TRIGGER = 5'), 'source merged runtime should keep the 5-answer promotion trigger');
assert.ok(srcRuntime.includes('difficultyLevel = levelNumber(bucket)'), 'source merged runtime should normalize numeric difficulty levels');
assert.ok(srcRuntime.includes("5 верных подряд — повышаем сложность на один шаг"), 'source merged runtime should explain the promotion rule');
assert.ok(srcRuntime.includes('currentState: function(){ return clone(state); }'), 'source merged runtime should export currentState');
assert.ok(srcRuntime.includes('candidateScore: candidateScore'), 'source merged runtime should export candidateScore for inspection');
assert.ok(srcRuntime.includes('вопросы уже тегированы по уровням 1–3'), 'source merged runtime should document the tagging contract');
assert.ok(builtRuntime.includes('/* wave89m: adaptive difficulty */'), 'rebuilt merged runtime should contain the wave89m marker');
assert.ok(builtRuntime.includes('__wave89mAdaptiveDifficulty'), 'rebuilt merged runtime should export the wave89m API');

assert.ok(srcCss.includes('/* wave89m: adaptive difficulty */'), 'shared grade CSS source should contain the wave89m marker');
assert.ok(srcCss.includes('.wave89m-adaptive-card'), 'shared grade CSS source should style the adaptive cards');
assert.ok(srcCss.includes('html.wave89k-weak-ui .wave89m-adaptive-note'), 'shared grade CSS source should scale wave89m copy in weak-device mode');
assert.ok(builtCss.includes('.wave89m-adaptive-card'), 'rebuilt shared grade CSS should style the adaptive cards');

assert.ok(changelog.includes('## wave89m'), 'CHANGELOG should document wave89m');
assert.ok(changelog.includes('roadmap `#46`'), 'CHANGELOG should mention roadmap item #46');
assert.ok(docs.includes('trainer_adaptive_difficulty_<grade>'), 'wave89m doc should mention the persisted adaptive key');
assert.ok(docs.includes('5 верных подряд'), 'wave89m doc should mention the promotion trigger');
assert.ok(docs.includes('время ответа'), 'wave89m doc should mention time tracking');
assert.ok(claude.includes('### wave89m adaptive difficulty'), 'CLAUDE.md should document wave89m');
assert.ok(toolsReadme.includes('audit_adaptive_difficulty_wave89m.mjs'), 'tools README should list the wave89m audit');
assert.ok(validateWorkflow.includes('node tools/audit_adaptive_difficulty_wave89m.mjs'), 'validate workflow should run the wave89m audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_adaptive_difficulty_wave89m.mjs'), 'lighthouse workflow should run the wave89m audit');

const isolatedWave89m = isolateWave89m(srcRuntime);
const harness = createHarness();
const { context, writeTiming, nodes, subject, easyTopic, mediumTopic, hardTopic } = harness;
vm.runInContext(isolatedWave89m, context, { filename:'wave89m.vm.js', timeout: 2000 });
const api = context.window.__wave89mAdaptiveDifficulty;
assert.ok(api, 'wave89m VM harness should expose __wave89mAdaptiveDifficulty');
assert.equal(api.version, 'wave89m', 'wave89m API version should be exposed');

writeTiming(Array.from({ length: 8 }, () => ({ mode:'train', subject:'alg', tag:'Средние уравнения', correct:true, ms:12000 })));
api.clear();
const mediumContext = api.inferContext({ tag:'Средние уравнения' }, subject, mediumTopic);
const fastTimingBaseLevel = api.recommendBaseLevel(api.readProfile(mediumContext), mediumContext);
assert.equal(fastTimingBaseLevel, 1, 'fast historical timing should promote a fresh medium topic to level 2 readiness');

writeTiming(Array.from({ length: 8 }, () => ({ mode:'train', subject:'alg', tag:'Сложные уравнения', correct:true, ms:32000 })));
api.clear();
const hardContext = api.inferContext({ tag:'Сложные уравнения' }, subject, hardTopic);
const slowTimingBaseLevel = api.recommendBaseLevel(api.readProfile(hardContext), hardContext);
assert.equal(slowTimingBaseLevel, 0, 'slow historical timing should keep a fresh hard topic at easy readiness');

writeTiming([]);
api.clear();
context.cS = subject;
context.cT = easyTopic;
context.mix = false;
context.globalMix = false;
context.startQuiz();
for (let i = 0; i < 5; i += 1) {
  context.prob.__wave87xTiming = { last:{ ms:9000 } };
  context.ans(0);
  if (i < 4) context.nextQ();
}
const afterStreak = api.currentState();
assert.equal(afterStreak.shift, 1, 'five correct answers should set a positive session shift');
assert.equal(afterStreak.lastTarget, 'medium', 'five correct answers should raise the target to medium');
assert.equal(afterStreak.answers, 5, 'five correct answers should be counted');
assert.ok(nodes.qcWrap.querySelector('[data-wave89m-play-card]'), 'rendering on the play screen should inject the adaptive play card');

context.mix = true;
context.cT = null;
context.nextQ();
const mixedQuestion = context.prob;
assert.equal(mixedQuestion && mixedQuestion.diffBucket, 'medium', 'subject mix should prefer a medium question after the streak bump');
assert.equal(mixedQuestion && mixedQuestion.difficultyLevel, 2, 'selected question should expose numeric difficultyLevel=2');

context.mix = false;
context.cT = mediumTopic;
context.nextQ();
context.prob.__wave87xTiming = { last:{ ms:35000 } };
context.ans(1);
context.nextQ();
context.prob.__wave87xTiming = { last:{ ms:35000 } };
context.ans(1);
const afterTrouble = api.currentState();
assert.equal(afterTrouble.shift, 0, 'two wrong answers should remove the positive session shift');
assert.equal(afterTrouble.lastTarget, 'easy', 'two wrong answers should lower the target back to easy');
assert.match(afterTrouble.lastReason, /упрощаем/, 'trouble downgrade should keep an explanatory reason');

writeTiming(Array.from({ length: 8 }, () => ({ mode:'train', subject:'alg', tag:'Средние уравнения', correct:true, ms:11000 })));
api.clear();
for (let i = 0; i < 3; i += 1) {
  api.recordOutcome(mediumContext, {
    correct: true,
    usedHelp: false,
    ms: 35000,
    bucket: 'medium',
    target: 'medium'
  });
}
const afterSlowRun = api.currentState();
assert.equal(afterSlowRun.shift, -1, 'three slow answers should push the session shift down');
assert.equal(afterSlowRun.lastTarget, 'easy', 'slow answers should lower the target to easy');
assert.match(afterSlowRun.lastReason, /слишком медленно/, 'slow-answer downgrade should keep an explanatory reason');

context.renderProg();
assert.ok(nodes.progressHost.querySelector('[data-wave89m-progress-card]'), 'renderProg should append the adaptive progress card');

const summary = api.buildSummary();
assert.equal(summary.totalTopics, 1, 'the slow-run scenario should leave one stored adaptive profile after clear + replay');
assert.equal(summary.counts.medium, 1, 'the stored medium topic should remain classified at level 2 baseline');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  hashedAssetCount: Number(manifest.hashed_asset_count || 0),
  runtime: builtRuntimePath,
  css: builtCssPath,
  gradePages: gradePages.length,
  fastTimingBaseLevel,
  slowTimingBaseLevel,
  afterStreak: {
    shift: afterStreak.shift,
    target: afterStreak.lastTarget,
    answers: afterStreak.answers,
    reason: afterStreak.lastReason
  },
  mixedQuestion: {
    bucket: mixedQuestion.diffBucket,
    difficultyLevel: mixedQuestion.difficultyLevel,
    tag: mixedQuestion.tag
  },
  afterTrouble: {
    shift: afterTrouble.shift,
    target: afterTrouble.lastTarget,
    reason: afterTrouble.lastReason
  },
  afterSlowRun: {
    shift: afterSlowRun.shift,
    target: afterSlowRun.lastTarget,
    reason: afterSlowRun.lastReason
  },
  summary,
  playCard: true,
  progressCard: true
}, null, 2));
