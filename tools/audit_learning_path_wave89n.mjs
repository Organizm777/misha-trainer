#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';
import vm from 'vm';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJSON = (rel) => JSON.parse(read(rel));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

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
function isolateWave89n(source){
  const marker = '/* wave89n: guided learning path */';
  const start = source.indexOf(marker);
  assert.ok(start >= 0, 'could not locate the wave89n marker in the merged runtime source');
  return source.slice(start);
}
function makeNode(tagName = 'div'){
  return {
    tagName: String(tagName).toUpperCase(),
    id: '',
    children: [],
    parentNode: null,
    className: '',
    attributes: {},
    innerHTML: '',
    textContent: '',
    appendChild(child){ if (!child) return child; this.children.push(child); child.parentNode = this; return child; },
    removeChild(child){ const idx = this.children.indexOf(child); if (idx >= 0) { this.children.splice(idx, 1); child.parentNode = null; } return child; },
    remove(){ if (this.parentNode && typeof this.parentNode.removeChild === 'function') this.parentNode.removeChild(this); },
    setAttribute(name, value){ this.attributes[String(name)] = String(value); if (name === 'id') this.id = String(value); },
    getAttribute(name){ return this.attributes[String(name)] ?? null; },
    querySelector(selector){ return queryAll(this, selector)[0] || null; },
    querySelectorAll(selector){ return queryAll(this, selector); },
    addEventListener(){},
    removeEventListener(){}
  };
}
function matches(node, selector){
  if (!node || !selector) return false;
  if (selector.startsWith('#')) return node.id === selector.slice(1);
  const attrMatch = selector.match(/^\[([^\]=]+)(?:=([^\]]+))?\]$/);
  if (attrMatch) return Object.prototype.hasOwnProperty.call(node.attributes || {}, attrMatch[1]);
  return false;
}
function queryAll(root, selector){
  const out = [];
  function walk(node){
    if (!node || !Array.isArray(node.children)) return;
    node.children.forEach((child) => {
      if (matches(child, selector)) out.push(child);
      walk(child);
    });
  }
  walk(root);
  return out;
}
function createHarness(){
  const store = new Map();
  const body = makeNode('body');
  const theoryScreen = makeNode('section'); theoryScreen.id = 's-theory'; theoryScreen.className = 'scr on';
  const playScreen = makeNode('section'); playScreen.id = 's-play'; playScreen.className = 'scr';
  const progScreen = makeNode('section'); progScreen.id = 's-prog'; progScreen.className = 'scr';
  const tc = makeNode('div'); tc.id = 'tc'; theoryScreen.appendChild(tc);
  const pa = makeNode('div'); pa.id = 'pa'; playScreen.appendChild(pa);
  const prog = makeNode('div'); prog.id = 'prog-content'; progScreen.appendChild(prog);
  body.appendChild(theoryScreen); body.appendChild(playScreen); body.appendChild(progScreen);
  const ids = { 's-theory': theoryScreen, 's-play': playScreen, 's-prog': progScreen, tc, pa, 'prog-content': prog };
  let qIndex = 0;
  const questions = [
    { question:'Лёгкий вопрос', answer:'2', options:['2','3','4','5'], diffBucket:'easy', difficulty:'easy' },
    { question:'Средний вопрос', answer:'6', options:['6','7','8','9'], diffBucket:'medium', difficulty:'medium' },
    { question:'Сложный вопрос', answer:'12', options:['12','13','14','15'], diffBucket:'hard', difficulty:'hard' },
    { question:'Ещё один средний', answer:'10', options:['10','11','12','13'], diffBucket:'medium', difficulty:'medium' }
  ];
  const topic = {
    id:'fractions',
    nm:'Дроби',
    th:'<p>Теория про дроби</p>',
    gen(){ const item = questions[qIndex % questions.length]; qIndex += 1; return JSON.parse(JSON.stringify(item)); }
  };
  const subject = { id:'math', nm:'Математика', cl:'#2563eb', bg:'#dbeafe', tops:[topic] };
  const calls = [];
  const context = vm.createContext({
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN,
    document: {
      readyState: 'complete',
      body,
      addEventListener(){},
      getElementById(id){ return ids[id] || null; },
      createElement(tagName){ return makeNode(tagName); },
      querySelectorAll(selector){ return queryAll(body, selector); }
    },
    localStorage: {
      getItem(key){ return store.has(String(key)) ? store.get(String(key)) : null; },
      setItem(key, value){ store.set(String(key), String(value)); },
      removeItem(key){ store.delete(String(key)); }
    },
    CustomEvent: function CustomEvent(type, init){ this.type = type; this.detail = init && init.detail; },
    navigator: {},
    location: { href:'https://example.test/grade10_v2.html' },
    GRADE_NUM: '10',
    SUBJ: [subject],
    cS: subject,
    cT: topic,
    prob: null,
    sel: null,
    usedHelp: false,
    mix: false,
    globalMix: false,
    rushMode: false,
    diagMode: false,
    __wave21QuestionQueue: null,
    __wave21QuestionQueueTotal: 0,
    __wave21SessionMode: null,
    prepareQuestion(q){ return q; },
    showToast(message){ calls.push(['toast', message]); },
    startQuiz(){ calls.push(['startQuiz']); return true; },
    nextQ(){ calls.push(['nextQ']); return true; },
    render(){ calls.push(['render']); return true; },
    renderProg(){ calls.push(['renderProg']); return true; },
    go(){},
    endSession(){ calls.push(['endSession']); return true; },
    ans(){ calls.push(['ans']); return true; },
    __wave89mAdaptiveDifficulty: { difficultyOf(question){ return question && question.diffBucket ? question.diffBucket : 'medium'; } }
  });
  context.window = context;
  return { context, subject, topic, ids, calls, store };
}

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
assert.ok(waveRank(healthz.wave) >= waveRank('wave89n'), `healthz.wave should be wave89n+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89n'), `healthz.build_id should be wave89n+ (got ${healthz.build_id})`);

const runtimeLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const cssLogical = 'assets/css/wave88d_breadcrumbs.css';
const runtimeBuilt = manifest.assets?.[runtimeLogical];
const cssBuilt = manifest.assets?.[cssLogical];
assert.ok(runtimeBuilt, `asset-manifest: missing ${runtimeLogical}`);
assert.ok(cssBuilt, `asset-manifest: missing ${cssLogical}`);
assert.ok(exists(runtimeBuilt), `missing built runtime asset ${runtimeBuilt}`);
assert.ok(exists(cssBuilt), `missing built css asset ${cssBuilt}`);

const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
const builtRuntimeSource = read(runtimeBuilt);
const builtCssSource = read(cssBuilt);
const docs = read('docs/LEARNING_PATH_wave89n.md');
const changelog = read('CHANGELOG.md');
const claude = read('CLAUDE.md');
const toolsReadme = read('tools/README.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');
const sw = read('sw.js');

assert.ok(srcRuntime.includes('/* wave89n: guided learning path */'), 'runtime source should contain the wave89n learning-path marker');
assert.ok(srcRuntime.includes('trainer_learning_path_'), 'runtime source should persist learning-path progress');
assert.ok(srcRuntime.includes('buildGuidedPlan'), 'runtime source should build a guided plan');
assert.ok(srcRuntime.includes('seedGuidedPath'), 'runtime source should seed the wave21 queue for the learning path');
assert.ok(srcRuntime.includes('finishGuidedPhase'), 'runtime source should clear the starter queue and continue into the regular trainer');
assert.ok(srcRuntime.includes('__wave89nLearningPath'), 'runtime source should expose the wave89n API');
assert.ok(srcRuntime.includes("'wave89n'"), 'merged runtime metadata should include wave89n');

assert.ok(srcCss.includes('/* wave89n: learning path */'), 'css source should contain the wave89n marker');
assert.ok(srcCss.includes('.wave89n-path-card'), 'css source should style the wave89n path card');
assert.ok(srcCss.includes('.wave89n-step.active'), 'css source should style the active learning-path step');
assert.ok(srcCss.includes('.wave89n-example'), 'css source should style the worked-example box');

assert.ok(builtRuntimeSource.includes('/* wave89n: guided learning path */'), 'built runtime should contain the wave89n learning-path block');
assert.ok(builtCssSource.includes('.wave89n-path-card'), 'built css should contain the wave89n path styles');
assert.ok(sw.includes(`./${runtimeBuilt}`), 'sw.js should precache the rebuilt merged runtime');
assert.ok(sw.includes(`./${cssBuilt}`), 'sw.js should precache the rebuilt shared css');

assert.ok(docs.includes('trainer_learning_path_<grade>'), 'docs should mention the learning-path storage key');
assert.ok(docs.includes('лёгкое → среднее → сложное'), 'docs should describe the staged route');
assert.ok(changelog.includes('## wave89n'), 'CHANGELOG should document wave89n');
assert.ok(claude.includes('### wave89n learning path'), 'CLAUDE.md should document wave89n');
assert.ok(toolsReadme.includes('audit_learning_path_wave89n.mjs'), 'tools README should list the wave89n audit');
assert.ok(validateWorkflow.includes('node tools/audit_learning_path_wave89n.mjs'), 'validate workflow should run the wave89n audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_learning_path_wave89n.mjs'), 'lighthouse workflow should run the wave89n audit');

for (let grade = 1; grade <= 11; grade += 1) {
  const page = `grade${grade}_v2.html`;
  const html = read(page);
  assert.ok(html.includes(`./${runtimeBuilt}`), `${page} should reference the rebuilt merged runtime`);
  assert.ok(html.includes(`./${cssBuilt}`), `${page} should reference the rebuilt shared css`);
}

const harness = createHarness();
const isolated = isolateWave89n(srcRuntime);
vm.runInContext(isolated, harness.context, { filename:'wave89n.vm.js', timeout: 2000 });
const api = harness.context.window.__wave89nLearningPath;
assert.ok(api, 'vm harness should expose the wave89n API');
assert.equal(api.version, 'wave89n', 'wave89n API version should be exposed');

const plan = api.buildGuidedPlan(harness.subject, harness.topic);
assert.ok(plan, 'vm: buildGuidedPlan should return a plan');
assert.deepEqual(plan.stageOrder.slice(0, 3), ['easy', 'medium', 'hard'], 'vm: the starter queue should follow easy → medium → hard when those buckets exist');
assert.equal(plan.example && plan.example.answer, '2', 'vm: the worked example should prefer the easy sample');
assert.equal(api.shouldSeedForTopic(harness.subject, harness.topic), true, 'vm: a fresh topic should auto-seed the guided route');
assert.equal(api.seedGuidedPath(harness.subject, harness.topic), true, 'vm: seedGuidedPath should seed the guided queue');
assert.equal(Array.isArray(harness.context.window.__wave21QuestionQueue), true, 'vm: seedGuidedPath should fill the wave21 queue');
assert.equal(harness.context.window.__wave21QuestionQueue.length, 3, 'vm: guided queue should contain 3 starter questions');
assert.equal(harness.context.window.__wave21SessionMode, 'learning-path', 'vm: guided queue should use the learning-path session mode');

api.renderTheoryCard();
assert.ok(harness.ids.tc.querySelector(`[data-wave89n-theory-card]`), 'vm: the theory screen should receive the learning-path card');
api.appendProgressCard();
assert.ok(harness.ids['prog-content'].querySelector(`[data-wave89n-progress-card]`), 'vm: the progress screen should receive the learning-path summary card');

harness.context.window.__wave21QuestionQueue = [];
harness.context.window.__wave21SessionMode = 'learning-path';
harness.context.cS = harness.subject;
harness.context.cT = harness.topic;
harness.context.prob = { question:'Сложный вопрос', answer:'12', diffBucket:'hard', __wave89nStage:'hard' };
harness.ids['s-theory'].className = 'scr';
harness.ids['s-play'].className = 'scr on';
harness.context.window.nextQ();
assert.ok(harness.calls.some(([kind, value]) => kind === 'toast' && /Маршрут темы пройден/i.test(value)), 'vm: finishing the starter queue should announce the transition to the regular trainer');
assert.ok(harness.calls.some(([kind]) => kind === 'nextQ'), 'vm: after the starter queue the wrapped nextQ should continue into the regular trainer');
assert.equal(harness.context.window.__wave21SessionMode, null, 'vm: finishing the guided phase should clear learning-path session mode');

const summary = api.summarizeStore();
assert.equal(summary.started >= 1, true, 'vm: learning-path summary should count started topics');
assert.equal(summary.exampleReady >= 1, true, 'vm: learning-path summary should count prepared examples');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  runtime: runtimeBuilt,
  css: cssBuilt,
  hashedAssetCount: healthz.hashed_asset_count,
  starterStages: plan.stageOrder,
  startedTopics: summary.started
}, null, 2));
