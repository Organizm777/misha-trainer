#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const CHECK = process.argv.includes('--check') || !APPLY;
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const HEALTHZ_PATH = path.join(ROOT, 'healthz.json');
const SCAN_EXT = new Set(['.html', '.js', '.css', '.webmanifest']);
const IGNORE_FILES = new Set([
  path.join(ROOT, 'assets', 'asset-manifest.json'),
]);
const RUNTIME_SCAN_ROOTS = [
  path.join(ROOT, 'assets', '_src'),
  path.join(ROOT, 'assets', 'js'),
  path.join(ROOT, 'assets', 'css'),
];
const ROOT_NORM = ROOT.replace(/\\/g, '/');
const ASSET_REF_RE = /(?:\.\/)?(assets\/(?:js|css|data|icons)\/[A-Za-z0-9._/-]+\.(?:js|css|json|png|svg|webp|jpg|jpeg))/g;

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, value){
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
function walk(dir){
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function normalize(file){
  return file.replace(/\\/g, '/');
}
function shouldScan(file){
  if (IGNORE_FILES.has(file)) return false;
  if (file.endsWith('.map')) return false;
  const ext = path.extname(file).toLowerCase();
  if (!SCAN_EXT.has(ext)) return false;
  const normalized = normalize(file);
  if (normalized === `${ROOT_NORM}/sw.js`) return true;
  if (normalized === `${ROOT_NORM}/manifest.webmanifest`) return true;
  if (/\/[^/]+\.html$/.test(normalized)) return true;
  return RUNTIME_SCAN_ROOTS.some((root) => normalized.startsWith(normalize(root)));
}
function gatherLiveAssetRefs(){
  const refs = new Set();
  for (const file of walk(ROOT)) {
    if (!shouldScan(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = ASSET_REF_RE.exec(text))) {
      refs.add(m[1].replace(/\\/g, '/').replace(/^\.\//, ''));
    }
    ASSET_REF_RE.lastIndex = 0;
  }
  return refs;
}
function main(){
  const manifest = readJson(MANIFEST_PATH);
  const assets = manifest.assets || {};
  const live = gatherLiveAssetRefs();
  const orphanEntries = Object.entries(assets)
    .filter(([, hashedPath]) => !live.has(hashedPath))
    .sort((a, b) => a[1].localeCompare(b[1]));

  if (!orphanEntries.length) {
    console.log('[cleanup_build_artifacts] No orphan manifest assets found.');
    process.exit(0);
  }

  console.log('[cleanup_build_artifacts] Orphan manifest assets:');
  for (const [logical, hashedPath] of orphanEntries) {
    const abs = path.join(ROOT, hashedPath);
    const size = fs.existsSync(abs) ? fs.statSync(abs).size : 0;
    console.log(`- ${hashedPath} (${size} bytes) <- ${logical}`);
  }

  if (CHECK && !APPLY) process.exit(1);

  for (const [logical, hashedPath] of orphanEntries) {
    delete assets[logical];
    const abs = path.join(ROOT, hashedPath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
    const sidecarMap = abs + '.map';
    if (fs.existsSync(sidecarMap)) fs.unlinkSync(sidecarMap);
  }

  manifest.assets = assets;
  manifest.hashed_asset_count = Object.keys(assets).length;
  writeJson(MANIFEST_PATH, manifest);

  if (fs.existsSync(HEALTHZ_PATH)) {
    const healthz = readJson(HEALTHZ_PATH);
    healthz.hashed_asset_count = manifest.hashed_asset_count;
    writeJson(HEALTHZ_PATH, healthz);
  }

  console.log(`[cleanup_build_artifacts] Removed ${orphanEntries.length} orphan assets. Remaining hashed asset count: ${manifest.hashed_asset_count}.`);
}

main();
