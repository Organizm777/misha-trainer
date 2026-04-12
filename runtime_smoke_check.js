const fs = require('fs');
const vm = require('vm');
const path = require('path');

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

function makeContext(pageFile) {
  const elements = new Map();
  [
    'sg','player-badge','daily-meter','hdr','hb','sh','tl','tc','tmr','sts','qt','qb','qcd','opts','fba','ha','pa',
    'res-emoji','res-title','res-score','res-detail','res-topics','prog-content','s-play','s-main','s-subj','s-theory',
    's-result','s-select','privacy-row','grid','quiz-subj-name','quiz-subj-sub','q-prog','qbar-fill','grade-pill',
    'q-topic','q-txt','hint-box','next-btn','skip-btn','adapt-strip','res-subj-name','grade-map','res-sub','weak-list','main-search-slot','topic-search-slot'
  ].forEach(id => elements.set(id, makeElement(id)));

  elements.get('s-play').classList.contains = () => false;
  const body = makeElement('body');
  const heroText = makeElement('hero-p');

  const document = {
    body,
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
    querySelectorAll() { return []; },
    querySelector(selector) {
      if (selector === '#s-main .fade p') return heroText;
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
  };

  const storage = Object.create(null);
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
    matchMedia() { return { matches: false }; },
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
    _ac: null,
  };

  const context = {
    window,
    document,
    navigator,
    localStorage: {
      getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
      setItem(key, value) { storage[key] = String(value); },
      removeItem(key) { delete storage[key]; },
    },
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
  window.localStorage = context.localStorage;
  context.global = context;
  context.globalThis = context;
  return { context, elements, heroText };
}

function extractScripts(html) {
  const re = /<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let match;
  while ((match = re.exec(html))) {
    out.push({ src: match[1], code: match[2] || '' });
  }
  return out;
}

function runPage(pageFile) {
  const html = fs.readFileSync(pageFile, 'utf8');
  const scripts = extractScripts(html);
  const { context, elements, heroText } = makeContext(pageFile);
  const sandbox = vm.createContext(context);
  const errors = [];

  for (const script of scripts) {
    try {
      const code = script.src ? fs.readFileSync(path.join(path.dirname(pageFile), script.src), 'utf8') : script.code;
      vm.runInContext(code, sandbox, { filename: script.src || pageFile });
    } catch (err) {
      errors.push(String(err));
    }
  }

  try {
    if (sandbox.refreshMain) vm.runInContext('refreshMain()', sandbox);
  } catch (err) {
    errors.push('refreshMain:' + String(err));
  }

  try {
    if (sandbox.initGrid) vm.runInContext('initGrid()', sandbox);
  } catch (err) {
    errors.push('initGrid:' + String(err));
  }

  try {
    if (sandbox.SUBJ && sandbox.SUBJ.length && sandbox.openSubj) {
      vm.runInContext('openSubj(SUBJ[0].id)', sandbox);
    }
  } catch (err) {
    errors.push('openSubj:' + String(err));
  }

  return {
    errors,
    subjCount: sandbox.SUBJ ? sandbox.SUBJ.length : null,
    sgChildren: elements.get('sg').children.length,
    heroText: heroText.textContent,
    mainSearchHtml: elements.get('main-search-slot').innerHTML,
    topicSearchHtml: elements.get('topic-search-slot').innerHTML,
  };
}

const pages = [
  'index.html',
  'tests.html',
  'diagnostic.html',
  'dashboard.html',
  ...Array.from({ length: 11 }, (_, i) => `grade${i + 1}_v2.html`),
];

const failures = [];
const reports = [];
for (const page of pages) {
  const report = runPage(page);
  reports.push({ page, ...report });
  if (report.errors.length) {
    failures.push(`${page}: runtime errors -> ${report.errors.join(' | ')}`);
  }
  if (/^grade\d+_v2\.html$/.test(page) && report.sgChildren === 0) {
    failures.push(`${page}: subject grid is empty after init`);
  }
  if (/^grade\d+_v2\.html$/.test(page) && !report.mainSearchHtml) {
    failures.push(`${page}: main search UI is missing`);
  }
  if (/^grade\d+_v2\.html$/.test(page) && !report.topicSearchHtml) {
    failures.push(`${page}: topic search UI is missing`);
  }
}

if (failures.length) {
  console.log('RUNTIME_FAIL');
  for (const item of failures) console.log(item);
  process.exit(1);
}

console.log('RUNTIME_OK');
for (const report of reports.filter(r => /^grade\d+_v2\.html$/.test(r.page))) {
  console.log(`${report.page}: ${report.heroText || 'ok'}`);
}
