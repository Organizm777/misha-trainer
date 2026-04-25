#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const errors = [];
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function readJSON(rel){ return JSON.parse(read(rel)); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(cond, message){ if (!cond) errors.push(message); }
function countMatches(text, re){ return (text.match(re) || []).length; }

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const sw = read('sw.js');
const specHtml = read('spec_subjects.html');

const logical = {
  spec: 'assets/js/bundle_special_subjects.js',
  boosters: 'assets/js/bundle_boosters.js',
  theme: 'assets/js/chunk_roadmap_wave86q_accessibility_theme.js',
  core: 'assets/js/bundle_grade_runtime_core_wave87n.js',
  css: 'assets/css/wave86x_inline_spec_subjects.css'
};
const built = Object.fromEntries(Object.entries(logical).map(([k, rel]) => [k, manifest.assets[rel]]));
for (const [k, rel] of Object.entries(built)) {
  assert(rel, `asset-manifest: missing logical asset for ${k}`);
  if (rel) assert(exists(rel), `built asset missing for ${k}: ${rel}`);
}

assert(healthz.wave === 'wave89a', `healthz.wave should be wave89a, got ${healthz.wave}`);
assert(healthz.build_id === 'wave89a', `healthz.build_id should be wave89a, got ${healthz.build_id}`);
assert(String(healthz.cache || '').includes('wave89a'), `healthz.cache should reference wave89a, got ${healthz.cache}`);
assert(healthz.hashed_asset_count === Object.keys(manifest.assets || {}).length, 'healthz.hashed_asset_count mismatch');
assert(sw.includes("trainer-build-wave89a-2026-04-25"), 'sw.js: cache name should be bumped to wave89a');

for (const rel of Object.values(built)) {
  if (!rel) continue;
  assert(sw.includes(`./${rel}`), `sw.js: missing precache entry for ${rel}`);
}
assert(specHtml.includes(`./${built.spec}`), `spec_subjects.html: missing ${built.spec}`);
assert(specHtml.includes(`./${built.theme}`), `spec_subjects.html: missing ${built.theme}`);
assert(specHtml.includes(`./${built.css}`), `spec_subjects.html: missing ${built.css}`);

const specSrc = read('assets/_src/js/bundle_special_subjects.js');
const specBuilt = built.spec ? read(built.spec) : '';
const cssSrc = read('assets/_src/css/wave86x_inline_spec_subjects.css');
const cssBuilt = built.css ? read(built.css) : '';
const themeSrc = read('assets/_src/js/chunk_roadmap_wave86q_accessibility_theme.js');
const themeBuilt = built.theme ? read(built.theme) : '';
const coreBuilt = built.core ? read(built.core) : '';
const boostersSrc = read('assets/_src/js/bundle_boosters.js');
const boostersBuilt = built.boosters ? read(built.boosters) : '';

const inlinePattern = /\bon(click|input|change|keydown|submit)\s*=|\bstyle\s*=/g;
assert(!inlinePattern.test(specSrc), 'bundle_special_subjects source should not contain inline handlers/style=');
assert(!inlinePattern.test(specBuilt), 'bundle_special_subjects built asset should not contain inline handlers/style=');
assert(!inlinePattern.test(specHtml), 'spec_subjects.html should not contain inline handlers/style=');
assert(specSrc.includes('data-spec-action="open-subject"'), 'bundle_special_subjects source: missing data-spec-action markers');
assert(specSrc.includes('initRootDelegation'), 'bundle_special_subjects source: missing initRootDelegation');
assert(specSrc.includes('handleRootClick'), 'bundle_special_subjects source: missing delegated click handler');
assert(specSrc.includes('handleRootInput'), 'bundle_special_subjects source: missing delegated input handler');
assert(specBuilt.includes('__wave89aSpecSubjects'), 'bundle_special_subjects built asset: missing wave89a audit export');
assert(specBuilt.includes('data-spec-action="open-subject"'), 'bundle_special_subjects built asset: missing delegated open-subject markers');
assert(cssSrc.includes('.spec-card[data-spec-id="diplomacy"]'), 'spec_subjects css source: missing subject accent rule');
assert(cssBuilt.includes('.spec-w-100{width:100%}'), 'spec_subjects css built asset: missing width utility classes');

const fabCreationPatterns = [
  /btn\.id\s*=\s*['"]theme-toggle['"]/,
  /\.theme-toggle\{position:fixed/,
  /position:fixed;right:16px;bottom:calc\(/,
  /setMode\(nextMode\(\)\)/
];
for (const re of fabCreationPatterns) {
  assert(!re.test(themeSrc), `theme source should no longer contain FAB pattern ${re}`);
  assert(!re.test(themeBuilt), `theme built asset should no longer contain FAB pattern ${re}`);
  assert(!re.test(coreBuilt), `runtime core should no longer contain FAB pattern ${re}`);
}
assert(themeSrc.includes('installThemeSync'), 'theme source: missing installThemeSync');
assert(themeBuilt.includes('installThemeSync'), 'theme built asset: missing installThemeSync');
assert(coreBuilt.includes('installThemeSync'), 'runtime core: missing installThemeSync');
assert(themeBuilt.includes('fabRemoved'), 'theme built asset: missing fabRemoved audit flag');
assert(coreBuilt.includes('fabRemoved'), 'runtime core: missing fabRemoved audit flag');

const engDeclRE = /var ENG_TH = window\.ENG_TH = window\.ENG_TH \|\| \{\};/g;
const engDeclSrc = countMatches(boostersSrc, engDeclRE);
const engDeclBuilt = countMatches(boostersBuilt, engDeclRE);
assert(engDeclSrc >= 2, `bundle_boosters source: expected >=2 ENG_TH declarations, got ${engDeclSrc}`);
assert(engDeclBuilt >= 2, `bundle_boosters built asset: expected >=2 ENG_TH declarations, got ${engDeclBuilt}`);
assert(boostersBuilt.includes('__wave89aEnglishTheoryCoverage'), 'bundle_boosters built asset: missing English theory coverage export');
assert(boostersBuilt.includes('British vs American English'), 'bundle_boosters built asset: missing late English theory rows');

const report = {
  ok: errors.length === 0,
  wave: healthz.wave,
  cache: healthz.cache,
  hashedAssetCount: healthz.hashed_asset_count,
  builtAssets: built,
  checks: {
    specSourceInlineMatches: countMatches(specSrc, inlinePattern),
    specBuiltInlineMatches: countMatches(specBuilt, inlinePattern),
    specHtmlInlineMatches: countMatches(specHtml, inlinePattern),
    engTheoryDeclarationsSource: engDeclSrc,
    engTheoryDeclarationsBuilt: engDeclBuilt,
    themeSyncInBuiltCore: coreBuilt.includes('installThemeSync'),
    specAuditExportPresent: specBuilt.includes('__wave89aSpecSubjects')
  },
  errors
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
