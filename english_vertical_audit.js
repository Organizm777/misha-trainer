const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const meshPath = path.join(ROOT, 'CURRICULUM_MESH.json');
if (!fs.existsSync(meshPath)) {
  console.error('CURRICULUM_MESH.json is missing. Run curriculum_audit.js first.');
  process.exit(1);
}

const mesh = JSON.parse(fs.readFileSync(meshPath, 'utf8'));
const TARGET_TOPICS = {
  '1': 0,
  '2': 2,
  '3': 2,
  '4': 2,
  '5': 4,
  '6': 4,
  '7': 6,
  '8': 8,
  '9': 8,
  '10': 4,
  '11': 12,
};

function parseCurrent(subjectList) {
  const hit = (subjectList || []).find(x => /^Английский \(\d+\)$/.test(x));
  if (!hit) return 0;
  const m = hit.match(/\((\d+)\)/);
  return m ? Number(m[1]) : 0;
}

const rows = (mesh.grades || []).map(g => {
  const grade = String(g.grade);
  const current = parseCurrent(g.subjectList);
  const target = TARGET_TOPICS[grade] || 0;
  const gap = Math.max(target - current, 0);
  const status = current >= target ? 'ready' : current > 0 ? 'partial' : 'missing';
  return {
    grade,
    currentTopics: current,
    targetTopics: target,
    gap,
    status,
  };
});

const totalCurrent = rows.reduce((s, r) => s + r.currentTopics, 0);
const totalTarget = rows.reduce((s, r) => s + r.targetTopics, 0);
const coveredGrades = rows.filter(r => r.currentTopics > 0).length;
const readyGrades = rows.filter(r => r.targetTopics > 0 && r.status === 'ready').length;

const md = [
  '# English vertical audit',
  '',
  `- Классов с английским сейчас: **${coveredGrades}**.`,
  `- Полностью закрыто по текущим целям: **${readyGrades}**.`,
  `- Тем английского сейчас: **${totalCurrent}** из целевых **${totalTarget}**.`,
  '',
  '| Класс | Тем сейчас | Цель | Разрыв | Статус |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map(r => `| ${r.grade} | ${r.currentTopics} | ${r.targetTopics} | ${r.gap} | ${r.status} |`),
  '',
  '## Следующий логичный порядок',
  '',
  '1. Добить grade 11 до полного B2–C1 слоя и начать 8–9 классы.',
  '2. Затем закрыть 5–7 классы как A2–B1 вертикаль.',
  '3. После этого добавить начальную A1 вертикаль 2–4 классов.',
  '',
];

fs.writeFileSync(path.join(ROOT, 'ENGLISH_VERTICAL_AUDIT.md'), md.join('\n'), 'utf8');
fs.writeFileSync(path.join(ROOT, 'ENGLISH_VERTICAL.json'), JSON.stringify({ rows, totalCurrent, totalTarget, coveredGrades, readyGrades }, null, 2), 'utf8');
console.log('Wrote ENGLISH_VERTICAL_AUDIT.md and ENGLISH_VERTICAL.json');
