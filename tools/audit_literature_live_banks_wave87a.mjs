import fs from 'fs';
import path from 'path';
import vm from 'vm';
const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'assets/_src/js/chunk_subject_expansion_wave86m_gap_balance.js'), 'utf8');
const expected = {
  '5': ['fable5_wave86m', 'landscape5_wave86m'],
  '6': ['ballad6_wave86m', 'composition6_wave86m'],
  '7': ['drama7_wave86m', 'satire7_wave86m'],
  '8': ['gogol8_wave86m', 'prose8_wave86m'],
  '9': ['onegin9_wave86m', 'psychprose9_wave86m']
};
const banned = ['Выбери понятие:', 'Что означает «', 'Какое понятие относится к теме'];
const result = { ok: true, totals: { grades: 0, topics: 0, questions: 0, samples: 0, failures: 0 }, grades: {}, failures: [] };
function fail(message) { result.ok = false; result.totals.failures += 1; result.failures.push(message); }
function contextFor(grade) {
  const ctx = {
    console,
    Math,
    setTimeout() {},
    clearTimeout() {},
    SUBJ: [],
    document: { querySelector() { return null; } },
    mkQ(q, a, o, h, tag, color, bg, code, isMath, ex) {
      return { question: String(q || ''), answer: String(a || ''), options: (o || []).map(String), hint: String(h || ''), tag, color, bg, code, isMath, ex: String(ex || '') };
    }
  };
  ctx.window = { GRADE_NUM: String(grade) };
  ctx.window.window = ctx.window;
  return vm.createContext(ctx);
}
for (const grade of Object.keys(expected)) {
  const ctx = contextFor(grade);
  result.totals.grades += 1;
  try {
    vm.runInContext(source, ctx, { filename: 'chunk_subject_expansion_wave86m_gap_balance.js' });
  } catch (err) {
    fail(`grade ${grade}: script failed: ${err?.message || err}`);
    continue;
  }
  const lit = ctx.SUBJ.find(s => s && s.id === 'lit');
  const gradeOut = { topics: {}, snapshot: ctx.window.wave87aLiteratureBanks?.auditSnapshot?.() || null };
  if (!lit) {
    fail(`grade ${grade}: literature subject missing`);
    result.grades[grade] = gradeOut;
    continue;
  }
  for (const topicId of expected[grade]) {
    const topic = (lit.tops || []).find(t => t && t.id === topicId);
    if (!topic) { fail(`grade ${grade}: topic ${topicId} missing`); continue; }
    const count = topic._wave87aLiveBankCount || 0;
    const topicOut = { count, live: !!topic._wave87aLiveBank, samples: [] };
    if (!topic._wave87aLiveBank) fail(`grade ${grade} ${topicId}: live bank flag missing`);
    if (count < 15) fail(`grade ${grade} ${topicId}: expected >=15 live rows, got ${count}`);
    result.totals.topics += 1;
    result.totals.questions += count;
    for (let i = 0; i < 30; i += 1) {
      const q = topic.gen();
      result.totals.samples += 1;
      if (i < 3) topicOut.samples.push(q.question);
      const opts = Array.isArray(q.options) ? q.options.map(String) : [];
      if (!q.question || !q.answer || !q.hint || !q.ex) fail(`grade ${grade} ${topicId}: incomplete q/h/ex`);
      if (opts.length < 4) fail(`grade ${grade} ${topicId}: options length ${opts.length}`);
      if (new Set(opts).size !== opts.length) fail(`grade ${grade} ${topicId}: duplicate options`);
      if (!opts.includes(String(q.answer))) fail(`grade ${grade} ${topicId}: answer not in options`);
      if (banned.some(stem => String(q.question).includes(stem))) fail(`grade ${grade} ${topicId}: old generic stem remained`);
    }
    gradeOut.topics[topicId] = topicOut;
  }
  result.grades[grade] = gradeOut;
}
fs.writeFileSync('/mnt/data/wave87a_literature_banks_audit.json', JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify({ ok: result.ok, totals: result.totals }, null, 2));
if (!result.ok) process.exit(1);
