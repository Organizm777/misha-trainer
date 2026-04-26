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

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const html = read('dashboard.html');
const srcCss = read('assets/_src/css/wave86x_inline_dashboard.css');
const srcInline = read('assets/_src/js/inline_dashboard_1_wave86u.js');
const srcTools = read('assets/_src/js/bundle_dashboard_tools.js');
const builtCss = manifest.assets['assets/css/wave86x_inline_dashboard.css'];
const builtInline = manifest.assets['assets/js/inline_dashboard_1_wave86u.js'];
const builtTools = manifest.assets['assets/js/bundle_dashboard_tools.js'];
const builtCssCode = read(builtCss);
const builtInlineCode = read(builtInline);
const builtToolsCode = read(builtTools);
const changelog = read('CHANGELOG.md');
const docs = read('docs/PARENT_DASHBOARD_wave89j.md');
const claude = read('CLAUDE.md');
const toolsReadme = read('tools/README.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');

assert.ok(waveRank(healthz.wave) >= waveRank('wave89j'), `healthz wave should be wave89j+; got ${healthz.wave}`);
assert.equal(manifest.version, healthz.version, 'manifest/healthz versions should match');
assert.ok(manifest.hashed_asset_count >= 101, 'hashed asset count should stay populated');

assert.ok(html.includes(`./${builtCss}`), 'dashboard.html should reference rebuilt dashboard css');
assert.ok(html.includes(`./${builtInline}`), 'dashboard.html should reference rebuilt inline dashboard js');
assert.ok(html.includes(`./${builtTools}`), 'dashboard.html should reference rebuilt dashboard tools js');
assert.ok(html.includes('id="wave89j-parent-toolbar"'), 'dashboard.html should mount the parent toolbar host');
assert.ok(html.includes('id="wave89j-parent-summary"'), 'dashboard.html should mount the parent summary host');
assert.ok((html.match(/data-wave89j-advanced="1"/g) || []).length >= 10, 'dashboard.html should mark advanced analytics blocks');

assert.ok(srcCss.includes('.wave89j-toolbar'), 'dashboard css source should style the wave89j toolbar');
assert.ok(srcCss.includes('.wave89j-parent-mode [data-wave89j-advanced="1"]'), 'dashboard css source should hide advanced blocks in parent mode');
assert.ok(srcCss.includes('.grade-card.is-selected'), 'dashboard css source should highlight the selected grade');
assert.ok(srcCss.includes('#wave89j-parent-toolbar'), 'dashboard css source should handle print mode for the toolbar');
assert.ok(builtCssCode.includes('.wave89j-toolbar'), 'rebuilt dashboard css should include the wave89j toolbar styles');

assert.ok(srcInline.includes('/* wave89j: dashboard core filters / active view */'), 'inline dashboard source should contain the wave89j marker');
assert.ok(srcInline.includes('window.__dashboardComposeState = buildDashboardView;'), 'inline dashboard source should expose buildDashboardView');
assert.ok(srcInline.includes('window.__dashboardRenderCore = renderDashboardCore;'), 'inline dashboard source should expose renderDashboardCore');
assert.ok(srcInline.includes('window.__dashboardGetActiveState = getActiveDashboardState;'), 'inline dashboard source should expose the active dashboard state getter');
assert.ok(srcInline.includes('DASHBOARD_ACTIVE_STATE_KEY'), 'inline dashboard source should persist the active state snapshot');
assert.ok(srcInline.includes('window.__dashboardActiveState || window._dashboardState'), 'inline dashboard source should prefer the active filtered state for exports');
assert.ok(builtInlineCode.includes('/* wave89j: dashboard core filters / active view */'), 'rebuilt inline dashboard bundle should keep the wave89j marker');

assert.ok(srcTools.includes('/* --- wave89j_parent_dashboard.js --- */'), 'dashboard tools source should contain the wave89j parent-dashboard marker');
assert.ok(srcTools.includes("trainer_dashboard_mode_wave89j_v1"), 'dashboard tools source should persist the parent/full mode');
assert.ok(srcTools.includes("trainer_dashboard_grade_filter_wave89j_v1"), 'dashboard tools source should persist the class filter');
assert.ok(srcTools.includes('window.__wave89jParentDashboard = {'), 'dashboard tools source should expose the wave89j API');
assert.ok(srcTools.includes('setMode,'), 'dashboard tools source should expose setMode');
assert.ok(srcTools.includes('setFilter,'), 'dashboard tools source should expose setFilter');
assert.ok(srcTools.includes('window.__dashboardRenderAnalytics = function(state){'), 'dashboard tools source should expose analytics rerendering');
assert.ok(builtToolsCode.includes('/* --- wave89j_parent_dashboard.js --- */'), 'rebuilt dashboard tools bundle should contain the wave89j marker');

