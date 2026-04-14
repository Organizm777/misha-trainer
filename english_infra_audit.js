const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const GRADE_PAGES = Array.from({length:10}, (_,i)=>path.join(ROOT, `grade${i+2}_v2.html`));
const infraPath = path.join(ROOT, 'wave17_english_infra.js');
const diagPath = path.join(ROOT, 'wave17_english_diag.js');
const diagHtmlPath = path.join(ROOT, 'diagnostic.html');

function read(p){ return fs.readFileSync(p, 'utf8'); }
function countQuestions(text){ return (text.match(/\{g:/g) || []).length; }

const infraExists = fs.existsSync(infraPath);
const diagExists = fs.existsSync(diagPath);
const infraText = infraExists ? read(infraPath) : '';
const diagText = diagExists ? read(diagPath) : '';
const diagHtml = fs.existsSync(diagHtmlPath) ? read(diagHtmlPath) : '';

const guideKeys = Array.from(infraText.matchAll(/window\.ENG_SHARED_GUIDES\s*=\s*window\.ENG_SHARED_GUIDES\s*\|\|\s*\{([\s\S]*?)\n\s*\};/g))[0]?.[1] || '';
const sharedGuideCount = (guideKeys.match(/title:/g) || []).length;
const hasLevelSummary = /window\.getEnglishLevelSummary\s*=\s*computeEnglishLevel/.test(infraText);
const hasGuideButtons = /showEnglishGuide\(/.test(infraText) && /eng-extra-tools/.test(infraText);
const hasHallPatch = /data-eng-profile-block/.test(infraText);
const hookPages = GRADE_PAGES.filter(p => fs.existsSync(p) && read(p).includes('wave17_english_infra.js'));

const baseDiagMatch = fs.existsSync(diagHtmlPath) ? read(diagHtmlPath).match(/QBANK\.english\s*=\s*\[(.*?)\n\];/s) : null;
const patchDiagMatch = fs.existsSync(diagHtmlPath) ? read(diagHtmlPath).match(/english:\s*\[(.*?)\n\s*\]/s) : null;
const baseDiagCount = baseDiagMatch ? (baseDiagMatch[1].match(/\{g:/g) || []).length : 0;
const patchDiagCount = patchDiagMatch ? (patchDiagMatch[1].match(/\{g:/g) || []).length : 0;
const diagCount = baseDiagCount + patchDiagCount + countQuestions(diagText);
const gradeMatches = []
  .concat(baseDiagMatch ? Array.from(baseDiagMatch[1].matchAll(/\{g:(\d+)/g)).map(m => Number(m[1])) : [])
  .concat(patchDiagMatch ? Array.from(patchDiagMatch[1].matchAll(/\{g:(\d+)/g)).map(m => Number(m[1])) : [])
  .concat(Array.from(diagText.matchAll(/\{g:(\d+)/g)).map(m => Number(m[1])));
const minGrade = gradeMatches.length ? Math.min(...gradeMatches) : null;
const maxGrade = gradeMatches.length ? Math.max(...gradeMatches) : null;
const hasConfigs = /window\.ENGLISH_DIAG_CONFIGS/.test(diagText);
const hasDiagHook = diagHtml.includes('wave17_english_diag.js');
const hasEngLevelBlock = /eng-level-block/.test(diagText);

const md = [
  '# English infrastructure audit',
  '',
  `- wave17_english_infra.js: **${infraExists ? 'present' : 'missing'}**.`,
  `- wave17_english_diag.js: **${diagExists ? 'present' : 'missing'}**.`,
  `- Grade pages with English infra hook: **${hookPages.length}/10**.`,
  `- Shared ENG guides: **${sharedGuideCount}**.`,
  `- English level summary hook: **${hasLevelSummary ? 'yes' : 'no'}**.`,
  `- English subject toolbar hook: **${hasGuideButtons ? 'yes' : 'no'}**.`,
  `- Hall of Fame patch: **${hasHallPatch ? 'yes' : 'no'}**.`,
  `- Diagnostic English extra questions: **${diagCount}**.`,
  `- Diagnostic English grade range: **${minGrade}–${maxGrade}**.`,
  `- Diagnostic English configs: **${hasConfigs ? 'yes' : 'no'}**.`,
  `- Diagnostic English result block: **${hasEngLevelBlock ? 'yes' : 'no'}**.`,
  `- diagnostic.html hook connected: **${hasDiagHook ? 'yes' : 'no'}**.`,
  '',
  '## Grade hooks',
  '',
  ...hookPages.map(p => `- ${path.basename(p)}`),
  ''
];

const json = {
  infraExists,
  diagExists,
  hookedGrades: hookPages.map(p => path.basename(p)),
  hookedGradesCount: hookPages.length,
  sharedGuideCount,
  hasLevelSummary,
  hasGuideButtons,
  hasHallPatch,
  diagnosticEnglishCount: diagCount,
  diagnosticGradeRange: { min: minGrade, max: maxGrade },
  hasConfigs,
  hasDiagHook,
  hasEngLevelBlock,
};

fs.writeFileSync(path.join(ROOT, 'ENGLISH_INFRA_AUDIT.md'), md.join('\n'), 'utf8');
fs.writeFileSync(path.join(ROOT, 'ENGLISH_INFRA_AUDIT.json'), JSON.stringify(json, null, 2), 'utf8');
console.log('Wrote ENGLISH_INFRA_AUDIT.md and ENGLISH_INFRA_AUDIT.json');
