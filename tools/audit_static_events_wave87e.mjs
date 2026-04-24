#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = fs.readdirSync(root).filter((name) => /^(?:index|dashboard|diagnostic|tests|spec_subjects|grade\d+_v2)\.html$/.test(name)).sort();
const bridgeSrc = fs.readFileSync(path.join(root, 'assets/_src/js/chunk_roadmap_wave86u_csp_bridge.js'), 'utf8');
const bindingChecks = [
  {
    file: 'assets/_src/js/bundle_grade_runtime_core_wave87n.js',
    patterns: ['bindDirectActions', "data-wave87r-action", "hydrateForAction(action)"]
  },
  {
    file: 'assets/_src/js/inline_dashboard_1_wave86u.js',
    patterns: ['bindDashboardActions', 'dashboard-report', 'dashboard-csv', 'dashboard-png']
  },
  {
    file: 'assets/_src/js/inline_diagnostic_1_wave86u.js',
    patterns: ['bindDiagnosticActions', 'confirm-exit', 'diag-next', 'diag-skip', 'diag-share']
  },
  {
    file: 'assets/_src/js/inline_tests_3_wave86u.js',
    patterns: ['bindTestsActions', 'test-launch-iq', 'test-menu-refresh', 'test-share-psych']
  }
];
const result = {
  ok: true,
  wave: 'wave87r',
  pages: pages.length,
  legacyAttrs: 0,
  oldStaticActionAttrs: 0,
  actionMarkers: 0,
  uniqueMarkerActions: 0,
  pagesMissingBridge: [],
  bridgeStillDispatches: false,
  missingDirectBindingFiles: [],
  byPage: {}
};
const actions = new Set();
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const legacy = [...html.matchAll(/\sdata-wave86u-on-[a-z]+=/g)].length;
  const oldStatic = [...html.matchAll(/\sdata-wave87e-click=["'][^"']+["']/g)].length;
  const markers = [...html.matchAll(/\sdata-wave87r-action=["']([^"']+)["']/g)].map((m) => m[1]);
  const hasBridge = /chunk_roadmap_wave86u_csp_bridge\.[a-f0-9]{10}\.js/.test(html);
  result.legacyAttrs += legacy;
  result.oldStaticActionAttrs += oldStatic;
  result.actionMarkers += markers.length;
  if (markers.length && !hasBridge) result.pagesMissingBridge.push(page);
  for (const action of markers) actions.add(action);
  result.byPage[page] = {
    legacyAttrs: legacy,
    oldStaticActionAttrs: oldStatic,
    actionMarkers: markers.length,
    hasBridge
  };
}
result.uniqueMarkerActions = actions.size;
result.bridgeStillDispatches = /installStaticActions\(|runStaticAction\(|getStaticTarget\(|STATIC_CLICK_ATTR|data-wave87e-click/.test(bridgeSrc);
for (const check of bindingChecks) {
  const abs = path.join(root, check.file);
  const raw = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  const ok = check.patterns.every((pattern) => raw.includes(pattern));
  if (!ok) result.missingDirectBindingFiles.push(check.file);
}
result.ok = (
  result.legacyAttrs === 0 &&
  result.oldStaticActionAttrs === 0 &&
  result.pagesMissingBridge.length === 0 &&
  !result.bridgeStillDispatches &&
  result.missingDirectBindingFiles.length === 0 &&
  result.actionMarkers === 268
);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