assert.ok(changelog.includes('## wave89j'), 'CHANGELOG should document wave89j');
assert.ok(docs.includes('режим родителя'), 'wave89j doc should describe the parent dashboard mode');
assert.ok(claude.includes('### wave89j parent dashboard'), 'CLAUDE.md should document the wave89j parent dashboard wave');
assert.ok(toolsReadme.includes('audit_parent_dashboard_wave89j.mjs'), 'tools README should list the wave89j audit');
assert.ok(validateWorkflow.includes('node tools/audit_parent_dashboard_wave89j.mjs'), 'validate workflow should run the wave89j audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_parent_dashboard_wave89j.mjs'), 'lighthouse workflow should run the wave89j audit');

function createClassList(initial = []){
  const set = new Set(initial.filter(Boolean));
  return {
    add(...names){ names.forEach((name) => set.add(String(name))); },
    remove(...names){ names.forEach((name) => set.delete(String(name))); },
    contains(name){ return set.has(String(name)); },
    toggle(name, force){
      const key = String(name);
      if (force === true) { set.add(key); return true; }
      if (force === false) { set.delete(key); return false; }
      if (set.has(key)) { set.delete(key); return false; }
      set.add(key);
      return true;
    },
    toString(){ return Array.from(set).join(' '); }
  };
}

function makeNode(tagName, id = ''){
  const attrs = new Map();
  const node = {
    nodeType: 1,
    tagName: String(tagName || 'div').toUpperCase(),
    children: [],
    parentNode: null,
    parentElement: null,
    previousElementSibling: null,
    nextElementSibling: null,
    style: {},
    classList: createClassList(),
    _innerHTML: '',
    _textContent: '',
    appendChild(child){
      if (!child) return child;
      const prev = this.children[this.children.length - 1] || null;
      if (prev) prev.nextElementSibling = child;
      child.previousElementSibling = prev;
      child.parentNode = this;
      child.parentElement = this;
      this.children.push(child);
      return child;
    },
    insertBefore(child, ref){
      if (!child) return child;
      const idx = ref ? this.children.indexOf(ref) : -1;
      if (idx < 0) return this.appendChild(child);
      const prev = this.children[idx - 1] || null;
      child.previousElementSibling = prev;
      child.nextElementSibling = ref;
      if (prev) prev.nextElementSibling = child;
      ref.previousElementSibling = child;
      child.parentNode = this;
      child.parentElement = this;
      this.children.splice(idx, 0, child);
      return child;
    },
    setAttribute(name, value){ attrs.set(String(name), String(value)); },
    getAttribute(name){ return attrs.has(String(name)) ? attrs.get(String(name)) : null; },
    hasAttribute(name){ return attrs.has(String(name)); },
    addEventListener(){},
    removeEventListener(){},
    closest(){ return null; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; }
  };
  Object.defineProperty(node, 'id', {
    get(){ return attrs.get('id') || ''; },
    set(value){ attrs.set('id', String(value)); }
  });
  Object.defineProperty(node, 'className', {
    get(){ return node.classList.toString(); },
    set(value){ node.classList = createClassList(String(value || '').split(/\s+/)); }
  });
  Object.defineProperty(node, 'innerHTML', {
    get(){ return node._innerHTML; },
    set(value){ node._innerHTML = String(value); }
  });
  Object.defineProperty(node, 'textContent', {
    get(){ return node._textContent; },
    set(value){ node._textContent = String(value); }
  });
  if (id) node.id = id;
  return node;
}

