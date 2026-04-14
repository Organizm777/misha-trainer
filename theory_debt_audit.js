const fs = require('fs');
const path = require('path');
const vm = require('vm');

const noop = () => {};
function mkEl() {
  return {
    style: {},
    classList: { add: noop, remove: noop, contains: () => false },
    appendChild: noop,
    remove: noop,
    setAttribute: noop,
    focus: noop,
    scrollIntoView: noop,
    innerHTML: '',
    textContent: '',
    value: '',
    onclick: null,
    querySelector: () => mkEl(),
    querySelectorAll: () => [],
    addEventListener: noop,
  };
}
function baseContext(fileName='') {
  const document = {
    getElementById: () => mkEl(),
    querySelector: () => mkEl(),
    querySelectorAll: () => [],
    body: { appendChild: noop },
    createElement: () => mkEl(),
    addEventListener: noop,
    removeEventListener: noop,
    documentElement: { style: { setProperty: noop } },
  };
  const storage = Object.create(null);
  const navigator = {
    serviceWorker: { register: () => Promise.resolve() },
    clipboard: { writeText: () => Promise.resolve() },
    share: () => Promise.resolve(),
    vibrate: noop,
    userAgent: 'node',
  };
  const window = {
    document,
    navigator,
    location: { pathname: '/' + path.basename(fileName) },
    innerHeight: 800,
    scrollTo: noop,
    addEventListener: noop,
    removeEventListener: noop,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval: noop,
    AudioContext: function AudioContext(){
      return {
        state: 'running',
        resume(){ return Promise.resolve(); },
        createOscillator(){ return { connect: noop, type:'', frequency:{ value:0 }, start: noop, stop: noop }; },
        createGain(){ return { connect: noop, gain:{ value:0, exponentialRampToValueAtTime: noop } }; },
        destination: {},
        currentTime: 0,
      };
    },
    webkitAudioContext: null,
  };
  const ctx = {
    console,
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Promise,
    Set,
    Map,
    RegExp,
    window,
    document,
    navigator,
    localStorage: {
      getItem(key){ return Object.prototype.hasOwnProperty.call(storage,key) ? storage[key] : null; },
      setItem(key,value){ storage[key] = String(value); },
      removeItem(key){ delete storage[key]; },
    },
    alert: noop,
    confirm: () => false,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval: noop,
    fetch: () => Promise.resolve({ json: async () => ({}) }),
  };
  window.window = window;
  window.localStorage = ctx.localStorage;
  ctx.global = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  return ctx;
}
function extractScripts(html) {
  const re = /<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let match;
  while ((match = re.exec(html))) out.push({ src: match[1], code: match[2] || '' });
  return out;
}
function runHtml(file) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = extractScripts(html);
  const ctx = baseContext(file);
  const baseDir = path.dirname(file);
  for (const script of scripts) {
    const code = script.src ? fs.readFileSync(path.join(baseDir, script.src), 'utf8') : script.code;
    vm.runInContext(code, ctx, { timeout: 5000, filename: script.src || file });
  }
  return ctx;
}
function getGlobal(ctx, name) {
  try { return vm.runInContext(name, ctx, { timeout: 1000 }); }
  catch { return ctx[name] || ctx.window?.[name]; }
}
function mdTable(headers, rows) {
  let out = `| ${headers.join(' | ')} |\n`;
  out += `| ${headers.map(() => '---').join(' | ')} |\n`;
  rows.forEach(row => { out += `| ${row.join(' | ')} |\n`; });
  return out + '\n';
}
function richTheory(html) {
  const text = String(html || '');
  if (!text) return { ok: false, score: 0, reason: 'missing' };
  const checks = [
    /<h3>/i.test(text),
    /<div class="fm">/i.test(text),
    /<ul>/i.test(text) || /<ol>/i.test(text),
    /<div class="ex">/i.test(text),
    text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length >= 220,
  ];
  const score = checks.filter(Boolean).length;
  return { ok: score >= 5, score, reason: score >= 5 ? 'ok' : 'weak' };
}

const targets = {
  '5': {
    file: 'grade5_v2.html',
    topics: ['math/dec','math/frac','math/pct','math/geo','rus/syn','rus/phon','rus/morph','his/egypt','his/greece','his/rome','bio/cell','bio/plant','bio/human','geo5/earth','geo5/map','geo5/zones']
  },
  '6': {
    file: 'grade6_v2.html',
    topics: ['math/neg','math/div','math/rat','math/coord','rus/pron','rus/num','rus/adj','his/med','his/byz','his/rmed','bio/anim','bio/class','bio/plants','geo6/litho','geo6/hydro','geo6/atm']
  },
  '7': {
    file: 'grade7_v2.html',
    topics: ['alg/lin','alg/pow','alg/poly','alg/func','geo/tri','geo/par','geo/angles','phy/mech','phy/work','phy/press','rus/part','rus/adv','rus/not','his/nt','his/r17','his/peter']
  }
};

const rows = [];
for (const [grade, meta] of Object.entries(targets)) {
  const ctx = runHtml(meta.file);
  const subj = getGlobal(ctx, 'SUBJ');
  if (!Array.isArray(subj)) throw new Error(`${meta.file}: SUBJ not found`);
  for (const key of meta.topics) {
    const [subjectId, topicId] = key.split('/');
    const subject = subj.find(s => s.id === subjectId);
    const topic = subject?.tops?.find(t => t.id === topicId);
    const html = topic?.th || '';
    const check = richTheory(html);
    const plain = String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    rows.push({
      grade: Number(grade),
      subjectId,
      topicId,
      subject: subject?.nm || subjectId,
      topic: topic?.nm || topicId,
      length: plain.length,
      score: check.score,
      status: topic ? (check.ok ? 'ok' : 'weak') : 'missing'
    });
  }
}

const byGrade = Object.values(targets).map(meta => meta.file).length;
const weak = rows.filter(r => r.status !== 'ok');
const summary = {
  totalTargets: rows.length,
  ok: rows.filter(r => r.status === 'ok').length,
  weak: rows.filter(r => r.status === 'weak').length,
  missing: rows.filter(r => r.status === 'missing').length,
  rows,
};
fs.writeFileSync('THEORY_DEBT.json', JSON.stringify(summary, null, 2), 'utf8');

let md = '# Аудит theory debt для 5–7 классов\n\n';
md += `Проверено целевых тем: **${summary.totalTargets}**. Полностью соответствуют rich-theory guard: **${summary.ok}**. Слабых: **${summary.weak}**. Отсутствующих: **${summary.missing}**.\n\n`;
md += mdTable(['Класс','Предмет','Тема','Текст без HTML','Score','Статус'], rows.map(r => [r.grade, r.subject, r.topic, r.length, r.score, r.status === 'ok' ? '✅' : r.status === 'weak' ? '⚠️' : '❌']));
if (!weak.length) {
  md += '## Итог\n\nВсе целевые темы 5–7 классов прошли rich-theory guard.\n';
} else {
  md += '## Требуют доработки\n\n';
  weak.forEach(r => { md += `- ${r.grade} класс / ${r.subject} / ${r.topic} — ${r.status}\n`; });
}
fs.writeFileSync('THEORY_DEBT_AUDIT.md', md, 'utf8');
console.log('Wrote THEORY_DEBT_AUDIT.md and THEORY_DEBT.json');
