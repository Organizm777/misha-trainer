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

const gradeFiles = Array.from({ length: 11 }, (_, i) => `grade${i + 1}_v2.html`);
const gradeRows = [];
const subjectTopicMesh = new Map();
const subjectNameMesh = new Map();
const subjectNameById = new Map();
const thinBlocks = [];

for (const file of gradeFiles) {
  const ctx = runHtml(file);
  const subj = getGlobal(ctx, 'SUBJ');
  if (!Array.isArray(subj)) throw new Error(`${file}: SUBJ not found`);
  let topics = 0;
  let theory = 0;
  const missingTheory = [];
  const subjectList = [];
  subj.forEach(s => {
    const topicCount = Array.isArray(s.tops) ? s.tops.length : 0;
    subjectList.push(`${s.nm} (${topicCount})`);
    if (!subjectNameMesh.has(s.nm)) subjectNameMesh.set(s.nm, {});
    subjectNameMesh.get(s.nm)[file] = topicCount;
    subjectNameById.set(s.id, s.nm);
    if (topicCount < 3 && !s.locked) thinBlocks.push({ file, subject: s.nm, topicCount });
    s.tops.forEach(t => {
      topics++;
      if (t.th) theory++; else missingTheory.push(`${s.id}/${t.id}`);
      const key = `${s.id}/${t.id}`;
      if (!subjectTopicMesh.has(key)) subjectTopicMesh.set(key, []);
      subjectTopicMesh.get(key).push(path.basename(file, '.html'));
    });
  });
  gradeRows.push({
    file,
    grade: file.replace('_v2.html', '').replace('grade', ''),
    subjects: subj.length,
    topics,
    theory,
    missingTheory,
    subjectList,
  });
}

const dctx = runHtml('diagnostic.html');
const qbank = getGlobal(dctx, 'QBANK');
if (!qbank || typeof qbank !== 'object') throw new Error('diagnostic.html: QBANK not found');
const diagRows = Object.keys(qbank)
  .filter(k => Array.isArray(qbank[k]))
  .sort()
  .map(k => ({ subject: k, count: qbank[k].filter(Boolean).length }));

const repeatedMesh = [...subjectTopicMesh.entries()]
  .filter(([, files]) => files.length > 1)
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

const subjectNames = [...subjectNameMesh.keys()].sort((a, b) => a.localeCompare(b, 'ru'));
const meshRows = subjectNames.map(name => {
  const cells = [name];
  for (const file of gradeFiles) {
    const count = subjectNameMesh.get(name)[file];
    cells.push(count ? String(count) : '—');
  }
  return cells;
});

const coverage = {
  grades: gradeRows,
  diagnostics: diagRows,
  repeatedTopicIds: repeatedMesh.map(([key, files]) => ({ key, files })),
  subjectMesh: subjectNames.map(name => ({
    subject: name,
    byGrade: Object.fromEntries(gradeFiles.map(file => [file, subjectNameMesh.get(name)[file] || 0])),
  })),
  thinBlocks,
};
fs.writeFileSync('CURRICULUM_MESH.json', JSON.stringify(coverage, null, 2), 'utf8');

let md = '# Аудит структуры классов и предметной сетки\n\n';
md += '## Сводка по классам\n\n';
md += mdTable(
  ['Класс', 'Предметов', 'Тем', 'Тем со шпаргалкой', 'Без шпаргалки'],
  gradeRows.map(r => [r.grade, r.subjects, r.topics, r.theory, r.missingTheory.length])
);

md += '## Предметы по классам\n\n';
for (const row of gradeRows) {
  md += `### ${row.grade} класс\n\n`;
  md += row.subjectList.map(s => `- ${s}`).join('\n') + '\n\n';
}

md += '## Сетка предметов 1–11\n\n';
md += 'В ячейке — количество тем в этом предмете у соответствующего класса.\n\n';
md += mdTable(['Предмет', ...gradeRows.map(r => r.grade)], meshRows);

md += '## Диагностика\n\n';
md += mdTable(['Банк', 'Вопросов'], diagRows.map(r => [r.subject, r.count]));

md += '## Повторяющиеся subject/topic между классами\n\n';
md += 'Это не обязательно ошибка, но список полезен для контроля межклассной сетки и хранения прогресса.\n\n';
md += mdTable(
  ['Пара', 'Где встречается'],
  repeatedMesh.slice(0, 60).map(([key, files]) => [key, files.join(', ')])
);

md += '## Потенциально тонкие блоки\n\n';
if (!thinBlocks.length) {
  md += 'Тонких блоков не найдено.\n\n';
} else {
  md += mdTable(['Класс', 'Предмет', 'Тем'], thinBlocks.map(x => [x.file.replace('grade', '').replace('_v2.html', ''), x.subject, x.topicCount]));
}

md += '## Итоги\n\n';
const high = gradeRows.filter(r => Number(r.grade) >= 8);
const highMissing = high.reduce((sum, r) => sum + r.missingTheory.length, 0);
const minDiag = Math.min(...diagRows.filter(r => r.subject !== 'mathall').map(r => r.count));
const maxDiag = diagRows.reduce((a, b) => a.count > b.count ? a : b);
md += `- В 8–11 классах: ${high.reduce((s, r) => s + r.topics, 0)} тем, без шпаргалок: ${highMissing}.\n`;
md += `- В диагностике минимум usable-вопросов после санации банков: ${minDiag}.\n`;
md += `- Самый большой банк диагностики: ${maxDiag.subject} (${maxDiag.count}).\n`;
md += `- Машинный JSON-слепок для дальнейших сравнений сохранён в CURRICULUM_MESH.json.\n`;

fs.writeFileSync('CURRICULUM_AUDIT.md', md, 'utf8');
console.log('Wrote CURRICULUM_AUDIT.md and CURRICULUM_MESH.json');
