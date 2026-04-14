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
  '1': ['Литературное чтение', 'Окружающий мир'],
  '2': ['Литературное чтение', 'Окружающий мир'],
  '3': ['Литературное чтение', 'Окружающий мир'],
  '4': ['Литературное чтение', 'Окружающий мир'],
  '5': ['Литература'],
  '6': ['Литература'],
  '7': ['Литература', 'Биология', 'География', 'Информатика'],
};

const MIN = {
  '1': { subjects: 4, topics: 18, topicCounts: { 'Литературное чтение': 3, 'Окружающий мир': 5 } },
  '2': { subjects: 5, topics: 19, topicCounts: { 'Литературное чтение': 3, 'Окружающий мир': 5 } },
  '3': { subjects: 5, topics: 18, topicCounts: { 'Литературное чтение': 3, 'Окружающий мир': 6 } },
  '4': { subjects: 5, topics: 18, topicCounts: { 'Литературное чтение': 3, 'Окружающий мир': 5 } },
  '5': { subjects: 7, topics: 23, topicCounts: { 'Литература': 3 } },
  '6': { subjects: 7, topics: 23, topicCounts: { 'Литература': 3 } },
  '7': { subjects: 10, topics: 34, topicCounts: { 'Литература': 3, 'Биология': 3, 'География': 3, 'Информатика': 3 } },
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
  const need = MIN[grade];
  const countProblems = Object.entries(need.topicCounts || {})
    .filter(([name, minCount]) => Number(topicMap[name] || 0) < minCount)
    .map(([name]) => name);
  return {
    grade,
    subjects: Number(row.subjects || 0),
    topics: Number(row.topics || 0),
    missing,
    countProblems,
    requiredTopics: Object.fromEntries(Object.keys(need.topicCounts || {}).map(name => [name, Number(topicMap[name] || 0)])),
    ok: missing.length === 0 && countProblems.length === 0 && Number(row.subjects || 0) >= need.subjects && Number(row.topics || 0) >= need.topics,
  };
});

const payload = {
  rows,
  closed: rows.every(r => r.ok),
  totalAddedSubjects: rows.reduce((sum, r) => sum + Object.keys(r.requiredTopics || {}).length, 0),
};

fs.writeFileSync(path.join(ROOT, 'WAVE20_MESH_AUDIT.json'), JSON.stringify(payload, null, 2), 'utf8');

let md = '# Аудит subject mesh для 5/6/7 и начальной школы\n\n';
md += '| Класс | Предметов | Тем | Обязательные новые предметы | Пропуски | Недобор тем | Статус |\n';
md += '|---|---:|---:|---|---|---|---|\n';
rows.forEach(r => {
  const req = Object.entries(r.requiredTopics).map(([name, count]) => `${name} (${count})`).join(', ');
  md += `| ${r.grade} | ${r.subjects} | ${r.topics} | ${req} | ${(r.missing.join(', ') || '—')} | ${(r.countProblems.join(', ') || '—')} | ${r.ok ? 'OK' : 'FAIL'} |\n`;
});
md += '\n';
md += `- Закрыт ли milestone mesh 1–7: **${payload.closed ? 'да' : 'нет'}**.\n`;
md += `- Всего обязательных новых предметов/слоёв в этом пакете: **${payload.totalAddedSubjects}**.\n`;

fs.writeFileSync(path.join(ROOT, 'WAVE20_MESH_AUDIT.md'), md, 'utf8');
console.log('Wrote WAVE20_MESH_AUDIT.md and WAVE20_MESH_AUDIT.json');
