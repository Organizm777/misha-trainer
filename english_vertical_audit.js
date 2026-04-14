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
  '10': 6,
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
const milestone_5_11 = ['5','6','7','8','9','10','11'].every(g => {
  const row = rows.find(r => r.grade === g);
  return row && row.status === 'ready';
});
const milestone_2_11 = ['2','3','4','5','6','7','8','9','10','11'].every(g => {
  const row = rows.find(r => r.grade === g);
  return row && row.status === 'ready';
});

const nextSteps = [];
if (milestone_2_11) {
  nextSteps.push('English vertical по классам 2–11 закрыт; следующий логичный шаг — shared ENG-шпаргалки, English в диагностике и English level в профиле.');
  nextSteps.push('После этого можно добирать exam-layer: ЕГЭ grammar / word formation / lexis и быстрые микро-диагностики.');
} else if (milestone_5_11) {
  nextSteps.push('Milestone 5–11 закрыт: английский уже есть от средней школы до ЕГЭ-уровня.');
  nextSteps.push('Следующий логичный шаг — добрать A1-вертикаль для 2–4 классов.');
  nextSteps.push('После этого — shared ENG-шпаргалки, English в диагностике и отдельная метрика English level.');
} else {
  nextSteps.push('Сначала зафиксировать 8–11 как уже покрытые классы English vertical.');
  nextSteps.push('Затем закрыть 5–7 классы как A1–B1 вертикаль.');
  nextSteps.push('После этого добавить начальную A1 вертикаль 2–4 классов и shared ENG-шпаргалки.');
}

const md = [
  '# English vertical audit',
  '',
  `- Классов с английским сейчас: **${coveredGrades}**.`,
  `- Полностью закрыто по текущим целям: **${readyGrades}**.`,
  `- Тем английского сейчас: **${totalCurrent}** из целевых **${totalTarget}**.`,
  `- Milestone 5–11: **${milestone_5_11 ? 'closed' : 'open'}**.`,
  `- Milestone 2–11: **${milestone_2_11 ? 'closed' : 'open'}**.`,
  '',
  '| Класс | Тем сейчас | Цель | Разрыв | Статус |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map(r => `| ${r.grade} | ${r.currentTopics} | ${r.targetTopics} | ${r.gap} | ${r.status} |`),
  '',
  '## Следующий логичный порядок',
  '',
  ...nextSteps.map((x, i) => `${i + 1}. ${x}`),
  '',
];

fs.writeFileSync(path.join(ROOT, 'ENGLISH_VERTICAL_AUDIT.md'), md.join('\n'), 'utf8');
fs.writeFileSync(path.join(ROOT, 'ENGLISH_VERTICAL.json'), JSON.stringify({ rows, totalCurrent, totalTarget, coveredGrades, readyGrades, milestone_5_11, milestone_2_11 }, null, 2), 'utf8');
console.log('Wrote ENGLISH_VERTICAL_AUDIT.md and ENGLISH_VERTICAL.json');
