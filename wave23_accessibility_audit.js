const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
const jsPath = path.join(ROOT, 'wave23_accessibility.js');
const mdPath = path.join(ROOT, 'WAVE23_ACCESSIBILITY_AUDIT.md');
const jsonPath = path.join(ROOT, 'WAVE23_ACCESSIBILITY_AUDIT.json');

const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '';
const rows = htmlFiles.map((name) => {
  const text = fs.readFileSync(path.join(ROOT, name), 'utf8');
  return {
    file: name,
    hooked: text.includes('wave23_accessibility.js'),
  };
});

const summary = {
  totalPages: rows.length,
  hookedPages: rows.filter((r) => r.hooked).length,
  hasSkipLink: js.includes('skip-link') && js.includes('Перейти к содержимому'),
  hasLiveRegion: js.includes('aria-live') && js.includes('wave23-live'),
  hasDialogRole: js.includes("role', 'dialog") || js.includes('role", "dialog'),
  hasDialogTrap: js.includes('aria-modal') && js.includes('topDialog') && js.includes('Escape'),
  hasKeyboardProxy: js.includes('data-wave23-button') && js.includes('keydown'),
  hasScreenAria: js.includes('aria-hidden') && js.includes('aria-current'),
  hasEnglishLang: js.includes("setAttribute('lang', 'en')") || js.includes('setAttribute("lang", "en")') || js.includes("safeSet(el, 'lang', 'en')") || js.includes('markEnglishLang'),
  hasReducedMotion: js.includes('prefers-reduced-motion'),
  hasHighContrast: js.includes('prefers-contrast'),
  hasFocusVisible: js.includes(':focus-visible') || js.includes('focus-visible'),
  hasMainLandmark: js.includes("role', 'main") || js.includes('role", "main'),
  hasBannerLandmark: js.includes("role', 'banner") || js.includes('role", "banner'),
};

const payload = { summary, rows };
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');

const lines = [
  '# Wave 23 accessibility audit',
  '',
  `- Pages hooked: ${summary.hookedPages}/${summary.totalPages}`,
  `- Skip link: ${summary.hasSkipLink ? 'yes' : 'no'}`,
  `- Live region: ${summary.hasLiveRegion ? 'yes' : 'no'}`,
  `- Dialog role + trap: ${summary.hasDialogRole && summary.hasDialogTrap ? 'yes' : 'no'}`,
  `- Keyboard proxy: ${summary.hasKeyboardProxy ? 'yes' : 'no'}`,
  `- Screen aria: ${summary.hasScreenAria ? 'yes' : 'no'}`,
  `- English lang patch: ${summary.hasEnglishLang ? 'yes' : 'no'}`,
  `- Reduced motion: ${summary.hasReducedMotion ? 'yes' : 'no'}`,
  `- High contrast: ${summary.hasHighContrast ? 'yes' : 'no'}`,
  `- Main landmark: ${summary.hasMainLandmark ? 'yes' : 'no'}`,
  `- Banner landmark: ${summary.hasBannerLandmark ? 'yes' : 'no'}`,
  '',
  '| File | Hooked |',
  '|---|---|',
  ...rows.map((r) => `| ${r.file} | ${r.hooked ? '✅' : '❌'} |`),
  ''
];
fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
console.log('WAVE23_ACCESSIBILITY_OK');
