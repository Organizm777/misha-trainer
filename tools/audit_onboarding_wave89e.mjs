#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJSON = (rel) => JSON.parse(read(rel));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

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

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
assert.ok(waveRank(healthz.wave) >= waveRank('wave89e'), `healthz.wave should be wave89e+ (got ${healthz.wave})`);

const logicalRuntime = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const logicalCss = 'assets/css/wave88d_breadcrumbs.css';
const builtRuntime = manifest.assets?.[logicalRuntime];
const builtCss = manifest.assets?.[logicalCss];
assert.ok(builtRuntime, 'asset-manifest: missing merged runtime logical asset');
assert.ok(builtCss, 'asset-manifest: missing shared breadcrumbs/onboarding css logical asset');
assert.ok(exists(builtRuntime), 'built merged runtime file should exist');
assert.ok(exists(builtCss), 'built shared css file should exist');

const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
const builtRuntimeSource = read(builtRuntime);
const builtCssSource = read(builtCss);
const sw = read('sw.js');
const changelog = read('CHANGELOG.md');
const docs = read('docs/ONBOARDING_wave89e.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');
const toolsReadme = read('tools/README.md');
const claude = read('CLAUDE.md');

assert.ok(srcRuntime.includes('/* wave89e: onboarding / first-visit tour */'), 'runtime source should contain the wave89e onboarding marker');
assert.ok(srcRuntime.includes("trainer_onboarding_wave89e_v1"), 'runtime source should persist onboarding completion');
assert.ok(srcRuntime.includes('openTourFromSettings'), 'runtime source should expose manual tour reopen from settings');
assert.ok(srcRuntime.includes("root.__wave89eOnboarding"), 'runtime source should export the onboarding API');
assert.ok(srcRuntime.includes('shouldAutoOpen'), 'runtime source should gate first-visit auto-open');
assert.ok(srcRuntime.includes('findTourTopic'), 'runtime source should resolve a real topic for the theory step');
assert.ok(srcRuntime.includes("wave21OpenTopic(meta.subj.id, meta.topic.id, 'theory')"), 'runtime source should open a real topic in theory mode during the tour');
assert.ok(srcRuntime.includes('👋 Быстрый тур'), 'runtime source should add the quick-tour entry to settings');
assert.ok(srcRuntime.includes('▶ Заниматься'), 'runtime source should explain smart-start in the tour copy');

assert.ok(srcCss.includes('.wave89e-tour-overlay'), 'css source should style the onboarding overlay');
assert.ok(srcCss.includes('.wave89e-tour-progress'), 'css source should style onboarding progress dots');
assert.ok(srcCss.includes('[data-wave89e-tour-target="1"]'), 'css source should style highlighted tour targets');
assert.ok(srcCss.includes('wave89e-tour-open'), 'css source should lock scrolling while the tour is open');

assert.ok(builtRuntimeSource.includes('/* wave89e: onboarding / first-visit tour */'), 'built merged runtime should contain the wave89e onboarding code');
assert.ok(builtCssSource.includes('.wave89e-tour-overlay'), 'built css should contain the onboarding styles');
assert.ok(sw.includes(`./${builtRuntime}`), 'service worker should precache the rebuilt merged runtime');
assert.ok(sw.includes(`./${builtCss}`), 'service worker should precache the rebuilt shared css asset');

for (let grade = 1; grade <= 11; grade += 1) {
  const page = `grade${grade}_v2.html`;
  const html = read(page);
  assert.ok(html.includes(`./${builtRuntime}`), `${page} should reference the rebuilt merged runtime`);
  assert.ok(html.includes(`./${builtCss}`), `${page} should reference the rebuilt shared css asset`);
  const scriptCount = (html.match(/<script\b/gi) || []).length;
  assert.ok(scriptCount <= 20, `${page} should stay within the 20-script budget (got ${scriptCount})`);
}

for (const page of ['index.html','dashboard.html','diagnostic.html','tests.html','spec_subjects.html']) {
  const html = read(page);
  assert.ok(!html.includes(`./${builtRuntime}`), `${page} should not load the merged grade runtime`);
}

assert.ok(changelog.includes('## wave89e'), 'CHANGELOG should document wave89e');
assert.ok(docs.includes('trainer_onboarding_wave89e_v1'), 'wave89e doc should mention the onboarding storage key');
assert.ok(validateWorkflow.includes('node tools/audit_onboarding_wave89e.mjs'), 'validate workflow should run the onboarding audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_onboarding_wave89e.mjs'), 'lighthouse workflow should run the onboarding audit');
assert.ok(toolsReadme.includes('audit_onboarding_wave89e.mjs'), 'tools README should list the onboarding audit');
assert.ok(claude.includes('### wave89e onboarding'), 'CLAUDE.md should document the onboarding wave');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  runtime: builtRuntime,
  css: builtCss,
  hashedAssetCount: healthz.hashed_asset_count,
  pagesChecked: 11
}, null, 2));
