#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readJSON = (rel) => JSON.parse(read(rel));

const runtimeLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const srcRel = 'assets/_src/js/chunk_wave91e_learning_formats.js';
const extendedSrcRel = 'assets/_src/js/bundle_grade_runtime_extended_wave89b.js';
const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const sw = read('sw.js');
const built = manifest.assets && manifest.assets[runtimeLogical];

function waveRank(value){
  const raw = String(value || '').trim().toLowerCase();
  const match = raw.match(/^wave(\d+)([a-z]*)$/);
  if (!match) return -1;
  const major = Number(match[1]) || 0;
  const suffix = match[2] || '';
  let minor = 0;
  for (let i = 0; i < suffix.length; i += 1) {
    minor = minor * 26 + (suffix.charCodeAt(i) - 96);
  }
  return major * 1000 + minor;
}

assert.ok(waveRank(healthz.wave) >= waveRank('wave91e'), `healthz.wave should be wave91e+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave91e'), `healthz.build_id should be wave91e+ (got ${healthz.build_id})`);
assert.ok(String(healthz.cache || '').includes(String(healthz.build_id || '')), `healthz.cache should reference build_id, got ${healthz.cache}`);
assert.equal(manifest.version, healthz.version, 'manifest/healthz versions should match');
assert.equal(manifest.build_id, healthz.build_id, 'manifest/healthz build_id should match');
assert.ok(built, `asset-manifest missing ${runtimeLogical}`);
assert.ok(exists(srcRel), `missing source ${srcRel}`);
assert.ok(exists(extendedSrcRel), `missing extended runtime source ${extendedSrcRel}`);
assert.ok(exists(built), `missing built extended runtime asset ${built}`);
assert.ok(sw.includes(String(healthz.cache || '')), 'sw.js should use current cache name');
assert.ok(sw.includes(`./${built}`), `sw.js should precache ${built}`);

const src = read(srcRel);
const extendedSrc = read(extendedSrcRel);
const out = read(built);
assert.ok(extendedSrc.includes('/* wave91e: merged learning formats runtime */'), 'extended runtime source should contain wave91e merge marker');
assert.ok(out.includes('/* wave91e: merged learning formats runtime */'), 'built extended runtime should contain wave91e merge marker');

const requiredMarkers = [
  'wave91eLearningFormats',
  'Pomodoro-тренировка',
  'Объясни другу',
  'exportAnkiImport',
  'trainer_exam_date_wave91e_',
  'trainer_explain_friend_wave91e_',
  'trainer_pomodoro_wave91e_',
  'wave91e-exam-countdown',
  'Anki-compatible TSV-файл',
  'auditSnapshot'
];
for (const marker of requiredMarkers) {
  assert.ok(src.includes(marker), `learning formats source missing marker: ${marker}`);
  assert.ok(out.includes(marker), `built extended runtime missing marker: ${marker}`);
}

assert.ok(!/\son[a-z]+\s*=/.test(src), 'new chunk should not introduce inline event handler attributes');
assert.ok(src.includes('addEventListener'), 'new chunk should bind controls with addEventListener');
assert.ok(src.includes('downloadText(name, lines.join'), 'Anki import export should generate downloadable text');
assert.ok(src.includes('readJSON(\'trainer_journal_\''), 'Anki export should read the existing error journal');
assert.ok(src.includes("g !== '9' && g !== '11'"), 'exam countdown should be limited to grades 9 and 11');
assert.ok(!Object.prototype.hasOwnProperty.call(manifest.assets || {}, 'assets/js/chunk_wave91e_learning_formats.js'), 'wave91e should be merged into extended runtime, not shipped as an extra grade-page script');
assert.ok(!sw.includes('chunk_wave91e_learning_formats.'), 'sw.js should not precache a separate wave91e script');

let gradeRefs = 0;
for (let grade = 1; grade <= 11; grade += 1) {
  const html = read(`grade${grade}_v2.html`);
  const needle = `./${built}`;
  const scriptMatches = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].filter(m => m[1] === needle).length;
  assert.equal(scriptMatches, 1, `grade${grade}_v2.html should reference ${needle} exactly once as a script`);
  assert.equal(html.includes('chunk_wave91e_learning_formats.'), false, `grade${grade}_v2.html should not add a separate wave91e script`);
  gradeRefs += scriptMatches;
}
assert.equal(gradeRefs, 11, 'extended runtime with wave91e should be attached to all 11 grade pages');

const workflow = read('.github/workflows/validate-questions.yml');
assert.ok(workflow.includes('node tools/audit_learning_formats_wave91e.mjs'), 'validate workflow should run the wave91e learning formats audit');

const result = {
  ok: true,
  wave: 'wave91e',
  runtimeBuilt: built,
  gradePageRefs: gradeRefs,
  features: ['explain_friend', 'pomodoro', 'anki_import_tsv', 'exam_countdown'],
  cache: healthz.cache,
  externalScriptsAdded: 0
};
console.log(JSON.stringify(result, null, 2));
