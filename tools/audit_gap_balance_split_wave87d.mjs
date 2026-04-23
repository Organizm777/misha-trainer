import fs from 'fs';
import path from 'path';
import vm from 'vm';

const root = process.cwd();
const grades = ['4','5','6','7','8','9','10','11'];
const oldName = 'chunk_subject_expansion_wave86m_gap_balance.507fb9e6fe.js';
const result = {
  ok: true,
  wave: 'wave87d',
  monolithRemoved: true,
  oldReferences: [],
  gradeChunks: {},
  totals: { splitChunks: 0, maxSplitBytes: 0, totalSplitBytes: 0, oldMonolithBytes: 131215, htmlPagesChecked: 0, vmFailures: 0 }
};
function fail(message) { result.ok = false; result.oldReferences.push(message); }
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function listFiles(dir) { return fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)) : []; }

for (const dir of ['.', 'assets/js', 'assets/_src/js']) {
  for (const file of listFiles(dir)) {
    if (file === oldName || file === 'chunk_subject_expansion_wave86m_gap_balance.js') {
      result.monolithRemoved = false;
      fail(`deprecated monolith remains: ${dir}/${file}`);
    }
  }
}
for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html')).concat(['sw.js', 'assets/asset-manifest.json'])) {
  const txt = read(file);
  if (txt.includes(oldName) || txt.includes('chunk_subject_expansion_wave86m_gap_balance.507fb9e6fe')) fail(`old monolith reference in ${file}`);
}

for (const grade of grades) {
  const html = read(`grade${grade}_v2.html`);
  result.totals.htmlPagesChecked += 1;
  const match = html.match(new RegExp(`assets/js/(chunk_subject_expansion_wave86m_gap_balance_grade${grade}_wave87d\\.[a-f0-9]{10}\\.js)`));
  if (!match) { fail(`grade${grade}: missing matching split chunk in HTML`); continue; }
  const built = `assets/js/${match[1]}`;
  const source = `assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade${grade}_wave87d.js`;
  if (!fs.existsSync(path.join(root, built))) fail(`grade${grade}: built split chunk missing: ${built}`);
  if (!fs.existsSync(path.join(root, source))) fail(`grade${grade}: source split chunk missing: ${source}`);
  const sourceText = read(source);
  const builtBytes = fs.statSync(path.join(root, built)).size;
  result.totals.splitChunks += 1;
  result.totals.totalSplitBytes += builtBytes;
  result.totals.maxSplitBytes = Math.max(result.totals.maxSplitBytes, builtBytes);
  const otherGradeData = grades.filter(g => g !== grade).some(g => sourceText.includes(`"${g}":{"subjects"`));
  if (otherGradeData) fail(`grade${grade}: source still contains another grade DATA block`);
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
  ctx.window = { GRADE_NUM: grade };
  ctx.window.window = ctx.window;
  try {
    vm.runInContext(sourceText, vm.createContext(ctx), { filename: source });
    if (!ctx.window.wave86mGapBalance?.auditSnapshot) fail(`grade${grade}: auditSnapshot missing after VM load`);
  } catch (err) {
    result.totals.vmFailures += 1;
    fail(`grade${grade}: VM load failed: ${err?.message || err}`);
  }
  result.gradeChunks[grade] = { source, built, builtBytes };
}

fs.writeFileSync('/mnt/data/wave87d_gap_balance_split_audit.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify({ ok: result.ok, totals: result.totals }, null, 2));
if (!result.ok) process.exit(1);
