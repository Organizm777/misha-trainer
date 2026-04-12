const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const GRADE_FILES = Array.from({ length: 11 }, (_, i) => `grade${i + 1}_v2.html`);
const SAMPLES = 120;

function mkEl() {
  return {
    style: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    appendChild() {},
    remove() {},
    setAttribute() {},
    focus() {},
    scrollIntoView() {},
    innerHTML: '',
    textContent: '',
    value: '',
    onclick: null,
    querySelector() { return mkEl(); },
    querySelectorAll() { return []; },
    addEventListener() {},
    removeEventListener() {},
    offsetWidth: 0,
  };
}

function baseContext(pageFile) {
  const document = {
    getElementById: () => mkEl(),
    querySelector: () => mkEl(),
    querySelectorAll: () => [],
    body: { appendChild() {} },
    createElement: () => mkEl(),
    addEventListener() {},
    removeEventListener() {},
    documentElement: { style: { setProperty() {} } },
  };
  const storage = Object.create(null);
  const navigator = {
    serviceWorker: { register: () => Promise.resolve() },
    clipboard: { writeText: () => Promise.resolve() },
    share: () => Promise.resolve(),
    vibrate() {},
    userAgent: 'node',
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
    setInterval() { return 0; },
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
      getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
      setItem(key, value) { storage[key] = String(value); },
      removeItem(key) { delete storage[key]; },
    },
    alert() {},
    confirm() { return false; },
    setTimeout,
    clearTimeout,
    setInterval() { return 0; },
    clearInterval() {},
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

function loadPage(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const scripts = extractScripts(html);
  const ctx = baseContext(file);
  for (const script of scripts) {
    const code = script.src ? fs.readFileSync(path.join(ROOT, script.src), 'utf8') : script.code;
    vm.runInContext(code, ctx, { filename: script.src || file, timeout: 10000 });
  }
  return ctx;
}

function mdTable(headers, rows) {
  let out = `| ${headers.join(' | ')} |\n`;
  out += `| ${headers.map(() => '---').join(' | ')} |\n`;
  rows.forEach(row => { out += `| ${row.join(' | ')} |\n`; });
  return out + '\n';
}

const rows = [];
for (const file of GRADE_FILES) {
  const ctx = loadPage(file);
  const subj = vm.runInContext('SUBJ', ctx);
  subj.forEach(subject => {
    if (subject.locked) return;
    subject.tops.forEach(topic => {
      if (typeof topic.gen !== 'function') return;
      const uniq = new Set();
      let errors = 0;
      for (let i = 0; i < SAMPLES; i++) {
        try {
          const q = topic.gen();
          if (q && q.question) uniq.add(String(q.question));
        } catch (err) {
          errors += 1;
        }
      }
      rows.push({
        file,
        grade: Number(file.match(/grade(\d+)_v2/)[1]),
        subjectId: subject.id,
        subject: subject.nm,
        topicId: topic.id,
        topic: topic.nm,
        uniq: uniq.size,
        samples: SAMPLES,
        errors,
        boosted: !!topic._wave6Boosted,
        extraCount: topic._wave6ExtraCount || 0,
      });
    });
  });
}

rows.sort((a, b) => a.uniq - b.uniq || a.grade - b.grade || a.subject.localeCompare(b.subject, 'ru'));

const boosted = rows.filter(r => r.boosted).sort((a, b) => a.grade - b.grade || a.subject.localeCompare(b.subject, 'ru') || a.topic.localeCompare(b.topic, 'ru'));
const weakest = rows.slice(0, 40);
const gradeSummary = [];
for (let g = 1; g <= 11; g++) {
  const gradeRows = rows.filter(r => r.grade === g);
  const avg = gradeRows.length ? (gradeRows.reduce((s, r) => s + r.uniq, 0) / gradeRows.length) : 0;
  const min = gradeRows.length ? Math.min(...gradeRows.map(r => r.uniq)) : 0;
  const boostedCount = gradeRows.filter(r => r.boosted).length;
  gradeSummary.push({ grade: g, avg: avg.toFixed(1), min, topics: gradeRows.length, boosted: boostedCount });
}

const payload = {
  samples: SAMPLES,
  rows,
  boosted,
  weakest,
  gradeSummary,
};
fs.writeFileSync(path.join(ROOT, 'TOPIC_COVERAGE.json'), JSON.stringify(payload, null, 2), 'utf8');

let md = '# Аудит вариативности генераторов по темам\n\n';
md += `Проверка: каждая тема была сэмплирована **${SAMPLES}** раз. В таблицах ниже — число уникальных формулировок вопроса (по полю \`question\`). Это приближённая метрика: она не считает разные варианты ответов и разные числа внутри одного и того же шаблона.\n\n`;
md += '## Сводка по классам\n\n';
md += mdTable(
  ['Класс', 'Тем', 'Средняя вариативность', 'Минимум', 'Усилено в wave 6'],
  gradeSummary.map(r => [r.grade, r.topics, r.avg, r.min, r.boosted])
);

md += '## Усиленные темы wave 6\n\n';
md += mdTable(
  ['Класс', 'Предмет', 'Тема', 'Уникальных вопросов', 'Добавлено extra'],
  boosted.map(r => [r.grade, r.subject, r.topic, r.uniq, r.extraCount])
);

md += '## Самые слабые темы по вариативности\n\n';
md += mdTable(
  ['Класс', 'Предмет', 'Тема', 'Уникальных вопросов', 'Усилено?'],
  weakest.map(r => [r.grade, r.subject, r.topic, r.uniq, r.boosted ? 'да' : 'нет'])
);

const belowTen = rows.filter(r => r.uniq < 10);
md += '## Итоги\n\n';
md += `- Всего тем проверено: **${rows.length}**.\n`;
md += `- Тем с вариативностью ниже 10 уникальных формулировок: **${belowTen.length}**.\n`;
md += `- Усилено в wave 6: **${boosted.length}** тем.\n`;
md += `- Машинный слепок сохранён в **TOPIC_COVERAGE.json**.\n`;

fs.writeFileSync(path.join(ROOT, 'TOPIC_COVERAGE_AUDIT.md'), md, 'utf8');
console.log('Wrote TOPIC_COVERAGE_AUDIT.md and TOPIC_COVERAGE.json');
