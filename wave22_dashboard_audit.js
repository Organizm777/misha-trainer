const fs = require('fs');
const path = require('path');

const root = __dirname;
const dashboard = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'engine10.js'), 'utf8');
const wave = fs.readFileSync(path.join(root, 'wave22_dashboard.js'), 'utf8');

const placeholders = [
  'wave22-insights',
  'wave22-heatmap',
  'wave22-radar',
  'wave22-trend',
  'wave22-subjects'
].map(id => ({ id, ok: dashboard.includes(`id="${id}"`) }));

const buttons = [
  'downloadDashboardReport()',
  'downloadDashboardCSV()',
  'downloadDashboardPNG()',
  'window.print()'
].map(call => ({ call, ok: dashboard.includes(call) }));

const hooks = {
  dashboardScript: dashboard.includes('wave22_dashboard.js'),
  swHook: sw.includes('./wave22_dashboard.js'),
  activity365: engine.includes('slice(-365)'),
  stateEvent: dashboard.includes('dashboard-state-ready'),
  csvFn: wave.includes('window.downloadDashboardCSV'),
  pngFn: wave.includes('window.downloadDashboardPNG'),
};

const report = {
  placeholders,
  buttons,
  hooks,
  summary: {
    placeholdersOk: placeholders.filter(x => x.ok).length,
    buttonsOk: buttons.filter(x => x.ok).length,
    hooksOk: Object.values(hooks).filter(Boolean).length,
  }
};

fs.writeFileSync(path.join(root, 'WAVE22_DASHBOARD_AUDIT.json'), JSON.stringify(report, null, 2));

const lines = [];
lines.push('# Wave 22 dashboard audit');
lines.push('');
lines.push(`- placeholders: ${report.summary.placeholdersOk}/${placeholders.length}`);
lines.push(`- actions: ${report.summary.buttonsOk}/${buttons.length}`);
lines.push(`- hooks: ${report.summary.hooksOk}/${Object.keys(hooks).length}`);
lines.push('');
lines.push('## Placeholders');
placeholders.forEach(row => lines.push(`- ${row.ok ? '✅' : '❌'} ${row.id}`));
lines.push('');
lines.push('## Actions');
buttons.forEach(row => lines.push(`- ${row.ok ? '✅' : '❌'} ${row.call}`));
lines.push('');
lines.push('## Hooks');
Object.entries(hooks).forEach(([key, ok]) => lines.push(`- ${ok ? '✅' : '❌'} ${key}`));
fs.writeFileSync(path.join(root, 'WAVE22_DASHBOARD_AUDIT.md'), lines.join('\n'));

const ok = placeholders.every(x => x.ok) && buttons.every(x => x.ok) && Object.values(hooks).every(Boolean);
if(!ok) process.exit(1);
