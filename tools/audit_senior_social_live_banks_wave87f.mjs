#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const grades = [10, 11];
const genericStemRe = /^(Выбери понятие:|Что означает «|Какое понятие относится к теме)/;

function scriptForGrade(grade){
  return path.join(root, 'assets/_src/js', `chunk_subject_expansion_wave86m_gap_balance_grade${grade}_wave87d.js`);
}
function normalizeQuestion(row){
  return {
    question: String(row?.question ?? row?.q ?? ''),
    answer: String(row?.answer ?? row?.a ?? ''),
    options: Array.isArray(row?.options) ? row.options.map(String) : (Array.isArray(row?.o) ? row.o.map(String) : []),
    hint: String(row?.hint ?? row?.h ?? ''),
    ex: String(row?.ex ?? '')
  };
}
function mkContext(grade){
  const ctx = {
    console,
    setTimeout(){ return 0; },
    clearTimeout(){},
    Math,
    window: null,
    GRADE_NUM: String(grade),
    SUBJ: [
      { id: 'rus', nm: 'Русский язык', cl: '#0d9488', bg: '#ccfbf1', tops: [] },
      { id: 'soc', nm: 'Обществознание', cl: '#7c3aed', bg: '#ede9fe', tops: [] },
      { id: 'inf', nm: 'Информатика', cl: '#2563eb', bg: '#dbeafe', tops: [] }
    ],
    document: { querySelector(){ return null; } },
    mkQ(q, a, o, h, tag, color, bg, _unused, _flag, ex){ return { question: q, answer: a, options: o, hint: h, tag, color, bg, ex }; }
  };
  ctx.window = ctx;
  return vm.createContext(ctx);
}
function auditGrade(grade){
  const file = scriptForGrade(grade);
  const code = fs.readFileSync(file, 'utf8');
  const ctx = mkContext(grade);
  vm.runInContext(code, ctx, { filename: file, timeout: 2000 });
  const soc = ctx.SUBJ.find(s => s.id === 'soc');
  const topics = (soc?.tops || []).filter(t => t && t._wave87fSocialLiveBank);
  const snapshot = ctx.window.wave87fSeniorSocialBanks?.auditSnapshot?.() || null;
  const failures = [];
  const topicReports = [];
  for (const topic of topics) {
    const report = { topic: topic.id, count: topic._wave87fSocialLiveBankCount || 0, samples: [] };
    if (report.count < 15) failures.push({ grade, topic: topic.id, error: 'live bank has fewer than 15 questions', count: report.count });
    if (typeof topic.gen !== 'function') {
      failures.push({ grade, topic: topic.id, error: 'missing gen' });
      continue;
    }
    for (let i = 0; i < 30; i++) {
      const row = normalizeQuestion(topic.gen());
      report.samples.push(row.question);
      if (!row.question || !row.answer || row.options.length < 4 || !row.options.includes(row.answer) || !row.hint || !row.ex) {
        failures.push({ grade, topic: topic.id, sample: i + 1, error: 'invalid q/a/o/h/ex', row });
      }
      if (genericStemRe.test(row.question)) {
        failures.push({ grade, topic: topic.id, sample: i + 1, error: 'generic facts stem emitted', question: row.question });
      }
    }
    topicReports.push(report);
  }
  const expectedTopics = grade === 10 ? ['socrel10_wave86m','culture10_wave86m','constitution10_wave86m','participation10_wave87f','media10_wave87f'] : ['civil11_wave86m','social11_wave86m','global_soc11_wave86m','democracy11_wave87f','labor11_wave87f'];
  for (const id of expectedTopics) {
    if (!topics.some(t => t.id === id)) failures.push({ grade, topic: id, error: 'expected wave87f social topic missing' });
  }
  return {
    grade,
    file: path.relative(root, file),
    topics: topics.length,
    questions: topics.reduce((sum, t) => sum + (t._wave87fSocialLiveBankCount || 0), 0),
    snapshot,
    topicReports,
    failures
  };
}
const gradesReport = grades.map(auditGrade);
const totals = gradesReport.reduce((acc, r) => {
  acc.grades += 1;
  acc.topics += r.topics;
  acc.questions += r.questions;
  acc.samples += r.topicReports.reduce((sum, t) => sum + t.samples.length, 0);
  acc.failures += r.failures.length;
  return acc;
}, { grades: 0, topics: 0, questions: 0, samples: 0, failures: 0 });
const output = { ok: totals.failures === 0 && totals.topics === 10 && totals.questions === 150, totals, grades: gradesReport };
console.log(JSON.stringify(output, null, 2));
process.exit(output.ok ? 0 : 1);
