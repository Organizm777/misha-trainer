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
function baseContext() {
  const document = {
    getElementById: () => mkEl(),
    querySelector: () => mkEl(),
    querySelectorAll: () => [],
    body: { appendChild: noop },
    createElement: () => mkEl(),
    addEventListener: noop,
  };
  const ctx = {
    console,
    Math,
    Date,
    window: {},
    document,
    navigator: {
      serviceWorker: { register: () => Promise.resolve() },
      clipboard: { writeText: () => Promise.resolve() },
      share: () => Promise.resolve(),
      vibrate: noop,
    },
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    alert: noop,
    confirm: () => false,
    setTimeout: noop,
    clearTimeout: noop,
    setInterval: () => 0,
    clearInterval: noop,
    fetch: () => Promise.resolve({ json: async () => ({}) }),
  };
  ctx.global = ctx;
  vm.createContext(ctx);
  return ctx;
}
function runHtml(file) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const ctx = baseContext();
  for (const s of scripts) vm.runInContext(s, ctx, { timeout: 5000 });
  return ctx;
}
function getGlobal(ctx, name) {
  try { return vm.runInContext(name, ctx, { timeout: 1000 }); }
  catch { return ctx[name] || ctx.window?.[name]; }
}

const gradeFiles = Array.from({ length: 11 }, (_, i) => `grade${i + 1}_v2.html`);
const gradeRows = [];
const subjectMesh = new Map();
for (const file of gradeFiles) {
  const ctx = runHtml(file);
  const subj = getGlobal(ctx, 'SUBJ');
  if (!Array.isArray(subj)) throw new Error(`${file}: SUBJ not found`);
  let topics = 0;
  let theory = 0;
  const missingTheory = [];
  subj.forEach(s => {
    s.tops.forEach(t => {
      topics++;
      if (t.th) theory++; else missingTheory.push(`${s.id}/${t.id}`);
      const key = `${s.id}/${t.id}`;
      if (!subjectMesh.has(key)) subjectMesh.set(key, []);
      subjectMesh.get(key).push(path.basename(file, '.html'));
    });
  });
  gradeRows.push({
    grade: file.replace('_v2.html', '').replace('grade', ''),
    subjects: subj.length,
    topics,
    theory,
    missingTheory,
  });
}

const dctx = runHtml('diagnostic.html');
const qbank = getGlobal(dctx, 'QBANK');
if (!qbank || typeof qbank !== 'object') throw new Error('diagnostic.html: QBANK not found');
const diagRows = Object.keys(qbank)
  .filter(k => Array.isArray(qbank[k]))
  .sort()
  .map(k => ({ subject: k, count: qbank[k].filter(Boolean).length }));

const repeatedMesh = [...subjectMesh.entries()]
  .filter(([, files]) => files.length > 1)
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

let md = '# Аудит структуры классов и диагностики\n\n';
md += '## Классы\n\n';
md += '| Класс | Предметов | Тем | Тем со шпаргалкой | Без шпаргалки |\n';
md += '|---|---:|---:|---:|---:|\n';
gradeRows.forEach(r => {
  md += `| ${r.grade} | ${r.subjects} | ${r.topics} | ${r.theory} | ${r.missingTheory.length} |\n`;
});
md += '\n';
md += '## Диагностика\n\n';
md += '| Банк | Вопросов |\n';
md += '|---|---:|\n';
diagRows.forEach(r => {
  md += `| ${r.subject} | ${r.count} |\n`;
});
md += '\n';
md += '## Повторяющиеся subject/topic между классами\n\n';
md += 'Это не обязательно ошибка, но список полезен для контроля межклассной сетки.\n\n';
md += '| Пара | Где встречается |\n';
md += '|---|---|\n';
repeatedMesh.slice(0, 40).forEach(([key, files]) => {
  md += `| ${key} | ${files.join(', ')} |\n`;
});
md += '\n';
md += '## Итоги\n\n';
const high = gradeRows.filter(r => Number(r.grade) >= 8);
const highMissing = high.reduce((sum, r) => sum + r.missingTheory.length, 0);
md += `- В 8–11 классах: ${high.reduce((s, r) => s + r.topics, 0)} тем, без шпаргалок: ${highMissing}.\n`;
md += `- В диагностике минимум вопросов после санации банков: ${Math.min(...diagRows.filter(r => r.subject !== 'mathall').map(r => r.count))}.\n`;
md += `- Самый большой банк диагностики: ${diagRows.reduce((a,b)=>a.count>b.count?a:b).subject} (${diagRows.reduce((a,b)=>a.count>b.count?a:b).count}).\n`;

fs.writeFileSync('CURRICULUM_AUDIT.md', md, 'utf8');
console.log('Wrote CURRICULUM_AUDIT.md');