function makeDocument(){
  const elements = new Map();
  const body = makeNode('body', 'body');
  const document = {
    readyState: 'complete',
    body,
    documentElement: makeNode('html', 'html'),
    currentScript: null,
    addEventListener(){},
    removeEventListener(){},
    getElementById(id){ return elements.get(String(id)) || null; },
    querySelector(selector){
      if (selector === '.dash-actions') return elements.get('dash-actions') || null;
      return null;
    },
    createElement(tag){ return makeNode(tag); },
  };
  document.documentElement.appendChild(body);
  function register(node){ if (node && node.id) elements.set(node.id, node); return node; }
  return { document, register };
}

const marker = '/* --- wave89j_parent_dashboard.js --- */';
const start = srcTools.indexOf(marker);
assert.ok(start >= 0, 'could not isolate the wave89j parent-dashboard block');
const isolated = srcTools.slice(start);

const { document, register } = makeDocument();
const wrap = register(makeNode('div', 'wrap'));
document.body.appendChild(wrap);
const toolbar = register(makeNode('div', 'wave89j-parent-toolbar'));
const summary = register(makeNode('div', 'wave89j-parent-summary'));
const gradesTitle = register(makeNode('div', 'grades-title')); gradesTitle.classList.add('section');
const grades = register(makeNode('div', 'grades'));
const weak = register(makeNode('div', 'weak'));
const activity = register(makeNode('div', 'activity'));
const insightsTitle = register(makeNode('div', 'insights-title')); insightsTitle.classList.add('section');
const insights = register(makeNode('div', 'wave22-insights'));
const heatTitle = register(makeNode('div', 'heat-title')); heatTitle.classList.add('section');
const heat = register(makeNode('div', 'wave22-heatmap'));
const radarTitle = register(makeNode('div', 'radar-title')); radarTitle.classList.add('section');
const radar = register(makeNode('div', 'wave22-radar'));
const trendTitle = register(makeNode('div', 'trend-title')); trendTitle.classList.add('section');
const trend = register(makeNode('div', 'wave22-trend'));
const subjectsTitle = register(makeNode('div', 'subjects-title')); subjectsTitle.classList.add('section');
const subjects = register(makeNode('div', 'wave22-subjects'));
const dashActions = register(makeNode('div', 'dash-actions')); dashActions.classList.add('dash-actions');

[toolbar, summary, gradesTitle, grades, activity, insightsTitle, insights, heatTitle, heat, radarTitle, radar, trendTitle, trend, subjectsTitle, subjects, dashActions, weak].forEach((node) => wrap.appendChild(node));
insights.previousElementSibling = insightsTitle;
heat.previousElementSibling = heatTitle;
radar.previousElementSibling = radarTitle;
trend.previousElementSibling = trendTitle;
subjects.previousElementSibling = subjectsTitle;

const local = Object.create(null);
const coreCalls = [];
const analyticsCalls = [];
const baseState = {
  name: 'Ученик',
  totalQs: 420,
  totalPct: '78%',
  bestStreak: 15,
  totalDays: 12,
  last7Total: 34,
  generatedAt: 111,
  gradeData: [
    { grade:{ n:10, nm:'10 класс', ic:'🎓', file:'grade10_v2.html' }, qs:120, ok:90, pct:75, doneDays:8, lastActivityDate:'2026-04-25', last7Total:22, streak:{best:9}, journal:[{tag:'Алгебра'}], activity:{ '2026-04-24':{total:10, ok:7, err:3}, '2026-04-25':{total:12, ok:9, err:3} } },
    { grade:{ n:11, nm:'11 класс', ic:'🏆', file:'grade11_v2.html' }, qs:300, ok:240, pct:80, doneDays:11, lastActivityDate:'2026-04-20', last7Total:12, streak:{best:15}, journal:[{tag:'Русский язык'}], activity:{ '2026-04-20':{total:7, ok:6, err:1} } }
  ],
  wave25Diagnostics: { latest:{ subjectName:'Математика', pct:76, modeLabel:'Микро-диагностика' } }
};

