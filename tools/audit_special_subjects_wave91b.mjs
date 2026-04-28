#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const errors = [];
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function readJSON(rel){ return JSON.parse(read(rel)); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(ok, msg){ if (!ok) errors.push(msg); }

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


const expected = {
  fashion_design: { nm: 'Дизайн одежды и текстиля', topics: 10, questions: 150, minPerTopic: 15 },
  architecture: { nm: 'Архитектура', topics: 10, questions: 150, minPerTopic: 15 },
  graphic_design: { nm: 'Графический дизайн', topics: 8, questions: 80, minPerTopic: 10 },
  interior_design: { nm: 'Дизайн интерьера', topics: 7, questions: 70, minPerTopic: 10 },
  design_entrance: { nm: 'Вступительные (дизайн)', topics: 6, questions: 60, minPerTopic: 10 }
};

const manifest = readJSON('assets/asset-manifest.json');
const builtSpec = manifest.assets && manifest.assets['assets/js/bundle_special_subjects.js'];
const builtCss = manifest.assets && manifest.assets['assets/css/wave86x_inline_spec_subjects.css'];
assert(builtSpec, 'asset-manifest missing bundle_special_subjects.js');
assert(builtCss, 'asset-manifest missing wave86x_inline_spec_subjects.css');

const src = read('assets/_src/js/bundle_special_subjects.js');
const built = builtSpec && exists(builtSpec) ? read(builtSpec) : '';
const cssSrc = read('assets/_src/css/wave86x_inline_spec_subjects.css');
const cssBuilt = builtCss && exists(builtCss) ? read(builtCss) : '';
const index = read('index.html');
const specPage = read('spec_subjects.html');
const sw = read('sw.js');
const healthz = readJSON('healthz.json');

assert(src.includes("const VERSION = 'wave91b'"), 'source special subjects version should be wave91b');
assert(src.includes("const DATA_VERSION = '91b'"), 'source special subjects data version should be 91b');
assert(built.includes('window.__wave91bSpecSubjects'), 'built special subjects should expose wave91b audit alias');
assert(src.includes('renderQuestionInsight'), 'source should render ex explanations');
assert(built.includes('spec-feedback-ex'), 'built bundle should include feedback explanation class');
assert(cssSrc.includes('.spec-feedback-ex'), 'source css missing .spec-feedback-ex');
assert(cssBuilt.includes('.spec-feedback-ex'), 'built css missing .spec-feedback-ex');
assert(index.includes('40+</div><div class="stat-l">Предметов'), 'index hero subject count should be 40+ after 5 new special subjects');
assert(/(?:15|20) 000\+<\/div><div class="stat-l">Задач/.test(index), 'index hero task count should be at least 15 000+ after new banks');
assert(index.includes('11 направлений · 93 темы · тренировки и диагностика'), 'index special subjects card count is stale');
assert(specPage.includes('11 направлений, 93 темы, 3588 вопросов'), 'spec_subjects meta description is stale');
assert(sw.includes(String(healthz.cache || '')), 'sw cache should match healthz cache');
assert(waveRank(healthz.build_id) >= waveRank('wave91b'), `healthz build_id should be wave91b or later, got ${healthz.build_id}`);

let totalAddedQuestions = 0;
let totalAddedTopics = 0;
const subjectReports = {};
for (const [id, spec] of Object.entries(expected)) {
  const rel = `assets/data/spec_subjects/${id}.json`;
  assert(exists(rel), `${rel} missing`);
  if (!exists(rel)) continue;
  const data = readJSON(rel);
  assert(data.id === id, `${id}: id mismatch`);
  assert(data.nm === spec.nm, `${id}: name mismatch`);
  assert(Array.isArray(data.tops), `${id}: tops should be array`);
  assert(data.tops.length === spec.topics, `${id}: expected ${spec.topics} topics, got ${data.tops.length}`);
  const seenTopicIds = new Set();
  const seenQuestions = new Set();
  let count = 0;
  const perTopic = [];
  for (const top of data.tops || []) {
    assert(top && typeof top.id === 'string' && top.id, `${id}: topic missing id`);
    assert(!seenTopicIds.has(top.id), `${id}: duplicate topic ${top.id}`);
    seenTopicIds.add(top.id);
    assert(typeof top.nm === 'string' && top.nm, `${id}:${top.id}: missing topic name`);
    assert(Array.isArray(top.questions), `${id}:${top.id}: questions should be array`);
    assert(top.questions.length >= spec.minPerTopic, `${id}:${top.id}: expected at least ${spec.minPerTopic} questions, got ${top.questions.length}`);
    count += top.questions.length;
    perTopic.push([top.id, top.questions.length]);
    for (const [idx, q] of (top.questions || []).entries()) {
      const loc = `${id}:${top.id}:${idx + 1}`;
      const text = String(q && q.q || '').trim();
      const answer = String(q && q.a || '').trim();
      const options = Array.isArray(q && q.o) ? q.o.map((v) => String(v || '').trim()).filter(Boolean) : [];
      assert(text.length > 20, `${loc}: q is too short`);
      assert(answer, `${loc}: missing answer`);
      assert(options.length >= 4, `${loc}: options should include at least 4 entries`);
      assert(options.includes(answer), `${loc}: answer is not present in options`);
      assert(new Set(options).size === options.length, `${loc}: duplicate options`);
      assert(String(q && q.h || '').trim().length > 20, `${loc}: hint is too short`);
      assert(String(q && q.ex || '').trim().length > 20, `${loc}: ex is too short`);
      const key = text.toLowerCase();
      assert(!seenQuestions.has(key), `${id}: duplicate question text ${text}`);
      seenQuestions.add(key);
    }
  }
  assert(count === spec.questions, `${id}: expected ${spec.questions} questions, got ${count}`);
  assert(src.includes(`"id":"${id}"`), `source catalog missing ${id}`);
  assert(built.includes(`"id":"${id}"`), `built catalog missing ${id}`);
  assert(cssSrc.includes(`data-spec-id="${id}"`), `css source missing accent rule for ${id}`);
  assert(cssBuilt.includes(`data-spec-id="${id}"`), `css built missing accent rule for ${id}`);
  assert(sw.includes(`./${rel}`), `sw cache missing ${rel}`);
  totalAddedQuestions += count;
  totalAddedTopics += data.tops.length;
  subjectReports[id] = { topics: data.tops.length, questions: count, perTopic };
}

const srcManifest = src.match(/const SPEC_MANIFEST = (\{.*?\});/s);
assert(srcManifest, 'SPEC_MANIFEST not found in source');
let specManifest = null;
if (srcManifest) {
  specManifest = JSON.parse(srcManifest[1]);
  assert(specManifest.version === 'wave91b', 'SPEC_MANIFEST version should be wave91b');
  assert(specManifest.subjects === 11, `SPEC_MANIFEST subjects should be 11, got ${specManifest.subjects}`);
  assert(specManifest.topics === 93, `SPEC_MANIFEST topics should be 93, got ${specManifest.topics}`);
  assert(specManifest.totalQuestions === 3588, `SPEC_MANIFEST totalQuestions should be 3588, got ${specManifest.totalQuestions}`);
  for (const [id, spec] of Object.entries(expected)) {
    assert(specManifest.counts && specManifest.counts[id] === spec.questions, `SPEC_MANIFEST counts.${id} should be ${spec.questions}`);
  }
}

const report = {
  ok: errors.length === 0,
  wave: 'wave91b',
  builtSpec,
  builtCss,
  subjectsAdded: Object.keys(expected).length,
  topicsAdded: totalAddedTopics,
  questionsAdded: totalAddedQuestions,
  manifestTotals: specManifest ? {
    subjects: specManifest.subjects,
    topics: specManifest.topics,
    totalQuestions: specManifest.totalQuestions
  } : null,
  subjectReports,
  errors
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
