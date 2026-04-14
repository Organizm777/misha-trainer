const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const grades = Array.from({length:11}, (_,i)=>i+1);
const rows = grades.map(g => {
  const file = path.join(ROOT, `grade${g}_v2.html`);
  const html = fs.readFileSync(file, 'utf8');
  const bin = /RUSH_BIN_ID="([^"]*)"/.exec(html);
  return {
    grade: g,
    file: `grade${g}_v2.html`,
    hasWave18: html.includes('wave18_cleanup.js'),
    hasCloudBin: !!(bin && bin[1]),
    binId: bin ? bin[1] : ''
  };
});
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const testsHtml = fs.readFileSync(path.join(ROOT, 'tests.html'), 'utf8');
const wave18 = fs.readFileSync(path.join(ROOT, 'wave18_cleanup.js'), 'utf8');
const payload = {
  hookedGrades: rows.filter(r => r.hasWave18).length,
  cloudGrades: rows.filter(r => r.hasCloudBin).length,
  localOnlyGrades: rows.filter(r => !r.hasCloudBin).length,
  hasSeparateRushSetting: /getRushPublishMode/.test(wave18) && /setRushPublishMode/.test(wave18),
  hasLocalOnlyCopy: /общий рейтинг пока не подключён/i.test(wave18) && /локальный рейтинг/i.test(wave18),
  hasCloudPrivacySplit: /облако выключено/i.test(wave18) && /рейтинг молнии.*отдельно/i.test(wave18),
  indexLinksTests: indexHtml.includes('href="tests.html"'),
  testsPageHasPortrait: testsHtml.includes('Портрет ученика'),
  rows
};
const md = [
  '# Rush cleanup audit (wave 18)',
  '',
  `- Hooked grade pages: **${payload.hookedGrades}/11**`,
  `- Classes with cloud bin: **${payload.cloudGrades}**`,
  `- Classes with local-only fallback: **${payload.localOnlyGrades}**`,
  `- Separate rush publish setting: **${payload.hasSeparateRushSetting ? 'yes' : 'no'}**`,
  `- Local-only explanatory copy: **${payload.hasLocalOnlyCopy ? 'yes' : 'no'}**`,
  `- Cloud/privacy split copy: **${payload.hasCloudPrivacySplit ? 'yes' : 'no'}**`,
  `- index.html links tests.html: **${payload.indexLinksTests ? 'yes' : 'no'}**`,
  `- tests.html portrait module present: **${payload.testsPageHasPortrait ? 'yes' : 'no'}**`,
  '',
  '| Grade | Hook | Cloud bin |',
  '|---|---:|---:|'
];
rows.forEach(r => md.push(`| ${r.grade} | ${r.hasWave18 ? '✅' : '❌'} | ${r.hasCloudBin ? '☁️' : '💾'} |`));
fs.writeFileSync(path.join(ROOT, 'RUSH_CLEANUP_AUDIT.json'), JSON.stringify(payload, null, 2));
fs.writeFileSync(path.join(ROOT, 'RUSH_CLEANUP_AUDIT.md'), md.join('\n'));
console.log('OK');