const ctx = vm.createContext({
  console: { log(){}, warn(){}, error(){}, info(){} },
  Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
  parseInt, parseFloat, isFinite, isNaN,
  document,
  localStorage: {
    getItem(key){ return Object.prototype.hasOwnProperty.call(local, key) ? local[key] : null; },
    setItem(key, value){ local[key] = String(value); },
    removeItem(key){ delete local[key]; }
  },
  setTimeout(fn){ if (typeof fn === 'function') fn(); return 1; },
  clearTimeout(){},
  window: null,
  CustomEvent: function CustomEvent(type, init){ this.type = type; this.detail = init && init.detail; },
  navigator: { userAgent:'Mozilla/5.0' },
  location: { pathname:'/dashboard.html', href:'https://example.test/dashboard.html' },
});
ctx.window = ctx;
ctx.self = ctx;
ctx.globalThis = ctx;
ctx.document = document;
ctx._dashboardState = baseState;
ctx.__dashboardActiveState = null;
ctx.__dashboardComposeState = (base, filter) => {
  if (String(filter) === '10') return { ...base, totalQs:120, totalPct:'75%', bestStreak:9, totalDays:8, last7Total:22, weak:[['10 класс: Алгебра', 3]], filterGrade:10, filterLabel:'10 класс', generatedAt:'111:10' };
  return { ...base, filterGrade:null, filterLabel:'Все классы', weak:[['11 класс: Русский язык', 2]], generatedAt:'111:all' };
};
ctx.__dashboardRenderCore = (_base, opts) => {
  coreCalls.push({ gradeFilter: opts && opts.gradeFilter, viewState: opts && opts.viewState });
  ctx.__dashboardActiveState = opts && opts.viewState;
  return opts && opts.viewState;
};
ctx.__dashboardRenderAnalytics = (state) => { analyticsCalls.push(state); };
ctx.__dashboardEnsureAnalytics = (state) => ({
  subjectSummary: {
    best: { label:'Математика', acc:84, qs:40 },
    weakest: state && state.filterGrade ? { label:'Алгебра', acc:58, qs:26 } : { label:'Русский язык', acc:63, qs:31 }
  },
  accDelta: 6
});
ctx.addEventListener = function(){};
ctx.removeEventListener = function(){};
vm.runInContext(isolated, ctx, { filename:'wave89j-audit.js', timeout:1500 });

assert.ok(ctx.__wave89jParentDashboard, 'wave89j API should be exported');
assert.equal(ctx.__wave89jParentDashboard.version, 'wave89j', 'wave89j API version mismatch');
assert.equal(ctx.__wave89jParentDashboard.getMode(), 'parent', 'default mode should be parent');
assert.equal(ctx.__wave89jParentDashboard.getFilter(), 'all', 'default filter should be all');
assert.ok(document.body.classList.contains('wave89j-parent-mode'), 'body should enter parent mode by default');
assert.equal(coreCalls.at(-1).gradeFilter, 'all', 'initial render should request the all-grades view');
assert.equal(analyticsCalls.length >= 1, true, 'initial render should call analytics renderer');
assert.ok(toolbar.innerHTML.includes('Компактный взгляд для родителя'), 'toolbar should render the parent-dashboard copy');
assert.ok(summary.innerHTML.includes('Что важно сейчас'), 'summary should render the wave89j heading');
assert.ok(insights.getAttribute('data-wave89j-advanced') === '1', 'advanced analytics nodes should be marked');
assert.ok(insightsTitle.getAttribute('data-wave89j-advanced') === '1', 'advanced analytics section headings should be marked');

ctx.__wave89jParentDashboard.setFilter('10');
assert.equal(ctx.__wave89jParentDashboard.getFilter(), '10', 'grade filter should persist after setFilter');
assert.equal(coreCalls.at(-1).gradeFilter, '10', 'setFilter should rerender the selected grade');
assert.ok(summary.innerHTML.includes('Фокус на 10 класс'), 'summary should mention the selected class');
assert.equal(ctx.__dashboardActiveState.filterGrade, 10, 'active state should switch to the selected grade');

ctx.__wave89jParentDashboard.setMode('full');
assert.equal(ctx.__wave89jParentDashboard.getMode(), 'full', 'setMode should persist full mode');
assert.ok(document.body.classList.contains('wave89j-full-mode'), 'body should enter full mode');
assert.ok(!document.body.classList.contains('wave89j-parent-mode'), 'body should leave parent mode in full mode');
assert.ok(toolbar.innerHTML.includes('Полная аналитика'), 'toolbar badge should switch to full analytics');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  hashedAssetCount: manifest.hashed_asset_count,
  finalMode: ctx.__wave89jParentDashboard.getMode(),
  filtersTested: ['all', '10'],
  coreRenders: coreCalls.length,
  analyticsRenders: analyticsCalls.length
}, null, 2));
