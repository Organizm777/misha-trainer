const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeElement(id = '') {
  return {
    id,
    style: {},
    innerHTML: '',
    textContent: '',
    children: [],
    dataset: {},
    value: '',
    checked: false,
    className: '',
    disabled: false,
    offsetWidth: 0,
    appendChild(el) { this.children.push(el); return el; },
    remove() {},
    animate() { return { onfinish: null }; },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    removeEventListener() {},
    focus() {},
    closest() { return this; },
    querySelector() { return makeElement(); },
    querySelectorAll() { return []; },
    classList: { add() {}, remove() {}, contains() { return false; } },
  };
}

function extractScripts(html) {
  const re = /<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let match;
  while ((match = re.exec(html))) out.push({ src: match[1], code: match[2] || '' });
  return out;
}

function createSandbox(pageFile) {
  const elements = new Map();
  const baseIds = [
    'sg','player-badge','daily-meter','hdr','hb','sh','tl','tc','tmr','sts','qt','qb','qcd','opts','fba','ha','pa',
    'res-emoji','res-title','res-score','res-detail','res-topics','prog-content','s-play','s-main','s-subj','s-theory',
    's-result','privacy-row','main-search-slot','topic-search-slot','shp-area',
    'quiz-subj-name','quiz-subj-sub','q-prog','qbar-fill','grade-pill','q-topic','q-txt','hint-box','next-btn',
    'adapt-strip','res-subj-name','grade-map','res-sub','weak-list','grid','mobile-menu',
    's-home','s-quiz','s-result','s-select'
  ];
  baseIds.forEach(id => elements.set(id, makeElement(id)));
  const heroText = makeElement('hero-p');
  const screens = [makeElement('scr1'), makeElement('scr2'), makeElement('scr3')];

  const document = {
    body: makeElement('body'),
    documentElement: { style: { setProperty() {} } },
    createElement(tag) {
      const el = makeElement();
      el.tagName = tag.toUpperCase();
      return el;
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeElement(id));
      return elements.get(id);
    },
    querySelectorAll(selector) {
      if (selector === '.scr') return screens;
      if (selector === '.opt') return [];
      return [];
    },
    querySelector(selector) {
      if (selector === '#s-main .fade p') return heroText;
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
  };

  const storage = Object.create(null);
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
    setItem(key, value) { storage[key] = String(value); },
    removeItem(key) { delete storage[key]; },
    _dump: storage,
  };

  const navigator = {
    serviceWorker: { register() { return Promise.resolve(); } },
    vibrate() {},
    userAgent: 'Mozilla/5.0',
    standalone: false,
    share: null,
    clipboard: { writeText() { return Promise.resolve(); } },
  };

  const window = {
    document,
    navigator,
    location: { pathname: '/' + pageFile },
    innerHeight: 800,
    scrollTo() {},
    addEventListener() {},
    removeEventListener() {},
    setTimeout,
    clearTimeout,
    setInterval() { return 1; },
    clearInterval() {},
    AudioContext: function AudioContext() {
      return {
        state: 'running',
        resume() { return Promise.resolve(); },
        createOscillator() {
          return { connect() {}, type: '', frequency: { value: 0 }, start() {}, stop() {} };
        },
        createGain() {
          return { connect() {}, gain: { value: 0, exponentialRampToValueAtTime() {} } };
        },
        destination: {},
        currentTime: 0,
      };
    },
    webkitAudioContext: null,
  };

  const sandbox = {
    window,
    document,
    navigator,
    localStorage,
    alert() {},
    confirm() { return true; },
    console,
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Promise,
    Set,
    Map,
    setTimeout,
    clearTimeout,
    setInterval() { return 1; },
    clearInterval() {},
  };

  window.window = window;
  window.localStorage = localStorage;
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  return { sandbox: vm.createContext(sandbox), storage };
}

function loadPage(pageFile) {
  const html = fs.readFileSync(pageFile, 'utf8');
  const scripts = extractScripts(html);
  const { sandbox, storage } = createSandbox(path.basename(pageFile));
  for (const script of scripts) {
    const code = script.src ? fs.readFileSync(path.join(path.dirname(pageFile), script.src), 'utf8') : script.code;
    vm.runInContext(code, sandbox, { filename: script.src || pageFile });
  }
  return { sandbox, storage };
}

function runGradeFlow(pageFile) {
  const { sandbox, storage } = loadPage(pageFile);
  const errors = [];
  try {
    vm.runInContext(`
      refreshMain && refreshMain();
      const subj = SUBJ.find(s => !s.locked) || SUBJ[0];
      openSubj(subj.id);
      cT = cS.tops[0];
      curTheory = cT.th;
      mix = false;
      globalMix = false;
      startQuiz();
    `, sandbox);
  } catch (err) {
    errors.push('startQuiz:' + String(err));
  }

  try {
    const okIdx = vm.runInContext('prob && prob.options ? prob.options.indexOf(prob.answer) : -1', sandbox);
    if (okIdx < 0) errors.push('correct option not found');
    else vm.runInContext(`ans(${okIdx}); endSession();`, sandbox);
  } catch (err) {
    errors.push('answerFlow:' + String(err));
  }

  const grade = String(vm.runInContext('window.GRADE_NUM || GRADE_NUM || ""', sandbox));
  const progress = storage['trainer_progress_' + grade];
  const daily = storage['trainer_daily_' + grade];
  const streak = storage['trainer_streak_' + grade];
  if (!progress) errors.push('progress not saved');
  if (!daily) errors.push('daily not saved');
  if (!streak) errors.push('streak not saved');

  return errors;
}

function runDiagnosticFlow(pageFile) {
  const { sandbox } = loadPage(pageFile);
  const errors = [];
  try {
    vm.runInContext(`startDiag('mathall');`, sandbox);
    const qLen = vm.runInContext('questions.length', sandbox);
    if (!qLen) errors.push('diagnostic sequence is empty');
    vm.runInContext(`
      const btn = document.createElement('button');
      selectOpt(btn, window._curAnswer, window._curAnswer, window._curHint);
      nextQ();
    `, sandbox);
    const idx = vm.runInContext('qIndex', sandbox);
    if (idx < 1) errors.push('diagnostic did not advance after answer');
  } catch (err) {
    errors.push(String(err));
  }
  return errors;
}

const failures = [];
for (let grade = 1; grade <= 11; grade++) {
  const file = path.join(__dirname, `grade${grade}_v2.html`);
  const errors = runGradeFlow(file);
  if (errors.length) failures.push(`grade${grade}_v2.html: ${errors.join(' | ')}`);
}
const diagErrors = runDiagnosticFlow(path.join(__dirname, 'diagnostic.html'));
if (diagErrors.length) failures.push(`diagnostic.html: ${diagErrors.join(' | ')}`);

if (failures.length) {
  console.log('FLOW_FAIL');
  failures.forEach(x => console.log(x));
  process.exit(1);
}

console.log('FLOW_OK');
