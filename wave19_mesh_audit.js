const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const meshPath = path.join(ROOT, 'CURRICULUM_MESH.json');
if (!fs.existsSync(meshPath)) {
  console.error('CURRICULUM_MESH.json is missing');
  process.exit(1);
}

const mesh = JSON.parse(fs.readFileSync(meshPath, 'utf8'));
const byGrade = Object.fromEntries((mesh.grades || []).map(row => [String(row.grade), row]));

const REQUIRED = {
  '8': ['Химия', 'Биология', 'География', 'Литература'],
  '9': ['Химия', 'Биология', 'География', 'Литература'],
  '11': ['Вероятность и статистика', 'Химия', 'Биология', 'География', 'Литература'],
};
const MIN = {
  '8': { subjects: 12, topics: 46 },
  '9': { subjects: 12, topics: 46 },
  '11': { subjects: 13, topics: 53 },
};

function parseSubjectList(subjectList) {
  return (subjectList || []).map(item => {
    const m = String(item).match(/^(.*) \((\d+)\)$/);
    return m ? { name: m[1], topics: Number(m[2]) } : { name: String(item), topics: 0 };
  });
}

const rows = Object.keys(REQUIRED).map(grade => {
  const row = byGrade[grade] || { subjectList: [], subjects: 0, topics: 0 };
  const parsed = parseSubjectList(row.subjectList);
  const names = new Set(parsed.map(x => x.name));
  const missing = REQUIRED[grade].filter(name => !names.has(name));
  const topicMap = Object.fromEntries(parsed.map(x => [x.name, x.topics]));
  return {
    grade,
    subjects: Number(row.subjects || 0),
    topics: Number(row.topics || 0),
    missing,
    requiredTopics: Object.fromEntries(REQUIRED[grade].map(name => [name, Number(topicMap[name] || 0)])),
    ok: missing.length === 0 && Number(row.subjects || 0) >= MIN[grade].subjects && Number(row.topics || 0) >= MIN[grade].topics,
  };
});

const payload = {
  rows,
  closed: rows.every(r => r.ok),
  totalAddedSubjects: rows.reduce((sum, r) => sum + Object.keys(r.requiredTopics || {}).length, 0),
};

fs.writeFileSync(path.join(ROOT, 'WAVE19_MESH_AUDIT.json'), JSON.stringify(payload, null, 2), 'utf8');

let md = '# Аудит subject mesh для 8/9/11\n\n';
md += '| Класс | Предметов | Тем | Обязательные новые предметы | Пропуски | Статус |\n';
md += '|---|---:|---:|---|---|---|\n';
rows.forEach(r => {
  const req = Object.entries(r.requiredTopics).map(([name, count]) => `${name} (${count})`).join(', ');
  md += `| ${r.grade} | ${r.subjects} | ${r.topics} | ${req} | ${(r.missing.join(', ') || '—')} | ${r.ok ? 'OK' : 'FAIL'} |\n`;
});
md += '\n';
md += `- Закрыт ли milestone mesh 8/9/11: **${payload.closed ? 'да' : 'нет'}**.\n`;
md += `- Всего обязательных новых предметов в этом слое: **${payload.totalAddedSubjects}**.\n`;

fs.writeFileSync(path.join(ROOT, 'WAVE19_MESH_AUDIT.md'), md, 'utf8');
console.log('Wrote WAVE19_MESH_AUDIT.md and WAVE19_MESH_AUDIT.json');
