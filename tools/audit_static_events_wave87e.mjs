#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = fs.readdirSync(root).filter((name) => /^(?:index|dashboard|diagnostic|tests|spec_subjects|grade\d+_v2)\.html$/.test(name)).sort();
const bridgeSrc = fs.readFileSync(path.join(root, 'assets/_src/js/chunk_roadmap_wave86u_csp_bridge.js'), 'utf8');
const actionCases = new Set([...bridgeSrc.matchAll(/case\s+['"]([^'"]+)['"]\s*:/g)].map((m) => m[1]));
const result = {
  ok: true,
  wave: 'wave87e',
  pages: pages.length,
  legacyAttrs: 0,
  staticActionAttrs: 0,
  uniqueActions: 0,
  unknownActions: [],
  pagesMissingBridge: [],
  bridgeCases: actionCases.size,
  byPage: {}
};
const actions = new Set();
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const legacy = [...html.matchAll(/\sdata-wave86u-on-[a-z]+=/g)].length;
  const staticActions = [...html.matchAll(/\sdata-wave87e-click=["']([^"']+)["']/g)].map((m) => m[1]);
  const hasBridge = /chunk_roadmap_wave86u_csp_bridge\.[a-f0-9]{10}\.js/.test(html);
  result.legacyAttrs += legacy;
  result.staticActionAttrs += staticActions.length;
  if (staticActions.length && !hasBridge) result.pagesMissingBridge.push(page);
  for (const action of staticActions) {
    actions.add(action);
    if (!actionCases.has(action)) result.unknownActions.push({ page, action });
  }
  result.byPage[page] = { legacyAttrs: legacy, staticActionAttrs: staticActions.length, hasBridge };
}
result.uniqueActions = actions.size;
result.ok = result.legacyAttrs === 0 && result.unknownActions.length === 0 && result.pagesMissingBridge.length === 0 && result.staticActionAttrs === 268;
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
