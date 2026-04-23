#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const GENERIC_RE = /^(Выбери понятие:|Что означает «|Какое понятие относится к теме)/;
const TARGETS = {
  4: {
    file: 'assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade4_wave87d.js',
    auditObject: 'wave87hValuesBanks',
    expected: {
      'orkse:orkse_values4': 15,
      'orkse:orkse_family4': 15,
      'orkse:orkse_culture4': 15
    },
    flags: ['_wave87hValuesLiveBank']
  },
  5: {
    file: 'assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade5_wave87d.js',
    auditObject: 'wave87hValuesBanks',
    expected: {
      'odnknr:odnknr_culture5': 15,
      'odnknr:odnknr_values5': 15,
      'odnknr:odnknr_religions5': 15
    },
    flags: ['_wave87hValuesLiveBank']
  },
  11: {
    file: 'assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.js',
    auditObject: 'wave87hProbabilityBanks',
    expected: {
      'prob:diagprob11_wave86m': 15,
      'prob:samples11_wave86m': 15
    },
    flags: ['_wave87hProbLiveBank']
  }
};
const ALL_LIVE_FLAGS = ['_wave87aLiveBank','_wave87bObzhLiveBank','_wave87fSocialLiveBank','_wave87gGrade11BalanceBank','_wave87hValuesLiveBank','_wave87hProbLiveBank','_wave87jGrade11DepthBank'];

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function hash10(rel){ return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex').slice(0, 10); }
function normalize(row){
  return {
    question: String(row?.question ?? row?.q ?? '').trim(),
    answer: String(row?.answer ?? row?.a ?? '').trim(),
    options: Array.isArray(row?.options) ? row.options.map(v => String(v ?? '').trim()).filter(Boolean) : (Array.isArray(row?.o) ? row.o.map(v => String(v ?? '').trim()).filter(Boolean) : []),
    hint: String(row?.hint ?? row?.h ?? '').trim(),
    ex: String(row?.ex ?? '').trim()
  };
}
function makeContext(grade){
  const math = Object.create(Math);
  let seed = (0x87a0b00 ^ ((grade * 2654435761) >>> 0)) >>> 0;
  math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
  const ctx = {
    console,
    Math: math,
    Date, JSON, Number, String, Boolean, Array, Object, RegExp,
    parseInt, parseFloat, isNaN, setTimeout(){ return 0; }, clearTimeout(){},
    GRADE_NUM: String(grade),
    window: null,
    SUBJ: [],
    document: { querySelector(){ return null; } },
    mkQ(q, a, o, h, tag, color, bg, _unused, _flag, ex){ return { question:q, answer:a, options:o, hint:h, tag, color, bg, ex }; }
  };
  ctx.window = ctx;
  return vm.createContext(ctx);
}
function runGrade(grade){
  const target = TARGETS[grade];
  const ctx = makeContext(grade);
  vm.runInContext(read(target.file), ctx, { filename: target.file, timeout: 2500 });
  const snapshot = ctx.window[target.auditObject]?.auditSnapshot?.() || null;
  const failures = [];
  const sample = [];
  const expectedKeys = Object.keys(target.expected);
  for (const [subjectId, topicId] of expectedKeys.map(key => key.split(':'))){
    const subject = ctx.SUBJ.find(s => s && s.id === subjectId);
    const topic = subject && (subject.tops || []).find(t => t && t.id === topicId);
    if (!subject) { failures.push({ grade, subject: subjectId, error: 'missing subject' }); continue; }
    if (!topic) { failures.push({ grade, subject: subjectId, topic: topicId, error: 'missing topic' }); continue; }
    if (!target.flags.some(flag => topic[flag])) failures.push({ grade, subject: subjectId, topic: topicId, error: 'missing wave87h live-bank flag' });
    const expectedCount = target.expected[`${subjectId}:${topicId}`];
    const actualCount = topic._wave87hValuesLiveBankCount || topic._wave87hProbLiveBankCount || 0;
    if (actualCount !== expectedCount) failures.push({ grade, subject: subjectId, topic: topicId, error: 'unexpected bank size', expectedCount, actualCount });
    if (typeof topic.gen !== 'function') { failures.push({ grade, subject: subjectId, topic: topicId, error: 'missing gen' }); continue; }
    const unique = new Set();
    for (let i = 0; i < 30; i++) {
      const row = normalize(topic.gen());
      if (!row.question || !row.answer || row.options.length < 4 || !row.options.includes(row.answer) || !row.hint || !row.ex) {
        failures.push({ grade, subject: subjectId, topic: topicId, sample: i + 1, error: 'invalid q/a/o/h/ex', row });
      }
      if (new Set(row.options).size !== row.options.length) failures.push({ grade, subject: subjectId, topic: topicId, sample: i + 1, error: 'duplicate options', row });
      if (GENERIC_RE.test(row.question)) failures.push({ grade, subject: subjectId, topic: topicId, sample: i + 1, error: 'generic facts stem emitted', question: row.question });
      unique.add(row.question);
      if (sample.length < 18) sample.push({ grade, subject: subjectId, topic: topicId, question: row.question, answer: row.answer });
    }
    if (unique.size < 6) failures.push({ grade, subject: subjectId, topic: topicId, error: 'too few unique sampled questions', unique: unique.size });
  }
  if (!snapshot) failures.push({ grade, error: `missing ${target.auditObject}.auditSnapshot()` });
  if (snapshot) {
    const snapshotKeys = Object.keys(snapshot.topics || {});
    for (const key of expectedKeys) {
      if (!snapshotKeys.includes(key)) failures.push({ grade, key, error: 'missing key in auditSnapshot' });
      else if (snapshot.topics[key] !== target.expected[key]) failures.push({ grade, key, error: 'snapshot count mismatch', expected: target.expected[key], actual: snapshot.topics[key] });
    }
  }
  return {
    grade,
    file: target.file,
    auditObject: target.auditObject,
    snapshot,
    subjects: ctx.SUBJ.length,
    topics: ctx.SUBJ.reduce((sum, s) => sum + ((s.tops || []).length), 0),
    failures,
    sample
  };
}
function auditGenericRemainder(){
  const files = fs.readdirSync(path.join(ROOT, 'assets/_src/js')).filter(name => /^chunk_subject_expansion_wave86m_gap_balance_grade\d+_wave87d\.js$/.test(name)).sort();
  const generic = [];
  for (const name of files) {
    const grade = Number(name.match(/grade(\d+)/)[1]);
    const ctx = makeContext(grade);
    vm.runInContext(read(path.join('assets/_src/js', name)), ctx, { filename: name, timeout: 3000 });
    for (const subject of ctx.SUBJ || []) {
      for (const topic of subject.tops || []) {
        const isLive = ALL_LIVE_FLAGS.some(flag => topic && topic[flag]);
        if (!isLive) generic.push({ grade, subject: subject.id, topic: topic.id });
      }
    }
  }
  return generic;
}
function auditRefs(){
  const refs = {};
  for (const grade of [4, 5, 11]) {
    const src = TARGETS[grade].file;
    const hash = hash10(src);
    const built = src.replace('assets/_src/js/', 'assets/js/').replace('.js', `.${hash}.js`);
    const html = `grade${grade}_v2.html`;
    refs[grade] = {
      hash,
      built,
      builtExists: fs.existsSync(path.join(ROOT, built)),
      htmlReferencesBuilt: read(html).includes(`./${built}`),
      swReferencesBuilt: read('sw.js').includes(`./${built}`),
      manifestReferencesBuilt: read('assets/asset-manifest.json').includes(built)
    };
  }
  return refs;
}

const gradeReports = [4, 5, 11].map(runGrade);
const remainingGenericGapTopics = auditGenericRemainder();
const refs = auditRefs();
const totals = gradeReports.reduce((acc, report) => {
  acc.grades += 1;
  acc.topics += Object.keys(TARGETS[report.grade].expected).length;
  acc.questions += Object.values(TARGETS[report.grade].expected).reduce((a, b) => a + b, 0);
  acc.samples += report.sample.length;
  acc.failures += report.failures.length;
  return acc;
}, { grades: 0, topics: 0, questions: 0, samples: 0, failures: 0 });
const ok = totals.failures === 0 && remainingGenericGapTopics.length === 0 && Object.values(refs).every(ref => ref.builtExists && ref.htmlReferencesBuilt && ref.swReferencesBuilt && ref.manifestReferencesBuilt);
const output = { ok, wave: 'wave87h', totals, gradeReports, remainingGenericGapTopics, references: refs };
console.log(JSON.stringify(output, null, 2));
process.exit(ok ? 0 : 1);
