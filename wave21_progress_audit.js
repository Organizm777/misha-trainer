const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const grades = Array.from({length:11}, (_,i)=>`grade${i+1}_v2.html`);
const scriptPath = path.join(ROOT, 'wave21_progress.js');
const script = fs.readFileSync(scriptPath, 'utf8');
const hooked = [];
for (const file of grades){
  const full = path.join(ROOT, file);
  const html = fs.readFileSync(full, 'utf8');
  hooked.push({ file, hooked: html.includes('wave21_progress.js') });
}
const features = {
  hasResume: script.includes('wave21ResumeSession'),
  hasFavorites: script.includes('wave21ToggleFavorite'),
  hasContinue: script.includes('wave21ContinueLastTopic'),
  hasRandom: script.includes('wave21RandomTopic'),
  hasRepeatErrors: script.includes('wave21RepeatSessionErrors'),
  hasSnapshot: script.includes('trainer_session_snapshot_'),
  hasProgressBar: script.includes('wave21-session-slot') && script.includes('Вопрос ${'),
};
const payload = {
  hookedPages: hooked,
  hookedCount: hooked.filter(r=>r.hooked).length,
  totalPages: hooked.length,
  features,
};
fs.writeFileSync(path.join(ROOT, 'WAVE21_PROGRESS_AUDIT.json'), JSON.stringify(payload, null, 2), 'utf8');
const md = [
  '# Wave 21 progress UX audit',
  '',
  `- Hooked grade pages: **${payload.hookedCount}/${payload.totalPages}**`,
  `- Resume session: **${features.hasResume ? 'yes' : 'no'}**`,
  `- Favourites: **${features.hasFavorites ? 'yes' : 'no'}**`,
  `- Continue topic: **${features.hasContinue ? 'yes' : 'no'}**`,
  `- Random topic: **${features.hasRandom ? 'yes' : 'no'}**`,
  `- Repeat session errors: **${features.hasRepeatErrors ? 'yes' : 'no'}**`,
  `- Snapshot autosave: **${features.hasSnapshot ? 'yes' : 'no'}**`,
  `- Session progress bar: **${features.hasProgressBar ? 'yes' : 'no'}**`,
  '',
  '| File | Hooked |',
  '|---|---|',
  ...hooked.map(r=>`| ${r.file} | ${r.hooked ? '✅' : '❌'} |`),
  ''
].join('\n');
fs.writeFileSync(path.join(ROOT, 'WAVE21_PROGRESS_AUDIT.md'), md, 'utf8');
console.log('WAVE21_PROGRESS_AUDIT_OK');
