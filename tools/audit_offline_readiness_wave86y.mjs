#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const HTML_PAGES = fs.readdirSync(ROOT).filter(name => name.endsWith('.html')).sort();
const swText = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

function extractArray(name){
  const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const m = swText.match(re);
  if (!m) return null;
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}
function localPath(url){
  if (!url || url.startsWith('http:') || url.startsWith('https:') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('#')) return null;
  const clean = url.replace(/^\.\//, '').split(/[?#]/)[0];
  return clean || null;
}
function existsAsset(url){
  const p = localPath(url);
  if (!p) return true;
  if (p === '.') return true;
  return fs.existsSync(path.join(ROOT, p));
}
function extractHtmlLocalDeps(file){
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const deps = [];
  for (const m of html.matchAll(/<(?:script|link|img|source|audio|video)\b[^>]*(?:src|href)="([^"]+)"/g)) {
    const p = localPath(m[1]);
    if (p && !p.startsWith('mailto:')) deps.push('./' + p);
  }
  return [...new Set(deps)];
}

const swAssets = extractArray('ASSETS') || [];
const bridgeAssets = extractArray('CSP_BRIDGE_ASSETS') || [];
const diagnosticOfflineAssets = extractArray('DIAGNOSTIC_OFFLINE_ASSETS') || [];
let criticalAssets = extractArray('CRITICAL_ASSETS');
if (!criticalAssets) {
  const baseMatch = swText.match(/const\s+CRITICAL_ASSETS\s*=\s*Array\.from\(new Set\(CSP_BRIDGE_ASSETS\.concat\(\s*DIAGNOSTIC_OFFLINE_ASSETS,\s*\[([\s\S]*?)\]\s*\)\)\);/);
  const base = baseMatch ? [...baseMatch[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
  criticalAssets = [...new Set(bridgeAssets.concat(diagnosticOfflineAssets, base))];
}
criticalAssets = criticalAssets || [];
const swSet = new Set(swAssets);
const criticalSet = new Set(criticalAssets);

const pageReports = HTML_PAGES.map(page => {
  const deps = extractHtmlLocalDeps(page);
  const missingFiles = deps.filter(dep => !existsAsset(dep));
  const missingSw = deps.filter(dep => !swSet.has(dep) && !dep.includes('/assets/icons/'));
  return { page, deps: deps.length, missingFiles, missingSw };
});

const diagnosticDeps = extractHtmlLocalDeps('diagnostic.html').filter(dep => dep.endsWith('.js') || dep.endsWith('.css') || dep === './diagnostic.html');
if (!diagnosticDeps.includes('./diagnostic.html')) diagnosticDeps.unshift('./diagnostic.html');
const diagnosticMissingFromCritical = diagnosticDeps.filter(dep => !criticalSet.has(dep));
const diagnosticMissingFromSw = diagnosticDeps.filter(dep => !swSet.has(dep));
const bridgeMissingFromCritical = bridgeAssets.filter(dep => !criticalSet.has(dep));
const bridgeMissingFiles = bridgeAssets.filter(dep => !existsAsset(dep));
const criticalMissingFiles = criticalAssets.filter(dep => !existsAsset(dep));
const criticalMissingFromSw = criticalAssets.filter(dep => !swSet.has(dep));

const hasHardInstall = /for \(const url of CRITICAL_ASSETS\) await addWithRetry\(url, true\);/.test(swText)
  && /throw new Error\('SW critical precache failed/.test(swText);
const bridgesFirst = bridgeAssets.length > 0 && bridgeAssets.every((asset, i) => criticalAssets[i] === asset);

const report = {
  ok: false,
  pages: pageReports.length,
  swAssets: swAssets.length,
  criticalAssets: criticalAssets.length,
  bridgeAssets,
  diagnosticOfflineAssets: diagnosticOfflineAssets.length,
  hasHardCriticalInstall: hasHardInstall,
  bridgesFirstInCriticalPrecache: bridgesFirst,
  totals: {
    missingPageFiles: pageReports.reduce((sum, r) => sum + r.missingFiles.length, 0),
    missingPageSwAssets: pageReports.reduce((sum, r) => sum + r.missingSw.length, 0),
    diagnosticMissingFromCritical: diagnosticMissingFromCritical.length,
    diagnosticMissingFromSw: diagnosticMissingFromSw.length,
    bridgeMissingFromCritical: bridgeMissingFromCritical.length,
    bridgeMissingFiles: bridgeMissingFiles.length,
    criticalMissingFiles: criticalMissingFiles.length,
    criticalMissingFromSw: criticalMissingFromSw.length
  },
  diagnostic: {
    deps: diagnosticDeps.length,
    missingFromCritical: diagnosticMissingFromCritical,
    missingFromSw: diagnosticMissingFromSw
  },
  bridges: {
    missingFromCritical: bridgeMissingFromCritical,
    missingFiles: bridgeMissingFiles
  },
  critical: {
    missingFiles: criticalMissingFiles,
    missingFromSw: criticalMissingFromSw
  },
  pageReports
};
report.ok = report.hasHardCriticalInstall
  && report.bridgesFirstInCriticalPrecache
  && Object.values(report.totals).every(v => v === 0);

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
